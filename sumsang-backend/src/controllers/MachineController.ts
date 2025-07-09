import { Request, Response } from 'express';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { MachineRepository } from '../repositories/MachineRepository.js';
import { PhoneRepository } from '../repositories/PhoneRepository.js';

export class MachineController {
	static async breakMachine(req: Request, res: Response): Promise<void> {
		try {
			const { machineName } = req.body;

			const phone = await PhoneRepository.getPhoneByModel(machineName);
			const phoneId = phone.phoneId;

			await MachineRepository.retireMachinesByPhoneId(phoneId);

			handleSuccess(res, { message: `All machines for ${machineName} retired.` });
		} catch (error) {
			handleFailure(res, error, 'Error failing machine');
		}
	}
}
