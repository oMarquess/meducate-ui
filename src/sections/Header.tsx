"use client";
import ArrowRight from '@/assets/arrow-right.svg';
import Logo from '@/assets/logosaas.png';
import Image from 'next/image';
import MenuIcon from '@/assets/menu.svg';
import { useScroll } from 'framer-motion';
import { useState } from 'react';
import Link from "next/link";
import { X } from 'lucide-react';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handlePricingClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const pricingSection = document.querySelector('#pricingSection');
    if (pricingSection) {
      pricingSection.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return (
    <header className='sticky top-0 backdrop-blur-sm z-20'>
      <div className="flex justify-center items-center py-3 bg-black text-white text-sm gap-3" >
        <p className='text-white/60 hidden md:block'>Your privacy is our priority. All your data is encrypted and stored securely.

        </p>
        <div className="inline-flex gap-1 items-center">
          <p> You have full control over who can access your information.</p>
          {/* <ArrowRight className="h-4 w-4 inline-flex justify-center items-center"/> */}
        </div>
      </div>
      <div>
        <div className="py-5">
          <div className="container">
            <div className="flex items-center justify-between">
              <Image src={Logo} alt='Saas Logo' height={50} width={50} />
              <div>
                <div className="md:hidden relative" onClick={toggleMenu}>
                  {isOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                </div>
                <nav className="gap-6 text-black/60 items-center">
                  <div className="hidden md:flex gap-6 text-black/60 items-center ">
                    <a href="/" className="hover:text-[#2247c5]">Home</a>
                    <a href="#product-showcase" className="hover:text-[#2247c5]" onClick={handleFeaturesClick}>Features</a>
                    <a href="#testimonials" className="hover:text-[#2247c5]" onClick={handleTestimonialClick}>Testimonials</a>
                    <a href="#pricing" onClick={handlePricingClick} className="hover:text-[#2247c5]">Pricing</a>
                    <Link href="/sign-in">
                      <button className='bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight'>Get Started</button>
                    </Link>
                  </div>

                  {isOpen && (
                    <div className="md:hidden mt-4 px-10 transition transition-discrete duration-300 ease-in-out text-white font-semibold rounded py-5 absolute right-10 bg-[#7c93e0] overflow-x-clip">
                      <div className="flex flex-col space-y-4">
                        <a href="/" className="href">Home</a>
                        <a href="#product-showcase" className="href" onClick={handleFeaturesClick}>Features</a>
                        <a href="#testimonials" className="href" onClick={handleTestimonialClick}>Testimonials</a>
                        <a href="#pricing" onClick={handlePricingClick} className="href">Pricing</a>
                        <Link href="/sign-in">
                          <button className='bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight'>Get Started</button>
                        </Link>
                      </div>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
