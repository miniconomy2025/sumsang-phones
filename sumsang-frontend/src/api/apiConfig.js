export const USE_DUMMY_DATA = true
export const USE_LOCAL_SERVER = true

export const BASE_URL = USE_LOCAL_SERVER
  ? 'http://localhost:3000/public-api'
  : 'https://your-hosted-api.com/internal-api'
