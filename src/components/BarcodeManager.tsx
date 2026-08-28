import React, { useState } from 'react';
import {
  Barcode,
  Printer,
  Sparkles,
  Search,
  Plus,
  RefreshCw,
  Sliders,
  Check,
  Tag,
  Layers,
  Copy,
  FileText,
  SlidersHorizontal,
  Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { BarcodeView } from './BarcodeView';
import { generateAlgerianBarcode } from '../utils/barcode';

export const BarcodeManager: React.FC = () => {
  const { products, settings, formatCurrency, addToast } = useApp();

  // Selection & custom generation states
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customTitle, setCustomTitle] = useState<string>('مؤسسة عبدو زين للتجارة');
  const [customProductName, setCustomProductName] = useState<string>('');
  const [customBarcode, setCustomBarcode] = useState<string>(generateAlgerianBarcode());
  const [customPrice, setCustomPrice] = useState<number>(1200);
  const [customSku, setCustomSku] = useState<string>('ABDO-001');

  // Print & layout settings
  const [labelSize, setLabelSize] = useState<'thermal_50x30' | 'thermal_40x25' | 'a4_24' | 'a4_40'>('thermal_50x30');
  const [copiesCount, setCopiesCount] = useState<number>(12);
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showProductName, setShowProductName] = useState<boolean>(true);
  const [showSku, setShowSku] = useState<boolean>(true);

  // Selected product sync
  const currentProduct = products.find(p => p.id === selectedProductId);

  const handleSelectProduct = (prod: Product) => {
    setSelectedProductId(prod.id);
    setCustomProductName(prod.name);
    setCustomBarcode(prod.barcode || generateAlgerianBarcode());
    setCustomPrice(prod.sellPrice);
    setCustomSku(prod.sku);
  };

  const handleGenerateNewAlgerianBarcode = () => {
    const newCode = generateAlgerianBarcode();
    setCustomBarcode(newCode);
    addToast(`تم توليد كود باركود جزائري جديد: ${newCode}`, 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine active values
  const activeBarcode = customBarcode || (currentProduct?.barcode) || '6131234567890';
  const activeName = customProductName || (currentProduct?.name) || 'منتج عام';
  const activePrice = customPrice !== undefined ? customPrice : (currentProduct?.sellPrice || 0);
  const activeSku = customSku || (currentProduct?.sku) || 'SKU-001';

  return (
    <div className="flex flex-col h-full bg-[#e9ebed] select-none overflow-y-auto">
      {/* Top Banner Header (Dark metallic bar as in Zin Stock) */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1f2023] to-[#161719] text-white px-6 py-3 shadow-md flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateNewAlgerianBarcode}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>توليد كود باركود جزائري جديد</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة الملصقات ({copiesCount} ملصق)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-white font-sans">تسيير وطباعة الباركود</span>
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white">
            <Barcode className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full">
        {/* Printable Area - only visible when printing */}
        <div className="hidden print:block" dir="rtl">
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #printable-barcode-sheet, #printable-barcode-sheet * { visibility: visible !important; }
            #printable-barcode-sheet {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: ${labelSize.startsWith('thermal') ? '0' : '10mm'} !important;
            }
            @page {
              margin: ${labelSize.startsWith('thermal') ? '0' : '5mm'};
              size: ${labelSize === 'thermal_50x30' ? '50mm 30mm' : labelSize === 'thermal_40x25' ? '40mm 25mm' : 'A4'};
            }
          }
        `}</style>
        <div
          id="printable-barcode-sheet"
          className={`grid gap-2 ${
            labelSize === 'thermal_50x30' || labelSize === 'thermal_40x25'
              ? 'grid-cols-1 p-0'
              : labelSize === 'a4_24'
              ? 'grid-cols-3 gap-3'
              : 'grid-cols-4 gap-2'
          }`}
        >
          {Array.from({ length: copiesCount }).map((_, idx) => (
            <div
              key={idx}
              className="border border-slate-400 p-2 rounded flex flex-col items-center justify-between text-center bg-white page-break-inside-avoid"
              style={{
                width: labelSize === 'thermal_50x30' ? '48mm' : labelSize === 'thermal_40x25' ? '38mm' : 'auto',
                minHeight: labelSize === 'thermal_50x30' ? '28mm' : labelSize === 'thermal_40x25' ? '23mm' : '32mm',
              }}
            >
              {showStoreName && (
                <div className="text-[10px] font-bold text-slate-800 tracking-tight truncate w-full border-b border-slate-200 pb-0.5">
                  {customTitle || settings.storeName || 'عبدو زين'}
                </div>
              )}
              {showProductName && (
                <div className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-2 mt-0.5">
                  {activeName}
                </div>
              )}
              <div className="my-1 flex justify-center w-full">
                <BarcodeView
                  value={activeBarcode}
                  width={labelSize === 'thermal_40x25' ? 120 : 150}
                  height={labelSize === 'thermal_40x25' ? 35 : 42}
                  showText={true}
                  textClassName="text-[10px] font-mono font-bold tracking-wider"
                />
              </div>
              <div className="flex items-center justify-between w-full text-[11px] font-bold px-1 border-t border-slate-200 pt-0.5">
                {showSku && <span className="text-[9px] text-slate-600 font-mono">{activeSku}</span>}
                {showPrice && (
                  <span className="text-slate-900 font-mono-numbers">
                    {formatCurrency(activePrice)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screen View */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-500/10 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded border border-red-500/20">
              🇩🇿 كود باركود جزائري (GS1 613)
            </span>
            <span className="bg-blue-500/10 text-blue-600 text-[11px] font-bold px-2 py-0.5 rounded">
              نظام عبدو زين
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Barcode className="w-6 h-6 text-blue-600" />
            <span>مولد وطباعة ملصقات الباركود (Générateur de Code-Barres)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            توليد باركود قياسي جزائري (EAN-13)، وتخصيص وطباعة ملصقات الأسعار للطابعات الحرارية وورق A4
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateNewAlgerianBarcode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>توليد كود جزائري جديد</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الملصقات ({copiesCount} نسخة)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Generator Controls & Form */}
        <div className="space-y-6">
          {/* Quick Select Product */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>اختيار منتج من المخزون</span>
            </h3>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {products.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className={`p-2.5 flex items-center justify-between cursor-pointer text-xs transition-all ${
                    selectedProductId === prod.id
                      ? 'bg-blue-50/70 border-r-4 border-r-blue-600 font-bold'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="text-slate-800 truncate">{prod.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{prod.barcode}</div>
                  </div>
                  <div className="text-left font-mono-numbers font-bold text-blue-600">
                    {formatCurrency(prod.sellPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Label Customization */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <span>بيانات الملصق (Étiquette)</span>
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">اسم المؤسسة / المتجر:</label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="مؤسسة عبدو زين"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">اسم المنتج / الصنف:</label>
              <input
                type="text"
                value={customProductName}
                onChange={e => setCustomProductName(e.target.value)}
                placeholder="مثال: زيت نباتي 5 لتر"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">السعر (د.ج):</label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={e => setCustomPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold font-mono-numbers focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">رمز الصنف (SKU):</label>
                <input
                  type="text"
                  value={customSku}
                  onChange={e => setCustomSku(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600">رقم الباركود (EAN-13):</label>
                <button
                  onClick={handleGenerateNewAlgerianBarcode}
                  className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  توليد كود (613...)
                </button>
              </div>
              <input
                type="text"
                value={customBarcode}
                onChange={e => setCustomBarcode(e.target.value)}
                placeholder="6130000000000"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold tracking-widest text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Elements checkboxes */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStoreName}
                  onChange={e => setShowStoreName(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>إظهار اسم المؤسسة</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProductName}
                  onChange={e => setShowProductName(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>إظهار اسم المنتج</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={e => setShowPrice(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>إظهار السعر بالدينار الجزائري (د.ج)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSku}
                  onChange={e => setShowSku(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>إظهار كود SKU</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Label Formats & Live Interactive Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">نوع وحجم ورق الطباعة:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLabelSize('thermal_50x30')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    labelSize === 'thermal_50x30'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  حراري 50×30 مم
                </button>
                <button
                  onClick={() => setLabelSize('thermal_40x25')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    labelSize === 'thermal_40x25'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  حراري 40×25 مم
                </button>
                <button
                  onClick={() => setLabelSize('a4_24')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    labelSize === 'a4_24'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ورق A4 (24 ملصق)
                </button>
                <button
                  onClick={() => setLabelSize('a4_40')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    labelSize === 'a4_40'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ورق A4 (40 ملصق)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 text-xs">
              <span className="text-slate-600 font-semibold">عدد الملصقات المطلوب طباعتها:</span>
              <div className="flex items-center gap-2">
                {[1, 6, 12, 24, 48, 100].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setCopiesCount(cnt)}
                    className={`px-2.5 py-1 rounded text-xs font-bold font-mono-numbers transition-all ${
                      copiesCount === cnt
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={copiesCount}
                  onChange={e => setCopiesCount(Math.max(1, Number(e.target.value)))}
                  className="w-16 px-2 py-1 rounded border border-slate-200 text-xs font-bold text-center font-mono-numbers"
                />
              </div>
            </div>
          </div>

          {/* Single Sticker Master Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 font-bold mb-4">معاينة الملصق المباشر (Preview en direct)</span>
            
            <div className="border-2 border-dashed border-slate-300 p-4 rounded-xl bg-slate-50/50 flex items-center justify-center shadow-inner">
              <div className="bg-white border border-slate-800 rounded-lg p-3 shadow-md w-72 flex flex-col items-center justify-between text-center min-h-[170px]">
                {showStoreName && (
                  <div className="text-xs font-extrabold text-slate-800 border-b border-slate-200 pb-1 w-full tracking-tight">
                    {customTitle || 'مؤسسة عبدو زين'}
                  </div>
                )}
                {showProductName && (
                  <div className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                    {activeName}
                  </div>
                )}
                <div className="my-2">
                  <BarcodeView
                    value={activeBarcode}
                    width={180}
                    height={50}
                    showText={true}
                    textClassName="text-xs font-mono font-bold tracking-widest text-slate-900"
                  />
                </div>
                <div className="flex items-center justify-between w-full border-t border-slate-200 pt-1 text-xs font-bold">
                  {showSku && <span className="text-[10px] text-slate-500 font-mono">{activeSku}</span>}
                  {showPrice && (
                    <span className="text-sm font-extrabold text-blue-700 font-mono-numbers">
                      {formatCurrency(activePrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 text-center max-w-md">
              تمت برمجة الخطوط بدقة هندسية لتلائم جميع أجهزة قارئ الباركود الضوئية والليزريّة الشائعة في المحلات والأسواق الجزائرية.
            </p>
          </div>

          {/* Multi Sheet Preview Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-xs text-slate-800">
                  نموذج الشبكة ({copiesCount} ملصق متسلسل للطباعة)
                </h4>
              </div>
              <button
                onClick={handlePrint}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                طباعة الآن
              </button>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-2 bg-slate-100/60 rounded-lg">
              {Array.from({ length: Math.min(copiesCount, 18) }).map((_, i) => (
                <div key={i} className="bg-white p-2 rounded border border-slate-200 text-center shadow-2xs flex flex-col items-center justify-between">
                  {showStoreName && <div className="text-[9px] font-bold text-slate-700 truncate w-full">{customTitle}</div>}
                  {showProductName && <div className="text-[10px] font-bold text-slate-800 truncate w-full">{activeName}</div>}
                  <div className="my-1">
                    <BarcodeView value={activeBarcode} width={110} height={32} showText={false} />
                  </div>
                  <div className="text-[9px] font-mono text-slate-500">{activeBarcode}</div>
                  {showPrice && (
                    <div className="text-[10px] font-bold text-blue-600 font-mono-numbers mt-0.5">
                      {formatCurrency(activePrice)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {copiesCount > 18 && (
              <p className="text-[10px] text-slate-400 text-center mt-2">
                يتم عرض أول 18 ملصقاً في المعاينة (سيتم إرسال كامل {copiesCount} ملصق إلى أمر الطباعة).
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
