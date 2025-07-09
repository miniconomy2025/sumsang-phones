import db from "../config/DatabaseConfig.js";

export class DatabaseService {
    static async resetDatabase(): Promise<void> {
        await db.query('CALL clear_all_except_status_and_phones();');
    }
}