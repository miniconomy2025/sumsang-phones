export interface BulkDelivery {
    bulkDeliveryId: number;
    partsPurchaseId: number;
    deliveryReference: number;
    cost: number;
    unitsReceived?: number;
    address: string;
    accountNumber: string;
    createdAt: Date;
}