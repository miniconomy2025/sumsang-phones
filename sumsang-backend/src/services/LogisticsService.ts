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
        const bulkDelivery = await BulkDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
        if (!bulkDelivery) {
            throw new NotFoundError(`Bulk delivery with reference ${deliveryReference} not found.`);
        }

        const partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(bulkDelivery.partsPurchaseId);
        if (!partsPurchase) {
            throw new NotFoundError(`Associated parts purchase for delivery ${deliveryReference} not found.`);
        }
        
        const totalExpected = partsPurchase.quantity;
        const alreadyReceived = bulkDelivery.unitsReceived || 0;
        

        await BulkDeliveryRepository.updateUnitsReceived(bulkDelivery.bulkDeliveryId, quantityReceived);

        if (alreadyReceived + quantityReceived >= totalExpected) {

            await InventoryRepository.addParts(partsPurchase.partId, totalExpected);
            
            await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.Completed); 
            return { message: 'Final parts delivery processed. Inventory updated.' };
        }

        return { message: `Partial parts delivery of ${quantityReceived} units processed.` };
    }

    static async handleMachinesDelivery(deliveryReference: number, quantityReceived: number) {
        const machineDelivery = await MachineDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
        if (!machineDelivery) {
            throw new NotFoundError(`Machine delivery with reference ${deliveryReference} not found.`);
        }

        const machinePurchase = await MachinePurchaseRepository.getById(machineDelivery.machinePurchasesId);
        if (!machinePurchase) {
            throw new NotFoundError(`Associated machine purchase for delivery ${deliveryReference} not found.`);
        }
        
        const totalExpected = machinePurchase.machinesPurchased;
        const alreadyReceived = machineDelivery.unitsReceived || 0;
        

        await MachineDeliveryRepository.updateUnitsReceived(machineDelivery.machineDeliveriesId, quantityReceived);

        if (alreadyReceived + quantityReceived >= totalExpected) {
            await MachineRepository.createMachinesAndRatiosFromPurchase(machinePurchase);
            return { message: 'Final machine delivery processed. Machines and part ratios have been created.' };
        }
        
        return { message: `Partial machine delivery of ${quantityReceived} units processed.` };
    }

    static async handlePhonesCollection(orderId: number, quantityCollected: number) {
        const consumerDelivery = await ConsumerDeliveryRepository.getDeliveryByOrderId(orderId);
        if (!consumerDelivery) {
            throw new NotFoundError(`No delivery record found for orderId ${orderId}.`);
        }
        
        const orderItems = await OrderRepository.getOrderItems(orderId);
        if (orderItems.length === 0) {
            throw new NotFoundError(`No items found for orderId ${orderId}.`);
        }
        const totalExpected = orderItems.reduce((sum, item) => sum + item.quantity, 0);

        const alreadyCollected = consumerDelivery.unitsCollected || 0;


        await ConsumerDeliveryRepository.updateUnitsCollected(consumerDelivery.consumerDeliveryId, quantityCollected);
        
        if (alreadyCollected + quantityCollected >= totalExpected) {
            for (const item of orderItems) {
                await StockRepository.releaseReservedStock(item.phoneId, item.quantity);
            }
            await OrderRepository.updateStatus(orderId, Status.Shipped);
            return { message: `Final collection for order ${orderId} processed. Order shipped.` };
        }
        
        return { message: `Partial collection of ${quantityCollected} units for order ${orderId} processed.` };
    }
}