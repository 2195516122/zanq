import { create } from 'zustand';
import type { SavingsGoal, SavingsRecord } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { generateId } from '@/utils/format';

interface GoalState {
  goals: SavingsGoal[];
  records: SavingsRecord[];
  loadGoals: () => void;
  addGoal: (data: Omit<SavingsGoal, 'id' | 'currentAmount' | 'status' | 'createdAt'>) => void;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  deposit: (goalId: string, amount: number, note: string) => void;
  withdraw: (goalId: string, amount: number, note: string) => void;
  completeGoal: (id: string) => void;
  abandonGoal: (id: string) => void;
  getRecordsByGoal: (goalId: string) => SavingsRecord[];
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  records: [],

  loadGoals: () => {
    const goals = getItem<SavingsGoal[]>(STORAGE_KEYS.GOALS, []);
    const records = getItem<SavingsRecord[]>(STORAGE_KEYS.SAVINGS_RECORDS, []);
    set({ goals, records });
  },

  addGoal: (data) => {
    const newGoal: SavingsGoal = {
      ...data,
      id: generateId(),
      currentAmount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().goals, newGoal];
    setItem(STORAGE_KEYS.GOALS, updated);
    set({ goals: updated });
  },

  updateGoal: (id, data) => {
    const updated = get().goals.map((g) =>
      g.id === id ? { ...g, ...data } : g
    );
    setItem(STORAGE_KEYS.GOALS, updated);
    set({ goals: updated });
  },

  deleteGoal: (id) => {
    const updatedGoals = get().goals.filter((g) => g.id !== id);
    const updatedRecords = get().records.filter((r) => r.goalId !== id);
    setItem(STORAGE_KEYS.GOALS, updatedGoals);
    setItem(STORAGE_KEYS.SAVINGS_RECORDS, updatedRecords);
    set({ goals: updatedGoals, records: updatedRecords });
  },

  deposit: (goalId, amount, note) => {
    const record: SavingsRecord = {
      id: generateId(),
      goalId,
      type: 'deposit',
      amount,
      note,
      date: new Date().toISOString().split('T')[0],
    };
    const updatedRecords = [record, ...get().records];
    const updatedGoals = get().goals.map((g) =>
      g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
    );
    setItem(STORAGE_KEYS.SAVINGS_RECORDS, updatedRecords);
    setItem(STORAGE_KEYS.GOALS, updatedGoals);
    set({ records: updatedRecords, goals: updatedGoals });
  },

  withdraw: (goalId, amount, note) => {
    const record: SavingsRecord = {
      id: generateId(),
      goalId,
      type: 'withdraw',
      amount,
      note,
      date: new Date().toISOString().split('T')[0],
    };
    const updatedRecords = [record, ...get().records];
    const updatedGoals = get().goals.map((g) =>
      g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g
    );
    setItem(STORAGE_KEYS.SAVINGS_RECORDS, updatedRecords);
    setItem(STORAGE_KEYS.GOALS, updatedGoals);
    set({ records: updatedRecords, goals: updatedGoals });
  },

  completeGoal: (id) => {
    get().updateGoal(id, { status: 'completed' });
  },

  abandonGoal: (id) => {
    get().updateGoal(id, { status: 'abandoned' });
  },

  getRecordsByGoal: (goalId) => {
    return get().records
      .filter((r) => r.goalId === goalId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },
}));
