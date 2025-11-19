"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Code, 
  Play, 
  Copy, 
  Check, 
  AlertTriangle, 
  Key,
  FileText,
  Users,
  CreditCard,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  requestBody?: {
    type: string;
    description: string;
    example: any;
  };
  responses?: {
    code: number;
    description: string;
    example: any;
  }[];
}

const endpoints: Endpoint[] = [
  // Authentication Endpoints
  {
    method: 'POST',
    path: '/auth/signup',
    description: 'Create a new user account',
    category: 'Authentication',
    requiresAuth: false,
    requestBody: {
      type: 'application/json',
      description: 'User registration data',
      example: {
        email: 'user@example.com',
        password: 'securepassword123',
        username: 'john_doe'
      }
    },
    responses: [
      {
        code: 201,
        description: 'User created successfully',
        example: {
          message: 'User created successfully',
          user: {
            id: 'user_123',
            email: 'user@example.com',
            username: 'john_doe'
          }
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/auth/signin',
    description: 'Authenticate user and get access token',
    category: 'Authentication',
    requiresAuth: false,
    requestBody: {
      type: 'application/json',
      description: 'User credentials',
      example: {
        email: 'user@example.com',
        password: 'securepassword123'
      }
    },
    responses: [
      {
        code: 200,
        description: 'Authentication successful',
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'refresh_token_here',
          user: {
            id: 'user_123',
            email: 'user@example.com',
            username: 'john_doe'
          }
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/auth/verify-email',
    description: 'Verify user email address',
    category: 'Authentication',
    requiresAuth: false,
    requestBody: {
      type: 'application/json',
      description: 'Email verification token',
      example: {
        token: 'verification_token_here'
      }
    },
    responses: [
      {
        code: 200,
        description: 'Email verified successfully',
        example: {
          message: 'Email verified successfully'
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/auth/forgot-password',
    description: 'Request password reset email',
    category: 'Authentication',
    requiresAuth: false,
    requestBody: {
      type: 'application/json',
      description: 'Email address for password reset',
      example: {
        email: 'user@example.com'
      }
    },
    responses: [
      {
        code: 200,
        description: 'Password reset email sent',
        example: {
          message: 'Password reset email sent successfully'
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/auth/reset-password',
    description: 'Reset password with token',
    category: 'Authentication',
    requiresAuth: false,
    requestBody: {
      type: 'application/json',
      description: 'Password reset data',
      example: {
        token: 'reset_token_here',
        new_password: 'newsecurepassword123'
      }
    },
    responses: [
      {
        code: 200,
        description: 'Password reset successful',
        example: {
          message: 'Password reset successfully'
        }
      }
    ]
  },
  {
    method: 'GET',
    path: '/auth/validate-reset-token',
    description: 'Validate password reset token',
    category: 'Authentication',
    requiresAuth: false,
    parameters: [
      {
        name: 'token',
        type: 'string',
        required: true,
        description: 'Password reset token'
      }
    ],
    responses: [
      {
        code: 200,
        description: 'Token is valid',
        example: {
          valid: true,
          message: 'Token is valid'
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/auth/refresh-token',
    description: 'Refresh access token',
    category: 'Authentication',
    requiresAuth: false,
    requestBody: {
      type: 'application/json',
      description: 'Refresh token',
      example: {
        refresh_token: 'refresh_token_here'
      }
    },
    responses: [
      {
        code: 200,
        description: 'Token refreshed successfully',
        example: {
          access_token: 'new_access_token_here',
          refresh_token: 'new_refresh_token_here'
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/auth/logout',
    description: 'Logout user and invalidate tokens',
    category: 'Authentication',
    requiresAuth: true,
    responses: [
      {
        code: 200,
        description: 'Logout successful',
        example: {
          message: 'Logged out successfully'
        }
      }
    ]
  },
  {
    method: 'GET',
    path: '/auth/me',
    description: 'Get current user profile',
    category: 'Authentication',
    requiresAuth: true,
    responses: [
      {
        code: 200,
        description: 'User profile retrieved',
        example: {
          user: {
            id: 'user_123',
            email: 'user@example.com',
            username: 'john_doe',
            created_at: '2024-01-15T10:30:00Z'
          }
        }
      }
    ]
  },

  // Labs Endpoints
  {
    method: 'POST',
    path: '/labs/interpret',
    description: 'Interpret lab results synchronously',
    category: 'Labs',
    requiresAuth: true,
    requestBody: {
      type: 'multipart/form-data',
      description: 'Lab document and interpretation parameters',
      example: {
        file: '[File upload]',
        educational_level: 'medical_student',
        language: 'english',
        technical_level: 'intermediate'
      }
    },
    responses: [
      {
        code: 200,
        description: 'Interpretation completed',
        example: {
          interpretation: 'The lab results show...',
          confidence_score: 0.95,
          processing_time: 2.3
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/labs/async-interpret',
    description: 'Start asynchronous lab interpretation',
    category: 'Labs',
    requiresAuth: true,
    requestBody: {
      type: 'multipart/form-data',
      description: 'Lab document and interpretation parameters',
      example: {
        file: '[File upload]',
        educational_level: 'medical_student',
        language: 'english',
        technical_level: 'intermediate'
      }
    },
    responses: [
      {
        code: 202,
        description: 'Interpretation job started',
        example: {
          job_id: 'job_abc123',
          status: 'processing',
          estimated_completion: '2024-01-20T15:30:00Z'
        }
      }
    ]
  },
  {
    method: 'GET',
    path: '/labs/async-interpret/{job_id}',
    description: 'Get async interpretation job status and results',
    category: 'Labs',
    requiresAuth: true,
    parameters: [
      {
        name: 'job_id',
        type: 'string',
        required: true,
        description: 'Job ID from async interpretation'
      }
    ],
    responses: [
      {
        code: 200,
        description: 'Job status and results',
        example: {
          job_id: 'job_abc123',
          status: 'completed',
          result: {
            interpretation: 'The lab results show...',
            confidence_score: 0.95
          },
          created_at: '2024-01-20T14:30:00Z',
          completed_at: '2024-01-20T15:30:00Z'
        }
      }
    ]
  },

  // API Key Management
  {
    method: 'GET',
    path: '/api-keys',
    description: 'List all API keys for the user',
    category: 'API Keys',
    requiresAuth: true,
    responses: [
      {
        code: 200,
        description: 'List of API keys',
        example: {
          api_keys: [
            {
              id: 'key_123',
              key_name: 'Production Key',
              key_prefix: 'sk-...abc123',
              permissions: {
                async_interpret: true,
                read: true,
                write: true
              },
              created_at: '2024-01-15T10:30:00Z',
              last_used: '2024-01-20T14:22:00Z',
              status: 'active'
            }
          ]
        }
      }
    ]
  },
  {
    method: 'POST',
    path: '/api-keys',
    description: 'Create a new API key',
    category: 'API Keys',
    requiresAuth: true,
    requestBody: {
      type: 'application/json',
      description: 'API key creation parameters',
      example: {
        key_name: 'My API Key',
        permissions: {
          async_interpret: true,
          read: true,
          write: false
        }
      }
    },
    responses: [
      {
        code: 201,
        description: 'API key created successfully',
        example: {
          api_key: 'sk-abc123def456ghi789...',
          key_id: 'key_123',
          key_name: 'My API Key',
          permissions: {
            async_interpret: true,
            read: true,
            write: false
          },
          message: 'API key created successfully'
        }
      }
    ]
  },
  {
    method: 'DELETE',
    path: '/api-keys/{key_id}',
    description: 'Revoke an API key',
    category: 'API Keys',
    requiresAuth: true,
    parameters: [
      {
        name: 'key_id',
        type: 'string',
        required: true,
        description: 'API key ID to revoke'
      }
    ],
    responses: [
      {
        code: 200,
        description: 'API key revoked successfully',
        example: {
          message: 'API key revoked successfully'
        }
      }
    ]
  },
  {
    method: 'GET',
    path: '/api-keys/{key_id}/usage',
    description: 'Get API key usage statistics',
    category: 'API Keys',
    requiresAuth: true,
    parameters: [
      {
        name: 'key_id',
        type: 'string',
        required: true,
        description: 'API key ID'
      }
    ],
    responses: [
      {
        code: 200,
        description: 'Usage statistics',
        example: {
          key_id: 'key_123',
          key_name: 'Production Key',
          usage_stats: {
            total_requests: 45,
            requests_today: 12,
            requests_this_month: 156,
            last_used: '2024-01-20T14:22:00Z'
          },
          rate_limits: {
            requests_per_hour: 100,
            requests_per_day: 1000,
            concurrent_jobs: 10
          },
          current_usage: {
            requests_this_hour: 8,
            requests_today: 12,
            active_jobs: 2
          }
        }
      }
    ]
  },

  // Billing & Usage
  {
    method: 'GET',
    path: '/billing/usage',
    description: 'Get current billing usage and limits',
    category: 'Billing',
    requiresAuth: true,
    responses: [
      {
        code: 200,
        description: 'Billing usage information',
        example: {
          current_period: {
            start: '2024-01-01T00:00:00Z',
            end: '2024-01-31T23:59:59Z'
          },
          usage: {
            interpretations: 45,
            async_interpretations: 12,
            api_requests: 156
          },
          limits: {
            interpretations_per_month: 1000,
            async_interpretations_per_month: 100,
            api_requests_per_month: 10000
          },
          plan: 'free'
        }
      }
    ]
  },
  {
    method: 'GET',
    path: '/billing/history',
    description: 'Get billing history and invoices',
    category: 'Billing',
    requiresAuth: true,
    responses: [
      {
        code: 200,
        description: 'Billing history',
        example: {
          invoices: [
            {
              id: 'inv_123',
              amount: 29.99,
              currency: 'USD',
              status: 'paid',
              created_at: '2024-01-01T00:00:00Z',
              period: 'January 2024'
            }
          ]
        }
      }
    ]
  },

  // Health & Status
  {
    method: 'GET',
    path: '/health',
    description: 'Check API health status',
    category: 'Health',
    requiresAuth: false,
    responses: [
      {
        code: 200,
        description: 'API is healthy',
        example: {
          status: 'healthy',
          timestamp: '2024-01-20T15:30:00Z',
          version: '1.0.0'
        }
      }
    ]
  },
  {
    method: 'GET',
    path: '/',
    description: 'API root endpoint',
    category: 'Health',
    requiresAuth: false,
    responses: [
      {
        code: 200,
        description: 'API information',
        example: {
          name: 'Meducate API',
          version: '1.0.0',
          description: 'Medical lab interpretation API',
          documentation: 'https://api.meducate.com/docs'
        }
      }
    ]
  }
];

const categories = [
  { id: 'authentication', name: 'Authentication', icon: Users, color: 'text-blue-500' },
  { id: 'labs', name: 'Labs', icon: FileText, color: 'text-green-500' },
  { id: 'api-keys', name: 'API Keys', icon: Key, color: 'text-orange-500' },
  { id: 'billing', name: 'Billing', icon: CreditCard, color: 'text-purple-500' },
  { id: 'health', name: 'Health', icon: Activity, color: 'text-gray-500' }
];

export default function ApiDocsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('authentication');
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const filteredEndpoints = endpoints.filter(ep => 
    ep.category.toLowerCase() === selectedCategory
  );

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-600 mt-2">
            Integrate Meducate&apos;s lab interpretation capabilities into your applications
          </p>
        </div>
        <Button 
          onClick={() => window.open('/api-keys', '_blank')}
          className="flex items-center gap-2"
        >
          <Key className="w-4 h-4" />
          Manage API Keys
        </Button>
      </div>

      {!user && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to access the API. Please sign in to get your API key.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${category.color}`} />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* API Key Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Key Setup
              </CardTitle>
              <CardDescription>
                Add your API key to test the endpoints below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey, 'key')}
                      disabled={!apiKey}
                    >
                      {copied === 'key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Don&apos;t have an API key?{' '}
                  <button
                    onClick={() => window.open('/api-keys', '_blank')}
                    className="text-blue-600 hover:underline"
                  >
                    Generate one here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {categories.find(c => c.id === selectedCategory)?.name} Endpoints
            </h2>
            
            {filteredEndpoints.map((endpoint, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedEndpoint(endpoint)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    {endpoint.requiresAuth && (
                      <Badge variant="secondary" className="text-xs">
                        Auth Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{endpoint.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Endpoint Details Modal */}
      {selectedEndpoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getMethodColor(selectedEndpoint.method)}>
                    {selectedEndpoint.method}
                  </Badge>
                  <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                    {selectedEndpoint.path}
                  </code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEndpoint(null)}
                >
                  ×
                </Button>
              </div>
              <p className="text-gray-600 mt-2">{selectedEndpoint.description}</p>
            </div>

            <div className="p-6">
              <Tabs defaultValue="try-it" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="try-it" className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Try it out
                  </TabsTrigger>
                  <TabsTrigger value="docs" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Documentation
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="try-it" className="space-y-4">
                  {!apiKey ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Please add your API key above to test this endpoint.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Request URL</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={`https://meducate-4b014c640ca1.herokuapp.com${selectedEndpoint.path}`}
                            readOnly
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(
                              `https://meducate-4b014c640ca1.herokuapp.com${selectedEndpoint.path}`,
                              'url'
                            )}
                          >
                            {copied === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      {selectedEndpoint.requestBody && (
                        <div>
                          <Label>Request Body</Label>
                          <Textarea
                            className="mt-1 font-mono text-sm"
                            rows={8}
                            value={JSON.stringify(selectedEndpoint.requestBody.example, null, 2)}
                            readOnly
                          />
                        </div>
                      )}

                      <div>
                        <Label>Headers</Label>
                        <div className="mt-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded min-w-[120px]">
                              Authorization
                            </code>
                            <Input
                              value={`Bearer ${apiKey}`}
                              readOnly
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(`Bearer ${apiKey}`, 'auth')}
                            >
                              {copied === 'auth' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded min-w-[120px]">
                              Content-Type
                            </code>
                            <Input
                              value={selectedEndpoint.requestBody?.type || 'application/json'}
                              readOnly
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>

                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Send Request
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="docs" className="space-y-4">
                  {selectedEndpoint.parameters && (
                    <div>
                      <h3 className="font-semibold mb-2">Parameters</h3>
                      <div className="space-y-2">
                        {selectedEndpoint.parameters.map((param, index) => (
                          <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded">
                            <div className="min-w-[100px]">
                              <code className="text-sm font-semibold">{param.name}</code>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {param.required ? 'Required' : 'Optional'}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">{param.description}</p>
                              <p className="text-xs text-gray-500 mt-1">Type: {param.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEndpoint.requestBody && (
                    <div>
                      <h3 className="font-semibold mb-2">Request Body</h3>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600 mb-2">{selectedEndpoint.requestBody.description}</p>
                        <p className="text-xs text-gray-500">Content-Type: {selectedEndpoint.requestBody.type}</p>
                      </div>
                    </div>
                  )}

                  {selectedEndpoint.responses && (
                    <div>
                      <h3 className="font-semibold mb-2">Responses</h3>
                      <div className="space-y-3">
                        {selectedEndpoint.responses.map((response, index) => (
                          <div key={index} className="border rounded">
                            <div className="bg-gray-50 px-3 py-2 border-b">
                              <Badge className="bg-green-100 text-green-800">
                                {response.code}
                              </Badge>
                              <span className="ml-2 text-sm">{response.description}</span>
                            </div>
                            <div className="p-3">
                              <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
                                {JSON.stringify(response.example, null, 2)}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 