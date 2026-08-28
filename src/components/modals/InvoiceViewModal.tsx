import React, { useState } from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  QrCode,
  Building2,
  Phone,
  Calendar,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SaleInvoice, PurchaseInvoice } from '../../types';

export const InvoiceViewModal: React.FC = () => {
  const { selectedInvoice, setSelectedInvoice, settings, formatCurrency, formatDate } = useApp();
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('thermal');

  if (!selectedInvoice) return null;

  const isSale = selectedInvoice.type === 'sale';
  const data = selectedInvoice.data as (SaleInvoice & PurchaseInvoice);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Modal Controls Bar (Hidden in print) */}
        <div className="no-print p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">نمط الطباعة:</span>
            <div className="flex bg-slate-200/80 rounded-xl p-0.5">
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  printFormat === 'thermal' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                إيصال كاشير (80mm)
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  printFormat === 'a4' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                فاتورة A4 قياسية
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة</span>
            </button>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          id="printable-receipt"
          className={`p-6 sm:p-8 bg-white text-slate-900 printable-area ${
            printFormat === 'thermal' ? 'max-w-md mx-auto font-sans' : 'w-full'
          }`}
        >
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-slate-300 space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{settings.storeName}</h2>
            {settings.taxNumber && (
              <p className="text-xs font-mono-numbers text-slate-600">
                الرقم الضريبي: <strong>{settings.taxNumber}</strong>
              </p>
            )}
            {settings.phone && (
              <p className="text-xs font-mono-numbers text-slate-600">الهاتف: {settings.phone}</p>
            )}
            {settings.address && (
              <p className="text-xs text-slate-500">{settings.address}</p>
            )}

            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                {isSale ? 'فاتورة ضريبية مبسطة (مبيعات)' : 'سند استلام وتوريد بضاعة (مشتريات)'}
              </span>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-2 py-3 text-xs border-b border-dashed border-slate-200">
            <div>
              <span className="text-slate-500 block">رقم الفاتورة:</span>
              <strong className="font-mono-numbers text-slate-800">{data.invoiceNumber}</strong>
            </div>
            <div className="text-left">
              <span className="text-slate-500 block">التاريخ والوقت:</span>
              <strong className="font-mono-numbers text-slate-800">{formatDate(data.date)}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">{isSale ? 'العميل:' : 'المورد:'}</span>
              <strong className="text-slate-800">{isSale ? data.customerName : (data as any).supplierName}</strong>
            </div>
            <div className="text-left">
              <span className="text-slate-500 block">طريقة الدفع:</span>
              <strong className="text-slate-800">
                {data.paymentType === 'cash'
                  ? 'نقدي'
                  : data.paymentType === 'card'
                  ? 'بطاقة / مدى'
                  : data.paymentType === 'bank_transfer'
                  ? 'تحويل بنكي'
                  : 'آجل / ذمة'}
              </strong>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600">
                  <th className="pb-1.5">الصنف</th>
                  <th className="pb-1.5 text-center">الكمية</th>
                  <th className="pb-1.5 text-left">السعر</th>
                  <th className="pb-1.5 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <div className="font-semibold text-slate-800">{item.productName}</div>
                      {item.sku && <div className="text-[10px] text-slate-400 font-mono-numbers">{item.sku}</div>}
                    </td>
                    <td className="py-2 text-center font-bold font-mono-numbers">{item.quantity}</td>
                    <td className="py-2 text-left font-mono-numbers">
                      {item.unitPrice || item.unitCost}
                    </td>
                    <td className="py-2 text-left font-bold font-mono-numbers text-slate-900">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="pt-3 border-t-2 border-dashed border-slate-300 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي:</span>
              <span className="font-mono-numbers font-semibold">{formatCurrency(data.subtotal)}</span>
            </div>

            {data.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>الخصم الممنوح:</span>
                <span className="font-mono-numbers">-{formatCurrency(data.discountAmount)}</span>
              </div>
            )}

            {data.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>ضريبة القيمة المضافة ({data.taxRate}%):</span>
                <span className="font-mono-numbers">{formatCurrency(data.taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>المبلغ الإجمالي شامل الضريبة:</span>
              <span className="font-mono-numbers text-base">{formatCurrency(data.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-slate-700 pt-1">
              <span>المبلغ المسدد:</span>
              <span className="font-mono-numbers font-bold text-emerald-700">{formatCurrency(data.paidAmount)}</span>
            </div>

            {data.remainingAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>المبلغ المتبقي (آجل):</span>
                <span className="font-mono-numbers">{formatCurrency(data.remainingAmount)}</span>
              </div>
            )}
          </div>

          {/* QR Code & Footer */}
          <div className="mt-6 pt-4 border-t border-dashed border-slate-300 text-center space-y-2">
            {/* Simulated QR Code box */}
            <div className="w-24 h-24 mx-auto p-1.5 border-2 border-slate-900 rounded-lg flex items-center justify-center bg-white shadow-2xs">
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white text-[9px] font-mono leading-tight">
                <QrCode className="w-16 h-16 text-white" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              رمز الاستجابة السريع للتحقق الضريبي (ZATCA / Tax QR)
            </p>

            {settings.invoiceFooterNote && (
              <p className="text-xs text-slate-600 pt-2 font-medium max-w-xs mx-auto leading-relaxed">
                {settings.invoiceFooterNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
