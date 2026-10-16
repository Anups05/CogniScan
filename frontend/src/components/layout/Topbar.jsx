import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Bell, User, Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/useStore';

const Topbar = ({ setMobileSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, role } = useStore();
  const isDark = theme === 'dark';

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <header
      style={{
        backgroundColor: isDark ? 'rgba(6,14,32,0.85)' : 'rgba(255,255,255,0.85)',
        borderColor: isDark ? 'rgba(70,69,85,0.3)' : '#e2e8f0',
        color: isDark ? '#dae2fd' : '#1e293b',
      }}
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 backdrop-blur-md border-b transition-colors"
    >
      <div className="flex items-center space-x-2">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 focus:outline-none md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Role Badge */}
        <div className="hidden sm:flex items-center ml-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-100 dark:border-indigo-500/20">
          {role === 'patient' ? t('nav.dashboard') : t('nav.caregiver')} {t('topbar.view')}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <select 
          onChange={handleLanguageChange}
          value={i18n.language}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none cursor-pointer transition-colors"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="mr">मराठी</option>
        </select>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-indigo-600 relative transition-colors focus:outline-none rounded-full hover:bg-slate-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </button>

        {/* Profile Dropdown Trigger */}
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
