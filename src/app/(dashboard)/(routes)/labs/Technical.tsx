"use client";
import { useForm } from "react-hook-form"
import { useFormState } from "./FormContext";
import { useState } from "react";
import axios from 'axios';
import { ProgressBar } from './ProgressBar';
import { API_ENDPOINT } from "@/config";
import { useRouter } from 'next/navigation';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { increaseApiLimit } from "@/lib/api-limit";


type TFormValues = {
    technicalLevel: string;
};

export interface InterpretationResponse {
    user_data: {
        username: string;
        email: string;
        education_level: string;
        technical_level: string;
    };
    files: string[];
    interpretation: {
        summary: string;
        key_findings: string[];
        recommendations: string[];
        medical_terms: {
            [key: string]: string;
        };
    };
}

function InterpretationResult({ response }: { response: InterpretationResponse }) {
    const router = useRouter();

    const handleReturnToHome = () => {
        router.push('/dashboard');
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">Interpretation Result</h2>
            <div className="mb-6">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Summary</AccordionTrigger>
                        <AccordionContent>
                            {response.interpretation.summary}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                {/* <h3 className="text-xl font-semibold mb-2">Summary</h3>
                <p className="text-gray-700">{response.interpretation.summary}</p> */}
            </div>
            {response.interpretation.key_findings.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Key Findings</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {response.interpretation.key_findings.map((finding, index) => (
                            <li key={index} className="text-gray-700">{finding}</li>
                        ))}
                    </ul>
                </div>
            )}
            {response.interpretation.recommendations.length > 0 && (

                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {response.interpretation.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-gray-700">{recommendation}</li>
                        ))}
                    </ul>
                </div>
            )}


            <div>
                <h3 className="text-xl font-semibold mb-2">Medical Terms</h3>
                <ul className="list-disc pl-5 space-y-2">
                    {Object.entries(response.interpretation.medical_terms).map(([term, definition], index) => (
                        <li key={index} className="text-gray-700">
                            <span className="font-semibold">{term}:</span> {definition}
                        </li>
                    ))}
                </ul>
            </div>

            <button
                type="button"
                onClick={handleReturnToHome}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                Return to Home
            </button>
        </div>
    );
}

export function TechnicalForm() {
    const [isCreated, setCreated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { onHandleBack, setFormData, formData } = useFormState();
    const { register, handleSubmit } = useForm<TFormValues>({
        defaultValues: formData
    });

    async function onHandleFormSubmit(data: TFormValues) {
        setFormData((prevFormData) => ({ ...prevFormData, ...data }));
        console.log('Data being sent to backend:', formData);
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('education_level', formData.educationLevel);
            formDataToSend.append('technical_level', data.technicalLevel);

            // Append each file individually
            if (formData.files) {
                formData.files.forEach((file: File) => {
                    formDataToSend.append('files', file);
                });
            }

            const response = await axios.post(API_ENDPOINT, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Backend response:', response.data);
            setFormData((prevFormData) => ({ ...prevFormData, response: response.data }));
            setCreated(true);
            await increaseApiLimit()
        } catch (error) {
            console.error('Error sending data to backend:', error);
            // Handle error state or display error message to the user
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
                <div className="flex flex-col gap-4">
                    <label htmlFor="technicalLevel" className="funnel-display-light block font-medium text-gray-800">
                        Which of these perfectly describes your background?
                    </label>
                    <select
                        id="technicalLevel"
                        className="h-11 px-4  pr-8 border rounded-md appearance-none"
                        {...register("technicalLevel")}
                        required
                    >
                        <option value="">Select your background</option>
                        <option value="medicalscience">Medical Science</option>
                        <option value="otherscience">Other Science</option>
                        <option value="nonscience">Non-Science</option>

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
