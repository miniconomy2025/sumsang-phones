import db from "../config/DatabaseConfig.js";

export class DatabaseService {
    static async resetDatabase(): Promise<void> {
        await db.query('CALL clear_all_expect_status_and_phones();');
    }
}