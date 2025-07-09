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
import { MachineDeliveryRepository } from "../repositories/MachineDeliveryRepository.js";

export class MachinePurchaseService {

    static async recordMachinePurchase(machinePurchase: MachinePurchaseResponse): Promise<number> {
        // Map machineName to phoneId
        const phone = await PhoneRepository.getPhoneByModel(machinePurchase.machineName!);

        const machineRecord: MachinePurchaseRecord = {
            phoneId: phone.phone_id,
            machinesPurchased: machinePurchase.quantity!,
            totalCost: machinePurchase.totalPrice!,
            weightPerMachine: machinePurchase.unitWeight!,
            ratePerDay: machinePurchase.machineDetails!.productionRate,
            ratio: `${machinePurchase.machineDetails!.inputRatio.additionalProp1}|${machinePurchase.machineDetails!.inputRatio.additionalProp2}|${machinePurchase.machineDetails!.inputRatio.additionalProp3}`,
            status: Status.PendingPayment,
            accountNumber: machinePurchase.bankAccount!,
            reference: machinePurchase.orderId!
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

            machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machinePurchaseId);
        }
        if (machinePurchase.status === Status.PendingDeliveryRequest) {
            await this.makeMachineDeliveryRequest(machinePurchase)

            machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machinePurchaseId);
        }
        if (machinePurchase.status === Status.PendingDeliveryPayment) {
            await this.makeMachineDeliveryPayement(machinePurchase)

            machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machinePurchaseId);
        }
    }

    static async makeMachineDeliveryRequest(machinePurchase: MachinePurchaseRecord) {

        const result = await BulkDeliveriesAPI.requestMachineDelivery(machinePurchase.reference, machinePurchase.machinesPurchased, machinePurchase.weightPerMachine);

        if (result.success && result.pickupRequestId && result.cost && result.bulkLogisticsBankAccountNumber) {
            await MachineDeliveryRepository.insertMachineDelivery(machinePurchase.machinePurchasesId!, result.pickupRequestId! , result.cost, "thoh", result.bulkLogisticsBankAccountNumber);

            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, Status.PendingDeliveryPayment);
        }
    }

    static async makeMachineDeliveryPayement(machinePurchase: MachinePurchaseRecord) {
        const machineDelivery = await MachineDeliveryRepository.getDeliveryByDeliveryReference(machinePurchase.machinePurchasesId!);

        const result = await BankService.makePayment(machineDelivery!.deliveryReference, machineDelivery!.cost, machineDelivery!.accountNumber);

        if (result.success) {
            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, Status.PendingDeliveryDropOff);
        }
        else {
            // pass
        }
    }

    static async makeMachinePurchasePayment(machinePurchase: MachinePurchaseRecord): Promise<void> {
        const result = await BankService.makePayment(machinePurchase.reference, machinePurchase.totalCost, machinePurchase.accountNumber)

        if (result.success) {
            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, machinePurchase.status);
        }
        else {
            // pass
        }
    }
}