import db from '../config/DatabaseConfig.js';
import { Status } from '../types/Status.js';
import { PartsPurchase } from '../types/PartsPurchaseType.js';

export class PartsPurchaseRepository {
    static async getPartsPurchaseById(partsPurchaseId: number): Promise<PartsPurchase> {
        const result = await db.query(
            `SELECT 
                parts_purchase_id,
                part_id,
                reference_number,
                cost,
                quantity,
                account_number,
                status,
                purchased_at
            FROM parts_purchase 
            WHERE parts_purchase_id = $1`,
            [partsPurchaseId]
        );
        return {
            partsPurchaseId: result.rows[0].parts_purchase_id,
            partId: result.rows[0].part_id,
            referenceNumber: result.rows[0].reference_number,
            cost: result.rows[0].cost,
            quantity: result.rows[0].quantity,
            accountNumber: result.rows[0].account_number,
            status: result.rows[0].status,
            purchasedAt: result.rows[0].purchased_at
        };
    }

    static async updateStatus(partsPurchaseId: number, status: number) {
        await db.query(
            `UPDATE parts_purchase 
            SET status = $1 
            WHERE parts_purchase_id = $2`,
            [status, partsPurchaseId]
        );
    }

    static async getPurchasesByStatus(statuses: Status[]): Promise<PartsPurchase[]> {
        if (!statuses.length) return [];

        const placeholders = statuses.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
        SELECT
            parts_purchase_id,
            part_id,
            reference_number,
            cost,
            quantity,
            account_number,
            status,
            purchased_at
        FROM parts_purchases
        WHERE status IN (${placeholders})
        `;

        const result = await db.query(query, statuses);
        return result.rows.map(row => ({
            partsPurchaseId: row.parts_purchase_id,
            partId: row.part_id,
            referenceNumber: row.reference_number,
            cost: row.cost,
            quantity: row.quantity,
            accountNumber: row.account_number,
            status: row.status,
            purchasedAt: row.purchased_at
        }));
    }

    static async createPartsPurchase(partsPurchase: PartsPurchase): Promise<number> {
        const query = `
        INSERT INTO parts_purchases (
            part_id,
            reference_number,
            cost,
            quantity,
            account_number,
            status,
            purchased_at
        ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE(
                (SELECT value::int - $1 FROM system_settings WHERE key = 'current_day'),
                0
        ))
        RETURNING parts_purchase_id
        `;
        const values = [partsPurchase.partId, partsPurchase.referenceNumber, partsPurchase.cost, partsPurchase.quantity, partsPurchase.accountNumber, partsPurchase.status];
        const result = await db.query(query, values);
        return result.rows[0].parts_purchase_id;
    }
}