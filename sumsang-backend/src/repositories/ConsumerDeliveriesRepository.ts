import db from '../config/DatabaseConfig.js';
import { ConsumerDelivery } from '../types/ConsumerDeliveryType.js';

export class ConsumerDeliveryRepository {
    static async insertConsumerDelivery(
        orderId: number,
        deliveryReference: number,
        cost: number,
        accountNumber: string
    ): Promise<void> {
        await db.query(
            `INSERT INTO consumer_deliveries 
            (order_id, delivery_reference, cost, units_collected, account_number, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())`,
            [orderId, deliveryReference, cost, 0, accountNumber]
        );
    }

    static async getDeliveryByOrderId(orderId: number): Promise< ConsumerDelivery> {
        const result = await db.query(
            `SELECT consumer_delivery_id, order_id, delivery_reference, cost, units_collected, account_number, created_at
                FROM consumer_deliveries
                WHERE order_id = $1`,
            [orderId]
        );

        return {
            consumerDeliveryId: result.rows[0].consumer_delivery_id,
            orderId: result.rows[0].order_id,
            deliveryReference: result.rows[0].delivery_reference,
            cost: result.rows[0].cost,
            unitsCollected: result.rows[0].units_collected,
            accountNumber: result.rows[0].account_number,
            createdAt: result.rows[0].created_at
        }
    }
}
