import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService.js';
import {handleSuccess, handleFailure} from '../utils/handleResponses.js';

export class DashboardController {
    static async getSupplyChain(req: Request, res: Response): Promise<void> {
        try {
            
            const supplyChain = await DashboardService.getSupplyChain();
            handleSuccess(res, supplyChain);
        } catch (error) {
            handleFailure(res, error, 'Could not get supply chain information');
        }
    }

       static async getSales(req: Request, res: Response): Promise<void> {
        try {
            
            const salesData = await DashboardService.getSales();
            handleSuccess(res, salesData);
        } catch (error) {
            handleFailure(res, error, 'Could not get sales information');
        }
    }

    static async getFinancials(req: Request, res: Response): Promise<void> {
        try {
            
            const financialData = await DashboardService.getFinancials();
            handleSuccess(res, financialData);
        } catch (error) {
            handleFailure(res, error, 'Could not get financial information');
        }
    }

    static async getLogistics(req: Request, res: Response): Promise<void> {
        try {
            
            const logisticsData = await DashboardService.getLogistics();
            handleSuccess(res, logisticsData);
        } catch (error) {
            handleFailure(res, error, 'Could not get logistics information');
        }
    }

    static async getStockStats(req: Request, res: Response): Promise<void> {
        try {
            
            const noticeData = await DashboardService.getStockStats();
            handleSuccess(res, noticeData);
        } catch (error) {
            handleFailure(res, error, 'Could not get stock information');
        }
    }
}