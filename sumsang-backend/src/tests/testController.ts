import { Request, Response } from 'express';
import { 
    ConsumerDeliveriesResponse, 
    BulkDeliveriesResponse, 
    PurchaseCasesResponse, 
    PurchaseScreensResponse, 
    PurchaseElectronicsResponse, 
    MachinePurchaseResponse, 
    MachineInfo
} from '../types/ExternalApiTypes.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { DailyTasksService } from '../services/DailyTasks.js';
import { handleSuccess } from '../utils/handleResponses.js';

// ======================== Manual test endpoints ==============================
export class ManualTestEndpoints {
  static async manualTick(req: Request, res: Response) {
    console.log('===== ManualTestEndpoints.manualTick START =====');
    console.log('Checking and updating day...');
    const isNextDay: boolean = await SystemSettingsRepository.checkAndUpdateDay();
    console.log('Is next day:', isNextDay);
    if (isNextDay) {
      console.log('Executing daily tasks...');
      await DailyTasksService.executeDailyTasks();
      console.log('Daily tasks executed');
    }
    console.log('===== ManualTestEndpoints.manualTick END =====');

    handleSuccess(res, { message: 'Tick-ed succesfully.'})
  }

}

// ====================== Simulated test endpoints ==============================
export class TestConsumerDeliveriesController {
    static async requestDelivery(req: Request, res: Response) {
        console.log('===== TestConsumerDeliveriesController.requestDelivery START =====');
        console.log('Request body:', req.body);
        const { quantity, companyName, recipient } = req.body;
        console.log('Quantity:', quantity);
        console.log('Company name:', companyName);
        console.log('Recipient:', recipient);
        
        const response: ConsumerDeliveriesResponse = {
            success: true,
            referenceNo: `REF-${Date.now()}`,
            amount: quantity * 50, // Mock cost of R150 per unit
            accountNumber: "100000000000"
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestConsumerDeliveriesController.requestDelivery END =====');
    }
}

export class TestBulkDeliveriesController {
    static async requestPickup(req: Request, res: Response) {
        console.log('===== TestBulkDeliveriesController.requestPickup START =====');
        console.log('Request body:', req.body);
        const { originalExternalOrderId, originCompanyId, destinationCompanyId, items } = req.body;
        console.log('Original external order ID:', originalExternalOrderId);
        console.log('Origin company ID:', originCompanyId);
        console.log('Destination company ID:', destinationCompanyId);
        console.log('Items:', items);
        
        const totalCost = items.reduce((total: number, item: any) => {
            return total + (item.quantity * 5);
        }, 0);
        console.log('Total cost calculated:', totalCost);
        
        const response: BulkDeliveriesResponse = {
            success: true,
            pickupRequestId: Math.floor(Math.random() * 10000),
            cost: totalCost,
            paymentReferenceId: `PAY-${Date.now()}`,
            bulkLogisticsBankAccountNumber: "200000000000",
            status: "PENDING",
            statusCheckUrl: `http://localhost:3000/test-endpoints/bulkdeliveries/api/status/${Math.floor(Math.random() * 10000)}`
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestBulkDeliveriesController.requestPickup END =====');
    }
}

export class TestCommercialBankController {
    static async makePayment(req: Request, res: Response) {
        console.log('===== TestCommercialBankController.makePayment START =====');
        console.log('Request body:', req.body);
        const { to_account_number, to_bank_name, amount, description } = req.body;
        console.log('To account number:', to_account_number);
        console.log('To bank name:', to_bank_name);
        console.log('Amount:', amount);
        console.log('Description:', description);
        
        const response = {
            success: true,
            message: "Payment successful",
            transactionId: `TXN-${Date.now()}`
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestCommercialBankController.makePayment END =====');
    }
    
    static async openAccount(req: Request, res: Response) {
        console.log('===== TestCommercialBankController.openAccount START =====');
        console.log('Request body:', req.body);
        const response = {
            account_number: `ACC-${Date.now()}`
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestCommercialBankController.openAccount END =====');
    }
    
    static async applyForLoan(req: Request, res: Response) {
        console.log('===== TestCommercialBankController.applyForLoan START =====');
        console.log('Request body:', req.body);
        const { amount } = req.body;
        console.log('Loan amount:', amount);
        
        const response = {
            success: true,
            loan_number: `LOAN-${Date.now()}`
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestCommercialBankController.applyForLoan END =====');
    }
    
    static async getLoanInfo(req: Request, res: Response) {
        console.log('===== TestCommercialBankController.getLoanInfo START =====');
        console.log('Request params:', req.params);
        const { loanNumber } = req.params;
        console.log('Loan number:', loanNumber);
        
        const response = {
            outstandingAmount: Math.floor(Math.random() * 100000) + 10000 // Random amount between 10k-110k
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestCommercialBankController.getLoanInfo END =====');
    }
    
    static async repayLoan(req: Request, res: Response) {
        console.log('===== TestCommercialBankController.repayLoan START =====');
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        const { loan_number } = req.params;
        const { amount } = req.body;
        console.log('Loan number:', loan_number);
        console.log('Repayment amount:', amount);
        
        const response = {
            success: true,
            paid: amount
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestCommercialBankController.repayLoan END =====');
    }
}

export class TestRetailBankController {
    static async requestTransfer(req: Request, res: Response) {
        console.log('===== TestRetailBankController.requestTransfer START =====');
        console.log('Request body:', req.body);

        const { from, to, AmountCents, reference } = req.body;

        console.log(`From: ${from}, To: ${to}, Amount (cents): ${AmountCents}, Reference: ${reference}`);

        // Simulate insufficient funds for small random percentage of requests
        const simulateInsufficientFunds = Math.random() < 0.02;

        if (simulateInsufficientFunds) {
            console.log('Simulating insufficient funds');

            res.status(409).end();
            console.log('===== TestRetailBankController.requestTransfer END =====');
            return;
        }

        console.log('Response:', 'Ok');
        res.status(200).end();
        console.log('===== TestRetailBankController.requestTransfer END =====');
    }
}


export class TestCaseSuppliersController {
    static async getCasesCost(req: Request, res: Response) {
        console.log('===== TestSupplierPricingController.getCasesCost START =====');

        const response = {
            available_units: 800,
            price_per_unit: 25
        };

        console.log('Response:', response);
        res.json(response);

        console.log('===== TestSupplierPricingController.getCasesCost END =====');
    }

    static async purchaseCases(req: Request, res: Response) {
        console.log('===== TestCaseSuppliersController.purchaseCases START =====');
        console.log('Request body:', req.body);
        const { quantity } = req.body;
        console.log('Quantity:', quantity);
        
        const response: PurchaseCasesResponse = {
            id: Math.floor(Math.random() * 10000),
            order_status_id: 1,
            quantity: quantity,
            total_price: quantity * 25, // Mock cost of R25 per case
            bankNumber: "300000000000"
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestCaseSuppliersController.purchaseCases END =====');
    }
}

export class TestScreenSuppliersController {
    static async getScreensCost(req: Request, res: Response) {
        console.log('===== TestSupplierPricingController.getScreensCost START =====');

        const response = {
            screens: {
                quantity: 500,
                price: 20
            }
        };

        console.log('Response:', response);
        res.json(response);

        console.log('===== TestSupplierPricingController.getScreensCost END =====');
    }

    static async purchaseScreens(req: Request, res: Response) {
        console.log('===== TestScreenSuppliersController.purchaseScreens START =====');
        console.log('Request body:', req.body);
        const { quantity } = req.body;
        console.log('Quantity:', quantity);
        
        const response: PurchaseScreensResponse = {
            orderId: Math.floor(Math.random() * 10000),
            totalPrice: quantity * 20, // Mock cost of R20 per screen
            bankAccountNumber: "400000000000",
            orderStatusLink: `http://localhost:3000/test-endpoints/screen-suppliers/api/order/${Math.floor(Math.random() * 10000)}/status`
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestScreenSuppliersController.purchaseScreens END =====');
    }
}

export class TestElectronicsSuppliersController {
    static async getElectronicsCost(req: Request, res: Response) {
        console.log('===== TestSupplierPricingController.getElectronicsCost START =====');

        const response = {
            availableStock: 1000,
            pricePerUnit: 30 // mock cost of R30 per unit
        };

        console.log('Response:', response);
        res.json(response);

        console.log('===== TestSupplierPricingController.getElectronicsCost END =====');
    }
    
    static async purchaseElectronics(req: Request, res: Response) {
        console.log('===== TestElectronicsSuppliersController.purchaseElectronics START =====');
        console.log('Request body:', req.body);
        const { quantity } = req.body;
        console.log('Quantity:', quantity);
        
        const response: PurchaseElectronicsResponse = {
            orderId: Math.floor(Math.random() * 10000),
            amountDue: quantity * 30, // Mock cost of R30 per electronics unit
            bankNumber: "500000000000",
            quantity: quantity
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestElectronicsSuppliersController.purchaseElectronics END =====');
    }
}

export class TestTHOHController {
    static async purchaseMachine(req: Request, res: Response) {
        console.log('===== TestTHOHController.purchaseMachine START =====');
        console.log('Request body:', req.body);
        const { machineName, quantity } = req.body;
        console.log('Machine name:', machineName);
        console.log('Quantity:', quantity);
        
        const mockMachines = {
            "cosmos_z25_machine": { price: 20000, weight: 1800, materials: "cases,screens,electronics" },
            "cosmos_z25_fe_machine": { price: 30000, weight: 2500, materials: "cases,screens,electronics" },
            "cosmos_z25_ultra_machine": { price: 50000, weight: 3200, materials: "cases,screens,electronics" }
        };
        console.log('Mock machines data:', mockMachines);

        const machine = mockMachines[machineName as keyof typeof mockMachines] || mockMachines["cosmos_z25_machine"];
        console.log('Selected machine:', machine);
        
        const response: MachinePurchaseResponse = {
            success: true,
            orderId: Math.floor(Math.random() * 10000),
            machineName: machineName,
            totalPrice: machine.price * quantity,
            unitWeight: machine.weight,
            totalWeight: machine.weight * quantity,
            quantity: quantity,
            machineDetails: {
                requiredMaterials: machine.materials,
                inputRatio: {
                    additionalProp1: 1,
                    additionalProp2: 3,
                    additionalProp3: 2
                },
                productionRate: 30
            },
            bankAccount: "THOH-BANK"
        };
        
        console.log('Response:', response);
        res.json(response);
        console.log('===== TestTHOHController.purchaseMachine END =====');
    }
    
    static async getAvailableMachines(req: Request, res: Response) {
        console.log('===== TestTHOHController.getAvailableMachines START =====');
        console.log('Getting available machines...');
        const machines: MachineInfo[] = 
            [
                {
                    machineName: "cosmos_z25_machine",
                    quantity: 100,
                    materialRatio: "1:3:2 (cases:screens:electronics)",
                    productionRate: 30,
                    price: 20000
                },
                {
                    machineName: "cosmos_z25_fe_machine",
                    quantity: 100,
                    materialRatio: "1:3:2 (cases:screens:electronics)",
                    productionRate: 30,
                    price: 30000
                },
                {
                    machineName: "cosmos_z25_ultra_machine",
                    quantity: 100,
                    materialRatio: "1:3:2 (cases:screens:electronics)",
                    productionRate: 30,
                    price: 50000
                }
            ]
        ;
        
        console.log('Response:', machines);
        res.json(machines);
        console.log('===== TestTHOHController.getAvailableMachines END =====');
    }
}