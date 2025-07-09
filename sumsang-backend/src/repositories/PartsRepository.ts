import db from '../config/DatabaseConfig.js';

export class PartsRepository {
    static async getPartById(partId: number) {
        const result = await db.query(
            `SELECT part_id, name
            FROM parts
            WHERE part_id = $1`,
            [partId]
        );
        const row = result.rows[0];

        return {
            partId: row.part_id,
            name: row.name
        };
    }
}