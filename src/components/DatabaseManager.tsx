import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Server,
  FileCode,
  HardDrive,
  Copy,
  Check,
  Search,
  Table
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const DatabaseManager: React.FC = () => {
  const { dbStats, refreshData, addToast, products, sales, purchases, customers, suppliers, inventoryLogs } = useApp();

  const [activeTable, setActiveTable] = useState<'products' | 'sales' | 'purchases' | 'customers' | 'suppliers' | 'inventoryLogs'>('products');
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Export JSON file
  const handleExport = async () => {
    try {
      const data = await api.exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `erp_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('تم تصدير نسخة احتياطية كاملة من قاعدة البيانات بنجاح', 'success');
    } catch (err: any) {
      addToast('فشل في تصدير قاعدة البيانات', 'error');
    }
  };

  // Import JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.importDatabase(json);
        addToast('تم استعادة واستيراد قاعدة البيانات بنجاح!', 'success');
        await refreshData();
      } catch (err: any) {
        addToast(err.message || 'الملف غير صالح أو حدث خطأ أثناء الاستيراد', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to sample data
  const handleResetData = async () => {
    if (!window.confirm('هل تريد إعادة تعيين قاعدة البيانات واسترجاع البيانات النموذجية الافتراضية؟ سيتم استبدال البيانات الحالية.')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDatabase();
      addToast('تمت إعادة تعيين قاعدة البيانات للبيانات النموذجية', 'success');
      await refreshData();
    } catch (err: any) {
      addToast('فشل في إعادة تعيين البيانات', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Copy raw active table JSON
  const getTableData = () => {
    switch (activeTable) {
      case 'products':
        return products;
      case 'sales':
        return sales;
      case 'purchases':
        return purchases;
      case 'customers':
        return customers;
      case 'suppliers':
        return suppliers;
      case 'inventoryLogs':
        return inventoryLogs;
      default:
        return [];
    }
  };

  const currentTableData = getTableData();
  const filteredData = filterText.trim()
    ? (currentTableData as any[]).filter(item =>
        JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase())
      )
    : currentTableData;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentTableData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#e9ebed] select-none overflow-y-auto">
      {/* Top Banner Header (Dark metallic bar as in Zin Stock) */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1f2023] to-[#161719] text-white px-6 py-3 shadow-md flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير نسخة احتياطية</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-neutral-300" />
            <span>استرجاع نسخة</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-white font-sans">تسيير وإدارة قاعدة البيانات</span>
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full">

      {/* Database Health & Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">حالة المحرك (Engine)</span>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-100"></div>
          </div>
          <div className="text-sm font-bold text-slate-800 mt-2 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-green-600" />
            <span>قاعدة بيانات نشطة ومتصلة</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono-numbers mt-1 block">
            {dbStats?.databasePath || 'data/erp_database.json'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي السجلات (Total Rows)</span>
          <div className="text-xl font-bold text-blue-600 font-mono-numbers mt-1">
            {dbStats?.totalRecords || 0} سجل
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">
            موزعة على 7 جداول رئيسية
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">حجم ملف البيانات</span>
          <div className="text-xl font-bold text-slate-800 font-mono-numbers mt-1">
            {dbStats?.sizeKb || 0} KB
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">
            تخزين JSON دائم ومفهرس
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إعادة تعيين للبيانات الافتراضية</span>
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="w-full mt-2 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-all border border-red-200"
          >
            {isResetting ? 'جاري الإعادة...' : 'إعادة ضبط البيانات النموذجية'}
          </button>
        </div>
      </div>

      {/* Table Browser & Schema Viewer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
        {/* Table Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTable('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTable === 'products'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              جدول المنتجات ({products.length})
            </button>
            <button
              onClick={() => setActiveTable('sales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTable === 'sales'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              جدول المبيعات ({sales.length})
            </button>
            <button
              onClick={() => setActiveTable('purchases')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTable === 'purchases'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              جدول المشتريات ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTable('customers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTable === 'customers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              جدول العملاء ({customers.length})
            </button>
            <button
              onClick={() => setActiveTable('suppliers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTable === 'suppliers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              جدول الموردين ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTable('inventoryLogs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTable === 'inventoryLogs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              سجل الحركات ({inventoryLogs.length})
            </button>
          </div>

          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ JSON للجدول'}</span>
          </button>
        </div>

        {/* Live Filter in Table */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="بحث مباشر وتصفية داخل هذا الجدول..."
            className="w-full pl-3 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Data Records View */}
        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-96 text-emerald-400 font-mono text-xs text-left" dir="ltr">
          <pre>{JSON.stringify(filteredData, null, 2)}</pre>
        </div>
      </div>
      </div>
    </div>
  );
};
