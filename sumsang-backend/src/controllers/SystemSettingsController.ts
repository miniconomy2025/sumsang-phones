import { Request, Response } from 'express';
import { handleSuccess, handleFailure } from '../utils/handleResponses.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingRepository.js';
import { systemSettingKeys } from '../constants/SystemSettingKeys.js';

export class SystemSettingsController {
	static async getAccountNumber(req: Request, res: Response): Promise<void> {
		try {
			const accountNumber = SystemSettingsRepository.getByKey(
				systemSettingKeys.accountNumber
			);
			handleSuccess(res, accountNumber);
		} catch (error) {
			handleFailure(res, error, 'Error fetching account number');
		}
	}
}
