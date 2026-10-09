import React, { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { RestaurantSettings } from '../../types';
import { Save } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-heading text-charcoal-900">Restaurant Settings</h2>
          <p className="text-charcoal-600 text-sm mt-1">Configure restaurant profile, rules, and billing defaults</p>
        </div>
        <button 
          onClick={() => {
            storage.updateSettings(settings);
            alert('Settings saved successfully (Demo)');
          }}
          className="px-4 py-2 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978] flex items-center gap-2"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-charcoal-200 rounded-lg p-6">
          <h3 className="font-heading text-lg text-gold-gradient mb-4">General Profile</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-charcoal-600 mb-2">Restaurant Name</label>
              <input 
                type="text" 
                value={settings.name}
                onChange={e => setSettings({...settings, name: e.target.value})}
                className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal-600 mb-2">Tagline</label>
              <input 
                type="text" 
                value={settings.tagline}
                onChange={e => setSettings({...settings, tagline: e.target.value})}
                className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-charcoal-600 mb-2">Description</label>
              <textarea 
                value={settings.description}
                onChange={e => setSettings({...settings, description: e.target.value})}
                rows={3}
                className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-charcoal-200 rounded-lg p-6">
          <h3 className="font-heading text-lg text-gold-gradient mb-4">Billing & Financial</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-charcoal-600 mb-2">Currency</label>
              <input 
                type="text" 
                value={settings.currency}
                onChange={e => setSettings({...settings, currency: e.target.value})}
                className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal-600 mb-2">Tax Rate (%)</label>
              <input 
                type="number" 
                value={settings.taxRate}
                onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})}
                className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal-600 mb-2">Service Charge (%)</label>
              <input 
                type="number" 
                value={settings.serviceCharge}
                onChange={e => setSettings({...settings, serviceCharge: parseFloat(e.target.value) || 0})}
                className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-charcoal-200 rounded-lg p-6">
          <h3 className="font-heading text-lg text-gold-gradient mb-4">Reservation Rules</h3>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-charcoal-600 mb-2">Slot Interval (mins)</label>
              <input 
                type="number" 
                value={settings.slotIntervalMinutes}
                onChange={e => setSettings({...settings, slotIntervalMinutes: parseInt(e.target.value) || 30})}
                className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal-600 mb-2">Default Duration (mins)</label>
              <input 
                type="number" 
                value={settings.reservationDurationMinutes}
                onChange={e => setSettings({...settings, reservationDurationMinutes: parseInt(e.target.value) || 120})}
                className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
