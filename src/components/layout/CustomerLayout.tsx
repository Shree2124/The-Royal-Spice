import React from 'react';
import { Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#faf8f5] max-w-md mx-auto shadow-2xl relative border-x border-charcoal-200">
      <Outlet />
    </div>
  );
}
