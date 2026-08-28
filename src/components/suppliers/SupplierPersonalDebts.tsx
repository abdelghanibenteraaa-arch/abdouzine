import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  DollarSign,
  Calendar,
  CheckCircle2,
  Trash2,
  FileText,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier, SupplierPersonalDebt } from '../../types';
import { api } from '../../services/api';

interface SupplierPersonalDebtsProps {
  preselectedSupplier?: Supplier | null;
}

export const SupplierPersonalDebts: React.FC<SupplierPersonalDebtsProps> = ({
  preselectedSupplier
}) => {
  const {
    suppliers,
    formatCurrency,
    formatDate,
    refreshData,
    addToast
  } = useApp();

  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(preselectedSupplier?.id || (suppliers[0]?.id || ''));
  const [debtType, setDebtType] = useState<'borrow' | 'repay'>('borrow');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Local storage for personal debts
  const [debtsList, setDebtsList] = useState<SupplierPersonalDebt[]>(() => {
    try {
      const saved = localStorage.getItem('zin_supplier_personal_debts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'pdebt-1',
        supplierId: 'sup-1',
        supplierName: 'شركة سيفيتال للصناعات الغذائية (Cevital)',
        amount: 25000,
        date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        type: 'borrow',
        notes: 'سلفة نقدية شخصية طارئة خاصة بالمحل',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 'pdebt-2',
        supplierId: 'sup-1',
        supplierName: 'شركة سيفيتال للصناعات الغذائية (Cevital)',
        amount: 10000,
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        type: 'repay',
        notes: 'سداد دفعة أولى من السلفة النقدية',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];
  });

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // Compute total net personal debt across all suppliers
  const totalPersonalDebtBalance = debtsList.reduce((acc, d) => {
    if (d.type === 'borrow') return acc + d.amount;
    if (d.type === 'repay') return acc - d.amount;
    return acc;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) {
      addToast('يرجى اختيار المورد', 'error');
      return;
    }
    if (amount <= 0) {
      addToast('يرجى إدخال مبلغ صحيح', 'error');
      return;
    }

    const newRecord: SupplierPersonalDebt = {
      id: 'pdebt-' + Date.now(),
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      amount: Number(amount),
      date,
      type: debtType,
      notes,
      createdAt: new Date().toISOString()
    };

    // Calculate new personal debt balance for this supplier
    const existingSupplierPersonalDebts = debtsList.filter(d => d.supplierId === selectedSupplier.id);
    let newSupplierPersonalDebt = existingSupplierPersonalDebts.reduce((acc, d) => {
      return d.type === 'borrow' ? acc + d.amount : acc - d.amount;
    }, 0);
    if (debtType === 'borrow') newSupplierPersonalDebt += Number(amount);
    else newSupplierPersonalDebt -= Number(amount);

    // Save to supplier profile
    try {
      await api.updateSupplier(selectedSupplier.id, {
        personalDebt: Math.max(0, newSupplierPersonalDebt)
      });
    } catch (e) {
      console.warn(e);
    }

    const updated = [newRecord, ...debtsList];
    setDebtsList(updated);
    try {
      localStorage.setItem('zin_supplier_personal_debts', JSON.stringify(updated));
    } catch {}

    addToast(
      debtType === 'borrow'
        ? `تم تسجيل استدانة شخصية بمبلغ ${formatCurrency(amount)} من المورد "${selectedSupplier.name}"`
        : `تم تسجيل سداد دفعة دين شخصي بمبلغ ${formatCurrency(amount)} للمورد "${selectedSupplier.name}"`,
      'success'
    );

    setIsAddingDebt(false);
    setAmount(0);
    setNotes('');
    await refreshData();
  };

  const filteredDebts = debtsList.filter(d =>
    d.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.notes && d.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">صافي الدين الشخصي الإجمالي</span>
            <div className="text-xl font-bold text-amber-600 font-mono-numbers mt-0.5">
              {formatCurrency(totalPersonalDebtBalance)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">منفصل عن فواتير السلع والمشتريات</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">إجمالي المعاملات الشخصية</span>
            <div className="text-xl font-bold text-slate-800 font-mono-numbers mt-0.5">
              {debtsList.length} حركة مسجلة
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">تسجيل حركة جديدة</span>
            <button
              onClick={() => setIsAddingDebt(true)}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة دين / سداد شخصي</span>
            </button>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Form Drawer */}
      {isAddingDebt && (
        <div className="bg-white rounded-xl border-2 border-amber-500/30 p-5 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">تسجيل معاملة دين شخصي مع المورد (Dette Personnelle)</h3>
                <p className="text-[11px] text-slate-500">حساب خاص بالسلفيات والديون الشخصية غير المرتبطة مباشرة بفواتير البضائع</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddingDebt(false)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
            >
              إلغاء
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">المورد المعني *</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.company || 'مؤسسة'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع المعاملة *</label>
                <select
                  value={debtType}
                  onChange={e => setDebtType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="borrow">استدانة / سلفة شخصية من المورد (+ دين علينا)</option>
                  <option value="repay">سداد دفعة من الدين الشخصي (- تسديد)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المبلغ (د.ج) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount || ''}
                  onChange={e => setAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-numbers font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">تاريخ المعاملة</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">البيان / سبب المعاملة الشخصية وملاحظات</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="مثال: سلفة نقدية مستعجلة، شيك ضمان، سداد نقدي يدوي..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddingDebt(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ المعاملة وتحديث الرصيد</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المورد أو بيان المعاملة الشخصية..."
            className="w-full pl-3 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>دفتر المعاملات والديون الشخصية للموردين</span>
          <span className="text-slate-400 font-normal">عدد العمليات: {filteredDebts.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المورد</th>
                <th className="p-3">نوع الحركة</th>
                <th className="p-3">البيان والملاحظات</th>
                <th className="p-3 text-center">المبلغ</th>
                <th className="p-3 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد معاملات ديون شخصية مسجلة
                  </td>
                </tr>
              ) : (
                filteredDebts.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3 font-mono-numbers text-slate-600">
                      {formatDate(d.date)}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {d.supplierName}
                    </td>
                    <td className="p-3">
                      {d.type === 'borrow' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[11px]">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-amber-600" />
                          استدانة شخصية (+ دين علينا)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px]">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                          سداد دفعة شخصية (- تسديد)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">
                      {d.notes || 'معاملة شخصية مباشرة'}
                    </td>
                    <td className="p-3 text-center font-bold font-mono-numbers text-sm">
                      <span className={d.type === 'borrow' ? 'text-amber-700' : 'text-emerald-700'}>
                        {d.type === 'borrow' ? '+' : '-'}{formatCurrency(d.amount)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        مقيد في الحساب
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
