import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      userRole: null,
      isAuthenticated: false,
      loading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),
      setUserRole: (role) => set({ userRole: role }),
      logout: () => set({ user: null, userRole: null, isAuthenticated: false }),
      setLoading: (loading) => set({ loading })
    }),
    {
      name: 'auth-storage'
    }
  )
);

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 'normal',
      language: 'en',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLanguage: (language) => set({ language })
    }),
    {
      name: 'theme-storage'
    }
  )
);

export const useElectionStore = create((set) => ({
  currentElection: null,
  elections: [],
  setCurrentElection: (election) => set({ currentElection: election }),
  setElections: (elections) => set({ elections }),
  updateElection: (id, updates) => set((state) => ({
    elections: state.elections.map(e => e.id === id ? { ...e, ...updates } : e),
    currentElection: state.currentElection?.id === id 
      ? { ...state.currentElection, ...updates } 
      : state.currentElection
  }))
}));

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 })
}));
