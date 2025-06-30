import { Router } from 'express';
import { StockController } from '../controllers/StockController.js';
const router = Router();

router.get('/stock', StockController.getStock);

export default router;