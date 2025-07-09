export const USE_DUMMY_DATA = false;
const isProduction = process.env.NODE_ENV === 'production';

export const BASE_URL = isProduction
	? 'https://sumsang-phones-api.projects.bbdgrad.com/internal-api'
	: 'http://localhost:3000/internal-api';

