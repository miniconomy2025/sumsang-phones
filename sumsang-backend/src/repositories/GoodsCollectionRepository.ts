import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';
import { Status } from '../types/Status.js';

type OrderDetails = {
    order_id: number;
    status: number;
};

export class GoodsCollectionRepository {

    static async findOrderDetailsByDeliveryReference(deliveryReference: number): Promise<OrderDetails | null> {
        try {
            const query = `
                SELECT 
                    o.order_id, 
                    o.status
                FROM orders AS o
                JOIN consumer_deliveries AS cd ON o.order_id = cd.order_id
                WHERE cd.delivery_reference = $1
            `;
            const result = await db.query(query, [deliveryReference]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            throw new DatabaseError(`Failed to find order by delivery reference: ${(error as Error).message}`);
        }
    }

    static async markOrderAsCollected(orderId: number): Promise<{ orderId: number }> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const newStatus = Status.Shipped;


            const orderUpdateResult = await client.query(
                `UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING order_id`,
                [newStatus, orderId]
            );

            if (orderUpdateResult.rowCount === 0) {
                throw new Error(`Order with ID ${orderId} could not be updated.`);
            }

            await client.query(
                `UPDATE consumer_deliveries SET status = $1 WHERE order_id = $2`,
                [newStatus, orderId]
            );

            await client.query('COMMIT');

            return { orderId: orderUpdateResult.rows[0].order_id };
        } catch (error) {
            await client.query('ROLLBACK');
            throw new DatabaseError(`Failed to mark order as collected: ${(error as Error).message}`);
        } finally {
            client.release();
        }
    }
}