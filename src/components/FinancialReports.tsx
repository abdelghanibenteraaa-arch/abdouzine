import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Coins,
  Receipt,
  PlusCircle,
  Trash2,
  Calculator,
  Scale,
  Sparkles,
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExpenseRecord } from '../types';

export const FinancialReports: React.FC = () => {
  const {
    financialSummary,
    formatCurrency,
    formatDate,
    settings,
    updateSettings,
    sales,
    purchases,
    products,
    expenses,
    addExpense,
    deleteExpense,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cash_box' | 'expenses' | 'zakat'>('cash_box');

  // New expense form modal state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState<{
    title: string;
    category: 'rent' | 'electricity' | 'salaries' | 'transport' | 'maintenance' | 'taxes' | 'other';
    amount: number;
    date: string;
    paymentMethod: 'cash' | 'check' | 'bank_transfer';
    recipient: string;
    notes: string;
  }>({
    title: '',
    category: 'other',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    recipient: '',
    notes: ''
  });

  // Zakat Calculator Configuration state
  const [goldPrice, setGoldPrice] = useState<number>(settings.zakatConfig?.goldPriceGram || 14500); // 14,500 DZD per gram gold 24k
  const [nisabGrams, setNisabGrams] = useState<number>(settings.zakatConfig?.nisabGoldGrams || 85);
  const [cashInHand, setCashInHand] = useState<number>(financialSummary?.cashOnHand || 150000);
  const [debtsOwedToUs, setDebtsOwedToUs] = useState<number>(financialSummary?.totalReceivables || 0);
  const [debtsWeOwe, setDebtsWeOwe] = useState<number>(financialSummary?.totalPayables || 0);

  // Financial calculations
  const totalCostOfGoodsSold = sales.reduce((sum, s) => {
    const cost = s.items.reduce((iSum, itm) => iSum + itm.costPrice * itm.quantity, 0);
    return sum + cost;
  }, 0);

  const grossProfit = (financialSummary?.totalSales || 0) - totalCostOfGoodsSold;
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpensesAmount;

  const profitMarginPercent =
    (financialSummary?.totalSales || 0) > 0
      ? Math.round((grossProfit / (financialSummary?.totalSales || 1)) * 100)
      : 0;

  // Zakat calculations
  const nisabThreshold = goldPrice * nisabGrams;
  const inventoryCostValue = financialSummary?.inventoryTotalCostValue || 0;
  const zakatPool = inventoryCostValue + cashInHand + debtsOwedToUs - debtsWeOwe;
  const isZakatEligible = zakatPool >= nisabThreshold;
  const zakatDue = isZakatEligible ? Math.max(0, zakatPool * 0.025) : 0;

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title.trim() || expenseForm.amount <= 0) {
      addToast('يرجى كتابة بيان المصروف وإدخال مبلغ صحيح', 'warning');
      return;
    }

    await addExpense({
      ...expenseForm,
      amount: Number(expenseForm.amount)
    });

    addToast('تم تسجيل المصروف في الصندوق بنجاح', 'success');
    setIsAddingExpense(false);
    setExpenseForm({
      title: '',
      category: 'other',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      recipient: '',
      notes: ''
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#e9ebed] select-none overflow-y-auto font-sans" dir="rtl">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1f2023] to-[#161719] text-white px-5 py-3 shadow-md flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير الشامل</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg md:text-xl font-black tracking-tight text-white">الصندوق المالي، النفقات، وحساب الزكاة</span>
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub Navigation Ribbon */}
      <div className="bg-[#1f2125] border-b border-neutral-700 px-4 py-2 flex items-center gap-2 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab('cash_box')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'cash_box'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>6:00 .. الصندوق وحساب الأرباح (Profits)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>6:50 .. المصاريف والنفقات التشغيلية ({expenses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('zakat')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'zakat'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>6:00 .. حاسبة زكاة التجارة (2.5%)</span>
        </button>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto w-full">
        
        {/* TAB 1: CASH BOX & FINANCIAL SUMMARY */}
        {activeTab === 'cash_box' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Top 3 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                  <span>إجمالي المبيعات المحصلة</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-black font-mono-numbers text-emerald-700">
                  {formatCurrency(financialSummary?.totalSales || 0)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">من {sales.length} عملية بيع مسجلة</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-300 p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                  <span>إجمالي تكاليف السلع المباعة</span>
                  <ArrowDownLeft className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-xl font-black font-mono-numbers text-rose-600">
                  {formatCurrency(totalCostOfGoodsSold)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">سعر الشراء الأصلي للبضاعة</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-100 mb-1">
                  <span>صافي الأرباح الصافية (Net Profit)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-200" />
                </div>
                <div className="text-2xl font-black font-mono-numbers text-white">
                  {formatCurrency(netProfit)}
                </div>
                <div className="text-[11px] text-emerald-100 mt-1">
                  بعد خصم المصاريف ({formatCurrency(totalExpensesAmount)})
                </div>
              </div>
            </div>

            {/* Main Income Statement Card */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    قائمة الدخل والأرباح ({settings.storeName})
                  </h3>
                  <span className="text-xs text-slate-500">
                    تاريخ إصدار التقرير: {new Date().toLocaleDateString('ar-DZ')}
                  </span>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-800 font-black rounded-xl text-xs flex items-center gap-1 border border-emerald-200">
                  <TrendingUp className="w-4 h-4" />
                  <span>هامش الربح الإجمالي: {profitMarginPercent}%</span>
                </div>
              </div>

              {/* Breakdown Items */}
              <div className="space-y-3 divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-700">إجمالي إيرادات المبيعات (Revenue)</span>
                  </div>
                  <span className="font-black font-mono-numbers text-emerald-700 text-base">
                    +{formatCurrency(financialSummary?.totalSales || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="font-bold text-slate-700">تكلفة البضاعة المباعة (COGS)</span>
                  </div>
                  <span className="font-bold font-mono-numbers text-rose-600 text-base">
                    -{formatCurrency(totalCostOfGoodsSold)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-black text-slate-900">إجمالي الربح الإجمالي (Gross Profit)</span>
                  <span className="font-black font-mono-numbers text-indigo-700 text-lg">
                    {formatCurrency(grossProfit)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="font-bold text-slate-700">إجمالي المصاريف والنفقات التشغيلية</span>
                  </div>
                  <span className="font-bold font-mono-numbers text-amber-700">
                    -{formatCurrency(totalExpensesAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                  <span className="font-black text-emerald-950 text-base">الربح الصافي النهائي (Net Income)</span>
                  <span className="font-black font-mono-numbers text-emerald-800 text-xl">
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assets & Liabilities Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs space-y-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>الأصول وقيمة رأس المال في المحل</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                    <span className="text-slate-600 font-bold">قيمة السلع في المخزن (بسعر الشراء):</span>
                    <span className="font-black font-mono-numbers text-slate-900">
                      {formatCurrency(financialSummary?.inventoryTotalCostValue || 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                    <span className="text-slate-600 font-bold">القيمة التقديرية للسلع (بسعر البيع):</span>
                    <span className="font-black font-mono-numbers text-emerald-700">
                      {formatCurrency(financialSummary?.inventoryTotalRetailValue || 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl flex justify-between text-amber-900 border border-amber-200">
                    <span className="font-bold">ديون مستحقة على الزبائن (كريدي للقبض):</span>
                    <span className="font-black font-mono-numbers text-amber-800 text-sm">
                      {formatCurrency(financialSummary?.totalReceivables || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs space-y-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-rose-600" />
                  <span>الالتزامات والديون للموردين</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-rose-50 rounded-xl flex justify-between text-rose-900 border border-rose-200">
                    <span className="font-bold">مستحقات الموردين غير المسددة (ديون علينا):</span>
                    <span className="font-black font-mono-numbers text-rose-700 text-sm">
                      {formatCurrency(financialSummary?.totalPayables || 0)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                    <span className="text-slate-600 font-bold">عدد فواتير البيع المنجزة:</span>
                    <span className="font-bold font-mono-numbers text-slate-900">{sales.length} فاتورة</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                    <span className="text-slate-600 font-bold">عدد فواتير الشراء والتوريد:</span>
                    <span className="font-bold font-mono-numbers text-slate-900">{purchases.length} شحنة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPENSES MANAGEMENT */}
        {activeTab === 'expenses' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    6:50 .. إدارة المصاريف والنفقات العامة للمحل
                  </h3>
                  <p className="text-xs text-slate-500">
                    تسجيل إيجار المحل، فواتير الكهرباء سونلغاز، الرواتب، النقل، والمصاريف اليومية
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>تسجيل مصروف جديد +</span>
                </button>
              </div>

              {/* Add Expense Form Box */}
              {isAddingExpense && (
                <div className="p-4 bg-slate-50 border-2 border-red-200 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-black text-xs text-red-900">إضافة سند مصروف جديد</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingExpense(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      إلغاء
                    </button>
                  </div>

                  <form onSubmit={handleCreateExpense} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">بيان المصروف *</label>
                        <input
                          type="text"
                          value={expenseForm.title}
                          onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                          placeholder="مثال: فاتورة كهرباء شهر أوت"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المبلغ (د.ج) *</label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={expenseForm.amount || ''}
                          onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono-numbers font-bold text-slate-900 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع التصنيف</label>
                        <select
                          value={expenseForm.category}
                          onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none"
                        >
                          <option value="rent">إيجار المحل / المستودع</option>
                          <option value="electricity">كهرباء وغاز (سونلغاز)</option>
                          <option value="salaries">رواتب وأجور العمال</option>
                          <option value="transport">نقل وشحن بضائع</option>
                          <option value="maintenance">صيانة وتجهيزات</option>
                          <option value="taxes">ضرائب ورسوم</option>
                          <option value="other">مصاريف عامة أخرى</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المدفوع له (المستلم)</label>
                        <input
                          type="text"
                          value={expenseForm.recipient}
                          onChange={e => setExpenseForm({ ...expenseForm, recipient: e.target.value })}
                          placeholder="اسم الشخص أو الشركة"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ الدفع</label>
                        <input
                          type="date"
                          value={expenseForm.date}
                          onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono-numbers text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">طريقة الدفع</label>
                        <select
                          value={expenseForm.paymentMethod}
                          onChange={e => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none"
                        >
                          <option value="cash">نقداً من الصندوق (Cash)</option>
                          <option value="check">شيك بنكي (Chèque)</option>
                          <option value="bank_transfer">تحويل بريدي / بنكي</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingExpense(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors"
                      >
                        حفظ سند المصروف
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Expenses List Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">بيان المصروف</th>
                      <th className="p-3">التصنيف</th>
                      <th className="p-3">المبلغ</th>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">المدفوع له</th>
                      <th className="p-3">طريقة الدفع</th>
                      <th className="p-3 text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{exp.title}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {exp.category === 'rent'
                              ? 'إيجار'
                              : exp.category === 'electricity'
                              ? 'كهرباء وغاز'
                              : exp.category === 'salaries'
                              ? 'رواتب'
                              : exp.category === 'transport'
                              ? 'نقل وشحن'
                              : exp.category === 'maintenance'
                              ? 'صيانة'
                              : exp.category === 'taxes'
                              ? 'ضرائب'
                              : 'مصاريف عامة'}
                          </span>
                        </td>
                        <td className="p-3 font-black font-mono-numbers text-rose-600">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="p-3 font-mono-numbers text-slate-600">{exp.date}</td>
                        <td className="p-3 text-slate-700">{exp.recipient || '—'}</td>
                        <td className="p-3 text-slate-600">
                          {exp.paymentMethod === 'cash' ? 'نقداً' : exp.paymentMethod === 'check' ? 'شيك' : 'تحويل'}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف مصروف: ${exp.title}؟`)) {
                                deleteExpense(exp.id);
                                addToast('تم حذف المصروف بنجاح', 'info');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          لا توجد مصاريف مسجلة حتى الآن. انقر على "تسجيل مصروف جديد +" للإضافة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ISLAMIC ZAKAT CALCULATOR */}
        {activeTab === 'zakat' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Scale className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    6:00 .. حاسبة زكاة عروض التجارة والسيولة النقدية (2.5%)
                  </h3>
                  <p className="text-xs text-slate-500">
                    حساب الوعاء الزكوي للمحل التجاري وفق الشريعة الإسلامية عند مرور الحول وبلوغ النصاب
                  </p>
                </div>
              </div>

              {/* Zakat Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر غرام الذهب عيار 24 (د.ج)</label>
                  <input
                    type="number"
                    value={goldPrice}
                    onChange={e => setGoldPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 font-mono-numbers font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">السعر الحالي المعتمد في الجزائر</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نصاب الذهب الشرعي (غرام)</label>
                  <input
                    type="number"
                    value={nisabGrams}
                    onChange={e => setNisabGrams(Number(e.target.value) || 85)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 font-mono-numbers font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">النصاب الشرعي: 85 غرام ذهب</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">السيولة النقدية في الصندوق / البنك</label>
                  <input
                    type="number"
                    value={cashInHand}
                    onChange={e => setCashInHand(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 font-mono-numbers font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">المال النقدي الجاهز</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">قيمة نصاب الزكاة الحالي</label>
                  <div className="px-3 py-2 bg-amber-100/70 rounded-xl border border-amber-300 font-mono-numbers font-black text-amber-900">
                    {formatCurrency(nisabThreshold)}
                  </div>
                  <span className="text-[10px] text-amber-700 mt-1 block font-bold">85 غرام × سعر الغرام</span>
                </div>
              </div>

              {/* Zakat Equation Visual Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                <h4 className="font-black text-sm text-slate-900">معادلة حساب الوعاء الزكوي لعروض التجارة:</h4>
                <div className="space-y-2 divide-y divide-slate-200">
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-700">+ قيمة السلع والبضائع في المخزن (بسعر الشراء):</span>
                    <span className="font-black font-mono-numbers text-slate-900">{formatCurrency(inventoryCostValue)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-slate-700">+ السيولة النقدية المتوفرة (كاسة + بنك):</span>
                    <span className="font-black font-mono-numbers text-slate-900">{formatCurrency(cashInHand)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-slate-700">+ الديون المرجوة التي لنا عند الزبائن (Receivables):</span>
                    <span className="font-black font-mono-numbers text-slate-900">{formatCurrency(debtsOwedToUs)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-rose-700">
                    <span className="font-bold">- الديون الحالّة والواجب سدادها للموردين (Payables):</span>
                    <span className="font-black font-mono-numbers">-{formatCurrency(debtsWeOwe)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-black text-slate-900 text-sm">= إجمالي الوعاء الزكوي الصافي:</span>
                    <span className="font-black font-mono-numbers text-indigo-700 text-base">{formatCurrency(zakatPool)}</span>
                  </div>
                </div>
              </div>

              {/* Result Banner */}
              <div className={`p-5 rounded-2xl border-2 flex items-center justify-between ${
                isZakatEligible
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                <div>
                  <h4 className="font-black text-sm mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isZakatEligible ? 'المال بلغ النصاب وحالت عليه الزكاة الشرعية' : 'المال لم يبلغ النصاب حتى الآن'}</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    نسبة الزكاة الشرعية: <strong>2.5% (ربع العشر)</strong> من إجمالي الوعاء الزكوي
                  </p>
                </div>

                <div className="text-left">
                  <span className="text-[11px] font-bold text-slate-500 block">مقدار الزكاة الواجب إخراجها:</span>
                  <span className="text-2xl font-black font-mono-numbers text-emerald-700">
                    {formatCurrency(zakatDue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
