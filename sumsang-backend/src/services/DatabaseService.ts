import db from "../config/DatabaseConfig.js";

export class DatabaseService {
    static async resetDatabase(): Promise<void> {
        console.log("DatabaseService::resetDatabase - Starting database reset");
        
        await db.query('CALL clear_all_except_status_and_phones();');
        
        console.log("DatabaseService::resetDatabase - Database reset completed");
    }
}