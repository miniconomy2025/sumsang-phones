import { Router } from 'express';
import {
    TestConsumerDeliveriesController,
    TestBulkDeliveriesController,
    TestCommercialBankController,
    TestCaseSuppliersController,
    TestScreenSuppliersController,
    TestElectronicsSuppliersController,
    TestTHOHController,
    ManualTestEndpoints,
    TestRetailBankController
} from './testController.js';

const router = Router();

// =============================== Manual test endpoints =======================================
router.post('/manual-tick', ManualTestEndpoints.manualTick);

// ============================== Simulated test endpoints ===================================== 

// Consumer Deliveries API routes
router.post('/consumerdeliveries/api/pickups', TestConsumerDeliveriesController.requestDelivery);

// Bulk Deliveries API routes
router.post('/bulkdeliveries/api/pickup-request', TestBulkDeliveriesController.requestPickup);

// Commercial Bank API routes
router.post('/commercialbank/api/make-payment', TestCommercialBankController.makePayment);
router.post('/commercialbank/api/account', TestCommercialBankController.openAccount);
router.post('/commercialbank/api/loan', TestCommercialBankController.applyForLoan);
router.get('/commercialbank/api/loan/:loanNumber', TestCommercialBankController.getLoanInfo);
router.post('/commercialbank/api/loan/:loan_number/pay', TestCommercialBankController.repayLoan);

// Retail Bank API routes
router.post('/retail-bank/api/transfers', TestRetailBankController.requestTransfer);

// Case Suppliers API routes
router.get('/case-suppliers/api/cases', TestCaseSuppliersController.getCasesCost);
router.post('/case-suppliers/api/orders', TestCaseSuppliersController.purchaseCases);

// Screen Suppliers API routes
router.get('/screen-suppliers/api/screens', TestScreenSuppliersController.getScreensCost);
router.post('/screen-suppliers/api/order', TestScreenSuppliersController.purchaseScreens);

// Electronics Suppliers API routes
router.get('/electronics-suppliers/api/electronics', TestElectronicsSuppliersController.getElectronicsCost);
router.post('/electronics-suppliers/api/orders', TestElectronicsSuppliersController.purchaseElectronics);

// THOH API routes
router.post('/thoh/api/machines', TestTHOHController.purchaseMachine);
router.get('/thoh/api/machines', TestTHOHController.getAvailableMachines);

export default router;