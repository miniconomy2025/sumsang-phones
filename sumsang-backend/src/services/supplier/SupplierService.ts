import db from "../../config/DatabaseConfig.js"

export class SupplierService {
    static async getSupplierIdByName(name: string): Promise<number> {
        const result = await db.query(
            "SELECT supplier_id FROM suppliers WHERE name = $1 LIMIT 1",
            [name]
        );

        const supplierId = result.rows[0]?.supplier_id;
        if (!supplierId) {
            throw new Error(`Supplier '${name}' not found.`);
        }

        return supplierId;
    }
}