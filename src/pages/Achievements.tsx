import { useMemo } from 'react';
import { Trophy, Lock, CheckCircle, Flame } from 'lucide-react';
import { useAchievementStore } from '@/stores/achievementStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useGoalStore } from '@/stores/goalStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatDate, currentMonth } from '@/utils/format';

export default function AchievementsPage() {
  const { achievements, checkIns, checkIn, getStreak, isCheckedInToday, checkAndUnlock } = useAchievementStore();
  const { transactions, getMonthlyTotal } = useTransactionStore();
  const { goals } = useGoalStore();
  const { settings } = useSettingsStore();

  const streak = getStreak();
  const checkedToday = isCheckedInToday();

  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  // 尝试解锁成就
  useMemo(() => {
    const month = currentMonth();
    const monthExpense = getMonthlyTotal(month, 'expense');
    const budgetOk = settings.budget.monthlyLimit > 0 && monthExpense <= settings.budget.monthlyLimit;
    const recordDates = [...new Set(transactions.map((t) => t.date))];
    const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
    const completedGoals = goals.filter((g) => g.status === 'completed').length;

    checkAndUnlock({
      totalRecords: transactions.length,
      recordDates,
      totalSaved,
      completedGoals,
      budgetOk,
    });
  }, [transactions.length, goals, settings.budget.monthlyLimit]);

  const handleCheckIn = () => {
    if (!checkedToday) {
      checkIn();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">成就与打卡</h1>

      {/* 打卡卡片 */}
      {/* 打卡卡片 - 玻璃态渐变 */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 text-white shadow-xl shadow-primary-500/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <Flame className="h-6 w-6 self-center animate-pulse" />
              <span className="font-tabular text-4xl font-bold tracking-tight">{streak}</span>
              <span className="text-sm font-medium text-white/70">天连续打卡</span>
            </div>
            <p className="mt-1 text-sm text-white/50">累计打卡 {checkIns.length} 天</p>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={checkedToday}
            className={`rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300 ${
              checkedToday
                ? 'bg-white/15 cursor-not-allowed text-white/60'
                : 'bg-white text-primary-600 hover:bg-white/90 hover:scale-105 shadow-lg active:scale-95'
            }`}
          >
            {checkedToday ? '✓ 已打卡' : '立即打卡'}
          </button>
        </div>

        {/* 最近7天打卡状态 */}
        <div className="mt-5 flex justify-between rounded-xl bg-white/10 p-3">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 6 + i);
            const dateStr = d.toISOString().split('T')[0];
            const checked = checkIns.some((c) => c.date === dateStr);
            const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
            const isToday = i === 6;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-white/50">{dayNames[d.getDay()]}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  checked
                    ? 'bg-white text-primary-600 shadow-sm'
                    : isToday
                      ? 'bg-white/20 ring-2 ring-white/40'
                      : 'bg-white/5'
                }`}>
                  {checked ? '✓' : d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 已解锁成就 */}
      {unlocked.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Trophy className="h-4 w-4 text-amber-500" /> 已解锁 ({unlocked.length}/{achievements.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {unlocked.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 border-l-4 border-amber-400 transition-all hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-500 shadow-sm dark:from-amber-500/20 dark:to-amber-500/10">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">{a.name}</h3>
                  <p className="text-[11px] text-slate-500">{a.description}</p>
                  {a.unlockedAt && (
                    <p className="mt-0.5 text-[10px] font-medium text-amber-500">{formatDate(a.unlockedAt, 'yyyy-MM-dd')} 解锁</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 未解锁成就 */}
      {locked.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Lock className="h-4 w-4" /> 未解锁 ({locked.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {locked.map((a) => (
              <div key={a.id} className="card flex items-center gap-3 opacity-40 grayscale transition-all hover:opacity-60 hover:grayscale-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-700">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-600 dark:text-slate-400">{a.name}</h3>
                  <p className="text-[11px] text-slate-400">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
