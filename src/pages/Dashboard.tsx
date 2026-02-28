import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowRight, Sparkles } from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useGoalStore } from '@/stores/goalStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { formatAmount, currentMonth, formatDateShort } from '@/utils/format';

export default function Dashboard() {
  const { transactions, getMonthlyTotal } = useTransactionStore();
  const { goals } = useGoalStore();
  const { settings } = useSettingsStore();
  const { getCategoryById } = useCategoryStore();

  const month = currentMonth();
  const monthIncome = getMonthlyTotal(month, 'income');
  const monthExpense = getMonthlyTotal(month, 'expense');
  const monthBalance = monthIncome - monthExpense;
  const budget = settings.budget.monthlyLimit;
  const budgetPercent = budget > 0 ? Math.min((monthExpense / budget) * 100, 100) : 0;

  const recentTransactions = transactions.slice(0, 8);
  const activeGoals = goals.filter((g) => g.status === 'active');

  return (
    <div className="space-y-6">
      {/* 欢迎区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            仪表盘
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">管理你的每一分钱</p>
        </div>
        <Link to="/transactions/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          记一笔
        </Link>
      </div>

      {/* 核心数据 - 渐变卡片 */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-5 text-white shadow-lg shadow-primary-500/20">
        <div className="flex items-center gap-2 text-sm font-medium text-white/70">
          <Sparkles className="h-4 w-4" />
          本月概览
        </div>
        <p className="mt-2 font-tabular text-3xl font-bold tracking-tight">
          ¥{formatAmount(monthBalance)}
        </p>
        <p className="text-sm text-white/60">本月结余</p>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-xs text-white/50">收入</p>
            <p className="mt-0.5 font-tabular text-base font-semibold">¥{formatAmount(monthIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">支出</p>
            <p className="mt-0.5 font-tabular text-base font-semibold">¥{formatAmount(monthExpense)}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">攒钱目标</p>
            <p className="mt-0.5 text-base font-semibold">{activeGoals.length} 个进行中</p>
          </div>
        </div>
      </div>

      {/* 快捷统计小卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-500/10">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">收入</p>
            <p className="font-tabular text-sm font-bold text-slate-800 dark:text-slate-200">¥{formatAmount(monthIncome)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">支出</p>
            <p className="font-tabular text-sm font-bold text-slate-800 dark:text-slate-200">¥{formatAmount(monthExpense)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">结余</p>
            <p className={`font-tabular text-sm font-bold ${monthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>¥{formatAmount(monthBalance)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
            <PiggyBank className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">目标</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeGoals.length} 个</p>
          </div>
        </div>
      </div>

      {/* 预算进度 */}
      {budget > 0 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">本月预算</h2>
            <span className="font-tabular text-xs text-slate-500">
              ¥{formatAmount(monthExpense)} / ¥{formatAmount(budget)}
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent >= 90 ? 'bg-gradient-to-r from-red-400 to-red-500' : budgetPercent >= 70 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-primary-400 to-primary-500'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {budgetPercent >= 100
              ? '⚠️ 已超出预算！'
              : budgetPercent >= 90
                ? '⚠️ 即将超出预算'
                : `还剩 ¥${formatAmount(budget - monthExpense)} 可用`}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 近期流水 */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">近期流水</h2>
            <Link to="/transactions" className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
                <Wallet className="h-6 w-6 text-slate-400" />
              </div>
              <p className="mt-3 text-sm text-slate-400">暂无记录</p>
              <Link to="/transactions/new" className="mt-1 text-xs text-primary-500">快去记一笔 →</Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-1">
              {recentTransactions.map((tx) => {
                const category = getCategoryById(tx.categoryId);
                return (
                  <li key={tx.id} className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: category?.color || '#6b7280' }}
                      >
                        {category?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {category?.name || '未知'}
                        </p>
                        <p className="text-[11px] text-slate-400">{formatDateShort(tx.date)}{tx.note ? ` · ${tx.note}` : ''}</p>
                      </div>
                    </div>
                    <span className={`font-tabular text-sm font-semibold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}¥{formatAmount(tx.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 攒钱目标摘要 */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">攒钱目标</h2>
            <Link to="/goals" className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {activeGoals.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
                <PiggyBank className="h-6 w-6 text-slate-400" />
              </div>
              <p className="mt-3 text-sm text-slate-400">还没有攒钱目标</p>
              <Link to="/goals/new" className="mt-1 text-xs text-primary-500">创建一个 →</Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-4">
              {activeGoals.slice(0, 4).map((goal) => {
                const percent = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
                return (
                  <li key={goal.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: goal.color || '#6366f1' }} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{goal.name}</span>
                      </div>
                      <span className="font-tabular text-xs font-semibold text-slate-500">{percent.toFixed(0)}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: goal.color || '#6366f1' }}
                      />
                    </div>
                    <p className="mt-1 font-tabular text-[11px] text-slate-400">
                      ¥{formatAmount(goal.currentAmount)} / ¥{formatAmount(goal.targetAmount)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
