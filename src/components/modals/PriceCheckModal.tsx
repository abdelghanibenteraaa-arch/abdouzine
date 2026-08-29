import React, { useState, useEffect, useRef } from 'react';
import {
  Tag,
  Search,
  Barcode,
  X,
  Plus,
  Printer,
  Package,
  Layers,
  Building2,
  TrendingUp,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';

interface PriceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export const PriceCheckModal: React.FC<PriceCheckModalProps> = ({
  isOpen,
  onClose,
  onAddToCart
}) => {
  const { products, formatCurrency, addToast, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showCostPrice, setShowCostPrice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedProduct(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Keyboard navigation & Shortcuts (Esc to close, Enter to add to cart)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCameraOpen) {
          setIsCameraOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCameraOpen, onClose]);

  if (!isOpen) return null;

  // Filter products matching barcode, SKU, name, or codeRef
  const cleanSearch = searchTerm.trim().toLowerCase();
  const matchedProducts = cleanSearch
    ? products.filter(p => {
        const barcodeMatch = p.barcode && p.barcode.toLowerCase().includes(cleanSearch);
        const skuMatch = p.sku && p.sku.toLowerCase().includes(cleanSearch);
        const nameMatch = p.name.toLowerCase().includes(cleanSearch);
        const brandMatch = p.brand && p.brand.toLowerCase().includes(cleanSearch);
        const codeRefMatch = p.codeRef && p.codeRef.toLowerCase().includes(cleanSearch);
        return barcodeMatch || skuMatch || nameMatch || brandMatch || codeRefMatch;
      })
    : [];

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSearchTerm('');
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cleanSearch) return;

    // Exact barcode match first
    const exactBarcode = products.find(p => p.barcode && p.barcode.toLowerCase() === cleanSearch);
    if (exactBarcode) {
      setSelectedProduct(exactBarcode);
      setSearchTerm('');
      return;
    }

    // Exact SKU match
    const exactSku = products.find(p => p.sku && p.sku.toLowerCase() === cleanSearch);
    if (exactSku) {
      setSelectedProduct(exactSku);
      setSearchTerm('');
      return;
    }

    // First matched
    if (matchedProducts.length > 0) {
      setSelectedProduct(matchedProducts[0]);
      setSearchTerm('');
    } else {
      addToast('لم يتم العثور على أي سلعة مطابقة لهذا الرمز أو الاسم', 'warning');
    }
  };

  const handleCameraScan = (code: string) => {
    setIsCameraOpen(false);
    const found = products.find(p => p.barcode === code || p.sku === code);
    if (found) {
      setSelectedProduct(found);
      addToast(`تم العثور على: ${found.name}`, 'success');
    } else {
      setSearchTerm(code);
      addToast(`لم يتم العثور على سلعة بالباركود: ${code}`, 'info');
    }
  };

  const handlePrintPriceTag = () => {
    if (!selectedProduct) return;
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) {
      addToast('يرجى السماح بالنوافذ المنبثقة للطباعة', 'warning');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>ملصق سعر - ${selectedProduct.name}</title>
          <style>
            @page { size: 50mm 30mm; margin: 0; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 8px;
              text-align: center;
              box-sizing: border-box;
            }
            .store { font-size: 10px; font-weight: bold; color: #555; border-bottom: 1px dashed #ccc; padding-bottom: 2px; }
            .name { font-size: 12px; font-weight: 900; margin: 4px 0; max-height: 28px; overflow: hidden; }
            .price { font-size: 20px; font-weight: 900; color: #b91c1c; margin: 4px 0; }
            .currency { font-size: 11px; font-weight: bold; }
            .barcode { font-size: 9px; font-family: monospace; letter-spacing: 1px; color: #333; }
          </style>
        </head>
        <body>
          <div class="store">${settings.storeName}</div>
          <div class="name">${selectedProduct.name}</div>
          <div class="price">${Number(selectedProduct.sellPrice).toLocaleString('fr-DZ')} <span class="currency">د.ج</span></div>
          <div class="barcode">${selectedProduct.barcode || selectedProduct.sku}</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 max-w-xl w-full overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#1c1d20] via-[#2a2c31] to-[#1c1d20] p-4 text-white flex items-center justify-between border-b-2 border-amber-500 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                معرفة واستعلام السعر والمخزون
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Price Check
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">امسح الكودبار بالسكانير أو ابحث بالاسم لعرض السعر فوراً</p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="إغلاق (Esc)"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Scanner Input Bar */}
        <div className="p-4 bg-slate-100 border-b border-slate-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Barcode className="w-5 h-5 text-slate-400 absolute right-3.5 top-3" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="امسح الباركود بجهاز السكانير أو اكتب اسم السلعة أو SKU..."
                className="w-full pl-3 pr-11 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-inner"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              title="مسح بالكاميرا"
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">كاميرا</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-transform active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>بحث</span>
            </button>
          </form>

          {/* Quick Matches Dropdown if typing */}
          {cleanSearch.length > 0 && !selectedProduct && (
            <div className="mt-2 bg-white rounded-xl border border-slate-300 shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
              {matchedProducts.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 font-medium">
                  لا توجد نتائج مطابقة لـ "{searchTerm}"
                </div>
              ) : (
                matchedProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="p-2.5 flex items-center justify-between hover:bg-amber-50/70 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>الباركود: {p.barcode || p.sku}</span>
                        {p.brand && <span className="text-slate-400">| الماركة: {p.brand}</span>}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-red-600 font-mono-numbers">
                        {formatCurrency(p.sellPrice)}
                      </div>
                      <div className="text-[10px] text-slate-500">المتوفر: {p.currentStock} {p.unit}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Product Big Display Card */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {selectedProduct ? (
            <div className="space-y-4">
              {/* Product Header & Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-black">
                        {selectedProduct.categoryName || 'عام'}
                      </span>
                      {selectedProduct.brand && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {selectedProduct.brand}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 leading-snug">{selectedProduct.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                      <span className="flex items-center gap-1 text-slate-700 font-bold">
                        <Barcode className="w-3.5 h-3.5 text-amber-600" />
                        {selectedProduct.barcode || selectedProduct.sku}
                      </span>
                      {selectedProduct.codeRef && <span>المرجع: {selectedProduct.codeRef}</span>}
                    </div>
                  </div>

                  {/* Stock Status Pill */}
                  <div className="text-left">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-2xs ${
                        selectedProduct.currentStock <= 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : selectedProduct.currentStock <= (selectedProduct.minStockAlert || 5)
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {selectedProduct.currentStock <= 0 ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          نفذ من المخزن (0)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          متوفر: {selectedProduct.currentStock} {selectedProduct.unit}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Big Retail Sell Price Display Box */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-100 block">سعر البيع للزبون (تجزئة):</span>
                    <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono-numbers mt-0.5">
                      {Number(selectedProduct.sellPrice).toLocaleString('fr-DZ', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl bg-white/15 border border-white/25">
                    <span className="text-xs text-red-100 block font-medium">العملة</span>
                    <span className="text-2xl font-black">د.ج</span>
                  </div>
                </div>

                {/* Grid of details: Wholesale, Cost, Stock Location */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 text-xs">
                  {/* Wholesale Price */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 font-semibold block text-[11px]">سعر الجملة (Gros):</span>
                    <span className="text-sm font-black text-blue-700 font-mono-numbers mt-0.5 block">
                      {selectedProduct.wholesalePrice
                        ? formatCurrency(selectedProduct.wholesalePrice)
                        : formatCurrency(selectedProduct.sellPrice * 0.9)}
                    </span>
                  </div>

                  {/* Cost Price with Toggle */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold text-[11px]">سعر الشراء (التكلفة):</span>
                      <button
                        type="button"
                        onClick={() => setShowCostPrice(!showCostPrice)}
                        className="text-[10px] text-amber-700 font-bold hover:underline"
                      >
                        {showCostPrice ? 'إخفاء' : 'إظهار'}
                      </button>
                    </div>
                    <span className="text-sm font-black text-slate-800 font-mono-numbers mt-0.5 block">
                      {showCostPrice ? formatCurrency(selectedProduct.costPrice) : '•••••• د.ج'}
                    </span>
                  </div>

                  {/* Shelf / Location */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                    <span className="text-slate-500 font-semibold block text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      الموقع / الرف:
                    </span>
                    <span className="text-xs font-black text-slate-700 mt-0.5 block truncate">
                      {selectedProduct.shelfLocation || selectedProduct.storageArea || 'الرف الرئيسي / العرض'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Selected Product */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintPriceTag}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>طباعة ملصق السعر</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    بحث عن سلعة أخرى
                  </button>
                </div>

                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(selectedProduct);
                      onClose();
                      addToast(`تمت إضافة ${selectedProduct.name} إلى الفاتورة`, 'success');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة فورية لوصل البيع</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Empty State Guide */
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
                <Barcode className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-800">جاهز لمسح الباركود واستعلام السعر</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  وجّه جهاز قارئ الباركود (السكانير) نحو السلعة، أو اكتب جزءاً من اسم السلعة للتحقق الفوري من السعر ورصيد المخزون.
                </p>
              </div>

              {/* Quick sample products to click */}
              {products.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">أصناف سريعة للاستعلام:</span>
                  <div className="flex flex-wrap justify-center gap-1.5 max-h-32 overflow-y-auto">
                    {products.slice(0, 6).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProduct(p)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold text-slate-700">
              Esc
            </span>
            <span>للإغلاق</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Barcode Camera Scanner Child Modal */}
      <BarcodeScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScan={handleCameraScan}
        title="مسح باركود السلعة للاستعلام عن السعر"
      />
    </div>
  );
};
