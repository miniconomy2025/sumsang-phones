import { PhoneRepository } from "../repositories/PhoneRepository.js";
import { MachineRepository } from "../repositories/MachineRepository.js";
import { CaseSuppliers, ScreenSuppliers, ElectronicsSuppliers } from "../utils/externalApis.js";

export class PricingService {

    private static async getPartCosts(): Promise<Map<number, number>> {
        console.log("PricingService::getPartCosts - Fetching current part costs from suppliers.");
        const partCosts = new Map<number, number>();

        
        // Fetch Case cost (partId: 1)
        try {
            const caseResponse = await CaseSuppliers.purchaseCases(1);
            if (caseResponse.success && caseResponse.cost) {
                partCosts.set(1, caseResponse.cost);
                console.log(`PricingService::getPartCosts - Fetched Case cost: ${caseResponse.cost}`);
            } else {
                console.error("PricingService::getPartCosts - Failed to fetch cost for Cases.");
            }
        } catch (error) {
            console.error("PricingService::getPartCosts - Error fetching cost for Cases:", error);
        }
        
        // Fetch Screen cost (partId: 2)
        try {
            const screenResponse = await ScreenSuppliers.purchaseScreens(1);
            if (screenResponse.success && screenResponse.cost) {
                partCosts.set(2, screenResponse.cost);
                 console.log(`PricingService::getPartCosts - Fetched Screen cost: ${screenResponse.cost}`);
            } else {
                console.error("PricingService::getPartCosts - Failed to fetch cost for Screens.");
            }
        } catch(error) {
             console.error("PricingService::getPartCosts - Error fetching cost for Screens:", error);
        }

        // Fetch Electronics cost (partId: 3)
        try {
            const electronicsResponse = await ElectronicsSuppliers.purchaseElectronics(1);
            if (electronicsResponse.success && electronicsResponse.cost) {
                partCosts.set(3, electronicsResponse.cost);
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

        // Step 1: Get price from 3 suppliers via 3 endpoint calls
        const partCosts = await this.getPartCosts();
        if (partCosts.size === 0) {
            console.error("PricingService::updatePhonePricesDaily - Could not retrieve any part costs. Aborting price update.");
            return;
        }

        // Step 2: Check machines + machine ratios table
        const allPhones = await PhoneRepository.getAllPhones();
        const activeMachines = await MachineRepository.getActiveMachines();

        // Create a map to easily find a representative machine for each phone model
        const phoneToMachineMap = new Map<number, number>();
        for (const machine of activeMachines) {
            if (!phoneToMachineMap.has(machine.phoneId)) {
                phoneToMachineMap.set(machine.phoneId, machine.machineId);
            }
        }

        for (const phone of allPhones) {
            // If the machine for a phone doesn't exist yet, don't calculate for that phone
            const representativeMachineId = phoneToMachineMap.get(phone.phone_id);

            if (!representativeMachineId) {
                continue;
            }

            // Get the parts required for a single phone of this model using our new repository method
            const ratios = await MachineRepository.getRatiosForMachine(representativeMachineId);
            
            if (ratios.length === 0) {
                console.warn(`PricingService::updatePhonePricesDaily - No part ratios found for machine ${representativeMachineId} (Phone: ${phone.model}). Skipping.`);
                continue;
            }

            // Step 3: Using that ratio and cost prices, calculate the total manufacturing cost
            let costPrice = 0;
            let calculationPossible = true;
            for (const ratio of ratios) {
                const partCost = partCosts.get(ratio.partId);
                if (partCost === undefined) {
                    calculationPossible = false;
                    break;
                }
                costPrice += ratio.quantity * partCost;
            }

            if (!calculationPossible) {
                continue; // Move to the next phone if a part cost was missing
            }

            // Step 4: Calculate selling price at 50% profit
            const profitMargin = 1.50; // 100% (cost) + 50% (profit)
            const newSellingPrice = costPrice * profitMargin;
            
            // Round to 2 decimal places for currency
            const finalPrice = Math.round(newSellingPrice * 100) / 100;

            // Step 5: Update the phone's selling price in the database
            await PhoneRepository.updatePhonePrice(phone.model, finalPrice);
        }

    }
}