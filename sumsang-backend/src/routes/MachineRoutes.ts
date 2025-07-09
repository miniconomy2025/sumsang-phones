import { Router } from 'express';
import { MachineController } from '../controllers/MachineController.js';
const router = Router();

router.post('/machines/actions/fail', MachineController.breakMachine);

export default router;
