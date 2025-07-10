import { Request, Response } from 'express';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { systemSettingKeys } from '../constants/SystemSettingKeys.js';

export class SystemSettingsController {
	static async getAccountNumber(req: Request, res: Response): Promise<void> {
		console.log('===== SystemSettingsController.getAccountNumber START =====');
		try {
			console.log('Getting account number...');
			const accountNumber = SystemSettingsRepository.getByKey(
				systemSettingKeys.accountNumber
			);
			console.log('Account number retrieved:', accountNumber);
			handleSuccess(res, accountNumber);
		} catch (error) {
			console.log('Error getting account number:', error);
			handleFailure(res, error, 'Error fetching account number');
		}
		console.log('===== SystemSettingsController.getAccountNumber END =====');
	}
}