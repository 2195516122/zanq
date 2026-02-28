import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Target,
  BarChart3,
  Settings,
  CalendarDays,
  Heart,
  Trophy,
  MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import UndoToast from './UndoToast';

const mainNavItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/transactions', icon: Receipt, label: '记账' },
  { to: '/goals', icon: Target, label: '攒钱' },
  { to: '/analytics', icon: BarChart3, label: '分析' },
];

const extraNavItems = [
  { to: '/calendar', icon: CalendarDays, label: '日历' },
  { to: '/wishlist', icon: Heart, label: '心愿单' },
  { to: '/achievements', icon: Trophy, label: '成就' },
  { to: '/settings', icon: Settings, label: '设置' },
];

const mobileNavItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/transactions', icon: Receipt, label: '记账' },
  { to: '/goals', icon: Target, label: '攒钱' },
  { to: '/analytics', icon: BarChart3, label: '分析' },
  { to: '/more', icon: MoreHorizontal, label: '更多' },
];

export default function Layout() {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const renderNavLink = (item: typeof mainNavItems[0]) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200'
        }`
      }
    >
      <item.icon className="h-[18px] w-[18px] transition-transform group-hover:scale-110" />
      {item.label}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 桌面端侧边栏 */}
      <aside className="hidden w-60 flex-shrink-0 bg-white dark:bg-slate-900 md:flex md:flex-col border-r border-slate-200/80 dark:border-slate-800">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-sm shadow-md shadow-primary-500/30">
            攒
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">攒前</span>
            <p className="text-[10px] text-slate-400 -mt-0.5">ZanQian</p>
          </div>
        </div>

        {/* 导航 */}
        <nav className="mt-4 flex-1 px-4 space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">主要</p>
          {mainNavItems.map(renderNavLink)}
          <div className="my-3" />
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">更多</p>
          {extraNavItems.map(renderNavLink)}
        </nav>

        {/* 底部装饰 */}
        <div className="p-4">
          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-3 dark:from-primary-500/10 dark:to-primary-500/5">
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">攒前 v2.0</p>
            <p className="mt-0.5 text-[10px] text-primary-500/70 dark:text-primary-400/60">数据安全存于本地</p>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto pb-20 md:pb-8">
        <div className="page-enter mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* 移动端底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-200/80 dark:bg-slate-900/80 dark:border-slate-800 md:hidden">
        {/* 更多菜单弹出层 */}
        {showMoreMenu && (
          <>
            <div className="fixed inset-0 z-[-1]" onClick={() => setShowMoreMenu(false)} />
            <div className="absolute bottom-full left-0 right-0 bg-white/95 backdrop-blur-xl p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] rounded-t-2xl dark:bg-slate-900/95">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="grid grid-cols-4 gap-3">
                {extraNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowMoreMenu(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-all ${
                        isActive ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="flex items-stretch">
          {mobileNavItems.map((item) =>
            item.to === '/more' ? (
              <button
                key="more"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-all ${
                  showMoreMenu ? 'text-primary-600' : 'text-slate-400'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setShowMoreMenu(false)}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-all ${
                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                  }`
                }
              >
                <div className={`rounded-lg p-1 transition-all ${item.to !== '/more' ? '' : ''}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                {item.label}
              </NavLink>
            )
          )}
        </div>
      </nav>

      <UndoToast />
    </div>
  );
}
