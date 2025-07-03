import { GoodsCollectionRepository } from '../repositories/GoodsCollectionRepository.js';
import { Status } from '../types/Status.js';
import { BadRequestError, NotFoundError, ValidationError } from '../utils/errors.js';

export class GoodsCollectionService {

    static async processGoodsCollection(deliveryReference: number) {
        if (!deliveryReference || typeof deliveryReference !== 'number') {
            throw new ValidationError('A valid numeric deliveryReference is required.');
        }

        const orderDetails = await GoodsCollectionRepository.findOrderDetailsByDeliveryReference(deliveryReference);

        if (!orderDetails) {
            throw new NotFoundError(`No order found for delivery reference ${deliveryReference}.`);
        }

        if (orderDetails.status !== Status.PendingDeliveryCollection) {
            throw new BadRequestError('Order is not awaiting collection. Its current status is not "PendingDeliveryCollection".');
        }

        const result = await GoodsCollectionRepository.markOrderAsCollected(orderDetails.order_id);

        return {
            message: `Successfully collected goods for order ${result.orderId} (Ref: ${deliveryReference}). Status updated to Shipped.`,
            orderId: result.orderId
        };
    }
}