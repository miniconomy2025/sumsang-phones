export const USE_DUMMY_DATA = false;
const isProduction = process.env.NODE_ENV === 'production';

export const BASE_URL = isProduction
	? 'https://www.bbd-grad-project.co.za/internal-api'
	: 'http://localhost:3030/internal-api';

