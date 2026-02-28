import { create } from 'zustand';
import type { Achievement, CheckInRecord } from '@/types';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS, ACHIEVEMENT_DEFINITIONS } from '@/utils/constants';
import { today } from '@/utils/format';
import { parseISO, differenceInDays } from 'date-fns';

interface AchievementState {
  achievements: Achievement[];
  checkIns: CheckInRecord[];
  loadAchievements: () => void;
  loadCheckIns: () => void;
  checkIn: (goalId?: string, amount?: number) => void;
  getStreak: () => number;
  isCheckedInToday: () => boolean;
  checkAndUnlock: (context: {
    totalRecords: number;
    recordDates: string[];
    totalSaved: number;
    completedGoals: number;
    budgetOk: boolean;
  }) => Achievement | null;
}

function getConsecutiveDays(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  const todayStr = today();
  if (sorted[0] !== todayStr) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInDays(parseISO(sorted[i - 1]), parseISO(sorted[i]));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: [],
  checkIns: [],

  loadAchievements: () => {
    const stored = getItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, ACHIEVEMENT_DEFINITIONS);
    if (stored.length < ACHIEVEMENT_DEFINITIONS.length) {
      const existingIds = new Set(stored.map((a) => a.id));
      const merged = [
        ...stored,
        ...ACHIEVEMENT_DEFINITIONS.filter((a) => !existingIds.has(a.id)),
      ];
      setItem(STORAGE_KEYS.ACHIEVEMENTS, merged);
      set({ achievements: merged });
    } else {
      set({ achievements: stored });
    }
  },

  loadCheckIns: () => {
    const stored = getItem<CheckInRecord[]>(STORAGE_KEYS.CHECKINS, []);
    set({ checkIns: stored });
  },

  checkIn: (goalId, amount) => {
    const todayStr = today();
    if (get().checkIns.some((c) => c.date === todayStr)) return;
    const record: CheckInRecord = { date: todayStr, goalId, amount };
    const updated = [record, ...get().checkIns];
    setItem(STORAGE_KEYS.CHECKINS, updated);
    set({ checkIns: updated });
  },

  getStreak: () => {
    const dates = get().checkIns.map((c) => c.date);
    return getConsecutiveDays(dates);
  },

  isCheckedInToday: () => {
    return get().checkIns.some((c) => c.date === today());
  },

  checkAndUnlock: (context) => {
    const achs = get().achievements;
    let unlocked: Achievement | null = null;

    const tryUnlock = (condition: string): boolean => {
      switch (condition) {
        case 'first_record': return context.totalRecords >= 1;
        case 'streak_7': return getConsecutiveDays(context.recordDates) >= 7;
        case 'streak_30': return getConsecutiveDays(context.recordDates) >= 30;
        case 'total_100': return context.totalRecords >= 100;
        case 'save_1000': return context.totalSaved >= 100000;
        case 'save_10000': return context.totalSaved >= 1000000;
        case 'goal_complete_1': return context.completedGoals >= 1;
        case 'budget_ok': return context.budgetOk;
        case 'checkin_7': return get().getStreak() >= 7;
        case 'checkin_30': return get().getStreak() >= 30;
        default: return false;
      }
    };

    const updated = achs.map((a) => {
      if (a.unlockedAt) return a;
      if (tryUnlock(a.condition)) {
        const newA = { ...a, unlockedAt: new Date().toISOString() };
        if (!unlocked) unlocked = newA;
        return newA;
      }
      return a;
    });

    if (unlocked) {
      setItem(STORAGE_KEYS.ACHIEVEMENTS, updated);
      set({ achievements: updated });
    }
    return unlocked;
  },
}));
