import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
const router = Router();

router.post('/payment-made', PaymentController.updatePaymentStatus);

export default router;