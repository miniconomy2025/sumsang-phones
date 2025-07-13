import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController.js';
import { verifyOU } from '../middleware/verifyOU.js';
import { OrganizationalUnit } from '../types/OrganizationalUnitOptions.js';

const router = Router();

router.post('/logistics', verifyOU(OrganizationalUnit.consumerLogistics), LogisticsController.handleLogistics);
router.post('/logistics/notification', verifyOU(OrganizationalUnit.consumerLogistics), LogisticsController.handleNotification);

export default router;