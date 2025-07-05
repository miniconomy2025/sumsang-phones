import { OrderRepository } from '../repositories/OrderRepository.js';
import { OrderItem } from '../types/OrderItemType.js';
import { PhoneRepository } from '../repositories/PhoneRepository.js';
import { ValidationError } from '../utils/errors.js';
import { Status } from '../types/Status.js';
import { Order } from '../types/OrderType.js';
import { StockRepository } from '../repositories/StockRepository.js';
import { CommercialBankAPI, ConsumerDeliveriesAPI } from '../utils/externalApis.js';
import { ConsumerDeliveryRepository } from '../repositories/ConsumerDeliveriesRepository.js';

export class OrderService {
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

    static async processPayment(order: Order, amount: number): Promise<void> {
        const newAmountPaid = Number(order.amountPaid) + amount;

        await OrderRepository.updateAmountPaid(order.orderId, newAmountPaid);

        if (newAmountPaid >= Number(order.price)) {
            await OrderRepository.updateStatus(order.orderId, Status.PendingStock);

            order = await this.getOrder(order.orderId);

            await this.processOrder(order);
        }
    }

    static async processOrder(order: Order): Promise<void> {
        if (order.status === Status.PendingStock) {
            if (await this.stockAvailableForOrder(order)) {
                await this.reserveStockForOrder(order);

                order = await this.getOrder(order.orderId);
            }
        }
        
        if (order.status === Status.PendingDeliveryRequest) {
            this.makeDeliveryRequest(order);

            order = await this.getOrder(order.orderId);
        }   
        
        if (order.status === Status.PendingDeliveryPayment) {
            this.makeDeliveryPayment(order);

            order = await this.getOrder(order.orderId);
        }
    }

    static async stockAvailableForOrder(order: Order): Promise<boolean> {
        const items: OrderItem[] = await OrderRepository.getOrderItems(order.orderId);
        const stock = await StockRepository.getCurrentStockMap();

        for (const item of items) {
            const stockEntry = stock.get(item.phoneId);
            if (!stockEntry || stockEntry.quantityAvailable < item.quantity) {
                return false;
            }
        }

        return true;
    }

    static async reserveStockForOrder(order: Order): Promise<void> {
        const items: OrderItem[] = await OrderRepository.getOrderItems(order.orderId);

        for (const item of items) {
            await StockRepository.reserveStock(item.phoneId, item.quantity);
        }

        await OrderRepository.updateStatus(order.orderId, Status.PendingDeliveryRequest);
    }

    static async makeDeliveryRequest(order: Order): Promise<void> {
        const units = await OrderRepository.getOrderItemsCount(order.orderId);

        const result = await ConsumerDeliveriesAPI.requestDelivery(order.orderId, units);

        if (result.success && result.delivery_reference && result.cost && result.account_number) {
            await ConsumerDeliveryRepository.insertConsumerDelivery(order.orderId, result.delivery_reference, result.cost, result.account_number);

            await OrderRepository.updateStatus(order.orderId, Status.PendingDeliveryPayment);
        }
    }

    static async makeDeliveryPayment(order: Order): Promise<void> {
        const delivery = await ConsumerDeliveryRepository.getDeliveryByOrderId(order.orderId);

        const result = await CommercialBankAPI.makePayment(delivery.deliveryReference, delivery.cost, delivery.account_number);

        if (result.success) {
            await OrderRepository.updateStatus(order.orderId, Status.PendingDeliveryCollection); 
        }
        else {
            // no money probably - try again later when not broke I guess
        }
    }


    static async getOrder(orderId: number) {
        const order = await OrderRepository.getOrderById(orderId);
        if (!order) 
            throw new ValidationError(`Order ${orderId} not found`);
        return order;
    }
}