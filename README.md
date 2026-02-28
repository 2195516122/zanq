# 攒前 ZanQian

<p align="center">
  <strong>💰 轻量级个人攒钱与记账管理平台</strong>
</p>

<p align="center">
  纯前端 · 数据本地存储 · 无需后端 · 开箱即用
</p>

---

## ✨ 功能特性

### 📝 记账管理
- 快速记录收入/支出，支持多分类、多账户、多标签
- 自定义分类（支持在记账时直接新增）
- 记账模板 — 一键快速填充常用记账
- 周期性记账 — 自动生成重复性支出/收入（每天/周/月/年）
- 收支列表 — 搜索、筛选（类型/分类/账户/金额范围/日期）
- 快捷日期筛选（今天/本周/本月/近7天/近30天）
- 删除后支持撤销（Undo Toast）

### 🎯 攒钱目标
- 创建攒钱目标，设定金额和截止日期
- 存入/取出操作，完整操作历史记录
- 进度追踪（进度条 + 百分比 + 剩余天数）
- 目标状态管理（进行中/已完成/已放弃）

### 📊 数据分析
- 月度收支趋势折线图
- 月度收支对比柱状图
- 支出分类占比饼图
- 消费排行榜 TOP 10
- 日均消费 & 月底支出预测
- 环比上月 / 同比去年对比
- 分类预算进度对比

### 📅 账单日历
- 月视图日历，每日收支标记
- 点击日期查看当天流水明细

### 🏆 成就与打卡
- 每日打卡，连续打卡天数统计
- 10 个成就自动解锁（首笔记账、连续记账、攒钱里程碑等）

### 💝 心愿单
- 添加想买的东西，设置优先级
- 关联攒钱目标，跟踪心愿实现进度

### 💼 多账户管理
- 预设现金/微信/支付宝/银行卡
- 支持自定义添加新账户
- 记账时选择账户

### 🏷️ 标签系统
- 预设标签（可报销/AA/必要/冲动消费）
- 自定义标签（名称+颜色）
- 记账时可多选标签

### ⚙️ 设置
- 月度总预算 + 分类预算
- 亮色/暗色主题切换
- 记账提醒（浏览器通知）
- 数据导入/导出（JSON）
- 钱包管理、标签管理、周期性记账管理、模板管理
- PWA 支持 — 可安装为桌面/手机应用

---

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| [React 18](https://react.dev/) | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [TailwindCSS](https://tailwindcss.com/) | 原子化 CSS |
| [Zustand](https://zustand-demo.pmnd.rs/) | 状态管理 |
| [Recharts](https://recharts.org/) | 数据可视化图表 |
| [Lucide React](https://lucide.dev/) | 图标库 |
| [date-fns](https://date-fns.org/) | 日期处理 |
| LocalStorage | 本地数据持久化 |

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/2195516122/zanq.git
cd zanq

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 `http://localhost:5173` 即可使用。

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录下，可直接部署到任意静态服务器。

---

## 📁 项目结构

```
zanqian/
├── public/                  # 静态资源
│   ├── manifest.json        # PWA 清单
│   └── sw.js                # Service Worker
├── src/
│   ├── components/          # 通用组件
│   │   ├── Layout.tsx       # 页面布局（侧边栏+底栏）
│   │   └── UndoToast.tsx    # 撤销提示
│   ├── pages/               # 页面
│   │   ├── Dashboard.tsx    # 仪表盘
│   │   ├── TransactionList.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── GoalList.tsx
│   │   ├── GoalForm.tsx
│   │   ├── GoalDetail.tsx
│   │   ├── Analytics.tsx    # 数据分析
│   │   ├── Calendar.tsx     # 账单日历
│   │   ├── Wishlist.tsx     # 心愿单
│   │   ├── Achievements.tsx # 成就打卡
│   │   └── Settings.tsx     # 设置
│   ├── stores/              # Zustand 状态管理
│   │   ├── transactionStore.ts
│   │   ├── categoryStore.ts
│   │   ├── goalStore.ts
│   │   ├── settingsStore.ts
│   │   ├── walletStore.ts
│   │   ├── tagStore.ts
│   │   ├── recurringStore.ts
│   │   ├── templateStore.ts
│   │   ├── wishStore.ts
│   │   ├── achievementStore.ts
│   │   └── undoStore.ts
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   ├── App.tsx              # 路由配置
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── DEVELOPMENT.md           # 开发文档
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📸 界面预览

### 仪表盘
渐变英雄卡展示本月概览，收支统计小卡片，预算进度条，近期流水和攒钱目标摘要。

### 记账
居中大号金额输入，分类/账户/标签芯片选择器，支持自定义新分类，快捷模板一键填充。

### 数据分析
月度趋势折线图、收支对比柱状图、分类占比饼图、消费排行榜 TOP 10、日均消费预测、同比环比。

### 成就打卡
渐变打卡卡片，7天打卡状态，10个成就自动解锁。

---

## 📝 数据说明

- 所有数据存储在浏览器 **LocalStorage** 中
- 清除浏览器缓存会导致数据丢失
- 建议定期通过 **设置 → 导出数据** 备份
- 金额以 **分** 为单位存储，避免浮点精度问题

---

## 📄 License

MIT
