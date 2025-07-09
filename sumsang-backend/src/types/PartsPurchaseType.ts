export type PartsPurchase = {
    partsPurchaseId?: number;
    partId: number;
    referenceNumber: number;
    cost: number;
    quantity: number;
    accountNumber: string;
    status: number;
    purchasedAt?: number;
}