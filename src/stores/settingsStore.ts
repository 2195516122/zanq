import { create } from 'zustand';
import type { UserSettings } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/utils/constants';

interface SettingsState {
  settings: UserSettings;
  loadSettings: () => void;
  updateSettings: (data: Partial<UserSettings>) => void;
  setMonthlyBudget: (amount: number) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  loadSettings: () => {
    const stored = getItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    set({ settings: stored });
    // 应用主题
    if (stored.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  updateSettings: (data) => {
    const updated = { ...get().settings, ...data };
    setItem(STORAGE_KEYS.SETTINGS, updated);
    set({ settings: updated });
  },

  setMonthlyBudget: (amount) => {
    const updated = {
      ...get().settings,
      budget: { ...get().settings.budget, monthlyLimit: amount },
    };
    setItem(STORAGE_KEYS.SETTINGS, updated);
    set({ settings: updated });
  },

  toggleTheme: () => {
    const newTheme = get().settings.theme === 'light' ? 'dark' : 'light';
    get().updateSettings({ theme: newTheme });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
}));
