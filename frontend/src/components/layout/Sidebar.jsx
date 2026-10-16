import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Mic, 
  Brain, 
  ScanFace, 
  Gamepad2, 
  TrendingUp, 
  Users, 
  Settings,
  LogOut,
  FileText,
  ChevronLeft,
  ChevronRight,
  Clock,
  SplitSquareHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store/useStore';

const Sidebar = ({ isMobileOpen, setMobileOpen }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, sidebarCollapsed, toggleSidebar, logout, theme } = useStore();
  const isDark = theme === 'dark';

  const handleLogout = () => {
    i18n.changeLanguage('en');
    logout();
    navigate('/login');
  };

  const patientNav = [
    { name: t('nav.dashboard'), href: '/app/dashboard', icon: LayoutDashboard },
    { name: t('nav.speech_test'), href: '/app/speech', icon: Mic },
    { name: t('nav.cognitive_tests'), href: '/app/cognitive', icon: Brain },
    { name: 'Dual Tasks', href: '/app/dualtasks', icon: SplitSquareHorizontal },
    { name: t('nav.facial_analysis'), href: '/app/facial', icon: ScanFace },
    { name: 'Brain Games', href: '/app/braingames', icon: Gamepad2 },
  ];

  const caregiverNav = [
    { name: t('nav.patient_overview'), href: '/app/dashboard', icon: LayoutDashboard },
    { name: t('nav.patient_progress', 'Patient Progress'), href: '/app/progress', icon: TrendingUp },
    { name: t('nav.doctor_reports'), href: '/app/reports', icon: FileText },
  ];

  const navigation = role === 'caregiver' ? caregiverNav : patientNav;

  const sidebarBg = isDark ? '#131b2e' : '#ffffff';
  const borderColor = isDark ? 'rgba(70,69,85,0.25)' : '#e2e8f0';
  const logoBorderColor = isDark ? 'rgba(70,69,85,0.25)' : '#e2e8f0';
  const navItemHoverBg = isDark ? 'rgba(79,70,229,0.12)' : '#eef2ff';
  const navItemText = isDark ? '#94a3b8' : '#475569';
  const navItemActiveText = isDark ? '#c7d2fe' : '#4f46e5';
  const navItemActiveBg = isDark ? 'rgba(99,102,241,0.2)' : '#eef2ff';

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          backgroundColor: sidebarBg,
          borderRightColor: borderColor,
          width: sidebarCollapsed ? '5rem' : '18rem',
          minWidth: sidebarCollapsed ? '5rem' : '18rem',
        }}
        className={clsx(
          "fixed inset-y-0 left-0 z-50 border-r flex flex-col",
          "transform transition-all duration-300 ease-in-out",
          "md:relative md:flex md:translate-x-0",
          isMobileOpen ? "translate-x-0 flex" : "-translate-x-full hidden"
        )}
      >
        {/* Logo Row */}
        <div
          style={{ borderBottomColor: logoBorderColor }}
          className={clsx(
            "flex h-16 border-b shrink-0 bg-indigo-600 justify-between items-center transition-all duration-300",
            sidebarCollapsed ? "px-0 flex-col py-2" : "px-4"
          )}
        >
          <div className={clsx("flex items-center", sidebarCollapsed ? "justify-center w-full" : "")}>
            <Brain className={clsx("text-white shrink-0 transition-all", sidebarCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3")} />
            {!sidebarCollapsed && (
              <span className="text-base font-extrabold text-white tracking-tight truncate antialiased">
                {t('app_name')}
              </span>
            )}
          </div>
          
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={clsx(
              "hidden md:flex items-center justify-center rounded-lg hover:bg-white/20 transition-all text-white/80 hover:text-white",
              sidebarCollapsed ? "p-1 mt-1" : "p-1.5"
            )}
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                onClick={() => setMobileOpen(false)}
                style={{
                  backgroundColor: isActive ? navItemActiveBg : 'transparent',
                  color: isActive ? navItemActiveText : navItemText,
                }}
                className={clsx(
                  "group flex items-center rounded-xl transition-all duration-150 font-medium hover:no-underline",
                  sidebarCollapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3"
                )}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = navItemHoverBg; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <item.icon className={clsx("shrink-0 transition-transform group-hover:scale-105", sidebarCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                {!sidebarCollapsed && (
                  <span className="text-sm truncate">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          style={{ borderTopColor: borderColor }}
          className="border-t px-3 py-3 space-y-1 shrink-0"
        >
          <NavLink
            to="/app/settings"
            title={sidebarCollapsed ? t('nav.settings') : undefined}
            onClick={() => setMobileOpen(false)}
            style={{ color: navItemText }}
            className={clsx(
              "group flex items-center rounded-xl transition-all duration-150 font-medium hover:no-underline",
              sidebarCollapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3"
            )}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = navItemHoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Settings className={clsx("shrink-0", sidebarCollapsed ? "w-6 h-6" : "w-5 h-5")} />
            {!sidebarCollapsed && <span className="text-sm">{t('nav.settings')}</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? t('nav.logout') : undefined}
            className={clsx(
              "group w-full flex items-center rounded-xl transition-all duration-150 font-medium text-rose-500 dark:text-rose-400",
              sidebarCollapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3"
            )}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(239,68,68,0.1)' : '#fff1f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut className={clsx("shrink-0", sidebarCollapsed ? "w-6 h-6" : "w-5 h-5")} />
            {!sidebarCollapsed && <span className="text-sm">{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;