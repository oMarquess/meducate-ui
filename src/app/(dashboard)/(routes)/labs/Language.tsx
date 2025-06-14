"use client";
import { useForm } from "react-hook-form";
import { useFormState } from "./FormContext";

type TFormValues = {
    language: 'English' | 'French';
};

export function LanguageForm() {
    const { onHandleNext, onHandleBack, setFormData, formData } = useFormState();
    const { register, handleSubmit } = useForm<TFormValues>({
        defaultValues: {
            language: formData.language || 'English'
        }
    });

    function onHandleFormSubmit(data: TFormValues) {
        setFormData((prevFormData) => ({ ...prevFormData, ...data }));
        onHandleNext();
    }

    return (
        <form className="space-y-9" onSubmit={handleSubmit(onHandleFormSubmit)}>
            <div className="flex flex-col gap-4">
                <label htmlFor="language" className="funnel-display-light block font-medium text-gray-800">
                    Select your preferred language for the medical interpretation
                </label>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <input
                            id="english"
                            type="radio"
                            value="English"
                            {...register("language")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="english" className="ml-3 block text-sm font-medium text-gray-700">
                            🇺🇸 English
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="french"
                            type="radio"
                            value="French"
                            {...register("language")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="french" className="ml-3 block text-sm font-medium text-gray-700">
                            🇫🇷 French (Français)
                        </label>
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    The medical interpretation and explanations will be provided in your selected language.
                </p>
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
                    Next
                </button>
            </div>
        </form>
    );
} 