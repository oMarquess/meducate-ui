"use client";
import productImage from "@/assets/product-img.png";
import Image from "next/image";
import pyramidImage from "@/assets/pyramid.png";
import tubeImage from "@/assets/tube.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const ProductShowcase = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Use a proper input range of [0, 1]
  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      id="product-showcase"
      ref={sectionRef}
      className="bg-gradient-to-b from-[#FFFFFF] to-[#D2DCFF] py-24 overflow-x-clip"
    >
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag">Simplified Health Insights</div>
          </div>
          <h2 className="text-center text-3xl md:text-[54px] md:leading-[60px] font-bold tracking-tighter bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text mt-5">
            No more guessing what your reports mean.
          </h2>
          <p className="text-center text-[22px] leading-[30px] tracking-tighter text-[#010d3e] mt-5">
          Your health is unique, and so are your reports. 
          Our app provides personalized insights based on your medical history, age, gender, and lifestyle. 
          Get actionable recommendations to improve your health and well-being.
          </p>
        </div>

        <div className="relative">
          {/* Product Image */}
          <Image src={productImage} alt="Product Image" className="mt-10 rounded-2xl shadow-2xl shadow-[#001E80]/20 border-2 border-[#001E80]/10 hover:scale-105 transition-transform duration-300" />

          {/* Wrap Pyramid Image in motion.div for animation */}
          <motion.div
            className="hidden md:block absolute -right-36 -top-32"
            style={{ translateY }}
          >
            <Image src={pyramidImage} alt="Pyramid Image" height={262} width={262} />
          </motion.div>

          {/* Wrap Tube Image in motion.div for animation */}
          <motion.div
            className="hidden md:block absolute bottom-24 -left-36"
            style={{ translateY }}
          >
            <Image src={tubeImage} alt="Tube Image" height={248} width={248} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
