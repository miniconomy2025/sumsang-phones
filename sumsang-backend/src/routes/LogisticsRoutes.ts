import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController.js';
import { verifyOU } from '../middleware/verifyOU.js';

const router = Router();

router.post('/logistics', verifyOU('consumer-logistics'), LogisticsController.handleLogistics);
router.post('/logistics/notification', verifyOU('consumer-logistics'), LogisticsController.handleNotification);

export default router;