import { format, parseISO, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 分 → 元，展示用
export function formatAmount(amountInCents: number): string {
  const yuan = amountInCents / 100;
  return yuan.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// 元 → 分，存储用
export function yuanToCents(yuan: number): number {
  return Math.round(yuan * 100);
}

// 分 → 元数值
export function centsToYuan(cents: number): number {
  return cents / 100;
}

// 格式化日期
export function formatDate(dateStr: string, pattern: string = 'yyyy-MM-dd'): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, pattern, { locale: zhCN });
}

// 格式化为相对友好显示 如 "3月15日"
export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, 'M月d日');
}

// 生成唯一 ID
export function generateId(): string {
  return crypto.randomUUID();
}

// 获取今天的日期字符串
export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// 获取当前月份 YYYY-MM
export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

// 获取当前年份
export function currentYear(): number {
  return new Date().getFullYear();
}
