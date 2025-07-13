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
        // console.log('MachinePurchaseService::recordMachinePurchase - Starting machine purchase recording', { machinePurchase });
        console.log('MachinePurchaseService::recordMachinePurchase - Starting machine purchase recording', machinePurchase.orderId );

        let modelName = '';

        if (machinePurchase.machineName === 'cosmos_z25_machine')
            modelName = 'Cosmos Z25';
        else if (machinePurchase.machineName === 'cosmos_z25_ultra_machine')
            modelName = 'Cosmos Z25 Ultra';
        else if (machinePurchase.machineName === 'cosmos_z25_fe_machine')
            modelName = 'Cosmos Z25 FE';

        console.log(`SimulationService::orderInitialMachines - Phone model: ${modelName} for machine name: ${machinePurchase.machineName}`);

        // Map machineName to phoneId
        const phone = await PhoneRepository.getPhoneByModel(modelName);
        console.log('MachinePurchaseService::recordMachinePurchase - Found phone for machine', { phone });

        const machineRecord: MachinePurchaseRecord = {
            phoneId: phone.phone_id,
            machinesPurchased: machinePurchase.quantity!,
            totalCost: machinePurchase.totalPrice!,
            weightPerMachine: machinePurchase.unitWeight!,
            ratePerDay: machinePurchase.machineDetails!.productionRate,
            ratio: `${machinePurchase.machineDetails!.inputRatio.cases}|${machinePurchase.machineDetails!.inputRatio.screens}|${machinePurchase.machineDetails!.inputRatio.electronics}`,
            status: Status.PendingPayment,
            accountNumber: machinePurchase.bankAccount!,
            reference: machinePurchase.orderId!
        };

        console.log('MachinePurchaseService::recordMachinePurchase - Created machine record', { machineRecord });

        // Save machine purchase to DB
        const result = await MachinePurchaseRepository.createMachinePurchase(machineRecord);
        console.log('MachinePurchaseService::recordMachinePurchase - Machine purchase saved to DB', { result });
        
        return result;
    }

    static async makeMachinePurchaseOrder(machineName: string, quantity: number): Promise<number> {
        console.log('MachinePurchaseService::makeMachinePurchaseOrder - Starting machine purchase order', { machineName, quantity });
        
        const purchase: MachinePurchaseResponse = await THOHService.purchaseMachine(machineName, quantity);
        console.log('MachinePurchaseService::makeMachinePurchaseOrder - Received purchase response', { purchase });

        const result = await this.recordMachinePurchase(purchase);
        console.log('MachinePurchaseService::makeMachinePurchaseOrder - Machine purchase order completed', { result });
        
        return result;
    }

    static async processPendingMachinePurchases() {
        console.log('MachinePurchaseService::processPendingMachinePurchases - Starting to process pending machine purchases');
        
        const pendingMachinePurchase = await MachinePurchaseRepository.getPurchasesByStatus([Status.PendingPayment, Status.PendingDeliveryRequest, Status.PendingDeliveryPayment]);
        console.log('MachinePurchaseService::processPendingMachinePurchases - Found pending purchases', { count: pendingMachinePurchase.length });

        for (const machinePurchase of pendingMachinePurchase) {
            console.log('MachinePurchaseService::processPendingMachinePurchases - Processing purchase', { machinePurchaseId: machinePurchase.machinePurchasesId });
            await this.proccessMachinePurchase(machinePurchase.machinePurchasesId!)
        }
        
        console.log('MachinePurchaseService::processPendingMachinePurchases - Completed processing pending purchases');
    }

    static async proccessMachinePurchase(machinePurchaseId: number) {
        console.log('MachinePurchaseService::proccessMachinePurchase - Starting to process machine purchase', { machinePurchaseId });
        
        let machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machinePurchaseId);
        console.log('MachinePurchaseService::proccessMachinePurchase - Retrieved machine purchase', { machinePurchase });

        if (machinePurchase.status === Status.PendingPayment) {
            console.log('MachinePurchaseService::proccessMachinePurchase - Processing pending payment');
            await this.makeMachinePurchasePayment(machinePurchase);

            machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machinePurchaseId);
            console.log('MachinePurchaseService::proccessMachinePurchase - Updated machine purchase after payment', { status: machinePurchase.status });
        }
        
        if (machinePurchase.status === Status.PendingDeliveryRequest) {
            console.log('MachinePurchaseService::proccessMachinePurchase - Processing pending delivery request');
            await this.makeMachineDeliveryRequest(machinePurchase)

            machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machinePurchaseId);
            console.log('MachinePurchaseService::proccessMachinePurchase - Updated machine purchase after delivery request', { status: machinePurchase.status });
        }
        
        if (machinePurchase.status === Status.PendingDeliveryPayment) {
            console.log('MachinePurchaseService::proccessMachinePurchase - Processing pending delivery payment');
            await this.makeMachineDeliveryPayement(machinePurchase)

            machinePurchase = await MachinePurchaseRepository.getMachinePurchaseById(machinePurchaseId);
            console.log('MachinePurchaseService::proccessMachinePurchase - Updated machine purchase after delivery payment', { status: machinePurchase.status });
        }
        
        console.log('MachinePurchaseService::proccessMachinePurchase - Completed processing machine purchase', { finalStatus: machinePurchase.status });
    }

    static async makeMachineDeliveryRequest(machinePurchase: MachinePurchaseRecord) {
        console.log('MachinePurchaseService::makeMachineDeliveryRequest - Starting machine delivery request', { machinePurchase });

        const result = await BulkDeliveriesAPI.requestMachineDelivery(machinePurchase.reference, machinePurchase.machinesPurchased, machinePurchase.weightPerMachine);
        console.log('MachinePurchaseService::makeMachineDeliveryRequest - Received delivery request response', { result });

        if (result.success && result.pickupRequestId && result.cost && result.bulkLogisticsBankAccountNumber) {
            console.log('MachinePurchaseService::makeMachineDeliveryRequest - Delivery request successful, inserting delivery record');
            
            await MachineDeliveryRepository.insertMachineDelivery(machinePurchase.machinePurchasesId!, result.pickupRequestId! , result.cost, "thoh", result.bulkLogisticsBankAccountNumber);
            console.log('MachinePurchaseService::makeMachineDeliveryRequest - Machine delivery record inserted');

            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, Status.PendingDeliveryPayment);
            console.log('MachinePurchaseService::makeMachineDeliveryRequest - Updated status to PendingDeliveryPayment');
        } else {
            console.log('MachinePurchaseService::makeMachineDeliveryRequest - Delivery request failed or incomplete');
        }
    }

    static async makeMachineDeliveryPayement(machinePurchase: MachinePurchaseRecord) {
        console.log('MachinePurchaseService::makeMachineDeliveryPayement - Starting machine delivery payment', { machinePurchase });
        
        const machineDelivery = await MachineDeliveryRepository.getDeliveryByMachinePurchaseId(machinePurchase.machinePurchasesId!);
        console.log('MachinePurchaseService::makeMachineDeliveryPayement - Retrieved machine delivery', { machineDelivery });

        const result = await BankService.makePayment(machineDelivery!.deliveryReference, machineDelivery!.cost, machineDelivery!.accountNumber);
        console.log('MachinePurchaseService::makeMachineDeliveryPayement - Payment result', { result });

        if (result.success) {
            console.log('MachinePurchaseService::makeMachineDeliveryPayement - Payment successful, updating status');
            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, Status.PendingDeliveryDropOff);
            console.log('MachinePurchaseService::makeMachineDeliveryPayement - Status updated to PendingDeliveryDropOff');
        }
        else {
            console.log('MachinePurchaseService::makeMachineDeliveryPayement - Payment failed, no status update');
        }
    }

    static async makeMachinePurchasePayment(machinePurchase: MachinePurchaseRecord): Promise<void> {
        console.log('MachinePurchaseService::makeMachinePurchasePayment - Starting machine purchase payment', { machinePurchase });
        
        const result = await BankService.makePayment(machinePurchase.reference, machinePurchase.totalCost, machinePurchase.accountNumber)
        console.log('MachinePurchaseService::makeMachinePurchasePayment - Payment result', { result });

        if (result.success) {
            console.log('MachinePurchaseService::makeMachinePurchasePayment - Payment successful, updating status');
            await MachinePurchaseRepository.updateStatus(machinePurchase.machinePurchasesId!, Status.PendingDeliveryRequest);
            console.log('MachinePurchaseService::makeMachinePurchasePayment - Status updated to PendingDeliveryRequest');
        }
        else {
            console.log('MachinePurchaseService::makeMachinePurchasePayment - Payment failed, no status update');
        }
    }
}