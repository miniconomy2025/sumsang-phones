import db from '../config/DatabaseConfig.js';
import { BulkDelivery } from '../types/BulkDeliveryType.js';

export class BulkDeliveryRepository {
    static async insertBulkDelivery(
        partsPurchaseId: number,
        deliveryReference: number,
        cost: number,
        address: string,
        accountNumber: string
    ): Promise<void> {
        await db.query(
            `INSERT INTO bulk_deliveries 
            (parts_purchase_id, delivery_reference, cost, units_received, address, account_number, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())`,
            [partsPurchaseId, deliveryReference, cost, 0, address, accountNumber]
        );
    }

    static async getDeliveryByPartsPurchaseId(partsPurchaseId: number): Promise<BulkDelivery> {
        const result = await db.query(
            `SELECT bulk_delivery_id, parts_purchase_id, delivery_reference, cost, units_received, address, account_number, created_at
                FROM bulk_deliveries
                WHERE parts_purchase_id = $1`,
            [partsPurchaseId]
        );

        return {
            bulkDeliveryId: result.rows[0].bulk_delivery_id,
            partsPurchaseId: result.rows[0].parts_purchase_id,
            deliveryReference: result.rows[0].delivery_reference,
            cost: result.rows[0].cost,
            unitsReceived: result.rows[0].units_received,
            address: result.rows[0].address,
            accountNumber: result.rows[0].account_number,
            createdAt: result.rows[0].created_at
        }
    }
}
