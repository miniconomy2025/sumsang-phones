import { Request, Response } from 'express';
import { LogisticsService } from '../services/LogisticsService.js';
import { BulkDeliveryRepository } from '../repositories/BulkDeliveriesRepository.js';
import { MachineDeliveryRepository } from '../repositories/MachineDeliveryRepository.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';

export class LogisticsController {
    
    static async handleLogistics(req: Request, res: Response): Promise<void> {
        try {
            const { id, type, items } = req.body;
           
            if (!id || !type || !items) {
                 throw new BadRequestError('Invalid request payload. Must include id, type, and items array.');
            }

            if (!Array.isArray(items)) {
                throw new BadRequestError('Invalid request payload. `items` must be an array.');
            }

            if (!['PICKUP', 'DELIVERY'].includes(type)) {
                throw new BadRequestError('Invalid request payload. Type must be either "PICKUP" or "DELIVERY".');
            }
 
            if (type === 'DELIVERY') {
                const deliveryReference = Number(id);
                if (isNaN(deliveryReference)) {
                    throw new BadRequestError('Invalid id for DELIVERY: must be a number (delivery_reference).');
                }

                const bulkDelivery = await BulkDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
                const machineDelivery = await MachineDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);

                if (bulkDelivery) {
                    const quantity = items.reduce((sum, item) => {
                        if (typeof item.quantity !== 'number' || item.quantity < 0) {
                            throw new BadRequestError('Invalid item in payload: each item must have a positive quantity number.');
                        }
                        return sum + item.quantity;
                    }, 0);

                    const result = await LogisticsService.handlePartsDelivery(deliveryReference, quantity);
                    handleSuccess(res, result);

                } else if (machineDelivery) {
                    const quantity = items.length;
                    const result = await LogisticsService.handleMachinesDelivery(deliveryReference, quantity);
                    handleSuccess(res, result);

                } else {
                    throw new NotFoundError(`Delivery reference ${deliveryReference} not found in parts or machine deliveries.`);
                }

            } else if (type === 'PICKUP') {
                const deliveryReference = id;
                if (typeof deliveryReference !== 'string') {
                    throw new BadRequestError('Invalid id for PICKUP: must be a string (UUID delivery_reference).');
                }

                const quantity = items.reduce((sum, item) => {
                    if (typeof item.quantity !== 'number' || item.quantity < 0) {
                        throw new BadRequestError('Invalid item in payload: each item must have a positive quantity number.');
                    }
                    return sum + item.quantity;
                }, 0);

                const result = await LogisticsService.handlePhonesCollection(deliveryReference, quantity);
                handleSuccess(res, result);
            }

        } catch (error) {
            handleFailure(res, error, 'Error processing logistics request');
        }
    }
}