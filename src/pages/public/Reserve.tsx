import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Table, Reservation } from '../../types';
import { format, addDays, isBefore, startOfDay, parse } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import FloorPlanViewer from '../../components/FloorPlanViewer';

type Step = 'details' | 'time' | 'table' | 'confirm';

export default function Reserve() {
  const navigate = useNavigate();
  const settings = storage.getSettings();
  
  const [step, setStep] = useState<Step>('details');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState<number>(2);
  const [seating, setSeating] = useState<'indoor' | 'outdoor' | 'no-preference'>('no-preference');
  const [time, setTime] = useState<string>('');
  
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [requests, setRequests] = useState('');
  
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  const tables = storage.getTables();
  const zones = storage.getZones();
  const reservations = storage.getReservations();

  // Generate available times based on date and settings
  const availableTimes = useMemo(() => {
    // Simplified logic for demo: return a static list of times if today is open
    const dayOfWeek = format(new Date(date), 'EEEE').toLowerCase();
    const hours = settings.openingHours.find(h => h.day === dayOfWeek);
    
    if (!hours || !hours.isOpen) return [];
    
    const slots = [];
    let current = parse(hours.openTime, 'HH:mm', new Date(date));
    const end = parse(hours.lastReservation || hours.closeTime, 'HH:mm', new Date(date));
    
    while (isBefore(current, end) || current.getTime() === end.getTime()) {
      slots.push(format(current, 'HH:mm'));
      current = new Date(current.getTime() + settings.slotIntervalMinutes * 60000);
    }
    return slots;
  }, [date, settings]);

  // Determine unavailable tables based on existing reservations for chosen date/time
  const unavailableTableIds = useMemo(() => {
    if (!date || !time) return [];
    
    const relevantReservations = reservations.filter(r => 
      r.date === date && 
      ['pending', 'confirmed', 'arrived'].includes(r.status)
    );
    
    // In a real app, we'd check overlapping time ranges based on reservationDurationMinutes.
    // For this demo, we'll just check exact time matches or within a 2-hour window.
    const busyTableIds = relevantReservations.map(r => r.tableId);
    
    // Also add tables that are too small
    const tooSmall = tables.filter(t => t.capacity < guests).map(t => t.id);
    
    // Also filter by seating preference if strict
    const wrongSeating = seating !== 'no-preference' 
      ? tables.filter(t => t.seatingType !== seating).map(t => t.id)
      : [];

    return [...new Set([...busyTableIds, ...tooSmall, ...wrongSeating])];
  }, [date, time, guests, seating, reservations, tables]);

  const handleConfirm = () => {
    if (!selectedTable) return;
    
    const newReservation: Reservation = {
      id: uuidv4(),
      reference: `EMB-${Math.floor(Math.random() * 10000)}`,
      tableId: selectedTable.id,
      guestName,
      guestEmail,
      guestPhone,
      partySize: guests,
      date,
      time,
      endTime: format(new Date(new Date(`${date}T${time}`).getTime() + settings.reservationDurationMinutes * 60000), 'HH:mm'),
      seatingPreference: seating,
      specialRequests: requests,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [{ status: 'confirmed', timestamp: new Date().toISOString() }]
    };
    
    storage.updateReservations([...reservations, newReservation]);
    storage.logAudit({
      action: 'reservation.created',
      entityId: newReservation.id,
      entityType: 'Reservation',
      description: `New reservation for ${guestName} at Table ${selectedTable.number}`,
    });
    
    setStep('confirm');
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-heading text-gold-gradient mb-8 text-center">Reserve a Table</h1>
      
      {/* Progress Steps */}
      {step !== 'confirm' && (
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 text-sm">
            <span className={step === 'details' ? 'text-[#c9a55a]' : 'text-charcoal-600'}>1. Details</span>
            <ChevronRight size={16} className="text-charcoal-600" />
            <span className={step === 'time' ? 'text-[#c9a55a]' : 'text-charcoal-600'}>2. Time</span>
            <ChevronRight size={16} className="text-charcoal-600" />
            <span className={step === 'table' ? 'text-[#c9a55a]' : 'text-charcoal-600'}>3. Table</span>
          </div>
        </div>
      )}

      <div className="bg-[#f0ece6] border border-charcoal-200 rounded p-8 min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-xl mx-auto space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-charcoal-600 mb-2">Date</label>
                  <input 
                    type="date" 
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-charcoal-300 p-3 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-charcoal-600 mb-2">Guests</label>
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-[#faf8f5] border border-charcoal-300 p-3 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                  >
                    {[...Array(settings.maxPartySize)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-charcoal-600 mb-2">Seating Preference</label>
                <div className="flex gap-4">
                  {(['no-preference', 'indoor', 'outdoor'] as const).map(pref => (
                    <button
                      key={pref}
                      onClick={() => setSeating(pref)}
                      className={`flex-1 py-3 border rounded text-sm capitalize ${
                        seating === pref 
                          ? 'border-[#c9a55a] text-[#c9a55a] bg-[rgba(201,165,90,0.1)]' 
                          : 'border-charcoal-300 text-charcoal-600 hover:border-charcoal-500'
                      }`}
                    >
                      {pref.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-charcoal-200 space-y-4">
                <input 
                  type="text" placeholder="Full Name" value={guestName} onChange={e => setGuestName(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-charcoal-300 p-3 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="email" placeholder="Email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-charcoal-300 p-3 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                  />
                  <input 
                    type="tel" placeholder="Phone" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-charcoal-300 p-3 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                  />
                </div>
                <textarea 
                  placeholder="Special Requests (Optional)" value={requests} onChange={e => setRequests(e.target.value)} rows={3}
                  className="w-full bg-[#faf8f5] border border-charcoal-300 p-3 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none resize-none"
                />
              </div>

              <button 
                onClick={() => setStep('time')}
                disabled={!guestName || !guestPhone}
                className="w-full py-4 bg-[#c9a55a] text-[#1a1610] font-semibold tracking-widest uppercase text-sm rounded disabled:opacity-50"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 'time' && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button onClick={() => setStep('details')} className="flex items-center gap-2 text-charcoal-600 hover:text-white mb-6">
                <ArrowLeft size={16} /> Back
              </button>
              
              <h2 className="text-2xl font-heading text-charcoal-900 mb-6 text-center">Available Times for {format(new Date(date), 'MMM do, yyyy')}</h2>
              
              {availableTimes.length === 0 ? (
                <div className="text-center text-charcoal-600 py-12">
                  No availability on this date. Please try another day.
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {availableTimes.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setTime(t);
                        setStep('table');
                      }}
                      className="py-4 border border-charcoal-300 rounded text-center hover:border-[#c9a55a] hover:text-[#c9a55a] transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setStep('time')} className="flex items-center gap-2 text-charcoal-600 hover:text-white">
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="text-charcoal-900 font-medium">
                  {format(new Date(date), 'MMM do')} at {time} — {guests} Guests
                </div>
              </div>

              <div className="flex-1 flex gap-8">
                <div className="flex-1">
                  <p className="text-charcoal-600 mb-4 text-sm">Select from the available tables below. Tables matching your party size are highlighted.</p>
                  <div className="border border-charcoal-200 p-2 rounded-lg bg-[#faf8f5]">
                    <FloorPlanViewer 
                      tables={tables}
                      zones={zones}
                      selectedTableId={selectedTable?.id}
                      onTableSelect={setSelectedTable}
                      interactive={true}
                      unavailableTableIds={unavailableTableIds}
                      scale={0.6}
                    />
                  </div>
                  
                  {/* Legend */}
                  <div className="flex gap-6 mt-4 text-xs text-charcoal-600 justify-center">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[rgba(26,22,16,0.8)] border border-[#504a44] rounded-sm"></div> Available</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[#e8e5e2] border border-[#504a44] rounded-sm"></div> Unavailable/Too Small</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[rgba(201,165,90,0.3)] border border-[#c9a55a] rounded-sm"></div> Selected</span>
                  </div>
                </div>

                <div className="w-80 bg-[#faf8f5] border border-charcoal-200 rounded-lg p-6 flex flex-col">
                  <h3 className="font-heading text-xl text-gold-gradient mb-4">Selection</h3>
                  
                  {selectedTable ? (
                    <div className="flex-1">
                      <div className="text-4xl font-light mb-2">Table {selectedTable.number}</div>
                      <div className="text-charcoal-600 mb-6 flex flex-col gap-2">
                        <span>Capacity: {selectedTable.capacity} guests</span>
                        <span className="capitalize">Location: {zones.find(z => z.id === selectedTable.zoneId)?.name}</span>
                        <span className="capitalize">Type: {selectedTable.seatingType}</span>
                      </div>
                      
                      <div className="border-t border-charcoal-200 pt-6 mt-auto">
                        <button 
                          onClick={handleConfirm}
                          className="w-full py-4 bg-[#c9a55a] text-[#1a1610] font-semibold tracking-widest uppercase text-sm rounded shadow-[0_0_20px_rgba(201,165,90,0.3)]"
                        >
                          Confirm Booking
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-charcoal-500 text-center text-sm border-2 border-dashed border-charcoal-200 rounded-lg p-4">
                      Please select an available table from the floor plan to proceed.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-[rgba(201,165,90,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-[#c9a55a]" />
              </div>
              <h2 className="text-3xl font-heading text-charcoal-900 mb-2">Reservation Confirmed</h2>
              <p className="text-charcoal-600 mb-8">We look forward to hosting you at Maison Ember.</p>
              
              <div className="max-w-sm mx-auto bg-[#faf8f5] border border-charcoal-200 rounded p-6 text-left mb-8">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-charcoal-600">Date</div>
                  <div className="text-right">{format(new Date(date), 'MMM do, yyyy')}</div>
                  
                  <div className="text-charcoal-600">Time</div>
                  <div className="text-right">{time}</div>
                  
                  <div className="text-charcoal-600">Guests</div>
                  <div className="text-right">{guests}</div>
                  
                  <div className="text-charcoal-600">Table</div>
                  <div className="text-right">Table {selectedTable?.number}</div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/')}
                className="text-[#c9a55a] hover:text-white underline underline-offset-4"
              >
                Return to Home
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
