"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Eye, EyeOff, Copy, Trash2, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { apiKeysAPI } from '@/lib/api-keys';

interface ApiKey {
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

export default function ApiKeysPage() {
  const { isSignedIn, isLoading: authLoading } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [permissions, setPermissions] = useState({
    async_interpret: true,
    read: true,
    write: true,
  });

  useEffect(() => {
    if (!authLoading && isSignedIn) {
      fetchApiKeys();
    }
  }, [authLoading, isSignedIn]);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const response = await apiKeysAPI.listKeys();
      setApiKeys(response);
    } catch (err: any) {
      setError('Failed to load API keys');
      console.error('Error fetching API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      setIsCreating(true);
      const response = await apiKeysAPI.createKey({
        key_name: newKeyName,
        permissions,
      });
      
      // Add the new key to the list (we'll need to fetch the full list to get the complete key data)
      await fetchApiKeys();
      setShowCreateDialog(false);
      setNewKeyName('');
      setPermissions({ async_interpret: true, read: true, write: true });
      toast.success('API key created successfully');
    } catch (err: any) {
      toast.error('Failed to create API key');
      console.error('Error creating API key:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiKeysAPI.revokeKey(keyId);
      
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, status: 'revoked' as const } : key
      ));
      toast.success('API key revoked successfully');
    } catch (err: any) {
      toast.error('Failed to revoke API key');
      console.error('Error revoking API key:', err);
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
            <CardDescription>Please sign in to access API keys</CardDescription>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
            <p className="text-gray-600 mt-2">
              Manage your API keys for accessing Meducate services
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Production Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Async Interpretation</p>
                        <p className="text-sm text-gray-500">Create and manage interpretation jobs</p>
                      </div>
                      <Switch
                        checked={permissions.async_interpret}
                        onCheckedChange={(checked) => 
                          setPermissions(prev => ({ ...prev, async_interpret: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Read Access</p>
                        <p className="text-sm text-gray-500">View job status, usage, and user data</p>
                      </div>
                      <Switch
                        checked={permissions.read}
                        onCheckedChange={(checked) => 
                          setPermissions(prev => ({ ...prev, read: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Write Access</p>
                        <p className="text-sm text-gray-500">Update settings and create resources</p>
                      </div>
                      <Switch
                        checked={permissions.write}
                        onCheckedChange={(checked) => 
                          setPermissions(prev => ({ ...prev, write: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createApiKey} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Key
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* API Keys List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading API keys...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : apiKeys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first API key to start using Meducate services programmatically
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <Card key={key.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{key.key_name}</h3>
                        <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                          {key.status === 'active' ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Created {formatDate(key.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4" />
                          <span>Used {key.usage_count} times</span>
                        </div>
                        {key.last_used && (
                          <div className="flex items-center space-x-1">
                            <span>Last used {formatLastUsed(key.last_used)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {key.key_prefix}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.key_prefix)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {Object.entries(key.permissions).map(([perm, enabled]) => (
                          <Badge key={perm} variant={enabled ? 'default' : 'outline'}>
                            {perm.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/api-keys/${key.id}`}
                      >
                        View Details
                      </Button>
                      {key.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeApiKey(key.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rate Limits Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
            <CardDescription>
              Current usage and limits for your API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">100</p>
                <p className="text-sm text-gray-600">Requests per hour</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">1,000</p>
                <p className="text-sm text-gray-600">Requests per day</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">10</p>
                <p className="text-sm text-gray-600">Concurrent jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 