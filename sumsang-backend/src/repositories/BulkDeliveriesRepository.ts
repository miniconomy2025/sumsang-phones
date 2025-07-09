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
            (parts_purchase_id, delivery_reference, cost, units_received, address, account_number, date_created)
            VALUES ($1, $2, $3, 0, $4, $5, COALESCE(
                (SELECT value::int FROM system_settings WHERE key = 'current_day'),
                0
            ))`,
            [partsPurchaseId, deliveryReference, cost, address, accountNumber]
        );
    }

    static async getDeliveryByPartsPurchaseId(partsPurchaseId: number): Promise<BulkDelivery> {
        const result = await db.query(
            `SELECT bulk_delivery_id, parts_purchase_id, delivery_reference, cost, units_received, address, account_number, date_created
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
            createdAt: result.rows[0].date_created
        }
    }

    static async getDeliveryByDeliveryReference(deliveryReference: number): Promise<BulkDelivery | null> {
        const result = await db.query(
            `SELECT bulk_delivery_id, parts_purchase_id, delivery_reference, cost, units_received, address, account_number, date_created
             FROM bulk_deliveries
             WHERE delivery_reference = $1`,
            [deliveryReference]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            bulkDeliveryId: row.bulk_delivery_id,
            partsPurchaseId: row.parts_purchase_id,
            deliveryReference: row.delivery_reference,
            cost: row.cost,
            unitsReceived: row.units_received,
            address: row.address,
            accountNumber: row.account_number,
            createdAt: row.date_created
        };
    }

    static async updateUnitsReceived(bulkDeliveryId: number, unitsToAdd: number): Promise<void> {
        await db.query(
            `UPDATE bulk_deliveries
             SET units_received = units_received + $1
             WHERE bulk_delivery_id = $2`,
            [unitsToAdd, bulkDeliveryId]
        );
    }
}