import { Request, Response } from 'express';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { MachineRepository } from '../repositories/MachineRepository.js';
import { PhoneRepository } from '../repositories/PhoneRepository.js';
import { BadRequestError } from '../utils/errors.js';

export class MachineController {
	static async breakMachine(req: Request, res: Response): Promise<void> {
		try {
			const { machineName, failureQuantity } = req.body;
			
			const quantity = Number(failureQuantity);

			if (!machineName || !failureQuantity || isNaN(quantity))
				throw new BadRequestError();

			let phoneName = '';

			if (machineName === 'cosmos_z25_machine')
				phoneName = 'Cosmos Z25';
			if (machineName === 'cosmos_z25_ultra_machine')
				phoneName = 'Cosmos Z25 ultra';
			if (machineName === 'cosmos_z25_fe_machine')
				phoneName = 'Cosmos Z25 FE';

			const phone = await PhoneRepository.getPhoneByModel(phoneName);
			const phoneId = phone.phone_id;

			await MachineRepository.retireMachinesByPhoneId(phoneId, failureQuantity);

			handleSuccess(res, { message: `${quantity} machines for ${machineName} retired.` });
		} catch (error) {
			handleFailure(res, error, 'Error failing machine');
		}
	}
}