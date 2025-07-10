// services/LogisticsService.ts

import { BulkDeliveryRepository } from '../repositories/BulkDeliveriesRepository.js';
import { ConsumerDeliveryRepository } from '../repositories/ConsumerDeliveriesRepository.js';
import { InventoryRepository } from '../repositories/InventoryRepository.js';
import { MachineDeliveryRepository } from '../repositories/MachineDeliveryRepository.js';
import { MachinePurchaseRepository } from '../repositories/MachinePurchaseRepository.js';
import { MachineRepository } from '../repositories/MachineRepository.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { PartsPurchaseRepository } from '../repositories/PartsPurchaseRepository.js';
import { StockRepository } from '../repositories/StockRepository.js';
import { Status } from '../types/Status.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class LogisticsService {

    static async handlePartsDelivery(deliveryReference: number, quantityReceived: number) {
        console.log('LogisticsService::handlePartsDelivery - Starting parts delivery handling', { deliveryReference, quantityReceived });
        
        const bulkDelivery = await BulkDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
        if (!bulkDelivery) {
            console.log('LogisticsService::handlePartsDelivery - Bulk delivery not found', { deliveryReference });
            throw new NotFoundError(`Bulk delivery with reference ${deliveryReference} not found.`);
        }

        console.log('LogisticsService::handlePartsDelivery - Found bulk delivery', { bulkDelivery });

        const partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(bulkDelivery.partsPurchaseId);
        if (!partsPurchase) {
            console.log('LogisticsService::handlePartsDelivery - Parts purchase not found', { partsPurchaseId: bulkDelivery.partsPurchaseId });
            throw new NotFoundError(`Associated parts purchase for delivery ${deliveryReference} not found.`);
        }
        
        console.log('LogisticsService::handlePartsDelivery - Found parts purchase', { partsPurchase });
        
        const totalExpected = partsPurchase.quantity;
        const alreadyReceived = bulkDelivery.unitsReceived || 0;

        console.log('LogisticsService::handlePartsDelivery - Processing delivery quantities', { totalExpected, alreadyReceived, quantityReceived });

        await BulkDeliveryRepository.updateUnitsReceived(bulkDelivery.bulkDeliveryId, quantityReceived);
        console.log('LogisticsService::handlePartsDelivery - Updated units received');

        if (alreadyReceived + quantityReceived >= totalExpected) {
            console.log('LogisticsService::handlePartsDelivery - Final delivery reached, updating inventory and status');

            await InventoryRepository.addParts(partsPurchase.partId, totalExpected);
            console.log('LogisticsService::handlePartsDelivery - Added parts to inventory', { partId: partsPurchase.partId, quantity: totalExpected });

            await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.Completed);
            console.log('LogisticsService::handlePartsDelivery - Updated parts purchase status to Completed');
            
            return { message: 'Final parts delivery processed. Inventory updated.' };
        }

        console.log('LogisticsService::handlePartsDelivery - Partial delivery processed');
        return { message: `Partial parts delivery of ${quantityReceived} units processed.` };
    }

    static async handleMachinesDelivery(deliveryReference: number, quantityReceived: number) {
        console.log('LogisticsService::handleMachinesDelivery - Starting machines delivery handling', { deliveryReference, quantityReceived });
        
        const machineDelivery = await MachineDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
        if (!machineDelivery) {
            console.log('LogisticsService::handleMachinesDelivery - Machine delivery not found', { deliveryReference });
            throw new NotFoundError(`Machine delivery with reference ${deliveryReference} not found.`);
        }

        console.log('LogisticsService::handleMachinesDelivery - Found machine delivery', { machineDelivery });

        const machinePurchase = await MachinePurchaseRepository.getById(machineDelivery.machinePurchasesId);
        if (!machinePurchase) {
            console.log('LogisticsService::handleMachinesDelivery - Machine purchase not found', { machinePurchasesId: machineDelivery.machinePurchasesId });
            throw new NotFoundError(`Associated machine purchase for delivery ${deliveryReference} not found.`);
        }
        
        console.log('LogisticsService::handleMachinesDelivery - Found machine purchase', { machinePurchase });
        
        const totalExpected = machinePurchase.machinesPurchased;
        const alreadyReceived = machineDelivery.unitsReceived || 0;
        
        console.log('LogisticsService::handleMachinesDelivery - Processing delivery quantities', { totalExpected, alreadyReceived, quantityReceived });
        
        await MachineDeliveryRepository.updateUnitsReceived(machineDelivery.machineDeliveriesId, quantityReceived);
        console.log('LogisticsService::handleMachinesDelivery - Updated units received');

        if (alreadyReceived + quantityReceived >= totalExpected) {
            console.log('LogisticsService::handleMachinesDelivery - Final delivery reached, creating machines and ratios');
            
            await MachineRepository.createMachinesAndRatiosFromPurchase(machinePurchase);
            console.log('LogisticsService::handleMachinesDelivery - Created machines and part ratios');

            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, Status.Completed);
            console.log('LogisticsService::handleMachinesDelivery - Updated machine purchase status to Completed');
            
            return { message: 'Final machine delivery processed. Machines and part ratios have been created.' };
        }
        
        console.log('LogisticsService::handleMachinesDelivery - Partial delivery processed');
        return { message: `Partial machine delivery of ${quantityReceived} units processed.` };
    }

    static async handlePhonesCollection(deliveryReference: string, quantityCollected: number) {
        console.log('LogisticsService::handlePhonesCollection - Starting phones collection handling', { deliveryReference, quantityCollected });
        
        const consumerDelivery = await ConsumerDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
        if (!consumerDelivery) {
            console.log('LogisticsService::handlePhonesCollection - Consumer delivery not found', { deliveryReference });
            throw new NotFoundError(`No delivery record found for delivery reference ${deliveryReference}.`);
        }
        
        console.log('LogisticsService::handlePhonesCollection - Found consumer delivery', { consumerDelivery });
        
        const orderId = consumerDelivery.orderId;
        const orderItems = await OrderRepository.getOrderItems(orderId);
        if (orderItems.length === 0) {
            console.log('LogisticsService::handlePhonesCollection - No order items found', { orderId });
            throw new NotFoundError(`No items found for orderId ${orderId} associated with this delivery.`);
        }
        
        console.log('LogisticsService::handlePhonesCollection - Found order items', { orderItems });
        
        const totalExpected = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const alreadyCollected = consumerDelivery.unitsCollected || 0;

        console.log('LogisticsService::handlePhonesCollection - Processing collection quantities', { totalExpected, alreadyCollected, quantityCollected });

        await ConsumerDeliveryRepository.updateUnitsCollected(consumerDelivery.consumerDeliveryId, quantityCollected);
        console.log('LogisticsService::handlePhonesCollection - Updated units collected');
        
        if (alreadyCollected + quantityCollected >= totalExpected) {
            console.log('LogisticsService::handlePhonesCollection - Final collection reached, releasing stock and updating order status');
            
            for (const item of orderItems) {
                await StockRepository.releaseReservedStock(item.phoneId!, item.quantity);
                console.log('LogisticsService::handlePhonesCollection - Released reserved stock', { phoneId: item.phoneId, quantity: item.quantity });
            }
            
            await OrderRepository.updateStatus(orderId, Status.Shipped);
            console.log('LogisticsService::handlePhonesCollection - Updated order status to Shipped', { orderId });
            
            return { message: `Final collection for order ${orderId} processed. Order shipped.` };
        }
        
        console.log('LogisticsService::handlePhonesCollection - Partial collection processed');
        return { message: `Partial collection of ${quantityCollected} units for order ${orderId} processed.` };
    }
}