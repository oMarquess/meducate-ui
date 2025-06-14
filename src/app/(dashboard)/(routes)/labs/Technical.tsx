"use client";
import { useForm } from "react-hook-form"
import { useFormState } from "./FormContext";
import { useState } from "react";
import { ProgressBar } from './ProgressBar';
import { useRouter } from 'next/navigation';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { interpretationAPI } from "@/lib/interpretation";
import { increaseApiLimit } from "@/lib/api-limit";


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
                                            <p className="text-gray-800 italic">"{question}"</p>
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
    const [isCreated, setCreated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { onHandleBack, setFormData, formData } = useFormState();
    const { register, handleSubmit } = useForm<TFormValues>({
        defaultValues: formData
    });

    async function onHandleFormSubmit(data: TFormValues) {
        setFormData((prevFormData) => ({ ...prevFormData, ...data }));
        setIsLoading(true);
        setError(null);

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
                language: formData.language, // Use selected language from form
                education_level: educationLevelMap[formData.educationLevel] || formData.educationLevel,
                technical_level: data.technicalLevel, // Direct value since dropdown matches API
            };

            console.log('Sending interpretation request:', interpretationRequest);
            
            const response = await interpretationAPI.interpret(interpretationRequest);
            console.log('Backend response:', response);
            
            setFormData((prevFormData) => ({ ...prevFormData, response }));
            setCreated(true);
            await increaseApiLimit();
        } catch (err: any) {
            console.error('Error sending data to backend:', err);
            
            // Set user-friendly error message
            if (err.response?.status === 413) {
                setError('Files are too large. Please reduce file size and try again.');
            } else if (err.response?.status === 400) {
                setError('Invalid file format or request. Please check your files and try again.');
            } else if (err.response?.status === 401) {
                setError('Session expired. Please sign in again.');
            } else if (err.response?.status === 429) {
                setError('Too many requests. Please wait a moment and try again.');
            } else {
                setError('An error occurred while processing your request. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        isCreated && formData.response ? (
            <div>
                <InterpretationResult response={formData.response} />
            </div>
        ) : isLoading ? (
            <div>
                <h1>Loading...</h1>
                <ProgressBar />
            </div>
        ) : (
            <form className="space-y-9" onSubmit={handleSubmit(onHandleFormSubmit)}>
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700 text-sm">{error}</p>
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
                    >
                        Ok!
                    </button>
                </div>
            </form>
        )
    );
}
