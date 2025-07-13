import { DatabaseService } from '../services/DatabaseService.js';
import { BankService } from './BankService.js';
import { DailyTasksService } from './DailyTasks.js';
import { MachinePurchaseService } from './MachinePurchaseService.js';
import { THOHService } from './THOHService.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { PhoneRepository } from '../repositories/PhoneRepository.js';
import { LoanService } from './LoanService.js';
import { TickService } from './TickService.js';
import { systemSettingKeys } from '../constants/SystemSettingKeys.js';

export class SimulationService {
	static async orderInitialMachines(): Promise<void> {
		console.log('SimulationService::orderInitialMachines - Starting initial machine ordering');
		
		const totalCapital = this.loanAmount;
		console.log('SimulationService::orderInitialMachines - Total capital available', { totalCapital });

		const machineBudgetRatio = 0.5;
		const machineBudget = totalCapital * machineBudgetRatio;
		console.log('SimulationService::orderInitialMachines - Machine budget calculated', { machineBudgetRatio, machineBudget });

		const selectedModels = ['Cosmos Z25', 'Cosmos Z25 FE', 'Cosmos Z25 Ultra'];
		const perModelBudget = machineBudget / selectedModels.length;
		console.log('SimulationService::orderInitialMachines - Per model budget calculated', { selectedModels, perModelBudget });

		for (const model of selectedModels) {
			console.log('SimulationService::orderInitialMachines - Processing model', { model });
			
			const availableMachines = await THOHService.getAvailableMachines();
			console.log('SimulationService::orderInitialMachines - Retrieved available machines', { availableMachinesCount: availableMachines.length });
			
			let machineName = '';

			if (model === 'Cosmos Z25')
				machineName = 'cosmos_z25_machine';
			else if (model === 'Cosmos Z25 Ultra')
				machineName = 'cosmos_z25_ultra_machine';
			else if (model === 'Cosmos Z25 FE')
				machineName = 'cosmos_z25_fe_machine';
			
			console.log(`SimulationService::orderInitialMachines - Machine name: ${machineName} for phone model: ${model}`);

			const machine = availableMachines
				.find((m) => m.machineName.toLowerCase() === machineName.toLowerCase());

			console.log('SimulationService::orderInitialMachines - Found machine for model', { machine });

            if (!machine) {
                console.log('SimulationService::orderInitialMachines - Machine not found for model', { model });
                continue;
            }

			const units = Math.min(Math.floor(perModelBudget / machine.price), 10);
			console.log('SimulationService::orderInitialMachines - Calculated units to purchase', { units, machinePrice: machine.price });
			
			if (units <= 0) {
				console.log('SimulationService::orderInitialMachines - No units to purchase for model', { machineName });
				continue;
			}

			console.log('SimulationService::orderInitialMachines - Making machine purchase order', { machineName, units });
			await MachinePurchaseService.makeMachinePurchaseOrder(machineName, units);
			console.log('SimulationService::orderInitialMachines - Machine purchase order completed');
			
			console.log('SimulationService::orderInitialMachines - Processing pending machine purchases');
			await MachinePurchaseService.processPendingMachinePurchases();
			console.log('SimulationService::orderInitialMachines - Pending machine purchases processed');
		}
		
		console.log('SimulationService::orderInitialMachines - Initial machine ordering completed');
	}

	static loanAmount = 20_000_000;

	static async StartSimulation(startEpoch: string) {
		console.log('SimulationService::StartSimulation - Starting simulation', { startEpoch });
		
		console.log('SimulationService::StartSimulation - Resetting database');
		await DatabaseService.resetDatabase();
		console.log('SimulationService::StartSimulation - Database reset completed');

		if (process.env.USE_MANUAL_TICKS === 'true') {
			console.log('SimulationService::StartSimulation - Using test endpoints, setting up test mode');
			await SystemSettingsRepository.upsertByKey(
				systemSettingKeys.startEpoch,
				startEpoch
			);
			await SystemSettingsRepository.upsertByKey(systemSettingKeys.currentDay, '1');
			console.log('SimulationService::StartSimulation - Test mode settings saved');
		}
		else {
			console.log('SimulationService::StartSimulation - Starting tick service');
			await TickService.start(startEpoch);
			console.log('SimulationService::StartSimulation - Tick service started');
		}

		console.log('SimulationService::StartSimulation - Opening bank account');
		const accountNumber = await BankService.openAccount();
		console.log('SimulationService::StartSimulation - Bank account opened', { accountNumber });

		console.log('SimulationService::StartSimulation - Saving system settings (account number)');
		await SystemSettingsRepository.upsertByKey(systemSettingKeys.accountNumber, accountNumber);
		console.log('SimulationService::StartSimulation - System settings saved (account number)');

		console.log('SimulationService::StartSimulation - Applying for loan', { loanAmount: this.loanAmount });
		const { loan_number } = await LoanService.applyWithFallback(this.loanAmount);
		console.log('SimulationService::StartSimulation - Loan approved', { loan_number });
		
		console.log('SimulationService::StartSimulation - Saving system settings (loan number)');
		await SystemSettingsRepository.upsertByKey(systemSettingKeys.loanNumber, loan_number);
		console.log('SimulationService::StartSimulation - System settings saved (loan number)');

		console.log('SimulationService::StartSimulation - Making initial parts purchase orders');
		await DailyTasksService.makePartsPurchaseOrder(1, 1000);
		console.log('SimulationService::StartSimulation - Parts purchase order 1 completed');
		
		await DailyTasksService.makePartsPurchaseOrder(2, 1000);
		console.log('SimulationService::StartSimulation - Parts purchase order 2 completed');
		
		await DailyTasksService.makePartsPurchaseOrder(3, 1000);
		console.log('SimulationService::StartSimulation - Parts purchase order 3 completed');
		
		console.log('SimulationService::StartSimulation - Processing pending parts purchases');
		await DailyTasksService.processPendingPartsPurchases();
		console.log('SimulationService::StartSimulation - Pending parts purchases processed');

		console.log('SimulationService::StartSimulation - Ordering initial machines');
		await this.orderInitialMachines();
		console.log('SimulationService::StartSimulation - Initial machines ordered');
		
		console.log('SimulationService::StartSimulation - Simulation startup completed');
	}
}