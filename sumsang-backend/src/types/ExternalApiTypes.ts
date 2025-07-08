export interface ConsumerDeliveriesResponse {
    success: boolean;
    delivery_reference?: number;
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

export interface MachinePurchaseResponse {
    orderId: number;
    machineName: string;
    quantity: number;
    price: number;
    weight: number;
    machineDetails:
    {
        requiredMaterials: string;
        materialRatio: string;
        productionRate: number
    }
    bankAccount: string
}

export interface MachineInfo {
    machineName: string;
    quantity: number;
    materialRatio: string;
    productionRate: number;
    price: number;
}

export interface AvailableMachineResponse {
    machines: MachineInfo[];
}