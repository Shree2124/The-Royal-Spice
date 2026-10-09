import React, { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { DiningSession, Bill, Table, Order } from '../../types';
import { format } from 'date-fns';
import { CheckCircle, AlertCircle, Eye, CreditCard } from 'lucide-react';

export default function Billing() {
  const [sessions, setSessions] = useState<DiningSession[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const settings = storage.getSettings();

  const loadData = () => {
    setSessions(storage.getSessions().sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()));
    setBills(storage.getBills());
    setTables(storage.getTables());
    setOrders(storage.getOrders());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  const getActiveSessionDetails = (session: DiningSession) => {
    const table = tables.find(t => t.id === session.tableId);
    const bill = bills.find(b => b.sessionId === session.id);
    const sessionOrders = orders.filter(o => o.sessionId === session.id);
    
    // Check if there are any unserved orders
    const hasPendingOrders = sessionOrders.some(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status));
    
    // Calculate running total if no bill exists yet
    let total = bill ? bill.totalAmount : 0;
    if (!bill) {
      const subtotal = sessionOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.subtotal : 0), 0);
      const tax = subtotal * (settings.taxRate / 100);
      const service = subtotal * (settings.serviceCharge / 100);
      total = subtotal + tax + service;
    }

    return { table, bill, hasPendingOrders, total, sessionOrders };
  };

  const handleFinalizeBill = (session: DiningSession) => {
    const { hasPendingOrders, sessionOrders } = getActiveSessionDetails(session);
    
    if (hasPendingOrders) {
      alert('Cannot finalize bill while there are pending or unserved orders.');
      return;
    }
    
    if (sessionOrders.length === 0) {
      alert('No orders found for this session.');
      return;
    }

    // Logic to calculate and create/update bill
    // In a real app this would be a service call. For prototype, we do it here.
    const subtotal = sessionOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.subtotal : 0), 0);
    const tax = subtotal * (settings.taxRate / 100);
    const service = subtotal * (settings.serviceCharge / 100);
    const total = subtotal + tax + service;

    const items = sessionOrders.filter(o => o.status !== 'cancelled').flatMap(o => 
      o.items.map(i => ({
        orderId: o.id,
        orderItemId: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
        lineTotal: i.price * i.quantity
      }))
    );

    const newBill: Bill = {
      id: `bill-${session.id}`,
      reference: `BILL-${session.reference.split('-')[1] || Math.floor(Math.random()*1000)}`,
      sessionId: session.id,
      tableId: session.tableId,
      items,
      subtotal,
      taxRate: settings.taxRate,
      taxAmount: tax,
      serviceChargeRate: settings.serviceCharge,
      serviceChargeAmount: service,
      discountAmount: 0,
      totalAmount: total,
      status: 'finalized',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finalizedAt: new Date().toISOString()
    };

    // Update Session
    const updatedSessions = sessions.map(s => 
      s.id === session.id ? { ...s, status: 'payment-pending' as const, billFinalizedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : s
    );

    storage.updateBills([...bills.filter(b => b.sessionId !== session.id), newBill]);
    storage.updateSessions(updatedSessions);
  };

  const handleCloseSession = (session: DiningSession) => {
    const updatedSessions = sessions.map(s => 
      s.id === session.id ? { ...s, status: 'closed' as const, closedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : s
    );
    storage.updateSessions(updatedSessions);
  };

  const activeSessions = sessions.filter(s => s.status !== 'closed' && s.status !== 'cancelled');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-heading text-charcoal-900">Billing & Sessions</h2>
        <p className="text-charcoal-600 text-sm mt-1">Manage active dining sessions and payments</p>
      </div>

      <div className="bg-white border border-charcoal-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-charcoal-500 border-b border-charcoal-200 bg-[#faf8f5]">
              <th className="px-6 py-4 font-medium">Table & Session</th>
              <th className="px-6 py-4 font-medium">Time Elapsed</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Total</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-200">
            {activeSessions.map(session => {
              const { table, bill, hasPendingOrders, total } = getActiveSessionDetails(session);
              
              // Calculate elapsed time (simplified)
              const start = new Date(session.startedAt);
              const now = new Date();
              const diffMins = Math.floor((now.getTime() - start.getTime()) / 60000);
              const hours = Math.floor(diffMins / 60);
              const mins = diffMins % 60;
              const elapsedStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

              return (
                <tr key={session.id} className="hover:bg-[#e8e5e2]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-heading text-lg text-charcoal-900">Table {table?.number}</div>
                    <div className="text-xs text-charcoal-500">{session.reference} • {session.partySize} Pax</div>
                  </td>
                  <td className="px-6 py-4 text-charcoal-600">
                    {elapsedStr}
                  </td>
                  <td className="px-6 py-4">
                    {session.status === 'active' && <span className="badge badge-blue">Active</span>}
                    {session.status === 'finish-requested' && (
                      <span className="badge badge-amber flex items-center gap-1">
                        <AlertCircle size={12} /> Bill Requested
                      </span>
                    )}
                    {session.status === 'payment-pending' && <span className="badge badge-purple">Payment Pending</span>}
                    {session.status === 'paid' && <span className="badge badge-green">Paid</span>}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[#c9a55a]">
                    {settings.currencySymbol}{total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 border border-charcoal-300 rounded text-charcoal-600 hover:text-charcoal-900 hover:border-charcoal-500" title="View Details">
                        <Eye size={16} />
                      </button>
                      
                      {(session.status === 'active' || session.status === 'finish-requested') && (
                        <button 
                          onClick={() => handleFinalizeBill(session)}
                          disabled={hasPendingOrders}
                          className={`px-4 py-2 rounded text-sm font-medium ${
                            hasPendingOrders 
                              ? 'bg-[#e8e5e2] text-charcoal-500 cursor-not-allowed' 
                              : 'bg-[#c9a55a] text-[#1a1610] hover:bg-[#dbb978]'
                          }`}
                        >
                          Finalize Bill
                        </button>
                      )}

                      {session.status === 'payment-pending' && (
                        <button 
                          className="px-4 py-2 bg-[rgba(168,85,247,0.15)] text-[#c084fc] border border-[rgba(168,85,247,0.3)] rounded text-sm font-medium hover:bg-[rgba(168,85,247,0.25)] flex items-center gap-2"
                        >
                          <CreditCard size={16} /> Mark Paid (Demo)
                        </button>
                      )}

                      {session.status === 'paid' && (
                        <button 
                          onClick={() => handleCloseSession(session)}
                          className="px-4 py-2 bg-[rgba(34,197,94,0.15)] text-[#4ade80] border border-[rgba(34,197,94,0.3)] rounded text-sm font-medium hover:bg-[rgba(34,197,94,0.25)] flex items-center gap-2"
                        >
                          <CheckCircle size={16} /> Close Table
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {activeSessions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-charcoal-500">
                  No active dining sessions right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
