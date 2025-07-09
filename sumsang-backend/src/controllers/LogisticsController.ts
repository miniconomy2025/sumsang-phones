import { Request, Response } from 'express';
import { LogisticsService } from '../services/LogisticsService.js';
import { BulkDeliveryRepository } from '../repositories/BulkDeliveriesRepository.js';
import { MachineDeliveryRepository } from '../repositories/MachineDeliveryRepository.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';

export class LogisticsController {
    
    static async handleLogistics(req: Request, res: Response): Promise<void> {
        console.log('===== LogisticsController.handleLogistics START =====');
        try {
            console.log('Request body:', req.body);
            const type = req.body.type;
            console.log('Logistics type:', type);

            if (!type || !['PICKUP', 'DELIVERY'].includes(type)) {
                console.log('Invalid type provided:', type);
                throw new BadRequestError('Invalid request payload. Must include type ("PICKUP" or "DELIVERY")');
            }

            if (type === 'DELIVERY') {
                console.log('Processing DELIVERY request...');
                const id = req.body.id;
                const items = req.body.items;
                console.log('Delivery ID:', id);
                console.log('Items:', items);

                const deliveryReference = Number(id);
                if (isNaN(deliveryReference)) {
                    console.log('Invalid delivery reference:', id);
                    throw new BadRequestError('Invalid id for DELIVERY: must be a number (delivery_reference).');
                }

                if (!Array.isArray(items)) {
                    console.log('Items is not an array:', items);
                    throw new BadRequestError('Invalid request payload. `items` must be an array.');
                }

                console.log('Looking up delivery references...');
                const bulkDelivery = await BulkDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
                const machineDelivery = await MachineDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
                console.log('Bulk delivery found:', bulkDelivery);
                console.log('Machine delivery found:', machineDelivery);

                if (bulkDelivery) {
                    console.log('Processing bulk delivery...');
                    const quantity = items.reduce((sum, item) => {
                        console.log('Processing item:', item);
                        if (typeof item.quantity !== 'number' || item.quantity < 0) {
                            console.log('Invalid item quantity:', item.quantity);
                            throw new BadRequestError('Invalid item in payload: each item must have a positive quantity number.');
                        }
                        return sum + item.quantity;
                    }, 0);

                    console.log('Total quantity for parts delivery:', quantity);
                    const result = await LogisticsService.handlePartsDelivery(deliveryReference, quantity);
                    console.log('Parts delivery result:', result);
                    handleSuccess(res, result);

                } else if (machineDelivery) {
                    console.log('Processing machine delivery...');
                    const quantity = items.length;
                    console.log('Machine quantity:', quantity);
                    const result = await LogisticsService.handleMachinesDelivery(deliveryReference, quantity);
                    console.log('Machine delivery result:', result);
                    handleSuccess(res, result);

                } else {
                    console.log('No delivery found for reference:', deliveryReference);
                    throw new NotFoundError(`Delivery reference ${deliveryReference} not found in parts or machine deliveries.`);
                }

            } else if (type === 'PICKUP') {
                console.log('Processing PICKUP request...');
                const id = req.body.id;
                const quantity = req.body.quantity;
                console.log('Pickup ID:', id);
                console.log('Pickup quantity:', quantity);

                const deliveryReference = id;
                if (!deliveryReference || typeof deliveryReference !== 'string') {
                    console.log('Invalid pickup delivery reference:', deliveryReference);
                    throw new BadRequestError('Invalid id for PICKUP: must be a string (UUID delivery_reference).');
                }

                console.log('Processing phones collection...');
                const result = await LogisticsService.handlePhonesCollection(deliveryReference, quantity);
                console.log('Phones collection result:', result);
                handleSuccess(res, result);
            }

        } catch (error) {
            console.log('Error in logistics handling:', error);
            handleFailure(res, error, 'Error processing logistics request');
        }
        console.log('===== LogisticsController.handleLogistics END =====');
    }
}