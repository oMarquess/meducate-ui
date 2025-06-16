import { authenticatedAPI } from './auth';

export interface InterpretationRequest {
  files: File[];
  language: 'English' | 'French';
  education_level: 'Primary School' | 'High School' | 'College' | 'Graduate' | 'Postgraduate' | 'Not listed';
  technical_level: 'Medical Science' | 'Other Science' | 'Non-Science';
}

export interface AsyncJobResponse {
  message: string;
  job_id: string;
  status: string;
  estimated_completion: string;
  files_count: number;
  notification: {
    email: string;
    message: string;
  };
}

export interface JobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  progress: number;
  files_info: Array<{
    filename: string;
    size: number;
    content_type: string;
  }>;
  parameters: {
    language: string;
    education_level: string;
    technical_level: string;
    total_files: number;
  };
  result?: any; // The full interpretation result when completed
  message?: string;
  error?: string;
}

export const interpretationAPI = {
  // Start async interpretation job
  startAsyncInterpretation: async (data: InterpretationRequest): Promise<AsyncJobResponse> => {
    const formData = new FormData();
    
    // Add files
    data.files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add other parameters
    formData.append('language', data.language);
    formData.append('education_level', data.education_level);
    formData.append('technical_level', data.technical_level);
    
    const response = await authenticatedAPI.post('/async-labs/interpret', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get job status and results
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const response = await authenticatedAPI.get(`/async-labs/interpret/${jobId}`);
    return response.data;
  },

  // Get user's job history
  getUserJobs: async (limit: number = 20) => {
    const response = await authenticatedAPI.get(`/async-labs/jobs?limit=${limit}`);
    return response.data;
  },

  // Cancel a job
  cancelJob: async (jobId: string) => {
    const response = await authenticatedAPI.delete(`/async-labs/interpret/${jobId}`);
    return response.data;
  },

  // Get job statistics
  getJobStats: async () => {
    const response = await authenticatedAPI.get('/async-labs/jobs/status');
    return response.data;
  },

  // Legacy synchronous method (kept for backward compatibility)
  interpret: async (data: InterpretationRequest): Promise<any> => {
    const formData = new FormData();
    
    // Add files
    data.files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add other parameters
    formData.append('language', data.language);
    formData.append('education_level', data.education_level);
    formData.append('technical_level', data.technical_level);
    
    const response = await authenticatedAPI.post('/labs/interpret', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
}; 