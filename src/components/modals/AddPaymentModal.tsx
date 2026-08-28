import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  X,
  Check,
  CreditCard,
  Banknote,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const AddPaymentModal: React.FC = () => {
  const {
    isAddPaymentOpen,
    setIsAddPaymentOpen,
    customers,
    suppliers,
    refreshData,
    addToast,
    formatCurrency,
    settings
  } = useApp();

  const [paymentType, setPaymentType] = useState<'receipt' | 'disbursement'>('receipt');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default selected party
  useEffect(() => {
    if (paymentType === 'receipt' && customers.length > 0) {
      setSelectedPartyId(customers[0].id);
    } else if (paymentType === 'disbursement' && suppliers.length > 0) {
      setSelectedPartyId(suppliers[0].id);
    }
  }, [paymentType, customers, suppliers]);

  if (!isAddPaymentOpen) return null;

  const currentCustomer = customers.find(c => c.id === selectedPartyId);
  const currentSupplier = suppliers.find(s => s.id === selectedPartyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyId) {
      addToast('يرجى اختيار الجهة (العميل أو المورد)', 'warning');
      return;
    }
    if (amount <= 0) {
      addToast('يرجى إدخال مبلغ صحيح أكبر من 0', 'warning');
      return;
    }

    const partyName = paymentType === 'receipt' ? currentCustomer?.name : currentSupplier?.name;

    setIsSubmitting(true);
    try {
      await api.createPayment({
        date,
        type: paymentType,
        partyType: paymentType === 'receipt' ? 'customer' : 'supplier',
        partyId: selectedPartyId,
        partyName: partyName || '',
        amount,
        paymentMethod: method,
        notes,
      });

      addToast(
        paymentType === 'receipt'
          ? `تم تسجيل سند قبض بمبلغ ${formatCurrency(amount)} من العميل ${partyName}`
          : `تم تسجيل سند صرف بمبلغ ${formatCurrency(amount)} للمورد ${partyName}`,
        'success'
      );

      await refreshData();
      setIsAddPaymentOpen(false);
      setAmount(0);
      setNotes('');
    } catch (err: any) {
      addToast(err.message || 'فشل في حفظ السند المالي', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                paymentType === 'receipt'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-800">
              {paymentType === 'receipt' ? 'سند قبض مالي (تحصيل من عميل)' : 'سند صرف مالي (سداد لمورد)'}
            </h3>
          </div>
          <button
            onClick={() => setIsAddPaymentOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Voucher Type Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentType('receipt')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                paymentType === 'receipt'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>سند قبض (وارد للصندوق)</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('disbursement')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                paymentType === 'disbursement'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>سند صرف (صادر من الصندوق)</span>
            </button>
          </div>

          {/* Select Customer / Supplier */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {paymentType === 'receipt' ? 'العميل المستلم منه:' : 'المورد المدفوع له:'}
            </label>
            {paymentType === 'receipt' ? (
              <select
                value={selectedPartyId}
                onChange={e => setSelectedPartyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                required
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.currentDebt > 0 ? `(عليه دين: ${formatCurrency(c.currentDebt)})` : '(خالص)'}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedPartyId}
                onChange={e => setSelectedPartyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                required
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.company || 'مورد'}) {s.currentBalance > 0 ? `(مستحق له: ${formatCurrency(s.currentBalance)})` : '(خالص)'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Current Debt Badge */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
            <span className="text-slate-600 font-semibold">
              {paymentType === 'receipt' ? 'الرصيد المستحق على العميل حالياً:' : 'الرصيد المستحق للمورد حالياً:'}
            </span>
            <strong className="font-mono-numbers text-rose-600 font-bold">
              {formatCurrency(paymentType === 'receipt' ? (currentCustomer?.currentDebt || 0) : (currentSupplier?.currentBalance || 0))}
            </strong>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المبلغ المدفوع <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                value={amount || ''}
                onChange={e => setAmount(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono-numbers font-bold text-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ السند</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">طريقة القبض / الصرف</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  method === 'cash'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>نقدي</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  method === 'card'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>شبكة</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  method === 'bank_transfer'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تحويل بنكي</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البيان / ملاحظات السند</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: دفعة تحت الحساب عن فاتورة مبيعات #1001"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPaymentOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md ${
                paymentType === 'receipt'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'تسجيل السند وتحديث الرصيد'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
