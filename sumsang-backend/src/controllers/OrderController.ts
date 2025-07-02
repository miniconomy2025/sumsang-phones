import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService.js';
import {handleSuccess, handleFailure} from '../utils/handleResponses.js';
import { BadRequestError } from '../utils/errors.js';

export class OrderController {
    static async placeOrder(req: Request, res: Response): Promise<void> {
        try {
            const { items } = req.body;

            // Basic validation
            if (!Array.isArray(items) || items.length === 0) {
                throw new BadRequestError('Missing or invalid order data');
            }

            // Validate each item in items array
            const invalidItems = items.some(item =>
                typeof item !== 'object' ||
                typeof item.phoneId !== 'number' ||
                typeof item.quantity !== 'number' ||
                item.quantity <= 0
            );

            if (invalidItems) {
                throw new BadRequestError('Invalid items format. Each item must have a numeric phoneId and a positive quantity.'); 
            }

            const order = await OrderService.placeOrder(items);
            handleSuccess(res, order);
        }
        catch (error) {
            handleFailure(res, error, 'Error placing order');
        }
    }
}