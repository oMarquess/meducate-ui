"use client";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import avatar5 from "@/assets/avatar-5.png";
import avatar6 from "@/assets/avatar-6.png";
import avatar7 from "@/assets/avatar-7.png";
import avatar8 from "@/assets/avatar-8.png";
import avatar9 from "@/assets/avatar-9.png";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import {motion} from "framer-motion"
import React from "react";

const testimonials = [
  {
    text: "The AI's ability to explain complex pathology reports in patient-friendly language has been invaluable. It saves us time while ensuring patients truly understand their health status.",
    imageSrc: avatar1.src,
    name: "Jamie Rivera",
    username: "@jamietechguru00",
  },
  {
    text: "It maintains medical accuracy while making the information accessible to patients.",
    imageSrc: avatar2.src,
    name: "Josh Smith",
    username: "@jjsmith",
  },
  {
    text: "he app helped me understand my medication monitoring reports and therapy assessments. It's empowering to truly understand the clinical measures of my progress",
    imageSrc: avatar3.src,
    name: "Morgan Lee",
    username: "@morganleewhiz",
  },
  {
    text: "I use Meducate.AI to understand my wellness screening results.",
    imageSrc: avatar4.src,
    name: "Casey Jordan",
    username: "@caseyj",
  },
  {
    text: "It's helped me catch concerning trends early and have more meaningful conversations with my doctor about prevention.",
    imageSrc: avatar5.src,
    name: "Taylor Kim",
    username: "@taylorkimm",
  },
  {
    text: "The customizability and integration capabilities of this app are top-notch.",
    imageSrc: avatar6.src,
    name: "Riley Smith",
    username: "@rileysmith1",
  },
  {
    text: "The API integration was seamless, and our clinic has seen a significant reduction in follow-up calls about test results.",
    imageSrc: avatar7.src,
    name: "Jordan Patels",
    username: "@jpatelsdesign",
  },
  {
    text: "We've integrated Meducate.AI into our patient portal. The feedback has been overwhelmingly positive - patients feel more empowered and informed.",
    imageSrc: avatar8.src,
    name: "Sam Dawson",
    username: "@dawsontechtips",
  },
  {
    text: "As a patient with c*** conditions, understanding my lab results used to be overwhelming. Meducate.AI has made it so much easier to stay informed about my health.",
    imageSrc: avatar9.src,
    name: "Casey Harper",
    username: "@casey09",
  },
];

const firstColumn = testimonials.slice(0,3);
const secondColumn = testimonials.slice(3,6);
const thirdColumn = testimonials.slice(6,9);
const TestimonialsColumn = (props: {className?:string; testimonials: 
                typeof testimonials;
              duration?:number}) => (
  <div className={props.className}>
  <motion.div animate={{
    translateY: "-50%",
  }} 
  transition={{
    duration:props.duration || 10,
    repeat:Infinity,
    ease:'linear',
    repeatType: 'loop',
  }}
  className="flex flex-col gap-6 pb-6 ">
      
      {[...new Array(2)].fill(0).map((_, index) => (

    

    <React.Fragment key={index}>

        {props.testimonials.map(({text, imageSrc, name, username}) => (
              <div key={username} className="card">
                <div>{text}</div>
            <div className="flex items-center gap-2 mt-5">

            <Image src={imageSrc} 
            alt={name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full"/>
            <div className="flex flex-col">
              <div className="font-medium tracking-tight leading-5">{name}</div>
              <div className="leading-5 tracking-tight">{username}</div>

            </div>

            </div>
          </div>
        ))}

    </React.Fragment>
  ))}

</motion.div>
</div>
);

export const Testimonials = () => {
  return (
    <section className="bg-white" id="testimonials">
      <div className="container">
        <div className="section-heading">
        <div className="flex justify-center">
           <div className="tag">Testimonials</div>
        </div>
        <h2 className="section-title">What our users say</h2>
        <p className="section-description mt-5">
        Join thousands of patients who&apos;ve transformed confusion into clarity.
        From routine check-ups to complex medical conditions, our users are taking 
        control of their health journey with confidence and understanding.
        </p>
        </div>
        <div className="flex justify-center gap-6 mt-10 max-h-[738px] overflow-hidden" 
         style={{ 
          maskImage: 'linear-gradient(to right, transparent, black, transparent)', 
          WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)'
        }}>
        <TestimonialsColumn testimonials={firstColumn} duration={15}/>
        <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19}/>
        <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17}/>
        </div>
      </div>
    </section>
  )
};
