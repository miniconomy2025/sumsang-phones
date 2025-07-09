import dotenv from 'dotenv';
dotenv.config();

export const simulation = {
	dayLengthMs: parseInt(process.env.DAY_LENGTH_MS || '120000'),
	dayCheckIntervalMs: parseInt(process.env.DAY_CHECK_INTERVAL_MS || '10000'),
};
