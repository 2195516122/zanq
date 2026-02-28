import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import TransactionList from '@/pages/TransactionList';
import TransactionForm from '@/pages/TransactionForm';
import GoalList from '@/pages/GoalList';
import GoalForm from '@/pages/GoalForm';
import GoalDetail from '@/pages/GoalDetail';
import Analytics from '@/pages/Analytics';
import SettingsPage from '@/pages/Settings';
import CalendarPage from '@/pages/Calendar';
import WishlistPage from '@/pages/Wishlist';
import AchievementsPage from '@/pages/Achievements';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useGoalStore } from '@/stores/goalStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWalletStore } from '@/stores/walletStore';
import { useTagStore } from '@/stores/tagStore';
import { useRecurringStore } from '@/stores/recurringStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useWishStore } from '@/stores/wishStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { today } from '@/utils/format';

export default function App() {
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadGoals = useGoalStore((s) => s.loadGoals);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadWallets = useWalletStore((s) => s.loadWallets);
  const loadTags = useTagStore((s) => s.loadTags);
  const loadRecurrings = useRecurringStore((s) => s.loadRecurrings);
  const getDueRecurrings = useRecurringStore((s) => s.getDueRecurrings);
  const markGenerated = useRecurringStore((s) => s.markGenerated);
  const loadTemplates = useTemplateStore((s) => s.loadTemplates);
  const loadWishes = useWishStore((s) => s.loadWishes);
  const loadAchievements = useAchievementStore((s) => s.loadAchievements);
  const loadCheckIns = useAchievementStore((s) => s.loadCheckIns);

  useEffect(() => {
    loadSettings();
    loadCategories();
    loadTransactions();
    loadGoals();
    loadWallets();
    loadTags();
    loadRecurrings();
    loadTemplates();
    loadWishes();
    loadAchievements();
    loadCheckIns();
  }, []);

  // 自动生成周期性记账
  useEffect(() => {
    const due = getDueRecurrings();
    const todayStr = today();
    due.forEach((r) => {
      addTransaction({
        type: r.type,
        amount: r.amount,
        categoryId: r.categoryId,
        walletId: r.walletId,
        tags: r.tags,
        note: r.note ? `[自动] ${r.note}` : '[自动记账]',
        date: todayStr,
        recurringId: r.id,
      });
      markGenerated(r.id, todayStr);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/transactions/new" element={<TransactionForm />} />
          <Route path="/transactions/:id/edit" element={<TransactionForm />} />
          <Route path="/goals" element={<GoalList />} />
          <Route path="/goals/new" element={<GoalForm />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
