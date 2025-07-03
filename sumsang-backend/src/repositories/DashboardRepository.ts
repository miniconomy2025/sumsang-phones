import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';


export class DashboardRepository {
    static async getSupplyChain() {
        try {
            //TO DO: Write queries

        } catch (error) {
            throw new DatabaseError(`Failed to get supply chain information: ${(error as Error).message}`);
        }
    }

       static async getSales() {
        try {
            //TO DO: Write queries

        } catch (error) {
            throw new DatabaseError(`Failed to get sales information: ${(error as Error).message}`);
        }
    }

    static async getFinancials() {
        try {
            //TO DO: Write queries

        } catch (error) {
            throw new DatabaseError(`Failed to get financial information: ${(error as Error).message}`);
        }
    }

    static async getLogistics() {
        try {
            //TO DO: Write queries

        } catch (error) {
            throw new DatabaseError(`Failed to get logistic information: ${(error as Error).message}`);
        }
    }

    static async getNotices() {
        try {
            //TO DO: Write queries

        } catch (error) {
            throw new DatabaseError(`Failed to get notice information: ${(error as Error).message}`);
        }
    }
}