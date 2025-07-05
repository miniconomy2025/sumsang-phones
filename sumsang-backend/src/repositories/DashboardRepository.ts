import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';


export class DashboardRepository {
    static async getSupplyChain() {
        try {
            const currentPartsInventory = await db.query(
                `SELECT p.name AS part_name, i.quantity_available
                FROM inventory i
                JOIN parts p ON i.part_id = p.part_id
                ORDER BY p.name;`
            );

            const currentPhoneInventory = await db.query(
                `SELECT p.model, s.quantity_available
                FROM stock s
                JOIN phones p ON s.phone_id = p.phone_id
                ORDER BY p.model;`
            );

            const partCostOverTime = await db.query(
                `SELECT pa.name AS part_name, DATE(pp.purchased_at) AS purchase_date, ps.cost AS unit_price
                    FROM parts_purchases_items ppi
                    JOIN parts_supplier ps ON ppi.part_supplier_id = ps.parts_supplier_id
                    JOIN parts pa ON ps.part_id = pa.part_id
                    JOIN parts_purchases pp ON ppi.parts_purchase_id = pp.parts_purchase_id
                    GROUP BY pa.name, DATE(pp.purchased_at), ps.cost
                    ORDER BY pa.name, purchase_date;`
            );


        } catch (error) {
            throw new DatabaseError(`Failed to get supply chain information: ${(error as Error).message}`);
        }
    }

    static async getSales() {
        try {
            const totalPhoneOrders = await db.query(
                `SELECT p.model, SUM(oi.quantity) AS totalPhonesSold
                 FROM order_items oi
                 JOIN phones p ON oi.phone_id = p.phone_id
                 GROUP BY p.model;`
            );

            const revenuePerModel = await db.query(
                `SELECT p.model, SUM(oi.quantity * p.price) AS phoneModelRevnue
                FROM order_items oi
                JOIN phones p ON oi.phone_id = p.phone_id
                GROUP BY p.model;`
            );

        } catch (error) {
            throw new DatabaseError(`Failed to get sales information: ${(error as Error).message}`);
        }
    }

    static async getFinancials() {
        try {

            const logisticsCostsResult = await db.query(
                `SELECT SUM(cost) AS total_cost
             FROM (
                 SELECT cost FROM consumer_deliveries
                 UNION ALL
                 SELECT cost FROM bulk_deliveries
             ) AS all_deliveries;`
            );

            const logisticsCosts = Number(logisticsCostsResult.rows[0]?.total_cost || 0);

            const partsCostsResult = await db.query(
                `SELECT SUM(ppi.quantity * ps.cost) AS total_parts_cost
             FROM parts_purchases_items ppi
             JOIN parts_supplier ps ON ppi.part_supplier_id = ps.parts_supplier_id;`
            );
            const manufacturingCost = Number(partsCostsResult.rows[0]?.total_parts_cost || 0);

            const machineCostsResult = await db.query(
                `SELECT SUM(cost) AS total_machine_cost FROM machines;`
            );
            const equipmentCost = Number(machineCostsResult.rows[0]?.total_machine_cost || 0);

            const costPricePerModelResult = await db.query(
                `SELECT ph.model AS phone_model, 
                    ROUND(SUM(mr.quantity * ps.cost) / m.rate_per_day, 2) AS cost_per_phone
             FROM machines m
             JOIN phones ph ON m.phone_id = ph.phone_id
             JOIN machine_ratios mr ON m.machine_id = mr.machine_id
             JOIN parts_supplier ps ON mr.part_id = ps.part_id
             GROUP BY ph.model, m.rate_per_day
             ORDER BY cost_per_phone DESC;`
            );

            const sellingPricePerModelResult = await db.query(
                `SELECT model AS phone_model, price AS selling_price
             FROM phones ORDER BY price DESC;`
            );

            const totalRevenueResult = await db.query(
                `SELECT SUM(amount_paid) AS total_revenue FROM orders;`
            );
            const totalRevenue = Number(totalRevenueResult.rows[0]?.total_revenue || 0);

            const loanStatusResult = await db.query(
                `SELECT key, value FROM system_settings
             WHERE key IN ('amountBorrowed','repaymentsMade')`
            );

            const loanStatus: Record<string, number> = {};
            loanStatusResult.rows.forEach(row => {
                loanStatus[row.key] = Number(row.value);
            });

            const totalExpenses = {
                manufacturing: manufacturingCost,
                logistics: logisticsCosts,
                equipment: equipmentCost
            };

            const totalExpenseSum = manufacturingCost + logisticsCosts + equipmentCost;
            const netProfit = totalRevenue - totalExpenseSum;

            const costVsSellingPrice: Record<string, { costPerUnit: number, sellingPricePerUnit: number }> = {};
            for (const costRow of costPricePerModelResult.rows) {
                const model = costRow.phone_model;
                const costPerUnit = Number(costRow.cost_per_phone);

                const sellRow = sellingPricePerModelResult.rows.find((r: any) => r.phone_model === model);
                const sellingPricePerUnit = sellRow ? Number(sellRow.selling_price) : 0;

                costVsSellingPrice[model] = {
                    costPerUnit,
                    sellingPricePerUnit
                };
            }

            return {
                totalRevenue,
                totalExpenses,
                netProfit,
                loanStatus,
                costVsSellingPrice
            };

        } catch (error) {
            throw new DatabaseError(`Failed to get financial information: ${(error as Error).message}`);
        }
    }


    static async getLogistics() {
        try {
            const bulkTransfersIn = await db.query(
                `
                SELECT p.name AS part_name,
                    DATE(pp.purchased_at) AS delivery_date,
                    SUM(ppi.quantity) AS total_quantity_received,
                    ROUND(SUM(ppi.quantity::decimal / total.total_quantity * bd.cost), 2) AS allocated_delivery_cost
                    FROM 
                    parts_purchases_items ppi
                    JOIN 
                    parts_supplier ps ON ppi.part_supplier_id = ps.parts_supplier_id
                    JOIN 
                    parts p ON ps.part_id = p.part_id
                    JOIN 
                    parts_purchases pp ON ppi.parts_purchase_id = pp.parts_purchase_id
                    JOIN 
                    bulk_deliveries bd ON pp.parts_purchase_id = bd.parts_purchase_id
                    JOIN (
                        SELECT 
                            ppi.parts_purchase_id,
                            SUM(ppi.quantity) AS total_quantity
                        FROM 
                            parts_purchases_items ppi
                        GROUP BY 
                            ppi.parts_purchase_id
                    ) total ON ppi.parts_purchase_id = total.parts_purchase_id
                    GROUP BY 
                    p.name, DATE(pp.purchased_at), bd.cost
                    ORDER BY 
                    delivery_date, p.name;
               `
            );

            const consumerTransfersOut = await db.query(
                `
                SELECT p.model AS phone_model, DATE(cd.created_at) AS delivery_date, SUM(oi.quantity) AS phones_delivered, SUM(cd.cost) AS total_delivery_cost
                FROM consumer_deliveries cd
                JOIN orders o ON cd.order_id = o.order_id
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN phones p ON oi.phone_id = p.phone_id
                GROUP BY 
                p.model, DATE(cd.created_at)
                ORDER BY delivery_date, p.model;
               `
            );


        } catch (error) {
            throw new DatabaseError(`Failed to get logistic information: ${(error as Error).message}`);
        }
    }

    static async getNotices() {
        try {
            //TO DO: Write queries

        } catch (error) {
            throw new DatabaseError(`Failed to get notice information: ${(error as Error).message}`);
        }
    }
}