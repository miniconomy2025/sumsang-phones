import { Router } from 'express';
import { StockController } from '../controllers/StockController.js';
const auth = require('../middleware/auth');
const router = Router();

router.get('/stock', auth, StockController.getStock);

export default router;