import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { Table, RestaurantZone, DiningSession } from '../../types';
import FloorPlanViewer from '../../components/FloorPlanViewer';
import { Users, Clock, Settings, Save, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function LiveFloorPlan() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [zones, setZones] = useState<RestaurantZone[]>([]);
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftTables, setDraftTables] = useState<Table[]>([]);

  const loadData = () => {
    const t = storage.getTables();
    setTables(t);
    setDraftTables(t);
    setZones(storage.getZones());
    setSessions(storage.getSessions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  const handleSaveLayout = () => {
    storage.updateTables(draftTables);
    setIsEditMode(false);
    setSelectedTable(null);
  };

  const getTableStatus = (tableId: string) => {
    const session = sessions.find(s => s.tableId === tableId && s.status !== 'closed' && s.status !== 'cancelled');
    if (session) return 'Occupied';
    const t = tables.find(t => t.id === tableId);
    if (t?.operationalStatus === 'unavailable') return 'Unavailable';
    return 'Available';
  };

  const selectedSession = selectedTable 
    ? sessions.find(s => s.tableId === selectedTable.id && s.status !== 'closed' && s.status !== 'cancelled')
    : null;

  return (
    <div className="h-full flex gap-6">
      {/* Main Floor Plan Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-heading text-charcoal-900">Floor Plan</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[rgba(26,22,16,0.8)] border border-[#504a44]"></div> Available</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[rgba(201,165,90,0.3)] border border-[#c9a55a]"></div> Selected</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white border-red-900/50"></div> Unavailable</span>
            </div>
          </div>
          <div>
            {isEditMode ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => { setDraftTables(tables); setIsEditMode(false); }}
                  className="px-4 py-2 border border-charcoal-300 rounded text-sm text-charcoal-600 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveLayout}
                  className="px-4 py-2 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978] flex items-center gap-2"
                >
                  <Save size={16} /> Save Layout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 border border-[#c9a55a] text-[#c9a55a] rounded text-sm font-semibold hover:bg-[rgba(201,165,90,0.1)] flex items-center gap-2"
              >
                <Settings size={16} /> Edit Layout
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <FloorPlanViewer 
            tables={isEditMode ? draftTables : tables}
            zones={zones}
            selectedTableId={selectedTable?.id}
            onTableSelect={setSelectedTable}
            interactive={true}
            scale={0.8}
          />
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 bg-white border border-charcoal-200 rounded-lg flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-charcoal-200">
          <h3 className="font-heading text-lg text-gold-gradient">Table Details</h3>
        </div>

        {selectedTable ? (
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            <div className="text-center">
              <div className="text-4xl font-light mb-1">Table {selectedTable.number}</div>
              <div className="text-sm text-charcoal-600">
                {selectedTable.capacity} Seats • {zones.find(z => z.id === selectedTable.zoneId)?.name}
              </div>
            </div>

            <div className="border border-charcoal-300 rounded-lg p-4">
              <div className="text-xs uppercase tracking-widest text-charcoal-500 mb-2">Current Status</div>
              <div className="font-medium text-charcoal-900 text-lg">{getTableStatus(selectedTable.id)}</div>
              
              {selectedSession && (
                <div className="mt-4 pt-4 border-t border-charcoal-300">
                  <div className="flex items-center gap-2 text-sm text-charcoal-600 mb-2">
                    <Users size={16} /> {selectedSession.partySize} Guests
                  </div>
                  <div className="flex items-center gap-2 text-sm text-charcoal-600">
                    <Clock size={16} /> Since {format(new Date(selectedSession.startedAt), 'HH:mm')}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              {!isEditMode && (
                <>
                  <button 
                    onClick={() => navigate('/admin/sessions')}
                    className="w-full py-3 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978]"
                  >
                    {selectedSession ? 'Manage Session' : 'Start Session'}
                  </button>
                  <button 
                    onClick={() => {
                      const updated = tables.map(t => t.id === selectedTable.id ? {...t, operationalStatus: t.operationalStatus === 'available' ? 'unavailable' : 'available'} as Table : t);
                      storage.updateTables(updated);
                    }}
                    className="w-full py-3 border border-charcoal-300 rounded text-sm text-charcoal-600 hover:text-white"
                  >
                    Mark {selectedTable.operationalStatus === 'available' ? 'Unavailable' : 'Available'}
                  </button>
                </>
              )}
              {isEditMode && (
                <div className="text-sm text-charcoal-600 text-center p-4 border border-dashed border-charcoal-300 rounded">
                  Drag and drop is disabled in this demo. Edit table properties in the Tables tab.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-charcoal-500 text-center">
            <MapPin size={48} className="mb-4 opacity-50" />
            <p className="text-sm">Select a table on the floor plan to view its status and actions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
