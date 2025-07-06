import db from "../../config/DatabaseConfig.js"

export class PartService {
    static async getPartIdByName(name: string): Promise<number> {
        const partResult = await db.query(`
            SELECT part_id FROM parts
            WHERE name = $1
            LIMIT 1`, [name]);

        const partId = partResult.rows[0]?.part_id;

        if (!partId) {
            throw new Error(`Part with name '${name}' not found.`)
        }

        return partId;
    }

    static async getCostForPart(partId: number): Promise<number> {
        const partResult = await db.query(`
            SELECT ps.cost FROM parts p
            INNER JOIN parts_supplier ps on ps.part_id = p.part_id
            WHERE p.part_id = $1
            LIMIT 1`, [partId])

        const cost = partResult.rows[0]?.cost

        if (cost === null) {
            throw new Error(`No cost found for part_id ${partId}`)
        }
        return cost;
    }

    // static async getReferenceNoById(partId)
}