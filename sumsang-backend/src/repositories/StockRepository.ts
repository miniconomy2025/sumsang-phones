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
            return result.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to get stock: ${(error as Error).message}`);
        }
    }
}
