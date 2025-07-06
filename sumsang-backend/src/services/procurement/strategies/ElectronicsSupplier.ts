import { SupplierStrategy, PurchaseResult } from "./SupplierStrategy.js";
import { PartService } from "../../parts/PartService.js";
import { PurchaseService } from "../../purchase/PurchaseService.js"
import { SupplierService } from "../../supplier/SupplierService.js";

export class ElectronicSupplier implements SupplierStrategy {
    supplierName = "Electronics Supplier";

    async purchaseParts(budget: number): Promise<PurchaseResult> {
        const partName = 'electronics';

        const partId = await PartService.getPartIdByName(partName);
        const costPerUnit = await PartService.getCostForPart(partId);

        const supplierId = await SupplierService.getSupplierIdByName(this.supplierName);

        //TODO account number properly
        const accountNumber = "";

        const quantity = Math.floor(budget / costPerUnit);
        const totalCost = quantity * costPerUnit;

        await PurchaseService.recordPartPurchase({
            partId: partId,
            supplierId: supplierId,
            quantity: quantity,
            costPerUnit: costPerUnit,
            referenceNumber: 234,
            statusId: 234
        });

        return { partId, quantity, totalCost }
    }
}