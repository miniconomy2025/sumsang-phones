import db from '../config/DatabaseConfig.js';
import { MachineDelivery } from '../types/MachineDeliveryType.js';

export class MachineDeliveryRepository {
    static async insertMachineDelivery(
        machinePurchaseId: number,
        deliveryReference: number,
        cost: number,
        address: string,
        accountNumber: string
    ): Promise<void> {
        await db.query(
            `INSERT INTO machine_deliveries 
            (machine_purchases_id, delivery_reference, cost, units_received, address, account_number, created_at)
            VALUES ($1, $2, $3, 0, $4, $5, NOW())`,
            [machinePurchaseId, deliveryReference, cost, address, accountNumber]
        );
    }

    static async getDeliveryByDeliveryReference(deliveryReference: number): Promise<MachineDelivery | null> {
        const result = await db.query(
            `SELECT machine_deliveries_id, machine_purchases_id, delivery_reference, cost, units_received, address, account_number, created_at
             FROM machine_deliveries
             WHERE delivery_reference = $1`,
            [deliveryReference]
        );

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            machineDeliveriesId: row.machine_deliveries_id,
            machinePurchasesId: row.machine_purchases_id,
            deliveryReference: row.delivery_reference,
            cost: row.cost,
            unitsReceived: row.units_received,
            address: row.address,
            accountNumber: row.account_number,
            createdAt: row.created_at
        };
    }

    static async updateUnitsReceived(machineDeliveriesId: number, unitsToAdd: number): Promise<void> {
        await db.query(
            `UPDATE machine_deliveries
             SET units_received = units_received + $1
             WHERE machine_deliveries_id = $2`,
            [unitsToAdd, machineDeliveriesId]
        );
    }
}