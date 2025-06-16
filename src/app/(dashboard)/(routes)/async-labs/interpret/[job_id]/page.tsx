"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { interpretationAPI } from '@/lib/interpretation';
import { useAuth } from '@/hooks/use-auth';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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

export default function AsyncLabResultPage() {
    const params = useParams();
    const router = useRouter();
    const { isSignedIn, isLoading: authLoading } = useAuth();
    const [result, setResult] = useState<InterpretationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const jobId = params.job_id as string;

    useEffect(() => {
        // Wait for auth to load
        if (authLoading) return;
        
        // Redirect to sign in if not authenticated
        if (!isSignedIn) {
            router.push(`/sign-in?redirect=/async-labs/interpret/${jobId}`);
            return;
        }
        
        // Fetch job results
        fetchJobResult();
    }, [authLoading, isSignedIn, jobId, router]);

    const fetchJobResult = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const jobResult = await interpretationAPI.getJobStatus(jobId);
            
            if (jobResult.status === 'completed' && jobResult.result) {
                setResult(jobResult.result);
            } else if (jobResult.status === 'processing' || jobResult.status === 'pending') {
                setError('Your interpretation is still being processed. Please check back in a few minutes.');
            } else if (jobResult.status === 'failed') {
                setError('This interpretation job failed. Please try submitting your documents again.');
            } else {
                setError('Job results not found or not yet available.');
            }
        } catch (err: any) {
            console.error('Error fetching job result:', err);
            if (err.response?.status === 404) {
                setError('Job not found. This link may be invalid or expired.');
            } else if (err.response?.status === 401) {
                setError('Authentication required. Please sign in to view your results.');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to view this result.');
            } else {
                setError('Unable to load your interpretation results. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
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

    // Show loading while auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show loading while fetching results
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your interpretation results...</p>
                    <p className="text-sm text-gray-500 mt-2">Job ID: {jobId}</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Results</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => router.push('/labs')}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            New Analysis
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show results
    if (result) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Medical Analysis Results</h1>
                        <p className="text-sm sm:text-base text-gray-600">Comprehensive health interpretation report</p>
                        <p className="text-xs text-gray-500 mt-1">Job ID: {jobId}</p>
                    </div>

                    {/* Back to Dashboard Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </button>
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
                                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
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
                                        <AccordionContent className="px-4 pb-4 space-y-4">
                                            {result.interpretation.action_plan.immediate && (
                                                <div>
                                                    <h4 className="font-medium text-red-700 mb-2">🚨 Immediate Actions</h4>
                                                    <ul className="space-y-1">
                                                        {result.interpretation.action_plan.immediate.map((action, index) => (
                                                            <li key={index} className="text-sm text-gray-700 ml-4">• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {result.interpretation.action_plan.short_term && (
                                                <div>
                                                    <h4 className="font-medium text-orange-700 mb-2">📅 Short-term (1-4 weeks)</h4>
                                                    <ul className="space-y-1">
                                                        {result.interpretation.action_plan.short_term.map((action, index) => (
                                                            <li key={index} className="text-sm text-gray-700 ml-4">• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {result.interpretation.action_plan.long_term && (
                                                <div>
                                                    <h4 className="font-medium text-green-700 mb-2">🎯 Long-term (1+ months)</h4>
                                                    <ul className="space-y-1">
                                                        {result.interpretation.action_plan.long_term.map((action, index) => (
                                                            <li key={index} className="text-sm text-gray-700 ml-4">• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {result.interpretation.action_plan.monitoring && (
                                                <div>
                                                    <h4 className="font-medium text-blue-700 mb-2">🔍 Monitoring</h4>
                                                    <ul className="space-y-1">
                                                        {result.interpretation.action_plan.monitoring.map((action, index) => (
                                                            <li key={index} className="text-sm text-gray-700 ml-4">• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
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
                                            <ul className="space-y-2">
                                                {result.interpretation.smart_questions.map((question, index) => (
                                                    <li key={index} className="flex items-start text-sm">
                                                        <span className="text-gray-400 mr-3 mt-1">❓</span>
                                                        <span className="text-gray-700">{question}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Educational Content */}
                                {result.interpretation.educational_content && (
                                    <AccordionItem value="education" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">Educational Information</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 space-y-4">
                                            {result.interpretation.educational_content.what_this_means && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">📚 What This Means</h4>
                                                    <p className="text-sm text-gray-700">{result.interpretation.educational_content.what_this_means}</p>
                                                </div>
                                            )}
                                            {result.interpretation.educational_content.why_it_matters && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">💡 Why It Matters</h4>
                                                    <p className="text-sm text-gray-700">{result.interpretation.educational_content.why_it_matters}</p>
                                                </div>
                                            )}
                                            {result.interpretation.educational_content.lifestyle_impact && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">🏃 Lifestyle Impact</h4>
                                                    <p className="text-sm text-gray-700">{result.interpretation.educational_content.lifestyle_impact}</p>
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Medical Terms */}
                                {result.interpretation.medical_terms && Object.keys(result.interpretation.medical_terms).length > 0 && (
                                    <AccordionItem value="terms" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">Medical Terms Glossary</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <dl className="space-y-3">
                                                {Object.entries(result.interpretation.medical_terms).map(([term, definition]) => (
                                                    <div key={term}>
                                                        <dt className="font-medium text-gray-900 text-sm">{term}</dt>
                                                        <dd className="text-sm text-gray-700 mt-1">{definition}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => {
                                // Use window.location to ensure a fresh page load and clean state
                                window.location.href = '/labs';
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            New Analysis
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
} 