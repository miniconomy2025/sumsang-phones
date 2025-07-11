import db from '../config/DatabaseConfig.js';
import { DatabaseError } from '../utils/errors.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { systemSettingKeys } from '../constants/SystemSettingKeys.js';

export class DashboardRepository {
    static async getSupplyChain() {
        try {
            const currentPartsInventory = await this.fetchCurrentPartsInventory();
            const currentPhonesInventory = await this.fetchCurrentPhonesInventory();
            const partCostsOverTime = await this.fetchPartCostsOverTime();

            return {
                currentPartsInventory,
                currentPhonesInventory,
                partCostsOverTime
            };
        } catch (error) {
            throw new DatabaseError(`Failed to get supply chain information: ${(error as Error).message}`);
        }
    }

    static async getSales() {
        try {
            const totalPhonesSold = await this.fetchTotalPhonesSold();
            const phoneModelRevenue = await this.fetchRevenuePerModel();

            return {
                toalPhonesSold: totalPhonesSold,
                phoneModelRevenue
            };
        } catch (error) {
            throw new DatabaseError(`Failed to get sales information: ${(error as Error).message}`);
        }
    }

    static async getFinancials() {
        try {
            const logisticsCosts = await this.fetchLogisticsCosts();
            const manufacturingCost = await this.fetchPartsCosts();
            const equipmentCost = await this.fetchMachineCosts();
            const costPricePerModel = await this.fetchCostPerModel();
            const sellingPricePerModel = await this.fetchSellingPricePerModel();
            const totalRevenue = await this.fetchTotalRevenue();
            const loanStatus = await this.fetchLoanStatus();

            const totalExpenses = { manufacturing: manufacturingCost, logistics: logisticsCosts, equipment: equipmentCost };
            const netProfit = totalRevenue - (manufacturingCost + logisticsCosts + equipmentCost);

            const costVsSellingPrice: Record<string, { costPerUnit: number, sellingPricePerUnit: number }> = {};
            for (const costRow of costPricePerModel) {
                const model = costRow.phone_model;
                const costPerUnit = Number(costRow.cost_per_phone);
                const sellRow = sellingPricePerModel.find(r => r.phone_model === model);
                const sellingPricePerUnit = sellRow ? Number(sellRow.selling_price) : 0;

                costVsSellingPrice[model] = { costPerUnit, sellingPricePerUnit };
            }

            return {
                totalRevenue,
                totalExpenses,
                netProfit,
                loanStatus,
                costVsSellingPrice
            };
        } catch (error) {
            throw new DatabaseError(`Failed to get financial information: ${(error as Error).message}`);
        }
    }

    static async getLogistics() {
        try {
            const bulkTransfersInRows = await this.fetchBulkTransfersIn();
            const consumerTransfersOutRows = await this.fetchConsumerTransfersOut();

            const allParts = [...new Set(bulkTransfersInRows.map(row => row.part_name.toLowerCase()))];
            const allPhoneModels = [...new Set(consumerTransfersOutRows.map(row => row.phone_model))];

            const allDates = [...new Set([
                ...bulkTransfersInRows.map(row => row.delivery_date),
                ...consumerTransfersOutRows.map(row => row.delivery_date)
            ])].sort();

            const bulkTransfersInMap: Record<string, any> = {};
            for (const row of bulkTransfersInRows) {
                const date = row.delivery_date;
                const partName = row.part_name.toLowerCase();
                if (!bulkTransfersInMap[date]) bulkTransfersInMap[date] = {};
                bulkTransfersInMap[date][partName] = {
                    volumeMoved: Number(row.total_quantity_received),
                    cost: Number(row.allocated_delivery_cost)
                };
            }

            const consumerTransfersOutMap: Record<string, any> = {};
            for (const row of consumerTransfersOutRows) {
                const date = row.delivery_date;
                const phoneModel = row.phone_model;
                if (!consumerTransfersOutMap[date]) consumerTransfersOutMap[date] = {};
                consumerTransfersOutMap[date][phoneModel] = {
                    phonesDelivered: Number(row.phones_delivered),
                    cost: Number(row.total_delivery_cost)
                };
            }

            const bulkTransfersIn = allDates.map(date => {
                const dateFormatted = new Date(date).toISOString().split('T')[0];
                const dayData: any = { date: dateFormatted };
                
                for (const part of allParts) {
                    dayData[part] = bulkTransfersInMap[date]?.[part] || {
                        volumeMoved: 0,
                        cost: 0
                    };
                }
                
                return dayData;
            });

            const consumerTransfersOut = allDates.map(date => {
                const dateFormatted = new Date(date).toISOString().split('T')[0];
                const dayData: any = { date: dateFormatted };
                
                for (const model of allPhoneModels) {
                    dayData[model] = consumerTransfersOutMap[date]?.[model] || {
                        phonesDelivered: 0,
                        cost: 0
                    };
                }
                
                return dayData;
            });

            return {
                bulkTransfersIn,
                consumerTransfersOut
            };
        } catch (error) {
            throw new DatabaseError(`Failed to get logistic information: ${(error as Error).message}`);
        }
    }

    static async getProductionStats() {
        try {
            const totalProducedRows = await this.fetchPhonesProduced();

            const totalPhonesProduced: Record<string, number> = {};
            for (const row of totalProducedRows) {
                const model = row.phone_model;
                const produced = Number(row.total_produced);
                totalPhonesProduced[model] = (totalPhonesProduced[model] || 0) + produced;
            }

            const productionCapacityRows = await this.fetchPhonesProducedPerDay();
            const productionCapacity: Record<string, { date: string; value: number }[]> = {};

            for (const row of productionCapacityRows) {
                const model = row.phone_model;
                if (!productionCapacity[model]) {
                    productionCapacity[model] = [];
                }
                const rawDate = row.production_date;
                const formattedDate = new Date(rawDate).toISOString().split('T')[0];
                productionCapacity[model].push({
                    date: formattedDate,
                    value: Number(row.produced_on_date)
                });
            }


            const partCostsRows = await this.fetchPartCostPerModel();
            const totalManufacturingCosts: Record<string, Record<string, number>> = {};

            for (const row of partCostsRows) {
                const model = row.phone_model;
                const partName = row.part_name;
                const cost = Number(row.total_part_cost);

                if (!totalManufacturingCosts[model]) {
                    totalManufacturingCosts[model] = {};
                }
                totalManufacturingCosts[model][partName] = cost;
            }

            return {
                totalPhonesProduced,
                productionCapacity,
                totalManufacturingCosts
            };

        } catch (error) {
            throw new DatabaseError(`Failed to get production information: ${(error as Error).message}`);
        }
    }

    // Helper functions to fetch data

    private static async fetchCurrentPartsInventory() {
        try {
            const res = await db.query(`
                SELECT p.name AS part_name, i.quantity_available
                FROM inventory i
                JOIN parts p ON i.part_id = p.part_id
                ORDER BY p.name;
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.part_name] = Number(row.quantity_available));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch current parts inventory: ${(error as Error).message}`);
        }
    }

    private static async fetchCurrentPhonesInventory() {
        try {
            const res = await db.query(`
                SELECT p.model, s.quantity_available
                FROM stock s
                JOIN phones p ON s.phone_id = p.phone_id
                ORDER BY p.model;
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.model] = Number(row.quantity_available));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch current phones inventory: ${(error as Error).message}`);
        }
    }

    private static async fetchPartCostsOverTime() {
        try {
            const startEpoch = await this.getStartingEpoch();
            const res = await db.query(`
            SELECT
                p.name AS part_name,
                TO_CHAR(($1::timestamp + pp.purchased_at * INTERVAL '1 day'), 'YYYY-MM-DD') AS purchase_date,
                ROUND(AVG(pp.cost/pp.quantity), 2) AS unit_price
            FROM parts_purchases pp
            JOIN parts p ON pp.part_id = p.part_id
            GROUP BY p.name, pp.purchased_at
            ORDER BY purchase_date, part_name;
        `, [startEpoch]);

            const result: Record<string, { date: string, value: number }[]> = {};
            for (const row of res.rows) {
                const part = row.part_name;
                if (!result[part]) result[part] = [];
                result[part].push({ date: row.purchase_date, value: Number(row.unit_price) });
            }
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch part costs over time: ${(error as Error).message}`);
        }
    }


    private static async fetchTotalPhonesSold() {
        try {
            const res = await db.query(`
                SELECT p.model, SUM(oi.quantity) AS totalPhonesSold
                FROM order_items oi
                JOIN phones p ON oi.phone_id = p.phone_id
                JOIN orders ord ON ord.order_id = oi.order_id
                WHERE ord.status != 7
                GROUP BY p.model;
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.model] = Number(row.totalphonessold));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch total phones sold: ${(error as Error).message}`);
        }
    }

    private static async fetchRevenuePerModel() {
        try {
            const res = await db.query(`
                SELECT p.model, SUM(oi.quantity * p.price) AS phoneModelRevenue
                FROM order_items oi
                JOIN phones p ON oi.phone_id = p.phone_id
                JOIN orders ord ON ord.order_id = oi.order_id
                WHERE ord.status != 7
                GROUP BY p.model;
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.model] = Number(row.phonemodelrevenue));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch revenue per model: ${(error as Error).message}`);
        }
    }

    private static async fetchLogisticsCosts() {
        try {
            const res = await db.query(`
                SELECT SUM(cost) AS total_cost
                FROM (
                    SELECT cost FROM consumer_deliveries
                    UNION ALL
                    SELECT cost FROM bulk_deliveries
                ) AS all_deliveries;
            `);
            return Number(res.rows[0]?.total_cost || 0);
        } catch (error) {
            throw new DatabaseError(`Failed to fetch logistics costs: ${(error as Error).message}`);
        }
    }

    private static async fetchPartsCosts() {
        try {
            const res = await db.query(`
                SELECT SUM(cost) AS total_parts_cost
                FROM parts_purchases;
            `);
            return Number(res.rows[0]?.total_parts_cost || 0);
        } catch (error) {
            throw new DatabaseError(`Failed to fetch parts costs: ${(error as Error).message}`);
        }
    }

    private static async fetchMachineCosts() {
        try {
            const res = await db.query(`SELECT SUM(cost) AS total_machine_cost FROM machines;`);
            return Number(res.rows[0]?.total_machine_cost || 0);
        } catch (error) {
            throw new DatabaseError(`Failed to fetch machine costs: ${(error as Error).message}`);
        }
    }

    private static async fetchCostPerModel() {
        try {
            const res = await db.query(`
                SELECT ph.model AS phone_model, 
                    SUM(s.cost) AS cost_per_phone
                FROM phones ph
                JOIN machines m ON ph.phone_id = m.phone_id
                JOIN machine_ratios mr ON m.machine_id = mr.machine_id
                JOIN suppliers s ON mr.part_id = s.part_id
                GROUP BY ph.model;
            `);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch cost per model: ${(error as Error).message}`);
        }
    }

    private static async fetchSellingPricePerModel() {
        try {
            const res = await db.query(`SELECT model AS phone_model, price AS selling_price FROM phones;`);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch selling price per model: ${(error as Error).message}`);
        }
    }

    private static async fetchTotalRevenue() {
        try {
            const res = await db.query(`SELECT SUM(amount_paid) AS total_revenue FROM orders;`);
            return Number(res.rows[0]?.total_revenue || 0);
        } catch (error) {
            throw new DatabaseError(`Failed to fetch total revenue: ${(error as Error).message}`);
        }
    }

    private static async fetchLoanStatus() {
        try {
            const res = await db.query(`
                SELECT key, value FROM system_settings
                WHERE key IN ('amountBorrowed','repaymentsMade');
            `);
            const result: Record<string, number> = {};
            res.rows.forEach(row => result[row.key] = Number(row.value));
            return result;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch loan status: ${(error as Error).message}`);
        }
    }

    private static async fetchBulkTransfersIn() {
        try {
            const startEpoch = await this.getStartingEpoch();
            const res = await db.query(`
            SELECT 
                p.name AS part_name,
                TO_CHAR(($1::timestamp + bd.date_created * INTERVAL '1 day'), 'YYYY-MM-DD') AS delivery_date,
                SUM(bd.units_received) AS total_quantity_received,
                SUM(bd.cost) AS allocated_delivery_cost
            FROM bulk_deliveries bd
            JOIN parts_purchases pp ON bd.parts_purchase_id = pp.parts_purchase_id
            JOIN parts p ON pp.part_id = p.part_id
            GROUP BY p.name, bd.date_created
            ORDER BY delivery_date, p.name;
        `, [startEpoch]);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch bulk transfers in: ${(error as Error).message}`);
        }
    }


    private static async fetchConsumerTransfersOut() {
        try {
            const startEpoch = await this.getStartingEpoch();
            const res = await db.query(`
            SELECT 
                p.model AS phone_model,
                TO_CHAR(($1::timestamp + cd.date_created * INTERVAL '1 day'), 'YYYY-MM-DD') AS delivery_date,
                SUM(oi.quantity) AS phones_delivered,
                SUM(cd.cost) AS total_delivery_cost
            FROM consumer_deliveries cd
            JOIN orders o ON cd.order_id = o.order_id
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN phones p ON oi.phone_id = p.phone_id
            GROUP BY p.model, cd.date_created
            ORDER BY delivery_date, p.model;
        `, [startEpoch]);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch consumer transfers out: ${(error as Error).message}`);
        }
    }



    private static async fetchPhonesProduced() {
        try {
            const res = await db.query(`
            SELECT 
                ph.model AS phone_model,
                SUM(s.quantity_available) AS total_produced
            FROM stock s
            JOIN phones ph ON s.phone_id = ph.phone_id
            GROUP BY ph.model
            ORDER BY ph.model;
        `, []);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch number of phones produced: ${(error as Error).message}`);
        }
    }


    private static async fetchPhonesProducedPerDay() {
        try {
            const startEpoch = await this.getStartingEpoch();
            const res = await db.query(`
            SELECT 
                ph.model AS phone_model,
                TO_CHAR(($1::timestamp + s.updated_at * INTERVAL '1 day'), 'YYYY-MM-DD') AS production_date,
                SUM(s.quantity_available + s.quantity_reserved) AS produced_on_date
            FROM stock s
            JOIN phones ph ON s.phone_id = ph.phone_id
            GROUP BY ph.model, s.updated_at
            ORDER BY production_date, ph.model;
        `, [startEpoch]);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch phones produced per day: ${(error as Error).message}`);
        }
    }


    private static async fetchPartCostPerModel() {
        try {
            const res = await db.query(`
                SELECT ph.model AS phone_model, pt.name AS part_name, SUM(oi.quantity * mr.quantity * s.cost) AS total_part_cost
                FROM order_items oi
                JOIN phones ph ON oi.phone_id = ph.phone_id
                JOIN machines m ON ph.phone_id = m.phone_id
                JOIN machine_ratios mr ON m.machine_id = mr.machine_id
                JOIN parts pt ON mr.part_id = pt.part_id
                JOIN suppliers s ON pt.part_id = s.part_id
                GROUP BY ph.model, pt.name
                ORDER BY ph.model, pt.name;
            `);
            return res.rows;
        } catch (error) {
            throw new DatabaseError(`Failed to fetch cost of components for phones produced: ${(error as Error).message}`);
        }
    }

    private static async getStartingEpoch(): Promise<string> {
        try {
            const DEFAULT_EPOCH_TIME = "1751987916074";
            const startEpochSetting = await SystemSettingsRepository.getByKey(systemSettingKeys.startEpoch);
            
            return startEpochSetting != null ? new Date(Number(startEpochSetting?.value)).toISOString() : new Date(Number(DEFAULT_EPOCH_TIME)).toISOString();
        } catch (error) {
            throw new DatabaseError(`Could not get starting epoch: ${(error as Error).message}`);
        }
    }
}
