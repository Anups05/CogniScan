// store/useStore.js
// IMPORTANT: This store manages theme by toggling the 'dark' class on <html>
// Make sure your tailwind.config.js has: darkMode: 'class'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──
      user: null,
      role: null, // 'patient' | 'caregiver'
      isAuthenticated: false,

      login: (userData, role) => set({ user: userData, role, isAuthenticated: true }),
      logout: () => set({ user: null, role: null, isAuthenticated: false }),

      // ── Theme ──
      // Initialise by reading persisted value; DOM sync happens in App.jsx on mount
      theme: 'light',

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      // ── Sidebar ──
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'cogniscan-store',
      // Rehydrate theme on page load
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
      },
    }
  )
);