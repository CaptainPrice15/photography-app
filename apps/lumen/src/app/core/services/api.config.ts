// Set this to your Render API URL after deployment
// e.g. 'https://lumen-api.onrender.com'
const PROD_API_ORIGIN = '';

export const API_ORIGIN = PROD_API_ORIGIN || '';
export const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';
