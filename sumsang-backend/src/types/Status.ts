export enum Status {
    PendingPayment = 1,
    PendingStock = 2,
    PendingDeliveryRequest = 5,
    PendingDeliveryPayment = 6,
    PendingDeliveryCollection = 3,
    Shipped = 4,
    Cancelled = 7,
    PendingDeliveryDropOff = 8
}

// Orders flow:
// PendingPayment -> PendingStock -> PendingDeliveryRequest -> PendingDeliveryPayment -> PendingDeliveryCollection -> Shipped / Cancelled

// Parts purchase flow:
// PendingPayment -> PendingDeliveryRequest -> PendingDeliveryPayment -> PendingDeliveryDropOff -> Shipped