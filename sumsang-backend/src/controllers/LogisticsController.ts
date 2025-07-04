import { Request, Response } from 'express';
import { LogisticsService } from '../services/LogisticsService.js';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { BadRequestError } from '../utils/errors.js';

export class LogisticsController {

    static async handleLogisticsRequest(req: Request, res: Response): Promise<void> {
        try {
            const { id, type, quantity } = req.body;

            if (id === undefined || type === undefined || quantity === undefined) {
                throw new BadRequestError('Request body must contain "id", "type", and "quantity".');
            }
            if (typeof id !== 'number' || typeof quantity !== 'number' || typeof type !== 'string') {
                throw new BadRequestError('Invalid data types for id, type, or quantity.');
            }
            
            const result = await LogisticsService.processLogisticsRequest(id, type as 'PICKUP' | 'DELIVERY', quantity);
            handleSuccess(res, result);
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error) {
                const appError = error as { statusCode: number; message: string; };
                res.status(appError.statusCode).json({ message: appError.message });
            }
            handleFailure(res, error, 'Error processing logistics request');
        }
    }

    static async handleConfirmation(req: Request, res: Response): Promise<void> {
        try {
            const { deliveryReference, type } = req.body;

            if (deliveryReference === undefined || type === undefined) {
                throw new BadRequestError('Request body must contain "deliveryReference" and "type".');
            }
            if (typeof deliveryReference !== 'number' || typeof type !== 'string') {
                throw new BadRequestError('"deliveryReference" must be a number and "type" must be a string.');
            }
            
            const result = await LogisticsService.processConfirmation(deliveryReference, type as 'DELIVERY' | 'PICKUP');
            handleSuccess(res, result);
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error) {
                const appError = error as { statusCode: number; message: string; };
                res.status(appError.statusCode).json({ message: appError.message });
            }
            handleFailure(res, error, 'Error processing logistics confirmation');
        }
    }
}