import {useForm} from "react-hook-form"
import { useFormState } from "./FormContext";


type TFormValues = {
    educationLevel: string;
};

export function EducationalForm() {
    // const [isCreated, setCreated] = useState(false);
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
                    <label htmlFor="educationLevel" className="funnel-display-light block font-medium text-gray-800">
                        Level of Education
                    </label>
                    <select
                        id="educationLevel"
                        className="h-11 px-4 pr-8 border rounded-md appearance-none"
                        {...register("educationLevel")}
                        required
                    >
                        <option value="">Select your level of education</option>
                        <option value="primary">Primary School</option>
                        <option value="highSchool">High School</option>
                        <option value="college">College</option>
                        <option value="graduate">Graduate</option>
                        <option value="postgraduate">Postgraduate</option>
                        <option value="none">Not listed</option>
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
                       Next
                    </button>
                </div>
            </form>
        );
}
