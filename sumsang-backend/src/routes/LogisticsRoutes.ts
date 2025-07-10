import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController.js';

const router = Router();

router.post('/logistics', LogisticsController.handleLogistics);
router.post('/logistics/notification', LogisticsController.handleNotification);

export default router;