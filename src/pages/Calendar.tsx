import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { formatAmount } from '@/utils/format';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  subMonths, format, isSameMonth, isToday,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export default function CalendarPage() {
  const { transactions } = useTransactionStore();
  const { getCategoryById } = useCategoryStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const txByDate = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      const existing = map.get(t.date) || { income: 0, expense: 0 };
      if (t.type === 'income') existing.income += t.amount;
      else existing.expense += t.amount;
      map.set(t.date, existing);
    });
    return map;
  }, [transactions]);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedTx = selectedDate
    ? transactions.filter((t) => t.date === selectedDate).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  const monthYM = format(currentDate, 'yyyy-MM');
  const monthIncome = transactions
    .filter((t) => t.date.startsWith(monthYM) && t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const monthExpense = transactions
    .filter((t) => t.date.startsWith(monthYM) && t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">账单日历</h1>
        <p className="mt-0.5 text-sm text-slate-500">按日查看收支明细</p>
      </div>

      {/* 月份切换 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="rounded-xl p-2 transition-all hover:bg-slate-100 active:scale-90 dark:hover:bg-slate-700">
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold tracking-tight">{format(currentDate, 'yyyy年M月', { locale: zhCN })}</h2>
            <p className="mt-0.5 font-tabular text-xs text-slate-400">
              收入 <span className="font-semibold text-green-500">¥{formatAmount(monthIncome)}</span>
              {' · '}支出 <span className="font-semibold text-red-500">¥{formatAmount(monthExpense)}</span>
            </p>
          </div>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="rounded-xl p-2 transition-all hover:bg-slate-100 active:scale-90 dark:hover:bg-slate-700">
            <ChevronRight className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* 星期头 */}
        <div className="mt-5 grid grid-cols-7 text-center">
          {WEEKDAYS.map((d) => <div key={d} className="pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{d}</div>)}
        </div>

        {/* 日期格子 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const dateStr = format(d, 'yyyy-MM-dd');
            const data = txByDate.get(dateStr);
            const isCurrentMonth = isSameMonth(d, currentDate);
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center rounded-xl py-1.5 text-xs transition-all duration-150 ${
                  !isCurrentMonth ? 'text-slate-300 dark:text-slate-700' :
                  isSelected ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25 scale-105' :
                  isToday(d) ? 'bg-primary-50 text-primary-600 font-bold ring-1 ring-primary-200 dark:bg-primary-500/10 dark:ring-primary-500/30' :
                  'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className="font-semibold">{format(d, 'd')}</span>
                {data && isCurrentMonth && (
                  <div className="mt-0.5 flex gap-0.5">
                    {data.income > 0 && <div className="h-1.5 w-1.5 rounded-full bg-green-400" />}
                    {data.expense > 0 && <div className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 选中日期的流水 */}
      {selectedDate && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {format(new Date(selectedDate), 'M月d日')} 流水
          </h3>
          {selectedTx.length === 0 ? (
            <p className="mt-3 text-center text-sm text-slate-400">当天无记录</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {selectedTx.map((tx) => {
                const cat = getCategoryById(tx.categoryId);
                return (
                  <li key={tx.id} className="flex items-center justify-between rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: cat?.color || '#6b7280' }}>
                        {cat?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat?.name}</p>
                        {tx.note && <p className="text-[11px] text-slate-400">{tx.note}</p>}
                      </div>
                    </div>
                    <span className={`font-tabular text-sm font-bold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}¥{formatAmount(tx.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
