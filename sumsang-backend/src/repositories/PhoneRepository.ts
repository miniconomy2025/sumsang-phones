import db from '../config/DatabaseConfig.js';
import { DatabaseError, ValidationError } from '../utils/errors.js';

export class PhoneRepository {
    static async phoneExists(phone_id: number): Promise<boolean> {
        try {
            const result = await db.query(
                `SELECT 1 FROM phones WHERE phone_id = $1 LIMIT 1`,
                [phone_id]
            );
            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            throw new DatabaseError(`Failed to check phone existence: ${(error as Error).message}`);
        }
    }

    static async getPhoneById(phone_id: number) {
        try {
            const result = await db.query(
                `SELECT phone_id, model, price 
                FROM phones 
                WHERE phone_id = $1`,
                [phone_id]
            );

            if ((result.rowCount ?? 0) === 0) {
                throw new ValidationError(`Phone with ID ${phone_id} not found.`);
            }

            return result.rows[0];
        } catch (error) {
            throw new DatabaseError(`Failed to fetch phone by ID: ${(error as Error).message}`);
        }
    }
}
