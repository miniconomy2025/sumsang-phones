import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';

export class StockRepository {
    static async getStock() {
    try {
        const result = await db.query(
        `SELECT * FROM stock`
        );
        return result.rows[0];
    } catch (error) {
        throw new DatabaseError(`Failed to get stock: ${(error as Error).message}`);
    }
    };
}