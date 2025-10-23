import axios from 'axios';
import https from 'https';

import { BulkDeliveriesResponse, ConsumerDeliveriesResponse, PurchaseCasesResponse, PurchaseElectronicsResponse, PurchaseScreensResponse, MachinePurchaseResponse, PartsPurchaseResponse, MachineInfo } from "../types/ExternalApiTypes.js";
import { Order } from '../types/OrderType.js';
import { OrderItem } from '../types/OrderItemType.js';

console.log('🚀 Initializing API client module');

 const httpsAgent = new https.Agent({
//     cert: fs.readFileSync(path.resolve(process.env.CLIENT_CERT_PATH === undefined ? './certs/sumsang-company-client.crt' : process.env.CLIENT_CERT_PATH)),
//     key: fs.readFileSync(path.resolve(process.env.CLIENT_KEY_PATH === undefined ? './certs/sumsang-company-client.key' : process.env.CLIENT_KEY_PATH)),
     rejectUnauthorized: false
 });

console.log(process.env.CLIENT_CERT_PATH);
console.log(process.env.CLIENT_KEY_PATH);

console.log('🔐 HTTPS agent configured with certificates');

export const axiosInstance = axios.create({
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': 'sumsang-company'
    },
    httpsAgent
});

console.log('📡 Axios instance created');

// Helper function to get the full URL based on environment variable
function getApiUrl(productionUrl: string, servicePath: string, envVariable: string): string {
    const useTestEndpoints = process.env[envVariable] === 'true';
    const url = useTestEndpoints ? `http://localhost:3000/test-endpoints${servicePath}` : productionUrl;
    console.log(`🔗 API URL for ${envVariable}: ${url} (test mode: ${useTestEndpoints})`);
    return url;
}

export class ConsumerDeliveriesAPI {
    static apiUrl = getApiUrl('https://afroserve.co.za', '/consumerdeliveries/api', 'USE_TEST_CONSUMER_DELIVERIES');

    static async requestDelivery(units: number): Promise<ConsumerDeliveriesResponse> {
        console.log(`📦 ConsumerDeliveriesAPI: Requesting delivery for ${units} units`);
        try {
            const payload = {
                quantity: Number(units),
                companyName: "sumsang-company",
                recipient: "thoh"
            };
            console.log(`📦 ConsumerDeliveriesAPI: Sending POST to ${this.apiUrl}/pickups with payload:`, payload);
            
            const response = await axiosInstance.post(`${this.apiUrl}/pickups`, payload);
            
            console.log(`✅ ConsumerDeliveriesAPI: Success! Response:`, response.data);
            return { success: true, ...response.data };
        } catch (error: any) {
            console.error(`❌ ConsumerDeliveriesAPI: Error occurred:`, error.response?.data || error.message);
            console.error(`❌ ConsumerDeliveriesAPI: Status:`, error.response?.status);
            return {
                success: false,
                message: error.response?.statusText || error.message
            };
        }
    }
}

export class BulkDeliveriesAPI {
    static apiUrl = getApiUrl('https://team7-todo.xyz/api', '/bulkdeliveries/api', 'USE_TEST_BULK_DELIVERIES');

    static async requestDelivery(orderId: number, units: number, from: string, item: string): Promise<BulkDeliveriesResponse> {
        console.log(`🚚 BulkDeliveriesAPI: Requesting delivery - Order ID: ${orderId}, Units: ${units}, From: ${from}, Item: ${item}`);
        try {
            const payload = {
                originalExternalOrderId: orderId,
                originCompany: from,
                destinationCompany: 'sumsang-company',
                items: [{ itemName: item, quantity: units, measurementType: "UNIT" }]
            };
            console.log(`🚚 BulkDeliveriesAPI: Sending POST to ${this.apiUrl}/pickup-request with payload:`, payload);

            const response = await axiosInstance.post(`${this.apiUrl}/pickup-request`, payload);

            console.log(`✅ BulkDeliveriesAPI: Success! Response:`, response.data);
            return { success: true, ...response.data };
        } catch (error: any) {
            console.error(`❌ BulkDeliveriesAPI: Error occurred:`, error.response?.data || error.message);
            console.error(`❌ BulkDeliveriesAPI: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async requestMachineDelivery(machineName: string, orderId: number, units: number, weightPerMachine: number): Promise<BulkDeliveriesResponse> {
        console.log(`🏭 BulkDeliveriesAPI: Requesting machine delivery - Order ID: ${orderId}, Units: ${units}, Weight per machine: ${weightPerMachine}kg`);
        try {
            const repeatedArray = Array.from({ length: units }, () => ({
                itemName: machineName,
                quantity: weightPerMachine,
                measurementType: 'KG'
            }));

            const payload = {
                originalExternalOrderId: orderId,
                originCompany: 'thoh',
                destinationCompany: 'sumsang-company',
                items: repeatedArray
            };
            console.log(`🏭 BulkDeliveriesAPI: Sending POST to ${this.apiUrl}/pickup-request with payload:`, payload);

            const response = await axiosInstance.post(`${this.apiUrl}/pickup-request`, payload);

            console.log(`✅ BulkDeliveriesAPI: Machine delivery success! Response:`, response.data);
            return { success: true, ...response.data };
        } catch (error: any) {
            console.error(`❌ BulkDeliveriesAPI: Machine delivery error:`, error.response?.data || error.message);
            console.error(`❌ BulkDeliveriesAPI: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }
}

export class CommercialBankAPI {
    static apiUrl = getApiUrl('https://commercial-bank-api.subspace.site/api', '/commercialbank/api', 'USE_TEST_COMMERCIAL_BANK');

    static async makePayment(reference_number: string, amount: number, accountNumber: string): Promise<{ success: boolean; message?: string }> {
        console.log(`💰 CommercialBankAPI: Making payment - Reference: ${reference_number}, Amount: ${amount}, Account: ${accountNumber}`);
        try {
            const payload = {
                to_account_number: accountNumber === 'TREASURY_ACCOUNT' ? '' : accountNumber,
                to_bank_name: accountNumber === 'TREASURY_ACCOUNT' ? 'thoh' : "commercial-bank",
                amount: Number(amount),
                description: reference_number
            };
            console.log(`💰 CommercialBankAPI: Sending POST to ${this.apiUrl}/transaction with payload:`, payload);

            const response = await axiosInstance.post(`${this.apiUrl}/transaction`, payload);

            console.log(`✅ CommercialBankAPI: Payment success! Response:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`❌ CommercialBankAPI: Payment error:`, error.response?.data || error.message);
            console.error(`❌ CommercialBankAPI: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async openAccount(): Promise<{ account_number: string }> {
        console.log(`🏦 CommercialBankAPI: Opening new account`);
        try {
            console.log(`🏦 CommercialBankAPI: Sending POST to ${this.apiUrl}/account`);
            const response = await axiosInstance.post(`${this.apiUrl}/account`, {notification_url : "hi"});
            console.log(`✅ CommercialBankAPI: Account opened successfully! Response:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`❌ CommercialBankAPI: Account opening failed:`, error.response?.data || error.message);
            console.error(`❌ CommercialBankAPI: Status:`, error.response?.status);
            return { account_number: "" };
        }
    }

    static async applyForLoan(amount: number): Promise<{ success: boolean, loan_number: string }> {
        console.log(`💳 CommercialBankAPI: Applying for loan - Amount: ${amount}`);
        try {
            const payload = { amount };
            console.log(`💳 CommercialBankAPI: Sending POST to ${this.apiUrl}/loan with payload:`, payload);
            const response = await axiosInstance.post(`${this.apiUrl}/loan`, payload);
            console.log(`✅ CommercialBankAPI: Loan application success! Response:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`❌ CommercialBankAPI: Loan application failed:`, error.response?.data || error.message);
            console.error(`❌ CommercialBankAPI: Status:`, error.response?.status);
            return { success: false, loan_number: "" };
        }
    }

    static async getLoanInfo(loanNumber: string): Promise<{ outstandingAmount: number }> {
        console.log(`📋 CommercialBankAPI: Getting loan info for loan: ${loanNumber}`);
        try {
            console.log(`📋 CommercialBankAPI: Sending GET to ${this.apiUrl}/loan/${loanNumber}`);
            const response = await axiosInstance.get(`${this.apiUrl}/loan/${loanNumber}`);
            console.log(`✅ CommercialBankAPI: Loan info retrieved! Response:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`❌ CommercialBankAPI: Failed to get loan info:`, error.response?.data || error.message);
            console.error(`❌ CommercialBankAPI: Status:`, error.response?.status);
            return { outstandingAmount: 0 };
        }
    }

    static async repayLoan(loan_number: string, amount: number): Promise<{ success: boolean, paid: number }> {
        console.log(`💸 CommercialBankAPI: Repaying loan - Loan: ${loan_number}, Amount: ${amount}`);
        try {
            const payload = { amount };
            console.log(`💸 CommercialBankAPI: Sending POST to ${this.apiUrl}/loan/${loan_number}/pay with payload:`, payload);
            const response = await axiosInstance.post(`${this.apiUrl}/loan/${loan_number}/pay`, payload);
            console.log(`✅ CommercialBankAPI: Loan repayment success! Response:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`❌ CommercialBankAPI: Loan repayment failed:`, error.response?.data || error.message);
            console.error(`❌ CommercialBankAPI: Status:`, error.response?.status);
            return { success: false, paid: 0 };
        }
    }
}

export class RetailBankAPI {
    static apiUrl = getApiUrl('https://api.miniconomyretail.za.bz', '/retail-bank/api', 'USE_TEST_RETAIL_BANK');

    static async requestPayment(from: string, to: string, amountCents: number, reference: number) {
        console.log(`🏪 RetailBankAPI: Requesting payment - From: ${from}, To: ${to}, Amount: ${amountCents} cents, Reference: ${reference}`);
        try {
            const payload = {
                from,
                to,
                AmountCents: amountCents,
                reference
            };
            console.log(`🏪 RetailBankAPI: Sending POST to ${this.apiUrl}/transfers with payload:`, payload);

            const response = await axiosInstance.post(`${this.apiUrl}/transfers`, payload);

            console.log(`🏪 RetailBankAPI: Transfer response - Status: ${response.status}, Data:`, response.data);

            if (response.status !== 200) {
                console.log(`⚠️ RetailBankAPI: Payment failed - Not enough money`);
                return { success: false, message: "Not enough money"}
            }
            
            console.log(`✅ RetailBankAPI: Payment successful!`);
            return {
                success: true,
            };
        } catch (error: any) {
            console.error(`❌ RetailBankAPI: Payment error:`, error.response?.data || error.message);
            console.error(`❌ RetailBankAPI: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }
}

export class CaseSuppliers {
    static apiUrl = getApiUrl('https://bbd-grad-program-2025.online/api', '/case-suppliers/api', 'USE_TEST_CASE_SUPPLIERS');

    static async getCasesCost(): Promise<{success: boolean, cost?: number, message?: string}> {
        console.log(`📱 CaseSuppliers: Getting cases cost`);
        try {
            console.log(`📱 CaseSuppliers: Sending GET to ${this.apiUrl}/cases`);
            const response = await axiosInstance.get(`${this.apiUrl}/cases`);

            console.log(`📱 CaseSuppliers: Raw response:`, response.data);
            const raw: {available_units: number, price_per_unit: number} = response.data;
            const result = {
                success: true,
                cost: raw.price_per_unit
            };
            console.log(`✅ CaseSuppliers: Cost retrieved successfully:`, result);
            return result;
        } catch (error: any) {
            console.error(`❌ CaseSuppliers: Failed to get cases cost:`, error.response?.data || error.message);
            console.error(`❌ CaseSuppliers: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async purchaseCases(quantity: number): Promise<PartsPurchaseResponse> {
        console.log(`🛒 CaseSuppliers: Purchasing cases - Quantity: ${quantity}`);
        try {
            const payload = { quantity };
            console.log(`🛒 CaseSuppliers: Sending POST to ${this.apiUrl}/orders with payload:`, payload);
            const response = await axiosInstance.post(`${this.apiUrl}/orders`, payload);

            console.log(`🛒 CaseSuppliers: Raw purchase response:`, response.data);
            const raw: PurchaseCasesResponse = response.data;
            const result = {
                success: true,
                accountNumber: raw.account_number,
                cost: raw.total_price,
                referenceNumber: raw.id
            };
            console.log(`✅ CaseSuppliers: Purchase successful:`, result);
            return result;
        } catch (error: any) {
            console.error(`❌ CaseSuppliers: Purchase failed:`, error.response?.data || error.message);
            console.error(`❌ CaseSuppliers: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async getOrderStatus(orderId: number): Promise<{ success: boolean; status?: string; order?: any; message?: string }> {
        console.log(`📦 CaseSuppliers: Checking status of order ID: ${orderId}`);
        try {
            const url = `${this.apiUrl}/orders/${orderId}`;
            console.log(`📦 CaseSuppliers: Sending GET to ${url}`);

            const response = await axiosInstance.get(url);

            // Assuming the response conforms to the GetCaseOrderResponse schema
            const order = response.data;
            console.log(`✅ CaseSuppliers: Order retrieved successfully:`, order);

            return {
            success: true,
            status: order.status,  // adjust this key if the actual field differs
            order,
            };
        } catch (error: any) {
            console.error(`❌ CaseSuppliers: Failed to get status:`, error.response?.data || error.message);
            console.error(`❌ CaseSuppliers: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }
}


export class ScreenSuppliers {
    static apiUrl = getApiUrl('https://todosecuritylevelup.com', '/screen-suppliers/api', 'USE_TEST_SCREEN_SUPPLIERS');

    static async getScreensCost(): Promise<{success: boolean, cost?: number, message?: string}> {
        console.log(`📺 ScreenSuppliers: Getting screens cost`);
        try {
            console.log(`📺 ScreenSuppliers: Sending GET to ${this.apiUrl}/screens`);
            const response = await axiosInstance.get(`${this.apiUrl}/screens`);

            console.log(`📺 ScreenSuppliers: Raw response:`, response.data);
            const raw: {screens: {quantity: number, price: number}} = response.data;
            const result = {
                success: true,
                cost: raw.screens.price
            };
            console.log(`✅ ScreenSuppliers: Cost retrieved successfully:`, result);
            return result;
        } catch (error: any) {
            console.error(`❌ ScreenSuppliers: Failed to get screens cost:`, error.response?.data || error.message);
            console.error(`❌ ScreenSuppliers: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async purchaseScreens(quantity: number): Promise<PartsPurchaseResponse> {
        console.log(`🛒 ScreenSuppliers: Purchasing screens - Quantity: ${quantity}`);
        try {
            const payload = { quantity };
            console.log(`🛒 ScreenSuppliers: Sending POST to ${this.apiUrl}/order with payload:`, payload);
            const response = await axiosInstance.post(`${this.apiUrl}/order`, payload);

            console.log(`🛒 ScreenSuppliers: Raw purchase response:`, response.data);
            const raw: PurchaseScreensResponse = response.data;
            const result = {
                success: true,
                referenceNumber: raw.orderId,
                cost: raw.totalPrice,
                accountNumber: raw.bankAccountNumber
            };
            console.log(`✅ ScreenSuppliers: Purchase successful:`, result);
            return result;
        } catch (error: any) {
            console.error(`❌ ScreenSuppliers: Purchase failed:`, error.response?.data || error.message);
            console.error(`❌ ScreenSuppliers: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }
}



export class ElectronicsSuppliers {
    static apiUrl = getApiUrl('https://electronics-supplier.tevlen.co.za', '/electronics-suppliers/api', 'USE_TEST_ELECTRONICS_SUPPLIERS');

    static async getElectronicsCost(): Promise<{success: boolean, cost?: number, message?: string}> {
        console.log(`🔌 ElectronicsSuppliers: Getting electronics cost`);
        try {
            console.log(`🔌 ElectronicsSuppliers: Sending GET to ${this.apiUrl}/electronics`);
            const response = await axiosInstance.get(`${this.apiUrl}/electronics`);

            console.log(`🔌 ElectronicsSuppliers: Raw response:`, response.data);
            const raw: {availableStock: number, pricePerUnit: number} = response.data;
            const result = {
                success: true,
                cost: raw.pricePerUnit
            };
            console.log(`✅ ElectronicsSuppliers: Cost retrieved successfully:`, result);
            return result;
        } catch (error: any) {
            console.error(`❌ ElectronicsSuppliers: Failed to get electronics cost:`, error.response?.data || error.message);
            console.error(`❌ ElectronicsSuppliers: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async purchaseElectronics(quantity: number): Promise<PartsPurchaseResponse> {
        console.log(`🛒 ElectronicsSuppliers: Purchasing electronics - Quantity: ${quantity}`);
        try {
            const payload = { quantity };
            console.log(`🛒 ElectronicsSuppliers: Sending POST to ${this.apiUrl}/order with payload:`, payload);
            const response = await axiosInstance.post(`${this.apiUrl}/orders`, payload);

            console.log(`🛒 ElectronicsSuppliers: Raw purchase response:`, response.data);
            const raw: PurchaseElectronicsResponse = response.data;
            const result = {
                success: true,
                referenceNumber: raw.orderId,
                cost: raw.amountDue,
                accountNumber: raw.bankNumber
            };
            console.log(`✅ ElectronicsSuppliers: Purchase successful:`, result);
            return result;
        } catch (error: any) {
            console.error(`❌ ElectronicsSuppliers: Purchase failed:`, error.response?.data || error.message);
            console.error(`❌ ElectronicsSuppliers: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }

    static async getElectronicsOrder(orderId: number): Promise<{
        success: boolean;
        status?: string;
        order?: any;
        message?: string;
        }> {
        console.log(`🔌 ElectronicsSuppliers: Fetching electronics order with ID: ${orderId}`);

        try {
            const url = `${this.apiUrl}/orders/${orderId}`;
            console.log(`🔌 ElectronicsSuppliers: Sending GET request to ${url}`);

            const response = await axiosInstance.get(url);
            const order = response.data;

            console.log(`✅ ElectronicsSuppliers: Electronics order retrieved:`, order);

            return {
            success: true,
            status: order.status,
            order,
            };
        } catch (error: any) {
            console.error(`❌ ElectronicsSuppliers: Failed to get status:`, error.response?.data || error.message);
            console.error(`❌ ElectronicsSuppliers: Status:`, error.response?.status);
            return { success: false, message: error.response?.statusText || error.message };
        }
    }
}



export class THOHAPI {
    static apiUrl = getApiUrl('https://ec2-13-244-65-62.af-south-1.compute.amazonaws.com', '/thoh/api', 'USE_TEST_THOH');

    static async purchaseMachine(machineName: string, quantity: number): Promise<MachinePurchaseResponse> {
        console.log(`🏭 THOHAPI: Purchasing machine - Name: ${machineName}, Quantity: ${quantity}`);
        try {
            const payload = { machineName, quantity };
            console.log(`🏭 THOHAPI: Sending POST to ${this.apiUrl}/machines with payload:`, payload);
            const response = await axiosInstance.post(`${this.apiUrl}/machines`, payload);
            console.log(`✅ THOHAPI: Machine purchase successful! Response:`, response.data);
            return { success: true, ...response.data };
        } catch (error: any) {
            console.error(`❌ THOHAPI: Machine purchase failed:`, error.response?.data || error.message);
            console.error(`❌ THOHAPI: Status:`, error.response?.status);
            throw new Error("Machine purchase failed");
        }
    }

    static async getAvailableMachines(): Promise<MachineInfo[]> {
        console.log(`🔍 THOHAPI: Getting available machines`);
        try {
            console.log(`🔍 THOHAPI: Sending GET to ${this.apiUrl}/machines`);
            const response = await axiosInstance.get(`${this.apiUrl}/machines`);
            console.log(`✅ THOHAPI: Available machines retrieved successfully:`, response.data);
            return response.data.machines;
        } catch (error: any) {
            console.error(`❌ THOHAPI: Failed to get available machines:`, error.response?.data || error.message);
            console.error(`❌ THOHAPI: Status:`, error.response?.status);
            throw new Error("Could not get list of machines");
        }
    }

    static async notifyDelivery(order: Order, orderItems: OrderItem[]) {
        console.log(`📨 THOHAPI: Notifying delivery for order ID: ${orderItems}`);
        try {
            const payload = {
                accountNumber: order.accountNumber,
                phoneName: orderItems.toString(),
                id: order.orderId,
                description: 'New phones.'};
            console.log(`📨 THOHAPI: Sending POST to ${this.apiUrl}/receive-phone with payload:`, payload);
            const response = await axiosInstance.post(`${this.apiUrl}/receive-phone`, payload);
            console.log(`✅ THOHAPI: Delivery notification successful! Response:`, response.data);
            return { success: true, response};
        } catch (error: any) {
            console.error(`❌ THOHAPI: Delivery notification failed:`, error.response?.data || error.message);
            console.error(`❌ THOHAPI: Status:`, error.response?.status);
            throw new Error("Failed to notify");
        } 
    }
}