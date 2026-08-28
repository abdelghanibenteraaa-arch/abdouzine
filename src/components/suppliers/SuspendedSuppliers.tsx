import React, { useState } from 'react';
import {
  Ban,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  Trash2,
  DollarSign,
  FileText,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { api } from '../../services/api';

interface SuspendedSuppliersProps {
  onOpenStatement?: (supplier: Supplier) => void;
  onOpenSettlement?: (supplier: Supplier) => void;
}

export const SuspendedSuppliers: React.FC<SuspendedSuppliersProps> = ({
  onOpenStatement,
  onOpenSettlement
}) => {
  const {
    suppliers,
    formatCurrency,
    refreshData,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const suspendedSuppliers = suppliers.filter(s => s.isSuspended);

  const filteredSuppliers = suspendedSuppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.company && s.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.phone.includes(searchTerm)
  );

  const totalSuspendedDebt = suspendedSuppliers.reduce(
    (sum, s) => sum + ((s.currentBalance !== undefined ? s.currentBalance : s.currentDebt) || 0),
    0
  );

  const handleReactivateSupplier = async (supplier: Supplier) => {
    try {
      await api.updateSupplier(supplier.id, { isSuspended: false });
      addToast(`تم إلغاء تجميد المورد "${supplier.name}" وإعادته للقائمة النشطة بنجاح`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'فشل في إعادة تفعيل المورد', 'error');
    }
  };

  const handleDeletePermanent = async (supplier: Supplier) => {
    if (!window.confirm(`تحذير: هل أنت متأكد من حذف المورد "${supplier.name}" نهائياً من النظام؟`)) return;
    try {
      await api.deleteSupplier(supplier.id);
      addToast(`تم حذف المورد "${supplier.name}"`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'فشل في حذف المورد', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">عدد الموردين الموقوفين</span>
            <div className="text-xl font-bold text-slate-800 font-mono-numbers mt-0.5">
              {suspendedSuppliers.length} مورد موقوف
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold">
            <Ban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">الديون العالقة لدى الموقوفين</span>
            <div className="text-xl font-bold text-rose-600 font-mono-numbers mt-0.5">
              {formatCurrency(totalSuspendedDebt)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">حالة التعامل التجاري</span>
            <div className="text-xs font-bold text-amber-700 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>موقوف ومجمد مؤقتاً</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث في قائمة الموردين الموقوفين..."
            className="w-full pl-3 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>قائمة التجار والموردين الموقوفين / المجمدين</span>
          <span className="text-slate-400 font-normal">المجموع: {filteredSuppliers.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">اسم المورد</th>
                <th className="p-3">الشركة / المؤسسة</th>
                <th className="p-3">رقم الهاتف</th>
                <th className="p-3">العنوان</th>
                <th className="p-3 text-center">الرصيد العالق (له)</th>
                <th className="p-3 text-center">حالة التوقيف</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
                    لا يوجد أي موردين موقوفين حالياً. جميع الموردين في حالة نشطة.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(sup => {
                  const debt = (sup.currentBalance !== undefined ? sup.currentBalance : sup.currentDebt) || 0;
                  return (
                    <tr key={sup.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-3 font-bold text-slate-800">
                        {sup.name}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {sup.company || '-'}
                      </td>
                      <td className="p-3 font-mono-numbers text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {sup.phone}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {sup.address || '-'}
                      </td>
                      <td className="p-3 text-center font-bold font-mono-numbers">
                        {debt > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            {formatCurrency(debt)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">0.00 د.ج</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-bold border border-neutral-300 text-[10px]">
                          <Ban className="w-3 h-3 text-neutral-600" />
                          موقوف ومجمد
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleReactivateSupplier(sup)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all shadow-2xs"
                            title="إلغاء التوقيف وإعادة التفعيل"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إلغاء التوقيف</span>
                          </button>

                          {onOpenSettlement && debt > 0 && (
                            <button
                              onClick={() => onOpenSettlement(sup)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-all"
                              title="تسوية الرصيد العالق"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onOpenStatement && (
                            <button
                              onClick={() => onOpenStatement(sup)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all"
                              title="كشف حساب المورد"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeletePermanent(sup)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
