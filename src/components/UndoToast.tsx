import { X, Undo2 } from 'lucide-react';
import { useUndoStore } from '@/stores/undoStore';

export default function UndoToast() {
  const { actions, executeUndo, dismissUndo } = useUndoStore();

  if (actions.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2 md:bottom-8">
      {actions.map((action) => (
        <div
          key={action.id}
          className="flex items-center gap-3 rounded-2xl bg-slate-900/95 px-5 py-3.5 text-sm text-white shadow-2xl backdrop-blur-sm animate-[pageIn_0.3s_ease-out]"
        >
          <span className="font-medium">{action.message}</span>
          <button
            onClick={() => executeUndo(action.id)}
            className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-3 py-1.5 text-xs font-semibold transition-all hover:bg-primary-400 active:scale-95"
          >
            <Undo2 className="h-3 w-3" /> 撤销
          </button>
          <button onClick={() => dismissUndo(action.id)} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
