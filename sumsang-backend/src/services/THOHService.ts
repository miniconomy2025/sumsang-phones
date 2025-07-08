import { AvailableMachineResponse } from "../types/ExternalApiTypes.js";
import { THOHAPI } from "../utils/externalApis.js";


export class THOHService {
    static async purchaseMachine(machineName: string, quantity: number) {
        const response = THOHAPI.purchaseMachine(machineName, quantity);

        if (!response) {
            throw new Error("Failed to buy machine");
        }

        return response;
    }

    static async getAvailableMachines(): Promise<AvailableMachineResponse[]> {
        const response = THOHAPI.getAvailableMachines();

        if (!response) {
            throw new Error("failed to get machines");
        }

        return response;
    }

}