import { Request, Response } from 'express';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { MachineRepository } from '../repositories/MachineRepository.js';
import { PhoneRepository } from '../repositories/PhoneRepository.js';
import { BadRequestError } from '../utils/errors.js';
import { MachinePurchaseService } from '../services/MachinePurchaseService.js';

export class MachineController {
	static async breakMachine(req: Request, res: Response): Promise<void> {
		console.log('===== MachineController.breakMachine START =====');
		try {
			const response = { message: `Noooo machines for whatever retired.` };

			console.log('Response:', response);
			handleSuccess(res, response);
			return;

			// console.log('Request body:', req.body);
			// const { itemName, failureQuantity } = req.body;
			// console.log('Machine name:', itemName);
			// console.log('Failure quantity:', failureQuantity);
			
			// const quantity = Number(failureQuantity);
			// console.log('Parsed quantity:', quantity);

			// if (!itemName || !failureQuantity || isNaN(quantity)) {
			// 	console.log('Invalid request parameters');
			// 	throw new BadRequestError();
			// }

			// let phoneName = '';

			// if (itemName === 'cosmos_z25_machine') {
			// 	phoneName = 'Cosmos Z25';
			// }
			// else if (itemName === 'cosmos_z25_ultra_machine') {
			// 	phoneName = 'Cosmos Z25 ultra';
			// }
			// else if (itemName === 'cosmos_z25_fe_machine') {
			// 	phoneName = 'Cosmos Z25 FE';
			// }
			// else {
			// 	return;
			// }

			// console.log('Mapped phone name:', phoneName);

			// console.log('Looking up phone by model...');
			// const phone = await PhoneRepository.getPhoneByModel(phoneName);
			// console.log('Phone found:', phone);
			// const phoneId = phone.phone_id;
			// console.log('Phone ID:', phoneId);

			// console.log('Retiring machines...');
			// await MachineRepository.retireMachinesByPhoneId(phoneId, failureQuantity);
			// console.log('Machines retired successfully');

			// const response = { message: `${quantity} machines for ${itemName} retired.` };

			// console.log('Response:', response);
			// handleSuccess(res, response);

			// console.log('MachineController::replacingmachines - Making machine purchase order', { itemName, quantity });
			// await MachinePurchaseService.makeMachinePurchaseOrder(itemName, quantity);
			// console.log('MachineController::replacingmachines - Machine purchase order completed');
			
			// console.log('MachineController::replacingmachines - Processing pending machine purchases');
			// await MachinePurchaseService.processPendingMachinePurchases();
			// console.log('MachineController::replacingmachines - Pending machine purchases processed');

		} catch (error) {
			console.log('Error in breakMachine:', error);
			handleFailure(res, error, 'Error failing machine');
		}
		console.log('===== MachineController.breakMachine END =====');
	}
}