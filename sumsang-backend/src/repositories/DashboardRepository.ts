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
              const logisticsCosts = await db.query(
               `SELECT 'total_delivery_cost' AS label, SUM(cost) AS total_cost
                FROM (
                    SELECT cost FROM consumer_deliveries
                    UNION ALL
                    SELECT cost FROM bulk_deliveries
                ) AS all_deliveries;`
            );

            const partsCosts = await db.query(
                `SELECT SUM(ppi.quantity * ps.cost) AS total_parts_cost
                FROM parts_purchases_items ppi
                JOIN parts_supplier ps ON ppi.part_supplier_id = ps.parts_supplier_id;`
            );

             const machineCosts = await db.query(
                `SELECT SUM(cost) AS total_machine_cost
                 FROM machines;`
            );

            const costPricePerModel = await db.query(
               `SELECT ph.model AS phone_model, ROUND(SUM(mr.quantity * ps.cost) / m.rate_per_day, 2) AS cost_per_phone
                FROM machines m
                JOIN phones ph ON m.phone_id = ph.phone_id
                JOIN machine_ratios mr ON m.machine_id = mr.machine_id
                JOIN parts_supplier ps ON mr.part_id = ps.part_id
                GROUP BY ph.model, m.rate_per_day
                ORDER BY cost_per_phone DESC;`
            );

            const sellingPricePerModel = await db.query(
               `SELECT model AS phone_model, price AS selling_price
                FROM phones ORDER BY price DESC; `
            );

            const totalRevenue = await db.query(
               `SELECT SUM(amount_paid) AS total_revenue
               FROM orders;`
            );

            const loanStatus = await db.query(
               `SELECT key, value FROM system_settings
                WHERE key IN ('amountBorrowed','repaymentsMade')`
            );
        
        } catch (error) {
            throw new DatabaseError(`Failed to get financial information: ${(error as Error).message}`);
        }
    }

    static async getLogistics() {
        try {
            //TO DO: Write queries

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