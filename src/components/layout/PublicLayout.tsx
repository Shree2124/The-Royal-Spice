import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { storage } from '../../lib/storage';

export default function PublicLayout() {
  const { scrollY } = useScroll();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState(storage.getSettings());

  const isHome = location.pathname === '/';

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }

    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    const onUpdate = () => setSettings(storage.getSettings());
    window.addEventListener('storage-update', onUpdate);
    return () => window.removeEventListener('storage-update', onUpdate);
  }, []);

  const navClasses = isScrolled || !isHome
    ? 'bg-[rgba(250,248,245,0.95)] backdrop-blur-md border-b border-charcoal-200 text-charcoal-900'
    : 'bg-transparent border-transparent text-white';

  return (
    <div className="flex flex-col min-h-screen text-charcoal-900 bg-[#faf8f5]">
      <motion.header 
        variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed top-0 w-full z-40 transition-colors duration-300 ${navClasses}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className={`font-heading text-2xl font-bold tracking-wider cursor-pointer ${!isScrolled && isHome ? 'text-white' : 'text-gold-gradient'}`}>
            {settings.name}
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="/" className="hover-underline">Home</a>
            <a href="/#menu" className="hover-underline">Menu</a>
            <a href="/#about" className="hover-underline">About</a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/reserve" 
              className="px-5 py-2.5 bg-[#c9a55a] text-white hover:bg-[#dbb978] transition-colors rounded-sm uppercase tracking-widest text-xs font-semibold"
            >
              Reserve Table
            </motion.a>
          </nav>
        </div>
      </motion.header>
      <main className={`flex-1 ${isHome ? '' : 'pt-20'}`}>
        <Outlet />
      </main>
      <motion.footer 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#f0ece6] border-t border-charcoal-200 py-12 px-6 text-center"
      >
        <div className="font-heading text-xl text-[#c9a55a] mb-4">{settings.name}</div>
        <div className="text-charcoal-600 text-sm mb-8">{settings.address}, {settings.city}</div>
        <div className="text-xs text-charcoal-500 uppercase tracking-widest">© {new Date().getFullYear()} {settings.name} Prototype.</div>
      </motion.footer>
    </div>
  );
}
