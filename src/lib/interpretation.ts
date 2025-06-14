import { authenticatedAPI } from './auth';

export interface InterpretationRequest {
  files: File[];
  language: 'English' | 'French';
  education_level: 'Primary School' | 'High School' | 'College' | 'Graduate' | 'Postgraduate' | 'Not listed';
  technical_level: 'Medical Science' | 'Other Science' | 'Non-Science';
}

// Response type is defined in Technical.tsx to avoid conflicts

export const interpretationAPI = {
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