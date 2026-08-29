import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  QrCode,
  Building2,
  Phone,
  Calendar,
  Share2,
  ArrowRight,
  Send,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SaleInvoice, PurchaseInvoice } from '../../types';

export const InvoiceViewModal: React.FC = () => {
  const { selectedInvoice, setSelectedInvoice, settings, formatCurrency, formatDate, addToast } = useApp();
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('thermal');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedInvoice]);

  if (!selectedInvoice) return null;

  const isSale = selectedInvoice.type === 'sale';
  const data = selectedInvoice.data as (SaleInvoice & PurchaseInvoice);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `فاتورة من ${settings.storeName}%0Aرقم الفاتورة: ${data.invoiceNumber}%0Aالتاريخ: ${data.date}%0Aالإجمالي: ${data.totalAmount} د.ج%0Aالمبلغ المدفوع: ${data.paidAmount} د.ج%0Aالمتبقي: ${data.remainingAmount} د.ج%0Aشكراً لزيارتكم!`;
    const phone = (data.customerPhone || '').replace(/[^0-9]/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
    addToast('تم فتح واتساب لمشاركة الفاتورة', 'info');
  };

  return (
    <div
      onClick={(e) => {
        // Close on clicking the backdrop outside the modal
        if (e.target === e.currentTarget) {
          setSelectedInvoice(null);
        }
      }}
      className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in overflow-y-auto"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto relative animate-in zoom-in-95 duration-150">
        
        {/* Floating Quick Close Button (Top-Left / Top-Right) */}
        <button
          id="btn-close-invoice-float"
          type="button"
          onClick={() => setSelectedInvoice(null)}
          title="إغلاق الفاتورة (Esc)"
          className="no-print absolute top-3 left-3 sm:top-4 sm:left-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer border-2 border-white"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Modal Controls Top Bar (Hidden in print) */}
        <div className="no-print p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {isSale ? 'تم إتمام عملية البيع بنجاح' : 'سند استلام المشتريات'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono-numbers">
                فاتورة رقم: {data.invoiceNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-10 sm:pr-0">
            {/* Print Format Selector */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  printFormat === 'thermal' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                إيصال 80mm
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  printFormat === 'a4' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                فاتورة A4
              </button>
            </div>

            {/* Prominent Red Close Button in Top Bar */}
            <button
              id="btn-close-invoice-top"
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-black transition-all shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">إغلاق (Esc)</span>
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          id="printable-receipt"
          className={`p-5 sm:p-8 bg-white text-slate-900 printable-area max-h-[70vh] overflow-y-auto ${
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
                {isSale ? 'فاتورة بيع ونقطة الدفع' : 'سند استلام وتوريد بضاعة (مشتريات)'}
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
              <span className="text-slate-500 block">{isSale ? 'الزبون / العميل:' : 'المورد:'}</span>
              <strong className="text-slate-800">{isSale ? data.customerName : (data as any).supplierName}</strong>
            </div>
            <div className="text-left">
              <span className="text-slate-500 block">طريقة الدفع:</span>
              <strong className="text-slate-800">
                {data.paymentType === 'cash'
                  ? 'نقدي'
                  : data.paymentType === 'card'
                  ? 'بطاقة بنكية'
                  : data.paymentType === 'bank_transfer'
                  ? 'تحويل بنكي'
                  : 'آجل / كريدي'}
              </strong>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600">
                  <th className="pb-1.5">السلعة</th>
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
                      {formatCurrency(item.unitPrice || item.unitCost)}
                    </td>
                    <td className="py-2 text-left font-bold font-mono-numbers text-slate-900">
                      {formatCurrency(item.total)}
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
              <span>المبلغ الإجمالي:</span>
              <span className="font-mono-numbers text-base text-blue-700">{formatCurrency(data.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-slate-700 pt-1">
              <span>المبلغ المدفوع:</span>
              <span className="font-mono-numbers font-bold text-emerald-700">{formatCurrency(data.paidAmount)}</span>
            </div>

            {data.remainingAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>المبلغ المتبقي (دين / كريدي):</span>
                <span className="font-mono-numbers">{formatCurrency(data.remainingAmount)}</span>
              </div>
            )}
          </div>

          {/* QR Code & Footer */}
          <div className="mt-6 pt-4 border-t border-dashed border-slate-300 text-center space-y-2">
            <div className="w-20 h-20 mx-auto p-1.5 border-2 border-slate-900 rounded-lg flex items-center justify-center bg-white shadow-2xs">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              فاتورة عبدو زين الإلكترونية • Zin Stock
            </p>

            {settings.invoiceFooterNote && (
              <p className="text-xs text-slate-600 pt-2 font-medium max-w-xs mx-auto leading-relaxed">
                {settings.invoiceFooterNote}
              </p>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer Actions Bar (Close X, Print, Share) */}
        <div className="no-print p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          {/* Main Big Red Close Button */}
          <button
            id="btn-close-invoice-bottom"
            type="button"
            onClick={() => setSelectedInvoice(null)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[3]" />
            <span>إغلاق الفاتورة (X) والعودة للبيع</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Share to WhatsApp button for phone / cashier */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>إرسال واتساب</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة 🖨️</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
