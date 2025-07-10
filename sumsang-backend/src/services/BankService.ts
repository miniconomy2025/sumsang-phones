import { json } from "stream/consumers";
import { LoanDetailsResponse } from "../types/ExternalApiTypes.js";
import { CommercialBankAPI } from "../utils/externalApis.js";

export class BankService {
    static DAILY_REPAYMENT_LIMIT = 50000;

    static async openAccount(): Promise<string> {
        console.log("BankService::openAccount - Starting account opening process");

        const response = await CommercialBankAPI.openAccount();
        console.log("BankService::openAccount - Received response from CommercialBankAPI:", response);

        if (!response.account_number) {
            console.log("BankService::openAccount - Account creation failed - no account number in response");
            throw new Error("Bank account creation failed.");
        }

        console.log("BankService::openAccount - Account created successfully:", response.account_number);
        return response.account_number;
    }

    static async applyForLoan(amount: number): Promise<{ success: boolean, loan_number: string }> {
        console.log("BankService::applyForLoan - Starting loan application for amount:", amount);

        const response = await CommercialBankAPI.applyForLoan(amount);
        console.log("BankService::applyForLoan - Received response from CommercialBankAPI:", response);

        if (!response.success) {
            console.log("BankService::applyForLoan - Loan application failed");
            throw new Error("Loan application failed.");
        }

        console.log("BankService::applyForLoan - Loan application successful:", response);
        return response;
    }

    static async makePayment(reference: number, amount: number, accountNumber: string) {
        console.log("BankService::makePayment - Starting payment process", { reference, amount, accountNumber });

        const result = await CommercialBankAPI.makePayment(String(reference), amount, accountNumber);
        console.log("BankService::makePayment - Received result from CommercialBankAPI:", result);

        if (!result.success) {
            console.log("BankService::makePayment - Payment failed:", result.message);
            throw new Error(`Payment failed: ${result.message}`);
        }

        console.log("BankService::makePayment - Payment successful:", result);
        return result;
    }

    static async makeLoanRepayment(loan_number: string): Promise<number> {
        console.log("BankService::makeLoanRepayment - Starting loan repayment for loan:", loan_number);

        const loanInfo = await CommercialBankAPI.getLoanInfo(loan_number);
        console.log("BankService::makeLoanRepayment - Retrieved loan info:", loanInfo);

        if (!loanInfo || loanInfo.outstanding < 0) {
            console.log("BankService::makeLoanRepayment - Invalid loan info or no outstanding amount");
            return 0;
        }

        const paymentAmount = Math.min(this.DAILY_REPAYMENT_LIMIT, loanInfo.outstanding);
        console.log("BankService::makeLoanRepayment - Calculated payment amount:", paymentAmount);

        const response = await CommercialBankAPI.repayLoan(loan_number, paymentAmount);
        console.log("BankService::makeLoanRepayment - Received repayment response:", response);

        if (!response.success) {
            console.log("BankService::makeLoanRepayment - Loan payment failed");
            throw new Error("Loan payment failed");
        }

        console.log("BankService::makeLoanRepayment - Loan payment successful, amount paid:", response.paid);
        return response.paid;
    }

    static async getBalance(): Promise<number> {
        const response = await CommercialBankAPI.getBalance();

        return response.balance;
    }

    static async getLoanInfo(loanNumber: string): Promise<LoanDetailsResponse> {
        const response = await CommercialBankAPI.getLoanInfo(loanNumber);

        if (!response) {
            console.log("Could not get loan details from API")
        }
        return response
    }
}