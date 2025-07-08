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

export class DailyTasksService {
    static async executeDailyTasks(): Promise<void> {
        // 1. Cancel outstanding orders (2+ days old with insufficient payment)
        await this.cancelOutstandingOrders();

        // 2. Process pending orders
        await this.processAllOrders();

        // 3. Make phones based on demand and capacity
        await this.makePhones();

        // 4. Order parts based on inventory levels and production needs
        await this.orderParts();

        // 5. Process any pending parts purchases
        await this.processPendingPartsPurchases();

        // 6. Process any pending machine purchases
        await MachinePurchaseService.processPendingMachinePurchases();

    }

    static async cancelOutstandingOrders(): Promise<void> {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const outstandingOrders = await OrderRepository.getOrdersWithInsufficientPayment(twoDaysAgo);

        for (const order of outstandingOrders) {
            await OrderRepository.updateStatus(order.orderId, Status.Cancelled);
        }
    }

    static async processAllOrders(): Promise<void> {
        const pendingOrders = await OrderRepository.getPendingOrders();

        for (const order of pendingOrders) {
            await OrderService.processOrder(order);
        }
    }

    static async makePhones(): Promise<void> {
        const machines = await MachineRepository.getActiveMachines();
        const machineCapacityByPhone = new Map<number, number>();

        for (const machine of machines) {
            const currentCapacity = machineCapacityByPhone.get(machine.phoneId) || 0;
            machineCapacityByPhone.set(machine.phoneId, currentCapacity + machine.ratePerDay);
        }

        const demandAnalysis = await this.analyzeDemand();

        const productionPlan = await this.calculateProductionPlan(demandAnalysis, machineCapacityByPhone);

        for (const [phoneId, quantity] of productionPlan) {
            if (quantity > 0) {
                await this.producePhones(phoneId, quantity);
            }
        }
    }

    /**
     * Analyze demand for each phone model based on:
     * - Current pending orders (from existing tables)
     * - Current stock levels
     * - Simple demand estimation
     * - Only considers phones that have machines available
     */
    static async analyzeDemand(): Promise<Map<number, number>> {
        const demandMap = new Map<number, number>();

        const machines = await MachineRepository.getActiveMachines();
        const phonesWithMachines = new Set(machines.map(m => m.phoneId));

        const pendingOrders = await OrderRepository.getPendingOrders();
        const pendingDemand = new Map<number, number>();

        for (const order of pendingOrders) {
            const items = await OrderRepository.getOrderItems(order.orderId);
            for (const item of items) {
                const current = pendingDemand.get(item.phoneId) || 0;
                pendingDemand.set(item.phoneId, current + item.quantity);
            }
        }

        const currentStock = await StockRepository.getCurrentStockMap();

        for (const [phoneId, pendingQty] of pendingDemand) {
            if (!phonesWithMachines.has(phoneId)) {
                continue;
            }

            const currentAvailable = currentStock.get(phoneId)?.quantityAvailable || 0;

            // Simple demand calculation: pending orders + safety buffer - current stock
            // Safety buffer: minimum of 10 units or 50% of pending orders
            const safetyBuffer = Math.max(10, Math.ceil(pendingQty * 0.5));
            const totalDemand = pendingQty + safetyBuffer - currentAvailable;

            demandMap.set(phoneId, Math.max(0, totalDemand));
        }

        for (const [phoneId, stockInfo] of currentStock) {
            if (!phonesWithMachines.has(phoneId)) {
                continue;
            }

            if (!demandMap.has(phoneId) && stockInfo.quantityAvailable < 20) {
                // Maintain minimum stock of 20 units for each phone we can produce
                demandMap.set(phoneId, 20 - stockInfo.quantityAvailable);
            }
        }

        return demandMap;
    }

    static async calculateProductionPlan(
        demandAnalysis: Map<number, number>,
        machineCapacityByPhone: Map<number, number>
    ): Promise<Map<number, number>> {
        const productionPlan = new Map<number, number>();

        for (const [phoneId, demand] of demandAnalysis) {
            const machineCapacity = machineCapacityByPhone.get(phoneId) || 0;

            if (machineCapacity === 0) {
                continue;
            }

            const maxProducible = await this.getMaxProducibleQuantity(phoneId);

            if (maxProducible === 0) {
                continue;
            }

            // Produce the minimum of: demand, machine capacity, and available parts
            const productionQuantity = Math.min(demand, machineCapacity, maxProducible);

            if (productionQuantity > 0) {
                productionPlan.set(phoneId, productionQuantity);
            }
        }

        return productionPlan;
    }

    /**
     * Get maximum quantity of a phone that can be produced based on part availability
    */
    static async getMaxProducibleQuantity(phoneId: number): Promise<number> {
        const machineRatios = await MachineRepository.getMachineRatios(phoneId);
        const inventory = await InventoryRepository.getCurrentInventoryMapped();

        let maxProducible = Infinity;

        for (const ratio of machineRatios) {
            const availableParts = inventory.get(ratio.partId) || 0;
            const possibleUnits = Math.floor(availableParts / ratio.totalQuantity);
            maxProducible = Math.min(maxProducible, possibleUnits);
        }

        return maxProducible === Infinity ? 0 : maxProducible;
    }

    /**
     * Execute phone production
    */
    static async producePhones(phoneId: number, quantity: number): Promise<void> {
        const machineRatios = await MachineRepository.getMachineRatios(phoneId);
        const inventoryMapped = await InventoryRepository.getCurrentInventoryMapped();

        for (const ratio of machineRatios) {
            const partsNeeded = ratio.totalQuantity * quantity;
            if (inventoryMapped.get(ratio.partId) || 0 < partsNeeded)
                return
        }

        for (const ratio of machineRatios) {
            const partsNeeded = ratio.totalQuantity * quantity;
            await InventoryRepository.deductParts(ratio.partId, partsNeeded);
        }

        await StockRepository.addStock(phoneId, quantity);
    }

    static async orderParts(): Promise<void> {
        const partsToOrder = await this.calculatePartsToOrder();

        if (partsToOrder.size === 0) {
            return;
        }

        for (const [partId, quantity] of partsToOrder) {
            const partsPurchaseId = await this.makePartsPurchaseOrder(partId, quantity);
        }
    }

    /**
     * Calculate which parts need to be ordered based on:
     * - Current inventory levels
     * - Minimum stock thresholds
     * - Parts already ordered but not delivered
     * - Future production needs
     */
    static async calculatePartsToOrder(): Promise<Map<number, number>> {
        const partsToOrder = new Map<number, number>();

        const inventory = await InventoryRepository.getCurrentInventoryMapped();

        const pendingParts = await this.getPendingPartsOrders();

        // const minStockDays = await SystemSettingsRepository.getSetting('min_stock_days') || 7;
        const minStockDays = 7;

        const expectedDailyUsage = await this.calculateExpectedPartsUsage();

        for (const [partId, dailyUsage] of expectedDailyUsage) {
            const currentStock = inventory.get(partId) || 0;
            const pendingDelivery = pendingParts.get(partId) || 0;
            const effectiveStock = currentStock + pendingDelivery;

            const minStockLevel = dailyUsage * minStockDays;

            if (effectiveStock < minStockLevel) {
                // Order enough for 30 days (configurable)
                // const orderDays = await SystemSettingsRepository.getSetting('order_days') || 30;
                const orderDays = 30;
                const targetStock = dailyUsage * orderDays;
                const quantityToOrder = targetStock - effectiveStock;

                if (quantityToOrder > 0) {
                    partsToOrder.set(partId, quantityToOrder);
                }
            }
        }

        return partsToOrder;
    }

    static async getPendingPartsOrders(): Promise<Map<number, number>> {
        const pendingParts = new Map<number, number>();

        const pendingPurchases = await PartsPurchaseRepository.getPurchasesByStatus([
            Status.PendingPayment,
            Status.PendingDeliveryRequest,
            Status.PendingDeliveryPayment,
            Status.PendingDeliveryCollection,
        ]);

        for (const purchase of pendingPurchases) {
            const partId = purchase.partId;
            const quantity = purchase.quantity;

            const currentPending = pendingParts.get(partId) || 0;
            pendingParts.set(partId, currentPending + quantity);
        }

        return pendingParts;
    }

    static async calculateExpectedPartsUsage(): Promise<Map<number, number>> {
        const partsUsage = new Map<number, number>();

        const machines = await MachineRepository.getActiveMachines();
        const machineCapacityByPhone = new Map<number, number>();

        for (const machine of machines) {
            const currentCapacity = machineCapacityByPhone.get(machine.phoneId) || 0;
            machineCapacityByPhone.set(machine.phoneId, currentCapacity + machine.ratePerDay);
        }

        const utilizationRate = 0.5;

        for (const [phoneId, dailyCapacity] of machineCapacityByPhone) {
            const expectedDailyProduction = dailyCapacity * utilizationRate;

            const machineRatios = await MachineRepository.getMachineRatios(phoneId);

            for (const ratio of machineRatios) {
                const dailyUsage = expectedDailyProduction * ratio.totalQuantity;
                const currentUsage = partsUsage.get(ratio.partId) || 0;
                partsUsage.set(ratio.partId, currentUsage + dailyUsage);
            }
        }

        return partsUsage;
    }

    static async makePartsPurchaseOrder(partId: number, quantity: number): Promise<number> {
        const supplier = await SupplierRepository.getSupplierByPartId(partId);

        let purchaseOrder = null;

        if (supplier.name === 'case-supplier') {
            purchaseOrder = await CaseSuppliers.purchaseCases(quantity);
        }
        else if (supplier.name === 'screen-supplier') {
            purchaseOrder = await ScreenSuppliers.purchaseScreens(quantity);
        }
        else if (supplier.name === 'electronics-supplier') {
            purchaseOrder = await ElectronicsSuppliers.purchaseElectronics(quantity);
        }

        return await PartsPurchaseRepository.createPartsPurchase({ partId: partId, referenceNumber: purchaseOrder?.reference_number!, cost: purchaseOrder?.cost!, quantity: quantity, accountNumber: purchaseOrder?.account_number!, status: Status.PendingPayment });
    }

    static async processPendingPartsPurchases() {
        const pendingPartsPurchases = await PartsPurchaseRepository.getPurchasesByStatus([Status.PendingPayment, Status.PendingDeliveryRequest, Status.PendingDeliveryPayment]);

        for (const partsPurchase of pendingPartsPurchases) {
            await this.processPartsPurchase(partsPurchase.partsPurchaseId!);
        }
    }

    static async processPartsPurchase(partsPurchaseId: number) {
        let partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(partsPurchaseId);

        if (partsPurchase.status === Status.PendingPayment) {
            await this.makePartsPurchasePayment(partsPurchase);

            partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(partsPurchaseId);
        }

        if (partsPurchase.status === Status.PendingDeliveryRequest) {
            await this.makeBulkDeliveryRequest(partsPurchase);

            partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(partsPurchaseId);
        }

        if (partsPurchase.status === Status.PendingDeliveryPayment) {
            await this.makeBulkDeliveryPayment(partsPurchase);

            partsPurchase = await PartsPurchaseRepository.getPartsPurchaseById(partsPurchaseId);
        }
    }


    static async makePartsPurchasePayment(partsPurchase: PartsPurchase): Promise<void> {
        const result = await CommercialBankAPI.makePayment(partsPurchase.referenceNumber, partsPurchase.cost, partsPurchase.accountNumber);

        if (result.success) {
            await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.PendingDeliveryRequest);
        }
        else {
            // no money probably - try again later when not broke I guess
        }
    }

    static async makeBulkDeliveryRequest(partsPurchase: PartsPurchase) {
        const supplier = await SupplierRepository.getSupplierByPartId(partsPurchase.partId);

        const result = await BulkDeliveriesAPI.requestDelivery(partsPurchase.referenceNumber, partsPurchase.quantity, supplier.name);

        if (result.success && result.delivery_reference && result.cost && result.account_number) {
            await BulkDeliveryRepository.insertBulkDelivery(partsPurchase.partsPurchaseId!, result.delivery_reference, result.cost, supplier.address, result.account_number);

            await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.PendingDeliveryPayment);
        }
    }

    static async makeBulkDeliveryPayment(partsPurchase: PartsPurchase) {
        const bulkDelivery = await BulkDeliveryRepository.getDeliveryByPartsPurchaseId(partsPurchase.partsPurchaseId!);

        const result = await CommercialBankAPI.makePayment(bulkDelivery.deliveryReference, bulkDelivery.cost, bulkDelivery.accountNumber);

        if (result.success) {
            await PartsPurchaseRepository.updateStatus(partsPurchase.partsPurchaseId!, Status.PendingDeliveryDropOff);
        }
        else {
            // no money probably - try again later when not broke I guess
        }
    }
}