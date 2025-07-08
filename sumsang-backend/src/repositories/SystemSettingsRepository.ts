import db from "../config/DatabaseConfig.js";

export class SystemSettingsRepository {
    /**
     * Save or update a setting
     * @param key - setting key (e.g., "min_stock_days")
     * @param value - setting value (as string)
     */
    static async saveSetting(key: string, value: string): Promise<void> {
        await db.query(
            `
            INSERT INTO system_settings (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value
            `,
            [key, value]
        );
    }

    /**
     * Get a setting by key
     */
    static async getSetting(key: string): Promise<string | null> {
        const result = await db.query(
            `SELECT value FROM system_settings WHERE key = $1 LIMIT 1`,
            [key]
        );

        return result.rows.length > 0 ? result.rows[0].value : null;
    }
}
