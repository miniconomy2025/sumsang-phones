import { BulkDeliveriesResponse, ConsumerDeliveriesResponse, PurchaseCasesResponse, PurchaseElectronicsResponse, PurchaseScreensResponse } from "../types/ExternalApiTypes.js";

// Helper function to get the full URL based on environment variable
function getApiUrl(productionUrl: string, servicePath: string): string {
    const useTestEndpoints = process.env.USE_TEST_ENDPOINTS === 'true';
    return useTestEndpoints ? `http://localhost:3000/test-endpoints${servicePath}` : productionUrl;
}

export class ConsumerDeliveriesAPI {
    static async requestDelivery(orderId: number, units: number): Promise<ConsumerDeliveriesResponse> {
        try {
            const apiUrl = getApiUrl('https://consumerdeliveries/api/delivery-request', '/consumerdeliveries/api/delivery-request');
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    units: units,
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
            const apiUrl = getApiUrl('https://bulkdeliveries/api/delivery-request', '/bulkdeliveries/api/delivery-request');
            const response = await fetch(apiUrl, {
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
            const apiUrl = getApiUrl('https://commercialbank/api/make-payment', '/commercialbank/api/make-payment');
            const response = await fetch(apiUrl, {
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
            const apiUrl = getApiUrl('https://case-suppliers/api/purchase', '/case-suppliers/api/purchase');
            const response = await fetch(apiUrl, {
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
            const apiUrl = getApiUrl('https://screen-suppliers/api/purchase', '/screen-suppliers/api/purchase');
            const response = await fetch(apiUrl, {
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
            const apiUrl = getApiUrl('https://electronics-suppliers/api/purchase', '/electronics-suppliers/api/purchase');
            const response = await fetch(apiUrl, {
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