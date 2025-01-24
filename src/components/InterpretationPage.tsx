// import React from 'react';
// import InterpretationResult from './InterpretationResults';
// import { InterpretationResponse } from '../components/Technical';

// interface InterpretationPageProps {
//     response: InterpretationResponse;
// }

// const InterpretationPage: React.FC<InterpretationPageProps> = ({ response }) => {
//     return (
//         <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
//             <div className="relative py-3 sm:max-w-xl sm:mx-auto">
//                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
//                 <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
//                     <h1 className="text-3xl font-bold mb-8 text-center">Interpretation Result</h1>
//                     <div className="mb-8">
//                         <h2 className="text-xl font-semibold mb-2">Summary</h2>
//                         <p className="text-gray-600">{response.interpretation.summary}</p>
//                     </div>
//                     <div className="mb-8">
//                         <h2 className="text-xl font-semibold mb-2">Key Findings</h2>
//                         <ul className="list-disc pl-5 space-y-2">
//                             {response.interpretation.key_findings.map((finding, index) => (
//                                 <li key={index} className="text-gray-600">{finding}</li>
//                             ))}
//                         </ul>
//                     </div>
//                     <div className="mb-8">
//                         <h2 className="text-xl font-semibold mb-2">Recommendations</h2>
//                         <ul className="list-disc pl-5 space-y-2">
//                             {response.interpretation.recommendations.map((recommendation, index) => (
//                                 <li key={index} className="text-gray-600">{recommendation}</li>
//                             ))}
//                         </ul>
//                     </div>
//                     <div>
//                         <h2 className="text-xl font-semibold mb-2">Medical Terms</h2>
//                         <ul className="list-disc pl-5 space-y-2">
//                             {Object.entries(response.interpretation.medical_terms).map(([term, definition], index) => (
//                                 <li key={index} className="text-gray-600">
//                                     <span className="font-semibold">{term}:</span> {definition}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default InterpretationPage;
import React, { useEffect, useState } from 'react';

interface InterpretationResponse {
    interpretation: {
        summary: string;
        key_findings: string[];
        recommendations: string[];
        medical_terms: { [key: string]: string };
    };
}

interface InterpretationPageProps {
    response: InterpretationResponse;
}

interface InterpretationResultProps {
    response: InterpretationResponse;
}

const InterpretationResult: React.FC<InterpretationResultProps> = ({ response }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className={`min-h-screen bg-gray-50 py-8 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Interpretation Result</h1>
                    
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">Summary</h2>
                        <p className="text-gray-600 leading-relaxed">{response.interpretation.summary}</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">Key Findings</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            {response.interpretation.key_findings.map((finding: string, index: number) => (
                                <li key={index} className="text-gray-600">{finding}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">Recommendations</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            {response.interpretation.recommendations.map((recommendation: string, index: number) => (
                                <li key={index} className="text-gray-600">{recommendation}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">Medical Terms</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            {Object.entries(response.interpretation.medical_terms).map(([term, definition]: [string, string], index: number) => (
                                <li key={index} className="text-gray-600">
                                    <span className="font-semibold">{term}:</span> {definition}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InterpretationPage: React.FC<InterpretationPageProps> = ({ response }) => {
    return (
        <InterpretationResult response={response} />
    );
};

export default InterpretationPage;