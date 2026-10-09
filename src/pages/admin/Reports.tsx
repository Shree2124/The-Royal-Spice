import React, { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { Bill, Reservation } from '../../types';
import { format, subDays, isAfter } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

export default function Reports() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const settings = storage.getSettings();

  useEffect(() => {
    setBills(storage.getBills().filter(b => b.status === 'paid'));
    setReservations(storage.getReservations());
  }, []);

  // Generate fake last 7 days data for demo
  const chartData = Array.from({length: 7}).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: format(d, 'MMM dd'),
      sales: Math.floor(Math.random() * 5000) + 1000,
      reservations: Math.floor(Math.random() * 20) + 5
    };
  });

  // Today's real data override
  if (chartData.length > 0) {
    const todaySales = bills.filter(b => b.updatedAt.startsWith(format(new Date(), 'yyyy-MM-dd'))).reduce((sum, b) => sum + b.totalAmount, 0);
    const todayRes = reservations.filter(r => r.date === format(new Date(), 'yyyy-MM-dd')).length;
    chartData[6] = { date: 'Today', sales: todaySales || chartData[6].sales, reservations: todayRes || chartData[6].reservations };
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-heading text-charcoal-900">Reports & Analytics</h2>
          <p className="text-charcoal-600 text-sm mt-1">Sales performance and reservation metrics</p>
        </div>
        <button className="px-4 py-2 border border-charcoal-300 rounded text-sm text-charcoal-600 hover:text-white flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border border-charcoal-200 rounded-lg p-6">
          <h3 className="text-lg font-heading text-charcoal-900 mb-6">Sales (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3530" vertical={false} />
                <XAxis dataKey="date" stroke="#7a7068" tick={{ fill: '#7a7068' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#7a7068" tick={{ fill: '#7a7068' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1610', borderColor: '#3a3530', color: '#f5f0e8' }}
                  itemStyle={{ color: '#4ade80' }}
                  formatter={(value: any) => [`${settings.currencySymbol}${value}`, 'Sales'] as any}
                />
                <Bar dataKey="sales" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-charcoal-200 rounded-lg p-6">
          <h3 className="text-lg font-heading text-charcoal-900 mb-6">Reservations (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3530" vertical={false} />
                <XAxis dataKey="date" stroke="#7a7068" tick={{ fill: '#7a7068' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#7a7068" tick={{ fill: '#7a7068' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1610', borderColor: '#3a3530', color: '#f5f0e8' }}
                  itemStyle={{ color: '#c9a55a' }}
                />
                <Bar dataKey="reservations" fill="#c9a55a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-charcoal-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-charcoal-200">
          <h3 className="text-lg font-heading text-charcoal-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-charcoal-500 border-b border-charcoal-200 bg-[#faf8f5]">
                <th className="px-6 py-4 font-medium">Bill Ref</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200">
              {bills.slice(0, 5).map(bill => (
                <tr key={bill.id} className="hover:bg-[#e8e5e2]/50 transition-colors">
                  <td className="px-6 py-4 text-charcoal-900 font-medium">{bill.reference}</td>
                  <td className="px-6 py-4 text-charcoal-600">{format(new Date(bill.updatedAt), 'MMM dd, yyyy HH:mm')}</td>
                  <td className="px-6 py-4 text-charcoal-600">{bill.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                  <td className="px-6 py-4 text-right text-green-400 font-medium">{settings.currencySymbol}{bill.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-charcoal-500">
                    No completed transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
