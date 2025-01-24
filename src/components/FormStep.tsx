import { useFormState } from "./FormContext";
import { EducationalForm } from "./EducationalLevel";
import { EmailForm } from "./UserEmail";
import { UsernameForm } from "./Username";
import { TechnicalForm } from "./Technical";
import { FileForm } from "./File";

export function FormStep(){
    const {step} = useFormState();
    switch(step){
        case 1:
            return <UsernameForm/>;
        case 2:
            return <EmailForm/>;
        case 3:
            return <EducationalForm/>;
        case 4:
            return <FileForm/>;
        case 5:
            return <TechnicalForm/>;
        default:
            return null;
    }
}