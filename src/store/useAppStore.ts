import { create } from 'zustand';
import type { User, ThanksType } from '@shared/types';

interface AppState {
  currentUser: User | null;
  unreadCount: number;
  filterType: ThanksType | '全部';
  showNotificationDrawer: boolean;
  actions: {
    setCurrentUser: (user: User | null) => void;
    setUnreadCount: (n: number) => void;
    setFilterType: (t: ThanksType | '全部') => void;
    toggleNotificationDrawer: (v?: boolean) => void;
  };
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  unreadCount: 0,
  filterType: '全部',
  showNotificationDrawer: false,
  actions: {
    setCurrentUser: (user) => set({ currentUser: user }),
    setUnreadCount: (n) => set({ unreadCount: n }),
    setFilterType: (t) => set({ filterType: t }),
    toggleNotificationDrawer: (v) => set(s => ({
      showNotificationDrawer: typeof v === 'boolean' ? v : !s.showNotificationDrawer,
    })),
  },
}));
