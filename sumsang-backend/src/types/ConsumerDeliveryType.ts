export interface ConsumerDelivery {
    consumerDeliveryId: number;
    orderId: number;
    deliveryReference: number;
    cost: number;
    unitsCollected: number;
    accountNumber: string;
    createdAt: Date;
}