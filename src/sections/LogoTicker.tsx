"use client"
import acmeLogo from '@/assets/logo-acme.png';
import quantumLogo from'@/assets/logo-quantum.png';
import echoLogo from '@/assets/logo-echo.png';
import apexLogo from '@/assets/logo-apex.png';
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
        duration:5,
        repeat:Infinity,
        ease:"linear",
        repeatType: "loop"
      }}>
        <Image src={acmeLogo} alt="Acme Logo" className='logo-ticker-image'  />
        <Image src={acmeLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={apexLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={quantumLogo} alt="Acme Logo"  className='logo-ticker-image'/>
        <Image src={acmeLogo} alt="Acme Logo"  className='logo-ticker-image'/>
      </motion.div>
      </div>
    </div>

  </div>);
};
