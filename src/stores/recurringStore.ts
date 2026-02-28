import { create } from 'zustand';
import type { RecurringTransaction } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { generateId, today } from '@/utils/format';
import { addDays, addWeeks, addMonths, addYears, format, isBefore, isEqual, parseISO } from 'date-fns';

interface RecurringState {
  recurrings: RecurringTransaction[];
  loadRecurrings: () => void;
  addRecurring: (data: Omit<RecurringTransaction, 'id' | 'lastGenerated' | 'isActive'>) => void;
  updateRecurring: (id: string, data: Partial<RecurringTransaction>) => void;
  deleteRecurring: (id: string) => void;
  toggleActive: (id: string) => void;
  getDueRecurrings: () => RecurringTransaction[];
  markGenerated: (id: string, date: string) => void;
}

function getNextDate(lastDate: string, frequency: RecurringTransaction['frequency']): string {
  const d = parseISO(lastDate);
  switch (frequency) {
    case 'daily': return format(addDays(d, 1), 'yyyy-MM-dd');
    case 'weekly': return format(addWeeks(d, 1), 'yyyy-MM-dd');
    case 'monthly': return format(addMonths(d, 1), 'yyyy-MM-dd');
    case 'yearly': return format(addYears(d, 1), 'yyyy-MM-dd');
  }
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
  recurrings: [],

  loadRecurrings: () => {
    const stored = getItem<RecurringTransaction[]>(STORAGE_KEYS.RECURRING, []);
    set({ recurrings: stored });
  },

  addRecurring: (data) => {
    const newItem: RecurringTransaction = {
      ...data,
      id: generateId(),
      lastGenerated: undefined,
      isActive: true,
    };
    const updated = [...get().recurrings, newItem];
    setItem(STORAGE_KEYS.RECURRING, updated);
    set({ recurrings: updated });
  },

  updateRecurring: (id, data) => {
    const updated = get().recurrings.map((r) => (r.id === id ? { ...r, ...data } : r));
    setItem(STORAGE_KEYS.RECURRING, updated);
    set({ recurrings: updated });
  },

  deleteRecurring: (id) => {
    const updated = get().recurrings.filter((r) => r.id !== id);
    setItem(STORAGE_KEYS.RECURRING, updated);
    set({ recurrings: updated });
  },

  toggleActive: (id) => {
    const updated = get().recurrings.map((r) =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    setItem(STORAGE_KEYS.RECURRING, updated);
    set({ recurrings: updated });
  },

  getDueRecurrings: () => {
    const todayStr = today();
    const todayDate = parseISO(todayStr);
    return get().recurrings.filter((r) => {
      if (!r.isActive) return false;
      if (r.endDate && isBefore(parseISO(r.endDate), todayDate)) return false;
      const lastDate = r.lastGenerated || format(addDays(parseISO(r.startDate), -1), 'yyyy-MM-dd');
      const nextDate = getNextDate(lastDate, r.frequency);
      const nextParsed = parseISO(nextDate);
      return isBefore(nextParsed, todayDate) || isEqual(nextParsed, todayDate);
    });
  },

  markGenerated: (id, date) => {
    const updated = get().recurrings.map((r) =>
      r.id === id ? { ...r, lastGenerated: date } : r
    );
    setItem(STORAGE_KEYS.RECURRING, updated);
    set({ recurrings: updated });
  },
}));
