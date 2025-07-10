import { BulkDeliveriesResponse, ConsumerDeliveriesResponse, PurchaseCasesResponse, PurchaseElectronicsResponse, PurchaseScreensResponse, MachinePurchaseResponse, PartsPurchaseResponse, MachineInfo, LoanDetailsResponse } from "../types/ExternalApiTypes.js";

// Helper function to get the full URL based on environment variable
function getApiUrl(productionUrl: string, servicePath: string): string {
    const useTestEndpoints = process.env.USE_TEST_ENDPOINTS === 'true';
    return useTestEndpoints ? `http://localhost:3000/test-endpoints${servicePath}` : productionUrl;
}

export class ConsumerDeliveriesAPI {
    static apiUrl = getApiUrl('https://f85q1igme7.execute-api.af-south-1.amazonaws.com/api', '/consumerdeliveries/api');

    static async requestDelivery(units: number): Promise<ConsumerDeliveriesResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/pickups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity: units,
                    companyName: "sumsang-company",
                    recipient: "thoh"
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const raw: ConsumerDeliveriesResponse = await response.json();
            const result: ConsumerDeliveriesResponse = {
                success: true,
                ...raw
            }
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}

export class BulkDeliveriesAPI {
    static apiUrl = getApiUrl('https://bulk-logistics-api.projects.bbdgrad.com/api', '/bulkdeliveries/api');

    static async requestDelivery(orderId: number, units: number, from: string, item: string): Promise<BulkDeliveriesResponse> {
        try {

            const response = await fetch(`${this.apiUrl}/pickup-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalExternalOrderId: orderId,
                    originCompanyId: from,
                    destinationCompanyId: 'sumsang-company',
                    items: [{ itemName: item, quantity: units, measurementType: "UNIT" }]
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const raw: BulkDeliveriesResponse = await response.json();
            const result: BulkDeliveriesResponse = {
                success: true,
                ...raw
            }
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }

    static async requestMachineDelivery(orderId: number, units: number, weightPerMachine: number): Promise<BulkDeliveriesResponse> {
        try {
            const repeatedArray = Array.from({ length: units }, () => ({
                itemName: 'Machine',
                quantity: weightPerMachine,
                measurementType: 'KG'
            }));

            const response = await fetch(`${this.apiUrl}/pickup-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalExternalOrderId: orderId,
                    originCompanyId: 'thoh',
                    destinationCompanyId: 'sumsang-company',
                    items: repeatedArray
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const raw: BulkDeliveriesResponse = await response.json();
            const result: BulkDeliveriesResponse = {
                success: true,
                ...raw
            }
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}

export class CommercialBankAPI {
    static apiUrl = getApiUrl('https://commercialbank/api', '/commercialbank/api');

    static async makePayment(reference_number: string, amount: number, accountNumber: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${this.apiUrl}/make-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to_account_number: accountNumber,
                    to_bank_name: "commercial-bank",
                    amount,
                    description: reference_number
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

    static async getLoanInfo(loanNumber: string): Promise<LoanDetailsResponse> {
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
            return {
                loanNumber: loanNumber,
                initialAmount: 0,
                outstanding: 0,
                interestRate: 0,
                startedAt: Date.now(),
                writeOff: false,
                payments: []
            };
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

    static async getBalance(): Promise<{ balance: number }> {
        try {
            const response = await fetch(`${this.apiUrl}/account/me/balance`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                })
            return response.json();
        }
        catch (error) {
            console.error("Could not get account balance");
            return { balance: 0 };
        }
    }
}


export class CaseSuppliers {
    static apiUrl = getApiUrl('http://case-supplier-api.projects.bbdgrad.com/api', '/case-suppliers/api');

    static async purchaseCases(quantity: number): Promise<PartsPurchaseResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const raw: PurchaseCasesResponse = await response.json();
            const result: PartsPurchaseResponse = {
                success: true,
                accountNumber: raw.bankNumber,
                cost: raw.total_price,
                referenceNumber: raw.id
            }
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}

export class ScreenSuppliers {
    static apiUrl = getApiUrl('https://screen-suppliers/api', '/screen-suppliers/api');

    static async purchaseScreens(quantity: number): Promise<PartsPurchaseResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const raw: PurchaseScreensResponse = await response.json();
            const result: PartsPurchaseResponse = {
                success: true,
                referenceNumber: raw.orderId,
                cost: raw.totalPrice,
                accountNumber: raw.bankAccountNumber
            }
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}

export class ElectronicsSuppliers {
    static apiUrl = getApiUrl('http://electronics-supplier-api.projects.bbdgrad.com', '/electronics-suppliers/api');

    static async purchaseElectronics(quantity: number): Promise<PartsPurchaseResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity
                }),
            });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const raw: PurchaseElectronicsResponse = await response.json();
            const result: PartsPurchaseResponse = {
                success: true,
                referenceNumber: raw.orderId,
                cost: raw.amountDue,
                accountNumber: raw.bankNumber
            }
            return result;
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    }
}


export class THOHAPI {
    static apiUrl = getApiUrl('https://thoh/api', '/thoh/api');

    static async purchaseMachine(machineName: string, quantity: number): Promise<MachinePurchaseResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/machines`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        machineName: machineName,
                        quantity: quantity
                    })
                });

            if (!response.ok) {
                return { success: false, message: `HTTP ${response.status}` };
            }

            const raw: MachinePurchaseResponse = await response.json();
            const result: MachinePurchaseResponse = {
                success: true,
                ...raw
            }
            return result;
        }
        catch (error) {
            throw new Error("Machine purchase failed");
        }
    }

    static async getAvailableMachines(): Promise<MachineInfo[]> {
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