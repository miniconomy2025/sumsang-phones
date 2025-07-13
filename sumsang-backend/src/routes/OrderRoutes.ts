import { Router } from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { verifyOU } from '../middleware/verifyOU.js';
import { OrganizationalUnit } from '../types/OrganizationalUnitOptions.js';
const router = Router();

router.post('/orders', verifyOU(OrganizationalUnit.thoh), OrderController.placeOrder);

export default router;