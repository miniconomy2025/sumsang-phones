import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
const router = Router();

router.get('/supply-chain', DashboardController.getSupplyChain);
router.get('/sales', DashboardController.getSales);
router.get('/financial', DashboardController.getFinancials);
router.get('/logistics', DashboardController.getLogistics);
router.get('/stock-stats', DashboardController.getStockStats);

export default router;