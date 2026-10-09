import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { storage } from './lib/storage';
import DemoToolbar from './components/DemoToolbar';

// Public Pages
import Home from './pages/public/Home';
import Reserve from './pages/public/Reserve';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import LiveFloorPlan from './pages/admin/LiveFloorPlan';
import Reservations from './pages/admin/Reservations';
import Tables from './pages/admin/Tables';
import Menu from './pages/admin/Menu';
import Orders from './pages/admin/Orders';
import QRCodes from './pages/admin/QRCodes';
import Billing from './pages/admin/Billing';
import Settings from './pages/admin/Settings';
import Reports from './pages/admin/Reports';

// Table Pages
import TableSession from './pages/table/TableSession';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import CustomerLayout from './components/layout/CustomerLayout';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    storage.init();
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#faf8f5] text-[#2a2520] font-body relative">
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="reserve" element={<Reserve />} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="floor-plan" element={<LiveFloorPlan />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="tables" element={<Tables />} />
            <Route path="menu" element={<Menu />} />
            <Route path="orders" element={<Orders />} />
            <Route path="qr-codes" element={<QRCodes />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* QR Table Experience */}
          <Route path="/table/:tableId" element={<CustomerLayout />}>
            <Route index element={<TableSession />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Persistent Demo Toolbar over everything */}
        <DemoToolbar />
      </div>
    </BrowserRouter>
  );
}

export default App;
