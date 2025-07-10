import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';
import { OrderItem } from '../types/OrderItemType.js';
import { Status } from '../types/Status.js';
import { Order } from '../types/OrderType.js';

export class OrderRepository {
    static async createOrder(accountNumber: string, price: number, items: OrderItem[]) {
        try {
            await db.query('BEGIN');

            // Insert into orders table
            const orderResult = await db.query(
                `INSERT INTO orders (price, amount_paid, status, created_at, account_number)
                    VALUES ($1, 0, $2, COALESCE(
                    (SELECT value::int FROM system_settings WHERE key = 'current_day'),
                    0
                ), $3) 
                RETURNING order_id`,
                [price, Status.PendingPayment, accountNumber]
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

    static async getOrderById(orderId: number): Promise<Order | null> {
        const result = await db.query(
            `SELECT order_id, price, amount_paid, status, created_at, account_number
            FROM orders 
            WHERE order_id = $1`,
            [orderId]
        );
        const row = result.rows[0];
        if (!row) 
            return null;

        return {
            orderId: row.order_id,
            price: row.price,
            amountPaid: row.amount_paid,
            status: row.status,
            createdAt: row.created_at,
            accountNumber: row.account_number
        };
    }

    static async updateAmountPaid(orderId: number, amountPaid: number) {
        await db.query(
            `UPDATE orders 
            SET amount_paid = $1 
            WHERE order_id = $2`,
            [amountPaid, orderId]
        );
    }

    static async updateStatus(orderId: number, status: number) {
        await db.query(
            `UPDATE orders 
            SET status = $1 
            WHERE order_id = $2`,
            [status, orderId]
        );
    }

    static async getOrderItems(orderId: number): Promise<OrderItem[]> {
        const result = await db.query(`
            SELECT order_id, phone_id, quantity
            FROM order_items
            WHERE order_id = $1
        `, [orderId]);
        return result.rows.map(row => ({
            phoneId: row.phone_id,
            quantity: row.quantity,
            orderId: row.order_id
        }));
    }

    static async getOrderItemsCount(orderId: number): Promise<number> {
        const result = await db.query(`
            SELECT SUM(quantity) as COUNT
            FROM order_items
            WHERE order_id = $1
        `, [orderId]);
        return result.rows[0].count;
    }

    static async getOrdersWithInsufficientPayment(cutoffDays = 2): Promise<Order[]> {
        const result = await db.query(
            `SELECT 
            order_id, price, amount_paid, status, created_at, account_number
            FROM orders 
            WHERE created_at < COALESCE(
                (SELECT value::int - $1 FROM system_settings WHERE key = 'current_day'),
                0
            ) 
            AND amount_paid < price
            AND status != $2`,
            [cutoffDays, Status.PendingPayment]
        );
        return result.rows.map(row => ({
            orderId: row.order_id,
            price: row.price,
            amountPaid: row.amount_paid,
            status: row.status,
            createdAt: row.created_at,
            accountNumber: row.account_number
        }));
    }

    static async getPendingOrders(): Promise<Order[]> {
        const result = await db.query(
            `SELECT order_id, price, amount_paid, status, created_at, account_number
            FROM orders 
            WHERE status IN ($1, $2, $3)
            ORDER BY created_at ASC`,
            [
                Status.PendingStock,
                Status.PendingDeliveryRequest,
                Status.PendingDeliveryPayment
            ]
        );
        return result.rows.map(row => ({
            orderId: row.order_id,
            price: row.price,
            amountPaid: row.amount_paid,
            status: row.status,
            createdAt: row.created_at,
            accountNumber: row.account_number
        }));
    }

    static async getPendingOrderDemand(): Promise<Map<number, number>> {
        const result = await db.query(
            `SELECT oi.phone_id, SUM(oi.quantity) as total_demand
            FROM order_items oi
            INNER JOIN orders o ON oi.order_id = o.order_id
            WHERE o.status IN ($1, $2, $3, $4)
            GROUP BY oi.phone_id`,
            [
                Status.PendingStock,
                Status.PendingDeliveryRequest,
                Status.PendingDeliveryPayment,
                Status.PendingDeliveryCollection
            ]
        );
        
        const demandMap = new Map<number, number>();
        for (const row of result.rows) {
            demandMap.set(row.phone_id, parseInt(row.total_demand));
        }
        return demandMap;
    }
}
