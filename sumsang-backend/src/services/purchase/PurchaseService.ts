import db from "../../config/DatabaseConfig.js";

export interface PartPurchaseRecord {
    partId: number;
    supplierId: number;
    quantity: number;
    costPerUnit: number;
    referenceNumber: number;
    statusId: number; // e.g. 1 for "Pending"
}

export class PurchaseService {
    static async recordPartPurchase(purchase: PartPurchaseRecord): Promise<void> {
        const { partId, supplierId, quantity, costPerUnit, referenceNumber, statusId } = purchase;

        const result = await db.query(
            `SELECT parts_supplier_id FROM partsSupplier
            WHERE partsSupplier.part_id = $1
            AND partsSupplier.supplier_id = $2
            LIMIT 1;`,
            [partId, supplierId])

        const partsSupplierId = result.rows[0].part_supplier_id;

        if (!partsSupplierId) {
            throw new Error(`No part_supplier found for part ${partId} and supplier ${supplierId}`);
        }

        const totalCost = quantity * costPerUnit;
        const accountNumber = "12345" // TODO: inject this properly

        //missing account number
        const insertedPurchase = await db.query(
            `INSERT INTO parts_purchases (reference_number, cost, status, account_number, purchased_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING parts_purchase_id`,
            [referenceNumber, totalCost, statusId, accountNumber, new Date()]
        );

        const partsPurchaseId = insertedPurchase.rows[0].parts_purchase_id;

        await db.query(
            `INSERT INTO parts_purchases_items (part_supplier_id, parts_purchase_id, quantity)
             VALUES ($1, $2, $3)`,
            [partsSupplierId, partsPurchaseId, quantity]
        );
    }
}