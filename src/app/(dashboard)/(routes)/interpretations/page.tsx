"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { interpretationAPI, JobHistoryResponse } from '@/lib/interpretation';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function InterpretationsPage() {
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useAuth();
  const [jobHistory, setJobHistory] = useState<JobHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (authLoading) return;
    
    if (!isSignedIn) {
      router.push('/sign-in?redirect=/interpretations');
      return;
    }
    
    fetchJobHistory();
  }, [authLoading, isSignedIn, router]);

  const fetchJobHistory = async () => {
    try {
      setIsLoading(true);
      const history = await interpretationAPI.getUserJobs(50); // Get last 50 jobs
      setJobHistory(history);
    } catch (err: any) {
      console.error('Error fetching job history:', err);
      setError('Unable to load interpretation history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredJobs = () => {
    if (!jobHistory) return [];
    if (filterStatus === 'all') return jobHistory.jobs;
    return jobHistory.jobs.filter(job => job.status.toLowerCase() === filterStatus);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your interpretation history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load History</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredJobs = getFilteredJobs();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Interpretations</h1>
            <p className="text-gray-600">
              {jobHistory ? `${jobHistory.total_jobs} total interpretations` : 'Loading...'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/labs"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              New Analysis
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex space-x-2">
              {['all', 'completed', 'processing', 'pending', 'failed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interpretations found</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all' 
                  ? 'You haven&apos;t created any medical interpretations yet.'
                  : `No interpretations with status &quot;${filterStatus}&quot; found.`
                }
              </p>
              <Link
                href="/labs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Analysis
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <div key={job.job_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1">{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {job.files_count} file{job.files_count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-sm text-gray-500">
                          {job.parameters.language}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Created:</span> {formatDate(job.created_at)}
                        </p>
                        {job.updated_at !== job.created_at && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Updated:</span> {formatDate(job.updated_at)}
                          </p>
                        )}
                      </div>

                      {job.summary && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Files processed:</span> {job.summary.files_processed}
                          </p>
                          {job.summary.summary_preview && (
                            <p className="text-sm text-gray-600 italic">
                              &quot;{job.summary.summary_preview}&quot;
                            </p>
                          )}
                        </div>
                      )}

                      {job.error_summary && (
                        <div className="mb-3">
                          <p className="text-sm text-red-600">
                            <span className="font-medium">Error:</span> {job.error_summary}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex items-center space-x-3">
                      {job.status === 'completed' && (
                        <Link
                          href={`/async-labs/interpret/${job.job_id}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Results
                        </Link>
                      )}
                      
                      {job.status === 'processing' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600">{job.progress}%</span>
                        </div>
                      )}
                      
                      <span className="text-xs text-gray-400 font-mono">
                        {job.job_id.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Note */}
        {jobHistory && jobHistory.total_jobs > filteredJobs.length && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobHistory.total_jobs} interpretations
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 