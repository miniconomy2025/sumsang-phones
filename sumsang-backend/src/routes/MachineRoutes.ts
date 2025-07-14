import { Router } from 'express';
import { MachineController } from '../controllers/MachineController.js';
import { verifyOU } from '../middleware/verifyOU.js';
import { OrganizationalUnit } from '../types/OrganizationalUnitOptions.js';
const router = Router();

router.post('/machines/failure', MachineController.breakMachine);

export default router;