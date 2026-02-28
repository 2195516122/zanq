import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useGoalStore } from '@/stores/goalStore';
import { formatAmount, yuanToCents, formatDate } from '@/utils/format';

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { goals, deposit, withdraw, completeGoal, abandonGoal, deleteGoal, getRecordsByGoal } = useGoalStore();

  const goal = goals.find((g) => g.id === id);
  const records = id ? getRecordsByGoal(id) : [];

  const [action, setAction] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!goal) {
    return (
      <div className="card py-16 text-center">
        <p className="text-slate-400">目标不存在</p>
        <button onClick={() => navigate('/goals')} className="mt-2 text-sm text-primary-500">返回目标列表</button>
      </div>
    );
  }

  const percent = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const handleAction = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !id) return;
    const cents = yuanToCents(amt);

    if (action === 'deposit') {
      deposit(id, cents, note);
    } else if (action === 'withdraw') {
      withdraw(id, cents, note);
    }
    setAmount('');
    setNote('');
    setAction(null);
  };

  const handleDelete = () => {
    if (confirm('确定删除这个目标？所有相关记录也会被删除。')) {
      deleteGoal(goal.id);
      navigate('/goals');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/goals')} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{goal.name}</h1>
      </div>

      {/* 进度卡片 */}
      <div className="card">
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color: goal.color }}>
            ¥{formatAmount(goal.currentAmount)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            目标 ¥{formatAmount(goal.targetAmount)}
          </p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: goal.color }} />
        </div>
        <div className="mt-2 flex justify-between text-sm text-slate-500">
          <span>{percent.toFixed(1)}%</span>
          <span>
            {goal.status === 'active'
              ? daysLeft > 0 ? `还剩 ${daysLeft} 天` : '已过期'
              : goal.status === 'completed' ? '已完成' : '已放弃'}
          </span>
        </div>
      </div>

      {/* 操作按钮 */}
      {goal.status === 'active' && (
        <div className="flex gap-3">
          <button onClick={() => setAction('deposit')} className="btn-primary flex-1 gap-2">
            <Plus className="h-4 w-4" /> 存入
          </button>
          <button onClick={() => setAction('withdraw')} className="btn-secondary flex-1 gap-2">
            <Minus className="h-4 w-4" /> 取出
          </button>
        </div>
      )}

      {/* 存入/取出表单 */}
      {action && (
        <div className="card space-y-3">
          <h3 className="font-semibold">{action === 'deposit' ? '存入金额' : '取出金额'}</h3>
          <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="金额（元）" className="input" autoFocus />
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注（可选）" className="input" />
          <div className="flex gap-2">
            <button onClick={handleAction} className="btn-primary flex-1">确认</button>
            <button onClick={() => { setAction(null); setAmount(''); setNote(''); }} className="btn-secondary flex-1">取消</button>
          </div>
        </div>
      )}

      {/* 状态操作 */}
      {goal.status === 'active' && (
        <div className="flex gap-3">
          <button onClick={() => { if (confirm('确认完成？')) completeGoal(goal.id); }} className="btn-secondary flex-1 gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" /> 标记完成
          </button>
          <button onClick={() => { if (confirm('确认放弃？')) abandonGoal(goal.id); }} className="btn-secondary flex-1 gap-2 text-slate-500">
            <XCircle className="h-4 w-4" /> 放弃目标
          </button>
          <button onClick={handleDelete} className="btn-danger gap-2">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 操作历史 */}
      <div className="card">
        <h2 className="font-semibold text-slate-900 dark:text-white">操作历史</h2>
        {records.length === 0 ? (
          <p className="mt-3 text-center text-sm text-slate-400">暂无记录</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
            {records.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {r.type === 'deposit' ? '存入' : '取出'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(r.date)}{r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${r.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                  {r.type === 'deposit' ? '+' : '-'}¥{formatAmount(r.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
