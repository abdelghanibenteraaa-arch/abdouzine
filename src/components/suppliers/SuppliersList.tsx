import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Trash2,
  CheckCircle2,
  Ban,
  Filter,
  Printer,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { api } from '../../services/api';

interface SuppliersListProps {
  onOpenStatement: (supplier: Supplier) => void;
  onOpenSettlement: (supplier: Supplier) => void;
  onOpenReturn: (supplier: Supplier) => void;
}

export const SuppliersList: React.FC<SuppliersListProps> = ({
  onOpenStatement,
  onOpenSettlement,
  onOpenReturn
}) => {
  const {
    suppliers,
    formatCurrency,
    setIsAddSupplierOpen,
    refreshData,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDebt, setFilterDebt] = useState<'all' | 'with_debt' | 'zero_debt'>('all');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Exclude suspended suppliers in active list
  const activeSuppliers = suppliers.filter(s => !s.isSuspended);

  const filteredSuppliers = activeSuppliers.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.company && s.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.phone.includes(searchTerm) ||
      (s.taxNumber && s.taxNumber.includes(searchTerm));

    const balance = (s.currentBalance !== undefined ? s.currentBalance : s.currentDebt) || 0;
    if (filterDebt === 'with_debt') return matchesSearch && balance > 0;
    if (filterDebt === 'zero_debt') return matchesSearch && balance <= 0;
    return matchesSearch;
  });

  const totalOwed = activeSuppliers.reduce(
    (sum, s) => sum + ((s.currentBalance !== undefined ? s.currentBalance : s.currentDebt) || 0),
    0
  );
  const totalPurchasesAll = activeSuppliers.reduce((sum, s) => sum + (s.totalSupplied || s.totalOrders || 0), 0);

  const handleToggleSuspend = async (supplier: Supplier) => {
    if (!window.confirm(`هل أنت متأكد من توقيف/تجميد التعامل مع المورد "${supplier.name}" مؤقتاً؟`)) return;
    try {
      await api.updateSupplier(supplier.id, { isSuspended: true });
      addToast(`تم تحويل المورد "${supplier.name}" إلى قائمة الموردين الموقوفين`, 'info');
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'فشل في تعديل حالة المورد', 'error');
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المورد "${name}" نهائياً؟`)) return;
    try {
      await api.deleteSupplier(id);
      addToast(`تم حذف المورد "${name}"`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'فشل في حذف المورد', 'error');
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    try {
      await api.updateSupplier(editingSupplier.id, editingSupplier);
      addToast('تم تحديث بيانات المورد بنجاح', 'success');
      setEditingSupplier(null);
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'فشل في تحديث بيانات المورد', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header & Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">الموردين النشطين</span>
            <div className="text-xl font-bold text-slate-800 font-mono-numbers mt-0.5">
              {activeSuppliers.length} مورد
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">حجم التوريدات الإجمالي</span>
            <div className="text-xl font-bold text-blue-600 font-mono-numbers mt-0.5">
              {formatCurrency(totalPurchasesAll)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">إجمالي ديون الموردين (علينا)</span>
            <div className="text-xl font-bold text-rose-600 font-mono-numbers mt-0.5">
              {formatCurrency(totalOwed)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المورد، اسم الشركة، رقم الهاتف، أو الرقم الجبائي..."
            className="w-full pl-3 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-700">
            <button
              onClick={() => setFilterDebt('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterDebt === 'all' ? 'bg-white shadow-2xs font-bold text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              الكل ({activeSuppliers.length})
            </button>
            <button
              onClick={() => setFilterDebt('with_debt')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterDebt === 'with_debt' ? 'bg-white shadow-2xs font-bold text-rose-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              عليهم ديون ({activeSuppliers.filter(s => (s.currentBalance || s.currentDebt || 0) > 0).length})
            </button>
            <button
              onClick={() => setFilterDebt('zero_debt')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterDebt === 'zero_debt' ? 'bg-white shadow-2xs font-bold text-emerald-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              مسددين بالكامل ({activeSuppliers.filter(s => ((s.currentBalance || s.currentDebt) || 0) <= 0).length})
            </button>
          </div>

          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مورد جديد</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">اسم المورد</th>
                <th className="p-3">الشركة / المؤسسة</th>
                <th className="p-3">رقم الهاتف</th>
                <th className="p-3">العنوان / المنطقة</th>
                <th className="p-3 text-center">إجمالي التوريدات</th>
                <th className="p-3 text-center">الرصيد المستحق (الدين)</th>
                <th className="p-3 text-center">كشف الحساب</th>
                <th className="p-3 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    لا يوجد موردون مطابقون لمعايير البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(sup => {
                  const debt = (sup.currentBalance !== undefined ? sup.currentBalance : sup.currentDebt) || 0;
                  return (
                    <tr key={sup.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-sm">{sup.name}</div>
                        {sup.taxNumber && (
                          <div className="text-[10px] text-slate-400 font-mono-numbers">{sup.taxNumber}</div>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        {sup.company || '-'}
                      </td>
                      <td className="p-3 font-mono-numbers text-slate-700">
                        <a href={`tel:${sup.phone}`} className="hover:text-blue-600 inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {sup.phone}
                        </a>
                      </td>
                      <td className="p-3 text-slate-500">
                        {sup.address || '-'}
                      </td>
                      <td className="p-3 text-center font-bold font-mono-numbers text-slate-800">
                        {formatCurrency(sup.totalSupplied || sup.totalOrders || 0)}
                      </td>
                      <td className="p-3 text-center font-mono-numbers">
                        {debt > 0 ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                            {formatCurrency(debt)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> مسدد بالكامل
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onOpenStatement(sup)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all"
                          title="كشف حساب تفصيلي"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>كشف</span>
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenSettlement(sup)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-all"
                            title="تسوية ودفع دفعة"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingSupplier(sup)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all"
                            title="تعديل بيانات المورد"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(sup)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md transition-all"
                            title="توقيف المورد مؤقتاً"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all"
                            title="حذف المورد"
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

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                تعديل بيانات المورد: {editingSupplier.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateSupplier} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">اسم المورد / المسؤول *</label>
                  <input
                    type="text"
                    required
                    value={editingSupplier.name}
                    onChange={e => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">اسم الشركة / المؤسسة</label>
                  <input
                    type="text"
                    value={editingSupplier.company || ''}
                    onChange={e => setEditingSupplier({ ...editingSupplier, company: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={editingSupplier.phone}
                    onChange={e => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editingSupplier.email || ''}
                    onChange={e => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">الرقم الجبائي NIF / السجل</label>
                  <input
                    type="text"
                    value={editingSupplier.taxNumber || ''}
                    onChange={e => setEditingSupplier({ ...editingSupplier, taxNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">العنوان / المقر</label>
                  <input
                    type="text"
                    value={editingSupplier.address || ''}
                    onChange={e => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={editingSupplier.notes || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
