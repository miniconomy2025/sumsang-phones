import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService.js';
import {handleSuccess, handleFailure} from '../utils/handleResponses.js';
import { BadRequestError } from '../utils/errors.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { systemSettingKeys } from '../constants/SystemSettingKeys.js';

export class OrderController {
    static async placeOrder(req: Request, res: Response): Promise<void> {
        console.log('===== OrderController.placeOrder START =====');
        try {
            console.log('Request body:', req.body);
            const { items } = req.body;
            console.log('Items:', items);

            // Basic validation
            if (!Array.isArray(items) || items.length === 0) {
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
            const order = await OrderService.placeOrder(items);
            console.log('Order placed:', order);
            
            console.log('Getting account number...');
            const accountNumber = await SystemSettingsRepository.getByKey(systemSettingKeys.accountNumber);
            console.log('Account number:', accountNumber);
            
            if (!accountNumber) {
                console.log('No account number found');
                throw new Error('Currently unavailable to accept purchases.');
            }
            
            const response = {...order, accountNumber};
            console.log('Final response:', response);
            handleSuccess(res, response);
        }
        catch (error) {
            console.log('Error in placeOrder:', error);
            handleFailure(res, error, 'Error placing order');
        }
        console.log('===== OrderController.placeOrder END =====');
    }

    static async paymentMade(req: Request, res: Response): Promise<void> {
        console.log('===== OrderController.paymentMade START =====');
        try {
            console.log('Request body:', req.body);
            const { reference, amount } = req.body;
            console.log('Reference:', reference);
            console.log('Amount:', amount);

            if (typeof reference !== 'number' || typeof amount !== 'number' || amount <= 0) {
                console.log('Invalid payment data');
                throw new BadRequestError('Invalid payment data');
            }
            
            console.log('Getting order...');
            const order = await OrderService.getOrder(reference);
            console.log('Order found:', order);

            console.log('Processing payment...');
            await OrderService.processPayment(order, amount);
            console.log('Payment processed successfully');

            const response = { message: 'Payment accepted' };
            console.log('Response:', response);
            handleSuccess(res, response);
        } 
        catch (error) {
            console.log('Error in paymentMade:', error);
            handleFailure(res, error, 'Error processing payment');
        }
        console.log('===== OrderController.paymentMade END =====');
    }
}