import React from 'react';
import {
  FileText,
  Printer,
  X,
  Building2,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Package,
  RotateCcw,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';

interface SupplierStatementModalProps {
  supplier: Supplier;
  onClose: () => void;
}

export const SupplierStatementModal: React.FC<SupplierStatementModalProps> = ({
  supplier,
  onClose
}) => {
  const {
    purchases,
    payments,
    formatCurrency,
    formatDate,
    settings
  } = useApp();

  const supplierPurchases = purchases.filter(p => p.supplierId === supplier.id);
  const supplierPayments = payments.filter(p => p.partyId === supplier.id);

  // Load returns and personal debts from storage
  let supplierReturns: any[] = [];
  try {
    const rawReturns = localStorage.getItem('zin_supplier_returns');
    if (rawReturns) {
      supplierReturns = JSON.parse(rawReturns).filter((r: any) => r.supplierId === supplier.id);
    }
  } catch {}

  let supplierPersonalDebts: any[] = [];
  try {
    const rawDebts = localStorage.getItem('zin_supplier_personal_debts');
    if (rawDebts) {
      supplierPersonalDebts = JSON.parse(rawDebts).filter((d: any) => d.supplierId === supplier.id);
    }
  } catch {}

  // Merge all events chronologically
  type StatementEntry = {
    id: string;
    date: string;
    type: 'purchase' | 'payment' | 'return' | 'personal_debt';
    reference: string;
    description: string;
    debit: number; // له في ذمتنا (يزيد الدين)
    credit: number; // دفعنا له (ينقص الدين)
  };

  const entries: StatementEntry[] = [];

  // Purchases (Bills)
  supplierPurchases.forEach(p => {
    entries.push({
      id: p.id,
      date: p.date,
      type: 'purchase',
      reference: p.invoiceNumber,
      description: `فاتورة توريد بضاعة: ${p.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}`,
      debit: p.totalAmount,
      credit: p.paidAmount
    });
  });

  // Direct Payments / Disbursements
  supplierPayments.forEach(pay => {
    entries.push({
      id: pay.id,
      date: pay.date,
      type: 'payment',
      reference: 'سند صرف',
      description: pay.notes || 'سند صرف دفعة نقدية للمورد',
      debit: 0,
      credit: pay.amount
    });
  });

  // Returns
  supplierReturns.forEach(ret => {
    if (ret.refundMethod === 'deduct_debt') {
      entries.push({
        id: ret.id,
        date: ret.date,
        type: 'return',
        reference: ret.returnNumber,
        description: `وصل إرجاع بضاعة: ${ret.items.map((i: any) => `${i.productName} (${i.quantity})`).join(', ')}`,
        debit: 0,
        credit: ret.totalRefund
      });
    }
  });

  // Personal debts
  supplierPersonalDebts.forEach(pd => {
    entries.push({
      id: pd.id,
      date: pd.date,
      type: 'personal_debt',
      reference: pd.type === 'borrow' ? 'استدانة شخصية' : 'سداد شخصي',
      description: pd.notes || (pd.type === 'borrow' ? 'سلفة / استدانة شخصية من المورد' : 'سداد دفعة من الدين الشخصي'),
      debit: pd.type === 'borrow' ? pd.amount : 0,
      credit: pd.type === 'repay' ? pd.amount : 0
    });
  });

  // Sort ascending by date
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Running balance
  let runningBalance = 0;
  const computedEntries = entries.map(entry => {
    runningBalance += entry.debit - entry.credit;
    return {
      ...entry,
      balanceAfter: runningBalance
    };
  });

  const totalDebits = entries.reduce((s, e) => s + e.debit, 0);
  const totalCredits = entries.reduce((s, e) => s + e.credit, 0);
  const finalBalance = (supplier.currentBalance !== undefined ? supplier.currentBalance : supplier.currentDebt) || (totalDebits - totalCredits);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">كشف حساب تفصيلي للمورد (Extrait de Compte)</h3>
              <p className="text-xs text-slate-300">
                {supplier.name} {supplier.company ? `(${supplier.company})` : ''} - {supplier.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الكشف</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Statement Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Official Letterhead */}
          <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{settings.storeName || 'مؤسسة عبدو زين للتجارة والتوزيع'}</h2>
              <p className="text-slate-500 text-xs mt-0.5">{settings.address || 'الجزائر العاصمة'}</p>
              <p className="text-slate-500 text-xs">هاتف: {settings.phone || '0550 12 34 56'}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-right min-w-[220px]">
              <span className="text-[10px] text-slate-400 font-bold block">بيانات المورد:</span>
              <strong className="text-sm text-slate-900 block">{supplier.name}</strong>
              <span className="text-xs text-slate-600 block">{supplier.company || 'مؤسسة تجارية'}</span>
              <span className="text-xs text-slate-600 font-mono-numbers block">{supplier.phone}</span>
              {supplier.taxNumber && <span className="text-[10px] text-slate-400 font-mono-numbers block">{supplier.taxNumber}</span>}
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl">
              <span className="text-[11px] text-blue-700 font-semibold">إجمالي المشتريات والتوريدات (+)</span>
              <div className="text-base font-extrabold text-blue-900 font-mono-numbers mt-0.5">
                {formatCurrency(totalDebits)}
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl">
              <span className="text-[11px] text-emerald-700 font-semibold">إجمالي المبالغ المسددة (-)</span>
              <div className="text-base font-extrabold text-emerald-900 font-mono-numbers mt-0.5">
                {formatCurrency(totalCredits)}
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 p-3 rounded-xl">
              <span className="text-[11px] text-rose-700 font-semibold">الرصيد المستحق النهائي (له في ذمتنا)</span>
              <div className="text-base font-black text-rose-800 font-mono-numbers mt-0.5">
                {formatCurrency(finalBalance)}
              </div>
            </div>
          </div>

          {/* Statement Ledger Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">المرجع / الوثيقة</th>
                  <th className="p-3">البيان والشرح</th>
                  <th className="p-3 text-center text-blue-700">مدين (+) له</th>
                  <th className="p-3 text-center text-emerald-700">دائن (-) سددنا</th>
                  <th className="p-3 text-center">الرصيد التراكمي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {computedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      لا توجد حركات مسجلة في كشف حساب هذا المورد
                    </td>
                  </tr>
                ) : (
                  computedEntries.map((e, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono-numbers text-slate-600">
                        {formatDate(e.date)}
                      </td>
                      <td className="p-3 font-bold text-slate-800 font-mono-numbers">
                        {e.reference}
                      </td>
                      <td className="p-3 text-slate-700">
                        {e.description}
                      </td>
                      <td className="p-3 text-center font-mono-numbers font-bold text-blue-700">
                        {e.debit > 0 ? formatCurrency(e.debit) : '-'}
                      </td>
                      <td className="p-3 text-center font-mono-numbers font-bold text-emerald-700">
                        {e.credit > 0 ? formatCurrency(e.credit) : '-'}
                      </td>
                      <td className="p-3 text-center font-mono-numbers font-black text-slate-900">
                        {formatCurrency(e.balanceAfter)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-200 text-slate-900">
                <tr>
                  <td colSpan={3} className="p-3 text-left">المجموع الإجمالي:</td>
                  <td className="p-3 text-center font-mono-numbers text-blue-800">{formatCurrency(totalDebits)}</td>
                  <td className="p-3 text-center font-mono-numbers text-emerald-800">{formatCurrency(totalCredits)}</td>
                  <td className="p-3 text-center font-mono-numbers font-black text-rose-700 text-sm">
                    {formatCurrency(finalBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-slate-600">
            <div className="border-t border-slate-300 pt-2">
              <span className="font-bold">توقيع وخاتم المؤسسة</span>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <span className="font-bold">موافقة وتوقيع المورد</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة رسمية للكشف</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
