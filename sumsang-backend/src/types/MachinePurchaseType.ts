export interface MachinePurchaseRecord {
    machinePurchasesId?: number;
    phoneId: number;
    machinesPurchased: number;
    totalCost: number;
    weightPerMachine: number;
    ratePerDay: number;
    ratio: string;
    status: number;
    accountNumber: string;
    reference: number;
}