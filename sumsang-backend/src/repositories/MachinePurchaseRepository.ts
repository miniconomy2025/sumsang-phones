import db from '../config/DatabaseConfig.js';
import { MachinePurchase } from '../types/MachinePurchaseType.js';

export class MachinePurchaseRepository {
    static async getMachinePurchaseById(id: number): Promise<MachinePurchase | null> {
        const result = await db.query(
            `SELECT machine_purchases_id, phone_id, "machinesPurchased", "totalCost", "weightPerMachine", "ratePerDay"
             FROM machine_purchases
             WHERE machine_purchases_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            machinePurchasesId: row.machine_purchases_id,
            phoneId: row.phone_id,
            machinesPurchased: row.machinesPurchased,
            totalCost: row.totalCost,
            weightPerMachine: row.weightPerMachine,
            ratePerDay: row.ratePerDay
        };
    }
}