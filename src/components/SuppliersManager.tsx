import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  RotateCcw,
  Ban,
  Handshake,
  FileBarChart,
  ArrowRight,
  Plus,
  DollarSign,
  Building2,
  CheckCircle2,
  Sparkles,
  AlignJustify,
  User,
  MinusCircle,
  TrendingDown,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier } from '../types';
import { SuppliersList } from './suppliers/SuppliersList';
import { SupplierReturns } from './suppliers/SupplierReturns';
import { SupplierPersonalDebts } from './suppliers/SupplierPersonalDebts';
import { SuspendedSuppliers } from './suppliers/SuspendedSuppliers';
import { SupplierSettlements } from './suppliers/SupplierSettlements';
import { SupplierSituations } from './suppliers/SupplierSituations';
import { SupplierStatementModal } from './suppliers/SupplierStatementModal';

export type SupplierSubTab =
  | 'hub'
  | 'list'
  | 'returns'
  | 'personal_debt'
  | 'suspended'
  | 'settlement'
  | 'situations';

export const SuppliersManager: React.FC = () => {
  const {
    suppliers,
    formatCurrency,
    setIsAddSupplierOpen,
    setIsAddPaymentOpen
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<SupplierSubTab>('hub');
  const [statementSupplier, setStatementSupplier] = useState<Supplier | null>(null);
  const [targetSupplierForAction, setTargetSupplierForAction] = useState<Supplier | null>(null);

  // Statistics
  const activeSuppliersCount = suppliers.filter(s => !s.isSuspended).length;
  const suspendedCount = suppliers.filter(s => s.isSuspended).length;
  const totalDebt = suppliers.reduce((sum, s) => sum + ((s.currentBalance !== undefined ? s.currentBalance : s.currentDebt) || 0), 0);

  // Navigation tiles matching the 6 circular buttons in the uploaded image
  const hubTiles = [
    {
      id: 'list' as SupplierSubTab,
      title: 'قائمة الموردين',
      subtitle: 'دليل الموردين، الحسابات والبيانات',
      icon: (
        <div className="relative flex items-center justify-center">
          <User className="w-12 h-12 text-white stroke-[2.2]" />
          <span className="absolute -bottom-1 -left-1 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[11px] font-black shadow">
            🔑
          </span>
        </div>
      ),
      countBadge: `${activeSuppliersCount} مورد`
    },
    {
      id: 'returns' as SupplierSubTab,
      title: 'إرجاع',
      subtitle: 'وصولات إرجاع السلع التالفة والمنتهية',
      icon: (
        <div className="flex items-center justify-center relative">
          <Users className="w-12 h-12 text-white stroke-[2.2]" />
          <RotateCcw className="w-5 h-5 text-amber-300 absolute -top-1 -right-1" />
        </div>
      ),
      countBadge: 'وصولات الإرجاع'
    },
    {
      id: 'personal_debt' as SupplierSubTab,
      title: 'الدين الشخصي',
      subtitle: 'السلفيات والديون الشخصية غير التجارية',
      icon: (
        <div className="flex items-center justify-center">
          <Users className="w-12 h-12 text-white stroke-[2.2]" />
        </div>
      ),
      countBadge: 'ديون شخصية'
    },
    {
      id: 'suspended' as SupplierSubTab,
      title: 'الموردين الموقوفين',
      subtitle: 'الحسابات المجمدة وإلغاء التوقيف',
      icon: (
        <div className="flex items-center justify-center">
          <MinusCircle className="w-12 h-12 text-white stroke-[2.2]" />
        </div>
      ),
      countBadge: suspendedCount > 0 ? `${suspendedCount} موقوف` : 'لا يوجد'
    },
    {
      id: 'settlement' as SupplierSubTab,
      title: 'تسوية الموردين',
      subtitle: 'سداد الدفعات، الخصومات وإبراء الذمة',
      icon: (
        <div className="flex items-center justify-center">
          <Users className="w-12 h-12 text-white stroke-[2.2]" />
        </div>
      ),
      countBadge: 'سندات التسوية'
    },
    {
      id: 'situations' as SupplierSubTab,
      title: 'حالة الموردين',
      subtitle: 'الوضعية المالية الشاملة وكشوفات الحساب',
      icon: (
        <div className="flex items-center justify-center relative">
          <User className="w-12 h-12 text-white stroke-[2.2]" />
          <AlignJustify className="w-6 h-6 text-white absolute -bottom-1 -left-2 bg-neutral-900 rounded-sm" />
        </div>
      ),
      countBadge: 'كشف الوضعية'
    }
  ];

  const handleOpenSettlementForSupplier = (supplier: Supplier) => {
    setTargetSupplierForAction(supplier);
    setActiveSubTab('settlement');
  };

  const handleOpenReturnForSupplier = (supplier: Supplier) => {
    setTargetSupplierForAction(supplier);
    setActiveSubTab('returns');
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] select-none overflow-y-auto font-sans">
      {/* Top Banner Header (Dark Metallic Bar matching the uploaded screenshot) */}
      <div className="bg-gradient-to-b from-[#2a2b2f] via-[#1c1d20] to-[#121315] text-white px-6 py-3.5 shadow-md flex items-center justify-between border-b border-neutral-700 shrink-0">
        <div className="flex items-center gap-2">
          {activeSubTab !== 'hub' ? (
            <button
              onClick={() => {
                setActiveSubTab('hub');
                setTargetSupplierForAction(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all border border-neutral-600 shadow-xs cursor-pointer active:scale-95"
            >
              <ArrowRight className="w-4 h-4 text-amber-400" />
              <span>الرجوع للشاشة الرئيسية للموردين</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsAddPaymentOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>سند صرف لمورد</span>
              </button>
              <button
                onClick={() => setIsAddSupplierOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مورد جديد</span>
              </button>
            </>
          )}
        </div>

        {/* Title and Icon on Right matching screenshot */}
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
            {activeSubTab === 'hub' && 'تسيير الموردين'}
            {activeSubTab === 'list' && 'تسيير الموردين - قائمة الموردين'}
            {activeSubTab === 'returns' && 'تسيير الموردين - إرجاع السلع للموردين'}
            {activeSubTab === 'personal_debt' && 'تسيير الموردين - الدين الشخصي'}
            {activeSubTab === 'suspended' && 'تسيير الموردين - الموردين الموقوفين'}
            {activeSubTab === 'settlement' && 'تسيير الموردين - تسوية الموردين'}
            {activeSubTab === 'situations' && 'تسيير الموردين - حالة الموردين وكشوف الحساب'}
          </span>
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white shadow-inner">
            <User className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeSubTab === 'hub' ? (
          /* Hub Landing Screen: The 6 Circular Black Buttons matching the screenshot */
          <div className="flex flex-col items-center justify-center min-h-[520px] py-6 space-y-8 animate-in fade-in">
            {/* Quick Status Bar */}
            <div className="w-full max-w-4xl bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-slate-700">نظام إدارة الموردين المتكامل (Zin Stock)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-slate-600">
                  الموردين النشطين: <strong className="text-slate-900 font-mono-numbers">{activeSuppliersCount}</strong>
                </div>
                <div className="text-slate-600">
                  إجمالي الديون علينا: <strong className="text-rose-600 font-mono-numbers">{formatCurrency(totalDebt)}</strong>
                </div>
              </div>
            </div>

            {/* The 6 Iconic Circular Buttons (2 Rows x 3 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl w-full justify-items-center">
              {hubTiles.map(tile => (
                <div
                  key={tile.id}
                  onClick={() => setActiveSubTab(tile.id)}
                  className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-1.5 active:scale-95"
                >
                  {/* Large Black Circular Button with Glossy Bevel */}
                  <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-b from-[#2e3035] via-[#1a1b1e] to-[#0d0e10] border-4 border-[#3a3c42] group-hover:border-blue-500 shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/20 flex flex-col items-center justify-center p-4 text-center transition-all relative overflow-hidden">
                    {/* Inner glossy highlight reflection */}
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-full pointer-events-none"></div>

                    {/* Icon */}
                    <div className="mb-1 transform group-hover:scale-110 transition-transform duration-200">
                      {tile.icon}
                    </div>

                    {/* Button Text */}
                    <span className="text-white font-black text-sm md:text-base tracking-wide font-sans mt-0.5 drop-shadow-md">
                      {tile.title}
                    </span>
                  </div>

                  {/* Subtitle & Badge below circle */}
                  <span className="text-[11px] text-slate-500 font-semibold mt-2.5 text-center max-w-[150px] leading-tight">
                    {tile.subtitle}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Helper Tips */}
            <div className="text-center text-xs text-slate-400 pt-4">
              اضغط على أي زر دائري للانتقال الفوري للوحدة المعنية وإجراء المعاملات
            </div>
          </div>
        ) : (
          /* Sub-views */
          <div className="space-y-4 animate-in fade-in">
            {activeSubTab === 'list' && (
              <SuppliersList
                onOpenStatement={sup => setStatementSupplier(sup)}
                onOpenSettlement={handleOpenSettlementForSupplier}
                onOpenReturn={handleOpenReturnForSupplier}
              />
            )}

            {activeSubTab === 'returns' && (
              <SupplierReturns
                preselectedSupplier={targetSupplierForAction}
                onOpenStatement={sup => setStatementSupplier(sup)}
              />
            )}

            {activeSubTab === 'personal_debt' && (
              <SupplierPersonalDebts
                preselectedSupplier={targetSupplierForAction}
              />
            )}

            {activeSubTab === 'suspended' && (
              <SuspendedSuppliers
                onOpenStatement={sup => setStatementSupplier(sup)}
                onOpenSettlement={handleOpenSettlementForSupplier}
              />
            )}

            {activeSubTab === 'settlement' && (
              <SupplierSettlements
                preselectedSupplier={targetSupplierForAction}
                onOpenStatement={sup => setStatementSupplier(sup)}
              />
            )}

            {activeSubTab === 'situations' && (
              <SupplierSituations
                onOpenStatement={sup => setStatementSupplier(sup)}
              />
            )}
          </div>
        )}
      </div>

      {/* Supplier Statement Modal */}
      {statementSupplier && (
        <SupplierStatementModal
          supplier={statementSupplier}
          onClose={() => setStatementSupplier(null)}
        />
      )}
    </div>
  );
};
