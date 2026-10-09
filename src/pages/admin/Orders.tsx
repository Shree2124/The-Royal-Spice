import React, { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { Order, OrderItem, Table } from '../../types';
import { format } from 'date-fns';
import { Check, Clock, X, ChefHat, Bell } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const settings = storage.getSettings();

  const loadData = () => {
    setOrders(storage.getOrders().sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()));
    setTables(storage.getTables());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        const now = new Date().toISOString();
        return {
          ...o,
          status,
          updatedAt: now,
          acceptedAt: status === 'accepted' || status === 'preparing' ? (o.acceptedAt || now) : o.acceptedAt,
          preparedAt: status === 'ready' ? now : o.preparedAt,
          servedAt: status === 'served' ? now : o.servedAt,
          items: o.items.map(item => ({ ...item, status: status as OrderItem['status'] })), // Sync item status for simplicity in demo
          statusHistory: [...o.statusHistory, { status, timestamp: now }]
        };
      }
      return o;
    });
    storage.updateOrders(updated);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter(o => ['served', 'cancelled'].includes(o.status));

  const OrderCard = ({ order, type }: { order: Order, type: 'pending' | 'active' | 'completed' }) => {
    const table = tables.find(t => t.id === order.tableId);
    
    return (
      <div className={`bg-white border rounded-lg p-4 flex flex-col ${
        type === 'pending' ? 'border-[#c9a55a] shadow-[0_0_15px_rgba(201,165,90,0.1)]' : 'border-charcoal-200'
      }`}>
        <div className="flex justify-between items-start mb-3 border-b border-charcoal-200 pb-3">
          <div>
            <div className="font-heading text-lg text-charcoal-900">Table {table?.number || '?'}</div>
            <div className="text-xs text-charcoal-500">{order.reference} • {format(new Date(order.placedAt), 'HH:mm')}</div>
          </div>
          <div className="text-right">
            <span className={`badge ${
              order.status === 'pending' ? 'badge-amber' :
              order.status === 'preparing' ? 'badge-blue' :
              order.status === 'ready' ? 'badge-green' :
              order.status === 'served' ? 'badge-gray' : 'badge-red'
            }`}>
              {order.status}
            </span>
            <div className="text-sm font-medium text-[#c9a55a] mt-1">{settings.currencySymbol}{order.subtotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4 max-h-48">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-charcoal-600 font-mono text-sm">{item.quantity}x</span>
              <div>
                <div className="text-sm text-charcoal-900">{item.name}</div>
                {item.notes && <div className="text-xs text-amber-400/80 italic">Note: {item.notes}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-charcoal-200 flex gap-2">
          {type === 'pending' && (
            <>
              <button 
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                className="px-3 py-2 border border-red-900 text-red-400 rounded text-sm hover:bg-red-900/20"
                title="Reject Order"
              >
                <X size={16} />
              </button>
              <button 
                onClick={() => updateOrderStatus(order.id, 'accepted')}
                className="flex-1 py-2 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978]"
              >
                Accept Order
              </button>
            </>
          )}
          
          {type === 'active' && order.status === 'accepted' && (
            <button 
              onClick={() => updateOrderStatus(order.id, 'preparing')}
              className="flex-1 py-2 bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.3)] rounded text-sm font-semibold hover:bg-[rgba(59,130,246,0.25)] flex items-center justify-center gap-2"
            >
              <ChefHat size={16} /> Start Preparing
            </button>
          )}
          
          {type === 'active' && order.status === 'preparing' && (
            <button 
              onClick={() => updateOrderStatus(order.id, 'ready')}
              className="flex-1 py-2 bg-[rgba(34,197,94,0.15)] text-[#4ade80] border border-[rgba(34,197,94,0.3)] rounded text-sm font-semibold hover:bg-[rgba(34,197,94,0.25)] flex items-center justify-center gap-2"
            >
              <Bell size={16} /> Mark Ready
            </button>
          )}
          
          {type === 'active' && order.status === 'ready' && (
            <button 
              onClick={() => updateOrderStatus(order.id, 'served')}
              className="flex-1 py-2 bg-[#c9a55a] text-[#1a1610] rounded text-sm font-semibold hover:bg-[#dbb978] flex items-center justify-center gap-2"
            >
              <Check size={16} /> Served to Table
            </button>
          )}

          {type === 'completed' && (
            <div className="w-full text-center text-xs text-charcoal-500 py-1">
              Completed at {format(new Date(order.updatedAt), 'HH:mm')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-heading text-charcoal-900">Kitchen & Orders</h2>
        <p className="text-charcoal-600 text-sm mt-1">Manage incoming digital orders from tables</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Pending Orders Column */}
        <div className="bg-[#faf8f5] border border-charcoal-200 rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-charcoal-200 bg-white flex justify-between items-center">
            <h3 className="font-heading text-[#c9a55a]">New Orders</h3>
            <span className="bg-[#c9a55a] text-[#1a1610] text-xs font-bold px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar bg-[#f0ece6]">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} type="pending" />
            ))}
            {pendingOrders.length === 0 && (
              <div className="text-center text-charcoal-600 py-8 text-sm italic">No new orders</div>
            )}
          </div>
        </div>

        {/* Active Orders Column */}
        <div className="bg-[#faf8f5] border border-charcoal-200 rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-charcoal-200 bg-white flex justify-between items-center">
            <h3 className="font-heading text-charcoal-900">In Progress</h3>
            <span className="bg-[#e8e5e2] text-charcoal-900 text-xs font-bold px-2 py-0.5 rounded-full">{activeOrders.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} type="active" />
            ))}
            {activeOrders.length === 0 && (
              <div className="text-center text-charcoal-600 py-8 text-sm italic">No active orders</div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-[#faf8f5] border border-charcoal-200 rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-charcoal-200 bg-white flex justify-between items-center">
            <h3 className="font-heading text-charcoal-600">Served Today</h3>
            <span className="bg-[#e8e5e2] text-charcoal-600 text-xs font-bold px-2 py-0.5 rounded-full">{completedOrders.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {completedOrders.slice(0, 20).map(order => (
              <OrderCard key={order.id} order={order} type="completed" />
            ))}
            {completedOrders.length === 0 && (
              <div className="text-center text-charcoal-600 py-8 text-sm italic">No completed orders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
