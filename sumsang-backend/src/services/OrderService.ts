import { OrderRepository } from '../repositories/OrderRepository.js';
import { OrderItem } from '../types/OrderItemType.js';
import { PhoneRepository } from '../repositories/PhoneRepository.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.js';
import { Status } from '../types/Status.js';
import { Order } from '../types/OrderType.js';
import { StockRepository } from '../repositories/StockRepository.js';
import { CommercialBankAPI, ConsumerDeliveriesAPI, RetailBankAPI } from '../utils/externalApis.js';
import { ConsumerDeliveryRepository } from '../repositories/ConsumerDeliveriesRepository.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { systemSettingKeys } from '../constants/SystemSettingKeys.js';

export class OrderService {
    static async placeOrder(accountNumber: string, items: OrderItem[]) {
        console.log('OrderService::placeOrder - Starting order placement', { items });
        
        if (!items || items.length === 0) {
            console.log('OrderService::placeOrder - Order validation failed: no items');
            throw new ValidationError('Order must include at least one item.');
        }

        let totalPrice = 0;

        for (const item of items) {
            console.log('OrderService::placeOrder - Processing item', { item });
            
            const phoneExists = await PhoneRepository.phoneExists(item.phoneId);
            if (!phoneExists) {
                console.log('OrderService::placeOrder - Phone not found', { phoneId: item.phoneId });
                throw new ValidationError(`Phone with ID ${item.phoneId} does not exist.`);
            }

            // Optional: Fetch phone price and add to total
            const phone = await PhoneRepository.getPhoneById(item.phoneId);
            console.log('OrderService::placeOrder - Found phone', { phone });
            
            const itemTotal = Number(phone.price) * item.quantity;
            totalPrice += itemTotal;
            console.log('OrderService::placeOrder - Calculated item total', { itemTotal, totalPrice });
        }

        console.log('Getting account number...');
        const ourAccount = await SystemSettingsRepository.getByKey(systemSettingKeys.accountNumber);
        console.log('Account number:', accountNumber);
        if (!ourAccount) {
            throw Error('We do not have an account yet to accept purchases')
        }
        const ourAccountNumber = ourAccount.value;

        console.log('OrderService::placeOrder - Creating order', { totalPrice });
        const orderId = await OrderRepository.createOrder(accountNumber, totalPrice, items);
        console.log('OrderService::placeOrder - Order created', { orderId });

        const order = await OrderRepository.getOrderById(Number(orderId));
        console.log('OrderService::placeOrder - Order ', { order });

        if (!order) {
            throw new NotFoundError('Something went wrong with creating the order.')
        }

        await this.getMoneyForOrderFromRetail(ourAccountNumber, order)

        return {
            orderId: order.orderId,
            price: totalPrice
        };
    }

    static async getMoneyForOrderFromRetail(ourAccountNumber: string, order: Order) {
        console.log(`getMoneyForOrderFromRetail - Requesting payment from RetailBankAPI for Order ID: ${order.orderId}`);

        const result = await RetailBankAPI.requestPayment(
            order.accountNumber!,
            ourAccountNumber,
            order.price * 100,
            order.orderId
        );

        if (result.success) {
            console.log(`getMoneyForOrderFromRetail - Payment successful for Order ID: ${order.orderId}. Updating amount paid and status.`);

            await OrderRepository.updateAmountPaid(order.orderId, order.price);
            console.log(`getMoneyForOrderFromRetail - Amount paid updated to ${order.price} for Order ID: ${order.orderId}.`);

            await OrderRepository.updateStatus(order.orderId, Status.PendingStock);
            console.log(`getMoneyForOrderFromRetail - Status updated to PendingStock for Order ID: ${order.orderId}.`);

            order = await this.getOrder(order.orderId);
            console.log(`getMoneyForOrderFromRetail - Fetched updated order for Order ID: ${order.orderId}. Beginning processing.`);

            await this.processOrder(order);
            console.log(`getMoneyForOrderFromRetail - Order ID: ${order.orderId} processed successfully.`);
        } else {
            console.log(`getMoneyForOrderFromRetail - Payment failed for Order ID: ${order.orderId}. Updating status to Cancelled.`);

            await OrderRepository.updateStatus(order.orderId, Status.Cancelled);
            console.log(`getMoneyForOrderFromRetail - Status updated to Cancelled for Order ID: ${order.orderId}.`);

            throw new ForbiddenError("There is not enough money in the account provided. Order canceled");
        }
    }

    static async processOrder(order: Order): Promise<void> {
        console.log('OrderService::processOrder - Starting order processing', { order });

        if (order.status === Status.PendingStock) {
            console.log('OrderService::processOrder - Checking stock availability');
            if (await this.stockAvailableForOrder(order)) {
                console.log('OrderService::processOrder - Stock available, reserving stock');
                await this.reserveStockForOrder(order);

                order = await this.getOrder(order.orderId);
                console.log('OrderService::processOrder - Stock reserved, order updated', { order });
            } else {
                console.log('OrderService::processOrder - Stock not available, order remains PendingStock');
            }
        }

        if (order.status === Status.PendingDeliveryRequest) {
            console.log('OrderService::processOrder - Making delivery request');
            await this.makeDeliveryRequest(order);

            order = await this.getOrder(order.orderId);
            console.log('OrderService::processOrder - Delivery request made, order updated', { order });
        }

        if (order.status === Status.PendingDeliveryPayment) {
            console.log('OrderService::processOrder - Making delivery payment');
            await this.makeDeliveryPayment(order);

            order = await this.getOrder(order.orderId);
            console.log('OrderService::processOrder - Delivery payment made, order updated', { order });
        }
        
        console.log('OrderService::processOrder - Order processing completed');
    }

    static async stockAvailableForOrder(order: Order): Promise<boolean> {
        console.log('OrderService::stockAvailableForOrder - Checking stock availability', { order });
        
        const items: OrderItem[] = await OrderRepository.getOrderItems(order.orderId);
        console.log('OrderService::stockAvailableForOrder - Retrieved order items', { items });
        
        const stock = await StockRepository.getCurrentStockMap();
        console.log('OrderService::stockAvailableForOrder - Retrieved stock map', { stockSize: stock.size });

        for (const item of items) {
            console.log('OrderService::stockAvailableForOrder - Checking item stock', { item });
            
            const stockEntry = stock.get(item.phoneId);
            console.log('OrderService::stockAvailableForOrder - Stock entry for item', { stockEntry });
            
            if (!stockEntry || stockEntry.quantityAvailable < item.quantity) {
                console.log('OrderService::stockAvailableForOrder - Insufficient stock for item', { phoneId: item.phoneId, required: item.quantity, available: stockEntry?.quantityAvailable });
                return false;
            }
        }

        console.log('OrderService::stockAvailableForOrder - Stock available for all items');
        return true;
    }

    static async reserveStockForOrder(order: Order): Promise<void> {
        console.log('OrderService::reserveStockForOrder - Starting stock reservation', { order });
        
        const items: OrderItem[] = await OrderRepository.getOrderItems(order.orderId);
        console.log('OrderService::reserveStockForOrder - Retrieved order items', { items });

        for (const item of items) {
            console.log('OrderService::reserveStockForOrder - Reserving stock for item', { item });
            await StockRepository.reserveStock(item.phoneId, item.quantity);
            console.log('OrderService::reserveStockForOrder - Stock reserved for item', { phoneId: item.phoneId, quantity: item.quantity });
        }

        await OrderRepository.updateStatus(order.orderId, Status.PendingDeliveryRequest);
        console.log('OrderService::reserveStockForOrder - Status updated to PendingDeliveryRequest');
    }

    static async makeDeliveryRequest(order: Order): Promise<void> {
        console.log('OrderService::makeDeliveryRequest - Starting delivery request', { order });
        
        const units = await OrderRepository.getOrderItemsCount(order.orderId);
        console.log('OrderService::makeDeliveryRequest - Retrieved order items count', { units });

        const result = await ConsumerDeliveriesAPI.requestDelivery(units);
        console.log('OrderService::makeDeliveryRequest - Delivery request response', { result });

        if (result.success && result.referenceno && result.amount && result.account_number) {
            console.log('OrderService::makeDeliveryRequest - Delivery request successful, inserting delivery record');
            
            await ConsumerDeliveryRepository.insertConsumerDelivery(order.orderId, result.referenceno, result.amount, result.account_number);
            console.log('OrderService::makeDeliveryRequest - Consumer delivery record inserted');

            await OrderRepository.updateStatus(order.orderId, Status.PendingDeliveryPayment);
            console.log('OrderService::makeDeliveryRequest - Status updated to PendingDeliveryPayment');
        } else {
            console.log('OrderService::makeDeliveryRequest - Delivery request failed or incomplete');
        }
    }

    static async makeDeliveryPayment(order: Order): Promise<void> {
        console.log('OrderService::makeDeliveryPayment - Starting delivery payment', { order });
        
        const delivery = await ConsumerDeliveryRepository.getDeliveryByOrderId(order.orderId);
        console.log('OrderService::makeDeliveryPayment - Retrieved delivery record', { delivery });
      
        if (!delivery) {
            console.log('OrderService::makeDeliveryPayment - Delivery record not found', { orderId: order.orderId });
            throw new ValidationError(`Delivery information not found for order ${order.orderId}`);
        }

        const result = await CommercialBankAPI.makePayment(delivery.deliveryReference, delivery.cost, delivery.accountNumber);
        console.log('OrderService::makeDeliveryPayment - Payment result', { result });

        if (result.success) {
            console.log('OrderService::makeDeliveryPayment - Payment successful, updating status');
            await OrderRepository.updateStatus(order.orderId, Status.PendingDeliveryCollection);
            console.log('OrderService::makeDeliveryPayment - Status updated to PendingDeliveryCollection');
        }
        else {
            console.log('OrderService::makeDeliveryPayment - Payment failed, no status update');
        }
    }

    static async getOrder(orderId: number) {
        console.log('OrderService::getOrder - Retrieving order', { orderId });
        
        const order = await OrderRepository.getOrderById(orderId);
        console.log('OrderService::getOrder - Retrieved order', { order });
        
        if (!order) {
            console.log('OrderService::getOrder - Order not found', { orderId });
            throw new ValidationError(`Order ${orderId} not found`);
        }
        
        return order;
    }
}