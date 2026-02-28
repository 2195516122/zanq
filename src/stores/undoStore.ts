import { create } from 'zustand';
import type { UndoAction } from '@/types';
import { generateId } from '@/utils/format';

interface UndoState {
  actions: UndoAction[];
  pushUndo: (message: string, undoFn: () => void) => void;
  executeUndo: (id: string) => void;
  dismissUndo: (id: string) => void;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  actions: [],

  pushUndo: (message, undoFn) => {
    const id = generateId();
    const action: UndoAction = { id, message, undo: undoFn, timeout: 5000 };
    set({ actions: [...get().actions, action] });
    setTimeout(() => {
      set({ actions: get().actions.filter((a) => a.id !== id) });
    }, 5000);
  },

  executeUndo: (id) => {
    const action = get().actions.find((a) => a.id === id);
    if (action) {
      action.undo();
      set({ actions: get().actions.filter((a) => a.id !== id) });
    }
  },

  dismissUndo: (id) => {
    set({ actions: get().actions.filter((a) => a.id !== id) });
  },
}));
