import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { storage } from '../../lib/storage';
import { Table, TableQR } from '../../types';
import { Download, Printer, RefreshCw, ExternalLink } from 'lucide-react';

export default function QRCodes() {
  const [tables, setTables] = useState<Table[]>([]);
  const [qrs, setQrs] = useState<TableQR[]>([]);
  const settings = storage.getSettings();

  const loadData = () => {
    setTables(storage.getTables().sort((a, b) => parseInt(a.number) - parseInt(b.number)));
    setQrs(storage.getQRs());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  const regenerateQR = (tableId: string, tableNumber: string) => {
    if (!confirm(`Regenerate QR code for Table ${tableNumber}? Old codes will no longer work.`)) return;
    
    const newQR: TableQR = {
      id: `qr-${tableId}-${Date.now()}`, // simple unique id for demo
      tableId,
      tableNumber,
      url: `/table/${tableId}`,
      status: 'active',
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Revoke old ones and add new
    const updated = qrs.map(q => q.tableId === tableId ? { ...q, status: 'inactive' as const, revokedAt: new Date().toISOString() } : q);
    updated.push(newQR);
    
    storage.updateQRs(updated);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-heading text-charcoal-900">QR Code Management</h2>
          <p className="text-charcoal-600 text-sm mt-1">Manage and print table-specific QR codes for digital ordering</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map(table => {
          const activeQR = qrs.find(q => q.tableId === table.id && q.status === 'active');
          const fullUrl = `${window.location.origin}${activeQR?.url || `/table/${table.id}`}`;

          return (
            <div key={table.id} className="bg-white border border-charcoal-200 rounded-lg overflow-hidden flex flex-col">
              <div className="p-4 border-b border-charcoal-200 flex justify-between items-center bg-[#faf8f5]">
                <div className="font-heading text-lg text-charcoal-900">Table {table.number}</div>
                {activeQR ? (
                  <span className="badge badge-green">Active</span>
                ) : (
                  <span className="badge badge-red">Needs Setup</span>
                )}
              </div>
              
              <div className="p-6 flex flex-col items-center justify-center bg-white flex-1">
                {activeQR ? (
                  <div className="p-2 border-2 border-dashed border-gray-300 rounded relative group">
                    <QRCodeSVG 
                      value={fullUrl} 
                      size={150}
                      bgColor="#ffffff"
                      fgColor="#1a1610"
                      level="Q"
                      includeMargin={false}
                    />
                    <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-[#faf8f5] text-white text-xs rounded hover:bg-[#c9a55a] transition-colors">
                        <Download size={14} /> Download
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-[#faf8f5] text-white text-xs rounded hover:bg-[#c9a55a] transition-colors">
                        <Printer size={14} /> Print Card
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-[150px] h-[150px] border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
                    No QR Generated
                  </div>
                )}
                <div className="mt-4 text-center">
                  <div className="font-heading text-xl text-black font-bold">{settings.name}</div>
                  <div className="text-gray-500 text-sm">Scan to Order</div>
                </div>
              </div>
              
              <div className="p-3 border-t border-charcoal-200 bg-[#faf8f5] flex justify-between">
                <a 
                  href={activeQR?.url || '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className={`flex items-center gap-2 text-xs ${activeQR ? 'text-[#c9a55a] hover:text-charcoal-900' : 'text-charcoal-600 pointer-events-none'}`}
                >
                  <ExternalLink size={14} /> Demo Scan
                </a>
                <button 
                  onClick={() => regenerateQR(table.id, table.number)}
                  className="flex items-center gap-2 text-xs text-charcoal-600 hover:text-charcoal-900"
                >
                  <RefreshCw size={14} /> {activeQR ? 'Regenerate' : 'Generate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
