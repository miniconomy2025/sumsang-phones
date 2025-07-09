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
    const logPrefix = '[SystemSettings] checkAndUpdateDay →';

    console.log(`${logPrefix} Starting simulation day check at ${new Date().toISOString()}`);

    const start = Date.now();

    const [startEpochSetting, currentDaySetting] = await Promise.all([
        this.getByKey(systemSettingKeys.startEpoch),
        this.getByKey(systemSettingKeys.currentDay),
    ]);

    console.log(`${logPrefix} Retrieved settings:`, {
        startEpochSetting,
        currentDaySetting,
    });

    if (!startEpochSetting?.value || !currentDaySetting?.value) {
        console.error(`${logPrefix} Missing required system settings`, {
				hasStartEpoch: Boolean(startEpochSetting?.value),
				hasCurrentDay: Boolean(currentDaySetting?.value),
			});
			throw new Error(`${logPrefix} Missing startEpoch or currentDay`);
		}

		const startEpoch = Number(startEpochSetting.value);
		const currentDay = Number(currentDaySetting.value);

		console.log(`${logPrefix} Parsed settings:`, {
			startEpoch,
			currentDay,
			typeStartEpoch: typeof startEpoch,
			typeCurrentDay: typeof currentDay,
		});

		if (isNaN(startEpoch) || isNaN(currentDay)) {
			console.error(`${logPrefix} Invalid numeric conversion`, {
				startEpochRaw: startEpochSetting.value,
				currentDayRaw: currentDaySetting.value,
			});
			throw new Error(`${logPrefix} startEpoch or currentDay is not a valid number`);
		}

		const now = Date.now();
		const msPerDay = simulation.dayLengthMs;
		const elapsedMs = now - startEpoch;
		const daysSinceStart = Math.floor(elapsedMs / msPerDay) + 1;

		console.log(`${logPrefix} Time calculations:`, {
			now,
			nowReadable: new Date(now).toISOString(),
			startEpochReadable: new Date(startEpoch).toISOString(),
			elapsedMs,
			msPerDay,
			daysSinceStart,
			currentDay,
		});

		if (daysSinceStart > currentDay) {
			console.log(`${logPrefix} Detected day advancement:`, {
				previousDay: currentDay,
				newDay: daysSinceStart,
			});

			await this.updateByKey(systemSettingKeys.currentDay, daysSinceStart.toString());

			console.log(`${logPrefix} Updated currentDay setting successfully.`);
			
			const duration = Date.now() - start;
			console.log(`${logPrefix} Day update complete. Duration: ${duration}ms`);

			return true;
		}

		console.log(`${logPrefix} No update needed. Still on the same simulation day.`, {
			currentDay,
			daysSinceStart
		});

		const duration = Date.now() - start;
		console.log(`${logPrefix} Check complete. Duration: ${duration}ms`);

		return false;
	}

}
