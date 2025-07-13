import { Router } from 'express';
import { MachineController } from '../controllers/MachineController.js';
import { verifyOU } from '../middleware/verifyOU.js';
const router = Router();

router.post('/machine-failure', verifyOU('thoh'), MachineController.breakMachine);

export default router;