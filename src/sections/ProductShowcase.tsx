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
            <div className="tag">Boost productivity</div>
          </div>
          <h2 className="text-center text-3xl md:text-[54px] md:leading-[60px] font-bold tracking-tighter bg-gradient-to-b from-black to-[#001E80] text-transparent bg-clip-text mt-5">
            A more effective way to track progress
          </h2>
          <p className="text-center text-[22px] leading-[30px] tracking-tighter text-[#010d3e] mt-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta
            explicabo nisi, distinctio officiis earum natus eos veritatis rem,
            nesciunt illo alias, magnam adipisci eligendi assumenda animi.
            Placeat exercitationem perferendis inventore!
          </p>
        </div>

        <div className="relative">
          {/* Product Image */}
          <Image src={productImage} alt="Product Image" className="mt-10" />

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
