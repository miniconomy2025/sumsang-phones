import { Request, Response } from 'express';

export class TestEndpointsController {
    // Consumer Deliveries API - POST /test-endpoints/consumerdeliveries/api/delivery-request
    static consumerDeliveryRequest(req: Request, res: Response) {
        console.log('====== CONSUMER DELIVERY REQUEST ======');
        console.log('consumerDeliveryRequest: Starting...');
        console.log('consumerDeliveryRequest: Request body:', req.body);
        
        try {
            const { order_id, units, destination } = req.body;
            console.log('consumerDeliveryRequest: Extracted parameters - order_id:', order_id, 'units:', units, 'destination:', destination);
            
            // Simulate processing delay
            console.log('consumerDeliveryRequest: Simulating 500ms processing delay...');
            setTimeout(() => {
                const response = {
                    success: true,
                    delivery_reference: Math.floor(Math.random() * 1000000) + 100000,
                    cost: units * 15,
                    account_number: "100000000000",
                    message: `Delivery scheduled for order ${order_id} with ${units} units to ${destination}`
                };
                
                console.log('consumerDeliveryRequest: Generated response:', response);
                console.log('consumerDeliveryRequest: Sending 200 response');
                console.log('====== CONSUMER DELIVERY REQUEST COMPLETE ======');
                res.status(200).json(response);
            }, 500);
        } catch (error) {
            console.error('consumerDeliveryRequest: Error occurred:', error);
            console.log('====== CONSUMER DELIVERY REQUEST COMPLETE ======');
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Bulk Deliveries API - POST /test-endpoints/bulkdeliveries/api/delivery-request
    static bulkDeliveryRequest(req: Request, res: Response) {
        console.log('====== BULK DELIVERY REQUEST ======');
        console.log('bulkDeliveryRequest: Starting...');
        console.log('bulkDeliveryRequest: Request body:', req.body);
        
        try {
            const { order_id, units, destination, from } = req.body;
            console.log('bulkDeliveryRequest: Extracted parameters - order_id:', order_id, 'units:', units, 'destination:', destination, 'from:', from);
            
            // Simulate processing delay
            console.log('bulkDeliveryRequest: Simulating 700ms processing delay...');
            setTimeout(() => {
                const response = {
                    success: true,
                    delivery_reference: Math.floor(Math.random() * 1000000) + 200000,
                    cost: units * 10,
                    account_number: "200000000000",
                    message: `Bulk delivery scheduled for order ${order_id} with ${units} units from ${from} to ${destination}`
                };
                
                console.log('bulkDeliveryRequest: Generated response:', response);
                console.log('bulkDeliveryRequest: Sending 200 response');
                console.log('====== BULK DELIVERY REQUEST COMPLETE ======');
                res.status(200).json(response);
            }, 700);
        } catch (error) {
            console.error('bulkDeliveryRequest: Error occurred:', error);
            console.log('====== BULK DELIVERY REQUEST COMPLETE ======');
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Commercial Bank API - POST /test-endpoints/commercialbank/api/make-payment
    static makePayment(req: Request, res: Response) {
        console.log('====== COMMERCIAL BANK MAKE PAYMENT ======');
        console.log('makePayment: Starting...');
        console.log('makePayment: Request body:', req.body);
        
        try {
            const { reference_number, amount, account_number } = req.body;
            console.log('makePayment: Extracted parameters - reference_number:', reference_number, 'amount:', amount, 'account_number:', account_number);
            
            // Simulate processing delay
            console.log('makePayment: Simulating 1000ms processing delay...');
            setTimeout(() => {
                // Simulate occasional payment failures for testing
                const failureChance = Math.random();
                console.log('makePayment: Failure chance roll:', failureChance);
                
                if (failureChance < 0.001) {
                    console.log('makePayment: Simulating payment failure - insufficient funds');
                    return res.status(200).json({
                        success: false,
                        message: "Insufficient funds"
                    });
                }
                
                const response = {
                    success: true,
                    message: `Payment of ${amount} processed successfully for reference ${reference_number} to account ${account_number}`
                };
                
                console.log('makePayment: Generated response:', response);
                console.log('makePayment: Sending 200 response');
                console.log('====== COMMERCIAL BANK MAKE PAYMENT COMPLETE ======');
                res.status(200).json(response);
            }, 1000);
        } catch (error) {
            console.error('makePayment: Error occurred:', error);
            console.log('====== COMMERCIAL BANK MAKE PAYMENT COMPLETE ======');
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Case Suppliers API - POST /test-endpoints/case-suppliers/api/purchase
    static purchaseCases(req: Request, res: Response) {
        console.log('====== CASE SUPPLIERS PURCHASE ======');
        console.log('purchaseCases: Starting...');
        console.log('purchaseCases: Request body:', req.body);
        
        try {
            const { quantity } = req.body;
            console.log('purchaseCases: Extracted parameters - quantity:', quantity);
            
            // Simulate processing delay
            console.log('purchaseCases: Simulating 600ms processing delay...');
            setTimeout(() => {
                const response = {
                    success: true,
                    reference_number: Math.floor(Math.random() * 1000000) + 300000,
                    cost: quantity * 25.00,
                    account_number: "300000000000",
                    message: `Purchase order created for ${quantity} cases`
                };
                
                console.log('purchaseCases: Generated response:', response);
                console.log('purchaseCases: Cost calculation - quantity:', quantity, 'x $25.00 = $', response.cost);
                console.log('purchaseCases: Sending 200 response');
                console.log('====== CASE SUPPLIERS PURCHASE COMPLETE ======');
                res.status(200).json(response);
            }, 600);
        } catch (error) {
            console.error('purchaseCases: Error occurred:', error);
            console.log('====== CASE SUPPLIERS PURCHASE COMPLETE COMPLETE ======');
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Screen Suppliers API - POST /test-endpoints/screen-suppliers/api/purchase
    static purchaseScreens(req: Request, res: Response) {
        console.log('====== SCREEN SUPPLIERS PURCHASE ======');
        console.log('purchaseScreens: Starting...');
        console.log('purchaseScreens: Request body:', req.body);
        
        try {
            const { quantity } = req.body;
            console.log('purchaseScreens: Extracted parameters - quantity:', quantity);
            
            // Simulate processing delay
            console.log('purchaseScreens: Simulating 800ms processing delay...');
            setTimeout(() => {
                const response = {
                    success: true,
                    reference_number: Math.floor(Math.random() * 1000000) + 400000,
                    cost: quantity * 25.00,
                    account_number: "400000000000",
                    message: `Purchase order created for ${quantity} screens`
                };
                
                console.log('purchaseScreens: Generated response:', response);
                console.log('purchaseScreens: Cost calculation - quantity:', quantity, 'x $25.00 = $', response.cost);
                console.log('purchaseScreens: Sending 200 response');
                console.log('====== SCREEN SUPPLIERS PURCHASE COMPLETE ======');
                res.status(200).json(response);
            }, 800);
        } catch (error) {
            console.error('purchaseScreens: Error occurred:', error);
            console.log('====== SCREEN SUPPLIERS PURCHASE COMPLETE ======');
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Electronics Suppliers API - POST /test-endpoints/electronics-suppliers/api/purchase
    static purchaseElectronics(req: Request, res: Response) {
        console.log('====== ELECTRONICS SUPPLIERS PURCHASE ======');
        console.log('purchaseElectronics: Starting...');
        console.log('purchaseElectronics: Request body:', req.body);
        
        try {
            const { quantity } = req.body;
            console.log('purchaseElectronics: Extracted parameters - quantity:', quantity);
            
            // Simulate processing delay
            console.log('purchaseElectronics: Simulating 900ms processing delay...');
            setTimeout(() => {
                const response = {
                    success: true,
                    reference_number: Math.floor(Math.random() * 1000000) + 500000,
                    cost: quantity * 25.00,
                    account_number: "500000000000",
                    message: `Purchase order created for ${quantity} electronics components`
                };
                
                console.log('purchaseElectronics: Generated response:', response);
                console.log('purchaseElectronics: Cost calculation - quantity:', quantity, 'x $25.00 = $', response.cost);
                console.log('purchaseElectronics: Sending 200 response');
                console.log('====== ELECTRONICS SUPPLIERS PURCHASE COMPLETE ======');
                res.status(200).json(response);
            }, 900);
        } catch (error) {
            console.error('purchaseElectronics: Error occurred:', error);
            console.log('====== ELECTRONICS SUPPLIERS PURCHASE COMPLETE ======');
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Health check endpoint
    static healthCheck(req: Request, res: Response) {
        console.log('====== HEALTH CHECK ======');
        console.log('healthCheck: Starting...');
        console.log('healthCheck: Request received');
        
        const response = {
            status: "healthy",
            message: "Test endpoints are running",
            timestamp: new Date().toISOString()
        };
        
        console.log('healthCheck: Generated response:', response);
        console.log('healthCheck: Sending 200 response');
        res.status(200).json(response);
    }
}