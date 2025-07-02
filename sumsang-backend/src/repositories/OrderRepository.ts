import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';
import { Order } from '../types/OrderType.js';
import { OrderItem } from '../types/OrderItemType.js';
import { Status } from '../types/Status.js';

export class OrderRepository {
    static async createOrder(price: number, items: OrderItem[]) {
        try {
            await db.query('BEGIN');

            // Insert into orders table
            const orderResult = await db.query(
                `INSERT INTO orders (price, status, created_at)
                VALUES ($1, $2, NOW()) 
                RETURNING order_id`,
                [price, Status.PendingPayment]
            );

            const orderId = orderResult.rows[0].order_id;

            // Insert each item into order_items
            const insertItemQuery = `
                INSERT INTO order_items (order_id, phone_id, quantity)
                VALUES ($1, $2, $3)
            `;

            for (const item of items) {
                await db.query(insertItemQuery, [orderId, item.phoneId, item.quantity]);
            }

            await db.query('COMMIT');

            return { orderId };
        } catch (error) {
            await db.query('ROLLBACK');
            throw new DatabaseError(`Failed to create order: ${(error as Error).message}`);
        }
    }
}
