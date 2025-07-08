import { BankService } from "./BankService.js";

export class LoanService {
    /**
     * Try to apply for a loan with fallback amounts if the initial amount is denied.
     * Returns the successful loan response or throws if all attempts fail.
     */
    static async applyWithFallback(
        primaryAmount: number,
        fallbackAmounts: number[] = [15_000_000, 10_000_000, 5_000_000]
    ): Promise<{ success: boolean; loan_number: string; amount: number }> {
        const tryAmounts = [primaryAmount, ...fallbackAmounts];

        for (const amount of tryAmounts) {
            const result = await BankService.applyForLoan(amount);
            if (result.success) {
                console.log(`Loan approved: D${amount}`);
                return { ...result, amount };
            } else {
                console.warn(`Loan denied for amount: D${amount}`);
            }
        }

        throw new Error("All loan attempts were denied. Simulation cannot proceed.");
    }
}