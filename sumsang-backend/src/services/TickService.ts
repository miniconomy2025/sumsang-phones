import { simulation } from '../config/SimulationConfig.js';
import { systemSettingKeys } from '../constants/SystemSettingKeys.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { DailyTasksService } from './DailyTasks.js';

export class TickService {
	private static tickInterval: ReturnType<typeof setInterval> | null = null;
	private static intervalMs: number = simulation.dayCheckIntervalMs;

	static async start(startEpoch: string): Promise<void> {
		console.log('TickService::start - Starting tick service', { startEpoch });
		
		console.log('TickService::start - Setting up system settings');
		await SystemSettingsRepository.upsertByKey(
			systemSettingKeys.startEpoch,
			startEpoch
		);
		await SystemSettingsRepository.upsertByKey(systemSettingKeys.currentDay, '1');
		console.log('TickService::start - System settings configured');

		if (this.tickInterval) {
			console.log('TickService::start - Clearing existing tick interval');
			clearInterval(this.tickInterval);
		}

		console.log('TickService::start - Setting up tick interval', { intervalMs: this.intervalMs });
		this.tickInterval = setInterval(() => {
			(async () => {
				console.log('TickService::start - Tick interval triggered');
				
				const isNextDay: boolean = await SystemSettingsRepository.checkAndUpdateDay();
				console.log('TickService::start - Checked if next day', { isNextDay });
				
				if (isNextDay) {
					console.log('TickService::start - Next day detected, executing daily tasks');
					await DailyTasksService.executeDailyTasks();
					console.log('TickService::start - Daily tasks executed');
				}
			})().catch((error) => {
				console.error('TickService::start - Error in tick interval', error);
			});
		}, this.intervalMs);
		
		console.log('TickService::start - Tick service started successfully');
	}

	static stop(): void {
		console.log('TickService::stop - Stopping tick service');
		
		if (this.tickInterval) {
			console.log('TickService::stop - Clearing tick interval');
			clearInterval(this.tickInterval);
			this.tickInterval = null;
			console.log('TickService::stop - Tick interval cleared');
		} else {
			console.log('TickService::stop - No tick interval to clear');
		}
		
		console.log('TickService::stop - Tick service stopped');
	}
}