import { Request, Response } from 'express';
import { LogisticsService } from '../services/LogisticsService.js';
import { BulkDeliveryRepository } from '../repositories/BulkDeliveriesRepository.js';
import { MachineDeliveryRepository } from '../repositories/MachineDeliveryRepository.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';

export class LogisticsController {
    
    static async handleLogistics(req: Request, res: Response): Promise<void> {
        try {
            const { id, type, quantity } = req.body;

            if (!id || typeof id !== 'number' || typeof quantity !== 'number' || quantity <= 0 || !['PICKUP', 'DELIVERY'].includes(type)) {
                throw new BadRequestError('Invalid request payload. Must include id (number), type ("PICKUP" or "DELIVERY"), and quantity (positive number).');
            }

            if (type === 'DELIVERY') {

                const bulkDelivery = await BulkDeliveryRepository.getDeliveryByDeliveryReference(id);
                const machineDelivery = await MachineDeliveryRepository.getDeliveryByDeliveryReference(id);

                if (bulkDelivery) {
                    const result = await LogisticsService.handlePartsDelivery(id, quantity);
                    handleSuccess(res, result); 
                } 
                else if (machineDelivery) {
                    const result = await LogisticsService.handleMachinesDelivery(id, quantity);
                    handleSuccess(res, result); 
                }
                else {

                    throw new NotFoundError(`Delivery reference ${id} not found in parts or machine deliveries.`);
                }
                

            } else if (type === 'PICKUP') {
                const result = await LogisticsService.handlePhonesCollection(id, quantity);
                handleSuccess(res, result);
            }

        } catch (error) {
            handleFailure(res, error, 'Error processing logistics request');
        }
    }
}