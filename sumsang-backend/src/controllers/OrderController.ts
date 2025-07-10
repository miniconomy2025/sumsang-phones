import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService.js';
import {handleSuccess, handleFailure} from '../utils/handleResponses.js';
import { BadRequestError } from '../utils/errors.js';

export class OrderController {
    static async placeOrder(req: Request, res: Response): Promise<void> {
        console.log('===== OrderController.placeOrder START =====');
        try {
            console.log('Request body:', req.body);
            const items = req.body.items;
            const customerAccountNumber = req.body.account_number;
            console.log('account_number', customerAccountNumber);
            console.log('Items:', items);

            // Basic validation
            if (!Array.isArray(items) || items.length === 0 || !customerAccountNumber || typeof customerAccountNumber !== 'string') {
                console.log('Invalid items array:', items);
                throw new BadRequestError('Missing or invalid order data');
            }

            // Validate each item in items array
            const invalidItems = items.some(item => {
                console.log('Validating item:', item);
                const isValid = typeof item === 'object' &&
                    typeof item.phoneId === 'number' &&
                    typeof item.quantity === 'number' &&
                    item.quantity > 0;
                console.log('Item validation result:', isValid);
                return !isValid;
            });

            if (invalidItems) {
                console.log('Found invalid items');
                throw new BadRequestError('Invalid items format. Each item must have a numeric phoneId and a positive quantity.'); 
            }

            console.log('Placing order...');
            const order = await OrderService.placeOrder(customerAccountNumber, items);
            console.log('Order placed:', order);
            
            const response = order;
            console.log('Final response:', response);
            handleSuccess(res, response);
        }
        catch (error) {
            console.log('Error in placeOrder:', error);
            handleFailure(res, error, 'Error placing order');
        }
        console.log('===== OrderController.placeOrder END =====');
    }
}