import React, { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { Reservation, Table, DiningSession, Bill } from '../../types';
import { format, isToday } from 'date-fns';
import { Users, Grid, Clock, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const settings = storage.getSettings();

  const loadData = () => {
    setReservations(storage.getReservations());
    setTables(storage.getTables());
    setSessions(storage.getSessions());
    setBills(storage.getBills());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  const todaysReservations = reservations.filter(r => isToday(new Date(r.date)));
  const occupiedTables = sessions.filter(s => s.status !== 'closed' && s.status !== 'cancelled').length;
  const availableTables = tables.filter(t => t.operationalStatus === 'available').length - occupiedTables;
  const openBills = bills.filter(b => b.status === 'open' || b.status === 'finalized');
  
  const todaysSales = bills
    .filter(b => b.status === 'paid' && isToday(new Date(b.updatedAt)))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Mock chart data
  const chartData = [
    { time: '17:00', reservations: 2 },
    { time: '18:00', reservations: 5 },
    { time: '19:00', reservations: 12 },
    { time: '20:00', reservations: 15 },
    { time: '21:00', reservations: 8 },
    { time: '22:00', reservations: 3 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-charcoal-200 rounded-lg p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-charcoal-600 text-sm">Today's Reservations</p>
              <h3 className="text-3xl font-heading text-charcoal-900 mt-1">{todaysReservations.length}</h3>
            </div>
            <div className="p-2 bg-[rgba(201,165,90,0.1)] rounded text-[#c9a55a]">
              <Users size={20} />
            </div>
          </div>
          <div className="text-xs text-charcoal-600">
            {todaysReservations.filter(r => r.status === 'arrived').length} arrived
          </div>
        </div>

        <div className="bg-white border border-charcoal-200 rounded-lg p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-charcoal-600 text-sm">Table Status</p>
              <h3 className="text-3xl font-heading text-charcoal-900 mt-1">{occupiedTables} <span className="text-lg text-charcoal-500">/ {tables.length}</span></h3>
            </div>
            <div className="p-2 bg-[rgba(59,130,246,0.1)] rounded text-blue-400">
              <Grid size={20} />
            </div>
          </div>
          <div className="text-xs text-charcoal-600">
            {availableTables} available now
          </div>
        </div>

        <div className="bg-white border border-charcoal-200 rounded-lg p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-charcoal-600 text-sm">Active Sessions</p>
              <h3 className="text-3xl font-heading text-charcoal-900 mt-1">{sessions.filter(s => s.status === 'active' || s.status === 'finish-requested').length}</h3>
            </div>
            <div className="p-2 bg-[rgba(245,158,11,0.1)] rounded text-amber-400">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-xs text-charcoal-600">
            {openBills.length} open bills
          </div>
        </div>

        <div className="bg-white border border-charcoal-200 rounded-lg p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-charcoal-600 text-sm">Today's Sales</p>
              <h3 className="text-3xl font-heading text-[#4ade80] mt-1">{settings.currencySymbol}{todaysSales.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-[rgba(34,197,94,0.1)] rounded text-[#4ade80]">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-xs text-charcoal-600">
            Completed demo payments
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-charcoal-200 rounded-lg p-6">
          <h3 className="text-lg font-heading text-charcoal-900 mb-6">Reservation Trends (Today)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a55a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c9a55a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3530" vertical={false} />
                <XAxis dataKey="time" stroke="#7a7068" tick={{ fill: '#7a7068' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#7a7068" tick={{ fill: '#7a7068' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1610', borderColor: '#c9a55a', color: '#f5f0e8' }}
                  itemStyle={{ color: '#c9a55a' }}
                />
                <Area type="monotone" dataKey="reservations" stroke="#c9a55a" fillOpacity={1} fill="url(#colorRes)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Operations Panel */}
        <div className="bg-white border border-charcoal-200 rounded-lg p-6 flex flex-col">
          <h3 className="text-lg font-heading text-charcoal-900 mb-4">Live Operations</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {todaysReservations.slice(0, 5).map(res => (
              <div key={res.id} className="border-l-2 border-[#c9a55a] pl-3 py-1">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-charcoal-900">{res.time}</span>
                  <span className="text-charcoal-600">Table {tables.find(t => t.id === res.tableId)?.number}</span>
                </div>
                <div className="text-sm text-charcoal-600">{res.guestName} <span className="text-charcoal-500">({res.partySize} pax)</span></div>
              </div>
            ))}
            
            {todaysReservations.length === 0 && (
              <div className="text-charcoal-500 text-sm italic">No reservations today.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
