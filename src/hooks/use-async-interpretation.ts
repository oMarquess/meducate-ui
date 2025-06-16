import { useState, useEffect, useCallback } from 'react';
import { interpretationAPI, InterpretationRequest, AsyncJobResponse, JobStatusResponse } from '@/lib/interpretation';

interface UseAsyncInterpretationReturn {
  startInterpretation: (request: InterpretationRequest) => Promise<void>;
  cancelJob: () => Promise<void>;
  isLoading: boolean;
  jobId: string | null;
  jobStatus: JobStatusResponse['status'] | null;
  progress: number;
  estimatedTime: string;
  result: any | null;
  error: string | null;
  isPolling: boolean;
}

export function useAsyncInterpretation(): UseAsyncInterpretationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusResponse['status'] | null>(null);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const jobResult = await interpretationAPI.getJobStatus(jobId);
      console.log('Job status update:', jobResult);
      
      setJobStatus(jobResult.status);
      setProgress(jobResult.progress);
      
      if (jobResult.status === 'completed' && jobResult.result) {
        // Job completed successfully
        setResult(jobResult.result);
        setIsLoading(false);
        setIsPolling(false);
        
        // Clear polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
      } else if (jobResult.status === 'failed') {
        // Job failed
        setError(jobResult.error || 'Interpretation job failed. Please try again.');
        setIsLoading(false);
        setIsPolling(false);
        
        // Clear polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
      } else if (jobResult.status === 'cancelled') {
        // Job was cancelled
        setError('Job was cancelled.');
        setIsLoading(false);
        setIsPolling(false);
        
        // Clear polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
      
    } catch (err: any) {
      console.error('Error polling job status:', err);
      // Don't set error for polling failures, just continue trying
    }
  }, [pollingInterval]);

  const startInterpretation = async (request: InterpretationRequest) => {
    setIsLoading(true);
    setError(null);
    setJobId(null);
    setJobStatus(null);
    setProgress(0);
    setResult(null);
    setIsPolling(false);

    try {
      console.log('Starting async interpretation:', request);
      
      // Start async interpretation job
      const asyncResponse = await interpretationAPI.startAsyncInterpretation(request);
      console.log('Async job started:', asyncResponse);
      
      setJobId(asyncResponse.job_id);
      setJobStatus(asyncResponse.status as any);
      setEstimatedTime(asyncResponse.estimated_completion);
      setIsPolling(true);
      
      // Start polling for job status every 3 seconds
      const interval = setInterval(() => {
        pollJobStatus(asyncResponse.job_id);
      }, 3000);
      
      setPollingInterval(interval);
      
      // Do initial poll after 2 seconds
      setTimeout(() => {
        pollJobStatus(asyncResponse.job_id);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error starting async interpretation:', err);
      
      // Set user-friendly error message
      if (err.response?.status === 413) {
        setError('Files are too large. Please reduce file size and try again.');
      } else if (err.response?.status === 400) {
        setError('Invalid file format or request. Please check your files and try again.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please sign in again.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.');
      } else if (err.response?.status === 503) {
        setError('Service temporarily unavailable. Please try again in a few minutes.');
      } else if (err.message?.includes('CORS')) {
        setError('Configuration error. Please contact support.');
      } else {
        setError('An error occurred while processing your request. Please try again.');
      }
      
      setIsLoading(false);
      setIsPolling(false);
    }
  };

  const cancelJob = async () => {
    if (jobId && jobStatus && ['pending', 'processing'].includes(jobStatus)) {
      try {
        await interpretationAPI.cancelJob(jobId);
        setIsLoading(false);
        setIsPolling(false);
        setError('Job cancelled by user.');
        
        // Clear polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      } catch (err) {
        console.error('Error cancelling job:', err);
        // Don't show error for cancel failures
      }
    }
  };

  return {
    startInterpretation,
    cancelJob,
    isLoading,
    jobId,
    jobStatus,
    progress,
    estimatedTime,
    result,
    error,
    isPolling,
  };
} 