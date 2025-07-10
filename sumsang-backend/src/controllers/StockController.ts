import { Request, Response } from 'express';
import { StockService } from '../services/StockService.js';
import {handleSuccess, handleFailure} from '../utils/handleResponses.js';

export class StockController {
    static async getStock(req: Request, res: Response): Promise<void> {
        console.log('===== StockController.getStock START =====');
        try {
            console.log('Getting stock data...');
            const stock = await StockService.getStock();
            console.log('Stock data retrieved:', stock);
            handleSuccess(res, stock);
        } catch (error) {
            console.log('Error getting stock:', error);
            handleFailure(res, error, 'Error fetching stock');
        }
        console.log('===== StockController.getStock END =====');
    }
}