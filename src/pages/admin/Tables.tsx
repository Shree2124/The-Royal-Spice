import React, { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { Table, RestaurantZone, TableShape, SeatingType } from '../../types';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [zones, setZones] = useState<RestaurantZone[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Form State
  const [number, setNumber] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [shape, setShape] = useState<TableShape>('square');
  const [zoneId, setZoneId] = useState('');
  const [seatingType, setSeatingType] = useState<SeatingType>('indoor');
  const [description, setDescription] = useState('');
  const [opStatus, setOpStatus] = useState<'available' | 'unavailable'>('available');

  const loadData = () => {
    setTables(storage.getTables().sort((a, b) => parseInt(a.number) - parseInt(b.number)));
    setZones(storage.getZones());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  const openAddModal = () => {
    setEditingTable(null);
    setNumber('');
    setCapacity(2);
    setShape('square');
    setZoneId(zones.length > 0 ? zones[0].id : '');
    setSeatingType('indoor');
    setDescription('');
    setOpStatus('available');
    setIsModalOpen(true);
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setNumber(table.number);
    setCapacity(table.capacity);
    setShape(table.shape);
    setZoneId(table.zoneId);
    setSeatingType(table.seatingType);
    setDescription(table.description || '');
    setOpStatus(table.operationalStatus);
    setIsModalOpen(true);
  };

  const deleteTable = (id: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      const updated = tables.filter(t => t.id !== id);
      storage.updateTables(updated);
      loadData();
    }
  };

  const saveTable = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zoneId) {
      alert("Please select a zone or create one in the Live Floor Plan.");
      return;
    }

    const newTable: Table = {
      id: editingTable ? editingTable.id : uuidv4(),
      number,
      capacity,
      shape,
      zoneId,
      seatingType,
      description,
      operationalStatus: opStatus,
      position: editingTable ? editingTable.position : { x: 0, y: 0 },
      size: editingTable ? editingTable.size : { width: 40, height: 40 },
      createdAt: editingTable ? editingTable.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedTables;
    if (editingTable) {
      updatedTables = tables.map(t => t.id === editingTable.id ? newTable : t);
    } else {
      updatedTables = [...tables, newTable];
    }

    storage.updateTables(updatedTables);
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-heading text-charcoal-900">Table Inventory</h2>
          <p className="text-charcoal-600 text-sm mt-1">Manage physical tables, capacity, and seating types</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978] flex items-center gap-2"
        >
          <Plus size={16} /> Add Table
        </button>
      </div>

      <div className="bg-white border border-charcoal-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-charcoal-500 border-b border-charcoal-200 bg-[#faf8f5]">
              <th className="px-6 py-4 font-medium">Table Details</th>
              <th className="px-6 py-4 font-medium">Capacity</th>
              <th className="px-6 py-4 font-medium">Location</th>
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
                    <div className="font-heading text-lg text-charcoal-900">Table {table.number}</div>
                    <div className="text-xs text-charcoal-500 capitalize">{table.shape} • {table.seatingType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[rgba(201,165,90,0.1)] text-[#c9a55a] font-medium text-sm border border-[#c9a55a]/30">
                      {table.capacity} Seats
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-charcoal-900 font-medium">{zone?.name || 'Unassigned'}</div>
                    {table.description && <div className="text-xs text-charcoal-500">{table.description}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {table.operationalStatus === 'available' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(table)}
                        className="p-2 text-charcoal-600 hover:text-[#c9a55a] bg-[#faf8f5] rounded border border-charcoal-200 transition-colors"
                        title="Edit Table"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteTable(table.id)}
                        className="p-2 text-charcoal-600 hover:text-red-500 bg-[#faf8f5] rounded border border-charcoal-200 transition-colors"
                        title="Delete Table"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {tables.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-charcoal-500">
                  <div className="flex flex-col items-center justify-center">
                    <AlertTriangle size={32} className="text-charcoal-300 mb-3" />
                    <p>No tables configured.</p>
                    <button 
                      onClick={openAddModal}
                      className="mt-4 text-[#c9a55a] font-medium hover:underline"
                    >
                      Click here to add your first table
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg border border-charcoal-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-heading text-charcoal-900">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveTable} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-charcoal-600 mb-1">Table Number</label>
                  <input 
                    type="text" 
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                    placeholder="e.g. 12 or T1"
                  />
                </div>
                <div>
                  <label className="block text-sm text-charcoal-600 mb-1">Capacity (Seats)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value))}
                    className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-charcoal-600 mb-1">Shape</label>
                  <select 
                    value={shape}
                    onChange={(e) => setShape(e.target.value as TableShape)}
                    className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                  >
                    <option value="square">Square</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="round">Round</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-charcoal-600 mb-1">Seating Type</label>
                  <select 
                    value={seatingType}
                    onChange={(e) => setSeatingType(e.target.value as SeatingType)}
                    className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                  >
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="window">Window</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-charcoal-600 mb-1">Zone / Area</label>
                <select 
                  required
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                >
                  <option value="" disabled>Select a zone</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-charcoal-600 mb-1">Operational Status</label>
                <select 
                  value={opStatus}
                  onChange={(e) => setOpStatus(e.target.value as 'available' | 'unavailable')}
                  className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-charcoal-600 mb-1">Description / Notes (Optional)</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#faf8f5] border border-charcoal-300 p-2.5 rounded text-charcoal-900 focus:border-[#c9a55a] outline-none"
                  placeholder="e.g. Near the kitchen door"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-charcoal-300 text-charcoal-600 rounded text-sm font-semibold hover:bg-[#faf8f5]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978]"
                >
                  {editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
