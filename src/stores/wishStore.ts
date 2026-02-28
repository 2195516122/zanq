import { create } from 'zustand';
import type { WishItem } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { generateId } from '@/utils/format';

interface WishState {
  wishes: WishItem[];
  loadWishes: () => void;
  addWish: (data: Omit<WishItem, 'id' | 'status' | 'createdAt'>) => void;
  updateWish: (id: string, data: Partial<WishItem>) => void;
  deleteWish: (id: string) => void;
  markPurchased: (id: string) => void;
  markAbandoned: (id: string) => void;
}

export const useWishStore = create<WishState>((set, get) => ({
  wishes: [],

  loadWishes: () => {
    const stored = getItem<WishItem[]>(STORAGE_KEYS.WISHES, []);
    set({ wishes: stored });
  },

  addWish: (data) => {
    const newItem: WishItem = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().wishes, newItem];
    setItem(STORAGE_KEYS.WISHES, updated);
    set({ wishes: updated });
  },

  updateWish: (id, data) => {
    const updated = get().wishes.map((w) => (w.id === id ? { ...w, ...data } : w));
    setItem(STORAGE_KEYS.WISHES, updated);
    set({ wishes: updated });
  },

  deleteWish: (id) => {
    const updated = get().wishes.filter((w) => w.id !== id);
    setItem(STORAGE_KEYS.WISHES, updated);
    set({ wishes: updated });
  },

  markPurchased: (id) => {
    get().updateWish(id, { status: 'purchased' });
  },

  markAbandoned: (id) => {
    get().updateWish(id, { status: 'abandoned' });
  },
}));
