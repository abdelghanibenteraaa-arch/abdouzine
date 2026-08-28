import React, { useState } from 'react';
import {
  User,
  Users,
  DollarSign,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Edit2,
  FileText,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  Coins,
  ShieldAlert,
  CreditCard,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { api } from '../services/api';

export const CustomersManager: React.FC = () => {
  const {
    customers,
    sales,
    payments,
    formatCurrency,
    formatDate,
    setIsAddCustomerOpen,
    setIsAddPaymentOpen,
    refreshData,
    addToast,
    setSelectedInvoice
  } = useApp();

  const [viewMode, setViewMode] = useState<'hub' | 'table'>('hub');
  const [activeFilter, setActiveFilter] = useState<'all' | 'debtors' | 'blocked' | 'returns' | 'settlements' | 'statement'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatementCustomer, setSelectedStatementCustomer] = useState<Customer | null>(null);

  const totalDebts = customers.reduce((sum, c) => sum + (c.currentDebt || 0), 0);
  const totalSalesAll = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeFilter === 'debtors') return matchesSearch && c.currentDebt > 0;
    if (activeFilter === 'blocked') return matchesSearch && !c.isActive;
    return matchesSearch;
  });

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الزبون "${name}"؟`)) return;
    try {
      await api.deleteCustomer(id);
      addToast(`تم حذف الزبون "${name}" بنجاح`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'فشل في حذف الزبون', 'error');
    }
  };

  const handleOpenCircle = (filter: 'all' | 'debtors' | 'blocked' | 'returns' | 'settlements' | 'statement') => {
    if (filter === 'settlements') {
      setIsAddPaymentOpen(true);
      return;
    }
    setActiveFilter(filter);
    setViewMode('table');
  };

  return (
    <div className="flex flex-col h-full bg-[#e9ebed] select-none overflow-y-auto">
      {/* Top Banner Header (Dark metallic glossy bar as shown in Zin Stock image) */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1f2023] to-[#161719] text-white px-6 py-3 shadow-md flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-2">
          {viewMode === 'table' ? (
            <button
              onClick={() => setViewMode('hub')}
              className="flex items-center gap-1.5 px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-xs font-bold transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              <span>الرجوع للشاشة الرئيسية (المحور)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setViewMode('table');
                }}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs font-medium border border-neutral-600"
              >
                عرض جدول البيانات
              </button>
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>زبون جديد</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-white font-sans">تسيير الزبائن</span>
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      {viewMode === 'hub' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
          {/* The 6 Famous Circular Buttons of Zin Stock (شبكة الأزرار الدائرية الستة) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-14 max-w-4xl w-full">
            {/* Top Right: قائمة الزبائن */}
            <div className="flex justify-center">
              <button
                onClick={() => handleOpenCircle('all')}
                className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#1b1c1e] text-white flex flex-col items-center justify-center gap-2 shadow-2xl border-2 border-neutral-700 hover:border-red-500 hover:bg-black hover:scale-105 active:scale-95 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white group-hover:text-red-400">
                  <User className="w-9 h-9" />
                </div>
                <span className="text-sm md:text-base font-bold text-slate-100 group-hover:text-white">
                  قائمة الزبائن
                </span>
                <span className="text-[10px] text-slate-400 font-mono-numbers">
                  ({customers.length} زبون)
                </span>
              </button>
            </div>

            {/* Top Center: إرجاع الزبائن */}
            <div className="flex justify-center">
              <button
                onClick={() => handleOpenCircle('returns')}
                className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#1b1c1e] text-white flex flex-col items-center justify-center gap-2 shadow-2xl border-2 border-neutral-700 hover:border-red-500 hover:bg-black hover:scale-105 active:scale-95 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white group-hover:text-red-400">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <span className="text-sm md:text-base font-bold text-slate-100 group-hover:text-white">
                  إرجاع الزبائن
                </span>
                <span className="text-[10px] text-slate-400">
                  (المردودات / Retours)
                </span>
              </button>
            </div>

            {/* Top Left: الدين الشخصي */}
            <div className="flex justify-center">
              <button
                onClick={() => handleOpenCircle('debtors')}
                className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#1b1c1e] text-white flex flex-col items-center justify-center gap-2 shadow-2xl border-2 border-neutral-700 hover:border-red-500 hover:bg-black hover:scale-105 active:scale-95 transition-all group cursor-pointer relative"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white group-hover:text-red-400">
                  <Users className="w-9 h-9" />
                </div>
                <span className="text-sm md:text-base font-bold text-slate-100 group-hover:text-white">
                  الدين الشخصي
                </span>
                <span className="text-[10px] text-red-400 font-bold font-mono-numbers">
                  {formatCurrency(totalDebts)}
                </span>
                {customers.filter(c => c.currentDebt > 0).length > 0 && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {customers.filter(c => c.currentDebt > 0).length} مدين
                  </span>
                )}
              </button>
            </div>

            {/* Bottom Right: حالة الزبائن */}
            <div className="flex justify-center">
              <button
                onClick={() => handleOpenCircle('statement')}
                className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#1b1c1e] text-white flex flex-col items-center justify-center gap-2 shadow-2xl border-2 border-neutral-700 hover:border-red-500 hover:bg-black hover:scale-105 active:scale-95 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white group-hover:text-red-400">
                  <FileText className="w-8 h-8" />
                </div>
                <span className="text-sm md:text-base font-bold text-slate-100 group-hover:text-white">
                  حالة الزبائن
                </span>
                <span className="text-[10px] text-slate-400">
                  (كشف الحساب والوضعية)
                </span>
              </button>
            </div>

            {/* Bottom Center: التسويات (100 & Coins) */}
            <div className="flex justify-center">
              <button
                onClick={() => handleOpenCircle('settlements')}
                className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#1b1c1e] text-white flex flex-col items-center justify-center gap-1 shadow-2xl border-2 border-neutral-700 hover:border-red-500 hover:bg-black hover:scale-105 active:scale-95 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-black font-mono tracking-tighter text-amber-400">100</span>
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-sm md:text-base font-bold text-slate-100 group-hover:text-white mt-1">
                  التسويات
                </span>
                <span className="text-[10px] text-amber-300">
                  (سندات القبض والدفع)
                </span>
              </button>
            </div>

            {/* Bottom Left: الزبائن الموقوفين */}
            <div className="flex justify-center">
              <button
                onClick={() => handleOpenCircle('blocked')}
                className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#1b1c1e] text-white flex flex-col items-center justify-center gap-2 shadow-2xl border-2 border-neutral-700 hover:border-red-500 hover:bg-black hover:scale-105 active:scale-95 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white group-hover:text-red-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <span className="text-sm md:text-base font-bold text-slate-100 group-hover:text-white">
                  الزبائن الموقوفين
                </span>
                <span className="text-[10px] text-slate-400">
                  (غير النشطين)
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Full Data Table & Management View */
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full">
          {/* Action & Filter Bar */}
          <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="بحث باسم الزبون، رقم الهاتف، أو العنوان..."
                  className="w-full pl-3 pr-9 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                />
              </div>

              {/* Tabs filter */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-300 text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 rounded font-bold transition-all ${
                    activeFilter === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل ({customers.length})
                </button>
                <button
                  onClick={() => setActiveFilter('debtors')}
                  className={`px-3 py-1 rounded font-bold transition-all ${
                    activeFilter === 'debtors' ? 'bg-red-600 text-white shadow-2xs' : 'text-red-700 hover:bg-red-50'
                  }`}
                >
                  المدينون فقط ({customers.filter(c => c.currentDebt > 0).length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddPaymentOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>سند قبض / تسوية</span>
              </button>
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة زبون جديد</span>
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#1e2022] text-white border-b border-neutral-700">
                  <tr>
                    <th className="p-2.5 font-bold">إسم الزبون</th>
                    <th className="p-2.5 font-bold">الهاتف والولاية</th>
                    <th className="p-2.5 font-bold">المشتريات الإجمالية</th>
                    <th className="p-2.5 font-bold">الدين الحالي (Crédit)</th>
                    <th className="p-2.5 font-bold">سقف الدين</th>
                    <th className="p-2.5 font-bold">ملاحظات</th>
                    <th className="p-2.5 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        لا يوجد زبائن مطابقون لخيارات البحث
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => (
                      <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <span>{customer.name}</span>
                              {customer.taxNumber && (
                                <span className="block text-[10px] text-slate-400 font-mono">
                                  {customer.taxNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-600">
                          <div>{customer.phone || '—'}</div>
                          <div className="text-[10px] text-slate-400">{customer.address || '—'}</div>
                        </td>
                        <td className="p-2.5 font-mono-numbers font-bold text-slate-700">
                          {formatCurrency(customer.totalPurchases || 0)}
                        </td>
                        <td className="p-2.5">
                          {customer.currentDebt > 0 ? (
                            <span className="font-mono-numbers font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              {formatCurrency(customer.currentDebt)}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">خالص (0.00 د.ج)</span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono-numbers text-slate-600">
                          {customer.creditLimit ? formatCurrency(customer.creditLimit) : 'غير محدد'}
                        </td>
                        <td className="p-2.5 text-slate-500 max-w-xs truncate">
                          {customer.notes || '—'}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedStatementCustomer(customer)}
                              title="كشف حساب الزبون"
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setIsAddPaymentOpen(true);
                              }}
                              title="تسجيل سند قبض ودفع"
                              className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                              title="حذف الزبون"
                              className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customer Account Statement Modal */}
      {selectedStatementCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  كشف حساب الزبون: {selectedStatementCustomer.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono-numbers">
                  هاتف: {selectedStatementCustomer.phone} | العنوان: {selectedStatementCustomer.address || '—'}
                </p>
              </div>
              <button
                onClick={() => setSelectedStatementCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-[11px] text-slate-500">إجمالي المشتريات</span>
                <p className="text-sm font-bold text-slate-800 font-mono-numbers mt-1">
                  {formatCurrency(selectedStatementCustomer.totalPurchases)}
                </p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <span className="text-[11px] text-red-600 font-bold">الدين المتبقي (الذمة)</span>
                <p className="text-sm font-bold text-red-600 font-mono-numbers mt-1">
                  {formatCurrency(selectedStatementCustomer.currentDebt)}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <span className="text-[11px] text-emerald-600 font-bold">سقف الائتمان</span>
                <p className="text-sm font-bold text-emerald-700 font-mono-numbers mt-1">
                  {selectedStatementCustomer.creditLimit ? formatCurrency(selectedStatementCustomer.creditLimit) : 'مفتوح'}
                </p>
              </div>
            </div>

            {/* Invoices list */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">الفواتير وسندات المعاملات</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 text-slate-600 font-bold">
                    <tr>
                      <th className="p-2">رقم الفاتورة</th>
                      <th className="p-2">التاريخ</th>
                      <th className="p-2">المبلغ الإجمالي</th>
                      <th className="p-2">المدفوع</th>
                      <th className="p-2">المتبقي</th>
                      <th className="p-2 text-center">عرض</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales.filter(s => s.customerId === selectedStatementCustomer.id).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">
                          لا توجد فواتير مسجلة لهذا الزبون
                        </td>
                      </tr>
                    ) : (
                      sales
                        .filter(s => s.customerId === selectedStatementCustomer.id)
                        .map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                            <td className="p-2 text-slate-500 font-mono">{formatDate(inv.date)}</td>
                            <td className="p-2 font-mono-numbers font-bold text-slate-700">{formatCurrency(inv.totalAmount)}</td>
                            <td className="p-2 font-mono-numbers text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                            <td className="p-2 font-mono-numbers font-bold text-red-600">{formatCurrency(inv.remainingAmount)}</td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => setSelectedInvoice({ type: 'sale', data: inv })}
                                className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold"
                              >
                                معاينة
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة كشف الحساب</span>
              </button>
              <button
                onClick={() => setSelectedStatementCustomer(null)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-bold"
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
