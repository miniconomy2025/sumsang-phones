import { MachineInfo } from "../types/ExternalApiTypes.js";
import { THOHAPI } from "../utils/externalApis.js";

export class THOHService {
    static async purchaseMachine(machineName: string, quantity: number) {
        console.log('THOHService::purchaseMachine - Starting machine purchase', { machineName, quantity });
        
        const response = await THOHAPI.purchaseMachine(machineName, quantity);
        console.log('THOHService::purchaseMachine - Received purchase response', { response });

        if (!response.success) {
            console.log('THOHService::purchaseMachine - Purchase failed', { response });
            throw new Error("Failed to buy machine");
        }

        console.log('THOHService::purchaseMachine - Machine purchase successful');
        return response;
    }

    static async getAvailableMachines(): Promise<MachineInfo[]> {
        console.log('THOHService::getAvailableMachines - Starting available machines retrieval');
        
        const response = await THOHAPI.getAvailableMachines();
        // console.log('THOHService::getAvailableMachines - Received available machines response', { response });
        console.log('THOHService::getAvailableMachines - Received available machines response');

        if (!response) {
            console.log('THOHService::getAvailableMachines - Failed to get machines');
            throw new Error("failed to get machines");
        }

        console.log('THOHService::getAvailableMachines - Available machines retrieved successfully', { machinesCount: response.length });
        return response;
    }
}