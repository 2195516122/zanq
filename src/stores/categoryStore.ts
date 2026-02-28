import { create } from 'zustand';
import type { Category } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS, ALL_DEFAULT_CATEGORIES } from '@/utils/constants';
import { generateId } from '@/utils/format';

interface CategoryState {
  categories: Category[];
  loadCategories: () => void;
  addCategory: (category: Omit<Category, 'id' | 'isDefault'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoriesByType: (type: 'income' | 'expense') => Category[];
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],

  loadCategories: () => {
    const stored = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    if (stored.length === 0) {
      setItem(STORAGE_KEYS.CATEGORIES, ALL_DEFAULT_CATEGORIES);
      set({ categories: ALL_DEFAULT_CATEGORIES });
    } else {
      set({ categories: stored });
    }
  },

  addCategory: (data) => {
    const newCategory: Category = {
      ...data,
      id: generateId(),
      isDefault: false,
    };
    const updated = [...get().categories, newCategory];
    setItem(STORAGE_KEYS.CATEGORIES, updated);
    set({ categories: updated });
  },

  updateCategory: (id, data) => {
    const updated = get().categories.map((c) =>
      c.id === id ? { ...c, ...data } : c
    );
    setItem(STORAGE_KEYS.CATEGORIES, updated);
    set({ categories: updated });
  },

  deleteCategory: (id) => {
    const updated = get().categories.filter((c) => c.id !== id);
    setItem(STORAGE_KEYS.CATEGORIES, updated);
    set({ categories: updated });
  },

  getCategoriesByType: (type) => {
    return get().categories.filter((c) => c.type === type);
  },

  getCategoryById: (id) => {
    return get().categories.find((c) => c.id === id);
  },
}));
