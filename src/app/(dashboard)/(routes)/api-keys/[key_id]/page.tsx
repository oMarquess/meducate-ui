"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, Copy, Trash2, Eye, EyeOff, Activity, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { apiKeysAPI, ApiKey, ApiKeyUsage } from '@/lib/api-keys';

export default function ApiKeyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useAuth();
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [usage, setUsage] = useState<ApiKeyUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullKey, setShowFullKey] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const keyId = params.key_id as string;

  useEffect(() => {
    if (!authLoading && isSignedIn && keyId) {
      fetchKeyDetails();
      fetchKeyUsage();
    }
  }, [authLoading, isSignedIn, keyId]);

  const fetchKeyDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiKeysAPI.getKeyDetails(keyId);
      setApiKey(response);
    } catch (err: any) {
      setError('Failed to load API key details');
      console.error('Error fetching key details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKeyUsage = async () => {
    try {
      const response = await apiKeysAPI.getKeyUsage(keyId);
      setUsage(response);
    } catch (err: any) {
      console.error('Error fetching key usage:', err);
    }
  };

  const revokeKey = async () => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone and will immediately invalidate the key.')) {
      return;
    }

    try {
      setIsRevoking(true);
      await apiKeysAPI.revokeKey(keyId);
      
      setApiKey(prev => prev ? { ...prev, status: 'revoked' as const } : null);
      toast.success('API key revoked successfully');
    } catch (err: any) {
      toast.error('Failed to revoke API key');
      console.error('Error revoking key:', err);
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastUsed = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const getUsagePercentage = (current: number, limit: number): number => {
    return Math.min((current / limit) * 100, 100);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access API key details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/sign-in'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading API key details...</p>
        </div>
      </div>
    );
  }

  if (error || !apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || 'API key not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/api-keys')}>
              Back to API Keys
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/api-keys')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to API Keys</span>
          </Button>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{apiKey.key_name}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                {apiKey.status === 'active' ? 'Active' : 'Revoked'}
              </Badge>
              <span className="text-gray-600">Created {formatDate(apiKey.created_at)}</span>
            </div>
          </div>
          {apiKey.status === 'active' && (
            <Button
              variant="outline"
              onClick={revokeKey}
              disabled={isRevoking}
              className="text-red-600 hover:text-red-700"
            >
              {isRevoking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Trash2 className="h-4 w-4 mr-2" />
              Revoke Key
            </Button>
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* API Key Display */}
            <Card>
              <CardHeader>
                <CardTitle>API Key</CardTitle>
                <CardDescription>
                  Use this key to authenticate your API requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input
                    value={showFullKey ? apiKey.key_prefix : 'sk-...' + apiKey.key_prefix.slice(-6)}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullKey(!showFullKey)}
                  >
                    {showFullKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey.key_prefix)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Include this key in your requests using the <code className="bg-gray-100 px-1 rounded">X-API-Key</code> header
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Total Requests</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {usage?.usage_stats.total_requests || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Last Used</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {formatLastUsed(apiKey.last_used)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-600">Status</span>
                  </div>
                  <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                    {apiKey.status === 'active' ? 'Active' : 'Revoked'}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            {usage ? (
              <>
                {/* Current Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Usage</CardTitle>
                    <CardDescription>
                      Real-time usage statistics for this API key
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Requests this hour</span>
                          <span className="text-sm text-gray-900">
                            {usage.current_usage.requests_this_hour} / {usage.rate_limits.requests_per_hour}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(usage.current_usage.requests_this_hour, usage.rate_limits.requests_per_hour)} 
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Requests today</span>
                          <span className="text-sm text-gray-900">
                            {usage.current_usage.requests_today} / {usage.rate_limits.requests_per_day}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(usage.current_usage.requests_today, usage.rate_limits.requests_per_day)} 
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Active jobs</span>
                          <span className="text-sm text-gray-900">
                            {usage.current_usage.active_jobs} / {usage.rate_limits.concurrent_jobs}
                          </span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(usage.current_usage.active_jobs, usage.rate_limits.concurrent_jobs)} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Historical Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Usage</CardTitle>
                    <CardDescription>
                      Usage statistics over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {usage.usage_stats.requests_today}
                        </p>
                        <p className="text-sm text-gray-600">Requests today</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {usage.usage_stats.requests_this_month}
                        </p>
                        <p className="text-sm text-gray-600">Requests this month</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {usage.usage_stats.total_requests}
                        </p>
                        <p className="text-sm text-gray-600">Total requests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading usage statistics...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                  Current permissions for this API key
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(apiKey.permissions).map(([perm, enabled]) => (
                    <div key={perm} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {perm.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-600">
                          {perm === 'async_interpret' && 'Create and manage interpretation jobs'}
                          {perm === 'read' && 'View job status, usage, and user data'}
                          {perm === 'write' && 'Update settings and create resources'}
                        </p>
                      </div>
                      <Badge variant={enabled ? 'default' : 'outline'}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 