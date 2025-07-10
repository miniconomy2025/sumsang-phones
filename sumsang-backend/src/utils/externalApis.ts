
import axios from 'axios';
import fs from 'fs';
import https from 'https';
import path from 'path';

import { BulkDeliveriesResponse, ConsumerDeliveriesResponse, PurchaseCasesResponse, PurchaseElectronicsResponse, PurchaseScreensResponse, MachinePurchaseResponse, PartsPurchaseResponse, MachineInfo } from "../types/ExternalApiTypes.js";

const httpsAgent = new https.Agent({
    cert: fs.readFileSync(path.resolve(process.env.CLIENT_CERT_PATH === undefined ? './certs/sumsang-company-client.crt' : process.env.CLIENT_CERT_PATH)),
    key: fs.readFileSync(path.resolve(process.env.CLIENT_KEY_PATH === undefined ? './certs/sumsang-company-client.key' : process.env.CLIENT_KEY_PATH)),
    rejectUnauthorized: true,
});

export const axiosInstance = axios.create({
    httpsAgent,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Helper function to get the full URL based on environment variable
function getApiUrl(productionUrl: string, servicePath: string): string {
    const useTestEndpoints = process.env.USE_TEST_ENDPOINTS === 'true';
    return useTestEndpoints ? `http://localhost:3000/test-endpoints${servicePath}` : productionUrl;
}

export class ConsumerDeliveriesAPI {
    static apiUrl = getApiUrl('https://f85q1igme7.execute-api.af-south-1.amazonaws.com/api', '/consumerdeliveries/api');

    static async requestDelivery(units: number): Promise<ConsumerDeliveriesResponse> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/pickups`, {
                quantity: units,
                companyName: "sumsang-company",
                recipient: "thoh"
            });

            return { success: true, ...response.data };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.statusText || error.message
            };
        }
    }
}

export class BulkDeliveriesAPI {
    static apiUrl = getApiUrl('https://bulk-logistics-api.projects.bbdgrad.com/api', '/bulkdeliveries/api');

    static async requestDelivery(orderId: number, units: number, from: string, item: string): Promise<BulkDeliveriesResponse> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/pickup-request`, {
                originalExternalOrderId: orderId,
                originCompanyId: from,
                destinationCompanyId: 'sumsang-company',
                items: [{ itemName: item, quantity: units, measurementType: "UNIT" }]
            });

            return { success: true, ...response.data };
        } catch (error: any) {
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async requestMachineDelivery(orderId: number, units: number, weightPerMachine: number): Promise<BulkDeliveriesResponse> {
        try {
            const repeatedArray = Array.from({ length: units }, () => ({
                itemName: 'Machine',
                quantity: weightPerMachine,
                measurementType: 'KG'
            }));

            const response = await axiosInstance.post(`${this.apiUrl}/pickup-request`, {
                originalExternalOrderId: orderId,
                originCompanyId: 'thoh',
                destinationCompanyId: 'sumsang-company',
                items: repeatedArray
            });

            return { success: true, ...response.data };
        } catch (error: any) {
            return { success: false, message: error.response?.statusText || error.message };
        }
    }
}

export class CommercialBankAPI {
    static apiUrl = getApiUrl('https://commercialbank/api', '/commercialbank/api');

    static async makePayment(reference_number: string, amount: number, accountNumber: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/make-payment`, {
                to_account_number: accountNumber,
                to_bank_name: "commercial-bank",
                amount,
                description: reference_number
            });

            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async openAccount(): Promise<{ account_number: string }> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/account`);
            return response.data;
        } catch {
            return { account_number: "" };
        }
    }

    static async applyForLoan(amount: number): Promise<{ success: boolean, loan_number: string }> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/loan`, { amount });
            return response.data;
        } catch {
            return { success: false, loan_number: "" };
        }
    }

    static async getLoanInfo(loanNumber: string): Promise<{ outstandingAmount: number }> {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/loan/${loanNumber}`);
            return response.data;
        } catch {
            return { outstandingAmount: 0 };
        }
    }

    static async repayLoan(loan_number: string, amount: number): Promise<{ success: boolean, paid: number }> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/loan/${loan_number}/pay`, { amount });
            return response.data;
        } catch {
            return { success: false, paid: 0 };
        }
    }
}


export class CaseSuppliers {
    static apiUrl = getApiUrl('http://case-supplier-api.projects.bbdgrad.com/api', '/case-suppliers/api');

    static async getCasesCost(): Promise<{success: boolean, cost?: number, message?: string}> {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/cases`);

            const raw: {available_units: number, price_per_unit: number} = response.data;
            return {
                success: true,
                cost: raw.price_per_unit
            };
        } catch (error: any) {
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async purchaseCases(quantity: number): Promise<PartsPurchaseResponse> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/orders`, { quantity });

            const raw: PurchaseCasesResponse = response.data;
            return {
                success: true,
                accountNumber: raw.bankNumber,
                cost: raw.total_price,
                referenceNumber: raw.id
            };
        } catch (error: any) {
            return { success: false, message: error.response?.statusText || error.message };
        }
    }
}


export class ScreenSuppliers {
    static apiUrl = getApiUrl('https://screen-suppliers/api', '/screen-suppliers/api');

    static async getScreensCost(): Promise<{success: boolean, cost?: number, message?: string}> {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/screens`);

            const raw: {screens: {quantity: number, price: number}} = response.data;
            return {
                success: true,
                cost: raw.screens.quantity
            };
        } catch (error: any) {
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async purchaseScreens(quantity: number): Promise<PartsPurchaseResponse> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/order`, { quantity });

            const raw: PurchaseScreensResponse = response.data;
            return {
                success: true,
                referenceNumber: raw.orderId,
                cost: raw.totalPrice,
                accountNumber: raw.bankAccountNumber
            };
        } catch (error: any) {
            return { success: false, message: error.response?.statusText || error.message };
        }
    }
}



export class ElectronicsSuppliers {
    static apiUrl = getApiUrl('http://electronics-supplier-api.projects.bbdgrad.com', '/electronics-suppliers/api');

    static async getElectronicsCost(): Promise<{success: boolean, cost?: number, message?: string}> {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/electronics`);

            const raw: {availableStock: number, pricePerUnit: number} = response.data;
            return {
                success: true,
                cost: raw.pricePerUnit
            };
        } catch (error: any) {
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async purchaseElectronics(quantity: number): Promise<PartsPurchaseResponse> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/order`, { quantity });

            const raw: PurchaseElectronicsResponse = response.data;
            return {
                success: true,
                referenceNumber: raw.orderId,
                cost: raw.amountDue,
                accountNumber: raw.bankNumber
            };
        } catch (error: any) {
            return { success: false, message: error.response?.statusText || error.message };
        }
    }
}



export class THOHAPI {
    static apiUrl = getApiUrl('https://thoh/api', '/thoh/api');

    static async purchaseMachine(machineName: string, quantity: number): Promise<MachinePurchaseResponse> {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/machines`, { machineName, quantity });
            return { success: true, ...response.data };
        } catch {
            throw new Error("Machine purchase failed");
        }
    }

    static async getAvailableMachines(): Promise<MachineInfo[]> {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/simulation/machines`);
            return response.data;
        } catch {
            throw new Error("Could not get list of machines");
        }
    }
}
