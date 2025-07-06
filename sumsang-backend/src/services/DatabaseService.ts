import db from "../config/DatabaseConfig.js";

export class DatabaseService {
    static async resetDatabase(): Promise<void> {
        const client = await db.connect();

        try {
            await client.query('CALL clear_all_expect_status_and_phones();');
        }
        finally {
            client.release();
        }
    }
}