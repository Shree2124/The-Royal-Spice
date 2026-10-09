import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../../lib/storage';
import { Table, DiningSession, MenuCategory, MenuItem, Order, OrderItem, Bill, BillLineItem } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ShoppingBag, ChevronLeft, Plus, Minus, CreditCard, Clock, Check, X, QrCode } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function TableSession() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const settings = storage.getSettings();
  
  const [table, setTable] = useState<Table | null>(null);
  const [session, setSession] = useState<DiningSession | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Cart state
  const [cart, setCart] = useState<{item: MenuItem, quantity: number, notes: string}[]>([]);
  const [view, setView] = useState<'menu' | 'cart' | 'bill'>('menu');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = () => {
    const t = storage.getTables().find(t => t.id === tableId);
    setTable(t || null);
    
    const s = storage.getSessions().find(s => s.tableId === tableId && s.status !== 'closed' && s.status !== 'cancelled');
    setSession(s || null);
    
    setCategories(storage.getMenuCategories().filter(c => c.isVisible).sort((a, b) => a.sortOrder - b.sortOrder));
    setMenuItems(storage.getMenuItems().filter(i => i.isAvailable));
    
    if (s) {
      setOrders(storage.getOrders().filter(o => o.sessionId === s.id));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, [tableId]);

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { item, quantity: 1, notes: '' }]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const existing = cart.find(c => c.item.id === itemId);
    if (!existing) return;
    
    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(c => c.item.id !== itemId));
    } else {
      setCart(cart.map(c => c.item.id === itemId ? { ...c, quantity: newQty } : c));
    }
  };

  const submitOrder = () => {
    if (!session || !table || cart.length === 0) return;
    
    const newOrderItems: OrderItem[] = cart.map(c => ({
      id: uuidv4(),
      menuItemId: c.item.id,
      name: c.item.name,
      price: c.item.price,
      quantity: c.quantity,
      notes: c.notes,
      status: 'pending'
    }));
    
    const subtotal = newOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder: Order = {
      id: uuidv4(),
      reference: `ORD-${Math.floor(Math.random() * 10000)}`,
      sessionId: session.id,
      tableId: table.id,
      items: newOrderItems,
      status: 'pending',
      subtotal,
      placedAt: new Date().toISOString(),
      statusHistory: [{ status: 'pending', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storage.updateOrders([...storage.getOrders(), newOrder]);
    setCart([]);
    setView('bill');
  };

  const requestBillAndCheckout = () => {
    if (!session) return;
    
    // Auto-generate bill for self-checkout
    const bills = storage.getBills();
    let bill: Bill | undefined = bills.find(b => b.sessionId === session.id);
    
    if (!bill) {
      const validOrders = storage.getOrders().filter(o => o.sessionId === session.id && o.status !== 'cancelled');
      
      const billItems: BillLineItem[] = [];
      validOrders.forEach(order => {
        order.items.forEach(item => {
          billItems.push({
            orderId: order.id,
            orderItemId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            lineTotal: item.price * item.quantity
          });
        });
      });

      const subtotal = billItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const taxAmount = subtotal * (settings.taxRate / 100);
      const serviceAmount = subtotal * (settings.serviceCharge / 100);
      const total = subtotal + taxAmount + serviceAmount;

      bill = {
        id: uuidv4(),
        reference: `BIL-${Math.floor(Math.random() * 10000)}`,
        sessionId: session.id,
        tableId: session.tableId,
        items: billItems,
        subtotal,
        taxRate: settings.taxRate,
        taxAmount,
        serviceChargeRate: settings.serviceCharge,
        serviceChargeAmount: serviceAmount,
        discountAmount: 0,
        totalAmount: total,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storage.updateBills([...bills, bill]);
    }

    const updatedSessions = storage.getSessions().map(s => 
      s.id === session.id ? { ...s, status: 'payment-pending' as const, updatedAt: new Date().toISOString() } : s
    );
    storage.updateSessions(updatedSessions);
  };

  const initiatePayment = (method: 'upi' | 'card') => {
    setPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const processDemoPayment = () => {
    if (!session || session.status !== 'payment-pending') return;
    setIsProcessing(true);
    
    // Simulate payment delay
    setTimeout(() => {
      const bills = storage.getBills();
      const bill = bills.find(b => b.sessionId === session.id);
      
      if (bill) {
        const updatedBill = { ...bill, status: 'paid' as const, paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        storage.updateBills(bills.map(b => b.id === bill.id ? updatedBill : b));
      }
      
      const updatedSessions = storage.getSessions().map(s => 
        s.id === session.id ? { ...s, status: 'paid' as const, updatedAt: new Date().toISOString() } : s
      );
      storage.updateSessions(updatedSessions);
      
      setIsProcessing(false);
      setShowPaymentModal(false);
    }, 2500);
  };

  const startDemoSession = () => {
    if (!table) return;
    const sessionId = uuidv4();
    const newSession: DiningSession = {
      id: sessionId,
      reference: `SES-${Math.floor(Math.random() * 10000)}`,
      tableId: table.id,
      status: 'active',
      partySize: 2,
      startedAt: new Date().toISOString(),
      statusHistory: [{ status: 'active', timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    storage.updateSessions([...storage.getSessions(), newSession]);

    // Create dummy order
    const menuItems = storage.getMenuItems();
    if (menuItems.length > 0) {
      const item1 = menuItems[0];
      const item2 = menuItems.length > 1 ? menuItems[1] : menuItems[0];
      
      const newOrder: Order = {
        id: uuidv4(),
        reference: `ORD-${Math.floor(Math.random() * 10000)}`,
        sessionId: sessionId,
        tableId: table.id,
        items: [
          { id: uuidv4(), menuItemId: item1.id, name: item1.name, price: item1.price, quantity: 2, notes: '', status: 'served' },
          { id: uuidv4(), menuItemId: item2.id, name: item2.name, price: item2.price, quantity: 1, notes: '', status: 'served' }
        ],
        status: 'served',
        subtotal: (item1.price * 2) + item2.price,
        placedAt: new Date(Date.now() - 3600000).toISOString(),
        statusHistory: [{ status: 'served', timestamp: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storage.updateOrders([...storage.getOrders(), newOrder]);
    }

    loadData();
    setView('bill');
  };

  const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
  
  // Calculate running bill
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const runningSubtotal = validOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const taxAmount = runningSubtotal * (settings.taxRate / 100);
  const serviceAmount = runningSubtotal * (settings.serviceCharge / 100);
  const runningTotal = runningSubtotal + taxAmount + serviceAmount;

  if (!table) return <div className="p-8 text-center text-charcoal-900">Table not found.</div>;
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#faf8f5]">
        <h1 className="font-heading text-4xl text-[#c9a55a] mb-6">{settings.name}</h1>
        <div className="w-20 h-20 bg-white border border-charcoal-200 rounded-full flex items-center justify-center mb-6">
          <span className="font-heading text-3xl text-charcoal-900">{table.number}</span>
        </div>
        <h2 className="text-xl text-charcoal-900 mb-4">Welcome to Table {table.number}</h2>
        <p className="text-charcoal-600 mb-8 max-w-xs">
          Your dining session hasn't started yet. A staff member will open your table shortly.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={loadData}
            className="px-6 py-3 border border-charcoal-300 text-charcoal-600 rounded uppercase tracking-widest text-xs font-semibold hover:bg-[#e8e5e2]"
          >
            Refresh Status
          </button>
          <button 
            onClick={startDemoSession}
            className="px-6 py-3 bg-[#c9a55a] text-[#1a1610] rounded uppercase tracking-widest text-xs font-semibold hover:bg-[#dbb978]"
          >
            (Demo) Force Start Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Mobile Header */}
      <header className="h-16 flex-shrink-0 bg-[rgba(26,22,16,0.95)] backdrop-blur-md border-b border-charcoal-200 flex items-center justify-between px-4 z-10">
        {view !== 'menu' ? (
          <button onClick={() => setView('menu')} className="p-2 -ml-2 text-charcoal-600 hover:text-charcoal-900">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="font-heading text-xl text-gold-gradient">{settings.name}</div>
        )}
        
        <div className="text-sm font-medium text-charcoal-900 bg-white px-3 py-1 rounded-full border border-charcoal-200">
          Table {table.number}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#f0ece6] custom-scrollbar relative pb-24">
        
        {view === 'menu' && (
          <div className="p-4 space-y-8">
            {categories.map(category => {
              const catItems = menuItems.filter(i => i.categoryId === category.id);
              if (catItems.length === 0) return null;
              
              return (
                <div key={category.id}>
                  <h2 className="font-heading text-xl text-charcoal-900 mb-4 pb-2 border-b border-charcoal-200">{category.name}</h2>
                  <div className="space-y-4">
                    {catItems.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-white rounded flex-shrink-0">
                          {/* Image placeholder */}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-charcoal-900 font-medium leading-tight">{item.name}</h3>
                              <span className="text-[#c9a55a] ml-2 shrink-0">{settings.currencySymbol}{item.price}</span>
                            </div>
                            <p className="text-xs text-charcoal-600 mt-1 line-clamp-2">{item.description}</p>
                          </div>
                          <div className="flex justify-end mt-2">
                            <button 
                              onClick={() => addToCart(item)}
                              className="px-4 py-1.5 bg-white border border-charcoal-200 text-[#c9a55a] rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#e8e5e2]"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'cart' && (
          <div className="p-4">
            <h2 className="font-heading text-2xl text-charcoal-900 mb-6">Your Order</h2>
            
            {cart.length === 0 ? (
              <div className="text-center text-charcoal-500 py-12">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                <p>Your cart is empty.</p>
                <button 
                  onClick={() => setView('menu')}
                  className="mt-6 px-6 py-2 border border-[#c9a55a] text-[#c9a55a] rounded text-sm uppercase tracking-widest"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map(c => (
                  <div key={c.item.id} className="bg-white p-4 rounded-lg border border-charcoal-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-charcoal-900 font-medium">{c.item.name}</h3>
                        <div className="text-[#c9a55a]">{settings.currencySymbol}{c.item.price}</div>
                      </div>
                      <div className="text-charcoal-900 font-medium">
                        {settings.currencySymbol}{(c.item.price * c.quantity).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 bg-[#faf8f5] rounded border border-charcoal-200">
                        <button onClick={() => updateQuantity(c.item.id, -1)} className="p-2 text-charcoal-600 hover:text-charcoal-900"><Minus size={16} /></button>
                        <span className="w-4 text-center text-sm font-medium text-charcoal-900">{c.quantity}</span>
                        <button onClick={() => updateQuantity(c.item.id, 1)} className="p-2 text-charcoal-600 hover:text-charcoal-900"><Plus size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-charcoal-200 pt-4 mt-6">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-charcoal-900">Subtotal</span>
                    <span className="font-medium text-[#c9a55a]">{settings.currencySymbol}{cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-2 text-right">Taxes & fees calculated at checkout</p>
                </div>
                
                <button 
                  onClick={submitOrder}
                  className="w-full py-4 bg-[#c9a55a] text-[#1a1610] font-semibold tracking-widest uppercase text-sm rounded shadow-[0_0_15px_rgba(201,165,90,0.2)]"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'bill' && (
          <div className="p-4">
            <h2 className="font-heading text-2xl text-charcoal-900 mb-6">Table Bill</h2>
            
            {orders.length === 0 ? (
              <div className="text-center text-charcoal-500 py-12 flex flex-col items-center">
                <p>You haven't ordered anything yet.</p>
                <button 
                  onClick={() => {
                    const menuItems = storage.getMenuItems();
                    if (menuItems.length > 0) {
                      const item1 = menuItems[0];
                      const item2 = menuItems.length > 1 ? menuItems[1] : menuItems[0];
                      const newOrder: Order = {
                        id: uuidv4(),
                        reference: `ORD-${Math.floor(Math.random() * 10000)}`,
                        sessionId: session.id,
                        tableId: table.id,
                        items: [
                          { id: uuidv4(), menuItemId: item1.id, name: item1.name, price: item1.price, quantity: 2, notes: '', status: 'served' },
                          { id: uuidv4(), menuItemId: item2.id, name: item2.name, price: item2.price, quantity: 1, notes: '', status: 'served' }
                        ],
                        status: 'served',
                        subtotal: (item1.price * 2) + item2.price,
                        placedAt: new Date(Date.now() - 3600000).toISOString(),
                        statusHistory: [{ status: 'served', timestamp: new Date().toISOString() }],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      storage.updateOrders([...storage.getOrders(), newOrder]);
                      loadData();
                    }
                  }}
                  className="mt-6 px-6 py-2 border border-[#c9a55a] text-[#c9a55a] rounded text-sm uppercase tracking-widest font-semibold hover:bg-[#e8e5e2]"
                >
                  (Demo) Populate bill with items
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Orders List */}
                <div className="bg-white rounded-lg border border-charcoal-200 overflow-hidden">
                  <div className="p-4 bg-[#faf8f5] border-b border-charcoal-200">
                    <h3 className="font-heading text-charcoal-900 text-lg">Order History</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border-b border-dashed border-charcoal-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-charcoal-600">{format(new Date(order.placedAt), 'HH:mm')}</span>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                            order.status === 'pending' ? 'bg-amber-900/30 text-amber-500' :
                            order.status === 'ready' ? 'bg-green-900/30 text-green-500' :
                            order.status === 'served' ? 'bg-white text-charcoal-600' :
                            'bg-blue-900/30 text-blue-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm mb-1">
                            <span className="text-charcoal-900"><span className="text-charcoal-500 mr-2">{item.quantity}x</span>{item.name}</span>
                            <span className="text-charcoal-600">{settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Running Total / Final Bill */}
                <div className="bg-[#faf8f5] rounded-lg border border-[#c9a55a] p-4">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-charcoal-600">
                      <span>Subtotal</span>
                      <span>{settings.currencySymbol}{runningSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-charcoal-600">
                      <span>Tax ({settings.taxRate}%)</span>
                      <span>{settings.currencySymbol}{taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-charcoal-600">
                      <span>Service Charge ({settings.serviceCharge}%)</span>
                      <span>{settings.currencySymbol}{serviceAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-t border-charcoal-200 pt-4 flex justify-between items-end">
                    <span className="text-lg font-heading text-charcoal-900">Total</span>
                    <span className="text-2xl font-bold text-[#c9a55a]">{settings.currencySymbol}{runningTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Session Actions based on status */}
                {(session.status === 'active' || session.status === 'finish-requested') && (
                  <button 
                    onClick={requestBillAndCheckout}
                    className="w-full py-4 bg-[#c9a55a] text-[#1a1610] font-semibold tracking-widest uppercase text-sm rounded shadow-[0_0_15px_rgba(201,165,90,0.2)]"
                  >
                    Proceed to Checkout
                  </button>
                )}
                
                {session.status === 'payment-pending' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[rgba(201,165,90,0.1)] border border-[#c9a55a] rounded-lg text-center">
                      <h3 className="text-[#c9a55a] font-medium mb-1">Bill Ready</h3>
                      <p className="text-sm text-charcoal-900">Please select a demo payment method to complete checkout.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => initiatePayment('card')} className="py-6 bg-white border border-charcoal-200 hover:border-[#c9a55a] rounded-lg shadow-sm hover:shadow-md text-charcoal-900 text-sm font-medium flex flex-col items-center gap-3 transition-all">
                        <CreditCard size={28} className="text-[#c9a55a]" /> Credit Card
                      </button>
                      <button onClick={() => initiatePayment('upi')} className="py-6 bg-white border border-charcoal-200 hover:border-[#c9a55a] rounded-lg shadow-sm hover:shadow-md text-charcoal-900 text-sm font-medium flex flex-col items-center gap-3 transition-all">
                        <span className="font-bold text-[#c9a55a] text-2xl leading-none">UPI</span> UPI App
                      </button>
                    </div>
                  </div>
                )}
                
                {session.status === 'paid' && (
                  <div className="p-8 bg-[#faf8f5] border border-green-900/50 rounded-lg text-center">
                    <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-heading text-charcoal-900 mb-2">Payment Successful</h3>
                    <p className="text-charcoal-600 text-sm">Thank you for dining with us! Your receipt is ready.</p>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full h-16 bg-[#faf8f5] border-t border-charcoal-200 flex z-10">
        <button 
          onClick={() => setView('menu')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${view === 'menu' ? 'text-[#c9a55a]' : 'text-charcoal-500 hover:text-charcoal-600'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          <span className="text-[10px] uppercase tracking-wider font-semibold">Menu</span>
        </button>
        
        <button 
          onClick={() => setView('cart')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 relative ${view === 'cart' ? 'text-[#c9a55a]' : 'text-charcoal-500 hover:text-charcoal-600'}`}
        >
          <div className="relative">
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#c9a55a] text-[#1a1610] text-[10px] font-bold rounded-full flex items-center justify-center">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold">Cart</span>
        </button>
        
        <button 
          onClick={() => setView('bill')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 relative ${view === 'bill' ? 'text-[#c9a55a]' : 'text-charcoal-500 hover:text-charcoal-600'}`}
        >
          <div className="relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            {orders.length > 0 && session?.status === 'payment-pending' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold">Bill</span>
        </button>
      </nav>

      {/* Payment Gateway Modal Overlay */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center border border-charcoal-200"
            >
              {isProcessing ? (
                <div className="py-8 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-[#e8e5e2] border-t-[#c9a55a] rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-heading text-charcoal-900 mb-2">Processing Payment</h3>
                  <p className="text-charcoal-500 text-sm text-center">Please do not close this window or press back.</p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-heading text-charcoal-900">
                      {paymentMethod === 'card' ? 'Credit/Debit Card' : 'UPI Payment'}
                    </h3>
                    <button 
                      onClick={() => setShowPaymentModal(false)}
                      className="text-charcoal-400 hover:text-charcoal-900"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="bg-[#faf8f5] p-4 rounded-lg mb-6 flex justify-between items-center border border-charcoal-200">
                    <span className="text-charcoal-600">Amount to pay:</span>
                    <span className="text-2xl font-bold text-[#c9a55a]">{settings.currencySymbol}{runningTotal.toFixed(2)}</span>
                  </div>

                  {paymentMethod === 'card' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-charcoal-600 mb-1">Card Number</label>
                        <div className="w-full bg-[#f0ece6] border border-charcoal-300 p-3 rounded text-charcoal-500 font-mono text-sm">
                          **** **** **** 4242
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-charcoal-600 mb-1">Expiry Date</label>
                          <div className="w-full bg-[#f0ece6] border border-charcoal-300 p-3 rounded text-charcoal-500 font-mono text-sm">
                            12/26
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-charcoal-600 mb-1">CVV</label>
                          <div className="w-full bg-[#f0ece6] border border-charcoal-300 p-3 rounded text-charcoal-500 font-mono text-sm">
                            ***
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-48 h-48 bg-white border-2 border-dashed border-charcoal-300 rounded-xl flex items-center justify-center mb-4">
                        <QrCode size={64} className="text-charcoal-300" />
                      </div>
                      <p className="text-sm text-charcoal-600 text-center">Scan this QR code with any UPI app</p>
                    </div>
                  )}

                  <button 
                    onClick={processDemoPayment}
                    className="w-full py-4 mt-6 bg-[#c9a55a] text-[#1a1610] font-semibold tracking-widest uppercase text-sm rounded shadow-[0_0_15px_rgba(201,165,90,0.2)] hover:bg-[#dbb978]"
                  >
                    Pay Now
                  </button>
                  <p className="text-[10px] text-center text-charcoal-400 mt-4 uppercase tracking-wider">Dummy Payment Gateway</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
