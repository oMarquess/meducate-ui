import { useFormState } from "./FormContext";
import { EducationalForm } from "./EducationalLevel";
import { EmailForm } from "./UserEmail";
import { UsernameForm } from "./Username";
import { TechnicalForm } from "../app/(dashboard)/(routes)/labs/Technical";
import { FileForm } from "./File";

export function FormStep(){
    const {step} = useFormState();
    switch(step){
        // case 1:
        //     return <UsernameForm/>;
        // case 2:
        //     return <EmailForm/>;
        case 1:
            return <EducationalForm/>;
        case 2:
            return <FileForm/>;
        case 3:
            return <TechnicalForm/>;
        default:
            return null;
    }
}