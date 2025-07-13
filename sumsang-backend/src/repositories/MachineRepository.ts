import db from '../config/DatabaseConfig.js';
import { Machine } from '../types/MachineType.js';
import { MachinePurchaseRecord } from '../types/MachinePurchaseType.js';

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
    }));
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
      totalQuantity: Number(row.total_quantity)
    }));
  }

  static async getRatiosForMachine(machineId: number): Promise<{ partId: number, quantity: number }[]> {
    const result = await db.query(`
        SELECT part_id, quantity
        FROM machine_ratios
        WHERE machine_id = $1
    `, [machineId]);
    return result.rows.map(row => ({
        partId: row.part_id,
        quantity: Number(row.quantity)
    }));
  }

  static async createMachinesAndRatiosFromPurchase(machinePurchase: MachinePurchaseRecord): Promise<void> {

    const ratioString = machinePurchase.ratio;
    const ratioQuantities = ratioString.split('|').map(Number);

    const partIds = [1, 2, 3];

    if (ratioQuantities.length !== partIds.length) {
      throw new Error(`Ratio string "${ratioString}" is invalid and does not match the expected number of parts.`);
    }

    try {

      await db.query('BEGIN');

      const costPerMachine = Number(machinePurchase.totalCost) / machinePurchase.machinesPurchased;

      for (let i = 0; i < machinePurchase.machinesPurchased; i++) {

        const machineInsertQuery = `
                    INSERT INTO machines (phone_id, rate_per_day, date_acquired, cost)
                    VALUES ($1, $2, COALESCE(
                        (SELECT value::int FROM system_settings WHERE key = 'current_day'),
                        0
                    ), $3)
                    RETURNING machine_id;
                `;
        const machineResult = await db.query(machineInsertQuery, [
          machinePurchase.phoneId,
          machinePurchase.ratePerDay,
          costPerMachine
        ]);
        const newMachineId = machineResult.rows[0].machine_id;

        const ratioInsertQuery = `
                    INSERT INTO machine_ratios (machine_id, part_id, quantity)
                    VALUES ($1, $2, $3);
                `;
        for (let j = 0; j < partIds.length; j++) {
          const partId = partIds[j];
          const quantity = ratioQuantities[j];
          await db.query(ratioInsertQuery, [newMachineId, partId, quantity]);
        }
      }

      await db.query('COMMIT');

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  static async retireMachinesByPhoneId(phoneId: number, quantity: number): Promise<void> {
		await db.query(
      `WITH to_update AS (
          SELECT machine_id
          FROM machines
          WHERE phone_id = $1 AND date_retired IS NULL
          ORDER BY machine_id
          LIMIT $2
      )
      UPDATE machines
      SET date_retired = COALESCE(
                        (SELECT value::int FROM system_settings WHERE key = 'current_day'),
                        0
                    )
      WHERE machine_id IN (SELECT machine_id FROM to_update)`,
      [phoneId, quantity]
    );
	}
}