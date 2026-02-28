import { useState } from 'react';
import { Plus, Heart, ShoppingCart, X, Star, ExternalLink, Trash2 } from 'lucide-react';
import { useWishStore } from '@/stores/wishStore';
import { useGoalStore } from '@/stores/goalStore';
import { formatAmount, yuanToCents } from '@/utils/format';

export default function WishlistPage() {
  const { wishes, addWish, deleteWish, markPurchased, markAbandoned } = useWishStore();
  const { goals } = useGoalStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [link, setLink] = useState('');
  const [priority, setPriority] = useState<'medium' | 'high' | 'low'>('medium');

  const pending = wishes.filter((w) => w.status === 'pending');
  const purchased = wishes.filter((w) => w.status === 'purchased');

  const handleAdd = () => {
    if (!name.trim() || !price) return;
    addWish({
      name: name.trim(),
      price: yuanToCents(parseFloat(price)),
      link: link || undefined,
      priority,
      linkedGoalId: undefined,
    });
    setName(''); setPrice(''); setLink(''); setPriority('medium'); setShowForm(false);
  };

  const priorityLabel = { high: '很想要', medium: '想要', low: '还行' };
  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">心愿单</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> 添加心愿
        </button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="心愿名称" className="input" autoFocus />
          <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="预估价格（元）" className="input" />
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="商品链接（可选）" className="input" />
          <div className="flex gap-2">
            {(['high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${priority === p ? 'text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}
                style={priority === p ? { backgroundColor: priorityColor[p] } : undefined}
              >
                {priorityLabel[p]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary flex-1">添加</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">取消</button>
          </div>
        </div>
      )}

      {pending.length === 0 && !showForm ? (
        <div className="card py-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 text-slate-400">心愿单空空如也</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pending.map((wish) => {
            const linkedGoal = wish.linkedGoalId ? goals.find((g) => g.id === wish.linkedGoalId) : null;
            return (
              <div key={wish.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{wish.name}</h3>
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: priorityColor[wish.priority] }}>
                        {priorityLabel[wish.priority]}
                      </span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-primary-500">¥{formatAmount(wish.price)}</p>
                  </div>
                  {wish.link && (
                    <a href={wish.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary-500">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {linkedGoal && (
                  <div className="mt-2 text-xs text-slate-500">
                    关联目标：{linkedGoal.name}（{((linkedGoal.currentAmount / linkedGoal.targetAmount) * 100).toFixed(0)}%）
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => markPurchased(wish.id)} className="btn-primary flex-1 gap-1 py-1.5 text-xs">
                    <ShoppingCart className="h-3.5 w-3.5" /> 已买到
                  </button>
                  <button onClick={() => markAbandoned(wish.id)} className="btn-secondary flex-1 gap-1 py-1.5 text-xs">
                    <X className="h-3.5 w-3.5" /> 不想要了
                  </button>
                  <button onClick={() => deleteWish(wish.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {purchased.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">已实现 ({purchased.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {purchased.map((w) => (
              <div key={w.id} className="card flex items-center justify-between opacity-60">
                <div>
                  <p className="font-medium text-slate-600 line-through">{w.name}</p>
                  <p className="text-sm text-slate-400">¥{formatAmount(w.price)}</p>
                </div>
                <Star className="h-5 w-5 text-amber-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
