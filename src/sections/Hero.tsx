"use client";
import ArrowIcon from "@/assets/arrow-right.svg"
import cogImage from "@/assets/cog.png"
import cylinderImage from "@/assets/cylinder.png"
import noodlImage from "@/assets/noodle.png"
import glassImage from "@/assets/glass.png"
import Image from "next/image"
import {motion, useScroll, useTransform, useMotionValueEvent} from 'framer-motion'
import {useRef} from 'react'
import Link from "next/link";

export const Hero = () => {
  const heroRef = useRef(null);
  const {scrollYProgress} = useScroll({
    target:heroRef,
    offset: ['start end', 'end start'],
  });
  const translateY = useTransform(scrollYProgress, [0,1], [150, -150]);
  // useMotionValueEvent(scrollYProgress, "change", (latestValue) => {
  //   console.log(latestValue);
  // });
  return(
  <section ref={heroRef} className="pt-8 pb-20 md:pt-5 md:pb-10 bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,_#183EC2,_#EAEEFE_100%)] overflow-x-clip">
    <div className="container">
      <div className="md:flex items-center">


     
      <div className="md:w-[478px]">
        <div className="text-sm inline-flex border border-[#222]/10 px-3 py-1 rounded-lg tracking-tighter">Version 2.0 is coming</div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mt-6">
          Medical Reports Made{' '}
          <span className="bg-gradient-to-r from-[#e0e2e8] to-[#EAEEFE] text-transparent bg-clip-text">
            Crystal Clear
          </span>
        </h1>
        <p className="text-xl text-[#010D3E] tracking-tight mt-6" >
        Upload any medical report and get instant, easy-to-understand explanations. 
        Your personal medical translator is just one click away.
        </p>
      
      <div className="flex gap-1 items-center mt-[30px]">
      <Link href="/sign-in">
      <button className="btn btn-primary"> Get started </button>
      </Link>
      <button className="btn btn-text gap-1">
         Learn More 
         <ArrowIcon className="h-5 w-5" />
      </button>
      </div>
    </div>
   
    <div className="mt-20 md:mt-0 md:h-[648px] md:flex-1 relative">
      <motion.img 
            src={cogImage.src} 
            alt="Cog-Image" 
            className="md:absolute md:h-full md:w-auto md:max-w-none md:-left-6 lg:left-0 "
            animate={{
              translateY: [-30, 30]
            }}
            transition={{
              repeat: Infinity,
              repeatType: "mirror",
              duration: 2,
              ease: "easeInOut",
            }}
            />
      <motion.img
            src={cylinderImage.src}
            width={220} 
            height={220} 
            alt="Cylinder Image"
            className="hidden md:block -top-8 -left-32 md:absolute"
            style={{
              translateY: translateY,

            }}
            />
      <motion.img 
            src={noodlImage.src}
            width={220} 
            height={220} 
            alt="Noodle Image"
            className="hidden lg:block absolute top-[524px] left-[448px] rotate-[30-deg]"
            style={{
              rotate:30,
              translateY: translateY,

            }}
            />
    </div>
    </div>
    </div>
  </section>
  );
};
