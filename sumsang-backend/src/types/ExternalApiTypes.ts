export interface ConsumerDeliveriesResponse {
    success?: boolean;
    referenceNo?: string;
    amount?: number;
    accountNumber?: string;
    message?: string;
}

export interface BulkDeliveriesResponse {
    success?: boolean;
    pickupRequestId?: number;
    cost?: number;
    paymentReferenceId?: string;
    accountNumber?: string;
    status?: string;
    statusCheckUrl?: string;
    message?: string;
}

export interface PurchaseCasesResponse {
    id: number;
    order_status_id: number;
    quantity: number;
    total_price: number;
    account_number: string;
}

export interface PurchaseScreensResponse {
    orderId: number;
    totalPrice: number;
    bankAccountNumber: string;
    orderStatusLink: string;
}

export interface PurchaseElectronicsResponse {
    orderId: number;
    amountDue: number;
    bankNumber: string;
    quantity: number;
}

export interface PartsPurchaseResponse {
    success: boolean;
    referenceNumber?: number;
    cost?: number;
    accountNumber?: string;
    message?: string;
}

export interface MachinePurchaseResponse {
    success?: boolean;
    orderId?: number;
    machineName?: string;
    totalPrice?: number;
    unitWeight?: number;
    totalWeight?: number;
    quantity?: number;
    machineDetails?:
    {
        requiredMaterials: string;
        inputRatio: {
            cases: number;
            screens: number;
            electronics: number;
        };
        productionRate: number
    }
    bankAccount?: string;
    message?: string;
}

export interface MachineInfo {
    machineName: string;
    inputs: string;
    quantity: number;
    inputRatio: any;
    productionRate: number;
    price: number;
}