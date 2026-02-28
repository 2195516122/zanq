import { create } from 'zustand';
import type { Wallet } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS, DEFAULT_WALLETS } from '@/utils/constants';
import { generateId } from '@/utils/format';

interface WalletState {
  wallets: Wallet[];
  loadWallets: () => void;
  addWallet: (data: Omit<Wallet, 'id' | 'balance' | 'isDefault' | 'sortOrder'>) => void;
  updateWallet: (id: string, data: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  adjustBalance: (id: string, amount: number) => void;
  transfer: (fromId: string, toId: string, amount: number) => void;
  getWalletById: (id: string) => Wallet | undefined;
  getTotalBalance: () => number;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],

  loadWallets: () => {
    const stored = getItem<Wallet[]>(STORAGE_KEYS.WALLETS, []);
    if (stored.length === 0) {
      setItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
      set({ wallets: DEFAULT_WALLETS });
    } else {
      set({ wallets: stored });
    }
  },

  addWallet: (data) => {
    const newWallet: Wallet = {
      ...data,
      id: generateId(),
      balance: 0,
      isDefault: false,
      sortOrder: get().wallets.length,
    };
    const updated = [...get().wallets, newWallet];
    setItem(STORAGE_KEYS.WALLETS, updated);
    set({ wallets: updated });
  },

  updateWallet: (id, data) => {
    const updated = get().wallets.map((w) => (w.id === id ? { ...w, ...data } : w));
    setItem(STORAGE_KEYS.WALLETS, updated);
    set({ wallets: updated });
  },

  deleteWallet: (id) => {
    const updated = get().wallets.filter((w) => w.id !== id);
    setItem(STORAGE_KEYS.WALLETS, updated);
    set({ wallets: updated });
  },

  adjustBalance: (id, amount) => {
    const updated = get().wallets.map((w) =>
      w.id === id ? { ...w, balance: w.balance + amount } : w
    );
    setItem(STORAGE_KEYS.WALLETS, updated);
    set({ wallets: updated });
  },

  transfer: (fromId, toId, amount) => {
    const updated = get().wallets.map((w) => {
      if (w.id === fromId) return { ...w, balance: w.balance - amount };
      if (w.id === toId) return { ...w, balance: w.balance + amount };
      return w;
    });
    setItem(STORAGE_KEYS.WALLETS, updated);
    set({ wallets: updated });
  },

  getWalletById: (id) => get().wallets.find((w) => w.id === id),

  getTotalBalance: () => get().wallets.reduce((sum, w) => sum + w.balance, 0),
}));
