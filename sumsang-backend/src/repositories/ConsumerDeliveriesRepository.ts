import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';
import { ConsumerDelivery } from '../types/ConsumerDeliveryType.js';

export class ConsumerDeliveryRepository {
    static async insertConsumerDelivery(
        orderId: number,
        deliveryReference: number,
        cost: number,
        accountNumber: string
    ): Promise<void> {
        try {
            await db.query(
                `INSERT INTO consumer_deliveries 
                (order_id, delivery_reference, cost, units_collected, account_number)
                VALUES ($1, $2, $3, $4, $5)`,
                [orderId, deliveryReference, cost, 0, accountNumber]
            );
        } catch (error) {
            throw new DatabaseError(`Failed to insert consumer delivery: ${(error as Error).message}`);
        }
    }

    static async getDeliveryByOrderId(orderId: number): Promise< ConsumerDelivery> {
        try {
            const result = await db.query(
                `SELECT delivery_reference, cost, account_id, units_collected
                 FROM consumer_deliveries
                 WHERE order_id = $1`,
                [orderId]
            );

            return result.rows[0];
        } catch (error) {
            throw new DatabaseError(`Failed to get delivery by order ID: ${(error as Error).message}`);
        }
    }
}
