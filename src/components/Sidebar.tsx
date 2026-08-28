import React from 'react';
import {
  Layers,
  ShoppingCart,
  ShoppingBag,
  Users,
  Briefcase,
  BarChart2,
  Coins,
  Wrench,
  Navigation,
  User
} from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, financialSummary, dbStats, currentUser, setIsAuthModalOpen, logout } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: 'inventory',
      label: 'البضائع',
      icon: Layers,
      badge: (financialSummary?.lowStockCount || 0) + (financialSummary?.outOfStockCount || 0)
    },
    { id: 'pos', label: 'المبيعات', icon: ShoppingCart },
    { id: 'purchases', label: 'المشتريات', icon: ShoppingBag },
    {
      id: 'customers',
      label: 'الزبائن',
      icon: Users,
    },
    { id: 'suppliers', label: 'التجار', icon: Briefcase },
    { id: 'stock_logs', label: 'حالة المخزون', icon: BarChart2 },
    { id: 'reports', label: 'الصندوق النقدي', icon: Coins },
    { id: 'database', label: 'تصليح', icon: Wrench, badge: dbStats?.totalRecords },
    { id: 'settings', label: 'معلومات', icon: Navigation },
  ];

  return (
    <aside className="w-20 md:w-24 bg-[#1b1c1e] text-white flex flex-col flex-shrink-0 h-full border-l border-neutral-800 select-none z-30 shadow-2xl justify-between">
      {/* Top User Profile Badge */}
      <div>
        <div
          onClick={() => setIsAuthModalOpen(true)}
          title={`حساب المدير: ${currentUser?.fullName || 'عبدو زين'}`}
          className="py-2.5 px-1 border-b border-neutral-800 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full border-2 border-slate-300 group-hover:border-red-500 flex items-center justify-center text-white mb-0.5 shadow-inner transition-colors">
            <User className="w-6 h-6 text-slate-200 group-hover:text-red-400 stroke-[1.8]" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-amber-400 truncate max-w-full px-1">
            {currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'عبدو'}
          </span>
        </div>

        {/* Vertical Menu Strip (Exact replica of Zin Stock right sidebar) */}
        <nav className="flex flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Match active state
            const isActive =
              activeTab === item.id ||
              (item.id === 'pos' && (activeTab === 'sales' || activeTab === 'dashboard'));
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full py-2.5 px-1 flex flex-col items-center justify-center gap-1 transition-all border-b border-neutral-800/80 relative cursor-pointer ${
                  isActive
                    ? 'bg-[#ba2638] text-white font-black shadow-md'
                    : 'text-neutral-300 hover:bg-neutral-800/90 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white stroke-[2.2]' : 'text-neutral-300 stroke-[1.8]'}`} />
                <span className={`text-[11px] leading-tight tracking-tight ${isActive ? 'font-black text-white' : 'font-semibold'}`}>
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`absolute top-1 left-1.5 text-[8px] font-bold px-1 rounded-full font-mono-numbers ${
                      isActive ? 'bg-white text-red-700' : 'bg-red-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer (الملف / 2026 / تسجيل الخروج) */}
      <div className="p-1 border-t border-neutral-800 bg-[#121315] text-center flex flex-col gap-1">
        <div className="text-[10px] text-neutral-400 font-bold">الملف</div>
        <div className="bg-white text-red-700 text-xs font-black py-0.5 px-1 rounded-xs font-mono">
          2026
        </div>
        <button
          type="button"
          onClick={logout}
          title="تسجيل الخروج والتبديل برقم هاتف آخر"
          className="text-[9px] text-slate-400 hover:text-red-400 py-1 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
        >
          خروج ↩
        </button>
      </div>
    </aside>
  );
};
