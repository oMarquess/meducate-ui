import React from 'react';

const InterpretationResult = ({ response }) => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
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
                            {response.interpretation.key_findings.map((finding, index) => (
                                <li key={index} className="text-gray-600">{finding}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">Recommendations</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            {response.interpretation.recommendations.map((recommendation, index) => (
                                <li key={index} className="text-gray-600">{recommendation}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">Medical Terms</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            {Object.entries(response.interpretation.medical_terms).map(([term, definition], index) => (
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

export default InterpretationResult;