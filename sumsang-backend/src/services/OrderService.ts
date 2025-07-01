import { OrderRepository } from '../repositories/OrderRepository.js';
import { Order } from '../types/OrderType.js';
import { OrderItem } from '../types/OrderItemType.js';
import { PhoneRepository } from '../repositories/PhoneRepository.js';
import { ValidationError } from '../utils/errors.js';

export class OrderService {
    static async getOrders(): Promise<Order[]> {
        const orders = await OrderRepository.getOrders();
        return orders;
    }

    static async placeOrder(items: OrderItem[]) {
        if (!items || items.length === 0) {
            throw new ValidationError('Order must include at least one item.');
        }

        let totalPrice = 0;

        for (const item of items) {
            const phoneExists = await PhoneRepository.phoneExists(item.phoneId);
            if (!phoneExists) {
                throw new ValidationError(`Phone with ID ${item.phoneId} does not exist.`);
            }

            // Optional: Fetch phone price and add to total
            const phone = await PhoneRepository.getPhoneById(item.phoneId);
            totalPrice += Number(phone.price) * item.quantity;
        }

        const order = await OrderRepository.createOrder(totalPrice, items);

        return {
            orderId: order.orderId,
            price: totalPrice
        };
    }
}