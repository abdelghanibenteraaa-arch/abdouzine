import React from 'react';
import {
  ShoppingCart,
  Receipt,
  Users,
  Building2,
  Settings,
  RotateCcw,
  Coins,
  ArrowRightLeft,
  Calendar,
  Home,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MainSalesMenu: React.FC = () => {
  const { setActiveTab, financialSummary, sales, formatCurrency } = useApp();

  const menuItems = [
    // Row 1
    {
      id: 'customers',
      title: 'الزبائن',
      color: 'from-[#1e2024] to-[#0f1012] border-slate-700/80 hover:border-slate-500',
      textColor: 'text-white',
      badgeColor: 'bg-slate-700',
      icon: Users,
      action: () => setActiveTab('customers')
    },
    {
      id: 'suppliers',
      title: 'الموردين',
      color: 'from-[#681919] to-[#450e0e] border-red-900/60 hover:border-red-600',
      textColor: 'text-white',
      badgeColor: 'bg-red-800',
      icon: Building2,
      action: () => setActiveTab('suppliers')
    },
    {
      id: 'pos',
      title: 'البيع السريع',
      color: 'from-[#3c2356] to-[#251338] border-purple-900/60 hover:border-purple-600',
      textColor: 'text-white',
      badgeColor: 'bg-purple-800',
      icon: ShoppingCart,
      action: () => setActiveTab('pos')
    },

    // Row 2
    {
      id: 'customer_settlements',
      title: 'تسويات الزبون',
      color: 'from-[#2b9066] to-[#1d6b4a] border-emerald-700/60 hover:border-emerald-500',
      textColor: 'text-white',
      badgeColor: 'bg-emerald-800',
      icon: Coins,
      action: () => setActiveTab('customers')
    },
    {
      id: 'supplier_settlements',
      title: 'تسويات الموردين',
      color: 'from-[#a22312] to-[#781406] border-red-800/60 hover:border-red-500',
      textColor: 'text-white',
      badgeColor: 'bg-red-900',
      icon: ArrowRightLeft,
      action: () => setActiveTab('suppliers')
    },
    {
      id: 'purchases',
      title: 'المشتريات',
      color: 'from-[#652077] to-[#481357] border-fuchsia-900/60 hover:border-fuchsia-600',
      textColor: 'text-white',
      badgeColor: 'bg-fuchsia-800',
      icon: Receipt,
      action: () => setActiveTab('purchases')
    },

    // Row 3
    {
      id: 'customer_returns',
      title: 'إرجاع الزبائن',
      color: 'from-[#eb6b5b] to-[#c74c3d] border-rose-500/60 hover:border-rose-400',
      textColor: 'text-white',
      badgeColor: 'bg-rose-700',
      icon: RotateCcw,
      action: () => setActiveTab('sales')
    },
    {
      id: 'supplier_returns',
      title: 'إرجاع الموردين',
      color: 'from-[#22678f] to-[#154664] border-sky-800/60 hover:border-sky-500',
      textColor: 'text-white',
      badgeColor: 'bg-sky-900',
      icon: RotateCcw,
      action: () => setActiveTab('purchases')
    },
    {
      id: 'settings',
      title: 'إعدادات عامة',
      color: 'from-[#9b26b6] to-[#711686] border-purple-700/60 hover:border-purple-400',
      textColor: 'text-white',
      badgeColor: 'bg-purple-900',
      icon: Settings,
      action: () => setActiveTab('settings')
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] select-none overflow-y-auto font-sans">
      
      {/* Top Banner: Solid Dark Bar with "القائمة الرئيسية" and Home Icon */}
      <div className="bg-gradient-to-r from-[#2c333e] via-[#3a4452] to-[#2c333e] text-white px-5 py-2.5 shadow-md flex items-center justify-between border-b-2 border-red-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <PieChart className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base font-black text-amber-400 tracking-wide">القائمة الرئيسية</span>
          <div className="w-7 h-7 rounded-sm bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Home className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Content Area (Two Columns: Left Branding & Calendar | Right 3x3 Grid of 9 Tiles) */}
      <div className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row items-center justify-center gap-6 max-w-6xl mx-auto w-full">
        
        {/* LEFT COLUMN: Circular Logo & Mini Calendar matching screenshot */}
        <div className="w-full lg:w-72 flex flex-col items-center justify-between gap-6 shrink-0">
          
          {/* Abdou Zin Round Logo */}
          <div className="w-52 h-52 md:w-60 md:h-60 rounded-full bg-white border-[5px] border-red-600 shadow-2xl flex flex-col items-center justify-center p-4 relative group hover:scale-105 transition-transform select-none">
            <div className="text-center flex flex-col items-center justify-center">
              {/* Primary Arabic Name: عبدو زين */}
              <div className="text-3xl md:text-4xl font-black text-red-600 font-sans tracking-tight mb-0.5">
                عبدو زين
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg md:text-xl font-black text-slate-900 font-sans">Abdou</span>
                <span className="text-lg md:text-xl font-black text-red-600 font-sans">Zin</span>
              </div>
              <div className="text-[11px] md:text-xs font-black text-slate-700 tracking-wider mt-0.5 uppercase">
                Tech Solution
              </div>
            </div>
            <div className="absolute -bottom-2.5 bg-neutral-900 text-amber-400 text-[10px] font-black px-3.5 py-0.5 rounded-full border-2 border-red-600 shadow-md">
              COMMERCIAL V2026
            </div>
          </div>

          {/* Mini French Calendar (Février / Août as in Zin Stock screenshot) */}
          <div className="w-full max-w-[240px] bg-neutral-900/90 text-white rounded-lg p-2.5 shadow-2xl border border-neutral-700 text-xs font-mono select-none" dir="ltr">
            <div className="flex items-center justify-between font-bold text-[11px] pb-1 border-b border-neutral-700 text-slate-300">
              <span className="cursor-pointer hover:text-white">‹</span>
              <span>août 2026</span>
              <span className="cursor-pointer hover:text-white">›</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[9px] text-center text-slate-400 font-semibold mt-1.5 pb-1">
              <span>dim</span>
              <span>sam</span>
              <span>ven</span>
              <span>jeu</span>
              <span>mer</span>
              <span>mar</span>
              <span>lun</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-slate-300 font-mono-numbers">
              <span className="text-slate-600">26</span>
              <span className="text-slate-600">27</span>
              <span className="text-slate-600">28</span>
              <span className="text-slate-600">29</span>
              <span className="text-slate-600">30</span>
              <span className="text-slate-600">31</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
              <span>13</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>20</span>
              <span className="bg-red-600 text-white font-black rounded-full w-5 h-5 flex items-center justify-center mx-auto shadow-xs">21</span>
              <span>22</span>
              <span>23</span>
              <span>24</span>
              <span>25</span>
              <span>26</span>
              <span>27</span>
              <span>28</span>
              <span>29</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: 3x3 Grid of 9 Rounded Rectangular Tiles */}
        <div className="flex-1 w-full max-w-2xl">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className={`bg-gradient-to-br ${item.color} rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center gap-2 md:gap-3 border-2 shadow-lg hover:shadow-2xl transition-all duration-150 transform hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer min-h-[110px] sm:min-h-[125px]`}
                >
                  {/* Tile Icon with clean circular border or glow */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[1.8]" />
                  </div>

                  {/* Tile Title */}
                  <span className="text-xs sm:text-sm font-black text-white text-center leading-tight tracking-tight drop-shadow-sm">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
