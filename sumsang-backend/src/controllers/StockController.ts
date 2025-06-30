import { Request, Response } from 'express';
import { StockService } from '../services/StockService.js';
import {handleSuccess, handleFailure} from '../utils/handleResponses.js';

export class StockController {
    static async getStock(req: Request, res: Response): Promise<void> {
        try {
            const stock = await StockService.getStock();
            handleSuccess(res, stock);
        } catch (error) {
            handleFailure(res, error, 'Error fetching stock');
        }
    }
}