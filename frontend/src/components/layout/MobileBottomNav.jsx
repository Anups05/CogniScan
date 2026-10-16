import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Mic, Brain, Gamepad2 } from 'lucide-react';
import clsx from 'clsx';

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.speech_test'), href: '/speech', icon: Mic },
    { name: t('nav.cognitive_tests'), href: '/cognitive', icon: Brain },
    { name: t('nav.training'), href: '/training', icon: Gamepad2 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <nav className="flex items-center justify-around w-full max-w-md mx-auto h-16 bg-slate-900 shadow-xl rounded-2xl pointer-events-auto border border-slate-800">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
             <NavLink
                key={item.href}
                to={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center w-full h-full relative group transition-all duration-300 transform",
                  isActive ? "-translate-y-2 text-white" : "text-slate-400 hover:text-slate-300"
                )}
             >
                {/* Active Indicator Glow */}
                {isActive && (
                   <span className="absolute -top-3 w-10 h-10 bg-indigo-500/20 rounded-full blur-md"></span>
                )}
                
                {/* Icon Circle for active state */}
                <div className={clsx(
                   "flex items-center justify-center rounded-full transition-all duration-300",
                   isActive ? "w-12 h-12 bg-indigo-600 shadow-lg shadow-indigo-500/30" : "w-10 h-10 bg-transparent"
                )}>
                   <item.icon className={clsx("transition-all duration-300", isActive ? "w-6 h-6" : "w-5 h-5")} />
                </div>
                
                {/* Label text */}
                <span className={clsx(
                   "absolute bottom-0 text-[10px] font-medium transition-all duration-300 opacity-0 transform translate-y-4",
                   isActive && "opacity-100 translate-y-6"
                )}>
                   {item.name}
                </span>
             </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
