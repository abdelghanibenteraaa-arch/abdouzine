import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  Wifi,
  Battery,
  LayoutGrid,
  ShoppingCart,
  Layers,
  Users,
  ShoppingBag,
  Settings,
  Camera,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WindowsTaskbar: React.FC = () => {
  const { activeTab, setActiveTab, financialSummary } = useApp();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setDateStr(`${day}/${month}/${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile Android Bottom Navigation Bar (Visible on mobile screens) */}
      <nav className="sm:hidden bg-[#121315] border-t border-neutral-800 text-white flex items-center justify-around py-1.5 px-1 z-40 shrink-0 select-none shadow-2xl" dir="rtl">
        <button
          type="button"
          onClick={() => setActiveTab('pos')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'pos' ? 'bg-[#ba2638] text-white font-black scale-105 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">الكاشير</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
            activeTab === 'inventory' ? 'bg-[#ba2638] text-white font-black scale-105 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">البضائع</span>
          {((financialSummary?.lowStockCount || 0) + (financialSummary?.outOfStockCount || 0) > 0) && (
            <span className="absolute -top-1 right-1 bg-red-600 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {(financialSummary?.lowStockCount || 0) + (financialSummary?.outOfStockCount || 0)}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'customers' ? 'bg-[#ba2638] text-white font-black scale-105 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">الزبائن</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('purchases')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'purchases' ? 'bg-[#ba2638] text-white font-black scale-105 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">المشتريات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'settings' ? 'bg-emerald-600 text-white font-black scale-105 shadow-md' : 'text-emerald-400 hover:text-emerald-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">تطبيق أندرويد</span>
        </button>
      </nav>

      {/* Desktop Windows 10 Taskbar (Visible on sm: screens and above) */}
      <footer className="hidden sm:flex bg-[#101214] text-white h-10 px-2 items-center justify-between z-30 select-none border-t border-neutral-800 text-xs shrink-0 font-sans" dir="ltr">
        
        {/* Left side: Windows Start Icon + Cortana Search Box + Pinned App Icons */}
        <div className="flex items-center gap-1.5 h-full">
          {/* Windows 10 Start Button */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="w-10 h-full flex items-center justify-center hover:bg-neutral-800 transition-colors text-slate-200 hover:text-white"
            title="Démarrer"
          >
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-white rounded-2xs"></div>
              <div className="bg-white rounded-2xs"></div>
              <div className="bg-white rounded-2xs"></div>
              <div className="bg-white rounded-2xs"></div>
            </div>
          </button>

          {/* Cortana / Search Box (Taper ici pour rechercher) */}
          <div className="hidden sm:flex items-center bg-[#23272a] hover:bg-[#2c3136] text-slate-300 h-8 px-3 rounded-xs text-xs border border-neutral-700/50 w-52 transition-colors cursor-text">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <span className="text-[11px] text-slate-400 truncate">Taper ici pour rechercher</span>
          </div>

          {/* Pinned Quick Launch Apps */}
          <div className="flex items-center gap-1 px-1">
            {/* File Explorer icon */}
            <div className="w-7 h-7 rounded hover:bg-neutral-800 flex items-center justify-center cursor-pointer" title="Explorateur de fichiers">
              <span className="text-sm">📁</span>
            </div>

            {/* Microsoft Edge */}
            <div className="w-7 h-7 rounded hover:bg-neutral-800 flex items-center justify-center cursor-pointer" title="Navigateur">
              <span className="text-sm">🌐</span>
            </div>

            {/* Store / Bag */}
            <div className="w-7 h-7 rounded hover:bg-neutral-800 flex items-center justify-center cursor-pointer" title="Boutique">
              <span className="text-sm">🛍️</span>
            </div>

            {/* Mail */}
            <div className="w-7 h-7 rounded hover:bg-neutral-800 flex items-center justify-center cursor-pointer" title="Courrier">
              <span className="text-sm">✉️</span>
            </div>

            {/* Abdou Zin Stock Pinned App Icon (Active highlight) */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="px-2 h-8 rounded bg-neutral-800 border-b-2 border-red-500 flex items-center justify-center cursor-pointer shadow-inner"
              title="عبدو زين ستوك - Gestion Commerciale"
            >
              <span className="text-[11px] font-black text-red-500 font-sans">عبدو زين</span>
            </div>
          </div>
        </div>

        {/* Right side: System Tray (Language, Battery, WiFi, Sound, Clock & Date) */}
        <div className="flex items-center gap-2.5 text-slate-300 px-1">
          <div className="flex items-center gap-2">
            <Battery className="w-3.5 h-3.5 text-slate-300 hidden md:inline" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <Volume2 className="w-3.5 h-3.5 text-slate-300" />
          </div>

          {/* Keyboard layout language (FRA) */}
          <span className="text-[11px] font-bold text-slate-200 px-1 border-l border-neutral-700">
            FRA
          </span>

          {/* Date & Time */}
          <div className="flex flex-col items-end leading-tight text-[10px] font-mono-numbers px-1 cursor-default text-slate-300">
            <span className="font-bold">{timeStr || '09:07'}</span>
            <span className="text-slate-400">{dateStr || '21/05/2026'}</span>
          </div>

          {/* Show desktop peek bar */}
          <div className="w-1.5 h-full border-l border-neutral-700 ml-1"></div>
        </div>

      </footer>
    </>
  );
};
