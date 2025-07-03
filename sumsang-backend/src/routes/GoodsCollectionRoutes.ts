import { Router } from 'express';
import { GoodsCollectionController } from '../controllers/GoodsCollectionController.js';

const router = Router();

router.post('/goods-collection', GoodsCollectionController.handleCollectionRequest);

export default router;