import { MachineRepository } from "../repositories/MachineRepository.js";
import { BulkDeliveriesResponse, ConsumerDeliveriesResponse, PurchaseCasesResponse, PurchaseElectronicsResponse, PurchaseScreensResponse, MachinePurchaseResponse, AvailableMachineResponse } from "../types/ExternalApiTypes.js";

export class ConsumerDeliveriesAPI {
    static CONSUMER_LOGISTICS_API = 'https://consumerdeliveries/api'

    static async requestDelivery(orderId: number, units: number): Promise<ConsumerDeliveriesResponse> {
        try {
            const response = await fetch(`${this.CONSUMER_LOGISTICS_API}/delivery-request`, {
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
    static BULK_LOGISTICS_API = 'https://bulkdeliveries/api'
    static async requestDelivery(orderId: number, units: number, from: string): Promise<BulkDeliveriesResponse> {
        try {
            const response = await fetch(`${this.BULK_LOGISTICS_API}/delivery-request`, {
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
    static COMMERCIAL_BANK_API: string = 'https://commercialbank/api'

    static async makePayment(reference_number: number, amount: number, accountNumber: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await fetch(`${this.COMMERCIAL_BANK_API}/transaction`, {
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
            const response = await fetch(`${this.COMMERCIAL_BANK_API}/account`, {
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
            const response = await fetch(`${this.COMMERCIAL_BANK_API}/loan`, {
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
            const response = await fetch(`${this.COMMERCIAL_BANK_API}/loan/${loanNumber}`, {
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
            const response = await fetch(`${this.COMMERCIAL_BANK_API}/loan/${loan_number}/pay`,
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
    static CASE_SUPP_API = 'http://case-supplier-api.projects.bbdgrad.com/api';
    static async purchaseCases(quantity: number): Promise<PurchaseCasesResponse> {
        try {
            const response = await fetch(`${this.CASE_SUPP_API}/purchase`, {
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
    static SCREEN_SUPP_API = 'https://screen-suppliers/api';

    static async purchaseScreens(quantity: number): Promise<PurchaseScreensResponse> {
        try {
            const response = await fetch(`${this.SCREEN_SUPP_API}/purchase`, {
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
    static ELECTRONICS_SUPP_API = 'https://electronics-suppliers/api'
    static async purchaseElectronics(quantity: number): Promise<PurchaseElectronicsResponse> {
        try {
            const response = await fetch(`${this.ELECTRONICS_SUPP_API}/purchase`, {
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
    static THOH_API = 'https://thoh/api'
    static async purchaseMachine(machineName: string, quantity: number): Promise<MachinePurchaseResponse> {
        try {
            const response = await fetch(`${this.THOH_API}/simulation/purchase-machine`,
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
            const response = await fetch(`${this.THOH_API}/simulation/machines`,
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