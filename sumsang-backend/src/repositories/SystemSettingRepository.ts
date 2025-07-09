import db from '../config/DatabaseConfig.js';
import { simulation } from '../config/SimulationConfig.js';
import { systemSettingKeys } from '../constants/SystemSettingKeys.js';
import { SystemSetting } from '../types/SystemSettingType.js';

export class SystemSettingsRepository {
	static async getByKey(key: string): Promise<SystemSetting | null> {
		const result = await db.query(
			`SELECT system_setting_id, key, value FROM system_settings WHERE key = $1`,
			[key]
		);

		if (result.rows.length === 0) return null;

		const row = result.rows[0];
		return {
			systemSettingId: row.system_setting_id,
			key: row.key,
			value: row.value,
		};
	}

	static async insertByKey(key: string, value: string): Promise<void> {
		await db.query(`INSERT INTO system_settings (key, value) VALUES ($1, $2)`, [key, value]);
	}

	static async updateByKey(key: string, value: string): Promise<void> {
		await db.query(`UPDATE system_settings SET value = $1 WHERE key = $2`, [value, key]);
	}

	static async upsertByKey(key: string, value: string): Promise<void> {
		await db.query(
			`INSERT INTO system_settings (key, value)
			 VALUES ($1, $2)
			 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
			[key, value]
		);
	}

	static async checkAndUpdateDay(): Promise<boolean> {
		const [startEpochSetting, currentDaySetting] = await Promise.all([
			this.getByKey(systemSettingKeys.startEpoch),
			this.getByKey(systemSettingKeys.currentDay),
		]);

		if (!startEpochSetting || !currentDaySetting) {
			throw new Error('startEpoch or currentDay is missing from system_settings');
		}

		const startEpoch = Number(startEpochSetting.value);
		const currentDay = Number(currentDaySetting.value);
		const now = Date.now();

		const msPerDay = simulation.dayLengthMs;
		const daysSinceStart = Math.floor((now - startEpoch) / msPerDay) + 1;

		if (daysSinceStart > currentDay) {
			await this.updateByKey('currentDay', daysSinceStart.toString());
			return true;
		}

		return false;
	}
}
