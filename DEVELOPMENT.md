# 攒钱记账网站 - 开发文档

## 1. 项目概述

**项目名称**：攒前（ZanQian）— 个人攒钱与消费记录管理平台

**项目目标**：构建一个轻量级纯前端个人理财工具，帮助用户记录收支、设定攒钱目标、分析消费习惯。

**用户定位**：
- **V1.0**：单用户本地使用（LocalStorage 存储）
- **V2.0（规划）**：接入后端，支持多用户与云端同步

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 + TypeScript | 组件化开发，类型安全 |
| 构建 | Vite | 快速开发与构建 |
| 路由 | React Router v6 | SPA 路由 |
| 状态 | Zustand | 轻量状态管理，内置持久化 |
| UI | TailwindCSS + shadcn/ui | 现代 UI 组件 |
| 图表 | Recharts | 数据可视化 |
| 图标 | Lucide React | 图标库 |
| 存储 | LocalStorage | V1.0 本地方案 |
| 日期 | date-fns | 日期处理 |
| 导出 | FileSaver.js | 数据导出 CSV |

---

## 3. 功能模块

### 3.1 仪表盘（Dashboard）
- 总资产/本月收入/本月支出/本月结余 概览卡片
- 近期流水（最近 10 条记录）
- 本月预算进度条
- 攒钱目标进度摘要
- 快捷记账入口

### 3.2 记账模块（Transactions）
- **记一笔**：金额、类型（收入/支出）、分类、备注、日期
- **收支列表**：按时间倒序展示，支持按日期/分类/关键词筛选
- **分类管理**：预设常用分类 + 自定义分类（支持图标选择）
- **批量删除**：多选后批量操作
- **编辑/删除**：单条记录的修改与删除

**预设支出分类**：餐饮、交通、购物、娱乐、居住、医疗、教育、通讯、其他
**预设收入分类**：工资、兼职、理财、红包、其他

### 3.3 攒钱目标（Savings Goals）
- **创建目标**：名称、目标金额、截止日期、图标/颜色
- **进度追踪**：进度条 + 百分比 + 剩余天数
- **存入/取出**：对目标金额进行增减操作，记录每笔操作历史
- **状态管理**：进行中 / 已完成 / 已放弃
- **到期提醒**：目标临近截止时在仪表盘提示
- **排序**：按进度、截止日期、创建时间排序

### 3.4 数据分析（Analytics）
- **月度报表**：当月收支汇总、日均消费、与上月对比
- **年度报表**：全年收支趋势折线图、月度柱状图
- **分类占比**：饼图/环形图展示各分类消费占比
- **消费趋势**：近 6 个月收支趋势折线图
- **预算对比**：设定月度预算，对比实际消费（柱状图）

### 3.5 设置（Settings）
- **预算设置**：月度总预算金额
- **分类管理**：增删改自定义分类
- **数据导出**：导出为 CSV 文件
- **数据导入**：从 CSV 导入历史数据
- **数据清除**：一键清空所有数据（需二次确认）
- **主题切换**：亮色 / 暗色模式

---

## 4. 数据模型（TypeScript 类型定义）

```typescript
// 交易记录
interface Transaction {
  id: string;              // UUID
  type: 'income' | 'expense'; // 收入/支出
  amount: number;          // 金额（单位：元）
  categoryId: string;      // 分类ID
  note: string;            // 备注
  date: string;            // 日期 YYYY-MM-DD
  createdAt: string;       // 创建时间 ISO
}

// 分类
interface Category {
  id: string;
  name: string;            // 分类名称
  type: 'income' | 'expense';
  icon: string;            // Lucide 图标名
  color: string;           // 主题色 hex
  isDefault: boolean;      // 是否预设
}

// 攒钱目标
interface SavingsGoal {
  id: string;
  name: string;            // 目标名称
  targetAmount: number;    // 目标金额
  currentAmount: number;   // 当前已存金额
  deadline: string;        // 截止日期 YYYY-MM-DD
  status: 'active' | 'completed' | 'abandoned';
  icon: string;
  color: string;
  createdAt: string;
}

// 攒钱操作记录
interface SavingsRecord {
  id: string;
  goalId: string;          // 关联目标ID
  type: 'deposit' | 'withdraw'; // 存入/取出
  amount: number;
  note: string;
  date: string;
}

// 预算
interface Budget {
  monthlyLimit: number;    // 月度预算上限
}

// 用户设置
interface UserSettings {
  theme: 'light' | 'dark';
  budget: Budget;
  currency: string;        // 默认 'CNY'
}
```

### LocalStorage 键名规划

| Key | 值类型 | 说明 |
|-----|--------|------|
| `zq_transactions` | Transaction[] | 交易记录 |
| `zq_categories` | Category[] | 分类列表 |
| `zq_goals` | SavingsGoal[] | 攒钱目标 |
| `zq_savings_records` | SavingsRecord[] | 存取记录 |
| `zq_settings` | UserSettings | 用户设置 |

---

## 5. 页面路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Dashboard | 仪表盘首页 |
| `/transactions` | TransactionList | 收支记录列表 |
| `/transactions/new` | TransactionForm | 新增记录 |
| `/transactions/:id/edit` | TransactionForm | 编辑记录 |
| `/goals` | GoalList | 攒钱目标列表 |
| `/goals/new` | GoalForm | 新增目标 |
| `/goals/:id` | GoalDetail | 目标详情与操作 |
| `/analytics` | Analytics | 数据分析 |
| `/settings` | Settings | 设置页 |

---

## 6. 项目目录结构

```
zanqian/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/              # 静态资源
│   ├── components/          # 通用组件
│   │   ├── ui/              # shadcn/ui 组件
│   │   ├── Layout.tsx       # 页面布局（侧边栏+顶栏）
│   │   ├── AmountInput.tsx  # 金额输入组件
│   │   ├── CategoryPicker.tsx
│   │   └── DatePicker.tsx
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── TransactionList.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── GoalList.tsx
│   │   ├── GoalForm.tsx
│   │   ├── GoalDetail.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── stores/              # Zustand 状态管理
│   │   ├── transactionStore.ts
│   │   ├── goalStore.ts
│   │   ├── categoryStore.ts
│   │   └── settingsStore.ts
│   ├── utils/               # 工具函数
│   │   ├── storage.ts       # LocalStorage 封装
│   │   ├── format.ts        # 格式化（金额、日期）
│   │   ├── export.ts        # 数据导出
│   │   └── constants.ts     # 常量（预设分类等）
│   ├── hooks/               # 自定义 Hooks
│   │   └── useMediaQuery.ts
│   ├── types/               # TypeScript 类型
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css            # Tailwind 入口
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── DEVELOPMENT.md           # 本文档
```

---

## 7. UI 设计规范

### 7.1 配色方案
- **主色**：`#6366F1`（Indigo 500）— 代表理财、信任
- **成功色**：`#22C55E`（Green 500）— 收入
- **警告色**：`#F59E0B`（Amber 500）— 预算接近
- **危险色**：`#EF4444`（Red 500）— 支出
- **背景色**：`#F8FAFC`（亮色）/ `#0F172A`（暗色）

### 7.2 布局
- **桌面端**：左侧固定侧边栏（200px）+ 右侧内容区
- **移动端**：底部 Tab 导航栏，响应式适配
- **内容区最大宽度**：1200px，居中显示

### 7.3 组件风格
- 圆角：`rounded-lg`（8px）
- 阴影：`shadow-sm` 卡片阴影
- 间距：统一使用 4px 倍数网格
- 动画：页面切换 fade，列表增删 slide

---

## 8. 开发计划（分阶段）

### Phase 1：项目基建（1-2天）
- [x] 编写开发文档
- [ ] 初始化 Vite + React + TypeScript 项目
- [ ] 配置 TailwindCSS + shadcn/ui
- [ ] 搭建路由与页面布局（侧边栏 + 底部导航）
- [ ] 定义 TypeScript 类型
- [ ] 实现 LocalStorage 存储封装
- [ ] 创建 Zustand Store 基础框架

### Phase 2：核心记账（2-3天）
- [ ] 分类管理（预设 + 自定义）
- [ ] 新增记账表单（金额/类型/分类/日期/备注）
- [ ] 收支列表页（列表展示 + 筛选 + 搜索）
- [ ] 编辑与删除记录
- [ ] 金额格式化与输入校验

### Phase 3：攒钱目标（2天）
- [ ] 目标列表页（卡片展示 + 进度条）
- [ ] 新建目标表单
- [ ] 目标详情页（存入/取出操作 + 历史记录）
- [ ] 目标状态管理（完成/放弃）
- [ ] 到期提醒逻辑

### Phase 4：数据分析（2-3天）
- [ ] 仪表盘页面（概览卡片 + 近期流水 + 预算进度）
- [ ] 月度/年度报表（折线图 + 柱状图）
- [ ] 分类消费占比（饼图）
- [ ] 预算对比分析
- [ ] 消费趋势图表

### Phase 5：完善与优化（1-2天）
- [ ] 设置页面（预算/主题/分类管理）
- [ ] 数据导出 CSV
- [ ] 数据导入 CSV
- [ ] 暗色模式
- [ ] 移动端响应式适配
- [ ] 空状态提示与引导

### Phase 6（V2.0 规划）：后端扩展
- [ ] 接入后端 API（Node.js + Express）
- [ ] 数据库迁移（SQLite / PostgreSQL）
- [ ] 用户注册登录（JWT）
- [ ] 云端数据同步
- [ ] 多设备支持

---

## 9. V2.0 扩展预留

为后续多用户扩展，V1.0 设计时预留以下接口：

1. **Store 层抽象**：Zustand Store 的数据读写通过统一的 `storage.ts` 封装，V2.0 时只需将实现从 LocalStorage 切换为 API 调用
2. **数据模型预留 userId 字段**：类型定义中可选的 `userId?: string`
3. **API 层预留**：`src/api/` 目录预留，V2.0 时添加 axios 请求封装

---

## 10. 注意事项

1. **LocalStorage 容量限制**：约 5-10MB，大量数据时需提醒用户导出备份
2. **数据安全**：本地数据清除浏览器缓存会丢失，需在设置中突出导出功能
3. **金额精度**：使用整数存储（分），展示时除以 100，避免浮点精度问题
4. **ID 生成**：使用 `crypto.randomUUID()` 生成唯一 ID
5. **响应式**：优先桌面端体验，移动端作为适配目标
