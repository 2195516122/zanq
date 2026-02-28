import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit2 } from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useWalletStore } from '@/stores/walletStore';
import { useUndoStore } from '@/stores/undoStore';
import { formatAmount, formatDateShort, yuanToCents } from '@/utils/format';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import type { TransactionFilter } from '@/types';

const quickDateRanges = [
  { label: '今天', getRange: () => { const d = format(new Date(), 'yyyy-MM-dd'); return { startDate: d, endDate: d }; } },
  { label: '本周', getRange: () => ({ startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
  { label: '本月', getRange: () => ({ startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
  { label: '近7天', getRange: () => ({ startDate: format(subDays(new Date(), 6), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
  { label: '近30天', getRange: () => ({ startDate: format(subDays(new Date(), 29), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
];

export default function TransactionList() {
  const navigate = useNavigate();
  const { transactions, addTransaction, deleteTransaction, deleteMultiple, getFiltered } = useTransactionStore();
  const { getCategoryById, getCategoriesByType } = useCategoryStore();
  const { wallets } = useWalletStore();
  const { pushUndo } = useUndoStore();

  const [filter, setFilter] = useState<TransactionFilter>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [activeDateRange, setActiveDateRange] = useState('');

  const effectiveFilter = useMemo(() => ({
    ...filter,
    keyword: searchKeyword,
    minAmount: minAmount ? yuanToCents(parseFloat(minAmount)) : undefined,
    maxAmount: maxAmount ? yuanToCents(parseFloat(maxAmount)) : undefined,
  }), [filter, searchKeyword, minAmount, maxAmount]);

  const filtered = useMemo(() => {
    return getFiltered(effectiveFilter);
  }, [transactions, effectiveFilter, getFiltered]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    const idsToDelete = Array.from(selectedIds);
    const deletedTxs = transactions.filter((t) => idsToDelete.includes(t.id));
    deleteMultiple(idsToDelete);
    setSelectedIds(new Set());
    pushUndo(`已删除 ${deletedTxs.length} 条记录`, () => {
      deletedTxs.forEach((tx) => addTransaction(tx));
    });
  };

  const handleDelete = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    deleteTransaction(id);
    pushUndo('已删除 1 条记录', () => {
      addTransaction(tx);
    });
  };

  const applyQuickDate = (label: string, range: { startDate: string; endDate: string }) => {
    if (activeDateRange === label) {
      setFilter({ ...filter, startDate: undefined, endDate: undefined });
      setActiveDateRange('');
    } else {
      setFilter({ ...filter, ...range });
      setActiveDateRange(label);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">收支记录</h1>
        <Link to="/transactions/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          记一笔
        </Link>
      </div>

      {/* 搜索与筛选 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索备注..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button onClick={() => setShowFilter(!showFilter)} className="btn-secondary gap-2">
          <Filter className="h-4 w-4" />
          筛选
        </button>
      </div>

      {/* 筛选面板 */}
      {showFilter && (
        <div className="card space-y-3">
          {/* 快捷日期 */}
          <div className="flex flex-wrap gap-2">
            {quickDateRanges.map((qd) => (
              <button
                key={qd.label}
                onClick={() => applyQuickDate(qd.label, qd.getRange())}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeDateRange === qd.label
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {qd.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter({ ...filter, type: (e.target.value || undefined) as TransactionFilter['type'] })}
              className="input w-auto"
            >
              <option value="">全部类型</option>
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
            <select
              value={filter.categoryId || ''}
              onChange={(e) => setFilter({ ...filter, categoryId: e.target.value || undefined })}
              className="input w-auto"
            >
              <option value="">全部分类</option>
              {(filter.type ? getCategoriesByType(filter.type) : [...getCategoriesByType('expense'), ...getCategoriesByType('income')]).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {wallets.length > 0 && (
              <select
                value={filter.walletId || ''}
                onChange={(e) => setFilter({ ...filter, walletId: e.target.value || undefined })}
                className="input w-auto"
              >
                <option value="">全部账户</option>
                {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            )}
          </div>

          {/* 金额范围 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">金额</span>
            <input type="number" min="0" step="0.01" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="最小" className="input w-24 text-sm" />
            <span className="text-slate-400">—</span>
            <input type="number" min="0" step="0.01" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="最大" className="input w-24 text-sm" />
            <span className="text-xs text-slate-400">元</span>
          </div>

          {/* 自定义日期 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">日期</span>
            <input type="date" value={filter.startDate || ''} onChange={(e) => { setFilter({ ...filter, startDate: e.target.value || undefined }); setActiveDateRange(''); }} className="input w-auto text-sm" />
            <span className="text-slate-400">至</span>
            <input type="date" value={filter.endDate || ''} onChange={(e) => { setFilter({ ...filter, endDate: e.target.value || undefined }); setActiveDateRange(''); }} className="input w-auto text-sm" />
          </div>

          <button onClick={() => { setFilter({}); setSearchKeyword(''); setMinAmount(''); setMaxAmount(''); setActiveDateRange(''); }} className="btn-secondary text-sm">
            重置全部
          </button>
        </div>
      )}

      {/* 批量操作 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-2 dark:bg-primary-500/10">
          <span className="text-sm text-primary-600 dark:text-primary-400">已选择 {selectedIds.size} 条</span>
          <button onClick={handleBatchDelete} className="btn-danger gap-1 py-1 text-xs">
            <Trash2 className="h-3.5 w-3.5" />
            批量删除
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="btn-secondary py-1 text-xs">
            取消选择
          </button>
        </div>
      )}

      {/* 结果统计 */}
      {filtered.length > 0 && (
        <p className="text-xs text-slate-400">共 {filtered.length} 条记录</p>
      )}

      {/* 记录列表 */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
            <Search className="h-7 w-7 text-slate-300" />
          </div>
          <p className="mt-4 font-medium text-slate-400">暂无记录</p>
          <Link to="/transactions/new" className="mt-2 text-sm text-primary-500 hover:text-primary-600 transition-colors">
            去记一笔 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((tx) => {
            const category = getCategoryById(tx.categoryId);
            const isSelected = selectedIds.has(tx.id);
            return (
              <li
                key={tx.id}
                className={`card flex items-center gap-3 transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary-500/40 bg-primary-50/30 dark:bg-primary-500/5' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(tx.id)}
                  className="h-4 w-4 rounded-md border-slate-300 text-primary-500 focus:ring-primary-500 transition-all"
                />
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: category?.color || '#6b7280' }}
                >
                  {category?.name.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{category?.name || '未知'}</p>
                    <span className={`font-tabular text-sm font-bold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}¥{formatAmount(tx.amount)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <p className="truncate text-[11px] text-slate-400">
                      {formatDateShort(tx.date)}{tx.note ? ` · ${tx.note}` : ''}
                    </p>
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => navigate(`/transactions/${tx.id}/edit`)}
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
