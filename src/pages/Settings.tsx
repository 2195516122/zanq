import { useState } from 'react';
import { Sun, Moon, Download, Upload, Trash2, Plus, X, Repeat, Wallet, Tag, Bell } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useGoalStore } from '@/stores/goalStore';
import { useWalletStore } from '@/stores/walletStore';
import { useTagStore } from '@/stores/tagStore';
import { useRecurringStore } from '@/stores/recurringStore';
import { useTemplateStore } from '@/stores/templateStore';
import { centsToYuan, yuanToCents } from '@/utils/format';
import { STORAGE_KEYS } from '@/utils/constants';
import { clearAll } from '@/utils/storage';
import { saveAs } from 'file-saver';

export default function SettingsPage() {
  const { settings, setMonthlyBudget, toggleTheme, updateSettings } = useSettingsStore();
  const { transactions, loadTransactions } = useTransactionStore();
  const { categories, loadCategories } = useCategoryStore();
  const { goals, records, loadGoals } = useGoalStore();
  const { wallets, addWallet, deleteWallet, loadWallets } = useWalletStore();
  const { tags, addTag, deleteTag, loadTags } = useTagStore();
  const { recurrings, addRecurring, deleteRecurring, toggleActive, loadRecurrings } = useRecurringStore();
  const { templates, deleteTemplate } = useTemplateStore();

  const [budgetInput, setBudgetInput] = useState(
    settings.budget.monthlyLimit > 0 ? centsToYuan(settings.budget.monthlyLimit).toString() : ''
  );

  // 分类预算
  const [catBudgetCat, setCatBudgetCat] = useState('');
  const [catBudgetAmt, setCatBudgetAmt] = useState('');
  const catBudgets = settings.budget.categoryBudgets || {};

  // 新钱包
  const [newWalletName, setNewWalletName] = useState('');
  // 新标签
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  // 新周期
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [rType, setRType] = useState<'expense' | 'income'>('expense');
  const [rAmount, setRAmount] = useState('');
  const [rCatId, setRCatId] = useState('');
  const [rNote, setRNote] = useState('');
  const [rFreq, setRFreq] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [rStart, setRStart] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleBudgetSave = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) setMonthlyBudget(yuanToCents(val));
  };

  const handleAddCatBudget = () => {
    if (!catBudgetCat || !catBudgetAmt) return;
    const newBudgets = { ...catBudgets, [catBudgetCat]: yuanToCents(parseFloat(catBudgetAmt)) };
    updateSettings({ budget: { ...settings.budget, categoryBudgets: newBudgets } });
    setCatBudgetCat(''); setCatBudgetAmt('');
  };

  const removeCatBudget = (catId: string) => {
    const newBudgets = { ...catBudgets };
    delete newBudgets[catId];
    updateSettings({ budget: { ...settings.budget, categoryBudgets: newBudgets } });
  };

  const handleAddRecurring = () => {
    if (!rAmount || !rCatId || !rStart) return;
    addRecurring({
      type: rType, amount: yuanToCents(parseFloat(rAmount)),
      categoryId: rCatId, note: rNote, frequency: rFreq, startDate: rStart,
    });
    setRAmount(''); setRCatId(''); setRNote(''); setShowRecurringForm(false);
  };

  const handleExport = () => {
    const data = {
      version: '2.0', exportedAt: new Date().toISOString(),
      transactions, categories, goals, savingsRecords: records, settings,
      wallets, tags, recurrings, templates,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `zanqian-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
          if (data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
          if (data.goals) localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
          if (data.savingsRecords) localStorage.setItem(STORAGE_KEYS.SAVINGS_RECORDS, JSON.stringify(data.savingsRecords));
          if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
          if (data.wallets) localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(data.wallets));
          if (data.tags) localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(data.tags));
          if (data.recurrings) localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(data.recurrings));
          if (data.templates) localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
          loadTransactions(); loadCategories(); loadGoals(); loadWallets(); loadTags(); loadRecurrings();
          alert('导入成功！');
        } catch { alert('导入失败，文件格式不正确'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      if (confirm('再次确认：所有数据都将被清除！')) { clearAll(); window.location.reload(); }
    }
  };

  const freqLabel: Record<string, string> = { daily: '每天', weekly: '每周', monthly: '每月', yearly: '每年' };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">设置</h1>

      {/* 月度预算 */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">月度总预算</h2>
        <div className="flex gap-2">
          <input type="number" step="0.01" min="0" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} placeholder="月度预算金额（元）" className="input" />
          <button onClick={handleBudgetSave} className="btn-primary whitespace-nowrap">保存</button>
        </div>
      </div>

      {/* 分类预算 */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">分类预算</h2>
        {Object.entries(catBudgets).map(([catId, limit]) => {
          const cat = categories.find((c) => c.id === catId);
          return (
            <div key={catId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700">
              <span className="text-sm font-medium" style={{ color: cat?.color }}>{cat?.name || catId}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">¥{centsToYuan(limit).toFixed(0)}/月</span>
                <button onClick={() => removeCatBudget(catId)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
        <div className="flex gap-2">
          <select value={catBudgetCat} onChange={(e) => setCatBudgetCat(e.target.value)} className="input w-auto">
            <option value="">选择分类</option>
            {expenseCategories.filter((c) => !catBudgets[c.id]).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" min="0" value={catBudgetAmt} onChange={(e) => setCatBudgetAmt(e.target.value)} placeholder="预算（元）" className="input w-32" />
          <button onClick={handleAddCatBudget} className="btn-primary whitespace-nowrap">添加</button>
        </div>
      </div>

      {/* 钱包管理 */}
      <div className="card space-y-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><Wallet className="h-4 w-4" /> 账户管理</h2>
        {wallets.map((w) => (
          <div key={w.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: w.color }} />
              <span className="text-sm font-medium">{w.name}</span>
              {w.isDefault && <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-600">默认</span>}
            </div>
            {!w.isDefault && <button onClick={() => deleteWallet(w.id)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>}
          </div>
        ))}
        <div className="flex gap-2">
          <input type="text" value={newWalletName} onChange={(e) => setNewWalletName(e.target.value)} placeholder="新账户名称" className="input" />
          <button onClick={() => { if (newWalletName.trim()) { addWallet({ name: newWalletName.trim(), icon: 'Wallet', color: '#6366f1' }); setNewWalletName(''); } }} className="btn-primary whitespace-nowrap gap-1">
            <Plus className="h-4 w-4" /> 添加
          </button>
        </div>
      </div>

      {/* 标签管理 */}
      <div className="card space-y-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><Tag className="h-4 w-4" /> 标签管理</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t.id} className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: t.color }}>
              {t.name}
              <button onClick={() => deleteTag(t.id)} className="hover:opacity-70"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="标签名" className="input" />
          <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="h-9 w-9 rounded border p-0.5" />
          <button onClick={() => { if (newTagName.trim()) { addTag(newTagName.trim(), newTagColor); setNewTagName(''); } }} className="btn-primary whitespace-nowrap gap-1">
            <Plus className="h-4 w-4" /> 添加
          </button>
        </div>
      </div>

      {/* 周期性记账 */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><Repeat className="h-4 w-4" /> 周期性记账</h2>
          <button onClick={() => setShowRecurringForm(!showRecurringForm)} className="btn-secondary gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> 新增
          </button>
        </div>
        {recurrings.map((r) => {
          const cat = categories.find((c) => c.id === r.categoryId);
          return (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${r.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  ¥{centsToYuan(r.amount).toFixed(2)}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{cat?.name} · {freqLabel[r.frequency]}</span>
                {r.note && <span className="text-xs text-slate-400">{r.note}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(r.id)} className={`rounded px-2 py-0.5 text-xs ${r.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                  {r.isActive ? '启用' : '暂停'}
                </button>
                <button onClick={() => deleteRecurring(r.id)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
        {showRecurringForm && (
          <div className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-600">
            <div className="flex gap-2">
              <select value={rType} onChange={(e) => setRType(e.target.value as 'expense' | 'income')} className="input w-auto">
                <option value="expense">支出</option><option value="income">收入</option>
              </select>
              <input type="number" step="0.01" value={rAmount} onChange={(e) => setRAmount(e.target.value)} placeholder="金额" className="input w-28" />
              <select value={rFreq} onChange={(e) => setRFreq(e.target.value as typeof rFreq)} className="input w-auto">
                <option value="daily">每天</option><option value="weekly">每周</option>
                <option value="monthly">每月</option><option value="yearly">每年</option>
              </select>
            </div>
            <div className="flex gap-2">
              <select value={rCatId} onChange={(e) => setRCatId(e.target.value)} className="input w-auto">
                <option value="">选择分类</option>
                {categories.filter((c) => c.type === rType).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="date" value={rStart} onChange={(e) => setRStart(e.target.value)} className="input w-auto" />
              <input type="text" value={rNote} onChange={(e) => setRNote(e.target.value)} placeholder="备注" className="input" />
            </div>
            <button onClick={handleAddRecurring} className="btn-primary w-full">创建</button>
          </div>
        )}
      </div>

      {/* 模板管理 */}
      {templates.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">记账模板</h2>
          {templates.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            return (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-700">
                <span className="text-sm"><strong>{t.name}</strong> · {cat?.name} · ¥{centsToYuan(t.amount).toFixed(2)}</span>
                <button onClick={() => deleteTemplate(t.id)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>
      )}

      {/* 记账提醒 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">记账提醒</h2>
          </div>
          <button
            onClick={() => {
              if (!settings.reminderEnabled && 'Notification' in window) {
                Notification.requestPermission().then((perm) => {
                  if (perm === 'granted') updateSettings({ reminderEnabled: true, reminderTime: '21:00' });
                });
              } else {
                updateSettings({ reminderEnabled: !settings.reminderEnabled });
              }
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${settings.reminderEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}
          >
            {settings.reminderEnabled ? '已开启' : '已关闭'}
          </button>
        </div>
        {settings.reminderEnabled && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-slate-500">提醒时间：</span>
            <input
              type="time"
              value={settings.reminderTime || '21:00'}
              onChange={(e) => updateSettings({ reminderTime: e.target.value })}
              className="input w-auto"
            />
          </div>
        )}
      </div>

      {/* 主题 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">主题模式</h2>
            <p className="text-sm text-slate-500">当前：{settings.theme === 'light' ? '亮色' : '暗色'}模式</p>
          </div>
          <button onClick={toggleTheme} className="btn-secondary gap-2">
            {settings.theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            切换
          </button>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-900 dark:text-white">数据管理</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="btn-secondary gap-2"><Download className="h-4 w-4" /> 导出数据</button>
          <button onClick={handleImport} className="btn-secondary gap-2"><Upload className="h-4 w-4" /> 导入数据</button>
        </div>
        <p className="text-xs text-slate-400">数据存储在浏览器本地，清除缓存会丢失，建议定期导出备份。</p>
      </div>

      {/* 危险操作 */}
      <div className="card border border-red-200 dark:border-red-800">
        <h2 className="font-semibold text-red-600">危险操作</h2>
        <p className="mt-1 text-sm text-slate-500">清除后无法恢复，请先导出备份。</p>
        <button onClick={handleClearAll} className="btn-danger mt-3 gap-2"><Trash2 className="h-4 w-4" /> 清除所有数据</button>
      </div>

      {/* 关于 */}
      <div className="card text-center text-sm text-slate-400">
        <p>攒前 ZanQian v2.0.0</p>
        <p className="mt-1">共 {transactions.length} 条记录 · {wallets.length} 个账户 · {goals.length} 个目标</p>
      </div>
    </div>
  );
}
