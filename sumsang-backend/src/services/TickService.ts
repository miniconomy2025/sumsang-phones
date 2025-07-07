import { simulation } from '../config/SimulationConfig.js';
import { systemSettingKeys } from '../constants/SystemSettingKeys.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { DailyTasksService } from './DailyTasks.js';

export class TickService {
	private static tickInterval: ReturnType<typeof setInterval> | null = null;
	private static intervalMs: number = simulation.dayCheckIntervalMs;

	static async start(): Promise<void> {
		await SystemSettingsRepository.upsertByKey(
			systemSettingKeys.startEpoch,
			Date.now().toString()
		);
		await SystemSettingsRepository.upsertByKey(systemSettingKeys.currentDay, '1');

		if (this.tickInterval) clearInterval(this.tickInterval);

		this.tickInterval = setInterval(() => {
			(async () => {
				const isNextDay: boolean = await SystemSettingsRepository.checkAndUpdateDay();
				if (isNextDay) {
					DailyTasksService.executeDailyTasks();
				}
			})().catch(console.error);
		}, this.intervalMs);
	}

	static stop(): void {
		if (this.tickInterval) {
			clearInterval(this.tickInterval);
			this.tickInterval = null;
		}
	}
}
