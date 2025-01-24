"use client";
import { useFormState } from "./FormContext";
import {useForm} from "react-hook-form"

type TFormValues = {
    username: string;
};

export function UsernameForm() {
    const {onHandleNext, setFormData, formData} = useFormState();
    const {register, handleSubmit} = useForm < TFormValues> (
       { defaultValues: formData}
    );

    function onHandleFormSubmit(data:TFormValues){
        // console.log({ data});
        setFormData((prevFormData) =>({... prevFormData, ...data}));
        onHandleNext();

    }
    return (
        <form className="space-y-9" onSubmit={handleSubmit(onHandleFormSubmit)}>
            <div className="flex flex-col gap-4">
                <label htmlFor="username" className="funnel-display-light block font-medium text-gray-800">
                   Your full name
                </label>
                <input
                    type="text"
                    id="username"
                    className="h-11 px-4 border rounded-md"
                    placeholder="Enter your username"
                    {...register("username")}
                    required
                />
            </div>
            <div className="flex justify-end">
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
