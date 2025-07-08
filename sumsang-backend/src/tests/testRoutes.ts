import { Router } from 'express';
import { TestEndpointsController } from './testController.js';

const router = Router();

// Consumer Deliveries Routes
router.post('/consumerdeliveries/api/delivery-request', TestEndpointsController.consumerDeliveryRequest);

// Bulk Deliveries Routes
router.post('/bulkdeliveries/api/delivery-request', TestEndpointsController.bulkDeliveryRequest);

// Commercial Bank Routes
router.post('/commercialbank/api/make-payment', TestEndpointsController.makePayment);

// Case Suppliers Routes
router.post('/case-suppliers/api/purchase', TestEndpointsController.purchaseCases);

// Screen Suppliers Routes
router.post('/screen-suppliers/api/purchase', TestEndpointsController.purchaseScreens);

// Electronics Suppliers Routes
router.post('/electronics-suppliers/api/purchase', TestEndpointsController.purchaseElectronics);

// Health check route
router.get('/health', TestEndpointsController.healthCheck);

export default router;