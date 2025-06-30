import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService.js';
import {handleSuccess, handleFailure} from '../utils/handleResponses.js';

export class PaymentController {
    static async updatePaymentStatus(req: Request, res: Response): Promise<void> {
        try {
            const {
                reference,
                amount
            } = req.body

            const paymentDetails = await PaymentService.updatePaymentStatus(reference, amount);
            handleSuccess(res, paymentDetails);
        } catch (error) {
            handleFailure(res, error, 'Invalid payment data');
        }
    }
}