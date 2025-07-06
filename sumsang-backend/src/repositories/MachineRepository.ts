import db from '../config/DatabaseConfig.js';
import { Machine } from '../types/MachineType.js';

export class MachineRepository {
    static async getActiveMachines(): Promise<Machine[]> {
        const result = await db.query(
            `SELECT machine_id, phone_id, rate_per_day, date_acquired, date_retired
            FROM machines
            WHERE date_acquired IS NOT NULL 
            AND date_retired IS NULL
            ORDER BY phone_id, machine_id`
        );
        return result.rows.map(row => ({
            machineId: row.machine_id,
            phoneId: row.phone_id,
            ratePerDay: row.rate_per_day,
            dateAcquired: row.date_acquired,
            dateRetired: row.date_retired
        }));;
    }

    static async getMachineRatios(phoneId: number) {
      const result = await db.query(`
        SELECT mr.part_id, SUM(mr.quantity) AS "total_quantity"
        FROM machine_ratios mr
        INNER JOIN machines m ON mr.machine_id = m.machine_id
        WHERE m.phone_id = $1
        AND m.date_acquired IS NOT NULL
        AND m.date_retired IS NULL
        GROUP BY mr.part_id
      `, [phoneId]);

      return result.rows.map(row => ({
        partId: row.part_id,
        totalQuantity: row.total_quantity
      }));
  }
}