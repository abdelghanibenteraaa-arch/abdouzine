import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  Plus,
  Receipt,
  Truck,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const {
    financialSummary,
    formatCurrency,
    formatDate,
    sales,
    purchases,
    products,
    setActiveTab,
    setSelectedInvoice,
    setIsAddProductOpen,
    setAdjustStockProduct,
    settings
  } = useApp();

  const lowStockList = products.filter(p => p.currentStock <= p.minStockAlert).slice(0, 5);
  const recentSales = sales.slice(0, 5);
  const recentPurchases = purchases.slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-[#e9ebed] select-none overflow-y-auto">
      {/* Top Banner Header (Dark metallic bar as in Zin Stock) */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1f2023] to-[#161719] text-white px-6 py-3 shadow-md flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>نقطة بيع سريعة (POS)</span>
          </button>
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة صنف</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-white font-sans">لوحة التحكم والإحصائيات</span>
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full">

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today & Total Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي المبيعات</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-800 font-mono-numbers">
              {formatCurrency(financialSummary?.totalSales || 0)}
            </div>
            <div className="text-[11px] text-green-600 font-semibold mt-1 flex items-center gap-1">
              <span>اليوم: {formatCurrency(financialSummary?.todaySales || 0)}</span>
              <span className="text-slate-300">|</span>
              <span>الشهر: {formatCurrency(financialSummary?.monthSales || 0)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Purchases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي المشتريات</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-800 font-mono-numbers">
              {formatCurrency(financialSummary?.totalPurchases || 0)}
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <span>هذا الشهر: {formatCurrency(financialSummary?.monthPurchases || 0)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">صافي الأرباح المحققة</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-blue-600 font-mono-numbers">
              {formatCurrency(financialSummary?.netProfit || 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              هامش الربح التشغيلي على المبيعات
            </div>
          </div>
        </div>

        {/* Card 4: Inventory Valuation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">قيمة بضاعة المخزون</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-800 font-mono-numbers">
              {formatCurrency(financialSummary?.inventoryTotalCostValue || 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              القيمة بسعر البيع: <strong className="font-mono-numbers text-slate-700">{formatCurrency(financialSummary?.inventoryTotalRetailValue || 0)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Receivables & Payables Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-rose-500 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">ديون العملاء (مستحقات لنا)</div>
              <div className="text-lg font-bold text-rose-600 font-mono-numbers">
                {formatCurrency(financialSummary?.totalReceivables || 0)}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('customers')}
            className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-all"
          >
            إدارة ديون العملاء
          </button>
        </div>

        {/* Supplier Payables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-r-4 border-r-blue-500 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">مستحقات الموردين (ديون علينا)</div>
              <div className="text-lg font-bold text-slate-800 font-mono-numbers">
                {formatCurrency(financialSummary?.totalPayables || 0)}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('suppliers')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-all"
          >
            إدارة الموردين
          </button>
        </div>
      </div>

      {/* Two Column Layout: Low Stock Warnings & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800">تنبيهات نقص المخزون</h3>
              </div>
              <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {financialSummary?.lowStockCount || 0} صنف
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {lowStockList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-7 h-7 text-green-500 mx-auto mb-2 opacity-80" />
                  جميع مستويات المخزون ممتازة ولا يوجد نقص حالياً
                </div>
              ) : (
                lowStockList.map(prod => (
                  <div key={prod.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{prod.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono-numbers">
                        الحد الأدنى: {prod.minStockAlert} {prod.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold font-mono-numbers px-2 py-0.5 rounded ${
                          prod.currentStock <= 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prod.currentStock} {prod.unit}
                      </span>
                      <button
                        onClick={() => setAdjustStockProduct(prod)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-all"
                      >
                        تسوية
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('inventory')}
              className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              عرض كامل تقرير المخزون &larr;
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Sales Invoices */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-green-600" />
                <h3 className="font-bold text-sm text-slate-800">أحدث فواتير المبيعات</h3>
              </div>
              <button
                onClick={() => setActiveTab('sales')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                جميع المبيعات ({sales.length})
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="text-slate-400 bg-slate-50/50 border-b border-slate-100">
                    <th className="py-2 px-2 font-semibold">رقم الفاتورة</th>
                    <th className="py-2 px-2 font-semibold">العميل</th>
                    <th className="py-2 px-2 font-semibold">التاريخ</th>
                    <th className="py-2 px-2 font-semibold">الإجمالي</th>
                    <th className="py-2 px-2 font-semibold">طريقة الدفع</th>
                    <th className="py-2 px-2 font-semibold text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        لا توجد فواتير مبيعات مسجلة حتى الآن
                      </td>
                    </tr>
                  ) : (
                    recentSales.map(inv => (
                      <tr key={inv.id} className="hover:bg-blue-50/40 transition-all">
                        <td className="py-2.5 px-2 font-bold font-mono-numbers text-slate-800">{inv.invoiceNumber}</td>
                        <td className="py-2.5 px-2 text-slate-700 font-medium">{inv.customerName}</td>
                        <td className="py-2.5 px-2 text-slate-500 font-mono-numbers">{formatDate(inv.date)}</td>
                        <td className="py-2.5 px-2 font-bold font-mono-numbers text-green-700">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              inv.paymentType === 'cash'
                                ? 'bg-green-100 text-green-700'
                                : inv.paymentType === 'card'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.paymentType === 'cash'
                              ? 'نقدي'
                              : inv.paymentType === 'card'
                              ? 'شبكة/بطاقة'
                              : 'آجل / ذمة'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => setSelectedInvoice({ type: 'sale', data: inv })}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-blue-600 transition-all"
                            title="عرض وطباعة الفاتورة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800">أحدث فواتير المشتريات من الموردين</h3>
              </div>
              <button
                onClick={() => setActiveTab('purchases')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                جميع المشتريات ({purchases.length})
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="text-slate-400 bg-slate-50/50 border-b border-slate-100">
                    <th className="py-2 px-2 font-semibold">رقم الفاتورة</th>
                    <th className="py-2 px-2 font-semibold">المورد</th>
                    <th className="py-2 px-2 font-semibold">التاريخ</th>
                    <th className="py-2 px-2 font-semibold">الإجمالي</th>
                    <th className="py-2 px-2 font-semibold">المتبقي (الذمة)</th>
                    <th className="py-2 px-2 font-semibold text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        لا توجد فواتير مشتريات مسجلة حتى الآن
                      </td>
                    </tr>
                  ) : (
                    recentPurchases.map(pur => (
                      <tr key={pur.id} className="hover:bg-blue-50/40 transition-all">
                        <td className="py-2.5 px-2 font-bold font-mono-numbers text-slate-800">{pur.invoiceNumber}</td>
                        <td className="py-2.5 px-2 text-slate-700 font-medium">{pur.supplierName}</td>
                        <td className="py-2.5 px-2 text-slate-500 font-mono-numbers">{formatDate(pur.date)}</td>
                        <td className="py-2.5 px-2 font-bold font-mono-numbers text-blue-700">
                          {formatCurrency(pur.totalAmount)}
                        </td>
                        <td className="py-2.5 px-2 font-mono-numbers">
                          {pur.remainingAmount > 0 ? (
                            <span className="text-red-600 font-bold">{formatCurrency(pur.remainingAmount)}</span>
                          ) : (
                            <span className="text-green-600 font-semibold">مسدد بالكامل</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => setSelectedInvoice({ type: 'purchase', data: pur })}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-blue-600 transition-all"
                            title="عرض الفاتورة"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
};
