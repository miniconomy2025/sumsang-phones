import { SystemSettingsRepository } from "../repositories/SystemSettingRepository.js";
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
        console.log("LoanService::applyWithFallback - Starting loan application with fallback", { primaryAmount, fallbackAmounts });

        const tryAmounts = [primaryAmount, ...fallbackAmounts];
        console.log("LoanService::applyWithFallback - Will try amounts in order:", tryAmounts);

        for (const amount of tryAmounts) {
            console.log("LoanService::applyWithFallback - Attempting loan application for amount:", amount);

            try {
                const result = await BankService.applyForLoan(amount);
                console.log("LoanService::applyWithFallback - Loan application result:", result);

                if (result.success) {
                    console.log("LoanService::applyWithFallback - Loan approved for amount:", amount);
                    return { ...result, amount };
                }
            } catch (error) {
                console.log("LoanService::applyWithFallback - Loan application failed for amount:", amount, "Error:", error);
            }
        }

        console.log("LoanService::applyWithFallback - All loan attempts failed");
        throw new Error("All loan attempts were denied. Simulation cannot proceed.");
    }

    static async maybeApplyForLoan(): Promise<void> {
        const accountBalance = await BankService.getBalance();
        const MIN_BALANCE_THRESHOLD = 1_000_000;
        const MAX_LOAN_THRESHOLD = 10_000_000;

        if (accountBalance >= MIN_BALANCE_THRESHOLD) {
            // Finances are good; no loan needed
            return;
        }

        const loanNumberSetting = await SystemSettingsRepository.getByKey("loan_number");

        if (!loanNumberSetting) {
            console.warn("[Bank] No loan number found in system settings.");
            return;
        }

        const { outstanding } = await BankService.getLoanInfo(loanNumberSetting.value);

        if (outstanding >= MAX_LOAN_THRESHOLD) {
            console.log("[Bank] Loan balance too high — not applying for more.");
            return;
        }

        const estimatedNeed = 50000; // can be made dynamic
        const loanResult = await BankService.applyForLoan(estimatedNeed);

        if (loanResult.success) {
            console.log(`[Bank] Successfully applied for loan: D${estimatedNeed}`);
        } else {
            console.warn(`[Bank] Loan application denied.`);
        }
    }
}