import { THOHService } from "./THOHService.js";
import { MachinePurchaseResponse } from "../types/ExternalApiTypes.js";
import { MachinePurchaseRecord } from "../types/MachinePurchaseType.js";
import { MachinePurchaseRepository } from "../repositories/MachinePurchaseRepository.js";
import { PhoneRepository } from "../repositories/PhoneRepository.js";
import { BulkDeliveriesAPI, THOHAPI } from "../utils/externalApis.js";
import { Status } from "../types/Status.js";
import { BankService } from "./BankService.js";
import { DailyTasksService } from "./DailyTasks.js";
import { MachineRepository } from "../repositories/MachineRepository.js";
import { BulkDeliveryRepository } from "../repositories/BulkDeliveriesRepository.js";

export class MachinePurchaseService {

    static async recordMachinePurchase(machinePurchase: MachinePurchaseResponse): Promise<number> {
        // Map machineName to phoneId
        const phone = await PhoneRepository.getPhoneByModel(machinePurchase.machineName);

        const machineRecord: MachinePurchaseRecord = {
            phoneId: phone.phone_id,
            machinesPurchased: machinePurchase.quantity,
            totalCost: machinePurchase.price,
            weightPerMachine: machinePurchase.weight,
            ratePerDay: machinePurchase.machineDetails.productionRate,
            ratio: machinePurchase.machineDetails.materialRatio,
            status: Status.PendingPayment,
            accountNumber: machinePurchase.bankAccount,
            reference: machinePurchase.orderId
        };

        // Save machine purchase to DB
        return await MachinePurchaseRepository.createMachinePurchase(machineRecord);
    }


    static async makeMachinePurchaseOrder(modelName: string, quantity: number): Promise<number> {
        const purchase: MachinePurchaseResponse = await THOHService.purchaseMachine(modelName, quantity);

        return this.recordMachinePurchase(purchase);
    }

    static async processPendingMachinePurchases() {
        const pendingMachinePurchase = await MachinePurchaseRepository.getPurchasesByStatus([Status.PendingPayment, Status.PendingDeliveryRequest, Status.PendingDeliveryPayment]);

        for (const machinePurchase of pendingMachinePurchase) {
            await this.proccessMachinePurchase(machinePurchase.machinePurchasesId!)
        }
    }

    static async proccessMachinePurchase(machinePurchaseId: number) {
        let machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machinePurchaseId);

        if (machinePurchase.status === Status.PendingPayment) {
            await this.makeMachinePurchasePayment(machinePurchase);

            machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machinePurchaseId)
        }
        if (machinePurchase.status === Status.PendingDeliveryRequest) {
            await this.makeMachineBulkDeliveryRequest(machinePurchase)
        }
        if (machinePurchase.status === Status.PendingDeliveryPayment) {
            await this.makeMachineBulkDeliveryPayement(machinePurchase)
        }
    }

    static async makeMachineBulkDeliveryRequest(machinePurchase: MachinePurchaseRecord) {
        const machine = await MachineRepository.getMachineByPhoneId(machinePurchase.phoneId)

        const result = await BulkDeliveriesAPI.requestDelivery(machinePurchase.reference, machinePurchase.machinesPurchased, "THOH");

        if (result.success && result.delivery_reference && result.cost && result.account_number) {
            await BulkDeliveryRepository.insertBulkDelivery(machinePurchase.machinePurchasesId!, result.delivery_reference, result.cost, "THOH", result.account_number);

            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, Status.PendingDeliveryPayment);
        }
    }

    static async makeMachineBulkDeliveryPayement(machinePurchase: MachinePurchaseRecord) {
        const bulkDelivery = await BulkDeliveryRepository.getDeliveryByPartsPurchaseId(machinePurchase.machinePurchasesId!);

        const result = await BankService.makePayment(bulkDelivery.deliveryReference, bulkDelivery.cost, bulkDelivery.accountNumber);

        if (result.success) {
            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, Status.PendingDeliveryDropOff);
        }
        else {
            throw new Error("Could not pay for machine delivery");
        }
    }

    static async makeMachinePurchasePayment(machinePurchase: MachinePurchaseRecord): Promise<void> {
        const result = await BankService.makePayment(machinePurchase.reference, machinePurchase.totalCost, machinePurchase.accountNumber)

        if (result.success) {
            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, machinePurchase.status);
        }
        else {
            throw new Error("Could not pay for machine");
        }
    }
}