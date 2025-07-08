export interface ConsumerDeliveriesResponse {
    success: boolean;
    delivery_reference?: string;
    cost?: number;
    account_number?: string;
    message?: string;
}

export interface BulkDeliveriesResponse {
    success: boolean;
    delivery_reference?: number;
    cost?: number;
    account_number?: string;
    message?: string;
}

export interface PurchaseCasesResponse {
    success: boolean;
    reference_number?: number;
    cost?: number;
    account_number?: string;
    message?: string;
}

export interface PurchaseScreensResponse {
    success: boolean;
    reference_number?: number;
    cost?: number;
    account_number?: string;
    message?: string;
}

export interface PurchaseElectronicsResponse {
    success: boolean;
    reference_number?: number;
    cost?: number;
    account_number?: string;
    message?: string;
}