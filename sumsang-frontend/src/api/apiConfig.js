export const USE_DUMMY_DATA = false;
export const USE_LOCAL_SERVER = true;

export const BASE_URL = USE_LOCAL_SERVER
	? 'http://localhost:3000/internal-api'
	: 'https://your-hosted-api.com/internal-api';
