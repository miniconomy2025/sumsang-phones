export interface ConsumerDeliveriesResponse {
    success: boolean;
    delivery_reference?: number;
    cost?: number;
    account_number?: string;
    message?: string;
}