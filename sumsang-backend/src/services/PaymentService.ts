import { ref } from 'process';
import { PaymentRepository } from '../repositories/PaymentRepository.js';

export class PaymentService {
    static async updatePaymentStatus(reference: number, amount: number) {
        const paymentDetails = await PaymentRepository.updatePaymentStatus(reference, amount);
        return paymentDetails;
    }
}