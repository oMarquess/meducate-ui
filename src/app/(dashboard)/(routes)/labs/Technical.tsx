"use client";
import { useForm } from "react-hook-form"
import { useFormState } from "./FormContext";
import { useState, useEffect } from "react";
import { ProgressBar } from './ProgressBar';
import { useRouter } from 'next/navigation';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { interpretationAPI, SubscriptionError } from "@/lib/interpretation";
import { increaseApiLimit } from "@/lib/api-limit";
import InterpretationResults from '@/components/InterpretationResults';
import Link from 'next/link';


type TFormValues = {
    technicalLevel: string;
};

export interface InterpretationResponse {
    message: string;
    user_data: {
        user_id: string;
        session_id: string;
        language: string;
        education_level: string;
        technical_level: string;
        total_files: number;
        timestamp: string;
        _id: string;
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
    };
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
        // Legacy fields for backward compatibility
        detailed_analysis?: string;
    };
    success?: boolean;
}

function InterpretationResult({ response }: { response: InterpretationResponse }) {
    const router = useRouter();

    const handleReturnToHome = () => {
        router.push('/dashboard');
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel?.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'high': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'normal': return 'text-green-600 bg-green-50';
            case 'high': return 'text-red-600 bg-red-50';
            case 'low': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Medical Interpretation Results</h2>
                <div className="text-sm text-gray-500">
                    {response.total_documents_processed} documents processed
                </div>
            </div>

            {/* Processing Stats Dashboard */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold mb-4 text-blue-900">Processing Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{response.processing_stats.pdfs}</div>
                        <div className="text-sm text-gray-600">PDF Files</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{response.processing_stats.docx}</div>
                        <div className="text-sm text-gray-600">DOCX Files</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">{response.processing_stats.images}</div>
                        <div className="text-sm text-gray-600">Images</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-gray-600">{response.context_info.total_tokens}</div>
                        <div className="text-sm text-gray-600">Context Tokens</div>
                    </div>
                </div>
                {response.context_info.context_truncated && (
                    <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-md">
                        <p className="text-orange-800 text-sm">⚠️ Context was truncated due to length limits</p>
                    </div>
                )}
            </div>

            {/* Health Score & Risk Level */}
            {response.interpretation.visual_metrics && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-green-900">Overall Health Assessment</h3>
                        <div className="flex items-center space-x-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {response.interpretation.visual_metrics.overall_health_score}%
                                </div>
                                <div className="text-sm text-gray-600">Health Score</div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getRiskLevelColor(response.interpretation.visual_metrics.risk_level)}`}>
                                {response.interpretation.visual_metrics.risk_level.toUpperCase()} RISK
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Test Results Table */}
            {response.interpretation.visual_metrics?.test_results && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Detailed Test Results</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Range</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Normal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {response.interpretation.visual_metrics.test_results.map((test, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {test.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {test.value} {test.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {test.normal_range} {test.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                                                {test.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full" 
                                                        style={{ width: `${Math.min(test.percentage_of_normal, 100)}%` }}
                                                    ></div>
                                                </div>
                                                {test.percentage_of_normal}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Main Content Accordion */}
            <div className="mb-8">
                <Accordion type="single" collapsible className="w-full space-y-2">
                    <AccordionItem value="summary" className="border border-gray-200 rounded-lg">
                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                            <span className="text-lg font-semibold">📋 Summary</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed">{response.interpretation.summary}</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    
                    {response.interpretation.key_findings && response.interpretation.key_findings.length > 0 && (
                        <AccordionItem value="findings" className="border border-gray-200 rounded-lg">
                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                                <span className="text-lg font-semibold">🔍 Key Findings</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                                <ul className="space-y-3">
                                    {response.interpretation.key_findings.map((finding, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                                            <span className="text-gray-700">{finding}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {response.interpretation.recommendations && response.interpretation.recommendations.length > 0 && (
                        <AccordionItem value="recommendations" className="border border-gray-200 rounded-lg">
                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                                <span className="text-lg font-semibold">💡 Recommendations</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                                <ul className="space-y-3">
                                    {response.interpretation.recommendations.map((recommendation, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                                            <span className="text-gray-700">{recommendation}</span>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {response.interpretation.action_plan && (
                        <AccordionItem value="action-plan" className="border border-gray-200 rounded-lg">
                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                                <span className="text-lg font-semibold">📅 Action Plan</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-red-600 mb-2">🚨 Immediate Actions</h4>
                                        <ul className="space-y-2">
                                            {response.interpretation.action_plan.immediate.map((action, index) => (
                                                <li key={index} className="text-sm text-gray-700 flex items-start">
                                                    <span className="mr-2">•</span>
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-orange-600 mb-2">📋 Short-term (1-3 months)</h4>
                                        <ul className="space-y-2">
                                            {response.interpretation.action_plan.short_term.map((action, index) => (
                                                <li key={index} className="text-sm text-gray-700 flex items-start">
                                                    <span className="mr-2">•</span>
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-600 mb-2">🎯 Long-term (6+ months)</h4>
                                        <ul className="space-y-2">
                                            {response.interpretation.action_plan.long_term.map((action, index) => (
                                                <li key={index} className="text-sm text-gray-700 flex items-start">
                                                    <span className="mr-2">•</span>
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-purple-600 mb-2">👁️ Monitoring</h4>
                                        <ul className="space-y-2">
                                            {response.interpretation.action_plan.monitoring.map((action, index) => (
                                                <li key={index} className="text-sm text-gray-700 flex items-start">
                                                    <span className="mr-2">•</span>
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {response.interpretation.smart_questions && response.interpretation.smart_questions.length > 0 && (
                        <AccordionItem value="questions" className="border border-gray-200 rounded-lg">
                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                                <span className="text-lg font-semibold">❓ Smart Questions for Your Doctor</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                                <div className="space-y-4">
                                    {response.interpretation.smart_questions.map((question, index) => (
                                        <div key={index} className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                            <p className="text-gray-800 italic">&ldquo;{question}&rdquo;</p>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {response.interpretation.educational_content && (
                        <AccordionItem value="education" className="border border-gray-200 rounded-lg">
                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                                <span className="text-lg font-semibold">📚 Educational Content</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-green-600 mb-2">What This Means</h4>
                                        <p className="text-gray-700">{response.interpretation.educational_content.what_this_means}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-600 mb-2">Why It Matters</h4>
                                        <p className="text-gray-700">{response.interpretation.educational_content.why_it_matters}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-purple-600 mb-2">Lifestyle Impact</h4>
                                        <p className="text-gray-700">{response.interpretation.educational_content.lifestyle_impact}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {response.interpretation.emergency_guidelines && (
                        <AccordionItem value="emergency" className="border border-red-200 rounded-lg bg-red-50">
                            <AccordionTrigger className="px-6 py-4 hover:bg-red-100">
                                <span className="text-lg font-semibold text-red-700">🚨 Emergency Guidelines</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-red-600 mb-2">Warning Signs</h4>
                                        <ul className="space-y-1">
                                            {response.interpretation.emergency_guidelines.warning_signs.map((sign, index) => (
                                                <li key={index} className="text-red-700 flex items-start">
                                                    <span className="mr-2">⚠️</span>
                                                    {sign}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-red-600 mb-2">When to Call Doctor</h4>
                                        <p className="text-red-700">{response.interpretation.emergency_guidelines.when_to_call_doctor}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-red-600 mb-2">Emergency Contacts</h4>
                                        <p className="text-red-700">{response.interpretation.emergency_guidelines.emergency_contacts}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {response.interpretation.cultural_context && (
                        <AccordionItem value="cultural" className="border border-gray-200 rounded-lg">
                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                                <span className="text-lg font-semibold">🌍 Cultural Context</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-green-600 mb-2">Dietary Considerations</h4>
                                        <p className="text-gray-700">{response.interpretation.cultural_context.dietary_considerations}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-600 mb-2">Lifestyle Adaptations</h4>
                                        <p className="text-gray-700">{response.interpretation.cultural_context.lifestyle_adaptations}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {response.interpretation.medical_terms && Object.keys(response.interpretation.medical_terms).length > 0 && (
                        <AccordionItem value="terms" className="border border-gray-200 rounded-lg">
                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                                <span className="text-lg font-semibold">📖 Medical Terms Explained</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                                <div className="space-y-4">
                                    {Object.entries(response.interpretation.medical_terms).map(([term, definition], index) => (
                                        <div key={index} className="border-l-4 border-blue-400 pl-4">
                                            <h4 className="font-semibold text-blue-600">{term}</h4>
                                            <p className="text-gray-700 mt-1">{definition}</p>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    type="button"
                    onClick={handleReturnToHome}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Return to Dashboard
                </button>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                    Print Results
                </button>
            </div>
        </div>
    );
}

export function TechnicalForm() {
    const router = useRouter();
    const [isCreated, setCreated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | null>(null);
    const [progress, setProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState<string>('');
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const [subscriptionError, setSubscriptionError] = useState<SubscriptionError | null>(null);
    
    const { onHandleBack, setFormData, formData } = useFormState();
    const { register, handleSubmit } = useForm<TFormValues>({
        defaultValues: formData
    });

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
                setFormData((prevFormData) => ({ ...prevFormData, response: jobResult.result }));
                setCreated(true);
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

    // Subscription Error Component
    const SubscriptionErrorDisplay = ({ error }: { error: SubscriptionError }) => (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-lg font-medium text-amber-800">
                        {error.error}
                    </h3>
                    <p className="mt-2 text-sm text-amber-700">
                        {error.message}
                    </p>
                    
                    {error.usage_info && (
                        <div className="mt-4 bg-white rounded-md p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Current Plan Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Plan:</span>
                                    <span className="ml-2 font-medium">{error.usage_info.subscription.tier_display}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Jobs Used:</span>
                                    <span className="ml-2 font-medium">
                                        {error.usage_info.usage.jobs_used_this_period} / {error.usage_info.subscription.limits.monthly_jobs}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Resets On:</span>
                                    <span className="ml-2 font-medium">{new Date(error.usage_info.usage.resets_on).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Max Files:</span>
                                    <span className="ml-2 font-medium">{error.usage_info.subscription.limits.max_files_per_job} per job</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-4 flex space-x-3">
                        <Link
                            href="/billing"
                            className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
                        >
                            Upgrade Plan
                        </Link>
                        <Link
                            href="/dashboard"
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    async function onHandleFormSubmit(data: TFormValues) {
        setFormData((prevFormData) => ({ ...prevFormData, ...data }));
        setIsLoading(true);
        setError(null);
        setSubscriptionError(null);
        setJobId(null);
        setJobStatus(null);
        setProgress(0);

        try {
            // Map education level values to API expected values if needed
            const educationLevelMap: { [key: string]: string } = {
                'primaryschool': 'Primary School',
                'highschool': 'High School',
                'college': 'College',
                'graduate': 'Graduate',
                'postgraduate': 'Postgraduate',
                'notlisted': 'Not listed'
            };

            const interpretationRequest = {
                files: formData.files,
                language: formData.language,
                education_level: (educationLevelMap[formData.educationLevel] || formData.educationLevel) as 'Primary School' | 'High School' | 'College' | 'Graduate' | 'Postgraduate' | 'Not listed',
                technical_level: data.technicalLevel as 'Medical Science' | 'Other Science' | 'Non-Science',
            };

            console.log('Starting async interpretation:', interpretationRequest);
            
            // Start async interpretation job
            const asyncResponse = await interpretationAPI.startAsyncInterpretation(interpretationRequest);
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
            
            // Handle subscription limit errors (HTTP 402)
            if (err.response?.status === 402) {
                const errorDetail = err.response?.data?.detail;
                if (errorDetail && typeof errorDetail === 'object') {
                    // Detailed subscription error with usage info
                    setSubscriptionError(errorDetail);
                    setError(errorDetail.message);
                } else {
                    // Simple subscription error message
                    setError(errorDetail || 'Subscription limit exceeded. Please upgrade your plan.');
                }
                setIsLoading(false);
                return;
            }
            
            // Set user-friendly error message for other errors
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
        }
    }

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

    // Handle subscription error display
    if (subscriptionError) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Limit Reached</h1>
                        <p className="text-gray-600">Please upgrade your plan to continue using our services</p>
                    </div>
                    <SubscriptionErrorDisplay error={subscriptionError} />
                </div>
            </div>
        );
    }

    return (
        isCreated && formData.response ? (
            <div>
                <InterpretationResult response={formData.response} />
            </div>
        ) : isLoading ? (
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        {jobStatus === 'pending' ? 'Queueing Your Request...' :
                         jobStatus === 'processing' ? 'Processing Your Medical Reports...' :
                         'Starting Interpretation...'}
                    </h1>
                    
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
                </div>
                
                <ProgressBar progress={progress} />
                
                <div className="text-center space-y-4">
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
        ) : (
            <form className="space-y-9" onSubmit={handleSubmit(onHandleFormSubmit)}>
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700 text-sm">{error}</p>
                        {error.includes('timeout') && (
                            <p className="text-red-600 text-xs mt-2">
                                Try uploading smaller files or fewer files at once.
                            </p>
                        )}
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    <label htmlFor="technicalLevel" className="funnel-display-light block font-medium text-gray-800">
                        Which of these perfectly describes your background?
                    </label>
                    <select
                        id="technicalLevel"
                        className="h-11 px-4 pr-8 border rounded-md appearance-none"
                        {...register("technicalLevel")}
                        required
                    >
                        <option value="">Select your background</option>
                        <option value="Medical Science">Medical Science</option>
                        <option value="Other Science">Other Science</option>
                        <option value="Non-Science">Non-Science</option>
                    </select>
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onHandleBack}
                        className="h-11 px-6 bg-black text-white rounded-md"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="h-11 px-6 bg-black text-white rounded-md"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Starting...' : 'Ok!'}
                    </button>
                </div>
            </form>
        )
    );
}
