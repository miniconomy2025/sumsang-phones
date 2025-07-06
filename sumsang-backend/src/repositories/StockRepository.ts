import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';
import { Stock } from '../types/StockType.js';

export class StockRepository {
    static async getStock(): Promise<Stock[]> {
        try {
            const result = await db.query(
                `SELECT
                    p.phone_id,
                    p.model AS "name",
                    s.quantity_available AS "quantity",
                    p.price as "price"
                 FROM stock s
                 INNER JOIN phones p ON s.phone_id = p.phone_id`
            );
            return result.rows.map(row => ({
                phoneId: row.phone_id,
                name: row.model,
                quantity: row.quantity,
                price: row.price
            }));
        } catch (error) {
            throw new DatabaseError(`Failed to get stock: ${(error as Error).message}`);
        }
    }

    static async getCurrentStockMap(): Promise<Map<number, { quantityAvailable: number }>> {
        const result = await db.query(`SELECT phone_id, quantity_available FROM stock`);
        const map = new Map();
        for (const row of result.rows) {
            map.set(row.phone_id, { quantityAvailable: row.quantity_available });
        }
        return map;
    }

    static async reserveStock(phoneId: number, quantity: number): Promise<void> {
        await db.query(`
            UPDATE stock
            SET quantity_available = quantity_available - $1,
                quantity_reserved = quantity_reserved + $1,
                updated_at = NOW()
            WHERE phone_id = $2 AND quantity_available >= $1
        `, [quantity, phoneId]);
    }

    static async addStock(phoneId: number, quantity: number): Promise<void> {
        await db.query(`
            UPDATE stock
            SET quantity_available = quantity_available + $1,
                updated_at = NOW()
            WHERE phone_id = $2
        `, [quantity, phoneId]);
  }
}
