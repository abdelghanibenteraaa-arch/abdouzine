import React, { useState } from 'react';
import {
  Handshake,
  DollarSign,
  Plus,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  Printer,
  FileText,
  CreditCard,
  Layers,
  ArrowDownCircle,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier, SupplierSettlement } from '../../types';
import { api } from '../../services/api';

interface SupplierSettlementsProps {
  preselectedSupplier?: Supplier | null;
  onOpenStatement?: (supplier: Supplier) => void;
}

export const SupplierSettlements: React.FC<SupplierSettlementsProps> = ({
  preselectedSupplier,
  onOpenStatement
}) => {
  const {
    suppliers,
    payments,
    formatCurrency,
    formatDate,
    refreshData,
    addToast
  } = useApp();

  const [isCreatingSettlement, setIsCreatingSettlement] = useState(Boolean(preselectedSupplier));
  const [selectedSupplierId, setSelectedSupplierId] = useState(preselectedSupplier?.id || (suppliers[0]?.id || ''));
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [discountDeduction, setDiscountDeduction] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'check' | 'bank_transfer'>('cash');
  const [settlementDate, setSettlementDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSettlementModal, setActiveSettlementModal] = useState<SupplierSettlement | null>(null);

  // Local storage for settlements
  const [settlementsList, setSettlementsList] = useState<SupplierSettlement[]>(() => {
    try {
      const saved = localStorage.getItem('zin_supplier_settlements');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'set-101',
        settlementNumber: 'REG-2026-001',
        supplierId: 'sup-1',
        supplierName: 'شركة سيفيتال للصناعات الغذائية (Cevital)',
        date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
        previousDebt: 85000,
        paidAmount: 30000,
        discountDeduction: 0,
        remainingDebt: 55000,
        paymentMethod: 'cash',
        notes: 'دفعة نقدية تسوية عن فاتورة الزيوت',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
      }
    ];
  });

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const currentSupplierDebt = selectedSupplier
    ? ((selectedSupplier.currentBalance !== undefined ? selectedSupplier.currentBalance : selectedSupplier.currentDebt) || 0)
    : 0;

  const handleSelectSupplier = (id: string) => {
    setSelectedSupplierId(id);
    const sup = suppliers.find(s => s.id === id);
    if (sup) {
      const debt = (sup.currentBalance !== undefined ? sup.currentBalance : sup.currentDebt) || 0;
      setPaidAmount(debt); // default suggest full debt
      setDiscountDeduction(0);
    }
  };

  const remainingAfterSettlement = Math.max(0, currentSupplierDebt - (Number(paidAmount) || 0) - (Number(discountDeduction) || 0));

  const handleSubmitSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) {
      addToast('يرجى اختيار المورد', 'error');
      return;
    }
    if ((Number(paidAmount) || 0) <= 0 && (Number(discountDeduction) || 0) <= 0) {
      addToast('يرجى إدخال مبلغ مدفوع أو خصم تسوية', 'error');
      return;
    }

    const settlementNumber = `REG-${new Date().getFullYear()}-${String(settlementsList.length + 1).padStart(3, '0')}`;
    const newSettlement: SupplierSettlement = {
      id: 'set-' + Date.now(),
      settlementNumber,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      date: settlementDate,
      previousDebt: currentSupplierDebt,
      paidAmount: Number(paidAmount) || 0,
      discountDeduction: Number(discountDeduction) || 0,
      remainingDebt: remainingAfterSettlement,
      paymentMethod,
      notes,
      createdAt: new Date().toISOString()
    };

    // 1. Create Payment record in DB (sends out from cashbox)
    try {
      if (Number(paidAmount) > 0) {
        await api.createPayment({
          type: 'supplier_payment',
          partyId: selectedSupplier.id,
          partyName: selectedSupplier.name,
          amount: Number(paidAmount),
          paymentMethod,
          date: settlementDate,
          notes: `تسوية حساب مورد ${settlementNumber}: ${notes || 'دفعة مسددة'}`
        });
      }
    } catch (err) {
      console.warn('Failed to record payment in API:', err);
    }

    // 2. Update Supplier balance directly
    try {
      await api.updateSupplier(selectedSupplier.id, {
        currentDebt: remainingAfterSettlement,
        currentBalance: remainingAfterSettlement
      });
    } catch (err) {
      console.error('Failed to update supplier debt in API:', err);
    }

    const updated = [newSettlement, ...settlementsList];
    setSettlementsList(updated);
    try {
      localStorage.setItem('zin_supplier_settlements', JSON.stringify(updated));
    } catch {}

    addToast(
      `تم تسجيل سند تسوية المورد ${settlementNumber} بمبلغ ${formatCurrency(paidAmount)} بنجاح`,
      'success'
    );

    setActiveSettlementModal(newSettlement);
    setIsCreatingSettlement(false);
    setPaidAmount(0);
    setDiscountDeduction(0);
    setNotes('');
    await refreshData();
  };

  const filteredSettlements = settlementsList.filter(s =>
    s.settlementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPaidAllSettlements = settlementsList.reduce((sum, s) => sum + s.paidAmount, 0);

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">إجمالي المبالغ المسددة للموردين</span>
            <div className="text-xl font-bold text-emerald-600 font-mono-numbers mt-0.5">
              {formatCurrency(totalPaidAllSettlements)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">عدد عمليات التسوية</span>
            <div className="text-xl font-bold text-slate-800 font-mono-numbers mt-0.5">
              {settlementsList.length} سند تسوية
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Handshake className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">إجراء تسوية</span>
            <button
              onClick={() => {
                setIsCreatingSettlement(true);
                if (suppliers[0]) handleSelectSupplier(suppliers[0].id);
              }}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسوية حساب مورد جديد</span>
            </button>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* New Settlement Form */}
      {isCreatingSettlement && (
        <div className="bg-white rounded-xl border-2 border-emerald-500/30 p-5 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Handshake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">تسوية ودفع دفعة لحساب المورد (Règlement Fournisseur)</h3>
                <p className="text-[11px] text-slate-500">تسجيل دفعات الديون، الخصومات المكتسبة، وطباعة وصل التسوية الرسمي</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreatingSettlement(false)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
            >
              إلغاء
            </button>
          </div>

          <form onSubmit={handleSubmitSettlement} className="space-y-4 text-xs">
            {/* Supplier selector and summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">اختر المورد المراد تسوية حسابه *</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => handleSelectSupplier(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                >
                  {suppliers.map(s => {
                    const d = (s.currentBalance !== undefined ? s.currentBalance : s.currentDebt) || 0;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.company || 'مؤسسة'}) - الدين المستحق له: {formatCurrency(d)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-semibold">الدين المستحق للمورد حالياً:</span>
                <span className="text-sm font-extrabold text-rose-600 font-mono-numbers">
                  {formatCurrency(currentSupplierDebt)}
                </span>
              </div>
            </div>

            {/* Payment Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">المبلغ المدفوع (د.ج) *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={paidAmount || ''}
                    onChange={e => setPaidAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-numbers font-bold text-emerald-700"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">خصم مكتسب / مسامحة (د.ج)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={discountDeduction || ''}
                    onChange={e => setDiscountDeduction(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-numbers font-bold text-blue-700"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">طريقة الدفع *</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="cash">نقداً من الصندوق (Espèces)</option>
                  <option value="check">شيك بنكي (Chèque bancaire)</option>
                  <option value="bank_transfer">تحويل بنكي / بريدي (Virement)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">تاريخ التسوية</label>
                <input
                  type="date"
                  value={settlementDate}
                  onChange={e => setSettlementDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-numbers"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">البيان / ملاحظات التسوية ورقم الشيك إن وجد</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="مثال: تسوية دفعة عن طلبيات شهر فيفري، شيك رقم 1234567..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* Balance preview */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[11px] text-slate-500">الدين السابق:</span>
                  <div className="font-bold text-slate-800 font-mono-numbers">{formatCurrency(currentSupplierDebt)}</div>
                </div>
                <div className="text-slate-400">-</div>
                <div>
                  <span className="text-[11px] text-slate-500">المسدد + الخصم:</span>
                  <div className="font-bold text-emerald-700 font-mono-numbers">{formatCurrency((Number(paidAmount) || 0) + (Number(discountDeduction) || 0))}</div>
                </div>
                <div className="text-slate-400">=</div>
                <div>
                  <span className="text-[11px] text-slate-500">الرصيد المتبقي له:</span>
                  <div className="font-extrabold text-slate-900 font-mono-numbers">{formatCurrency(remainingAfterSettlement)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSettlement(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد وطباعة سند التسوية</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث برقم سند التسوية، اسم المورد، أو الملاحظات..."
            className="w-full pl-3 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>سجل سندات تسوية الموردين (Règlements Fournisseurs)</span>
          <span className="text-slate-400 font-normal">عدد السندات: {filteredSettlements.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">رقم السند</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المورد</th>
                <th className="p-3 text-center">الدين السابق</th>
                <th className="p-3 text-center">المبلغ المدفوع</th>
                <th className="p-3 text-center">الخصم المكتسب</th>
                <th className="p-3 text-center">الرصيد المتبقي</th>
                <th className="p-3 text-center">طريقة الدفع</th>
                <th className="p-3 text-center">طباعة الوصل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <Handshake className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد سندات تسوية مسجلة
                  </td>
                </tr>
              ) : (
                filteredSettlements.map(set => (
                  <tr key={set.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3 font-bold font-mono-numbers text-emerald-700">
                      {set.settlementNumber}
                    </td>
                    <td className="p-3 font-mono-numbers text-slate-600">
                      {formatDate(set.date)}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {set.supplierName}
                    </td>
                    <td className="p-3 text-center font-mono-numbers text-slate-600">
                      {formatCurrency(set.previousDebt)}
                    </td>
                    <td className="p-3 text-center font-bold font-mono-numbers text-emerald-600">
                      {formatCurrency(set.paidAmount)}
                    </td>
                    <td className="p-3 text-center font-mono-numbers text-blue-600">
                      {set.discountDeduction > 0 ? formatCurrency(set.discountDeduction) : '-'}
                    </td>
                    <td className="p-3 text-center font-bold font-mono-numbers">
                      {set.remainingDebt > 0 ? (
                        <span className="text-rose-600">{formatCurrency(set.remainingDebt)}</span>
                      ) : (
                        <span className="text-emerald-600">0.00 د.ج</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {set.paymentMethod === 'cash' ? 'نقداً' : set.paymentMethod === 'check' ? 'شيك بنكي' : 'تحويل'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setActiveSettlementModal(set)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Voucher Modal */}
      {activeSettlementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                وصل تسوية حساب مورد (Reçu de Règlement)
              </h3>
              <button
                onClick={() => setActiveSettlementModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-4 border border-slate-200 rounded-xl bg-slate-50 text-xs">
              {/* Header */}
              <div className="text-center pb-3 border-b border-slate-300">
                <h2 className="text-lg font-extrabold text-slate-900">مؤسسة عبدو زين للتجارة والتوزيع</h2>
                <p className="text-slate-500 text-[11px]">وصل تسوية ودفع رسمي للمورد - RÈGLEMENT FOURNISSEUR</p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded font-mono-numbers font-black text-sm">
                  {activeSettlementModal.settlementNumber}
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold">المورد:</span>
                  <strong className="block text-slate-900">{activeSettlementModal.supplierName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">تاريخ التسوية:</span>
                  <strong className="block font-mono-numbers">{formatDate(activeSettlementModal.date)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">طريقة الدفع:</span>
                  <strong className="block text-slate-900">
                    {activeSettlementModal.paymentMethod === 'cash' ? 'نقداً من الصندوق' : activeSettlementModal.paymentMethod === 'check' ? 'شيك بنكي' : 'تحويل بنكي'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">المبلغ المسدد:</span>
                  <strong className="block text-emerald-600 font-mono-numbers text-sm">
                    {formatCurrency(activeSettlementModal.paidAmount)}
                  </strong>
                </div>
                {activeSettlementModal.discountDeduction > 0 && (
                  <div>
                    <span className="text-slate-400 font-semibold">الخصم المكتسب:</span>
                    <strong className="block text-blue-600 font-mono-numbers">
                      {formatCurrency(activeSettlementModal.discountDeduction)}
                    </strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 font-semibold">الرصيد المتبقي له:</span>
                  <strong className="block text-slate-900 font-mono-numbers">
                    {formatCurrency(activeSettlementModal.remainingDebt)}
                  </strong>
                </div>
                {activeSettlementModal.notes && (
                  <div className="col-span-2 pt-1 border-t border-slate-100">
                    <span className="text-slate-400 font-semibold">البيان والملاحظات:</span>
                    <p className="text-slate-700">{activeSettlementModal.notes}</p>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-center text-slate-600">
                <div className="border-t border-slate-300 pt-1">
                  <span>توقيع وخاتم أمين الصندوق</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <span>توقيع واستلام المورد</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة السند</span>
              </button>
              <button
                onClick={() => setActiveSettlementModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
