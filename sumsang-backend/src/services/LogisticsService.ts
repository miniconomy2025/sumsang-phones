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
            throw new NotFoundError(`Associated parts purchase not found.`);
        }
        
        const totalExpected = partsPurchase.quantity;
        const alreadyReceived = bulkDelivery.unitsReceived || 0;
        
        if (alreadyReceived + quantityReceived > totalExpected) {
            throw new ValidationError('Received quantity exceeds expected quantity for this delivery.');
        }

        await BulkDeliveryRepository.updateUnitsReceived(bulkDelivery.bulkDeliveryId, quantityReceived);

        if (alreadyReceived + quantityReceived === totalExpected) {
            await InventoryRepository.addParts(partsPurchase.partId, totalExpected);
            await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.Shipped);
            return { message: 'Final parts delivery processed. Inventory updated.' };
        }

        return { message: `Partial parts delivery of ${quantityReceived} units processed.` };
    }

    static async handleMachinesDelivery(deliveryReference: number, quantityReceived: number) {
        const machineDelivery = await MachineDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
        if (!machineDelivery) {
            throw new NotFoundError(`Machine delivery with reference ${deliveryReference} not found.`);
        }

        const machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machineDelivery.machinePurchasesId);
        if (!machinePurchase) {
            throw new NotFoundError(`Associated machine purchase not found.`);
        }
        
        const totalExpected = machinePurchase.machinesPurchased;
        const alreadyReceived = machineDelivery.unitsReceived || 0;
        
        if (alreadyReceived + quantityReceived > totalExpected) {
            throw new ValidationError('Received quantity exceeds expected quantity for this machine delivery.');
        }

        await MachineDeliveryRepository.updateUnitsReceived(machineDelivery.machineDeliveriesId, quantityReceived);

        if (alreadyReceived + quantityReceived === totalExpected) {
            const costPerMachine = Number(machinePurchase.totalCost) / totalExpected;
            await MachineRepository.createMachines(
                machinePurchase.phoneId,
                totalExpected,
                costPerMachine,
                machinePurchase.ratePerDay
            );
            return { message: 'Final machine delivery processed. Machines are now active.' };
        }
        
        return { message: `Partial machine delivery of ${quantityReceived} units processed.` };
    }

    static async handlePhonesCollection(deliveryReference: number, quantityCollected: number) {
        const consumerDelivery = await ConsumerDeliveryRepository.getDeliveryByDeliveryReference(deliveryReference);
        if (!consumerDelivery) {
            throw new NotFoundError(`Consumer delivery with reference ${deliveryReference} not found.`);
        }
        
        const orderId = consumerDelivery.orderId;
        const orderItems = await OrderRepository.getOrderItems(orderId);
        const totalExpected = orderItems.reduce((sum, item) => sum + item.quantity, 0);

        const alreadyCollected = consumerDelivery.unitsCollected || 0;

        if (alreadyCollected + quantityCollected > totalExpected) {
            throw new ValidationError('Collected quantity exceeds expected quantity for this order.');
        }

        await ConsumerDeliveryRepository.updateUnitsCollected(consumerDelivery.consumerDeliveryId, quantityCollected);
        
        if (alreadyCollected + quantityCollected === totalExpected) {
            for (const item of orderItems) {
                await StockRepository.releaseReservedStock(item.phoneId, item.quantity);
            }
            await OrderRepository.updateStatus(orderId, Status.Shipped);
            return { message: 'Final phone collection processed. Order shipped.' };
        }
        
        return { message: `Partial phone collection of ${quantityCollected} units processed.` };
    }
}