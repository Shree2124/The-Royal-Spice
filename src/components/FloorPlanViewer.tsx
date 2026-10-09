import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Table, RestaurantZone } from '../types';

interface FloorPlanViewerProps {
  tables: Table[];
  zones: RestaurantZone[];
  selectedTableId?: string;
  onTableSelect?: (table: Table) => void;
  interactive?: boolean;
  unavailableTableIds?: string[];
  scale?: number;
}

export default function FloorPlanViewer({
  tables,
  zones,
  selectedTableId,
  onTableSelect,
  interactive = false,
  unavailableTableIds = [],
  scale = 1
}: FloorPlanViewerProps) {
  
  const containerStyle = {
    width: 1200 * scale,
    height: 800 * scale,
    position: 'relative' as const,
    transformOrigin: 'top left',
    transform: `scale(${scale})`
  };

  const getTableColor = (table: Table) => {
    if (unavailableTableIds.includes(table.id)) return 'bg-[#e8e5e2] border-[#504a44] text-charcoal-500 cursor-not-allowed';
    if (selectedTableId === table.id) return 'bg-[rgba(201,165,90,0.3)] border-[#c9a55a] text-white shadow-[0_0_15px_rgba(201,165,90,0.5)]';
    if (table.operationalStatus === 'unavailable') return 'bg-white border-red-900/50 text-red-900/50 cursor-not-allowed';
    
    return interactive 
      ? 'bg-[rgba(26,22,16,0.8)] border-[#948b82] text-[#e8e0d0] hover:border-[#c9a55a] hover:text-[#c9a55a] cursor-pointer'
      : 'bg-[rgba(26,22,16,0.8)] border-[#504a44] text-[#b5ada6]';
  };

  return (
    <div className="overflow-auto w-full border border-charcoal-200 bg-[#f0ece6] rounded-lg custom-scrollbar">
      <div style={{ minWidth: 1200 * scale, minHeight: 800 * scale }}>
        <div style={containerStyle} className="relative mx-auto">
          {/* Zones */}
          {zones.map(zone => (
            <div 
              key={zone.id}
              className="absolute border border-dashed border-charcoal-300 pointer-events-none rounded-xl bg-opacity-5"
              style={{
                left: zone.position.x,
                top: zone.position.y,
                width: zone.size.width,
                height: zone.size.height,
                backgroundColor: zone.color
              }}
            >
              <div className="p-4 text-charcoal-600 font-heading text-2xl uppercase tracking-widest opacity-50">
                {zone.name}
              </div>
            </div>
          ))}

          {/* Tables */}
          {tables.map(table => {
            const isUnavailable = unavailableTableIds.includes(table.id) || table.operationalStatus === 'unavailable';
            const isSelected = selectedTableId === table.id;
            
            return (
              <motion.div
                key={table.id}
                onClick={() => {
                  if (interactive && !isUnavailable && onTableSelect) {
                    onTableSelect(table);
                  }
                }}
                whileHover={interactive && !isUnavailable ? { scale: 1.05 } : {}}
                whileTap={interactive && !isUnavailable ? { scale: 0.95 } : {}}
                className={`absolute flex flex-col items-center justify-center border-2 transition-colors ${getTableColor(table)}`}
                style={{
                  left: table.position.x,
                  top: table.position.y,
                  width: table.size.width,
                  height: table.size.height,
                  borderRadius: table.shape === 'round' ? '50%' : '8px'
                }}
              >
                <span className="font-bold">{table.number}</span>
                <span className="text-[10px] opacity-70 mt-1">{table.capacity} Seats</span>
                
                {/* Visual indicators for seats could be added here */}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
