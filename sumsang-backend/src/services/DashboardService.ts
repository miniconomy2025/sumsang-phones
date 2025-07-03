import { DashboardRepository } from '../repositories/DashboardRepository.js';

export class DashboardService {
    static async getSupplyChain() {
        const supplyChainInfo = await DashboardRepository.getSupplyChain();
        return supplyChainInfo;
    }

    static async getSales() {
        const sales = await DashboardRepository.getSales();
        return sales;
    }

    static async getFinancials() {
        const sales = await DashboardRepository.getFinancials();
        return sales;
    }

    static async getLogistics() {
        const sales = await DashboardRepository.getLogistics();
        return sales;
    }

    static async getNotices() {
        const sales = await DashboardRepository.getNotices();
        return sales;
    }
}