import { create } from 'zustand';
import type { Transaction, TransactionFilter } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { generateId } from '@/utils/format';

interface TransactionState {
  transactions: Transaction[];
  loadTransactions: () => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteMultiple: (ids: string[]) => void;
  getFiltered: (filter: TransactionFilter) => Transaction[];
  getByMonth: (yearMonth: string) => Transaction[];
  getMonthlyTotal: (yearMonth: string, type: 'income' | 'expense') => number;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],

  loadTransactions: () => {
    const stored = getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    set({ transactions: stored });
  },

  addTransaction: (data) => {
    const newTx: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...get().transactions];
    setItem(STORAGE_KEYS.TRANSACTIONS, updated);
    set({ transactions: updated });
  },

  updateTransaction: (id, data) => {
    const updated = get().transactions.map((t) =>
      t.id === id ? { ...t, ...data } : t
    );
    setItem(STORAGE_KEYS.TRANSACTIONS, updated);
    set({ transactions: updated });
  },

  deleteTransaction: (id) => {
    const updated = get().transactions.filter((t) => t.id !== id);
    setItem(STORAGE_KEYS.TRANSACTIONS, updated);
    set({ transactions: updated });
  },

  deleteMultiple: (ids) => {
    const idSet = new Set(ids);
    const updated = get().transactions.filter((t) => !idSet.has(t.id));
    setItem(STORAGE_KEYS.TRANSACTIONS, updated);
    set({ transactions: updated });
  },

  getFiltered: (filter) => {
    let list = get().transactions;
    if (filter.type) list = list.filter((t) => t.type === filter.type);
    if (filter.categoryId) list = list.filter((t) => t.categoryId === filter.categoryId);
    if (filter.walletId) list = list.filter((t) => t.walletId === filter.walletId);
    if (filter.tags && filter.tags.length > 0) {
      list = list.filter((t) => t.tags && filter.tags!.some((tag) => t.tags!.includes(tag)));
    }
    if (filter.startDate) list = list.filter((t) => t.date >= filter.startDate!);
    if (filter.endDate) list = list.filter((t) => t.date <= filter.endDate!);
    if (filter.minAmount != null) list = list.filter((t) => t.amount >= filter.minAmount!);
    if (filter.maxAmount != null) list = list.filter((t) => t.amount <= filter.maxAmount!);
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      list = list.filter((t) => t.note.toLowerCase().includes(kw));
    }
    return list.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  },

  getByMonth: (yearMonth) => {
    return get().transactions
      .filter((t) => t.date.startsWith(yearMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getMonthlyTotal: (yearMonth, type) => {
    return get().transactions
      .filter((t) => t.date.startsWith(yearMonth) && t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  },
}));
