import db from '../config/DatabaseConfig.js';
import { DatabaseError, NotFoundError } from '../utils/errors.js';
import { Status } from '../types/Status.js';

export class LogisticsRepository {

    static async findPartPurchaseById(purchaseId: number) {
        const query = `SELECT parts_purchase_id, status FROM parts_purchases WHERE parts_purchase_id = $1`;
        const result = await db.query(query, [purchaseId]);
        return result.rows[0];
    }

    static async findOrderById(orderId: number) {
        const query = `SELECT order_id, status FROM orders WHERE order_id = $1`;
        const result = await db.query(query, [orderId]);
        return result.rows[0];
    }

    static async createBulkPickup(purchaseId: number, quantity: number): Promise<{ delivery_reference: number, cost: number }> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const costSettingResult = await client.query("SELECT value FROM system_settings WHERE key = 'bulk_logistics_cost_per_unit'");
            if (costSettingResult.rowCount === 0) {
                throw new DatabaseError("Setting 'bulk_logistics_cost_per_unit' not found in system_settings.");
            }
            const costPerUnit = parseFloat(costSettingResult.rows[0].value);
            const totalCost = quantity * costPerUnit;

            const deliveryReference = Date.now() + Math.floor(Math.random() * 1000);
            const newStatus = Status.InTransit;

            const deliveryResult = await client.query(
                `INSERT INTO bulk_deliveries (parts_purchase_id, delivery_reference, cost, status, address, account_id)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING delivery_reference, cost`,
                [purchaseId, deliveryReference, totalCost, newStatus, 'Supplier Warehouse', 1]
            );

            await client.query(
                `UPDATE parts_purchases SET status = $1 WHERE parts_purchase_id = $2`,
                [newStatus, purchaseId]
            );

            await client.query('COMMIT');
            return deliveryResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof DatabaseError) throw error;
            throw new DatabaseError(`Failed to create bulk pickup request: ${(error as Error).message}`);
        } finally {
            client.release();
        }
    }

    static async createConsumerDelivery(orderId: number, quantity: number): Promise<{ delivery_reference: number, cost: number }> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            const costSettingResult = await client.query("SELECT value FROM system_settings WHERE key = 'consumer_logistics_cost_per_unit'");
            if (costSettingResult.rowCount === 0) {
                throw new DatabaseError("Setting 'consumer_logistics_cost_per_unit' not found in system_settings.");
            }
            const costPerUnit = parseFloat(costSettingResult.rows[0].value);
            const totalCost = quantity * costPerUnit;

            const deliveryReference = Date.now() + Math.floor(Math.random() * 1000);
            const newStatus = Status.PendingDeliveryCollection;

            const deliveryResult = await client.query(
                `INSERT INTO consumer_deliveries (order_id, delivery_reference, cost, status, account_id)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING delivery_reference, cost`,
                [orderId, deliveryReference, totalCost, newStatus, 1]
            );

            await client.query(
                `UPDATE orders SET status = $1 WHERE order_id = $2`,
                [newStatus, orderId]
            );

            await client.query('COMMIT');
            return deliveryResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof DatabaseError) throw error;
            throw new DatabaseError(`Failed to create consumer delivery request: ${(error as Error).message}`);
        } finally {
            client.release();
        }
    }


    static async confirmConsumerCollection(deliveryReference: number): Promise<{ orderId: number }> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const deliveryQuery = await client.query(
                `SELECT order_id FROM consumer_deliveries WHERE delivery_reference = $1 AND status = $2`,
                [deliveryReference, Status.PendingDeliveryCollection]
            );

            if (deliveryQuery.rowCount === 0) {
                throw new NotFoundError(`Delivery with reference ${deliveryReference} not found or not awaiting collection.`);
            }
            const { order_id } = deliveryQuery.rows[0];
            const newStatus = Status.Shipped;

            await client.query(`UPDATE orders SET status = $1 WHERE order_id = $2`, [newStatus, order_id]);
            await client.query(`UPDATE consumer_deliveries SET status = $1 WHERE delivery_reference = $2`, [newStatus, deliveryReference]);

            await client.query('COMMIT');
            return { orderId: order_id };
        } catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError(`Failed to confirm collection for delivery ${deliveryReference}: ${(error as Error).message}`);
        } finally {
            client.release();
        }
    }

    static async confirmBulkArrival(deliveryReference: number): Promise<{ purchaseId: number }> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const deliveryQuery = await client.query(
                `SELECT parts_purchase_id FROM bulk_deliveries WHERE delivery_reference = $1 AND status = $2`,
                [deliveryReference, Status.InTransit]
            );

            if (deliveryQuery.rowCount === 0) {
                throw new NotFoundError(`Bulk delivery with reference ${deliveryReference} not found or not in transit.`);
            }
            const { parts_purchase_id } = deliveryQuery.rows[0];
            const newStatus = Status.Received;

            await client.query(`UPDATE parts_purchases SET status = $1 WHERE parts_purchase_id = $2`, [newStatus, parts_purchase_id]);
            await client.query(`UPDATE bulk_deliveries SET status = $1 WHERE delivery_reference = $2`, [newStatus, deliveryReference]);

            await client.query('COMMIT');
            return { purchaseId: parts_purchase_id };
        } catch (error) {
            await client.query('ROLLBACK');
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError(`Failed to confirm arrival for delivery ${deliveryReference}: ${(error as Error).message}`);
        } finally {
            client.release();
        }
    }
}