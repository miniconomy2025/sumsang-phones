import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController.js';

const router = Router();

router.post('/logistics', LogisticsController.handleLogistics);

export default router;