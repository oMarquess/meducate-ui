"use client"

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { interpretationAPI } from '@/lib/interpretation';
import { increaseApiLimit } from '@/lib/api-limit';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// Types
interface FormData {
    educationLevel: 'Primary School' | 'High School' | 'College' | 'Graduate' | 'Postgraduate' | 'Not listed' | '';
    language: 'English' | 'French';
    technicalLevel: 'Medical Science' | 'Other Science' | 'Non-Science' | '';
    files: File[];
}

interface InterpretationResponse {
    message: string;
    user_data: any;
    files: string[];
    processing_stats: {
        pdfs: number;
        docx: number;
        images: number;
        unsupported: number;
        failed: number;
        too_large: number;
        errors: string[];
    };
    context_info: {
        total_tokens: number;
        included_documents: number;
        excluded_documents: number;
        error_documents: number;
        context_truncated: boolean;
        errors: string[] | null;
    };
    total_documents_processed: number;
    interpretation: {
        summary: string;
        visual_metrics?: {
            overall_health_score: number;
            risk_level: string;
            severity_color: string;
            test_results: Array<{
                name: string;
                value: string;
                unit: string;
                normal_range: string;
                status: string;
                color: string;
                percentage_of_normal: number;
            }>;
        };
        key_findings?: string[];
        recommendations?: string[];
        action_plan?: {
            immediate: string[];
            short_term: string[];
            long_term: string[];
            monitoring: string[];
        };
        smart_questions?: string[];
        educational_content?: {
            what_this_means: string;
            why_it_matters: string;
            lifestyle_impact: string;
        };
        emergency_guidelines?: {
            warning_signs: string[];
            when_to_call_doctor: string;
            emergency_contacts: string;
        };
        cultural_context?: {
            dietary_considerations: string;
            lifestyle_adaptations: string;
        };
        medical_terms?: {
            [key: string]: string;
        };
    };
}

const LabsPage: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        educationLevel: '',
        language: 'English',
        technicalLevel: '',
        files: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<InterpretationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | null>(null);
    const [progress, setProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState<string>('');
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // File drop handler
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        
        // File size limits (in bytes)
        const FILE_SIZE_LIMITS = {
            pdf: 25 * 1024 * 1024,      // 25MB for PDFs
            docx: 15 * 1024 * 1024,     // 15MB for DOCX
            image: 10 * 1024 * 1024,    // 10MB for images
        };
        
        // Validate file sizes
        const oversizedFiles: string[] = [];
        const validFiles: File[] = [];
        
        acceptedFiles.forEach(file => {
            let sizeLimit = FILE_SIZE_LIMITS.image; // default
            
            if (file.type.includes('pdf')) {
                sizeLimit = FILE_SIZE_LIMITS.pdf;
            } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
                sizeLimit = FILE_SIZE_LIMITS.docx;
            }
            
            if (file.size > sizeLimit) {
                const limitMB = Math.round(sizeLimit / (1024 * 1024));
                const fileMB = (file.size / (1024 * 1024)).toFixed(1);
                oversizedFiles.push(`${file.name} (${fileMB}MB) exceeds ${limitMB}MB limit`);
            } else {
                validFiles.push(file);
            }
        });
        
        // Show error for oversized files
        if (oversizedFiles.length > 0) {
            setError(`File size limit exceeded:\n${oversizedFiles.join('\n')}\n\nLimits: PDF (25MB), DOCX (15MB), Images (10MB)`);
        }
        
        // Only add valid files
        if (validFiles.length > 0) {
            setFormData(prev => ({ ...prev, files: validFiles }));
            
            // Simulate upload progress
            setUploadProgress(0);
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    const newProgress = prev + 10;
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return newProgress;
                });
            }, 100);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
        },
        maxFiles: 20,
    });

    // Remove file handler
    const removeFile = (fileToRemove: File) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter(file => file !== fileToRemove)
        }));
    };

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    // Poll job status
    const pollJobStatus = async (jobId: string) => {
        try {
            const jobResult = await interpretationAPI.getJobStatus(jobId);
            console.log('Job status update:', jobResult);
            
            setJobStatus(jobResult.status);
            setProgress(jobResult.progress);
            
            if (jobResult.status === 'completed' && jobResult.result) {
                // Job completed successfully
                setResult(jobResult.result);
                setIsLoading(false);
                
                // Clear polling
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                }
                
                await increaseApiLimit();
                
            } else if (jobResult.status === 'failed') {
                // Job failed
                setError(jobResult.error || 'Interpretation job failed. Please try again.');
                setIsLoading(false);
                
                // Clear polling
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                }
                
            } else if (jobResult.status === 'processing') {
                // Update progress for processing jobs
                setProgress(jobResult.progress);
                
            } else if (jobResult.status === 'pending') {
                // Job is still pending
                setProgress(0);
            }
            
        } catch (err: any) {
            console.error('Error polling job status:', err);
            // Don't set error for polling failures, just continue trying
        }
    };

    // Form submission
    const handleSubmit = async () => {
        if (!formData.educationLevel || !formData.technicalLevel || formData.files.length === 0) {
            setError('Please fill in all fields and upload at least one file.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setJobId(null);
        setJobStatus(null);
        setProgress(0);

        try {
            console.log('Starting async interpretation:', formData);
            
            // Start async interpretation job
            const asyncResponse = await interpretationAPI.startAsyncInterpretation({
                files: formData.files,
                language: formData.language,
                education_level: formData.educationLevel,
                technical_level: formData.technicalLevel,
            });
            
            console.log('Async job started:', asyncResponse);
            
            setJobId(asyncResponse.job_id);
            setJobStatus(asyncResponse.status as any);
            setEstimatedTime(asyncResponse.estimated_completion);
            
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
                setError('Files are too large. Please reduce file size and try again.\n\nSize limits: PDF (25MB), DOCX (15MB), Images (10MB)');
            } else if (err.response?.status === 400) {
                const errorMessage = err.response?.data?.detail || 'Invalid file format or request';
                if (errorMessage.includes('too large') || errorMessage.includes('size')) {
                    setError('File size limit exceeded. Please reduce file size and try again.\n\nSize limits: PDF (25MB), DOCX (15MB), Images (10MB)');
                } else {
                    setError('Invalid file format or request. Please check your files and try again.');
                }
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
        }
    };

    const getFileTypeInfo = (file: File) => {
        if (file.type.includes('pdf')) return { type: 'PDF', color: 'bg-red-50 text-red-700 border-red-200', icon: 'PDF' };
        if (file.type.includes('word') || file.name.endsWith('.docx')) return { type: 'DOCX', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'DOC' };
        if (file.type.startsWith('image/')) return { type: 'Image', color: 'bg-green-50 text-green-700 border-green-200', icon: 'IMG' };
        return { type: 'File', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: 'FILE' };
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'low': return 'text-green-700 bg-green-50 border-green-200';
            case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'high': return 'text-red-700 bg-red-50 border-red-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'normal': return 'text-green-700 bg-green-50 border-green-200';
            case 'high': return 'text-red-700 bg-red-50 border-red-200';
            case 'low': return 'text-blue-700 bg-blue-50 border-blue-200';
            default: return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    if (result) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Medical Analysis Results</h1>
                        <p className="text-sm sm:text-base text-gray-600">Comprehensive health interpretation report</p>
                    </div>

                    {/* Results Container */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        {/* Processing Stats Header */}
                        <div className="bg-gray-900 text-white p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold">{result.processing_stats.pdfs}</div>
                                    <div className="text-xs sm:text-sm opacity-90">PDF Files</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold">{result.processing_stats.docx}</div>
                                    <div className="text-xs sm:text-sm opacity-90">DOCX Files</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold">{result.processing_stats.images}</div>
                                    <div className="text-xs sm:text-sm opacity-90">Images</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold">{result.context_info.total_tokens}</div>
                                    <div className="text-xs sm:text-sm opacity-90">Tokens</div>
                                </div>
                            </div>
                        </div>

                        {/* Health Score */}
                        {result.interpretation.visual_metrics && (
                            <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Health Assessment</h3>
                                        <p className="text-sm text-gray-600">Overall health evaluation</p>
                                    </div>
                                    <div className="text-center sm:text-right">
                                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                            {result.interpretation.visual_metrics.overall_health_score}%
                                        </div>
                                        <div className={`inline-block px-3 py-1 rounded border text-xs font-medium ${getRiskLevelColor(result.interpretation.visual_metrics.risk_level)}`}>
                                            {result.interpretation.visual_metrics.risk_level.toUpperCase()} RISK
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Test Results Table */}
                        {result.interpretation.visual_metrics?.test_results && (
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Test Results</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Progress bars show where your values fall within the normal range (100% = upper limit of normal)
                                    </p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">Test</th>
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">Value</th>
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">Normal Range</th>
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.interpretation.visual_metrics.test_results.map((test, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-2 font-medium text-gray-900">{test.name}</td>
                                                    <td className="py-3 px-2 text-gray-700">{test.value} {test.unit}</td>
                                                    <td className="py-3 px-2 text-gray-600">{test.normal_range} {test.unit}</td>
                                                    <td className="py-3 px-2">
                                                        <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusColor(test.status)}`}>
                                                            {test.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div className="flex items-center">
                                                            <div className="w-16 bg-gray-200 rounded h-2 mr-2">
                                                                <div 
                                                                    className="bg-gray-600 h-2 rounded" 
                                                                    style={{ width: `${Math.min(test.percentage_of_normal, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-600">{test.percentage_of_normal}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Content Sections */}
                        <div className="p-4 sm:p-6">
                            <Accordion type="single" collapsible className="space-y-2">
                                {/* Summary */}
                                <AccordionItem value="summary" className="border border-gray-200 rounded">
                                    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                        <span className="font-medium text-gray-900">Summary</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <p className="text-gray-700 leading-relaxed text-sm">{result.interpretation.summary}</p>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Key Findings */}
                                {result.interpretation.key_findings && (
                                    <AccordionItem value="findings" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">Key Findings</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <ul className="space-y-2">
                                                {result.interpretation.key_findings.map((finding, index) => (
                                                    <li key={index} className="flex items-start text-sm">
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                        <span className="text-gray-700">{finding}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Recommendations */}
                                {result.interpretation.recommendations && (
                                    <AccordionItem value="recommendations" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">Recommendations</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <ul className="space-y-2">
                                                {result.interpretation.recommendations.map((rec, index) => (
                                                    <li key={index} className="flex items-start text-sm">
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                        <span className="text-gray-700">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Action Plan */}
                                {result.interpretation.action_plan && (
                                    <AccordionItem value="action-plan" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">Action Plan</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-4">
                                                {result.interpretation.action_plan.immediate && (
                                                    <div>
                                                        <h4 className="font-semibold text-red-700 mb-2 text-sm">🚨 Immediate Actions</h4>
                                                        <ul className="space-y-1">
                                                            {result.interpretation.action_plan.immediate.map((action, index) => (
                                                                <li key={index} className="flex items-start text-sm">
                                                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                                    <span className="text-gray-700">{action}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {result.interpretation.action_plan.short_term && (
                                                    <div>
                                                        <h4 className="font-semibold text-orange-700 mb-2 text-sm">📅 Short-term (1-3 months)</h4>
                                                        <ul className="space-y-1">
                                                            {result.interpretation.action_plan.short_term.map((action, index) => (
                                                                <li key={index} className="flex items-start text-sm">
                                                                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                                    <span className="text-gray-700">{action}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {result.interpretation.action_plan.long_term && (
                                                    <div>
                                                        <h4 className="font-semibold text-blue-700 mb-2 text-sm">🎯 Long-term (6+ months)</h4>
                                                        <ul className="space-y-1">
                                                            {result.interpretation.action_plan.long_term.map((action, index) => (
                                                                <li key={index} className="flex items-start text-sm">
                                                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                                    <span className="text-gray-700">{action}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {result.interpretation.action_plan.monitoring && (
                                                    <div>
                                                        <h4 className="font-semibold text-green-700 mb-2 text-sm">📊 Monitoring</h4>
                                                        <ul className="space-y-1">
                                                            {result.interpretation.action_plan.monitoring.map((action, index) => (
                                                                <li key={index} className="flex items-start text-sm">
                                                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                                    <span className="text-gray-700">{action}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Smart Questions */}
                                {result.interpretation.smart_questions && (
                                    <AccordionItem value="questions" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">Questions for Your Doctor</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-3">
                                                {result.interpretation.smart_questions.map((question, index) => (
                                                    <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-300 rounded-r text-sm">
                                                        <p className="text-blue-800 italic">&ldquo;{question}&rdquo;</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Educational Content */}
                                {result.interpretation.educational_content && (
                                    <AccordionItem value="education" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">Understanding Your Results</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-4">
                                                <div className="p-3 bg-green-50 rounded-lg">
                                                    <h4 className="font-semibold text-green-800 mb-2 text-sm">💡 What This Means</h4>
                                                    <p className="text-green-700 text-sm">{result.interpretation.educational_content.what_this_means}</p>
                                                </div>
                                                <div className="p-3 bg-blue-50 rounded-lg">
                                                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">🎯 Why It Matters</h4>
                                                    <p className="text-blue-700 text-sm">{result.interpretation.educational_content.why_it_matters}</p>
                                                </div>
                                                <div className="p-3 bg-purple-50 rounded-lg">
                                                    <h4 className="font-semibold text-purple-800 mb-2 text-sm">🏃‍♂️ Lifestyle Impact</h4>
                                                    <p className="text-purple-700 text-sm">{result.interpretation.educational_content.lifestyle_impact}</p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Emergency Guidelines */}
                                {result.interpretation.emergency_guidelines && (
                                    <AccordionItem value="emergency" className="border border-red-200 rounded bg-red-50">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-red-100 text-left">
                                            <span className="font-medium text-red-900">🚨 Emergency Guidelines</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-4">
                                                {result.interpretation.emergency_guidelines.warning_signs && (
                                                    <div>
                                                        <h4 className="font-semibold text-red-800 mb-2 text-sm">⚠️ Warning Signs</h4>
                                                        <ul className="space-y-1">
                                                            {result.interpretation.emergency_guidelines.warning_signs.map((sign, index) => (
                                                                <li key={index} className="flex items-start text-sm">
                                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                                    <span className="text-red-700">{sign}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {result.interpretation.emergency_guidelines.when_to_call_doctor && (
                                                    <div className="p-3 bg-red-100 rounded-lg">
                                                        <h4 className="font-semibold text-red-800 mb-2 text-sm">📞 When to Call Doctor</h4>
                                                        <p className="text-red-700 text-sm">{result.interpretation.emergency_guidelines.when_to_call_doctor}</p>
                                                    </div>
                                                )}
                                                {result.interpretation.emergency_guidelines.emergency_contacts && (
                                                    <div className="p-3 bg-red-200 rounded-lg">
                                                        <h4 className="font-semibold text-red-900 mb-2 text-sm">🚑 Emergency Contacts</h4>
                                                        <p className="text-red-800 text-sm">{result.interpretation.emergency_guidelines.emergency_contacts}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Cultural Context */}
                                {result.interpretation.cultural_context && (
                                    <AccordionItem value="cultural" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">🌍 Cultural Considerations</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-4">
                                                {result.interpretation.cultural_context.dietary_considerations && (
                                                    <div className="p-3 bg-orange-50 rounded-lg">
                                                        <h4 className="font-semibold text-orange-800 mb-2 text-sm">🍽️ Dietary Considerations</h4>
                                                        <p className="text-orange-700 text-sm">{result.interpretation.cultural_context.dietary_considerations}</p>
                                                    </div>
                                                )}
                                                {result.interpretation.cultural_context.lifestyle_adaptations && (
                                                    <div className="p-3 bg-teal-50 rounded-lg">
                                                        <h4 className="font-semibold text-teal-800 mb-2 text-sm">🧘‍♀️ Lifestyle Adaptations</h4>
                                                        <p className="text-teal-700 text-sm">{result.interpretation.cultural_context.lifestyle_adaptations}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Medical Terms Dictionary */}
                                {result.interpretation.medical_terms && (
                                    <AccordionItem value="terms" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">📚 Medical Terms Dictionary</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-3">
                                                {Object.entries(result.interpretation.medical_terms).map(([term, definition], index) => (
                                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">{term}</h4>
                                                        <p className="text-gray-700 text-sm">{definition}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setFormData({ educationLevel: '', language: 'English', technicalLevel: '', files: [] });
                                    }}
                                    className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
                                >
                                    New Analysis
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                                >
                                    Print Results
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Cancel job function
    const cancelJob = async () => {
        if (jobId && jobStatus && ['pending', 'processing'].includes(jobStatus)) {
            try {
                await interpretationAPI.cancelJob(jobId);
                setIsLoading(false);
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md mx-auto text-center space-y-6">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {jobStatus === 'pending' ? 'Queueing Your Request...' :
                         jobStatus === 'processing' ? 'Processing Your Medical Reports...' :
                         'Starting Interpretation...'}
                    </h2>
                    
                    {jobId && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Job ID: {jobId}</p>
                            <p className="text-sm text-gray-600">
                                {jobStatus === 'pending' && 'Your request is in the queue and will start processing shortly.'}
                                {jobStatus === 'processing' && `Processing your files... ${progress}% complete`}
                                {!jobStatus && 'Preparing your interpretation request...'}
                            </p>
                            {estimatedTime && (
                                <p className="text-sm text-blue-600 mt-2">
                                    Estimated completion: {estimatedTime}
                                </p>
                            )}
                        </div>
                    )}
                    
                    <div className="w-full bg-gray-200 rounded h-2">
                        <div 
                            className="bg-gray-600 h-2 rounded transition-all" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500">Progress: {progress}%</p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 font-medium">🔄 Background Processing</p>
                        <p className="text-blue-700 text-sm mt-1">
                            Your medical reports are being processed in the background. 
                                                         You&apos;ll receive an email notification when complete.
                        </p>
                        {jobStatus === 'processing' && (
                            <p className="text-blue-700 text-sm mt-2">
                                Our AI is analyzing your documents and generating personalized insights...
                            </p>
                        )}
                    </div>
                    
                    {jobId && jobStatus && ['pending', 'processing'].includes(jobStatus) && (
                        <button
                            type="button"
                            onClick={cancelJob}
                            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                        >
                            Cancel Request
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Medical Document Analysis</h1>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                        Upload your medical documents for AI-powered analysis tailored to your background and language preference
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 ${formData.educationLevel ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-300'}`}>
                                1
                            </div>
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 ${formData.language ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-300'}`}>
                                2
                            </div>
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 ${formData.technicalLevel ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-300'}`}>
                                3
                            </div>
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 ${formData.files.length > 0 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-300'}`}>
                                4
                            </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                            {[formData.educationLevel, formData.language, formData.technicalLevel, formData.files.length > 0].filter(Boolean).length}/4 Complete
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Education Level */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Education Level</h3>
                            <p className="text-sm text-gray-600">Select your highest level of education</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(['Primary School', 'High School', 'College', 'Graduate', 'Postgraduate', 'Not listed'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setFormData(prev => ({ ...prev, educationLevel: level }))}
                                    className={`p-3 rounded border-2 transition-all text-sm font-medium ${
                                        formData.educationLevel === level
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language Selection */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Preferred Language</h3>
                            <p className="text-sm text-gray-600">Choose your language for the medical interpretation</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, language: 'English' }))}
                                className={`p-4 rounded border-2 transition-all flex items-center space-x-3 ${
                                    formData.language === 'English'
                                        ? 'border-gray-900 bg-gray-900 text-white'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                }`}
                            >
                                <div className="text-left flex-1">
                                    <div className="font-bold">English</div>
                                    <div className="text-sm opacity-70">Medical interpretation in English</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, language: 'French' }))}
                                className={`p-4 rounded border-2 transition-all flex items-center space-x-3 ${
                                    formData.language === 'French'
                                        ? 'border-gray-900 bg-gray-900 text-white'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                }`}
                            >
                                <div className="text-left flex-1">
                                    <div className="font-bold">Français</div>
                                    <div className="text-sm opacity-70">Interprétation médicale en français</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Technical Background */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Technical Background</h3>
                            <p className="text-sm text-gray-600">Select your professional or educational background</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {([
                                { value: 'Medical Science', desc: 'Medical professional or student' },
                                { value: 'Other Science', desc: 'Science background (non-medical)' },
                                { value: 'Non-Science', desc: 'General background' }
                            ] as const).map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setFormData(prev => ({ ...prev, technicalLevel: option.value }))}
                                    className={`p-4 rounded border-2 transition-all ${
                                        formData.technicalLevel === option.value
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                    }`}
                                >
                                    <div className="font-bold text-sm">{option.value}</div>
                                    <div className="text-xs opacity-70 mt-1">{option.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Upload Medical Documents</h3>
                            <p className="text-sm text-gray-600">Upload PDF, DOCX, or image files (max 20 files)</p>
                            <p className="text-xs text-gray-500 mt-1">Size limits: PDF (25MB), DOCX (15MB), Images (10MB)</p>
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                                ⚠️ X-ray and CT scan images are not advised. We are still working on those.
                            </p>
                        </div>
                        
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded p-6 text-center transition-all cursor-pointer ${
                                isDragActive 
                                    ? 'border-gray-400 bg-gray-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div className="text-4xl mb-3 text-gray-400">📄</div>
                            {isDragActive ? (
                                <p className="text-gray-600 font-medium">Drop your files here...</p>
                            ) : (
                                <div>
                                    <p className="font-medium text-gray-900 mb-2">
                                        Drag & drop your medical files here
                                    </p>
                                    <p className="text-gray-600 mb-3 text-sm">or click to browse</p>
                                    <div className="flex justify-center space-x-2 text-xs text-gray-500">
                                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200">PDF</span>
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">DOCX</span>
                                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">Images</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Uploaded Files */}
                        {formData.files.length > 0 && (
                            <div className="mt-4 space-y-3">
                                <h4 className="font-medium text-gray-900 text-sm">Uploaded Files ({formData.files.length})</h4>
                                <div className="space-y-2">
                                    {formData.files.map((file, index) => {
                                        const fileInfo = getFileTypeInfo(file);
                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded border ${fileInfo.color}`}>
                                                        {fileInfo.icon}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-gray-900 text-sm truncate">{file.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(file)}
                                                    className="text-red-600 hover:text-red-800 p-1 ml-2"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="w-full bg-gray-200 rounded h-2">
                                        <div
                                            className="bg-gray-600 h-2 rounded transition-all"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.educationLevel || !formData.technicalLevel || formData.files.length === 0}
                            className={`w-full py-3 px-6 rounded font-bold transition-all ${
                                formData.educationLevel && formData.technicalLevel && formData.files.length > 0
                                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Analyze Medical Documents
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabsPage;