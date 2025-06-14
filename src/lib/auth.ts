import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Types for authentication
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Token management
export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    // Also set as httpOnly cookies for better security (if your backend supports it)
    // For now, we'll use regular cookies that can be accessed by JS
    document.cookie = `access_token=${accessToken}; path=/; max-age=1800; SameSite=Lax`; // 30 minutes
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`; // 7 days
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear cookies as well
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'refresh_token=; path=/; max-age=0';
  }
};

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth header
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data;
          setTokens(access_token, newRefreshToken);
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/sign-in';
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  signUp: async (data: SignUpData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, data);
    return response.data;
  },

  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, data);
    const { access_token, refresh_token, token_type, user } = response.data;
    setTokens(access_token, refresh_token);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { token });
    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, { email });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  signOut: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await api.post('/auth/signout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
    clearTokens();
  },

  signOutAll: async () => {
    try {
      await api.post('/auth/signout-all');
    } catch (error) {
      console.error('Sign out all error:', error);
    }
    clearTokens();
  },

  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    
    const { access_token, refresh_token: newRefreshToken } = response.data;
    setTokens(access_token, newRefreshToken);
    return response.data;
  },
};

// Helper function to decode JWT and get expiry time
const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

// Helper function to check if token is about to expire (within 5 minutes)
const isTokenAboutToExpire = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = decoded.exp;
  const fiveMinutes = 5 * 60; // 5 minutes in seconds
  
  return (expiryTime - currentTime) <= fiveMinutes;
};

// Proactive token refresh
export const checkAndRefreshToken = async (): Promise<void> => {
  const accessToken = getAccessToken();
  
  if (!accessToken) return;
  
  if (isTokenAboutToExpire(accessToken)) {
    try {
      await authAPI.refreshToken();
    } catch (error) {
      console.error('Proactive token refresh failed:', error);
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export { api as authenticatedAPI }; 