"use client";
import ArrowRight from "@/assets/arrow-right.svg";
import starImage from "@/assets/star.png";
import springImage from "@/assets/spring.png";
import glassImage from "@/assets/cylinder-1.png"
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const CallToAction = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-white to-[#D2DCFF] py-24 overflow-x-clip"
    >
      <div className="container">
        <div className="section-heading relative">
          <h2 className="section-title">Ready to understand your health better?</h2>
          <p className="section-description mt-5">
          Join thousands of patients who are taking control of their health journey with clear, 
          simple explanations of their medical reports.
          </p>

          <motion.div
            className="absolute -left-[350px] -top-[137px]"
            style={{ translateY }}
          >
            <Image src={starImage} alt="Star Image" width={360} />
          </motion.div>

          <motion.div
            className="absolute -right-[331px] -top-[19px]"
            style={{ translateY }}
          >
            <Image src={springImage} alt="Spring Image" width={360} />
          </motion.div>
        </div>

        <div className="flex gap-2 mt-10 justify-center">
          <button className="btn btn-primary">Sign Up</button>
          <button className="btn btn-text gap-1">
            <span>Learn more</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
