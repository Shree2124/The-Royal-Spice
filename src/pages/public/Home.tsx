import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { MenuItem } from '../../types';

export default function Home() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState(storage.getSettings());

  useEffect(() => {
    const items = storage.getMenuItems();
    setFeaturedItems(items.filter(i => i.isFeatured && i.isAvailable));
    setMenuItems(items.filter(i => i.isAvailable));
    
    const onUpdate = () => {
      setSettings(storage.getSettings());
      const updatedItems = storage.getMenuItems();
      setFeaturedItems(updatedItems.filter(i => i.isFeatured && i.isAvailable));
      setMenuItems(updatedItems.filter(i => i.isAvailable));
    };
    
    window.addEventListener('storage-update', onUpdate);
    return () => window.removeEventListener('storage-update', onUpdate);
  }, []);

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="bg-[#faf8f5] text-[#2a2520] min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div style={{ y: y1 }} className="h-full w-full">
            <img 
              src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2070&auto=format&fit=crop" 
              alt="Restaurant Interior" 
              className="w-full h-[120%] object-cover object-center filter brightness-[0.65]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5] via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="font-heading text-6xl md:text-8xl text-gold-gradient mb-6 tracking-wide"
          >
            {settings.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl text-charcoal-900 font-light mb-10 italic"
          >
            {settings.tagline}
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05, backgroundColor: "#dbb978" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/reserve')}
            className="px-8 py-4 bg-[#c9a55a] text-[#1a1610] font-semibold tracking-widest uppercase text-sm rounded-sm"
          >
            Reserve a Table
          </motion.button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <motion.div 
            className="w-full md:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <h2 className="font-heading text-4xl text-gold-gradient mb-8">Our Story</h2>
            <div className="prose-ember space-y-6">
              <p>{settings.description}</p>
              <p>We source our ingredients from local purveyors and sustainable farms, ensuring every dish reflects the season's best offerings. Our open wood-fire hearth is the heart of the kitchen, bringing elemental warmth to our refined culinary approach.</p>
            </div>
          </motion.div>
          <motion.div 
            className="w-full md:w-1/2 relative h-80 md:h-[500px] mt-10 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=2070&auto=format&fit=crop" 
              alt="Indian Chef cooking" 
              className="w-full h-full object-cover border border-gold-thin"
            />
            <div className="absolute -bottom-6 -left-6 w-48 h-48 border border-[#c9a55a] z-[-1]"></div>
          </motion.div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-24 bg-[#f0ece6] px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-heading text-4xl text-gold-gradient mb-4">Signatures</h2>
            <p className="text-charcoal-600">Curated highlights from our seasonal menu</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {featuredItems.slice(0, 3).map((item, i) => (
              <motion.div key={item.id} variants={fadeUp} className="group cursor-pointer">
                <div className="overflow-hidden h-80 mb-6 border border-gold-thin">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    src={item.image || `https://images.unsplash.com/photo-1544025162-8a2701460515?q=80&w=800&auto=format&fit=crop`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-heading text-xl text-charcoal-900">{item.name}</h3>
                  <span className="text-[#c9a55a]">{settings.currencySymbol}{item.price}</span>
                </div>
                <p className="text-charcoal-600 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Full Menu Preview */}
      <section id="menu" className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-heading text-4xl text-gold-gradient mb-16">The Menu</h2>
          </motion.div>

          <div className="space-y-12">
            {storage.getMenuCategories().filter(c => c.isVisible).map(category => {
              const items = menuItems.filter(i => i.categoryId === category.id);
              if (items.length === 0) return null;
              
              return (
                <motion.div 
                  key={category.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={staggerContainer}
                >
                  <h3 className="text-2xl font-heading text-charcoal-800 mb-8 uppercase tracking-widest">{category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 text-left">
                    {items.map(item => (
                      <motion.div key={item.id} variants={fadeUp} className="flex flex-col">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-heading text-lg text-charcoal-900 flex items-center gap-2">
                            {item.name}
                            {item.dietaryType === 'veg' && <span className="w-2 h-2 rounded-full bg-green-500" title="Vegetarian"></span>}
                            {item.dietaryType === 'vegan' && <span className="w-2 h-2 rounded-full bg-green-400" title="Vegan"></span>}
                          </span>
                          <span className="text-gold-dark font-medium ml-4">{settings.currencySymbol}{item.price}</span>
                        </div>
                        <div className="border-b border-dashed border-charcoal-300 w-full mb-2"></div>
                        <span className="text-charcoal-600 text-sm italic">{item.description}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-32 px-6 bg-[#f0ece6] border-y border-[rgba(201,165,90,0.1)] text-center relative overflow-hidden">
        <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-10 pointer-events-none">
           {/* Abstract shapes or pattern here if desired */}
        </motion.div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-gold-gradient mb-6">Join Us</h2>
          <p className="text-charcoal-600 mb-10 text-base md:text-lg">Experience the royal warmth of {settings.name}. Reservations are recommended.</p>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "#dbb978" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/reserve')}
            className="px-10 py-4 bg-[#c9a55a] text-[#1a1610] font-semibold tracking-widest uppercase text-sm rounded-sm"
          >
            Make a Reservation
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
