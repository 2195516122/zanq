import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Save, PlusCircle, Check, X } from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useWalletStore } from '@/stores/walletStore';
import { useTagStore } from '@/stores/tagStore';
import { useTemplateStore } from '@/stores/templateStore';
import { yuanToCents, centsToYuan, today } from '@/utils/format';

export default function TransactionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { transactions, addTransaction, updateTransaction } = useTransactionStore();
  const { getCategoriesByType, addCategory } = useCategoryStore();
  const { wallets } = useWalletStore();
  const { tags } = useTagStore();
  const { templates, addTemplate } = useTemplateStore();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState(wallets.find((w) => w.isDefault)?.id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const categories = getCategoriesByType(type);

  useEffect(() => {
    if (isEdit && id) {
      const tx = transactions.find((t) => t.id === id);
      if (tx) {
        setType(tx.type);
        setAmount(centsToYuan(tx.amount).toString());
        setCategoryId(tx.categoryId);
        setWalletId(tx.walletId || '');
        setSelectedTags(tx.tags || []);
        setDate(tx.date);
        setNote(tx.note);
      }
    }
  }, [id, isEdit, transactions]);

  useEffect(() => {
    if (!isEdit && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [type, categories, isEdit, categoryId]);

  useEffect(() => {
    if (!walletId && wallets.length > 0) {
      setWalletId(wallets.find((w) => w.isDefault)?.id || wallets[0].id);
    }
  }, [wallets, walletId]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const applyTemplate = (tpl: typeof templates[0]) => {
    setType(tpl.type);
    setAmount(centsToYuan(tpl.amount).toString());
    setCategoryId(tpl.categoryId);
    if (tpl.walletId) setWalletId(tpl.walletId);
    if (tpl.tags) setSelectedTags(tpl.tags);
    setNote(tpl.note);
    setShowTemplates(false);
  };

  const saveAsTemplate = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || !categoryId) return;
    const name = prompt('模板名称：');
    if (!name) return;
    addTemplate({ name, type, amount: yuanToCents(amountNum), categoryId, walletId, tags: selectedTags, note });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return;
    if (!categoryId) return;

    const data = {
      type,
      amount: yuanToCents(amountNum),
      categoryId,
      walletId: walletId || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      date,
      note,
    };

    if (isEdit && id) {
      updateTransaction(id, data);
    } else {
      addTransaction(data);
    }
    navigate('/transactions');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEdit ? '编辑记录' : '记一笔'}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isEdit && templates.length > 0 && (
            <button onClick={() => setShowTemplates(!showTemplates)} className="btn-secondary gap-1 text-xs">
              <Bookmark className="h-3.5 w-3.5" /> 模板
            </button>
          )}
          {!isEdit && amount && categoryId && (
            <button onClick={saveAsTemplate} className="btn-secondary gap-1 text-xs">
              <Save className="h-3.5 w-3.5" /> 存模板
            </button>
          )}
        </div>
      </div>

      {/* 模板列表 */}
      {showTemplates && (
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">快捷模板</h3>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl)}
                className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400"
              >
                {tpl.name} ¥{centsToYuan(tpl.amount)}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* 类型切换 */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-700/60">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategoryId(''); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
              type === 'expense' ? 'bg-white text-red-500 shadow-sm dark:bg-slate-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategoryId(''); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
              type === 'income' ? 'bg-white text-green-500 shadow-sm dark:bg-slate-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            收入
          </button>
        </div>

        {/* 金额 - 大号居中显示 */}
        <div className="text-center">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">金额（元）</label>
          <div className="relative inline-flex items-baseline">
            <span className="absolute -left-5 top-2 text-lg text-slate-300">¥</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-48 border-0 bg-transparent text-center font-tabular text-4xl font-bold text-slate-900 placeholder-slate-200 focus:outline-none focus:ring-0 dark:text-white dark:placeholder-slate-700"
              required
              autoFocus
            />
          </div>
          <div className="mx-auto mt-2 h-px w-32 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" />
        </div>

        {/* 分类选择 */}
        <div>
          <label className="mb-2.5 block text-xs font-medium uppercase tracking-wider text-slate-400">分类</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                  categoryId === c.id
                    ? 'text-white shadow-sm scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
                style={categoryId === c.id ? { backgroundColor: c.color } : undefined}
              >
                {c.name}
              </button>
            ))}

            {/* 自定义新分类 */}
            {showNewCategory ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="分类名称"
                  className="h-9 w-24 rounded-xl border border-primary-300 bg-white px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newCategoryName.trim()) {
                        addCategory({ name: newCategoryName.trim(), type, icon: 'Tag', color: type === 'expense' ? '#6b7280' : '#22c55e' });
                        setNewCategoryName('');
                        setShowNewCategory(false);
                      }
                    }
                    if (e.key === 'Escape') { setShowNewCategory(false); setNewCategoryName(''); }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      addCategory({ name: newCategoryName.trim(), type, icon: 'Tag', color: type === 'expense' ? '#6b7280' : '#22c55e' });
                      setNewCategoryName('');
                      setShowNewCategory(false);
                    }
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white transition-all hover:bg-primary-600 active:scale-90"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-90 dark:bg-slate-700 dark:text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="flex items-center gap-1 rounded-xl border-2 border-dashed border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-400 transition-all hover:border-primary-300 hover:text-primary-500 dark:border-slate-600 dark:hover:border-primary-500"
              >
                <PlusCircle className="h-4 w-4" />
                自定义
              </button>
            )}
          </div>
        </div>

        {/* 钱包选择 */}
        {wallets.length > 0 && (
          <div>
            <label className="mb-2.5 block text-xs font-medium uppercase tracking-wider text-slate-400">账户</label>
            <div className="flex flex-wrap gap-2">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWalletId(w.id)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                    walletId === w.id
                      ? 'text-white shadow-sm scale-[1.02]'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                  style={walletId === w.id ? { backgroundColor: w.color } : undefined}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 标签 */}
        {tags.length > 0 && (
          <div>
            <label className="mb-2.5 block text-xs font-medium uppercase tracking-wider text-slate-400">标签（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    selectedTags.includes(tag.id)
                      ? 'text-white shadow-sm scale-105'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-700/50 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                  style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color } : undefined}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 日期和备注 - 双列 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">备注</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注（可选）"
              className="input"
              maxLength={100}
            />
          </div>
        </div>

        {/* 提交 */}
        <button type="submit" className="btn-primary w-full py-3.5 text-base">
          {isEdit ? '保存修改' : '确认记账'}
        </button>
      </form>
    </div>
  );
}
