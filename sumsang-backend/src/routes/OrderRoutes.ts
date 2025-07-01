import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';
const router = Router();

router.get('/order', OrderController.getOrders);
router.post('/order', OrderController.placeOrder);

export default router;