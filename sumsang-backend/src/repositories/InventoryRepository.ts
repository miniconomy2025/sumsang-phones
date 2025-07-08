import db from '../config/DatabaseConfig.js';

export class InventoryRepository {
    static async getCurrentInventoryMapped(): Promise<Map<number, number>> {
        const result = await db.query('SELECT part_id, quantity_available FROM inventory');

        const inventoryMap = new Map<number, number>();

        for (const row of result.rows) {
            inventoryMap.set(row.part_id, row.quantity_available);
        }

        return inventoryMap;
    }

    static async deductParts(partId: number, quantity: number): Promise<void> {
      await db.query(`
        UPDATE inventory
        SET quantity_available = quantity_available - $1
        WHERE part_id = $2
      `, [quantity, partId]);
    }

    static async addParts(partId: number, quantity: number): Promise<void> {
      await db.query(`
        UPDATE inventory
        SET quantity_available = quantity_available + $1
        WHERE part_id = $2
      `, [quantity, partId]);
    }
}