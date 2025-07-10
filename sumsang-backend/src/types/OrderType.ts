export type Order = {
    orderId: number;
    price: number;
    amountPaid: number;
    status: number;
    createdAt: number;
    accountNumber?: string;
};