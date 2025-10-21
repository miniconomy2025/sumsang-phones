import { PhoneRepository } from "../repositories/PhoneRepository.js";
import { MachineRepository } from "../repositories/MachineRepository.js";
import { CaseSuppliers, ScreenSuppliers, ElectronicsSuppliers } from "../utils/externalApis.js";
import { SupplierRepository } from "../repositories/SupplierRepository.js";
import { SimulationService } from "./SimulationService.js";

export class PricingService {

    private static async getPartCosts(): Promise<Map<number, number>> {
        console.log("PricingService::getPartCosts - Fetching current part costs from suppliers.");
        const partCosts = new Map<number, number>();

        
        // Fetch Case cost (partId: 1)
        try {
            const caseResponse = await CaseSuppliers.getCasesCost();
            if (caseResponse.success && caseResponse.cost) {
                partCosts.set(1, caseResponse.cost);
                await SupplierRepository.updateCost(caseResponse.cost, 1);
                console.log(`PricingService::getPartCosts - Fetched Case cost: ${caseResponse.cost}`);
            } else {
                console.error("PricingService::getPartCosts - Failed to fetch cost for Cases.");
            }
        } catch (error) {
            console.error("PricingService::getPartCosts - Error fetching cost for Cases:", error);
        }
        
        // Fetch Screen cost (partId: 2)
        try {
            const screenResponse = await ScreenSuppliers.getScreensCost();
            if (screenResponse.success && screenResponse.cost) {
                partCosts.set(2, screenResponse.cost);
                await SupplierRepository.updateCost(screenResponse.cost, 2);
                console.log(`PricingService::getPartCosts - Fetched Screen cost: ${screenResponse.cost}`);
            } else {
                console.error("PricingService::getPartCosts - Failed to fetch cost for Screens.");
            }
        } catch(error) {
             console.error("PricingService::getPartCosts - Error fetching cost for Screens:", error);
        }

        // Fetch Electronics cost (partId: 3)
        try {
            const electronicsResponse = await ElectronicsSuppliers.getElectronicsCost();
            if (electronicsResponse.success && electronicsResponse.cost) {
                partCosts.set(3, electronicsResponse.cost);
                await SupplierRepository.updateCost(electronicsResponse.cost, 3);
                console.log(`PricingService::getPartCosts - Fetched Electronics cost: ${electronicsResponse.cost}`);
            } else {
                console.error("PricingService::getPartCosts - Failed to fetch cost for Electronics.");
            }
        } catch(error) {
            console.error("PricingService::getPartCosts - Error fetching cost for Electronics:", error);
        }

        return partCosts;
    }

    public static async updatePhonePricesDaily(): Promise<void> {
        console.log("PricingService::updatePhonePricesDaily - Starting daily price update process.");

        // Step 1: Get price from 3 suppliers via 3 endpoint calls
        const partCosts = await this.getPartCosts();
        if (partCosts.size === 0) {
            console.log("PricingService::updatePhonePricesDaily - Could not retrieve any part costs. Aborting price update.");
            return;
        }

        // Step 2: Check machines + machine ratios table
        console.log("PricingService::updatePhonePricesDaily - Fetching all phones and active machines.");
        const allPhones = await PhoneRepository.getAllPhones();
        const activeMachines = await MachineRepository.getActiveMachines();

        // Create a map to easily find a representative machine for each phone model
        const phoneToMachineMap = new Map<number, number>();
        for (const machine of activeMachines) {
            if (!phoneToMachineMap.has(machine.phoneId)) {
                phoneToMachineMap.set(machine.phoneId, machine.machineId);
            }
        }

        console.log(`PricingService::updatePhonePricesDaily - Mapping complete. Found ${phoneToMachineMap.size} phone-to-machine mappings.`);

        if (phoneToMachineMap.size == 0)
            await SimulationService.orderInitialMachines();

        for (const phone of allPhones) {
            const representativeMachineId = phoneToMachineMap.get(phone.phone_id);

            if (!representativeMachineId) {
                console.log(`PricingService::updatePhonePricesDaily - No active machine found for phone model '${phone.model}' (ID: ${phone.phone_id}). Skipping.`);
                continue;
            }

            console.log(`PricingService::updatePhonePricesDaily - Fetching part ratios for machine ID ${representativeMachineId} (Phone: ${phone.model}).`);
            const ratios = await MachineRepository.getRatiosForMachine(representativeMachineId);
            
            if (ratios.length === 0) {
                console.log(`PricingService::updatePhonePricesDaily - No part ratios found for machine ${representativeMachineId} (Phone: ${phone.model}). Skipping.`);
                continue;
            }

            // Step 3: Using that ratio and cost prices, calculate the total manufacturing cost
            let costPrice = 0;
            let calculationPossible = true;
            for (const ratio of ratios) {
                const partCost = partCosts.get(ratio.partId);
                if (partCost === undefined) {
                    console.log(`PricingService::updatePhonePricesDaily - Missing cost data for part ID ${ratio.partId}. Skipping phone model '${phone.model}'.`);
                    calculationPossible = false;
                    break;
                }
                costPrice += ratio.quantity * partCost;
            }

            if (!calculationPossible) {
                continue;
            }

            console.log(`PricingService::updatePhonePricesDaily - Total cost to manufacture phone '${phone.model}': ${costPrice}`);

            // Step 4: Calculate selling price at 50% profit
            const profitMargin = 1.50;
            const finalPrice = Math.ceil(costPrice * profitMargin);

            console.log(`PricingService::updatePhonePricesDaily - Final price for phone '${phone.model}' after 50% profit margin: ${finalPrice}`);

            // Step 5: Update the phone's selling price in the database
            await PhoneRepository.updatePhonePrice(phone.model, finalPrice);
            console.log(`PricingService::updatePhonePricesDaily - Updated price for phone '${phone.model}' to ${finalPrice}.`);
        }

        console.log("PricingService::updatePhonePricesDaily - Daily price update process completed.");
    }
}