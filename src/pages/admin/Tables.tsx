import React, { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { Table, RestaurantZone } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [zones, setZones] = useState<RestaurantZone[]>([]);

  const loadData = () => {
    setTables(storage.getTables().sort((a, b) => parseInt(a.number) - parseInt(b.number)));
    setZones(storage.getZones());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-heading text-charcoal-900">Table Inventory</h2>
          <p className="text-charcoal-600 text-sm mt-1">Manage physical tables, capacity, and seating types</p>
        </div>
        <button className="px-4 py-2 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978] flex items-center gap-2">
          <Plus size={16} /> Add Table
        </button>
      </div>

      <div className="bg-white border border-charcoal-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-charcoal-500 border-b border-charcoal-200 bg-[#faf8f5]">
              <th className="px-6 py-4 font-medium">Table No.</th>
              <th className="px-6 py-4 font-medium">Capacity</th>
              <th className="px-6 py-4 font-medium">Zone</th>
              <th className="px-6 py-4 font-medium">Seating Type</th>
              <th className="px-6 py-4 font-medium">Op. Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-200">
            {tables.map(table => {
              const zone = zones.find(z => z.id === table.zoneId);
              return (
                <tr key={table.id} className="hover:bg-[#e8e5e2]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-heading text-lg text-charcoal-900">{table.number}</div>
                    <div className="text-xs text-charcoal-500 capitalize">{table.shape}</div>
                  </td>
                  <td className="px-6 py-4 text-charcoal-900">{table.capacity} Seats</td>
                  <td className="px-6 py-4 text-charcoal-900">{zone?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-charcoal-900 capitalize">{table.seatingType}</td>
                  <td className="px-6 py-4">
                    {table.operationalStatus === 'available' ? (
                      <span className="badge badge-green">Available</span>
                    ) : (
                      <span className="badge badge-red">Unavailable</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-charcoal-600">
                      <button className="p-2 hover:text-[#c9a55a]"><Edit2 size={16} /></button>
                      <button className="p-2 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {tables.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-charcoal-500">
                  No tables configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
