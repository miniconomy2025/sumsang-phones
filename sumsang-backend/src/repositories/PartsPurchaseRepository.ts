import db from '../config/DatabaseConfig.js';
import { Status } from '../types/Status.js';
import { PartsPurchase } from '../types/PartsPurchaseType.js';

export class PartsPurchaseRepository {
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

    static async createPartsPurchaseOrder(partsPurchase: PartsPurchase): Promise<number> {
        const query = `
        INSERT INTO parts_purchases (
            part_id,
            reference_number,
            cost,
            quantity,
            account_number,
            status,
            purchased_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING parts_purchase_id
        `;
        const values = [partsPurchase.partId, partsPurchase.referenceNumber, partsPurchase.cost, partsPurchase.quantity, partsPurchase.accountNumber, partsPurchase.status];
        const result = await db.query(query, values);
        return result.rows[0].parts_purchase_id;
    }
}