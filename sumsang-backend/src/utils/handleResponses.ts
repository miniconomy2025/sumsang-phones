import { Response } from 'express';

export const handleSuccess = (res: Response, result: any) => {
	if (result === null || result === undefined) {
		return res.status(404).json('Result not found');
	}
	return res.status(200).json(result);
};

export const handleFailure = (res: Response, error: any, message: string) => {
	console.log(error);
	res.status(500).json({ message: message, error });
};
