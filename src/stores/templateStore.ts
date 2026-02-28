import { create } from 'zustand';
import type { TransactionTemplate } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { generateId } from '@/utils/format';

interface TemplateState {
  templates: TransactionTemplate[];
  loadTemplates: () => void;
  addTemplate: (data: Omit<TransactionTemplate, 'id' | 'sortOrder'>) => void;
  updateTemplate: (id: string, data: Partial<TransactionTemplate>) => void;
  deleteTemplate: (id: string) => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],

  loadTemplates: () => {
    const stored = getItem<TransactionTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
    set({ templates: stored });
  },

  addTemplate: (data) => {
    const newItem: TransactionTemplate = {
      ...data,
      id: generateId(),
      sortOrder: get().templates.length,
    };
    const updated = [...get().templates, newItem];
    setItem(STORAGE_KEYS.TEMPLATES, updated);
    set({ templates: updated });
  },

  updateTemplate: (id, data) => {
    const updated = get().templates.map((t) => (t.id === id ? { ...t, ...data } : t));
    setItem(STORAGE_KEYS.TEMPLATES, updated);
    set({ templates: updated });
  },

  deleteTemplate: (id) => {
    const updated = get().templates.filter((t) => t.id !== id);
    setItem(STORAGE_KEYS.TEMPLATES, updated);
    set({ templates: updated });
  },
}));
