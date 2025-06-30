import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';

export class PaymentRepository {
    static async updatePaymentStatus(reference: number, amount:number) {
        try {
            //A few queries to update some things

            return 'Payment accepted';
        } catch (error) {
            throw new DatabaseError(`Failed to get stock: ${(error as Error).message}`);
        }
    }
}