import db from "../config/DatabaseConfig.js";
import { Machine } from "../types/MachineType.js";
import { Status } from "../types/Status.js";
import { MachinePurchaseRecord } from "../types/MachinePurchaseType.js";


export class MachinePurchaseRepository {
    static async getAll(): Promise<MachinePurchaseRecord[]> {
        const result = await db.query(
            `SELECT machine_purchases_id, phone_id, machines_purchased, total_cost, weight_per_machine, rate_per_day, ratio, status, account_number, reference FROM machine_purchases`,
        )

        return result.rows;
    }

    static async createMachinePurchase(purchase: MachinePurchaseRecord): Promise<number> {
        const { phoneId, machinesPurchased, totalCost, weightPerMachine, ratePerDay, ratio, status, accountNumber, reference } = purchase;

        const result = await db.query(
            `INSERT INTO machine_purchases 
        (phone_id, machines_purchased, total_cost, weight_per_machine, rate_per_day, ratio, status, account_number, reference) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING machine_purchases_id`,
            [phoneId, machinesPurchased, totalCost, weightPerMachine, ratePerDay, ratio, status, accountNumber, reference]
        );

        return result.rows[0].machine_purchases_id;
    }

    static async getMachinePurchaseById(machineId: number): Promise<MachinePurchaseRecord> {
        const result = await db.query(
            `SELECT machine_purchases_id, phone_id, machines_purchased, total_cost, weight_per_machine, rate_per_day, ratio, status, account_number, reference FROM machine_purchases
             FROM machine_purchases
             WHERE machine_purchases_id = $1`,
            [machineId]
        );

        return {
            machinePurchasesId: result.rows[0].machine_purchases_id,
            phoneId: result.rows[0].phone_id,
            machinesPurchased: result.rows[0].machines_purchased,
            totalCost: result.rows[0].total_cost,
            weightPerMachine: result.rows[0].weight_per_machine,
            ratePerDay: result.rows[0].rate_per_day,
            ratio: result.rows[0].ratio,
            status: result.rows[0].status,
            accountNumber: result.rows[0].account_number,
            reference: result.rows[0].reference
        }
    }

    static async getPurchasesByStatus(statuses: Status[]): Promise<MachinePurchaseRecord[]> {
        if (!statuses.length) return [];

        const placeholders = statuses.map((_, i) => `$${i + 1}`).join(', ');

        const result = await db.query(
            `SELECT machine_purchases_id, phone_id, machines_purchased, total_cost, weight_per_machine, rate_per_day, ratio, status, account_number, reference FROM machine_purchases
             WHERE status IN (${placeholders})`, statuses);

        return result.rows.map(row => ({
            machinePurchasesId: row.machine_purchases_id,
            phoneId: row.phone_id,
            machinesPurchased: row.machines_purchased,
            totalCost: row.total_cost,
            weightPerMachine: row.weight_per_machine,
            ratePerDay: row.rate_per_day,
            ratio: row.ratio,
            status: row.status,
            accountNumber: row.account_number,
            reference: row.reference
        }));
    }

    static async updateStatus(machinePurchaseId: number, status: number) {
        await db.query(
            `UPDATE machine_purchases
            SET status = $1 
            WHERE machine_purchase_id = $2`,
            [status, machinePurchaseId]
        );
    }

    static async getById(id: number): Promise<MachinePurchaseRecord | null> {
        const result = await db.query(
            `SELECT * FROM machine_purchases WHERE machine_purchases_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }
}