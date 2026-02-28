// 交易记录
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;           // 单位：分，避免浮点精度问题
  categoryId: string;
  walletId?: string;        // 账本/钱包ID
  tags?: string[];          // 标签列表
  note: string;
  date: string;             // YYYY-MM-DD
  createdAt: string;        // ISO string
  recurringId?: string;     // 关联的周期性记账ID
  userId?: string;          // V2.0 预留
}

// 分类
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;             // Lucide 图标名
  color: string;            // hex 色值
  isDefault: boolean;
  budgetLimit?: number;     // 分类预算上限（分）
  sortOrder?: number;       // 排序序号
}

// 攒钱目标
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;     // 单位：分
  currentAmount: number;    // 单位：分
  deadline: string;         // YYYY-MM-DD
  status: 'active' | 'completed' | 'abandoned';
  icon: string;
  color: string;
  createdAt: string;
  linkedWishId?: string;    // 关联的心愿单ID
  userId?: string;
}

// 攒钱操作记录
export interface SavingsRecord {
  id: string;
  goalId: string;
  type: 'deposit' | 'withdraw';
  amount: number;           // 单位：分
  note: string;
  date: string;             // YYYY-MM-DD
}

// 周期性记账
export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  walletId?: string;
  tags?: string[];
  note: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;        // YYYY-MM-DD
  endDate?: string;         // 可选结束日期
  lastGenerated?: string;   // 上次生成日期
  isActive: boolean;
}

// 记账模板
export interface TransactionTemplate {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  walletId?: string;
  tags?: string[];
  note: string;
  sortOrder?: number;
}

// 钱包/账本
export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  balance: number;          // 当前余额（分）
  isDefault: boolean;
  sortOrder?: number;
}

// 标签
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// 心愿单
export interface WishItem {
  id: string;
  name: string;
  price: number;            // 单位：分
  imageUrl?: string;
  link?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'purchased' | 'abandoned';
  linkedGoalId?: string;    // 关联攒钱目标
  createdAt: string;
}

// 成就
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;        // 判定条件标识
  unlockedAt?: string;      // 解锁时间，undefined 表示未解锁
}

// 打卡记录
export interface CheckInRecord {
  date: string;             // YYYY-MM-DD
  goalId?: string;
  amount?: number;          // 打卡存入金额（分）
}

// 预算（扩展）
export interface Budget {
  monthlyLimit: number;     // 总月度预算（分）
  categoryBudgets?: Record<string, number>; // 分类预算 categoryId -> 金额(分)
}

// 用户设置
export interface UserSettings {
  theme: 'light' | 'dark';
  budget: Budget;
  currency: string;
  reminderEnabled?: boolean;
  reminderTime?: string;    // HH:mm
}

// 筛选条件
export interface TransactionFilter {
  type?: 'income' | 'expense';
  categoryId?: string;
  walletId?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  keyword?: string;
  minAmount?: number;       // 最小金额（分）
  maxAmount?: number;       // 最大金额（分）
}

// Toast 撤销
export interface UndoAction {
  id: string;
  message: string;
  undo: () => void;
  timeout: number;
}
