import type { Category, UserSettings, Wallet, Tag, Achievement } from '@/types';

// 预设支出分类
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'exp-food', name: '餐饮', type: 'expense', icon: 'UtensilsCrossed', color: '#ef4444', isDefault: true },
  { id: 'exp-transport', name: '交通', type: 'expense', icon: 'Car', color: '#f97316', isDefault: true },
  { id: 'exp-shopping', name: '购物', type: 'expense', icon: 'ShoppingBag', color: '#eab308', isDefault: true },
  { id: 'exp-fun', name: '娱乐', type: 'expense', icon: 'Gamepad2', color: '#a855f7', isDefault: true },
  { id: 'exp-home', name: '居住', type: 'expense', icon: 'Home', color: '#3b82f6', isDefault: true },
  { id: 'exp-medical', name: '医疗', type: 'expense', icon: 'Heart', color: '#ec4899', isDefault: true },
  { id: 'exp-edu', name: '教育', type: 'expense', icon: 'GraduationCap', color: '#14b8a6', isDefault: true },
  { id: 'exp-comm', name: '通讯', type: 'expense', icon: 'Smartphone', color: '#6366f1', isDefault: true },
  { id: 'exp-other', name: '其他', type: 'expense', icon: 'MoreHorizontal', color: '#6b7280', isDefault: true },
];

// 预设收入分类
export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'inc-salary', name: '工资', type: 'income', icon: 'Briefcase', color: '#22c55e', isDefault: true },
  { id: 'inc-part', name: '兼职', type: 'income', icon: 'Clock', color: '#10b981', isDefault: true },
  { id: 'inc-invest', name: '理财', type: 'income', icon: 'TrendingUp', color: '#06b6d4', isDefault: true },
  { id: 'inc-gift', name: '红包', type: 'income', icon: 'Gift', color: '#f43f5e', isDefault: true },
  { id: 'inc-other', name: '其他', type: 'income', icon: 'MoreHorizontal', color: '#6b7280', isDefault: true },
];

export const ALL_DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

// 默认用户设置
export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  budget: {
    monthlyLimit: 0,
  },
  currency: 'CNY',
};

// 默认钱包
export const DEFAULT_WALLETS: Wallet[] = [
  { id: 'wallet-cash', name: '现金', icon: 'Banknote', color: '#22c55e', balance: 0, isDefault: true, sortOrder: 0 },
  { id: 'wallet-wechat', name: '微信', icon: 'MessageCircle', color: '#07c160', balance: 0, isDefault: false, sortOrder: 1 },
  { id: 'wallet-alipay', name: '支付宝', icon: 'Smartphone', color: '#1677ff', balance: 0, isDefault: false, sortOrder: 2 },
  { id: 'wallet-bank', name: '银行卡', icon: 'CreditCard', color: '#6366f1', balance: 0, isDefault: false, sortOrder: 3 },
];

// 默认标签
export const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-reimburse', name: '可报销', color: '#f97316' },
  { id: 'tag-aa', name: 'AA', color: '#8b5cf6' },
  { id: 'tag-necessary', name: '必要', color: '#22c55e' },
  { id: 'tag-impulse', name: '冲动消费', color: '#ef4444' },
];

// 成就定义
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  { id: 'ach-first-record', name: '初来乍到', description: '记录第一笔账', icon: 'Pencil', condition: 'first_record' },
  { id: 'ach-7-days', name: '坚持一周', description: '连续7天记账', icon: 'Calendar', condition: 'streak_7' },
  { id: 'ach-30-days', name: '习惯养成', description: '连续30天记账', icon: 'Trophy', condition: 'streak_30' },
  { id: 'ach-100-records', name: '百笔达人', description: '累计记账100笔', icon: 'Hash', condition: 'total_100' },
  { id: 'ach-save-1000', name: '小有积蓄', description: '攒钱目标累计存入1000元', icon: 'PiggyBank', condition: 'save_1000' },
  { id: 'ach-save-10000', name: '万元户', description: '攒钱目标累计存入10000元', icon: 'Gem', condition: 'save_10000' },
  { id: 'ach-goal-complete', name: '目标达成', description: '完成第一个攒钱目标', icon: 'Target', condition: 'goal_complete_1' },
  { id: 'ach-budget-ok', name: '精打细算', description: '月度支出控制在预算内', icon: 'Shield', condition: 'budget_ok' },
  { id: 'ach-checkin-7', name: '打卡新手', description: '连续打卡7天', icon: 'CheckCircle', condition: 'checkin_7' },
  { id: 'ach-checkin-30', name: '打卡达人', description: '连续打卡30天', icon: 'Award', condition: 'checkin_30' },
];

// LocalStorage 键名
export const STORAGE_KEYS = {
  TRANSACTIONS: 'zq_transactions',
  CATEGORIES: 'zq_categories',
  GOALS: 'zq_goals',
  SAVINGS_RECORDS: 'zq_savings_records',
  SETTINGS: 'zq_settings',
  WALLETS: 'zq_wallets',
  TAGS: 'zq_tags',
  RECURRING: 'zq_recurring',
  TEMPLATES: 'zq_templates',
  WISHES: 'zq_wishes',
  ACHIEVEMENTS: 'zq_achievements',
  CHECKINS: 'zq_checkins',
} as const;
