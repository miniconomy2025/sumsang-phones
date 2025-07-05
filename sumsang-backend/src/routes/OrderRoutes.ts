import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';
const router = Router();

router.post('/orders', OrderController.placeOrder);
router.post('/pop', OrderController.paymentMade);

export default router;