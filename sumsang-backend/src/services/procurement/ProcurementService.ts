import { CaseSupplier } from "./strategies/CaseSupplier.js";
import { ElectronicSupplier } from "./strategies/ElectronicsSupplier.js";
import { ScreenSupplier } from "./strategies/ScreenSupplier.js";


export class ProcurementService {
    static async procureElectronics(amount: number) {
        const electronicsSupplier = new ElectronicSupplier();
        await electronicsSupplier.purchaseParts(amount);
    }

    static async procureCases(amount: number) {
        const caseSupplier = new CaseSupplier();
        await caseSupplier.purchaseParts(amount);
    }

    static async procureScreens(amount: number) {
        const screenSupplier = new ScreenSupplier();
        await screenSupplier.purchaseParts(amount);
    }
}