import { Request, Response } from 'express';
import { 
    ConsumerDeliveriesResponse, 
    BulkDeliveriesResponse, 
    PurchaseCasesResponse, 
    PurchaseScreensResponse, 
    PurchaseElectronicsResponse, 
    MachinePurchaseResponse, 
    AvailableMachineResponse 
} from '../types/ExternalApiTypes.js';

export class TestConsumerDeliveriesController {
    static requestDelivery(req: Request, res: Response): void {
        const { quantity, companyName, recipient } = req.body;
        
        const response: ConsumerDeliveriesResponse = {
            success: true,
            referenceno: `REF-${Date.now()}`,
            amount: quantity * 50, // Mock cost of R150 per unit
            account_number: "100000000000"
        };
        
        res.json(response);
    }
}

export class TestBulkDeliveriesController {
    static requestPickup(req: Request, res: Response): void {
        const { originalExternalOrderId, originCompanyId, destinationCompanyId, items } = req.body;
        
        const totalCost = items.reduce((total: number, item: any) => {
            return total + (item.quantity * 5);
        }, 0);
        
        const response: BulkDeliveriesResponse = {
            success: true,
            pickupRequestId: Math.floor(Math.random() * 10000),
            cost: totalCost,
            paymentReferenceId: `PAY-${Date.now()}`,
            bulkLogisticsBankAccountNumber: "200000000000",
            status: "PENDING",
            statusCheckUrl: `http://localhost:3000/test-endpoints/bulkdeliveries/api/status/${Math.floor(Math.random() * 10000)}`
        };
        
        res.json(response);
    }
}

export class TestCommercialBankController {
    static makePayment(req: Request, res: Response): void {
        const { to_account_number, to_bank_name, amount, description } = req.body;
        
        const response = {
            success: true,
            message: "Payment successful",
            transactionId: `TXN-${Date.now()}`
        };
        
        res.json(response);
    }
    
    static openAccount(req: Request, res: Response): void {
        const response = {
            account_number: `ACC-${Date.now()}`
        };
        
        res.json(response);
    }
    
    static applyForLoan(req: Request, res: Response): void {
        const { amount } = req.body;
        
        const response = {
            success: true,
            loan_number: `LOAN-${Date.now()}`
        };
        
        res.json(response);
    }
    
    static getLoanInfo(req: Request, res: Response): void {
        const { loanNumber } = req.params;
        
        const response = {
            outstandingAmount: Math.floor(Math.random() * 100000) + 10000 // Random amount between 10k-110k
        };
        
        res.json(response);
    }
    
    static repayLoan(req: Request, res: Response): void {
        const { loan_number } = req.params;
        const { amount } = req.body;
        
        const response = {
            success: true,
            paid: amount
        };
        
        res.json(response);
    }
}

export class TestCaseSuppliersController {
    static purchaseCases(req: Request, res: Response): void {
        const { quantity } = req.body;
        
        const response: PurchaseCasesResponse = {
            id: Math.floor(Math.random() * 10000),
            order_status_id: 1,
            quantity: quantity,
            total_price: quantity * 25, // Mock cost of R25 per case
            bankNumber: "300000000000"
        };
        
        res.json(response);
    }
}

export class TestScreenSuppliersController {
    static purchaseScreens(req: Request, res: Response): void {
        const { quantity } = req.body;
        
        const response: PurchaseScreensResponse = {
            orderId: Math.floor(Math.random() * 10000),
            totalPrice: quantity * 20, // Mock cost of R20 per screen
            bankAccountNumber: "400000000000",
            orderStatusLink: `http://localhost:3000/test-endpoints/screen-suppliers/api/order/${Math.floor(Math.random() * 10000)}/status`
        };
        
        res.json(response);
    }
}

export class TestElectronicsSuppliersController {
    static purchaseElectronics(req: Request, res: Response): void {
        const { quantity } = req.body;
        
        const response: PurchaseElectronicsResponse = {
            orderId: Math.floor(Math.random() * 10000),
            amountDue: quantity * 30, // Mock cost of R30 per electronics unit
            bankNumber: "500000000000",
            quantity: quantity
        };
        
        res.json(response);
    }
}

export class TestTHOHController {
    static purchaseMachine(req: Request, res: Response): void {
        const { machineName, quantity } = req.body;
        
        const mockMachines = {
            "cosmos_z25_machine": { price: 20000, weight: 1800, materials: "cases,screens,electronics" },
            "cosmos_z25_fe_machine": { price: 30000, weight: 2500, materials: "cases,screens,electronics" },
            "cosmos_z25_ultra_machine": { price: 50000, weight: 3200, materials: "cases,screens,electronics" }
        };

        const machine = mockMachines[machineName as keyof typeof mockMachines] || mockMachines["cosmos_z25_machine"];
        
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
        
        res.json(response);
    }
    
    static getAvailableMachines(req: Request, res: Response): void {
        const response: AvailableMachineResponse = {
            machines: [
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
        };
        
        res.json(response);
    }
}