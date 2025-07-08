import { DatabaseService } from '../services/DatabaseService.js';
import { AvailableMachineResponse } from '../types/ExternalApiTypes.js';
import { BankService } from './BankService.js';
import { DailyTasksService } from './DailyTasks.js';
import { MachinePurchaseService } from './MachinePurchaseService.js';
import { THOHService } from './THOHService.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { PhoneRepository } from '../repositories/PhoneRepository.js';
import { LoanService } from './LoanService.js';
import { TickService } from './TickService.js';

export class SimulationService {
    static loanAmount = 20_000_000;

    static async calculateMachineToOrder(): Promise<void> {
        const totalCapital = this.loanAmount;

        const machineBudgetRatio = 0.5;

        const machineBudget = totalCapital * machineBudgetRatio;

        const selectedModels = ["Cosmos Z25", "Cosmos Z25 FE", "Cosmos Z25 Ultra"];
        const perModelBudget = machineBudget / selectedModels.length;

        for (const model of selectedModels) {
            const availableMachines = await THOHService.getAvailableMachines();
            const machine = availableMachines
                .flatMap(m => m.machines)
                .find(m => m.machineName.toLowerCase() === model.toLowerCase());

            if (!machine) {
                console.log(`Machine for model '${model}' not available`);
                continue;
            }

            const units = Math.floor(perModelBudget / machine.price);
            if (units <= 0) continue;

            await MachinePurchaseService.makeMachinePurchaseOrder(model, units);
            await MachinePurchaseService.processPendingMachinePurchases();
        }
    }

    static async StartSimulation() {
        await DatabaseService.resetDatabase();

        const accountNumber = await BankService.openAccount();

        const { loan_number } = await LoanService.applyWithFallback(this.loanAmount);

        await DailyTasksService.makePartsPurchaseOrder(1, 250);
        await DailyTasksService.makePartsPurchaseOrder(2, 250);
        await DailyTasksService.makePartsPurchaseOrder(3, 250);
        await DailyTasksService.processPendingPartsPurchases()

        await this.calculateMachineToOrder();

        await SystemSettingsRepository.upsertByKey("account_number", accountNumber);
        await SystemSettingsRepository.upsertByKey("loan_number", loan_number);

        await TickService.start(2524684100);
    }
}