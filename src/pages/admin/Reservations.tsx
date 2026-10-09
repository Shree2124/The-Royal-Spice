import React, { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { Reservation, Table } from '../../types';
import { format, isToday, parseISO } from 'date-fns';
import { Search, Calendar as CalendarIcon, MoreVertical } from 'lucide-react';

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const loadData = () => {
    setReservations(storage.getReservations().sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
    setTables(storage.getTables());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  const updateStatus = (id: string, status: Reservation['status']) => {
    const updated = reservations.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          updatedAt: new Date().toISOString(),
          statusHistory: [...r.statusHistory, { status, timestamp: new Date().toISOString() }]
        };
      }
      return r;
    });
    storage.updateReservations(updated);
  };

  const filteredReservations = reservations.filter(r => 
    r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed': return <span className="badge badge-blue">Confirmed</span>;
      case 'arrived': return <span className="badge badge-green">Arrived</span>;
      case 'completed': return <span className="badge badge-gray">Completed</span>;
      case 'cancelled': return <span className="badge badge-red">Cancelled</span>;
      case 'no-show': return <span className="badge badge-amber">No-Show</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-heading text-charcoal-900">Reservations</h2>
          <p className="text-charcoal-600 text-sm mt-1">Manage bookings and guest arrivals</p>
        </div>
        <button className="px-4 py-2 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978]">
          Add Reservation
        </button>
      </div>

      <div className="bg-white border border-charcoal-200 rounded-lg flex flex-col">
        <div className="p-4 border-b border-charcoal-200 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 text-charcoal-500" size={16} />
            <input 
              type="text" 
              placeholder="Search guests or ref..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#faf8f5] border border-charcoal-300 rounded-md py-2 pl-9 pr-4 text-sm text-charcoal-900 focus:border-[#c9a55a] outline-none"
            />
          </div>
          <button className="px-4 py-2 border border-charcoal-300 rounded text-sm text-charcoal-600 hover:bg-[#e8e5e2] flex items-center gap-2">
            <CalendarIcon size={16} /> Today
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-charcoal-500 border-b border-charcoal-200">
                <th className="px-6 py-4 font-medium">Guest & Ref</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Table</th>
                <th className="px-6 py-4 font-medium">Pax</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200">
              {filteredReservations.map(res => {
                const table = tables.find(t => t.id === res.tableId);
                return (
                  <tr key={res.id} className="hover:bg-[#e8e5e2]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-charcoal-900">{res.guestName}</div>
                      <div className="text-xs text-charcoal-500">{res.reference}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-charcoal-900">{format(parseISO(res.date), 'MMM dd, yyyy')}</div>
                      <div className="text-xs text-charcoal-600">{res.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-charcoal-900">Table {table?.number || '?'}</div>
                      <div className="text-xs text-charcoal-500 capitalize">{table?.seatingType}</div>
                    </td>
                    <td className="px-6 py-4 text-charcoal-900">{res.partySize}</td>
                    <td className="px-6 py-4">{getStatusBadge(res.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {res.status === 'confirmed' && (
                          <button 
                            onClick={() => updateStatus(res.id, 'arrived')}
                            className="px-3 py-1 bg-[rgba(34,197,94,0.1)] text-[#4ade80] border border-[rgba(34,197,94,0.3)] rounded text-xs hover:bg-[rgba(34,197,94,0.2)] transition-colors"
                          >
                            Mark Arrived
                          </button>
                        )}
                        {res.status === 'arrived' && (
                          <button 
                            onClick={() => updateStatus(res.id, 'completed')}
                            className="px-3 py-1 bg-[rgba(107,114,128,0.1)] text-[#9ca3af] border border-[rgba(107,114,128,0.3)] rounded text-xs hover:bg-[rgba(107,114,128,0.2)] transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        <button className="p-1 text-charcoal-500 hover:text-charcoal-900">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-charcoal-500">
                    No reservations found.
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
