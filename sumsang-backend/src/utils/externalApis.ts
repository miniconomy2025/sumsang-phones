import { BulkDeliveriesResponse, ConsumerDeliveriesResponse, PurchaseCasesResponse, PurchaseElectronicsResponse, PurchaseScreensResponse } from "../types/ExternalApiTypes.js";

export class ConsumerDeliveriesAPI {
    static async requestDelivery(orderId: number, units: number): Promise<ConsumerDeliveriesResponse> {
        try {
            const response = await fetch('https://consumerdeliveries/api/delivery-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    units,
                    destination: 'consumer',
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const result: ConsumerDeliveriesResponse = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}

export class BulkDeliveriesAPI {
    static async requestDelivery(orderId: number, units: number, from: string): Promise<BulkDeliveriesResponse> {
        try {
            const response = await fetch('https://bulkdeliveries/api/delivery-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    units,
                    destination: 'us',
                    from
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const result: BulkDeliveriesResponse = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}

export class CommercialBankAPI {
    static async makePayment(reference_number: number, amount: number, accountNumber: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch('https://commercialbank/api/make-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference_number: reference_number,
                    amount,
                    account_number: accountNumber
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const result = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}


export class CaseSuppliers {
    static async purchaseCases(quantity: number): Promise<PurchaseCasesResponse> {
        try {
            const response = await fetch('https://case-suppliers/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const result: PurchaseCasesResponse = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}

export class ScreenSuppliers {
    static async purchaseScreens(quantity: number): Promise<PurchaseScreensResponse> {
        try {
            const response = await fetch('https://screen-suppliers/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const result: PurchaseScreensResponse = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}


export class ElectronicsSuppliers {
    static async purchaseElectronics(quantity: number): Promise<PurchaseElectronicsResponse> {
        try {
            const response = await fetch('https://electronics-suppliers/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const result: PurchaseElectronicsResponse = await response.json();
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}


