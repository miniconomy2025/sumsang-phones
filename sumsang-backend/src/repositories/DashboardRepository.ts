import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';


export class DashboardRepository {
    static async getSupplyChain() {
        try {
            const currentPartsInventoryResult = await db.query(
                `SELECT p.name AS part_name, i.quantity_available
             FROM inventory i
             JOIN parts p ON i.part_id = p.part_id
             ORDER BY p.name;`
            );

            const currentPartsInventory: Record<string, number> = {};
            for (const row of currentPartsInventoryResult.rows) {
                currentPartsInventory[row.part_name] = Number(row.quantity_available);
            }

            const currentPhoneInventoryResult = await db.query(
                `SELECT p.model, s.quantity_available
             FROM stock s
             JOIN phones p ON s.phone_id = p.phone_id
             ORDER BY p.model;`
            );

            const currentPhonesInventory: Record<string, number> = {};
            for (const row of currentPhoneInventoryResult.rows) {
                currentPhonesInventory[row.model] = Number(row.quantity_available);
            }

            const partCostOverTimeResult = await db.query(
                `SELECT pa.name AS part_name, DATE(pp.purchased_at) AS purchase_date, ps.cost AS unit_price
             FROM parts_purchases_items ppi
             JOIN parts_supplier ps ON ppi.part_supplier_id = ps.parts_supplier_id
             JOIN parts pa ON ps.part_id = pa.part_id
             JOIN parts_purchases pp ON ppi.parts_purchase_id = pp.parts_purchase_id
             GROUP BY pa.name, DATE(pp.purchased_at), ps.cost
             ORDER BY pa.name, purchase_date;`
            );

            const partCostsOverTime: Record<string, { date: string; value: number }[]> = {};
            for (const row of partCostOverTimeResult.rows) {
                const partName = row.part_name;
                if (!partCostsOverTime[partName]) {
                    partCostsOverTime[partName] = [];
                }

                partCostsOverTime[partName].push({
                    date: row.purchase_date,
                    value: Number(row.unit_price)
                });
            }

            return {
                currentPartsInventory,
                currentPhonesInventory,
                partCostsOverTime
            };

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
                `SELECT p.model, SUM(oi.quantity * p.price) AS phoneModelRevenue
             FROM order_items oi
             JOIN phones p ON oi.phone_id = p.phone_id
             GROUP BY p.model;`
            );

            const totalPhonesSold: Record<string, number> = {};
            for (const row of totalPhoneOrders.rows) {
                totalPhonesSold[row.model] = Number(row.totalphonessold);
            }

            const phoneModelRevenue: Record<string, number> = {};
            for (const row of revenuePerModel.rows) {
                phoneModelRevenue[row.model] = Number(row.phonemodelrevenue);
            }

            return {
                toalPhonesSold: totalPhonesSold,
                phoneModelRevenue
            };

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

            const bulkTransfersInResult = await db.query(
                `SELECT 
                    p.name AS part_name,
                    DATE(bd.date_created) AS delivery_date,
                    SUM(ppi.quantity) AS total_quantity_received,
                    ROUND(SUM(ppi.quantity::decimal / total.total_quantity * bd.cost), 2) AS allocated_delivery_cost
                    FROM parts_purchases_items ppi
                    JOIN parts_supplier ps ON ppi.part_supplier_id = ps.parts_supplier_id
                    JOIN parts p ON ps.part_id = p.part_id
                    JOIN parts_purchases pp ON ppi.parts_purchase_id = pp.parts_purchase_id
                    JOIN bulk_deliveries bd ON pp.parts_purchase_id = bd.parts_purchase_id
                    JOIN (
                        SELECT parts_purchase_id, SUM(quantity) AS total_quantity
                        FROM parts_purchases_items
                        GROUP BY parts_purchase_id
                    ) total ON ppi.parts_purchase_id = total.parts_purchase_id
                    GROUP BY p.name, DATE(bd.date_created), bd.cost
                    ORDER BY delivery_date, p.name;`
            );
        
            
            const bulkTransfersInMap: Record<string, any> = {};

            for (const row of bulkTransfersInResult.rows) {
                const date = row.delivery_date;
                const part = row.part_name;
                const volume = Number(row.total_quantity_received);
                const cost = Number(row.allocated_delivery_cost);

                if (!bulkTransfersInMap[date]) {
                    bulkTransfersInMap[date] = {};
                }

                bulkTransfersInMap[date][part] = {
                    volumeMoved: volume,
                    cost: cost
                };
            }

            

            const bulkTransfersIn = Object.entries(bulkTransfersInMap).map(([date, parts]) => ({
                date: new Date(date).toISOString().split('T')[0],
                ...parts
            }));


            const consumerTransfersOutResult = await db.query(
                `SELECT 
                p.model AS phone_model, 
                DATE(cd.date_created) AS delivery_date, 
                SUM(oi.quantity) AS phones_delivered, 
                SUM(cd.cost) AS total_delivery_cost
                FROM consumer_deliveries cd
                JOIN orders o ON cd.order_id = o.order_id
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN phones p ON oi.phone_id = p.phone_id
                GROUP BY p.model, DATE(cd.date_created)
                ORDER BY delivery_date, p.model;`
            );


            const consumerTransfersOutMap: Record<string, any> = {};

            for (const row of consumerTransfersOutResult.rows) {
                const date = row.delivery_date;
                const model = row.phone_model;
                const delivered = Number(row.phones_delivered);
                const cost = Number(row.total_delivery_cost);

                if (!consumerTransfersOutMap[date]) {
                    consumerTransfersOutMap[date] = {};
                }

                consumerTransfersOutMap[date][model] = {
                    phonesDelivered: delivered,
                    cost: cost
                };
            }

            const consumerTransfersOut = Object.entries(consumerTransfersOutMap).map(([date, models]) => ({
                date: new Date(date).toISOString().split('T')[0],
                ...models
            }));

            return {
                bulkTransfersIn,
                consumerTransfersOut
            };

        } catch (error) {
            throw new DatabaseError(`Failed to get logistic information: ${(error as Error).message}`);
        }
    }


    static async getStockStats() {
        try {
            //TO DO: Write queries

        } catch (error) {
            throw new DatabaseError(`Failed to get stock information: ${(error as Error).message}`);
        }
    }
}