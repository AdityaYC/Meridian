import { create } from 'zustand';

interface AppState {
    showAvatar: boolean;
    isSidebarOpen: boolean;
    currentView: 'dashboard' | 'transactions' | 'budgets' | 'investments' | 'chat';
    toggleAvatar: () => void;
    toggleSidebar: () => void;
    setCurrentView: (view: AppState['currentView']) => void;
}

export const useAppStore = create<AppState>((set) => ({
    showAvatar: false,
    isSidebarOpen: true,
    currentView: 'dashboard',
    toggleAvatar: () => set((state) => ({ showAvatar: !state.showAvatar })),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setCurrentView: (view) => set({ currentView: view }),
}));
