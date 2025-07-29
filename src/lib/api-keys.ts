import { authenticatedAPI } from './auth';

// Types
export interface ApiKey {
  id: string;
  key_name: string;
  key_prefix: string;
  permissions: {
    async_interpret: boolean;
    read: boolean;
    write: boolean;
  };
  created_at: string;
  last_used: string | null;
  status: 'active' | 'revoked';
  usage_count: number;
}

export interface CreateApiKeyRequest {
  key_name: string;
  permissions: {
    async_interpret: boolean;
    read: boolean;
    write: boolean;
  };
}

export interface CreateApiKeyResponse {
  api_key: string;
  key_id: string;
  key_name: string;
  permissions: {
    async_interpret: boolean;
    read: boolean;
    write: boolean;
  };
  message: string;
}

export interface ApiKeyUsage {
  key_id: string;
  key_name: string;
  usage_stats: {
    total_requests: number;
    requests_today: number;
    requests_this_month: number;
    last_used: string | null;
  };
  rate_limits: {
    requests_per_hour: number;
    requests_per_day: number;
    concurrent_jobs: number;
  };
  current_usage: {
    requests_this_hour: number;
    requests_today: number;
    active_jobs: number;
  };
}

export interface ApiKeysUsageSummary {
  total_keys: number;
  active_keys: number;
  total_requests: number;
  requests_today: number;
  requests_this_month: number;
  usage_by_key: ApiKeyUsage[];
}

// API Keys service
export const apiKeysAPI = {
  // Create a new API key
  createKey: async (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    const response = await authenticatedAPI.post('/api-keys/create', data);
    return response.data;
  },

  // List all API keys for the user
  listKeys: async (): Promise<ApiKey[]> => {
    const response = await authenticatedAPI.get('/api-keys/list');
    return response.data;
  },

  // Get details of a specific API key
  getKeyDetails: async (keyId: string): Promise<ApiKey> => {
    const response = await authenticatedAPI.get(`/api-keys/${keyId}`);
    return response.data;
  },

  // Revoke an API key
  revokeKey: async (keyId: string): Promise<{ message: string; status: string }> => {
    const response = await authenticatedAPI.delete(`/api-keys/${keyId}`);
    return response.data;
  },

  // Get usage statistics for a specific API key
  getKeyUsage: async (keyId: string, days: number = 30): Promise<ApiKeyUsage> => {
    const response = await authenticatedAPI.get(`/api-keys/${keyId}/usage?days=${days}`);
    return response.data;
  },

  // Get usage summary for all API keys
  getUsageSummary: async (): Promise<ApiKeysUsageSummary> => {
    const response = await authenticatedAPI.get('/api-keys/usage/summary');
    return response.data;
  },

  // Test API key authentication
  testKeyAuth: async (apiKey: string): Promise<{ message: string; user: any }> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api-keys/auth/test`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error('API key authentication failed');
    }
    
    return response.json();
  },
};

// Utility functions
export const formatApiKey = (key: string): string => {
  if (key.length <= 8) return key;
  return `${key.substring(0, 8)}...${key.substring(key.length - 6)}`;
};

export const validateApiKey = (key: string): boolean => {
  // Basic validation - API keys should start with 'sk-' and be at least 20 characters
  return key.startsWith('sk-') && key.length >= 20;
};

export const getApiKeyPermissions = (permissions: any): string[] => {
  const permissionNames: { [key: string]: string } = {
    async_interpret: 'Async Interpretation',
    read: 'Read Access',
    write: 'Write Access',
  };

  return Object.entries(permissions)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => permissionNames[key] || key);
}; 