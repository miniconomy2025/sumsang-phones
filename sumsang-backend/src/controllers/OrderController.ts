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
            const accountNumber = '123456789012'
            handleSuccess(res, {...order, accountNumber});
        }
        catch (error) {
            handleFailure(res, error, 'Error placing order');
        }
    }

    static async paymentMade(req: Request, res: Response): Promise<void> {
        try {
            const { reference, amount } = req.body;

            if (typeof reference !== 'number' || typeof amount !== 'number' || amount <= 0) {
                throw new BadRequestError('Invalid payment data');
            }
            
            const order = await OrderService.getOrder(reference);

            await OrderService.processPayment(order, amount);

            handleSuccess(res, { message: 'Payment accepted' });
        } 
        catch (error) {
            handleFailure(res, error, 'Error processing payment');
        }
    }
}