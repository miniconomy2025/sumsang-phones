export interface ConsumerDelivery {
    consumerDeliveryId: number;
    orderId: number;
    deliveryReference: number;
    cost: number;
    unitsCollected: number;
    account_number: string;
}