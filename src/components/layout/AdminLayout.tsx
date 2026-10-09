import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Grid, Settings, ClipboardList, BookOpen, QrCode, Receipt, BarChart, Menu as MenuIcon, X } from 'lucide-react';
import { storage } from '../../lib/storage';

const NAV_ITEMS = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/floor-plan', label: 'Live Floor Plan', icon: Grid },
  { path: '/admin/reservations', label: 'Reservations', icon: Users },
  { path: '/admin/tables', label: 'Tables', icon: Grid },
  { path: '/admin/menu', label: 'Menu', icon: BookOpen },
  { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { path: '/admin/qr-codes', label: 'QR Codes', icon: QrCode },
  { path: '/admin/billing', label: 'Billing & Sessions', icon: Receipt },
  { path: '/admin/reports', label: 'Reports', icon: BarChart },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const settings = storage.getSettings();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8f5] text-charcoal-900">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#f0ece6] border-r border-charcoal-200 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center px-6 border-b border-charcoal-200 justify-between">
          <div>
            <span className="font-heading text-xl font-bold text-[#c9a55a]">{settings.name}</span>
            <span className="ml-2 text-xs uppercase tracking-widest text-charcoal-500 mt-1">Admin</span>
          </div>
          <button className="md:hidden text-charcoal-600" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive 
                    ? 'bg-[rgba(201,165,90,0.15)] text-[#c9a55a] font-medium' 
                    : 'text-charcoal-600 hover:bg-[#e8e5e2] hover:text-charcoal-900'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <header className="h-16 border-b border-charcoal-200 bg-[#faf8f5] flex items-center px-4 md:px-8 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-charcoal-600 hover:bg-[#e8e5e2] rounded"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon size={20} />
            </button>
            <h1 className="text-xl font-medium font-heading truncate hidden sm:block">
              {NAV_ITEMS.find(i => location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path)))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-charcoal-600 hidden sm:block">Staff User</span>
            <div className="w-8 h-8 rounded-full bg-[#e8e5e2] flex items-center justify-center text-sm font-bold text-[#c9a55a]">SU</div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
