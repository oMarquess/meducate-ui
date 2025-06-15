// Production Backend Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://meducate-4b014c640ca1.herokuapp.com';

// Specific endpoints
export const API_ENDPOINT = `${API_BASE_URL}/labs/interpret`;

// Other configuration constants
export const APP_CONFIG = {
  production: {
    baseURL: 'https://meducate-4b014c640ca1.herokuapp.com',
  },
  development: {
    baseURL: 'http://localhost:8000',
  }
};

// Get the appropriate base URL based on environment
export const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return APP_CONFIG.production.baseURL;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || APP_CONFIG.development.baseURL;
};

