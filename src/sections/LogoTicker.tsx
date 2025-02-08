"use client"
import acmeLogo from '@/assets/sg.jpg';
import quantumLogo from'@/assets/black-in-ai.png';
import echoLogo from '@/assets/UNICEF-Logo-1986.png';
import apexLogo from '@/assets/Lancet-laboratories.jpg';
import huggingface from '@/assets/hf-logo-with-title.png';
import Image from 'next/image';
import {motion} from "framer-motion";
export const LogoTicker = () => {
  return ( <div className='py-8 md:py-12 bg-white'>
    <div className='container'>
      <div className='flex overflow-hidden'  style={{ maskImage: 'linear-gradient(to right, transparent, black, transparent)', 
              WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)' }}>
      <motion.div className='flex gap-14 flex-none pr-14' 
      animate={{translateX:"-50%"}}
      transition={{
        duration:7,
        repeat:Infinity,
        ease:"easeInOut",
        repeatType: "mirror"
      }}>
        <Image src={acmeLogo} alt="Acme Logo" className='logo-ticker-image'  />
        <Image src={acmeLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={apexLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={quantumLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={acmeLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={echoLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={huggingface} alt="HuggingFace"  className='logo-ticker-image'/>


        <Image src={acmeLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={apexLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={quantumLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={acmeLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={echoLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={huggingface} alt="HuggingFace"  className='logo-ticker-image'/>
      </motion.div>
      </div>
    </div>

  </div>);
};
