export enum Status {
    PendingPayment = 1,
    PendingStock = 2,
    PendingDeliveryCollection = 3,
    Shipped = 4,
    Paid = 5,
    AwaitingShipment = 6,
    Delivered = 7,
    AwaitingPickup = 8,
    InTransit = 9,
    Received = 10,
    Cancelled = 11
}