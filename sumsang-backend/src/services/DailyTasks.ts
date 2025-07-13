import { OrderRepository } from '../repositories/OrderRepository.js';
import { StockRepository } from '../repositories/StockRepository.js';
import { MachineRepository } from '../repositories/MachineRepository.js';
import { InventoryRepository } from '../repositories/InventoryRepository.js';
import { PartsPurchaseRepository } from '../repositories/PartsPurchaseRepository.js';
import { Status } from '../types/Status.js';
import { OrderService } from './OrderService.js';
import { CommercialBankAPI, BulkDeliveriesAPI, CaseSuppliers, ScreenSuppliers, ElectronicsSuppliers } from '../utils/externalApis.js';
import { SupplierRepository } from '../repositories/SupplierRepository.js';
import { PartsPurchase } from '../types/PartsPurchaseType.js';
import { BulkDeliveryRepository } from '../repositories/BulkDeliveriesRepository.js';
import { MachinePurchaseService } from './MachinePurchaseService.js';
import { PartsRepository } from '../repositories/PartsRepository.js';
import { PricingService } from './PricingService.js';

export class DailyTasksService {
    static async executeDailyTasks(): Promise<void> {
        console.log("DailyTasksService::executeDailyTasks - Starting daily tasks execution");

        // 0. Update phone prices daily
        console.log("DailyTasksService::executeDailyTasks - Step 0: Updating phone prices");
        await PricingService.updatePhonePricesDaily();
        
        // 1. Cancel outstanding orders (2+ days old with insufficient payment)
        console.log("DailyTasksService::executeDailyTasks - Step 1: Canceling outstanding orders");
        await this.cancelOutstandingOrders();

        // 2. Process pending orders
        console.log("DailyTasksService::executeDailyTasks - Step 2: Processing pending orders");
        await this.processAllOrders();

        // 3. Make phones based on demand and capacity
        console.log("DailyTasksService::executeDailyTasks - Step 3: Making phones");
        await this.makePhones();

        // 4. Order parts based on inventory levels and production needs
        console.log("DailyTasksService::executeDailyTasks - Step 4: Ordering parts");
        await this.orderParts();

        // 5. Process any pending parts purchases
        console.log("DailyTasksService::executeDailyTasks - Step 5: Processing pending parts purchases");
        await this.processPendingPartsPurchases();

        // 6. Process any pending machine purchases
        console.log("DailyTasksService::executeDailyTasks - Step 6: Processing pending machine purchases");
        await MachinePurchaseService.processPendingMachinePurchases();

        console.log("DailyTasksService::executeDailyTasks - Daily tasks execution completed");
    }

    static async cancelOutstandingOrders(): Promise<void> {
        console.log("DailyTasksService::cancelOutstandingOrders - Starting order cancellation process");
        
        const twoDaysAgo = 2;
        const outstandingOrders = await OrderRepository.getOrdersWithInsufficientPayment(twoDaysAgo);
        console.log("DailyTasksService::cancelOutstandingOrders - Found outstanding orders:", outstandingOrders.length);

        for (const order of outstandingOrders) {
            console.log("DailyTasksService::cancelOutstandingOrders - Canceling order:", order.orderId);
            await OrderRepository.updateStatus(order.orderId, Status.Cancelled);
        }
        
        console.log("DailyTasksService::cancelOutstandingOrders - Order cancellation process completed");
    }

    static async processAllOrders(): Promise<void> {
        console.log("DailyTasksService::processAllOrders - Starting order processing");
        
        const pendingOrders = await OrderRepository.getPendingOrders();
        console.log("DailyTasksService::processAllOrders - Found pending orders:", pendingOrders.length);

        for (const order of pendingOrders) {
            console.log("DailyTasksService::processAllOrders - Processing order:", order.orderId);
            await OrderService.processOrder(order);
        }
        
        console.log("DailyTasksService::processAllOrders - Order processing completed");
    }

    static async makePhones(): Promise<void> {
        console.log("DailyTasksService::makePhones - Starting phone production");
        
        const machines = await MachineRepository.getActiveMachines();
        console.log("DailyTasksService::makePhones - Found active machines:", machines.length);
        
        const machineCapacityByPhone = new Map<number, number>();

        for (const machine of machines) {
            const currentCapacity = machineCapacityByPhone.get(machine.phoneId) || 0;
            machineCapacityByPhone.set(machine.phoneId, currentCapacity + machine.ratePerDay);
        }
        
        console.log("DailyTasksService::makePhones - Machine capacity by phone:", Array.from(machineCapacityByPhone.entries()));

        const demandAnalysis = await this.analyzeDemand();
        console.log("DailyTasksService::makePhones - Demand analysis:", Array.from(demandAnalysis.entries()));

        const productionPlan = await this.calculateProductionPlan(demandAnalysis, machineCapacityByPhone);
        console.log("DailyTasksService::makePhones - Production plan:", Array.from(productionPlan.entries()));

        for (const [phoneId, quantity] of productionPlan) {
            if (quantity > 0) {
                console.log("DailyTasksService::makePhones - Producing phones:", { phoneId, quantity });
                await this.producePhones(phoneId, quantity);
            }
        }
        
        console.log("DailyTasksService::makePhones - Phone production completed");
    }

    static async analyzeDemand(): Promise<Map<number, number>> {
        console.log("DailyTasksService::analyzeDemand - Starting demand analysis");
        
        const demandMap = new Map<number, number>();

        const machines = await MachineRepository.getActiveMachines();
        const phonesWithMachines = new Set(machines.map(m => m.phoneId));
        console.log("DailyTasksService::analyzeDemand - Phones with machines:", Array.from(phonesWithMachines));

        const pendingOrders = await OrderRepository.getPendingOrders();
        const pendingDemand = new Map<number, number>();

        for (const order of pendingOrders) {
            const items = await OrderRepository.getOrderItems(order.orderId);
            for (const item of items) {
                const current = pendingDemand.get(item.phoneId!) || 0;
                pendingDemand.set(item.phoneId!, current + item.quantity);
            }
        }
        
        console.log("DailyTasksService::analyzeDemand - Pending demand:", Array.from(pendingDemand.entries()));

        const currentStock = await StockRepository.getCurrentStockMap();
        console.log("DailyTasksService::analyzeDemand - Current stock:", Array.from(currentStock.entries()));

        for (const [phoneId, pendingQty] of pendingDemand) {
            if (!phonesWithMachines.has(phoneId)) {
                console.log("DailyTasksService::analyzeDemand - Skipping phone without machines:", phoneId);
                continue;
            }

            const currentAvailable = currentStock.get(phoneId)?.quantityAvailable || 0;
            const safetyBuffer = Math.max(10, Math.ceil(pendingQty * 0.5));
            const totalDemand = pendingQty + safetyBuffer - currentAvailable;

            console.log("DailyTasksService::analyzeDemand - Phone demand calculation:", {
                phoneId,
                pendingQty,
                currentAvailable,
                safetyBuffer,
                totalDemand
            });

            demandMap.set(phoneId, Math.max(0, totalDemand));
        }

        for (const [phoneId, stockInfo] of currentStock) {
            if (!phonesWithMachines.has(phoneId)) {
                continue;
            }

            if (!demandMap.has(phoneId) && stockInfo.quantityAvailable < 20) {
                const minStockDemand = 20 - stockInfo.quantityAvailable;
                console.log("DailyTasksService::analyzeDemand - Adding minimum stock demand:", { phoneId, minStockDemand });
                demandMap.set(phoneId, minStockDemand);
            }
        }

        console.log("DailyTasksService::analyzeDemand - Final demand map:", Array.from(demandMap.entries()));
        return demandMap;
    }

    static async calculateProductionPlan(
        demandAnalysis: Map<number, number>,
        machineCapacityByPhone: Map<number, number>
    ): Promise<Map<number, number>> {
        console.log("DailyTasksService::calculateProductionPlan - Starting production plan calculation");
        
        const productionPlan = new Map<number, number>();

        for (const [phoneId, demand] of demandAnalysis) {
            const machineCapacity = machineCapacityByPhone.get(phoneId) || 0;
            console.log("DailyTasksService::calculateProductionPlan - Phone capacity check:", { phoneId, demand, machineCapacity });

            if (machineCapacity === 0) {
                console.log("DailyTasksService::calculateProductionPlan - No machine capacity for phone:", phoneId);
                continue;
            }

            const maxProducible = await this.getMaxProducibleQuantity(phoneId);
            console.log("DailyTasksService::calculateProductionPlan - Max producible quantity:", { phoneId, maxProducible });

            if (maxProducible === 0) {
                console.log("DailyTasksService::calculateProductionPlan - No parts available for phone:", phoneId);
                continue;
            }

            const productionQuantity = Math.min(demand, machineCapacity, maxProducible);
            console.log("DailyTasksService::calculateProductionPlan - Production quantity calculated:", { phoneId, productionQuantity });

            if (productionQuantity > 0) {
                productionPlan.set(phoneId, productionQuantity);
            }
        }

        console.log("DailyTasksService::calculateProductionPlan - Production plan completed:", Array.from(productionPlan.entries()));
        return productionPlan;
    }

    static async getMaxProducibleQuantity(phoneId: number): Promise<number> {
        console.log("DailyTasksService::getMaxProducibleQuantity - Calculating max producible for phone:", phoneId);
        
        const machineRatios = await MachineRepository.getMachineRatios(phoneId);
        const inventory = await InventoryRepository.getCurrentInventoryMapped();
        console.log("DailyTasksService::getMaxProducibleQuantity - Machine ratios:", machineRatios);
        console.log("DailyTasksService::getMaxProducibleQuantity - Current inventory:", Array.from(inventory.entries()));

        let maxProducible = Infinity;

        for (const ratio of machineRatios) {
            const availableParts = inventory.get(ratio.partId) || 0;
            const possibleUnits = Math.floor(availableParts / ratio.totalQuantity);
            maxProducible = Math.min(maxProducible, possibleUnits);
            
            console.log("DailyTasksService::getMaxProducibleQuantity - Part constraint:", {
                partId: ratio.partId,
                availableParts,
                required: ratio.totalQuantity,
                possibleUnits,
                maxProducible
            });
        }

        const result = maxProducible === Infinity ? 0 : maxProducible;
        console.log("DailyTasksService::getMaxProducibleQuantity - Final max producible:", result);
        return result;
    }

    static async producePhones(phoneId: number, quantity: number): Promise<void> {
        console.log("DailyTasksService::producePhones - Starting phone production:", { phoneId, quantity });
        
        const machineRatios = await MachineRepository.getMachineRatios(phoneId);
        const inventoryMapped = await InventoryRepository.getCurrentInventoryMapped();
        
        console.log("DailyTasksService::producePhones - Machine ratios:", machineRatios);
        console.log("DailyTasksService::producePhones - Current inventory:", Array.from(inventoryMapped.entries()));

        // Check if we have enough parts
        for (const ratio of machineRatios) {
            const partsNeeded = ratio.totalQuantity * quantity;
            const availableParts = inventoryMapped.get(ratio.partId) || 0;
            
            if (availableParts < partsNeeded) {
                console.log("DailyTasksService::producePhones - Insufficient parts:", {
                    partId: ratio.partId,
                    needed: partsNeeded,
                    available: availableParts
                });
                return;
            }
        }

        // Deduct parts from inventory
        for (const ratio of machineRatios) {
            const partsNeeded = ratio.totalQuantity * quantity;
            console.log("DailyTasksService::producePhones - Deducting parts:", { partId: ratio.partId, partsNeeded });
            await InventoryRepository.deductParts(ratio.partId, partsNeeded);
        }

        // Add produced phones to stock
        console.log("DailyTasksService::producePhones - Adding to stock:", { phoneId, quantity });
        await StockRepository.addStock(phoneId, quantity);
        
        console.log("DailyTasksService::producePhones - Phone production completed");
    }

    static async orderParts(): Promise<void> {
        console.log("DailyTasksService::orderParts - Starting parts ordering process");
        
        const partsToOrder = await this.calculatePartsToOrder();
        console.log("DailyTasksService::orderParts - Parts to order:", Array.from(partsToOrder.entries()));

        if (partsToOrder.size === 0) {
            console.log("DailyTasksService::orderParts - No parts need to be ordered");
            return;
        }

        for (let [partId, quantity] of partsToOrder) {
            quantity = Math.ceil(quantity/1000)*1000;
            console.log("DailyTasksService::orderParts - Making purchase order:", { partId, quantity });

            let partsPurchaseId = null
            while (!partsPurchaseId && quantity >= 1000) {
                partsPurchaseId = await this.makePartsPurchaseOrder(partId, quantity);
                quantity = quantity - 1000;
            }
            console.log("DailyTasksService::orderParts - Purchase order created:", partsPurchaseId);
        }
        
        console.log("DailyTasksService::orderParts - Parts ordering process completed");
    }

    static async calculatePartsToOrder(): Promise<Map<number, number>> {
        console.log("DailyTasksService::calculatePartsToOrder - Starting parts calculation");
        
        const partsToOrder = new Map<number, number>();

        const inventory = await InventoryRepository.getCurrentInventoryMapped();
        const pendingParts = await this.getPendingPartsOrders();
        const minStockDays = 7;
        const expectedDailyUsage = await this.calculateExpectedPartsUsage();

        console.log("DailyTasksService::calculatePartsToOrder - Current inventory:", Array.from(inventory.entries()));
        console.log("DailyTasksService::calculatePartsToOrder - Pending parts:", Array.from(pendingParts.entries()));
        console.log("DailyTasksService::calculatePartsToOrder - Expected daily usage:", Array.from(expectedDailyUsage.entries()));

        for (const [partId, dailyUsage] of expectedDailyUsage) {
            const currentStock = inventory.get(partId) || 0;
            const pendingDelivery = pendingParts.get(partId) || 0;
            const effectiveStock = currentStock + pendingDelivery;
            const minStockLevel = dailyUsage * minStockDays;

            console.log("DailyTasksService::calculatePartsToOrder - Part analysis:", {
                partId,
                currentStock,
                pendingDelivery,
                effectiveStock,
                dailyUsage,
                minStockLevel
            });

            if (effectiveStock < minStockLevel) {
                const orderDays = 30;
                const targetStock = dailyUsage * orderDays;
                const quantityToOrder = targetStock - effectiveStock;

                console.log("DailyTasksService::calculatePartsToOrder - Part needs ordering:", {
                    partId,
                    targetStock,
                    quantityToOrder
                });

                if (quantityToOrder > 0) {
                    partsToOrder.set(partId, quantityToOrder);
                }
            }
        }

        console.log("DailyTasksService::calculatePartsToOrder - Parts to order calculated:", Array.from(partsToOrder.entries()));
        return partsToOrder;
    }

    static async getPendingPartsOrders(): Promise<Map<number, number>> {
        console.log("DailyTasksService::getPendingPartsOrders - Getting pending parts orders");
        
        const pendingParts = new Map<number, number>();

        const pendingPurchases = await PartsPurchaseRepository.getPurchasesByStatus([
            Status.PendingPayment,
            Status.PendingDeliveryRequest,
            Status.PendingDeliveryPayment,
            Status.PendingDeliveryDropOff,
        ]);

        console.log("DailyTasksService::getPendingPartsOrders - Found pending purchases:", pendingPurchases.length);

        for (const purchase of pendingPurchases) {
            const partId = purchase.partId;
            const quantity = purchase.quantity;
            const currentPending = pendingParts.get(partId) || 0;
            pendingParts.set(partId, currentPending + quantity);
        }

        console.log("DailyTasksService::getPendingPartsOrders - Pending parts map:", Array.from(pendingParts.entries()));
        return pendingParts;
    }

    static async calculateExpectedPartsUsage(): Promise<Map<number, number>> {
        console.log("DailyTasksService::calculateExpectedPartsUsage - Calculating expected parts usage");
        
        const partsUsage = new Map<number, number>();

        const machines = await MachineRepository.getActiveMachines();
        const machineCapacityByPhone = new Map<number, number>();

        for (const machine of machines) {
            const currentCapacity = machineCapacityByPhone.get(machine.phoneId) || 0;
            machineCapacityByPhone.set(machine.phoneId, currentCapacity + machine.ratePerDay);
        }

        console.log("DailyTasksService::calculateExpectedPartsUsage - Machine capacity by phone:", Array.from(machineCapacityByPhone.entries()));

        const utilizationRate = 0.01;
        console.log("DailyTasksService::calculateExpectedPartsUsage - Using utilization rate:", utilizationRate);

        for (const [phoneId, dailyCapacity] of machineCapacityByPhone) {
            const expectedDailyProduction = dailyCapacity * utilizationRate;
            console.log("DailyTasksService::calculateExpectedPartsUsage - Expected daily production:", { phoneId, expectedDailyProduction });

            const machineRatios = await MachineRepository.getMachineRatios(phoneId);

            for (const ratio of machineRatios) {
                const dailyUsage = expectedDailyProduction * ratio.totalQuantity;
                const currentUsage = partsUsage.get(ratio.partId) || 0;
                partsUsage.set(ratio.partId, currentUsage + dailyUsage);
                
                console.log("DailyTasksService::calculateExpectedPartsUsage - Part usage:", {
                    partId: ratio.partId,
                    dailyUsage,
                    totalUsage: currentUsage + dailyUsage
                });
            }
        }

        console.log("DailyTasksService::calculateExpectedPartsUsage - Final parts usage:", Array.from(partsUsage.entries()));
        return partsUsage;
    }

    static async makePartsPurchaseOrder(partId: number, quantity: number): Promise<number | null> {
        console.log("DailyTasksService::makePartsPurchaseOrder - Making purchase order:", { partId, quantity });
        
        const supplier = await SupplierRepository.getSupplierByPartId(partId);
        console.log("DailyTasksService::makePartsPurchaseOrder - Found supplier:", supplier);

        let purchaseOrder = null;

        if (supplier.name === 'case-supplier') {
            console.log("DailyTasksService::makePartsPurchaseOrder - Purchasing from case supplier");
            purchaseOrder = await CaseSuppliers.purchaseCases(quantity);
        }
        else if (supplier.name === 'screen-supplier') {
            console.log("DailyTasksService::makePartsPurchaseOrder - Purchasing from screen supplier");
            purchaseOrder = await ScreenSuppliers.purchaseScreens(quantity);
        }
        else if (supplier.name === 'electronics-supplier') {
            console.log("DailyTasksService::makePartsPurchaseOrder - Purchasing from electronics supplier");
            purchaseOrder = await ElectronicsSuppliers.purchaseElectronics(quantity);
        }

        console.log("DailyTasksService::makePartsPurchaseOrder - Purchase order response:", purchaseOrder);

        if (purchaseOrder?.success && purchaseOrder.referenceNumber && purchaseOrder?.cost && purchaseOrder?.accountNumber) {
            const partsPurchaseId = await PartsPurchaseRepository.createPartsPurchase({ 
                partId: partId, 
                referenceNumber: purchaseOrder?.referenceNumber!, 
                cost: purchaseOrder?.cost!, 
                quantity: quantity, 
                accountNumber: purchaseOrder?.accountNumber!, 
                status: Status.PendingPayment 
            });

            console.log("DailyTasksService::makePartsPurchaseOrder - Created parts purchase:", partsPurchaseId);
            return partsPurchaseId;
        }
        else {
            return null;
        }
    }

    static async processPendingPartsPurchases() {
        console.log("DailyTasksService::processPendingPartsPurchases - Processing pending parts purchases");
        
        const pendingPartsPurchases = await PartsPurchaseRepository.getPurchasesByStatus([
            Status.PendingPayment, 
            Status.PendingDeliveryRequest, 
            Status.PendingDeliveryPayment
        ]);

        console.log("DailyTasksService::processPendingPartsPurchases - Found pending purchases:", pendingPartsPurchases.length);

        for (const partsPurchase of pendingPartsPurchases) {
            console.log("DailyTasksService::processPendingPartsPurchases - Processing purchase:", partsPurchase.partsPurchaseId);
            await this.processPartsPurchase(partsPurchase.partsPurchaseId!);
        }
        
        console.log("DailyTasksService::processPendingPartsPurchases - Processing completed");
    }

    static async processPartsPurchase(partsPurchaseId: number) {
        console.log("DailyTasksService::processPartsPurchase - Processing parts purchase:", partsPurchaseId);
        
        let partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(partsPurchaseId);
        console.log("DailyTasksService::processPartsPurchase - Current status:", partsPurchase.status);

        if (partsPurchase.status === Status.PendingPayment) {
            if (await this.checkIfOrderStillActive(partsPurchase)) {
                console.log("DailyTasksService::processPartsPurchase - Making payment");
                await this.makePartsPurchasePayment(partsPurchase);
                partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(partsPurchaseId);
            }
            else {
                console.log("DailyTasksService::processPartsPurchase - Order canceled by supplier");
                await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.Cancelled);
                partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(partsPurchaseId);
            }
        }

        if (partsPurchase.status === Status.PendingDeliveryRequest) {
            console.log("DailyTasksService::processPartsPurchase - Making delivery request");
            await this.makeBulkDeliveryRequest(partsPurchase);
            partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(partsPurchaseId);
        }

        if (partsPurchase.status === Status.PendingDeliveryPayment) {
            console.log("DailyTasksService::processPartsPurchase - Making delivery payment");
            await this.makeBulkDeliveryPayment(partsPurchase);
            partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(partsPurchaseId);
        }
        
        console.log("DailyTasksService::processPartsPurchase - Processing completed for:", partsPurchaseId);
    }

    static async checkIfOrderStillActive(partsPurchase: PartsPurchase): Promise<boolean> {
        console.log("DailyTasksService::checkIfOrderStillActive - Checking  for:", partsPurchase.partsPurchaseId);
        if (partsPurchase.partId === 1) {
            console.log("DailyTasksService::checkIfOrderStillActive - Part id:", partsPurchase.partId);
            const response = await CaseSuppliers.getOrderStatus(partsPurchase.referenceNumber);

            console.log("DailyTasksService::checkIfOrderStillActive - response:", response);

            if (!response ||  response.status !== 'payment_pending') {
                return false;
            }
            else {
                return true;
            }
        }
        else if (partsPurchase.partId === 3) {
            console.log("DailyTasksService::checkIfOrderStillActive - Part id:", partsPurchase.partId);
            const response = await ElectronicsSuppliers.getElectronicsOrder(partsPurchase.referenceNumber);

            console.log("DailyTasksService::checkIfOrderStillActive - response:", response);

            if (!response || response.status === 'EXPIRED') {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            console.log("DailyTasksService::checkIfOrderStillActive - Part id:", partsPurchase.partId);
            return true;
        }
    }

    static async makePartsPurchasePayment(partsPurchase: PartsPurchase): Promise<void> {
        console.log("DailyTasksService::makePartsPurchasePayment - Making payment for purchase:", partsPurchase.partsPurchaseId);
        
        const result = await CommercialBankAPI.makePayment(String(partsPurchase.referenceNumber), partsPurchase.cost, partsPurchase.accountNumber);
        console.log("DailyTasksService::makePartsPurchasePayment - Payment result:", result);

        if (result.success) {
            console.log("DailyTasksService::makePartsPurchasePayment - Payment successful, updating status");
            await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.PendingDeliveryRequest);
        }
        else {
            console.log("DailyTasksService::makePartsPurchasePayment - Payment failed, will retry later");
        }
    }

    static async makeBulkDeliveryRequest(partsPurchase: PartsPurchase) {
        console.log("DailyTasksService::makeBulkDeliveryRequest - Making delivery request for:", partsPurchase.partsPurchaseId);
        
        const supplier = await SupplierRepository.getSupplierByPartId(partsPurchase.partId);
        const part = await PartsRepository.getPartById(partsPurchase.partId);
        
        console.log("DailyTasksService::makeBulkDeliveryRequest - Supplier and part info:", { supplier, part });

        const result = await BulkDeliveriesAPI.requestDelivery(partsPurchase.referenceNumber, partsPurchase.quantity, supplier.name, part.name);
        console.log("DailyTasksService::makeBulkDeliveryRequest - Delivery request result:", result);

        if (result.success && result.pickupRequestId && result.cost && result.bulkLogisticsBankAccountNumber) {
            console.log("DailyTasksService::makeBulkDeliveryRequest - Creating bulk delivery record");
            await BulkDeliveryRepository.insertBulkDelivery(partsPurchase.partsPurchaseId!, result.pickupRequestId, result.cost, supplier.address, result.bulkLogisticsBankAccountNumber);

            console.log("DailyTasksService::makeBulkDeliveryRequest - Updating status to PendingDeliveryPayment");
            await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.PendingDeliveryPayment);
        } else {
            console.log("DailyTasksService::makeBulkDeliveryRequest - Delivery request failed or incomplete response");
        }
    }

    static async makeBulkDeliveryPayment(partsPurchase: PartsPurchase) {
        console.log("DailyTasksService::makeBulkDeliveryPayment - Making delivery payment for:", partsPurchase.partsPurchaseId);
        
        const bulkDelivery = await BulkDeliveryRepository.getDeliveryByPartsPurchaseId(partsPurchase.partsPurchaseId!);
        console.log("DailyTasksService::makeBulkDeliveryPayment - Bulk delivery info:", bulkDelivery);

        const result = await CommercialBankAPI.makePayment(String(bulkDelivery.deliveryReference), bulkDelivery.cost, bulkDelivery.accountNumber);
        console.log("DailyTasksService::makeBulkDeliveryPayment - Payment result:", result);

        if (result.success) {
            console.log("DailyTasksService::makeBulkDeliveryPayment - Payment successful, updating status");
            await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.PendingDeliveryDropOff);
        }
        else {
            console.log("DailyTasksService::makeBulkDeliveryPayment - Payment failed, will retry later");
        }
    }
}