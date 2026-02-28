import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGoalStore } from '@/stores/goalStore';
import { yuanToCents } from '@/utils/format';

const COLORS = ['#6366f1', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'];

export default function GoalForm() {
  const navigate = useNavigate();
  const { addGoal } = useGoalStore();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(targetAmount);
    if (!name.trim() || !amt || amt <= 0 || !deadline) return;

    addGoal({
      name: name.trim(),
      targetAmount: yuanToCents(amt),
      deadline,
      icon: 'Target',
      color,
    });
    navigate('/goals');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">新建攒钱目标</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">目标名称</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：买新电脑" className="input" required maxLength={30} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">目标金额（元）</label>
          <input type="number" step="0.01" min="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0.00" className="input text-xl font-bold" required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">截止日期</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" required />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">主题颜色</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-3 text-base">创建目标</button>
      </form>
    </div>
  );
}
