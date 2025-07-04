import { LogisticsRepository } from '../repositories/LogisticsRepository.js';
import { Status } from '../types/Status.js';
import { BadRequestError, NotFoundError, ValidationError } from '../utils/errors.js';

export class LogisticsService {

    static async processLogisticsRequest(id: number, type: 'PICKUP' | 'DELIVERY', quantity: number) {
        if (!id || !type || quantity === undefined) {
            throw new ValidationError('Request body must include id, type, and quantity.');
        }
        if (type !== 'PICKUP' && type !== 'DELIVERY') {
            throw new BadRequestError('Type must be either "PICKUP" or "DELIVERY".');
        }

        if (type === 'PICKUP') {
            return this.handlePickupRequest(id, quantity);
        } else {
            return this.handleDeliveryRequest(id, quantity);
        }
    }

    private static async handlePickupRequest(purchaseId: number, quantity: number) {
        const partPurchase = await LogisticsRepository.findPartPurchaseById(purchaseId);
        if (!partPurchase) {
            throw new NotFoundError(`Part purchase with ID ${purchaseId} not found.`);
        }
        if (partPurchase.status !== Status.AwaitingPickup) {
            throw new BadRequestError(`Cannot arrange pickup. Purchase ${purchaseId} is not in 'AwaitingPickup' status.`);
        }
        const result = await LogisticsRepository.createBulkPickup(purchaseId, quantity);
        return {
            message: `Bulk pickup successfully requested for parts purchase ${purchaseId}.`,
            type: 'PICKUP',
            logisticsReference: result.delivery_reference,
            cost: result.cost,
            newStatus: 'InTransit'
        };
    }

    private static async handleDeliveryRequest(orderId: number, quantity: number) {
        const order = await LogisticsRepository.findOrderById(orderId);
        if (!order) {
            throw new NotFoundError(`Order with ID ${orderId} not found.`);
        }
        if (order.status !== Status.AwaitingShipment) {
            throw new BadRequestError(`Cannot arrange delivery. Order ${orderId} is not in 'AwaitingShipment' status.`);
        }
        const result = await LogisticsRepository.createConsumerDelivery(orderId, quantity);
        return {
            message: `Consumer delivery successfully requested for order ${orderId}.`,
            type: 'DELIVERY',
            logisticsReference: result.delivery_reference,
            cost: result.cost,
            newStatus: 'PendingDeliveryCollection'
        };
    }

    static async processConfirmation(deliveryReference: number, type: 'DELIVERY' | 'PICKUP') {
        if (!deliveryReference || !type) {
            throw new ValidationError('Request must include a deliveryReference and type.');
        }

        if (type === 'DELIVERY') {
            const result = await LogisticsRepository.confirmConsumerCollection(deliveryReference);
            return {
                message: `Successfully confirmed collection for order ${result.orderId}. Status updated to Shipped.`,
                orderId: result.orderId,
                newStatus: 'Shipped'
            };
        } else if (type === 'PICKUP') {
            const result = await LogisticsRepository.confirmBulkArrival(deliveryReference);
            return {
                message: `Successfully confirmed arrival for parts purchase ${result.purchaseId}. Status updated to Received.`,
                purchaseId: result.purchaseId,
                newStatus: 'Received'
            };
        } else {
            throw new BadRequestError('Invalid type. Must be "DELIVERY" or "PICKUP".');
        }
    }
}