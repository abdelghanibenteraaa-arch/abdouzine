import React, { useState } from 'react';
import {
  Power,
  Minus,
  Menu,
  Bell,
  MessageSquare,
  Eye,
  UserCheck,
  User,
  Barcode,
  Database,
  Wrench,
  Lock,
  Home,
  ShoppingBag,
  Plus,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    products,
    refreshData,
    activeTab,
    setActiveTab,
    setIsAddProductOpen,
    setIsVideoGuideOpen,
    setIsAndroidModalOpen
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockAlert);

  const circularNavItems: {
    id: NavTab;
    title: string;
    bg: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', title: 'الرسائل والتنبيهات', bg: 'bg-[#0284c7] hover:bg-[#0369a1]', icon: MessageSquare },
    { id: 'pos', title: 'نقطة البيع والكاميرا', bg: 'bg-[#dc2626] hover:bg-[#b91c1c]', icon: Eye },
    { id: 'customers', title: 'تسيير الزبائن', bg: 'bg-[#ea580c] hover:bg-[#c2410c]', icon: UserCheck },
    { id: 'suppliers', title: 'تسيير التجار والموردين', bg: 'bg-[#0284c7] hover:bg-[#0369a1]', icon: User },
    { id: 'inventory', title: 'البضائع والباركود', bg: 'bg-[#4f46e5] hover:bg-[#4338ca]', icon: Barcode },
    { id: 'stock_logs', title: 'قاعدة البيانات والمخزون', bg: 'bg-[#0284c7] hover:bg-[#0369a1]', icon: Database },
    { id: 'database', title: 'التصليح والصيانة', bg: 'bg-[#0284c7] hover:bg-[#0369a1]', icon: Wrench },
    { id: 'reports', title: 'الصندوق والحماية', bg: 'bg-[#eab308] hover:bg-[#ca8a04]', icon: Lock },
    { id: 'dashboard', title: 'القائمة الرئيسية', bg: 'bg-[#10b981] hover:bg-[#059669]', icon: Home },
  ];

  return (
    <header className="bg-white border-b-2 border-slate-300 px-3 py-1 flex items-center justify-between z-20 select-none shadow-xs shrink-0">
      
      {/* LEFT: Window and Utility Controls (Exact matching Zin Stock top left) */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center border border-slate-400 rounded-sm bg-white overflow-hidden shadow-2xs">
          {/* Power off button */}
          <button
            onClick={() => {
              if (window.confirm('هل تريد إعادة تحميل وتحديث بيانات النظام؟')) {
                refreshData();
              }
            }}
            title="إعادة تشغيل وتحديث النظام"
            className="p-1.5 hover:bg-red-100 text-slate-800 hover:text-red-700 border-l border-slate-300 transition-colors"
          >
            <Power className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Minimize button */}
          <button
            onClick={() => setActiveTab('dashboard')}
            title="تصغير / القائمة الرئيسية"
            className="p-1.5 hover:bg-slate-100 text-slate-800 border-l border-slate-300 transition-colors"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Menu button */}
          <button
            onClick={() => setActiveTab('settings')}
            title="القائمة والإعدادات"
            className="p-1.5 hover:bg-slate-100 text-slate-800 border-l border-slate-300 transition-colors"
          >
            <Menu className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Notifications Bell with Counter Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="التنبيهات"
              className="p-1.5 hover:bg-slate-100 text-slate-800 flex items-center gap-1 transition-colors relative"
            >
              <Bell className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="bg-white border border-slate-400 text-slate-900 text-[10px] font-black px-1 rounded-xs font-mono-numbers">
                {lowStockProducts.length > 0 ? lowStockProducts.length : 2}
              </span>
            </button>

            {/* Notification popup */}
            {showNotifications && (
              <div
                className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-300 p-2 z-50 text-xs"
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div className="font-bold text-slate-800 pb-1 border-b border-slate-200 flex items-center justify-between">
                  <span>تنبيهات المخزون</span>
                  <span className="text-[10px] text-red-600 font-bold">{lowStockProducts.length} تنبيه</span>
                </div>
                {lowStockProducts.length === 0 ? (
                  <div className="p-3 text-center text-slate-500 text-[11px]">لا توجد نواقص في المخزون حالياً</div>
                ) : (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {lowStockProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveTab('inventory');
                        }}
                        className="py-1.5 px-1 hover:bg-red-50 cursor-pointer flex items-center justify-between"
                      >
                        <span className="truncate text-slate-800 font-medium">{p.name}</span>
                        <span className="text-[10px] font-bold text-red-600 font-mono-numbers">
                          باقي {p.currentStock} {p.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CENTER: 9 Circular Action Buttons with Gradient / Ring styling (Matching hq720 screenshot) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {circularNavItems.map((item, idx) => {
          const Icon = item.icon;
          const isCurrent = activeTab === item.id;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(item.id)}
              title={item.title}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${item.bg} text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs border border-white/70 ${
                isCurrent ? 'ring-2 ring-red-600 ring-offset-1 scale-105 shadow-md' : 'opacity-90 hover:opacity-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>
          );
        })}
      </div>

      {/* RIGHT: "عبدو زين ستوك" Logo with Shopping Bag, Video Guide, and Offline status */}
      <div className="flex items-center gap-2">
        {/* Android App Button */}
        <button
          type="button"
          onClick={() => setIsAndroidModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
          title="تحميل وتثبيت التطبيق على هاتف أندرويد (Android App)"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
          <span className="hidden sm:inline">تطبيق أندرويد 📱</span>
          <span className="sm:hidden">أندرويد</span>
        </button>

        {/* 11-Command Video Guide Button */}
        <button
          type="button"
          onClick={() => setIsVideoGuideOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-lg text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 animate-pulse"
          title="دليل الأوامر الـ 11 وشروحات الفيديو"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">دليل الأوامر (11)</span>
          <span className="sm:hidden">الدليل</span>
        </button>

        <div className="hidden lg:flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>100% Offline</span>
        </div>

        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="relative flex items-center">
            <ShoppingBag className="w-5 h-5 text-red-600 fill-red-600/10 stroke-[2.2]" />
            <span className="text-sm font-black text-slate-900 font-sans mr-1">ستوك</span>
            <span className="text-sm font-black text-red-600 font-sans">عبدو زين</span>
          </div>
        </div>
      </div>

    </header>
  );
};
