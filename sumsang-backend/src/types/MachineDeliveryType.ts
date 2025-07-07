export interface MachineDelivery {
    machineDeliveriesId: number;
    machinePurchasesId: number;
    deliveryReference: number;
    cost: number;
    unitsReceived: number;
    address: string;
    accountNumber: string;
    createdAt: Date;
}