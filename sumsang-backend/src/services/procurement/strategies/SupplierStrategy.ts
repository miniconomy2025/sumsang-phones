export interface PurchaseResult {
    partId: number;
    quantity: number;
    totalCost: number;
}


export interface SupplierStrategy {
    supplierName: string;
    purchaseParts(budget: number): Promise<PurchaseResult>;
}