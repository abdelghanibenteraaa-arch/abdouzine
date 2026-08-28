import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Eye,
  Calendar,
  Filter,
  ArrowDownToLine,
  Printer,
  CheckCircle2,
  Clock,
  Ban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SaleInvoice } from '../types';

export const SalesManager: React.FC = () => {
  const { sales, formatCurrency, formatDate, setSelectedInvoice, setActiveTab } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentType, setFilterPaymentType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  const filteredSales = sales.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(searchTerm));

    const matchesPayment = filterPaymentType === 'all' || inv.paymentType === filterPaymentType;
    const matchesDate = !filterDate || inv.date === filterDate;

    return matchesSearch && matchesPayment && matchesDate;
  });

  const totalSalesAmount = filteredSales.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaidAmount = filteredSales.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalRemainingDebt = filteredSales.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  return (
    <div className="flex flex-col h-full bg-[#e9ebed] select-none overflow-y-auto">
      {/* Top Banner Header (Dark metallic bar as in Zin Stock) */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1f2023] to-[#161719] text-white px-6 py-3 shadow-md flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>نقطة بيع جديدة (POS)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-white font-sans">تسيير فواتير المبيعات</span>
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full">

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي فواتير المبيعات (المعروضة)</span>
          <div className="text-xl font-bold text-slate-800 font-mono-numbers mt-1">
            {formatCurrency(totalSalesAmount)}
          </div>
          <span className="text-[11px] text-slate-400 font-mono-numbers mt-1 block">
            عدد الفواتير: {filteredSales.length} فاتورة
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">المبالغ المحصلة فعلياً (نقداً/بطاقة)</span>
          <div className="text-xl font-bold text-emerald-600 font-mono-numbers mt-1">
            {formatCurrency(totalPaidAmount)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            نسبة التحصيل: {totalSalesAmount > 0 ? Math.round((totalPaidAmount / totalSalesAmount) * 100) : 0}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">المبالغ الآجلة (ديون مستحقة على العملاء)</span>
          <div className="text-xl font-bold text-rose-600 font-mono-numbers mt-1">
            {formatCurrency(totalRemainingDebt)}
          </div>
          <span className="text-[11px] text-slate-400 font-mono-numbers mt-1 block">
            مستحقة السداد في حسابات العملاء
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الفاتورة، اسم العميل، أو الهاتف..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-transparent text-xs text-slate-700 focus:outline-none"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ×
            </button>
          )}
        </div>

        {/* Payment Type Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterPaymentType}
            onChange={e => setFilterPaymentType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">جميع طرق الدفع</option>
            <option value="cash">نقدي فقط</option>
            <option value="card">شبكة / بطاقة</option>
            <option value="credit">آجل / ذمة</option>
            <option value="bank_transfer">تحويل بنكي</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">رقم الفاتورة</th>
                <th className="p-3.5 font-semibold">التاريخ</th>
                <th className="p-3.5 font-semibold">اسم العميل</th>
                <th className="p-3.5 font-semibold text-center">عدد الأصناف</th>
                <th className="p-3.5 font-semibold">المجموع الفرعي</th>
                <th className="p-3.5 font-semibold">الضريبة</th>
                <th className="p-3.5 font-semibold">الإجمالي النهائي</th>
                <th className="p-3.5 font-semibold">المدفوع</th>
                <th className="p-3.5 font-semibold">المتبقي (الآجل)</th>
                <th className="p-3.5 font-semibold">طريقة الدفع</th>
                <th className="p-3.5 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    لا توجد فواتير مبيعات تطابق معايير البحث
                  </td>
                </tr>
              ) : (
                filteredSales.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3.5 font-bold font-mono-numbers text-indigo-700">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3.5 font-mono-numbers text-slate-500">
                      {formatDate(inv.date)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{inv.customerName}</div>
                      {inv.customerPhone && (
                        <div className="text-[10px] text-slate-400 font-mono-numbers">{inv.customerPhone}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-center font-mono-numbers font-medium">
                      {inv.items.reduce((sum, itm) => sum + itm.quantity, 0)} قطعة
                    </td>
                    <td className="p-3.5 font-mono-numbers">
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td className="p-3.5 font-mono-numbers text-slate-500">
                      {formatCurrency(inv.taxAmount)}
                    </td>
                    <td className="p-3.5 font-bold font-mono-numbers text-slate-900 text-sm">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="p-3.5 font-bold font-mono-numbers text-emerald-600">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="p-3.5 font-mono-numbers">
                      {inv.remainingAmount > 0 ? (
                        <span className="text-rose-600 font-bold px-2 py-0.5 rounded bg-rose-50">
                          {formatCurrency(inv.remainingAmount)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> مسدد
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-lg font-bold ${
                          inv.paymentType === 'cash'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.paymentType === 'card'
                            ? 'bg-blue-100 text-blue-800'
                            : inv.paymentType === 'bank_transfer'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.paymentType === 'cash'
                          ? 'نقدي'
                          : inv.paymentType === 'card'
                          ? 'بطاقة / مدى'
                          : inv.paymentType === 'bank_transfer'
                          ? 'تحويل بنكي'
                          : 'آجل / ذمة'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedInvoice({ type: 'sale', data: inv })}
                        className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 transition-all font-semibold inline-flex items-center gap-1"
                        title="معاينة وطباعة الفاتورة"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
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
      </div>
    </div>
  );
};
