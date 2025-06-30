import { ref } from 'process';
import { PaymentRepository } from '../repositories/PaymentRepository.js';

export class PaymentService {
    static async updatePaymentStatus(reference: number, amount: number) {
        const stock = await PaymentRepository.updatePaymentStatus(reference, amount);
        return stock;
    }
}