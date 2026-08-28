import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode as BarcodeIcon,
  SlidersHorizontal,
  ArrowDownToLine,
  CheckCircle2,
  Layers,
  Printer,
  Minus,
  Menu,
  Bell,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { api } from '../services/api';

export const InventoryManager: React.FC = () => {
  const {
    products,
    categories,
    formatCurrency,
    setIsAddProductOpen,
    setAdjustStockProduct,
    refreshData,
    addToast,
    settings
  } = useApp();

  const [searchRef, setSearchRef] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'available'>('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => products[0]?.id || null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesRef =
      !searchRef.trim() ||
      (p.codeRef && p.codeRef.toLowerCase().includes(searchRef.toLowerCase())) ||
      p.sku.toLowerCase().includes(searchRef.toLowerCase()) ||
      p.barcode.includes(searchRef);

    const matchesName =
      !searchName.trim() ||
      p.name.toLowerCase().includes(searchName.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchName.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = p.currentStock > 0 && p.currentStock <= p.minStockAlert;
    else if (stockFilter === 'out') matchesStock = p.currentStock <= 0;
    else if (stockFilter === 'available') matchesStock = p.currentStock > p.minStockAlert;

    return matchesRef && matchesName && matchesCategory && matchesStock;
  });

  const totalStockItems = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalCostValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.currentStock * p.sellPrice, 0);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المنتج "${name}" نهائياً من قاعدة البيانات؟`)) return;
    try {
      await api.deleteProduct(id);
      addToast(`تم حذف المنتج "${name}" بنجاح`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err.message || 'فشل في حذف المنتج', 'error');
    }
  };

  // CSV Export
  const exportToCsv = () => {
    const headers = ['المرجع', 'الرمز (SKU)', 'الباركود', 'اسم المنتج', 'التصنيف', 'سعر الشراء', 'سعر البيع', 'الكمية بالمخزن', 'الوحدة', 'موقع التخزين'];
    const rows = filteredProducts.map(p => [
      p.codeRef || '',
      p.sku,
      p.barcode,
      `"${p.name.replace(/"/g, '""')}"`,
      p.categoryName || '',
      p.costPrice,
      p.sellPrice,
      p.currentStock,
      p.unit,
      p.location || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_zin_stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[#d0d3d8] select-none overflow-hidden font-sans">
      
      {/* Top Application Ribbon / Zin Stock Header */}
      <div className="bg-[#0f1012] px-3 py-1.5 flex items-center justify-between border-b-2 border-neutral-800 text-white shrink-0">
        {/* Left Window Utility Icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-black shadow-xs transition-all active:scale-95"
            title="إضافة سلعة وبضاعة جديدة (F2)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>إضافة بضاعة جديدة</span>
          </button>

          <button
            onClick={exportToCsv}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-slate-200 rounded text-xs font-bold transition-all"
            title="تصدير السجل"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>تصدير Excel</span>
          </button>
        </div>

        {/* Center / Right Title */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-black tracking-wide text-white">إدارة البضائع والمخزون - Zin Stock</span>
          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black">
            {products.length}
          </div>
        </div>
      </div>

      {/* SEARCH STRIP (Exact replica of the gray metallic search bar in screenshot hq720) */}
      <div className="bg-gradient-to-b from-[#e3e6eb] via-[#d4d8df] to-[#c7cbd3] p-2 border-b-2 border-slate-400 flex flex-wrap items-center justify-between gap-2 shadow-xs shrink-0">
        
        {/* Search Inputs matching Zin Stock Screenshot */}
        <div className="flex items-center gap-2 flex-1 max-w-3xl">
          {/* Box 1: Search by Reference with Search Icon */}
          <div className="flex items-center bg-white border border-slate-400 rounded shadow-inner flex-1 max-w-[280px]">
            <input
              type="text"
              value={searchRef}
              onChange={e => setSearchRef(e.target.value)}
              placeholder="البحث بواسطة المرجع / الكود..."
              className="flex-1 text-xs font-bold text-slate-800 px-2.5 py-1.5 bg-transparent focus:outline-none placeholder:text-slate-400 text-right"
            />
            <button
              type="button"
              className="p-1.5 bg-slate-200 hover:bg-slate-300 border-r border-slate-300 text-slate-700 flex items-center justify-center shrink-0"
              title="بحث"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Box 2: Search by Name / Brand with Search Icon */}
          <div className="flex items-center bg-white border border-slate-400 rounded shadow-inner flex-1 max-w-[280px]">
            <input
              type="text"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              placeholder="البحث باسم السلعة أو الصنف..."
              className="flex-1 text-xs font-bold text-slate-800 px-2.5 py-1.5 bg-transparent focus:outline-none placeholder:text-slate-400 text-right"
            />
            <button
              type="button"
              className="p-1.5 bg-slate-200 hover:bg-slate-300 border-r border-slate-300 text-slate-700 flex items-center justify-center shrink-0"
              title="بحث"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-400 text-xs font-bold rounded px-2 py-1.5 text-slate-800 focus:outline-none shadow-2xs"
          >
            <option value="all">جميع الأقسام</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="bg-white border border-slate-400 text-xs font-bold rounded px-2 py-1.5 text-slate-800 focus:outline-none shadow-2xs"
          >
            <option value="all">كل الحالات</option>
            <option value="available">المتوفر فقط</option>
            <option value="low">منخفض المخزون</option>
            <option value="out">النافذ (0)</option>
          </select>
        </div>

        {/* Summary Info */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
          <span>العدد المعروض: <strong className="font-mono-numbers text-red-700">{filteredProducts.length}</strong></span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">إجمالي القطع: <strong className="font-mono-numbers text-slate-900">{totalStockItems}</strong></span>
        </div>
      </div>

      {/* PRODUCTS TABLE (Exact Replica of Zin Stock Grid with Solid Black Header, Green Selected Row, and DZ Currency) */}
      <div className="flex-1 bg-white overflow-auto border-b border-slate-300">
        <table className="w-full text-xs text-right border-collapse select-none">
          {/* SOLID BLACK HEADER WITH SEARCH ICONS */}
          <thead className="bg-[#121315] text-white sticky top-0 z-10 shadow-sm">
            <tr className="border-b border-neutral-700">
              <th className="p-2.5 text-center font-bold text-[11px] w-12 border-l border-neutral-700">
                #
              </th>
              <th className="p-2.5 text-center font-bold text-[11px] w-24 border-l border-neutral-700">
                <div className="flex items-center justify-center gap-1">
                  <Search className="w-3 h-3 opacity-60" />
                  <span>المرجع</span>
                </div>
              </th>
              <th className="p-2.5 text-center font-bold text-[11px] w-36 border-l border-neutral-700">
                <div className="flex items-center justify-center gap-1">
                  <Search className="w-3 h-3 opacity-60" />
                  <span>الكود بار</span>
                </div>
              </th>
              <th className="p-2.5 font-bold text-[11px] border-l border-neutral-700">
                <div className="flex items-center gap-1">
                  <Search className="w-3 h-3 opacity-60" />
                  <span>اسم السلعة / البضاعة</span>
                </div>
              </th>
              <th className="p-2.5 text-center font-bold text-[11px] w-28 border-l border-neutral-700">
                <span>التصنيف</span>
              </th>
              <th className="p-2.5 text-center font-bold text-[11px] w-24 border-l border-neutral-700">
                <div className="flex items-center justify-center gap-1">
                  <Search className="w-3 h-3 opacity-60" />
                  <span>إدخال بواسطة</span>
                </div>
              </th>
              <th className="p-2.5 text-center font-bold text-[11px] w-28 border-l border-neutral-700">
                <span>سعر الشراء</span>
              </th>
              <th className="p-2.5 text-center font-bold text-[11px] w-32 border-l border-neutral-700 bg-[#1e2024]">
                <div className="flex items-center justify-center gap-1 text-yellow-400">
                  <Search className="w-3 h-3 text-yellow-400" />
                  <span className="font-black text-xs">سعر البيع</span>
                </div>
              </th>
              <th className="p-2.5 text-center font-bold text-[11px] w-24 border-l border-neutral-700">
                <span>المخزون</span>
              </th>
              <th className="p-2.5 text-center font-bold text-[11px] w-24">
                <span>إجراءات</span>
              </th>
            </tr>
          </thead>
          
          {/* BODY ROWS */}
          <tbody className="divide-y divide-slate-300 text-slate-800">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-slate-400 bg-slate-50">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm">لا توجد بضائع تطابق البحث</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod, idx) => {
                const isSelected = selectedProductId === prod.id || (!selectedProductId && idx === 0);
                const isOutOfStock = prod.currentStock <= 0;
                const isLowStock = prod.currentStock > 0 && prod.currentStock <= prod.minStockAlert;

                return (
                  <tr
                    key={prod.id}
                    onClick={() => setSelectedProductId(prod.id)}
                    className={`cursor-pointer transition-colors border-b border-slate-300 ${
                      isSelected
                        ? 'bg-[#98e698] font-bold text-slate-950 shadow-inner'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-slate-100'
                        : 'bg-[#f4f6f8] hover:bg-slate-100'
                    }`}
                  >
                    {/* Index */}
                    <td className="p-2 text-center font-mono-numbers font-bold text-[11px] border-l border-slate-300 text-slate-600">
                      {idx + 1}
                    </td>

                    {/* Reference (Code) */}
                    <td className="p-2 text-center font-mono-numbers font-black text-xs border-l border-slate-300 text-red-700">
                      {prod.codeRef || prod.id}
                    </td>

                    {/* Barcode */}
                    <td className="p-2 text-center font-mono-numbers font-semibold text-xs border-l border-slate-300 text-slate-700">
                      <div className="flex items-center justify-center gap-1">
                        <span>{prod.barcode}</span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setBarcodeProduct(prod);
                          }}
                          className="text-slate-400 hover:text-slate-800 p-0.5"
                          title="عرض ملصق الباركود"
                        >
                          <BarcodeIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="p-2 font-bold text-slate-900 border-l border-slate-300 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{prod.name}</span>
                        {prod.brand && (
                          <span className="text-[10px] text-slate-500 font-normal">({prod.brand})</span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-2 text-center border-l border-slate-300 text-[11px] text-slate-600 font-medium">
                      {prod.categoryName || 'عام'}
                    </td>

                    {/* Entry By / Unit (إدخال بواسطة) */}
                    <td className="p-2 text-center font-mono-numbers font-bold text-xs border-l border-slate-300 text-slate-800">
                      1 {prod.unit || 'قطعة'}
                    </td>

                    {/* Cost Price */}
                    <td className="p-2 text-center font-mono-numbers font-semibold text-xs border-l border-slate-300 text-slate-600">
                      {Number(prod.costPrice).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} دج
                    </td>

                    {/* Sell Price (Styled matching Zin Stock screenshot: e.g. 20,00 دج) */}
                    <td
                      className={`p-2 text-center font-mono-numbers font-black text-sm border-l border-slate-300 ${
                        isSelected ? 'text-slate-950 font-black' : 'text-emerald-700 font-black'
                      }`}
                    >
                      {Number(prod.sellPrice).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} دج
                    </td>

                    {/* Current Stock */}
                    <td className="p-2 text-center border-l border-slate-300 font-mono-numbers font-black text-xs">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700 font-black'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800 font-black'
                            : 'text-slate-900'
                        }`}
                      >
                        {prod.currentStock} {prod.unit}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setAdjustStockProduct(prod);
                          }}
                          className="p-1 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded transition-all"
                          title="تسوية جردية / تعديل المخزون"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteProduct(prod.id, prod.name);
                          }}
                          className="p-1 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded transition-all"
                          title="حذف الصنف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* BOTTOM STATUS FOOTER BAR */}
      <div className="bg-[#e4e7eb] px-4 py-2 border-t-2 border-slate-400 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-[#98e698] border border-emerald-600 inline-block"></span>
            <span>السطر المحدد حالياً</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-bold">
            <span>إجمالي قيمة المخزون بالشراء:</span>
            <span className="font-mono-numbers text-blue-700">{formatCurrency(totalCostValue)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-bold">
            <span>القيمة البيعية الإجمالية:</span>
            <span className="font-mono-numbers text-emerald-700">{formatCurrency(totalRetailValue)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white font-black rounded shadow-xs text-xs flex items-center gap-1 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>إضافة بضاعة (F2)</span>
          </button>
        </div>
      </div>

      {/* Barcode Viewer Modal */}
      {barcodeProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-slate-300 text-center space-y-4 font-sans">
            <h3 className="font-bold text-sm text-slate-800">بطاقة باركود الصنف</h3>
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
              <div className="font-bold text-xs text-slate-800">{barcodeProduct.name}</div>
              <div className="font-mono-numbers text-lg font-black tracking-widest text-slate-900 my-2">
                ||||| | |||| ||| |||||||
              </div>
              <div className="font-mono-numbers font-bold text-xs text-slate-700">
                {barcodeProduct.barcode}
              </div>
              <div className="text-sm font-black text-emerald-700 font-mono-numbers">
                السعر: {Number(barcodeProduct.sellPrice).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} دج
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded flex items-center justify-center gap-1"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الملصق</span>
              </button>
              <button
                onClick={() => setBarcodeProduct(null)}
                className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded"
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
