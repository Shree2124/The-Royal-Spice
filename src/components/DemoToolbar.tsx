import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, X, ChevronUp, Monitor, Utensils, Smartphone, RotateCcw } from 'lucide-react';
import { storage } from '../lib/storage';

export default function DemoToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleReset = () => {
    if (confirm('Reset all demo data to initial state?')) {
      storage.resetToSeed();
      window.location.reload();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-[#c9a55a] text-[#1a1610] p-3 rounded-full shadow-lg hover:bg-[#dbb978] transition-colors"
        title="Open Demo Tools"
      >
        <Settings size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 bg-white border border-[rgba(201,165,90,0.3)] rounded-lg shadow-2xl overflow-hidden flex flex-col font-body text-sm text-charcoal-900">
      <div className="flex justify-between items-center p-3 border-b border-[rgba(201,165,90,0.2)] bg-[#faf8f5]">
        <span className="font-heading font-bold text-[#c9a55a]">Prototype Mode</span>
        <button onClick={() => setIsOpen(false)} className="text-[#b5ada6] hover:text-white">
          <ChevronUp size={18} className="transform rotate-180" />
        </button>
      </div>
      
      <div className="p-2 flex flex-col gap-1 max-h-[70vh] overflow-y-auto no-scrollbar">
        <div className="text-xs text-charcoal-600 uppercase tracking-wider px-2 py-1 mt-1">Experiences</div>
        
        <button 
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 px-3 py-2 rounded text-left ${location.pathname === '/' ? 'bg-[#c9a55a] text-[#1a1610]' : 'hover:bg-[#e8e5e2]'}`}
        >
          <Monitor size={16} /> Public Website
        </button>
        
        <button 
          onClick={() => navigate('/reserve')}
          className={`flex items-center gap-2 px-3 py-2 rounded text-left ${location.pathname === '/reserve' ? 'bg-[#c9a55a] text-[#1a1610]' : 'hover:bg-[#e8e5e2]'}`}
        >
          <Monitor size={16} /> Reservation Flow
        </button>
        
        <button 
          onClick={() => navigate('/admin')}
          className={`flex items-center gap-2 px-3 py-2 rounded text-left ${location.pathname.startsWith('/admin') ? 'bg-[#c9a55a] text-[#1a1610]' : 'hover:bg-[#e8e5e2]'}`}
        >
          <Utensils size={16} /> Admin Dashboard
        </button>
        
        <button 
          onClick={() => navigate('/table/table-1')}
          className={`flex items-center gap-2 px-3 py-2 rounded text-left ${location.pathname.startsWith('/table') ? 'bg-[#c9a55a] text-[#1a1610]' : 'hover:bg-[#e8e5e2]'}`}
        >
          <Smartphone size={16} /> QR Experience (T-1)
        </button>

        <div className="text-xs text-charcoal-600 uppercase tracking-wider px-2 py-1 mt-3">Actions</div>
        
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 rounded text-left text-red-400 hover:bg-[#e8e5e2]"
        >
          <RotateCcw size={16} /> Reset Demo Scenario
        </button>
      </div>
    </div>
  );
}
