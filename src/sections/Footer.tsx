"use client";
import logo from "@/assets/logosaas.png"
import Image from "next/image";
import SocialX from "@/assets/social-x.svg";
import SocialInsta from "@/assets/social-insta.svg"
import SocialLinked from "@/assets/social-linkedin.svg"
import SocialPin from "@/assets/social-pin.svg"
import SocialYoutube from "@/assets/social-youtube.svg"

export const Footer = () => {
  const handlePricingClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const pricingSection = document.querySelector('#pricingSection');
    if (pricingSection) {
      pricingSection.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const handleTestimonialClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const testimonialSection = document.querySelector('#testimonials');
    if (testimonialSection) {
      testimonialSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFeaturesClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const productShowcaseSection = document.querySelector('#product-showcase');
    if (productShowcaseSection) {
      productShowcaseSection.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (

    <footer className="bg-black text-[#BCBCBC] text-sm py-10 text-center">

      <div className="container">
      <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:h-full before:w-full  before:blur before:bg-[linear-gradient(to_right, #F87BFF, #FB92CF, #FFDD9B, #C2F0B1, #2FD8FE)] before:absolute">
      <Image src={logo} height={40} alt="SaaS logo" className="relative"/>
      </div>
      <nav className="flex flex-col md:flex-row md:justify-center gap-6 mt-6">
        <a href="#product-showcase" className="href" onClick={handleFeaturesClick}>Features</a>
        <a href="#pricing" className="href" onClick={handlePricingClick}>Pricing</a>
        <a href="#testimonials" className="href" onClick={handleTestimonialClick}>Testimonials</a>

      </nav>
      <div className="flex justify-center gap-6 mt-6">
      <SocialInsta/>
      <SocialLinked/>
      <SocialPin />
      <SocialYoutube/>
      <SocialX/>
      </div>
      <p className="mt-6">&copy; 2024 Meducate.AI. All rights reserved </p>
      </div>
    </footer>



  );
};
