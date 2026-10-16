// Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import { useStore } from '../../store/useStore';

const Layout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { role } = useStore();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#0b1326] transition-colors duration-300">
      {/* Sidebar — contains its own collapse toggle */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        {/* Topbar — mobile hamburger only; collapse is inside Sidebar */}
        <Topbar setMobileSidebarOpen={setMobileSidebarOpen} />

        {/* Page content */}
        <main className="w-full flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav — patients only */}
      {role === 'patient' && <MobileBottomNav />}
    </div>
  );
};

export default Layout;