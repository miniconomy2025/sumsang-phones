import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController.js';
import { verifyOU } from '../middleware/verifyOU.js';
import { OrganizationalUnit } from '../types/OrganizationalUnitOptions.js';
const router = Router();

router.post('/logistics',  verifyOU([OrganizationalUnit.consumerLogistics, OrganizationalUnit.bulkLogistics, OrganizationalUnit.sumsangCompany]), LogisticsController.handleLogistics);
router.post('/logistics/notification', verifyOU([OrganizationalUnit.consumerLogistics, OrganizationalUnit.sumsangCompany]), LogisticsController.handleNotification);

export default router;