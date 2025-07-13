import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { verifyOU } from '../middleware/verifyOU.js';
const router = Router();

router.post('/orders', verifyOU('thoh'), OrderController.placeOrder);

export default router;