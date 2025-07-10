import { Request, Response } from 'express';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { MachineRepository } from '../repositories/MachineRepository.js';
import { PhoneRepository } from '../repositories/PhoneRepository.js';
import { BadRequestError } from '../utils/errors.js';

export class MachineController {
	static async breakMachine(req: Request, res: Response): Promise<void> {
		console.log('===== MachineController.breakMachine START =====');
		try {
			console.log('Request body:', req.body);
			const { machineName, failureQuantity } = req.body;
			console.log('Machine name:', machineName);
			console.log('Failure quantity:', failureQuantity);
			
			const quantity = Number(failureQuantity);
			console.log('Parsed quantity:', quantity);

			if (!machineName || !failureQuantity || isNaN(quantity)) {
				console.log('Invalid request parameters');
				throw new BadRequestError();
			}

			let phoneName = '';

			if (machineName === 'cosmos_z25_machine') {
				phoneName = 'Cosmos Z25';
			}
			if (machineName === 'cosmos_z25_ultra_machine') {
				phoneName = 'Cosmos Z25 ultra';
			}
			if (machineName === 'cosmos_z25_fe_machine') {
				phoneName = 'Cosmos Z25 FE';
			}

			console.log('Mapped phone name:', phoneName);

			console.log('Looking up phone by model...');
			const phone = await PhoneRepository.getPhoneByModel(phoneName);
			console.log('Phone found:', phone);
			const phoneId = phone.phone_id;
			console.log('Phone ID:', phoneId);

			console.log('Retiring machines...');
			await MachineRepository.retireMachinesByPhoneId(phoneId, failureQuantity);
			console.log('Machines retired successfully');

			const response = { message: `${quantity} machines for ${machineName} retired.` };
			console.log('Response:', response);
			handleSuccess(res, response);
		} catch (error) {
			console.log('Error in breakMachine:', error);
			handleFailure(res, error, 'Error failing machine');
		}
		console.log('===== MachineController.breakMachine END =====');
	}
}