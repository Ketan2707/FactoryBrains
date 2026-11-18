'use client';

import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  commandPaletteOpen: boolean;
  copilotOpen: boolean;
  alertCenterOpen: boolean;
  activeModule: string;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setCopilotOpen: (open: boolean) => void;
  setAlertCenterOpen: (open: boolean) => void;
  setActiveModule: (module: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  commandPaletteOpen: false,
  copilotOpen: false,
  alertCenterOpen: false,
  activeModule: 'dashboard',

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
  
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  
  setCopilotOpen: (open) => set({ copilotOpen: open }),
  
  setAlertCenterOpen: (open) => set({ alertCenterOpen: open }),
  
  setActiveModule: (module) => set({ activeModule: module }),
}));
