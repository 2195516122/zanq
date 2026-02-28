import { create } from 'zustand';
import type { Tag } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS, DEFAULT_TAGS } from '@/utils/constants';
import { generateId } from '@/utils/format';

interface TagState {
  tags: Tag[];
  loadTags: () => void;
  addTag: (name: string, color: string) => void;
  updateTag: (id: string, data: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
  getTagsByIds: (ids: string[]) => Tag[];
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],

  loadTags: () => {
    const stored = getItem<Tag[]>(STORAGE_KEYS.TAGS, []);
    if (stored.length === 0) {
      setItem(STORAGE_KEYS.TAGS, DEFAULT_TAGS);
      set({ tags: DEFAULT_TAGS });
    } else {
      set({ tags: stored });
    }
  },

  addTag: (name, color) => {
    const newTag: Tag = { id: generateId(), name, color };
    const updated = [...get().tags, newTag];
    setItem(STORAGE_KEYS.TAGS, updated);
    set({ tags: updated });
  },

  updateTag: (id, data) => {
    const updated = get().tags.map((t) => (t.id === id ? { ...t, ...data } : t));
    setItem(STORAGE_KEYS.TAGS, updated);
    set({ tags: updated });
  },

  deleteTag: (id) => {
    const updated = get().tags.filter((t) => t.id !== id);
    setItem(STORAGE_KEYS.TAGS, updated);
    set({ tags: updated });
  },

  getTagById: (id) => get().tags.find((t) => t.id === id),

  getTagsByIds: (ids) => get().tags.filter((t) => ids.includes(t.id)),
}));
