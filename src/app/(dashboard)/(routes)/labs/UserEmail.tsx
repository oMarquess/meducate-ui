"use client";
import {useForm} from "react-hook-form"
import { useFormState } from "./FormContext";

type TFormValues = {
    email: string;
};

export function EmailForm() {
    const {onHandleNext, onHandleBack, setFormData, formData} = useFormState();
    const {register, handleSubmit} = useForm < TFormValues> (
        { defaultValues: formData}
    );
    function onHandleFormSubmit(data:TFormValues){
        setFormData((prevFormData) => ({...prevFormData, ...data}));
        console.log({ data });
        onHandleNext();

    }
    return (
        <form className="space-y-9" onSubmit={handleSubmit(onHandleFormSubmit)}>
            <div className="flex flex-col gap-4">
                <label htmlFor="email" className="funnel-display-light block font-medium text-gray-800">
                   Your Email
                </label>
                <input
                    type="email"
                    id="email"
                    className="h-11 px-4 border rounded-md"
                    placeholder="Enter your email"
                    {...register("email")}
                    required
                />
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
