import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';

export class DashboardRepository {

    static async getSupplyChain() {
        try {
            const currentPartsInventory = await this.fetchCurrentPartsInventory();
            const currentPhonesInventory = await this.fetchCurrentPhonesInventory();
            const partCostsOverTime = await this.fetchPartCostsOverTime();

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
            const totalPhonesSold = await this.fetchTotalPhonesSold();
            const phoneModelRevenue = await this.fetchRevenuePerModel();

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
            const logisticsCosts = await this.fetchLogisticsCosts();
            const manufacturingCost = await this.fetchPartsCosts();
            const equipmentCost = await this.fetchMachineCosts();
            const costPricePerModel = await this.fetchCostPerModel();
            const sellingPricePerModel = await this.fetchSellingPricePerModel();
            const totalRevenue = await this.fetchTotalRevenue();
            const loanStatus = await this.fetchLoanStatus();

            const totalExpenses = { manufacturing: manufacturingCost, logistics: logisticsCosts, equipment: equipmentCost };
            const netProfit = totalRevenue - (manufacturingCost + logisticsCosts + equipmentCost);

            const costVsSellingPrice: Record<string, { costPerUnit: number, sellingPricePerUnit: number }> = {};
            for (const costRow of costPricePerModel) {
                const model = costRow.phone_model;
                const costPerUnit = Number(costRow.cost_per_phone);
                const sellRow = sellingPricePerModel.find(r => r.phone_model === model);
                const sellingPricePerUnit = sellRow ? Number(sellRow.selling_price) : 0;

                costVsSellingPrice[model] = { costPerUnit, sellingPricePerUnit };
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
            const bulkTransfersInRows = await this.fetchBulkTransfersIn();
            const consumerTransfersOutRows = await this.fetchConsumerTransfersOut();

            const bulkTransfersInMap: Record<string, any> = {};
            for (const row of bulkTransfersInRows) {
                const date = row.delivery_date;
                if (!bulkTransfersInMap[date]) bulkTransfersInMap[date] = {};
                bulkTransfersInMap[date][row.part_name] = {
                    volumeMoved: Number(row.total_quantity_received),
                    cost: Number(row.allocated_delivery_cost)
                };
            }

            const bulkTransfersIn = Object.entries(bulkTransfersInMap).map(([date, parts]) => ({
                date: new Date(date).toISOString().split('T')[0],
                ...parts
            }));

            const consumerTransfersOutMap: Record<string, any> = {};
            for (const row of consumerTransfersOutRows) {
                const date = row.delivery_date;
                if (!consumerTransfersOutMap[date]) consumerTransfersOutMap[date] = {};
                consumerTransfersOutMap[date][row.phone_model] = {
                    phonesDelivered: Number(row.phones_delivered),
                    cost: Number(row.total_delivery_cost)
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

    static async getProductionStats() {
        try {
            // TODO: Implement production stats queries
        } catch (error) {
            throw new DatabaseError(`Failed to get production information: ${(error as Error).message}`);
        }
    }

    // Helper functions to fetch data

    private static async fetchCurrentPartsInventory() {
        try {
            const res = await db.query(`
                SELECT p.name AS part_name, i.quantity_available
                FROM inventory i
                JOIN parts p ON i.part_id = p.part_id
                ORDER BY p.name;
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.part_name] = Number(row.quantity_available));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch current parts inventory: ${(error as Error).message}`);
        }
    }

    private static async fetchCurrentPhonesInventory() {
        try {
            const res = await db.query(`
                SELECT p.model, s.quantity_available
                FROM stock s
                JOIN phones p ON s.phone_id = p.phone_id
                ORDER BY p.model;
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.model] = Number(row.quantity_available));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch current phones inventory: ${(error as Error).message}`);
        }
    }

    private static async fetchPartCostsOverTime() {
        try {
            const res = await db.query(`
                SELECT pa.name AS part_name, DATE(pp.purchased_at) AS purchase_date, ps.cost AS unit_price
                FROM parts_purchases_items ppi
                JOIN parts_supplier ps ON ppi.part_supplier_id = ps.parts_supplier_id
                JOIN parts pa ON ps.part_id = pa.part_id
                JOIN parts_purchases pp ON ppi.parts_purchase_id = pp.parts_purchase_id
                GROUP BY pa.name, DATE(pp.purchased_at), ps.cost
                ORDER BY pa.name, purchase_date;
            `);
            const result: Record<string, { date: string, value: number }[]> = {};
            for (const row of res.rows) {
                const part = row.part_name;
                if (!result[part]) result[part] = [];
                result[part].push({ date: row.purchase_date, value: Number(row.unit_price) });
            }
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch part costs over time: ${(error as Error).message}`);
        }
    }

    private static async fetchTotalPhonesSold() {
        try {
            const res = await db.query(`
                SELECT p.model, SUM(oi.quantity) AS totalPhonesSold
                FROM order_items oi
                JOIN phones p ON oi.phone_id = p.phone_id
                GROUP BY p.model;
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.model] = Number(row.totalphonessold));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch total phones sold: ${(error as Error).message}`);
        }
    }

    private static async fetchRevenuePerModel() {
        try {
            const res = await db.query(`
                SELECT p.model, SUM(oi.quantity * p.price) AS phoneModelRevenue
                FROM order_items oi
                JOIN phones p ON oi.phone_id = p.phone_id
                GROUP BY p.model;
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.model] = Number(row.phonemodelrevenue));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch revenue per model: ${(error as Error).message}`);
        }
    }

    private static async fetchLogisticsCosts() {
        try {
            const res = await db.query(`
                SELECT SUM(cost) AS total_cost
                FROM (
                    SELECT cost FROM consumer_deliveries
                    UNION ALL
                    SELECT cost FROM bulk_deliveries
                ) AS all_deliveries;
            `);
            return Number(res.rows[0]?.total_cost || 0);
        } catch (error) {
            throw new DatabaseError(`Failed to fetch logistics costs: ${(error as Error).message}`);
        }
    }

    private static async fetchPartsCosts() {
        try {
            const res = await db.query(`
                SELECT SUM(ppi.quantity * ps.cost) AS total_parts_cost
                FROM parts_purchases_items ppi
                JOIN parts_supplier ps ON ppi.part_supplier_id = ps.parts_supplier_id;
            `);
            return Number(res.rows[0]?.total_parts_cost || 0);
        } catch (error) {
            throw new DatabaseError(`Failed to fetch parts costs: ${(error as Error).message}`);
        }
    }

    private static async fetchMachineCosts() {
        try {
            const res = await db.query(`SELECT SUM(cost) AS total_machine_cost FROM machines;`);
            return Number(res.rows[0]?.total_machine_cost || 0);
        } catch (error) {
            throw new DatabaseError(`Failed to fetch machine costs: ${(error as Error).message}`);
        }
    }

    private static async fetchCostPerModel() {
        try {
            const res = await db.query(`
                SELECT ph.model AS phone_model, 
                    ROUND(SUM(mr.quantity * ps.cost) / m.rate_per_day, 2) AS cost_per_phone
                FROM machines m
                JOIN phones ph ON m.phone_id = ph.phone_id
                JOIN machine_ratios mr ON m.machine_id = mr.machine_id
                JOIN parts_supplier ps ON mr.part_id = ps.part_id
                GROUP BY ph.model, m.rate_per_day
                ORDER BY cost_per_phone DESC;
            `);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch cost per model: ${(error as Error).message}`);
        }
    }

    private static async fetchSellingPricePerModel() {
        try {
            const res = await db.query(`SELECT model AS phone_model, price AS selling_price FROM phones;`);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch selling price per model: ${(error as Error).message}`);
        }
    }

    private static async fetchTotalRevenue() {
        try {
            const res = await db.query(`SELECT SUM(amount_paid) AS total_revenue FROM orders;`);
            return Number(res.rows[0]?.total_revenue || 0);
        } catch (error) {
            throw new DatabaseError(`Failed to fetch total revenue: ${(error as Error).message}`);
        }
    }

    private static async fetchLoanStatus() {
        try {
            const res = await db.query(`
                SELECT key, value FROM system_settings
                WHERE key IN ('amountBorrowed','repaymentsMade');
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.key] = Number(row.value));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch loan status: ${(error as Error).message}`);
        }
    }

    private static async fetchBulkTransfersIn() {
        try {
            const res = await db.query(`
                SELECT 
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
                ORDER BY delivery_date, p.name;
            `);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch bulk transfers in: ${(error as Error).message}`);
        }
    }

    private static async fetchConsumerTransfersOut() {
        try {
            const res = await db.query(`
                SELECT 
                    p.model AS phone_model, 
                    DATE(cd.date_created) AS delivery_date, 
                    SUM(oi.quantity) AS phones_delivered, 
                    SUM(cd.cost) AS total_delivery_cost
                FROM consumer_deliveries cd
                JOIN orders o ON cd.order_id = o.order_id
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN phones p ON oi.phone_id = p.phone_id
                GROUP BY p.model, DATE(cd.date_created)
                ORDER BY delivery_date, p.model;
            `);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch consumer transfers out: ${(error as Error).message}`);
        }
    }
}
