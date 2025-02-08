"use client";
import ArrowRight from '@/assets/arrow-right.svg';
import Logo from '@/assets/logosaas.png';
import Image from 'next/image';
import MenuIcon from '@/assets/menu.svg';
import { useScroll } from 'framer-motion';
import { useEffect } from 'react';
import Link from "next/link";
export const Header = () => {
  const { scrollY } = useScroll();
  useEffect(() => {
    console.log("Sign In Redirect URL:", process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL);
    console.log("Sign Up Redirect URL:", process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL);
  }, []);

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
    <MenuIcon className="h-5 w-5 md:hidden" />
    <nav className='hidden md:flex gap-6 text-black/60 items-center'>

      <a href="" className="href">Home</a>
      <a href="#product-showcase" className="href" onClick={handleFeaturesClick}>Features</a>
      <a href="#testimonials" className="href" onClick={handleTestimonialClick}>Testimonials</a>
      <a href="#pricing" onClick={handlePricingClick} className="href">Pricing</a>
      <Link href="/sign-in">
      <button className='bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight'>Get Started</button>
      </Link>

    </nav>
    </div>
    </div>
    </div>
  </div>
  </header>
  );
};
