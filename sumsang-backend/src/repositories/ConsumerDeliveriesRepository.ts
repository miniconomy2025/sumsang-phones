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
            (order_id, delivery_reference, cost, units_collected, account_number, date_created)
            VALUES ($1, $2, $3, 0, $4, NOW())`,
            [orderId, deliveryReference, cost, accountNumber]
        );
    }

    static async getDeliveryByOrderId(orderId: number): Promise<ConsumerDelivery | null> {
    const result = await db.query(
        `SELECT consumer_delivery_id, order_id, delivery_reference, cost, units_collected, account_number, date_created
            FROM consumer_deliveries
            WHERE order_id = $1`,
        [orderId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        consumerDeliveryId: row.consumer_delivery_id,
        orderId: row.order_id,
        deliveryReference: row.delivery_reference,
        cost: row.cost,
        unitsCollected: row.units_collected,
        accountNumber: row.account_number,
        createdAt: row.date_created
    };
}
    
    static async updateUnitsCollected(consumerDeliveryId: number, unitsToAdd: number): Promise<void> {
        await db.query(
            `UPDATE consumer_deliveries
             SET units_collected = units_collected + $1
             WHERE consumer_delivery_id = $2`,
            [unitsToAdd, consumerDeliveryId]
        );
    }
}