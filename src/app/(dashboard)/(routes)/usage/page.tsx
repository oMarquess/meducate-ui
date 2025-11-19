"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  BarChart3,
  Zap,
  Users,
  FileText,
  Key
} from 'lucide-react';

interface UsageStats {
  current_period: {
    start: string;
    end: string;
  };
  usage: {
    interpretations: number;
    async_interpretations: number;
    api_requests: number;
  };
  limits: {
    interpretations_per_month: number;
    async_interpretations_per_month: number;
    api_requests_per_month: number;
  };
  plan: string;
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

interface ApiKeyUsage {
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

export default function UsagePage() {
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [apiKeyUsage, setApiKeyUsage] = useState<ApiKeyUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      // const response = await fetch('/api/usage');
      // const data = await response.json();
      // setUsageStats(data);
      
      // Mock data for now
      setUsageStats({
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
        plan: 'free',
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
      });

      setApiKeyUsage([
        {
          key_id: 'key_1',
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
        },
        {
          key_id: 'key_2',
          key_name: 'Test Key',
          usage_stats: {
            total_requests: 8,
            requests_today: 2,
            requests_this_month: 23,
            last_used: '2024-01-19T09:15:00Z'
          },
          rate_limits: {
            requests_per_hour: 50,
            requests_per_day: 500,
            concurrent_jobs: 5
          },
          current_usage: {
            requests_this_hour: 1,
            requests_today: 2,
            active_jobs: 0
          }
        }
      ]);
    } catch (err: any) {
      setError('Failed to load usage statistics');
      console.error('Error fetching usage stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="h-full p-8 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading usage statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usage & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Monitor your API usage, rate limits, and billing information
        </p>
      </div>

      {usageStats && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="rate-limits" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Rate Limits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Period */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Current Billing Period
                </CardTitle>
                <CardDescription>
                  {formatDate(usageStats.current_period.start)} - {formatDate(usageStats.current_period.end)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {usageStats.usage.interpretations}
                    </div>
                    <div className="text-sm text-gray-600">Interpretations</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {usageStats.usage.interpretations} / {usageStats.limits.interpretations_per_month}
                    </div>
                    <Progress 
                      value={getUsagePercentage(usageStats.usage.interpretations, usageStats.limits.interpretations_per_month)} 
                      className="mt-2"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {usageStats.usage.async_interpretations}
                    </div>
                    <div className="text-sm text-gray-600">Async Interpretations</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {usageStats.usage.async_interpretations} / {usageStats.limits.async_interpretations_per_month}
                    </div>
                    <Progress 
                      value={getUsagePercentage(usageStats.usage.async_interpretations, usageStats.limits.async_interpretations_per_month)} 
                      className="mt-2"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {usageStats.usage.api_requests}
                    </div>
                    <div className="text-sm text-gray-600">API Requests</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {usageStats.usage.api_requests} / {usageStats.limits.api_requests_per_month}
                    </div>
                    <Progress 
                      value={getUsagePercentage(usageStats.usage.api_requests, usageStats.limits.api_requests_per_month)} 
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-semibold capitalize">{usageStats.plan} Plan</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Free tier with generous limits
                    </div>
                  </div>
                  <Button variant="outline">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <div className="grid gap-6">
              {apiKeyUsage.map((keyUsage) => (
                <Card key={keyUsage.key_id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        {keyUsage.key_name}
                      </span>
                      <Badge variant="outline">
                        {keyUsage.usage_stats.last_used ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Last used: {keyUsage.usage_stats.last_used ? formatDate(keyUsage.usage_stats.last_used) : 'Never'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Today&apos;s Usage</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Requests</span>
                              <span>{keyUsage.current_usage.requests_today} / {keyUsage.rate_limits.requests_per_day}</span>
                            </div>
                            <Progress 
                              value={getUsagePercentage(keyUsage.current_usage.requests_today, keyUsage.rate_limits.requests_per_day)} 
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Active Jobs</span>
                              <span>{keyUsage.current_usage.active_jobs} / {keyUsage.rate_limits.concurrent_jobs}</span>
                            </div>
                            <Progress 
                              value={getUsagePercentage(keyUsage.current_usage.active_jobs, keyUsage.rate_limits.concurrent_jobs)} 
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">This Hour</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Requests</span>
                              <span>{keyUsage.current_usage.requests_this_hour} / {keyUsage.rate_limits.requests_per_hour}</span>
                            </div>
                            <Progress 
                              value={getUsagePercentage(keyUsage.current_usage.requests_this_hour, keyUsage.rate_limits.requests_per_hour)} 
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Total Usage</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Requests:</span>
                            <span className="font-semibold">{keyUsage.usage_stats.total_requests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>This Month:</span>
                            <span className="font-semibold">{keyUsage.usage_stats.requests_this_month}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Today:</span>
                            <span className="font-semibold">{keyUsage.usage_stats.requests_today}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rate-limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Rate Limits
                </CardTitle>
                <CardDescription>
                  Current rate limits for your plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Per Hour</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>API Requests</span>
                          <span>{usageStats.current_usage.requests_this_hour} / {usageStats.rate_limits.requests_per_hour}</span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(usageStats.current_usage.requests_this_hour, usageStats.rate_limits.requests_per_hour)} 
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Per Day</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>API Requests</span>
                          <span>{usageStats.current_usage.requests_today} / {usageStats.rate_limits.requests_per_day}</span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(usageStats.current_usage.requests_today, usageStats.rate_limits.requests_per_day)} 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Concurrent Jobs</span>
                          <span>{usageStats.current_usage.active_jobs} / {usageStats.rate_limits.concurrent_jobs}</span>
                        </div>
                        <Progress 
                          value={getUsagePercentage(usageStats.current_usage.active_jobs, usageStats.rate_limits.concurrent_jobs)} 
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 