import { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { centsToYuan, currentYear } from '@/utils/format';

const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

export default function Analytics() {
  const { transactions, getMonthlyTotal } = useTransactionStore();
  const { getCategoryById } = useCategoryStore();
  const { settings } = useSettingsStore();
  const [year, setYear] = useState(currentYear());

  // 月度收支数据
  const monthlyData = useMemo(() => {
    return MONTHS.map((name, i) => {
      const ym = `${year}-${String(i + 1).padStart(2, '0')}`;
      const income = centsToYuan(getMonthlyTotal(ym, 'income'));
      const expense = centsToYuan(getMonthlyTotal(ym, 'expense'));
      return { name, income, expense, balance: income - expense };
    });
  }, [year, transactions, getMonthlyTotal]);

  // 当年分类支出占比
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(String(year)))
      .forEach((t) => {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
      });
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        return { name: cat?.name || '未知', value: centsToYuan(amount), color: cat?.color || '#6b7280' };
      })
      .sort((a, b) => b.value - a.value);
  }, [year, transactions, getCategoryById]);

  // 当年总收支
  const yearIncome = monthlyData.reduce((s, d) => s + d.income, 0);
  const yearExpense = monthlyData.reduce((s, d) => s + d.expense, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">数据分析</h1>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input w-auto">
          {[currentYear(), currentYear() - 1, currentYear() - 2].map((y) => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
      </div>

      {/* 年度概览 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-slate-500">年度收入</p>
          <p className="mt-1 text-lg font-bold text-green-500">¥{yearIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-500">年度支出</p>
          <p className="mt-1 text-lg font-bold text-red-500">¥{yearExpense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-500">年度结余</p>
          <p className={`mt-1 text-lg font-bold ${yearIncome - yearExpense >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ¥{(yearIncome - yearExpense).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="card py-16 text-center text-slate-400">暂无数据，记几笔账后再来看分析吧</div>
      ) : (
        <>
          {/* 日均消费 & 月底预测 */}
          {(() => {
            const now = new Date();
            const currentM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const dayOfMonth = now.getDate();
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const curMonthExpense = centsToYuan(getMonthlyTotal(currentM, 'expense'));
            const dailyAvg = dayOfMonth > 0 ? curMonthExpense / dayOfMonth : 0;
            const predicted = dailyAvg * daysInMonth;
            return year === now.getFullYear() ? (
              <div className="card grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-500">日均消费</p>
                  <p className="mt-1 text-lg font-bold text-orange-500">¥{dailyAvg.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">预测本月</p>
                  <p className="mt-1 text-lg font-bold text-amber-500">¥{predicted.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">已过/总天数</p>
                  <p className="mt-1 text-lg font-bold text-slate-600 dark:text-slate-300">{dayOfMonth}/{daysInMonth}</p>
                </div>
              </div>
            ) : null;
          })()}

          {/* 同比环比 */}
          {(() => {
            const now = new Date();
            const curM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const prevM = now.getMonth() === 0
              ? `${now.getFullYear() - 1}-12`
              : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
            const lastYearM = `${now.getFullYear() - 1}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const curExp = centsToYuan(getMonthlyTotal(curM, 'expense'));
            const prevExp = centsToYuan(getMonthlyTotal(prevM, 'expense'));
            const lastYearExp = centsToYuan(getMonthlyTotal(lastYearM, 'expense'));
            const momChange = prevExp > 0 ? ((curExp - prevExp) / prevExp * 100) : 0;
            const yoyChange = lastYearExp > 0 ? ((curExp - lastYearExp) / lastYearExp * 100) : 0;
            return year === now.getFullYear() ? (
              <div className="card grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-slate-500">环比上月</p>
                  <p className={`mt-1 text-lg font-bold ${momChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {momChange > 0 ? '↑' : '↓'}{Math.abs(momChange).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-400">上月 ¥{prevExp.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500">同比去年</p>
                  <p className={`mt-1 text-lg font-bold ${yoyChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {yoyChange > 0 ? '↑' : '↓'}{Math.abs(yoyChange).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-400">去年同期 ¥{lastYearExp.toFixed(0)}</p>
                </div>
              </div>
            ) : null;
          })()}

          {/* 月度收支趋势 */}
          <div className="card">
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">月度收支趋势</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="income" name="收入" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" name="支出" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 月度收支对比柱状图 */}
          <div className="card">
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">月度收支对比</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" name="收入" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="支出" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 分类支出占比 */}
          {categoryData.length > 0 && (
            <div className="card">
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">支出分类占比</h2>
              <div className="flex flex-col items-center gap-6 lg:flex-row">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="w-full space-y-2 lg:w-64">
                  {categoryData.map((item) => (
                    <li key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">¥{item.value.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 分类预算对比 */}
          {settings.budget.categoryBudgets && Object.keys(settings.budget.categoryBudgets).length > 0 && (
            <div className="card">
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">分类预算对比（当月）</h2>
              <div className="space-y-3">
                {Object.entries(settings.budget.categoryBudgets).map(([catId, limit]) => {
                  const cat = getCategoryById(catId);
                  if (!cat || !limit) return null;
                  const now = new Date();
                  const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                  const spent = centsToYuan(
                    transactions
                      .filter((t) => t.type === 'expense' && t.categoryId === catId && t.date.startsWith(cm))
                      .reduce((s, t) => s + t.amount, 0)
                  );
                  const budgetYuan = centsToYuan(limit);
                  const pct = budgetYuan > 0 ? Math.min((spent / budgetYuan) * 100, 100) : 0;
                  return (
                    <div key={catId}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium" style={{ color: cat.color }}>{cat.name}</span>
                        <span className="text-slate-500">¥{spent.toFixed(0)} / ¥{budgetYuan.toFixed(0)}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: pct >= 90 ? '#ef4444' : cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 消费排行榜 */}
          {(() => {
            const top10 = transactions
              .filter((t) => t.type === 'expense' && t.date.startsWith(String(year)))
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 10);
            if (top10.length === 0) return null;
            return (
              <div className="card">
                <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">消费排行榜 TOP 10</h2>
                <ul className="space-y-2">
                  {top10.map((tx, i) => {
                    const cat = getCategoryById(tx.categoryId);
                    return (
                      <li key={tx.id} className="flex items-center gap-3">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          i < 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                        }`}>{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {cat?.name}{tx.note ? ` · ${tx.note}` : ''}
                            </span>
                            <span className="text-sm font-bold text-red-500">¥{centsToYuan(tx.amount).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-slate-400">{tx.date}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
