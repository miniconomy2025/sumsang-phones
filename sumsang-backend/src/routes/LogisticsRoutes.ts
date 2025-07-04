import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController.js';

const router = Router();

// Endpoint to INITIATE a delivery or pickup
// POST /public-api/logistics
// Body: { "id": 123, "type": "DELIVERY", "quantity": 2 }
router.post('/logistics', LogisticsController.handleLogisticsRequest);

// Endpoint to CONFIRM a collection or arrival
// POST /public-api/logistics/confirm
// Body: { "deliveryReference": 1678886400000, "type": "DELIVERY" }
router.post('/logistics/confirm', LogisticsController.handleConfirmation);

export default router;