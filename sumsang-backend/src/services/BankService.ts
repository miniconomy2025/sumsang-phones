import { CommercialBankAPI } from "../utils/externalApis.js";

export class BankService {
    static DAILY_REPAYMENT_LIMIT = 50000;

    static async openAccount(): Promise<string> {
        const response = await CommercialBankAPI.openAccount();
        if (!response.account_number) {
            throw new Error("Bank account creation failed.");
        }
        return response.account_number;
    }

    static async applyForLoan(amount: number): Promise<{ success: boolean, loan_number: string }> {
        const response = await CommercialBankAPI.applyForLoan(amount);
        if (!response.success) {
            throw new Error("Loan application failed.");
        }
        return response;
    }

    static async makePayment(reference: number, amount: number, accountNumber: string) {
        const result = await CommercialBankAPI.makePayment(reference, amount, accountNumber);
        if (!result.success) {
            throw new Error(`Payment failed: ${result.message}`);
        }
        return result
    }

    static async makeLoanRepayment(loan_number: string): Promise<number> {
        const loanInfo = await CommercialBankAPI.getLoanInfo(loan_number);
        if (!loanInfo || loanInfo.outstandingAmount < 0) {
            return 0;
        }

        const paymentAmount = Math.min(this.DAILY_REPAYMENT_LIMIT, loanInfo.outstandingAmount)

        const response = await CommercialBankAPI.repayLoan(loan_number, paymentAmount);
        if (!response.success) {
            throw new Error("Loan payment failed");
        }
        return response.paid
    }
}