"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { interpretationAPI, JobStatsResponse } from '@/lib/interpretation';
import { useAuth } from '@/hooks/use-auth';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  limits: {
    monthly_jobs: number | string;
    max_files_per_job: number;
    max_file_size_mb: number;
    priority_processing: boolean;
    email_support: boolean;
  };
  popular?: boolean;
  comingSoon?: boolean;
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    features: [
      'Up to 10 reports per month',
      'Basic AI explanations',
      'Email notifications',
      'Basic support'
    ],
    limits: {
      monthly_jobs: 10,
      max_files_per_job: 5,
      max_file_size_mb: 10,
      priority_processing: false,
      email_support: false
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    period: 'month',
    features: [
      'Up to 50 reports per month',
      'Advanced AI explanations',
      'Priority email notifications',
      'Email support',
      'Export reports'
    ],
    limits: {
      monthly_jobs: 50,
      max_files_per_job: 15,
      max_file_size_mb: 25,
      priority_processing: false,
      email_support: true
    },
    comingSoon: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    period: 'month',
    features: [
      'Up to 200 reports per month',
      'Premium AI explanations',
      'Priority processing',
      'Priority support',
      'Advanced analytics',
      'API access'
    ],
    limits: {
      monthly_jobs: 200,
      max_files_per_job: 20,
      max_file_size_mb: 50,
      priority_processing: true,
      email_support: true
    },
    popular: true,
    comingSoon: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    period: 'month',
    features: [
      'Unlimited reports',
      'Custom AI models',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Advanced security'
    ],
    limits: {
      monthly_jobs: 'Unlimited',
      max_files_per_job: 50,
      max_file_size_mb: 100,
      priority_processing: true,
      email_support: true
    },
    comingSoon: true
  }
];

export default function BillingPage() {
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<JobStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isSignedIn) {
      router.push('/sign-in?redirect=/billing');
      return;
    }
    
    fetchUsageStats();
  }, [authLoading, isSignedIn, router]);

  const fetchUsageStats = async () => {
    try {
      setIsLoading(true);
      const jobStats = await interpretationAPI.getJobStats();
      setStats(jobStats);
    } catch (err: any) {
      console.error('Error fetching usage stats:', err);
      setError('Unable to load usage statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getCurrentTier = () => {
    // For now, assume everyone is on free tier
    // In real implementation, this would come from user data
    return subscriptionTiers[0];
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your billing information...</p>
        </div>
      </div>
    );
  }

  const currentTier = getCurrentTier();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and view usage statistics</p>
        </div>

        {/* Current Plan & Usage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Current Plan & Usage</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Plan */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Current Plan</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-gray-900">{currentTier.name}</span>
                    <span className="text-lg text-gray-600">
                      ${currentTier.price}/{currentTier.period}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• {currentTier.limits.monthly_jobs} reports per month</p>
                    <p>• {currentTier.limits.max_files_per_job} files per analysis</p>
                    <p>• {currentTier.limits.max_file_size_mb}MB max file size</p>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">This Month's Usage</h3>
                {stats && (
                  <div className="space-y-4">
                    {/* Jobs Usage */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Reports Used</span>
                        <span>{stats.statistics.total_jobs} / {currentTier.limits.monthly_jobs}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${getProgressPercentage(stats.statistics.total_jobs, typeof currentTier.limits.monthly_jobs === 'number' ? currentTier.limits.monthly_jobs : 999)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.statistics.completed}</div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.statistics.failed}</div>
                        <div className="text-xs text-gray-500">Failed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.statistics.success_rate}%</div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{stats.statistics.recent_jobs}</div>
                        <div className="text-xs text-gray-500">Last 7 Days</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Subscription Plans</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptionTiers.map((tier) => (
                <div 
                  key={tier.id}
                  className={`relative rounded-lg border-2 p-6 ${
                    tier.id === currentTier.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  } ${tier.popular ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  {tier.id === currentTier.id && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">${tier.price}</span>
                      <span className="text-gray-600">/{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      tier.comingSoon
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : tier.id === currentTier.id
                        ? 'bg-gray-100 text-gray-600 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={tier.comingSoon || tier.id === currentTier.id}
                  >
                    {tier.comingSoon 
                      ? 'Coming Soon'
                      : tier.id === currentTier.id 
                      ? 'Current Plan'
                      : 'Upgrade Now'
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/labs')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>
    </div>
  );
} 