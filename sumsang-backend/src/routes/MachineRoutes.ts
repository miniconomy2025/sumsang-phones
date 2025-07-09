import { Router } from 'express';
import { MachineController } from '../controllers/MachineController.js';
const router = Router();

router.post('/machine-failure', MachineController.breakMachine);

export default router;