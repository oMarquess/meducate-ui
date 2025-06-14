"use client"

import WelcomePage from "@/components/WelcomePage";
import Navbar from "./Navbar";
// import {UsernameForm} from "@/components/Username";
import { FormProvider } from './FormContext';
import { FormStep } from "./FormStep";




import styles from './LabsPage.module.css';

const Home: React.FC = () => {
// const [step, setStep] = useState(1);

  return (
    // <div className="min-h-screen bg-gray-100">
    <div className={styles.sourceSerif4Regular}>
   
      {/* <Navbar /> */}

      {/* Page content */}
      <main >
        <div className=" max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <WelcomePage />
            <div className="flex justify-center">
              <div className="max-w-2xl w-full border p-6  rounded-md -ml-4 md:-ml-8 lg:-ml-12">
                <FormProvider>
                  <FormStep />
                </FormProvider>
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Home;