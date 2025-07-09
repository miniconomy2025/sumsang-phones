export interface ConsumerDelivery {
    consumerDeliveryId: number;
    orderId: number;
    deliveryReference: string;
    cost: number;
    unitsCollected: number;
    accountNumber: string;
    createdAt: number;
}