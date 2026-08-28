import React, { useState } from 'react';
import {
  FileBarChart,
  Search,
  Building2,
  Calendar,
  Printer,
  FileText,
  DollarSign,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';

interface SupplierSituationsProps {
  onOpenStatement: (supplier: Supplier) => void;
}

export const SupplierSituations: React.FC<SupplierSituationsProps> = ({
  onOpenStatement
}) => {
  const {
    suppliers,
    purchases,
    payments,
    formatCurrency,
    formatDate
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'creditors' | 'settled'>('all');

  // Compute metrics for each supplier
  const supplierStats = suppliers.map(sup => {
    const supPurchases = purchases.filter(p => p.supplierId === sup.id);
    const supPayments = payments.filter(p => p.partyId === sup.id);
    
    const totalPurchasesAmount = supPurchases.reduce((sum, p) => sum + p.totalAmount, 0) || sup.totalSupplied || sup.totalOrders || 0;
    const totalPaidAmount = supPurchases.reduce((sum, p) => sum + p.paidAmount, 0) + supPayments.reduce((sum, pay) => sum + pay.amount, 0);
    const commercialDebt = (sup.currentBalance !== undefined ? sup.currentBalance : sup.currentDebt) || 0;
    const personalDebt = sup.personalDebt || 0;
    const totalNetOwed = commercialDebt + personalDebt;

    return {
      supplier: sup,
      totalPurchasesAmount,
      totalPaidAmount,
      commercialDebt,
      personalDebt,
      totalNetOwed,
      purchasesCount: supPurchases.length,
      lastTransactionDate: supPurchases[0]?.date || sup.createdAt
    };
  });

  const filteredStats = supplierStats.filter(st => {
    const matchesSearch =
      st.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (st.supplier.company && st.supplier.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      st.supplier.phone.includes(searchTerm);

    if (filterType === 'creditors') return matchesSearch && st.totalNetOwed > 0;
    if (filterType === 'settled') return matchesSearch && st.totalNetOwed <= 0;
    return matchesSearch;
  });

  const grandTotalPurchases = supplierStats.reduce((sum, s) => sum + s.totalPurchasesAmount, 0);
  const grandTotalDebt = supplierStats.reduce((sum, s) => sum + s.totalNetOwed, 0);
  const totalCreditorsCount = supplierStats.filter(s => s.totalNetOwed > 0).length;

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">إجمالي حجم المشتريات والتوريدات</span>
            <div className="text-xl font-bold text-blue-600 font-mono-numbers mt-0.5">
              {formatCurrency(grandTotalPurchases)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">من كافة الموردين المسجلين</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">صافي إجمالي ديون الموردين (علينا)</span>
            <div className="text-xl font-bold text-rose-600 font-mono-numbers mt-0.5">
              {formatCurrency(grandTotalDebt)}
            </div>
            <p className="text-[10px] text-rose-500 font-semibold mt-0.5">{totalCreditorsCount} مورد لديهم رصيد دائن</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">طباعة وضعية الموردين العامة</span>
            <button
              onClick={() => window.print()}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة تقرير الوضعية</span>
            </button>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <FileBarChart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المورد أو الشركة في جدول الوضعية..."
            className="w-full pl-3 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-700">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterType === 'all' ? 'bg-white shadow-2xs font-bold text-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            جميع الموردين ({supplierStats.length})
          </button>
          <button
            onClick={() => setFilterType('creditors')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterType === 'creditors' ? 'bg-white shadow-2xs font-bold text-rose-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            عليهم ديون مستحقة ({totalCreditorsCount})
          </button>
          <button
            onClick={() => setFilterType('settled')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterType === 'settled' ? 'bg-white shadow-2xs font-bold text-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            حسابات مسددة ({supplierStats.length - totalCreditorsCount})
          </button>
        </div>
      </div>

      {/* Global Situation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>جدول الوضعية المالية وحالة حسابات الموردين (Situation Globale)</span>
          <span className="text-slate-400 font-normal">عدد الحسابات: {filteredStats.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">المورد / المؤسسة</th>
                <th className="p-3">الهاتف</th>
                <th className="p-3 text-center">إجمالي المشتريات</th>
                <th className="p-3 text-center">الدين التجاري</th>
                <th className="p-3 text-center">الدين الشخصي</th>
                <th className="p-3 text-center">صافي الرصيد المستحق</th>
                <th className="p-3 text-center">الحالة المالية</th>
                <th className="p-3 text-center">كشف الحساب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileBarChart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد حسابات مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filteredStats.map(st => (
                  <tr key={st.supplier.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-sm">{st.supplier.name}</div>
                      <div className="text-[11px] text-slate-400">{st.supplier.company || 'مؤسسة تجارية'}</div>
                    </td>
                    <td className="p-3 font-mono-numbers text-slate-600">
                      {st.supplier.phone}
                    </td>
                    <td className="p-3 text-center font-bold font-mono-numbers text-slate-800">
                      {formatCurrency(st.totalPurchasesAmount)}
                    </td>
                    <td className="p-3 text-center font-mono-numbers">
                      {st.commercialDebt > 0 ? (
                        <span className="text-rose-600 font-bold">{formatCurrency(st.commercialDebt)}</span>
                      ) : (
                        <span className="text-slate-400">0.00 د.ج</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono-numbers">
                      {st.personalDebt > 0 ? (
                        <span className="text-amber-600 font-bold">{formatCurrency(st.personalDebt)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold font-mono-numbers text-sm">
                      {st.totalNetOwed > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          {formatCurrency(st.totalNetOwed)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs">
                          <CheckCircle2 className="w-3 h-3" /> مسدد 100%
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {st.totalNetOwed > 0 ? (
                        <span className="text-[10px] text-rose-600 font-bold">مستحق السداد</span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold">حساب نظيف</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenStatement(st.supplier)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>كشف تفصيلي</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td colSpan={2} className="p-3 text-left font-black">المجموع الإجمالي العام:</td>
                <td className="p-3 text-center font-mono-numbers font-black text-blue-700">
                  {formatCurrency(grandTotalPurchases)}
                </td>
                <td className="p-3 text-center font-mono-numbers font-black text-rose-700" colSpan={3}>
                  صافي الديون المستحقة: {formatCurrency(grandTotalDebt)}
                </td>
                <td colSpan={2} className="p-3 text-center text-xs text-slate-500">
                  {totalCreditorsCount} حسابات دائنة
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
