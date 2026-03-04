import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Arch Item 14: State Management (Zustand)
export const useStore = create(
  persist(
    (set) => ({
      // User State
      user: {
        name: 'Turbo',
        isVip: true,
        sessionKey: null,
      },
      setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),

      // App State
      themeMode: 'light', // light, dark, system
      toggleTheme: () => set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),

      // Goals State
      goals: [],
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, { ...goal, id: Date.now(), createdAt: new Date().toISOString() }] })),
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      })),
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      })),

      // Progress (Gamification)
      xp: 1250,
      level: 5,
      addXp: (amount) => set((state) => {
        const newXp = state.xp + amount;
        const newLevel = Math.floor(newXp / 1000) + 1;
        return { xp: newXp, level: newLevel };
      }),

      // Feature Flags (Arch Item 16: Perf budget / code splitting via flags)
      features: {
        enable3D: false,
        lowPowerMode: false,
      },
      setFeature: (key, val) => set((state) => ({ features: { ...state.features, [key]: val } })),
    }),
    {
      name: 'compass-storage', // unique name
      partialize: (state) => ({ themeMode: state.themeMode, xp: state.xp, level: state.level, goals: state.goals }), // persist goals too
    }
  )
);
