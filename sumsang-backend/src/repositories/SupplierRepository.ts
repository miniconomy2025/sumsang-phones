import db from '../config/DatabaseConfig.js';
import { Supplier } from '../types/SupplierType.js';

export class SupplierRepository {
    static async getSupplierByPartId(partId: number): Promise<Supplier> {
        const result = await db.query(
            `SELECT supplier_id, part_id, cost, name, address
            FROM suppliers
            WHERE part_id = $1
            `,
            [partId]
        );
        return {
            supplierId: result.rows[0].supplier_id,
            partId: result.rows[0].part_id,
            cost: result.rows[0].cost,
            name: result.rows[0].name,
            address: result.rows[0].address
        }
    }
}
