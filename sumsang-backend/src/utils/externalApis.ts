import { MachineRepository } from "../repositories/MachineRepository.js";
import { BulkDeliveriesResponse, ConsumerDeliveriesResponse, PurchaseCasesResponse, PurchaseElectronicsResponse, PurchaseScreensResponse, MachinePurchaseResponse, AvailableMachineResponse } from "../types/ExternalApiTypes.js";

// Helper function to get the full URL based on environment variable
function getApiUrl(productionUrl: string, servicePath: string): string {
    const useTestEndpoints = process.env.USE_TEST_ENDPOINTS === 'true';
    return useTestEndpoints ? `http://localhost:3000/test-endpoints${servicePath}` : productionUrl;
}

export class ConsumerDeliveriesAPI {
    static apiUrl = getApiUrl('https://consumerdeliveries/api', '/consumerdeliveries/api/delivery-request');

    static async requestDelivery(orderId: number, units: number): Promise<ConsumerDeliveriesResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/delivery-request`, {
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
    static apiUrl = getApiUrl('https://bulkdeliveries/api', '/bulkdeliveries/api/delivery-request');

    static async requestDelivery(orderId: number, units: number, from: string): Promise<BulkDeliveriesResponse> {
        try {

            const response = await fetch(`${this.apiUrl}/delivery-request`, {
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
    static apiUrl = getApiUrl('https://commercialbank/api', '/commercialbank/api/make-payment');

    static async makePayment(reference_number: string, amount: number, accountNumber: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${this.apiUrl}/make-payment`, {
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

    static async openAccount(): Promise<{ account_number: string }> {
        try {
            const response = await fetch(`${this.apiUrl}/account`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            })

            return response.json();
        }
        catch (error) {
            console.error("Failed to open account");
            return { account_number: "" }
        }
    }

    static async applyForLoan(amount: number): Promise<{ success: boolean, loan_number: string }> {
        try {
            const response = await fetch(`${this.apiUrl}/loan`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount
                })
            })

            return response.json();
        }
        catch (error) {
            console.error("Loan application failed");
            return { success: false, loan_number: "" }
        }
    }

    static async getLoanInfo(loanNumber: string): Promise<{ outstandingAmount: number }> {
        try {
            const response = await fetch(`${this.apiUrl}/loan/${loanNumber}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`Bank API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to retrieve loan info:", error);
            return { outstandingAmount: 0 };
        }
    }

    static async repayLoan(loan_number: string, amount: number): Promise<{ success: boolean, paid: number }> {
        try {
            const response = await fetch(`${this.apiUrl}/loan/${loan_number}/pay`,
                {
                    method: "POST",
                    headers: { "Content-Type": "applicaion/json" },
                    body: JSON.stringify({
                        amount
                    })
                }
            )
            return response.json();
        }
        catch (error) {
            console.error("Could not pay loan");
            return { success: false, paid: 0 }
        }
    }
}


export class CaseSuppliers {
    static apiUrl = getApiUrl('http://case-supplier-api.projects.bbdgrad.com/api', '/case-suppliers/api/purchase');

    static async purchaseCases(quantity: number): Promise<PurchaseCasesResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/purchase`, {
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
    static apiUrl = getApiUrl('https://screen-suppliers/api', '/screen-suppliers/api/purchase');

    static async purchaseScreens(quantity: number): Promise<PurchaseScreensResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/purchase`, {
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
    static apiUrl = getApiUrl('https://electronics-suppliers/api', '/electronics-suppliers/api/purchase');

    static async purchaseElectronics(quantity: number): Promise<PurchaseElectronicsResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/purchase`, {
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


export class THOHAPI {
    static apiUrl = getApiUrl('https://thoh/api', '/electronics-suppliers/api/purchase');

    static async purchaseMachine(machineName: string, quantity: number): Promise<MachinePurchaseResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/simulation/purchase-machine`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        machineName: machineName,
                        quantity: quantity
                    })
                })

            return response.json();
        }
        catch (error) {
            console.log("Failed to purchase machine");
            throw new Error("Machine purchase failed");
        }
    }

    static async getAvailableMachines(): Promise<AvailableMachineResponse[]> {
        try {
            const response = await fetch(`${this.apiUrl}/simulation/machines`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            )
            if (!response.ok) {
                throw new Error(`Failed to fetch machines. Status: ${response.status}`);
            }
            return response.json();
        }
        catch (error) {
            throw new Error("Could not get list of machines");
        }
    }
}