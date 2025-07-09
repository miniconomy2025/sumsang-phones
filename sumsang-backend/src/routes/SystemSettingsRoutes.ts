import express from 'express';
import { SystemSettingsController } from '../controllers/SystemSettingsController.js';

const router = express.Router();

router.get('/account/number', SystemSettingsController.getAccountNumber);

export default router;
