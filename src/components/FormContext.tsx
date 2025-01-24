import { createContext , Dispatch, ReactNode, SetStateAction, useContext, useState} from "react";
import { InterpretationResponse } from "./Technical";
interface TFormData{
    username: string;
    email: string;
    educationLevel: string;
    technicalLevel: string;
    files: File[]; 
    response?: InterpretationResponse;
    
}

interface IFormContext{
    onHandleNext: () => void;
    onHandleBack: () => void;
    step: number;
    formData: TFormData;
    setFormData: Dispatch<SetStateAction<TFormData>>;
}

const FormContext = createContext<IFormContext>({
    onHandleNext: () => {},
    onHandleBack: () => {},
    step:1,
    formData: {
         username : "",
         email : "",
         educationLevel: "",
         technicalLevel: "",
         files: [],

    },
    setFormData: () => {}
});

interface IProps{
    children: ReactNode;
}


export function FormProvider({children}: IProps){
    const  [step, setStep] = useState(1);
    const [formData, setFormData] = useState<TFormData>(
        {
            username : "",
            email : "",
            educationLevel: "",
            technicalLevel: "",
            files: [],
       },
    );

    function onHandleNext(){
        // console.log({step})
        setStep((prevValue) => prevValue + 1);
    }

    function onHandleBack(){
        setStep((prevValue) => prevValue - 1);
    }

    console.log({formData});
    return (<FormContext.Provider value={{onHandleBack, onHandleNext, step, formData, setFormData}}>{children}</FormContext.Provider>);
}

export function useFormState(){
    return useContext(FormContext);
}