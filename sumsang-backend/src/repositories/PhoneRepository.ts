import db from '../config/DatabaseConfig.js';
import { DatabaseError, ValidationError } from '../utils/errors.js';
import { Phone } from '../types/PhoneType.js';

export class PhoneRepository {
    static async phoneExists(model: string): Promise<boolean> {
        try {
            const result = await db.query(
                `SELECT 1 FROM phones WHERE model = $1 LIMIT 1`,
                [model]
            );
            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            throw new DatabaseError(`Failed to check phone existence: ${(error as Error).message}`);
        }
    }

    static async getPhoneById(phoneId: number) {
        try {
            const result = await db.query(
                `SELECT phone_id, model, price 
                FROM phones 
                WHERE phone_id = $1`,
                [phoneId]
            );

            if ((result.rowCount ?? 0) === 0) {
                throw new ValidationError(`Phone with ID ${phoneId} not found.`);
            }

            return {
                phoneId: result.rows[0].phone_id,
                model: result.rows[0].model,
                price: result.rows[0].price
            };
        } catch (error) {
            throw new DatabaseError(`Failed to fetch phone by ID: ${(error as Error).message}`);
        }
    }

    static async getPhoneByModel(model: string): Promise<Phone> {
        const result = await db.query(
            `SELECT phone_id, model, price FROM phones WHERE model = $1 LIMIT 1`,
            [model]
        );

        return result.rows[0]
    }

    /**
     * Fetch all phones
     */
    static async getAllPhones(): Promise<Phone[]> {
        const result = await db.query(`SELECT * FROM phones`);
        return result.rows;
    }

    /**
     * Update the price of a phone model
     */
    static async updatePhonePrice(model: string, newPrice: number): Promise<void> {
        await db.query(
            `UPDATE phones SET price = $1 WHERE model = $2`,
            [newPrice, model]
        );
    }

    /**
     * Insert a new phone model if needed
     */
    static async addPhone(model: string, price: number): Promise<void> {
        await db.query(
            `INSERT INTO phones (model, price) VALUES ($1, $2)`,
            [model, price]
        );
    }

    /**
     * Get the price of a phone by ID
     */
    static async getPriceByPhoneId(phoneId: number): Promise<number> {
        const result = await db.query(
            `SELECT price FROM phones WHERE phone_id = $1 LIMIT 1`,
            [phoneId]
        );

        if (result.rows.length === 0) {
            throw new Error(`No phone found with ID: ${phoneId}`);
        }

        return result.rows[0].price;
    }
}
