import { Link } from 'react-router-dom';
import { Plus, Target, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useGoalStore } from '@/stores/goalStore';
import { formatAmount, formatDate } from '@/utils/format';

export default function GoalList() {
  const { goals } = useGoalStore();

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const abandonedGoals = goals.filter((g) => g.status === 'abandoned');

  const renderGoalCard = (goal: typeof goals[0]) => {
    const percent = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <Link
        key={goal.id}
        to={`/goals/${goal.id}`}
        className="card block transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
              style={{ backgroundColor: goal.color + '18', color: goal.color }}
            >
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{goal.name}</h3>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="h-3 w-3" />
                {goal.status === 'active' ? (
                  daysLeft > 0 ? `还剩 ${daysLeft} 天` : '已过期'
                ) : (
                  formatDate(goal.deadline)
                )}
              </div>
            </div>
          </div>
          {goal.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {goal.status === 'abandoned' && <XCircle className="h-5 w-5 text-slate-400" />}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="font-tabular text-slate-500">¥{formatAmount(goal.currentAmount)}</span>
            <span className="font-tabular font-semibold text-slate-700 dark:text-slate-300">¥{formatAmount(goal.targetAmount)}</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${goal.color || '#6366f1'}cc, ${goal.color || '#6366f1'})` }}
            />
          </div>
          <p className="mt-1.5 text-right font-tabular text-xs font-semibold" style={{ color: goal.color || '#6366f1' }}>{percent.toFixed(1)}%</p>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">攒钱目标</h1>
        <Link to="/goals/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          新建目标
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="card py-16 text-center">
          <Target className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 text-slate-400">还没有攒钱目标</p>
          <Link to="/goals/new" className="mt-2 inline-block text-sm text-primary-500 hover:text-primary-600">
            创建第一个目标 →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {activeGoals.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">进行中 ({activeGoals.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2">{activeGoals.map(renderGoalCard)}</div>
            </div>
          )}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">已完成 ({completedGoals.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2">{completedGoals.map(renderGoalCard)}</div>
            </div>
          )}
          {abandonedGoals.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">已放弃 ({abandonedGoals.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2">{abandonedGoals.map(renderGoalCard)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
