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
    parameters?: {
        language: string;
        education_level: string;
        technical_level: string;
    };
}

// Translation object for UI labels
const translations = {
    english: {
        title: "Medical Analysis Results",
        subtitle: "Comprehensive health interpretation report",
        backToDashboard: "Back to Dashboard",
        goToDashboard: "Go to Dashboard",
        newAnalysis: "New Analysis",
        loading: "Loading...",
        loadingResults: "Loading your interpretation results...",
        unableToLoad: "Unable to Load Results",
        jobId: "Job ID",
        
        // Processing stats
        pdfFiles: "PDF Files",
        docxFiles: "DOCX Files",
        images: "Images",
        tokens: "Tokens",
        
        // Health assessment
        healthAssessment: "Health Assessment",
        overallHealthEvaluation: "Overall health evaluation",
        risk: "RISK",
        
        // Test results
        testResults: "Test Results",
        testResultsDescription: "Progress bars show where your values fall within the normal range (100% = upper limit of normal)",
        test: "Test",
        value: "Value",
        normalRange: "Normal Range",
        status: "Status",
        progress: "Progress",
        normal: "NORMAL",
        high: "HIGH",
        low: "LOW",
        
        // Content sections
        summary: "Summary",
        keyFindings: "Key Findings",
        recommendations: "Recommendations",
        actionPlan: "Action Plan",
        questionsForDoctor: "Questions for Your Doctor",
        educationalInformation: "Educational Information",
        medicalTermsGlossary: "Medical Terms Glossary",
        
        // Action plan categories
        immediateActions: "🚨 Immediate Actions",
        shortTerm: "📅 Short-term (1-4 weeks)",
        longTerm: "🎯 Long-term (1+ months)",
        monitoring: "🔍 Monitoring",
        
        // Educational content
        whatThisMeans: "📚 What This Means",
        whyItMatters: "💡 Why It Matters",
        lifestyleImpact: "🏃 Lifestyle Impact",
        
        // Error states
        processingMessage: "Your interpretation is still being processed. Please check back in a few minutes.",
        failedMessage: "This interpretation job failed. Please try submitting your documents again.",
        notFoundMessage: "Job results not found or not yet available.",
        jobNotFoundMessage: "Job not found. This link may be invalid or expired.",
        authRequiredMessage: "Authentication required. Please sign in to view your results.",
        permissionDeniedMessage: "You do not have permission to view this result.",
        defaultErrorMessage: "Unable to load your interpretation results. Please try again."
    },
    french: {
        title: "Résultats de l'Analyse Médicale",
        subtitle: "Rapport d'interprétation de santé complet",
        backToDashboard: "Retour au Tableau de Bord",
        goToDashboard: "Aller au Tableau de Bord",
        newAnalysis: "Nouvelle Analyse",
        loading: "Chargement...",
        loadingResults: "Chargement de vos résultats d'interprétation...",
        unableToLoad: "Impossible de Charger les Résultats",
        jobId: "ID de Tâche",
        
        // Processing stats
        pdfFiles: "Fichiers PDF",
        docxFiles: "Fichiers DOCX",
        images: "Images",
        tokens: "Jetons",
        
        // Health assessment
        healthAssessment: "Évaluation de Santé",
        overallHealthEvaluation: "Évaluation globale de la santé",
        risk: "RISQUE",
        
        // Test results
        testResults: "Résultats des Tests",
        testResultsDescription: "Les barres de progression montrent où vos valeurs se situent dans la plage normale (100% = limite supérieure de la normale)",
        test: "Test",
        value: "Valeur",
        normalRange: "Plage Normale",
        status: "Statut",
        progress: "Progression",
        normal: "NORMAL",
        high: "ÉLEVÉ",
        low: "BAS",
        
        // Content sections
        summary: "Résumé",
        keyFindings: "Principales Découvertes",
        recommendations: "Recommandations",
        actionPlan: "Plan d'Action",
        questionsForDoctor: "Questions pour Votre Médecin",
        educationalInformation: "Informations Éducatives",
        medicalTermsGlossary: "Glossaire des Termes Médicaux",
        
        // Action plan categories
        immediateActions: "🚨 Actions Immédiates",
        shortTerm: "📅 Court terme (1-4 semaines)",
        longTerm: "🎯 Long terme (1+ mois)",
        monitoring: "🔍 Surveillance",
        
        // Educational content
        whatThisMeans: "📚 Ce que Cela Signifie",
        whyItMatters: "💡 Pourquoi C'est Important",
        lifestyleImpact: "🏃 Impact sur le Mode de Vie",
        
        // Error states
        processingMessage: "Votre interprétation est encore en cours de traitement. Veuillez revenir dans quelques minutes.",
        failedMessage: "Cette tâche d'interprétation a échoué. Veuillez essayer de soumettre vos documents à nouveau.",
        notFoundMessage: "Résultats de la tâche non trouvés ou pas encore disponibles.",
        jobNotFoundMessage: "Tâche non trouvée. Ce lien peut être invalide ou expiré.",
        authRequiredMessage: "Authentification requise. Veuillez vous connecter pour voir vos résultats.",
        permissionDeniedMessage: "Vous n'avez pas la permission de voir ce résultat.",
        defaultErrorMessage: "Impossible de charger vos résultats d'interprétation. Veuillez réessayer."
    }
};

// Helper function to get translated text
const getTranslation = (language: string | undefined, key: keyof typeof translations.english): string => {
    console.log(`🔍 Translation Debug:`, {
        inputLanguage: language,
        key,
        languageAfterLowerCase: language?.toLowerCase(),
        isExactlyFrench: language?.toLowerCase() === 'french',
        detectedLang: language?.toLowerCase() === 'french' ? 'french' : 'english'
    });
    
    const lang = language?.toLowerCase() === 'french' ? 'french' : 'english';
    const translatedText = translations[lang][key] || translations.english[key];
    
    console.log(`🔍 Translation Result:`, {
        finalLang: lang,
        translatedText,
        englishVersion: translations.english[key],
        frenchVersion: translations.french[key]
    });
    
    return translatedText;
};

export default function AsyncLabResultPage() {
    const params = useParams();
    const router = useRouter();
    const { isSignedIn, isLoading: authLoading } = useAuth();
    const [result, setResult] = useState<InterpretationResponse | null>(null);
    const [language, setLanguage] = useState<string>('English');
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
            
            console.log('Fetching job result for:', jobId);
            const jobResult = await interpretationAPI.getJobStatus(jobId);
            console.log('Job result:', jobResult);
            
            const jobLanguage = jobResult.parameters?.language || 'English';
            setLanguage(jobLanguage);
            console.log('Language detected:', jobLanguage);
            
            if (jobResult.status === 'completed' && jobResult.result) {
                setResult(jobResult.result);
            } else if (jobResult.status === 'processing' || jobResult.status === 'pending') {
                setError(getTranslation(jobLanguage, 'processingMessage'));
            } else if (jobResult.status === 'failed') {
                setError(getTranslation(jobLanguage, 'failedMessage'));
            } else {
                setError(getTranslation(jobLanguage, 'notFoundMessage'));
            }
        } catch (err: any) {
            console.error('Error fetching job result:', err);
            if (err.response?.status === 404) {
                setError(getTranslation(undefined, 'jobNotFoundMessage'));
            } else if (err.response?.status === 401) {
                setError(getTranslation(undefined, 'authRequiredMessage'));
            } else if (err.response?.status === 403) {
                setError(getTranslation(undefined, 'permissionDeniedMessage'));
            } else {
                setError(getTranslation(undefined, 'defaultErrorMessage'));
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

    const getStatusLabel = (status: string, language: string | undefined) => {
        switch (status?.toLowerCase()) {
            case 'normal': return getTranslation(language, 'normal');
            case 'high': return getTranslation(language, 'high');
            case 'low': return getTranslation(language, 'low');
            default: return status?.toUpperCase();
        }
    };

    // Show loading while auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">{getTranslation(undefined, 'loading')}</p>
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
                    <p className="text-gray-600">{getTranslation(undefined, 'loadingResults')}</p>
                    <p className="text-sm text-gray-500 mt-2">{getTranslation(undefined, 'jobId')}: {jobId}</p>
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
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{getTranslation(undefined, 'unableToLoad')}</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                            {getTranslation(undefined, 'goToDashboard')}
                        </button>
                        <button
                            onClick={() => router.push('/labs')}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            {getTranslation(undefined, 'newAnalysis')}
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
                    {/* Debug Info - Remove this after debugging */}
                    <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                        <h3 className="font-bold text-yellow-800">🐛 Debug Info (Remove this later)</h3>
                        <p className="text-yellow-700">
                            <strong>Detected Language:</strong> "{language}" | 
                            <strong> Lowercase:</strong> "{language?.toLowerCase()}" | 
                            <strong> Is French?:</strong> {language?.toLowerCase() === 'french' ? 'Yes' : 'No'}
                        </p>
                        <p className="text-yellow-700">
                            <strong>Sample Translation (title):</strong> {getTranslation(language, 'title')}
                        </p>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{getTranslation(language, 'title')}</h1>
                        <p className="text-sm sm:text-base text-gray-600">{getTranslation(language, 'subtitle')}</p>
                        <p className="text-xs text-gray-500 mt-1">{getTranslation(language, 'jobId')}: {jobId}</p>
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
                            {getTranslation(language, 'backToDashboard')}
                        </button>
                    </div>

                    {/* Results Container */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        {/* Processing Stats Header */}
                        <div className="bg-gray-900 text-white p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold">{result.processing_stats.pdfs}</div>
                                    <div className="text-xs sm:text-sm opacity-90">{getTranslation(language, 'pdfFiles')}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold">{result.processing_stats.docx}</div>
                                    <div className="text-xs sm:text-sm opacity-90">{getTranslation(language, 'docxFiles')}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold">{result.processing_stats.images}</div>
                                    <div className="text-xs sm:text-sm opacity-90">{getTranslation(language, 'images')}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl font-bold">{result.context_info.total_tokens}</div>
                                    <div className="text-xs sm:text-sm opacity-90">{getTranslation(language, 'tokens')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Health Score */}
                        {result.interpretation.visual_metrics && (
                            <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{getTranslation(language, 'healthAssessment')}</h3>
                                        <p className="text-sm text-gray-600">{getTranslation(language, 'overallHealthEvaluation')}</p>
                                    </div>
                                    <div className="text-center sm:text-right">
                                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                            {result.interpretation.visual_metrics.overall_health_score}%
                                        </div>
                                        <div className={`inline-block px-3 py-1 rounded border text-xs font-medium ${getRiskLevelColor(result.interpretation.visual_metrics.risk_level)}`}>
                                            {result.interpretation.visual_metrics.risk_level.toUpperCase()} {getTranslation(language, 'risk')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Test Results Table */}
                        {result.interpretation.visual_metrics?.test_results && (
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">{getTranslation(language, 'testResults')}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {getTranslation(language, 'testResultsDescription')}
                                    </p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">{getTranslation(language, 'test')}</th>
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">{getTranslation(language, 'value')}</th>
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">{getTranslation(language, 'normalRange')}</th>
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">{getTranslation(language, 'status')}</th>
                                                <th className="text-left py-3 px-2 font-medium text-gray-700">{getTranslation(language, 'progress')}</th>
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
                                                            {getStatusLabel(test.status, language)}
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
                                        <span className="font-medium text-gray-900">{getTranslation(language, 'summary')}</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <p className="text-gray-700 leading-relaxed text-sm">{result.interpretation.summary}</p>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Key Findings */}
                                {result.interpretation.key_findings && (
                                    <AccordionItem value="findings" className="border border-gray-200 rounded">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                                            <span className="font-medium text-gray-900">{getTranslation(language, 'keyFindings')}</span>
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
                                            <span className="font-medium text-gray-900">{getTranslation(language, 'recommendations')}</span>
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
                                            <span className="font-medium text-gray-900">{getTranslation(language, 'actionPlan')}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 space-y-4">
                                            {result.interpretation.action_plan.immediate && (
                                                <div>
                                                    <h4 className="font-medium text-red-700 mb-2">{getTranslation(language, 'immediateActions')}</h4>
                                                    <ul className="space-y-1">
                                                        {result.interpretation.action_plan.immediate.map((action, index) => (
                                                            <li key={index} className="text-sm text-gray-700 ml-4">• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {result.interpretation.action_plan.short_term && (
                                                <div>
                                                    <h4 className="font-medium text-orange-700 mb-2">{getTranslation(language, 'shortTerm')}</h4>
                                                    <ul className="space-y-1">
                                                        {result.interpretation.action_plan.short_term.map((action, index) => (
                                                            <li key={index} className="text-sm text-gray-700 ml-4">• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {result.interpretation.action_plan.long_term && (
                                                <div>
                                                    <h4 className="font-medium text-green-700 mb-2">{getTranslation(language, 'longTerm')}</h4>
                                                    <ul className="space-y-1">
                                                        {result.interpretation.action_plan.long_term.map((action, index) => (
                                                            <li key={index} className="text-sm text-gray-700 ml-4">• {action}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {result.interpretation.action_plan.monitoring && (
                                                <div>
                                                    <h4 className="font-medium text-blue-700 mb-2">{getTranslation(language, 'monitoring')}</h4>
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
                                            <span className="font-medium text-gray-900">{getTranslation(language, 'questionsForDoctor')}</span>
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
                                            <span className="font-medium text-gray-900">{getTranslation(language, 'educationalInformation')}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 space-y-4">
                                            {result.interpretation.educational_content.what_this_means && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">{getTranslation(language, 'whatThisMeans')}</h4>
                                                    <p className="text-sm text-gray-700">{result.interpretation.educational_content.what_this_means}</p>
                                                </div>
                                            )}
                                            {result.interpretation.educational_content.why_it_matters && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">{getTranslation(language, 'whyItMatters')}</h4>
                                                    <p className="text-sm text-gray-700">{result.interpretation.educational_content.why_it_matters}</p>
                                                </div>
                                            )}
                                            {result.interpretation.educational_content.lifestyle_impact && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">{getTranslation(language, 'lifestyleImpact')}</h4>
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
                                            <span className="font-medium text-gray-900">{getTranslation(language, 'medicalTermsGlossary')}</span>
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
                            {getTranslation(language, 'goToDashboard')}
                        </button>
                        <button
                            onClick={() => {
                                // Use window.location to ensure a fresh page load and clean state
                                window.location.href = '/labs';
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            {getTranslation(language, 'newAnalysis')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
} 