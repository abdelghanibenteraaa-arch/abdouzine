import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Minus,
  Trash2,
  Barcode as BarcodeIcon,
  Camera,
  Calendar,
  Image as ImageIcon,
  Smartphone,
  Ruler,
  Package,
  Scale,
  Search,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { BarcodeScannerModal } from './BarcodeScannerModal';

export const AddProductModal: React.FC = () => {
  const {
    isAddProductOpen,
    setIsAddProductOpen,
    productDraft,
    setProductDraft,
    categories,
    products,
    refreshData,
    addToast
  } = useApp();

  // Active Tab: 'product' | 'pack' | 'images' | 'specs' | 'sizes'
  const [activeTab, setActiveTab] = useState<'product' | 'pack' | 'images' | 'specs' | 'sizes'>('product');
  const [activeLang, setActiveLang] = useState<'ar' | 'fr'>('ar');

  // Next auto-incremented Reference Code
  const nextCodeRef = String((products.length > 0 ? Math.max(...products.map(p => Number(p.codeRef || p.id) || 0)) : 0) + 1 || (products.length + 1));

  // Form Fields
  const [creationDate, setCreationDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  });
  const [codeRef, setCodeRef] = useState(nextCodeRef);
  const [nameAr, setNameAr] = useState('');
  const [nameFr, setNameFr] = useState('');

  // Classification
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('قطعة');
  const [isStockable, setIsStockable] = useState(true); // يخزن vs لا يخزن (خدمات)

  // Barcodes list (Left panel)
  const [currentBarcodeInput, setCurrentBarcodeInput] = useState('');
  const [barcodeList, setBarcodeList] = useState<string[]>([]);
  const [autoOpenWindow, setAutoOpenWindow] = useState<'open' | 'no_open'>('no_open');
  const [printBarcodeLabel, setPrintBarcodeLabel] = useState(false);
  const [barcodePrintCount, setBarcodePrintCount] = useState(0);

  // Pricing & Taxes
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stampPercent, setStampPercent] = useState<number>(0.00);
  const [sellPriceT01, setSellPriceT01] = useState<number>(0);
  const [marginT01, setMarginT01] = useState<number>(0);
  const [sellPriceT02, setSellPriceT02] = useState<number>(0);
  const [marginT02, setMarginT02] = useState<number>(0);
  const [sellPriceT03, setSellPriceT03] = useState<number>(0);
  const [marginT03, setMarginT03] = useState<number>(0);

  // Scale & Sizes
  const [isScaleProduct, setIsScaleProduct] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);

  // Stock & Pack
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [hasBoxPack, setHasBoxPack] = useState(false);
  const [boxQuantity, setBoxQuantity] = useState<number>(1);
  const [packPrice, setPackPrice] = useState<number>(0);
  const [packBarcode, setPackBarcode] = useState<string>('');
  const [minStockAlert, setMinStockAlert] = useState<number>(0);
  const [storageLocation, setStorageLocation] = useState('');

  // Expiry
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryAlertDays, setExpiryAlertDays] = useState<number>(30);

  // Media & Specs
  const [imageUrl, setImageUrl] = useState('');
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [productColor, setProductColor] = useState('');
  const [productSize, setProductSize] = useState('');

  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAddProductOpen) {
      const code = String((products.length > 0 ? Math.max(...products.map(p => Number(p.codeRef || p.id) || 0)) : 0) + 1 || (products.length + 1));
      setCodeRef(code);
      const d = new Date();
      setCreationDate(`${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`);
      
      if (productDraft?.barcode) {
        setBarcodeList([productDraft.barcode]);
        if (productDraft.name) {
          setNameAr(productDraft.name);
        }
      } else if (barcodeList.length === 0) {
        setBarcodeList([code]);
      }
    }
  }, [isAddProductOpen, products.length, productDraft]);

  if (!isAddProductOpen) return null;

  // Add barcode
  const handleAddBarcode = () => {
    const code = currentBarcodeInput.trim() || ('613' + Math.floor(1000000000 + Math.random() * 9000000000));
    if (barcodeList.includes(code)) {
      addToast('هذا الباركود مضاف مسبقاً في القائمة', 'warning');
      return;
    }
    setBarcodeList(prev => [code, ...prev]);
    setCurrentBarcodeInput('');
  };

  const handleRemoveBarcode = (index: number) => {
    setBarcodeList(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateBarcode = () => {
    const generated = '613' + Math.floor(1000000000 + Math.random() * 9000000000);
    setCurrentBarcodeInput(generated);
  };

  // Submit & Save
  const handleSaveProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalName = activeLang === 'ar' ? (nameAr.trim() || nameFr.trim()) : (nameFr.trim() || nameAr.trim());
    if (!finalName) {
      addToast('يرجى إدخال اسم السلعة / البضاعة في خانة الوصف', 'warning');
      return;
    }

    const primarySellPrice = sellPriceT01 > 0 ? sellPriceT01 : (costPrice > 0 ? costPrice * 1.2 : 0);
    const primaryBarcode = barcodeList[0] || codeRef || ('613' + Math.floor(1000000000 + Math.random() * 9000000000));
    const selectedCat = categories.find(c => c.id === categoryId);

    setIsSubmitting(true);
    try {
      await api.createProduct({
        name: finalName,
        nameFr: nameFr.trim() || undefined,
        codeRef: codeRef,
        sku: 'REF-' + codeRef,
        barcode: primaryBarcode,
        barcodes: barcodeList.length > 0 ? barcodeList : [primaryBarcode],
        categoryId: categoryId,
        categoryName: selectedCat?.name || 'عام',
        brand: brand.trim() || undefined,
        costPrice: Number(costPrice) || 0,
        sellPrice: Number(primarySellPrice) || 0,
        wholesalePrice: Number(sellPriceT02) || Number(primarySellPrice) || 0,
        tvaRate: Number(stampPercent) || 0,
        isService: !isStockable,
        currentStock: !isStockable ? 9999 : (Number(currentStock) || 0),
        minStockAlert: Number(minStockAlert) || 0,
        unit: unit || 'قطعة',
        hasBoxPack: hasBoxPack,
        boxQuantity: hasBoxPack ? (Number(boxQuantity) || 1) : undefined,
        packPrice: hasBoxPack && packPrice > 0 ? Number(packPrice) : undefined,
        packBarcode: hasBoxPack && packBarcode.trim() ? packBarcode.trim() : undefined,
        location: storageLocation.trim() || undefined,
        expiryDate: expiryDate || undefined,
        imageUrl: imageUrl.trim() || undefined,
        isActive: true,
      });

      addToast(`✅ تم حفظ السلعة "${finalName}" بنجاح في قاعدة البيانات`, 'success');
      await refreshData();
      setIsAddProductOpen(false);

      // Reset
      setNameAr('');
      setNameFr('');
      setCurrentBarcodeInput('');
    } catch (err: any) {
      addToast(err.message || 'فشل في حفظ السلعة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 z-50 animate-in fade-in select-none font-sans" dir="rtl">
      {/* Main Window Box */}
      <div className="bg-[#ffffff] rounded-lg max-w-2xl w-full shadow-2xl border-2 border-slate-400 overflow-hidden flex flex-col max-h-[96vh] text-slate-900">
        
        {/* TOP BLACK BAR: [X] [💾] on Left | "بطاقة السلعة" on Right */}
        <div className="bg-[#000000] text-white px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Close Button (X in white circle) */}
            <button
              type="button"
              onClick={() => setIsAddProductOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center font-black shadow-md transition-transform active:scale-95 cursor-pointer"
              title="إلغاء وإغلاق"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Save Button (Floppy Disk in white circle) */}
            <button
              type="button"
              onClick={() => handleSaveProduct()}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center font-black shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              title="حفظ بطاقة السلعة"
            >
              <Save className="w-5 h-5 fill-black text-black" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-white font-black text-sm tracking-wide">
            <span>بطاقة السلعة / إضافة منتج جديد</span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-mono text-amber-300">F1</span>
            <div className="p-1 border border-white/40 rounded-xs">
              <Package className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* SUBHEADER: Flags on Left | Pink/Red Tabs on Right */}
        <div className="bg-[#f2f4f7] px-3 py-1 flex items-center justify-between border-b border-slate-300">
          {/* Flags */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveLang('ar')}
              className={`w-7 h-5 flex items-center justify-center rounded-xs overflow-hidden border ${
                activeLang === 'ar' ? 'border-red-600 ring-1 ring-red-500 scale-105' : 'border-slate-300 opacity-70 hover:opacity-100'
              }`}
              title="العربية"
            >
              <span className="text-base leading-none">🇩🇿</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLang('fr')}
              className={`w-7 h-5 flex items-center justify-center rounded-xs overflow-hidden border ${
                activeLang === 'fr' ? 'border-red-600 ring-1 ring-red-500 scale-105' : 'border-slate-300 opacity-70 hover:opacity-100'
              }`}
              title="Français"
            >
              <span className="text-base leading-none">🇫🇷</span>
            </button>
          </div>

          {/* Right Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('product')}
              className={`px-3 py-1 text-xs font-black rounded-t-xs transition-all ${
                activeTab === 'product'
                  ? 'bg-[#d03d3d] text-white shadow-xs'
                  : 'bg-[#ecccd3] text-[#7a2f3e] hover:bg-[#e4bac3]'
              }`}
            >
              البضاعة
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pack')}
              className={`px-2.5 py-1 text-xs font-bold rounded-t-xs transition-all ${
                activeTab === 'pack'
                  ? 'bg-[#d03d3d] text-white shadow-xs'
                  : 'bg-[#ecccd3] text-[#7a2f3e] hover:bg-[#e4bac3]'
              }`}
            >
              الحزمة / الطرد
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('images')}
              className={`px-2.5 py-1 text-xs font-bold rounded-t-xs transition-all ${
                activeTab === 'images'
                  ? 'bg-[#d03d3d] text-white shadow-xs'
                  : 'bg-[#ecccd3] text-[#7a2f3e] hover:bg-[#e4bac3]'
              }`}
            >
              الصور
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-2.5 py-1 text-xs font-bold rounded-t-xs transition-all ${
                activeTab === 'specs'
                  ? 'bg-[#d03d3d] text-white shadow-xs'
                  : 'bg-[#ecccd3] text-[#7a2f3e] hover:bg-[#e4bac3]'
              }`}
            >
              خصائص / الهواتف
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sizes')}
              className={`px-2.5 py-1 text-xs font-bold rounded-t-xs transition-all ${
                activeTab === 'sizes'
                  ? 'bg-[#d03d3d] text-white shadow-xs'
                  : 'bg-[#ecccd3] text-[#7a2f3e] hover:bg-[#e4bac3]'
              }`}
            >
              المقاس
            </button>
          </div>
        </div>

        {/* MODAL MAIN FORM BODY */}
        <div className="p-3 space-y-2 overflow-y-auto flex-1 bg-white text-xs">
          
          {/* TAB 1: البضاعة (Matching exact Zin Stock layout) */}
          {activeTab === 'product' && (
            <div className="space-y-2">
              
              {/* Row 1: رمز البضاعة + تاريخ الإنشاء */}
              <div className="grid grid-cols-12 gap-2 items-center">
                {/* Date Input with Calendar Icon (Left side) */}
                <div className="col-span-5 flex items-center bg-white border border-slate-400 rounded-xs px-2 py-1 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
                  <input
                    type="text"
                    value={creationDate}
                    onChange={e => setCreationDate(e.target.value)}
                    className="w-full text-center font-mono-numbers font-bold text-slate-800 bg-transparent focus:outline-none text-xs"
                  />
                </div>

                <div className="col-span-2 text-center font-bold text-slate-700">
                  تاريخ الإنشاء
                </div>

                {/* Ref ID input box (Right side) */}
                <div className="col-span-3">
                  <input
                    type="text"
                    value={codeRef}
                    onChange={e => setCodeRef(e.target.value)}
                    className="w-full text-center font-mono-numbers font-bold text-slate-900 border border-slate-400 rounded-xs px-2 py-1 bg-white focus:outline-none text-xs shadow-2xs"
                  />
                </div>

                <div className="col-span-2 text-left font-bold text-slate-800">
                  رمز البضاعة
                </div>
              </div>

              {/* Row 2: المرجع (Red Square Indicator + Red Bold Code) */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-10 flex items-center bg-white border border-slate-400 rounded-xs p-1 shadow-2xs">
                  <div className="w-4 h-4 border border-red-600 rounded-2xs flex items-center justify-center bg-white mr-1 shrink-0">
                    <div className="w-2 h-2 bg-red-600 rounded-3xs"></div>
                  </div>
                  <div className="flex-1 text-center font-mono-numbers font-black text-red-600 text-sm">
                    {codeRef}
                  </div>
                </div>

                <div className="col-span-2 text-left font-bold text-slate-800">
                  المرجع
                </div>
              </div>

              {/* Row 3: الوصف (Wide silver/gray bar for product designation) */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-10">
                  <input
                    type="text"
                    value={activeLang === 'ar' ? nameAr : nameFr}
                    onChange={e => {
                      if (activeLang === 'ar') setNameAr(e.target.value);
                      else setNameFr(e.target.value);
                    }}
                    placeholder={
                      activeLang === 'ar'
                        ? 'أدخل وصف أو اسم السلعة...'
                        : 'Désignation de la marchandise...'
                    }
                    className="w-full bg-[#c8ccd0] hover:bg-[#bcc1c6] focus:bg-white border border-slate-400 rounded-xs px-3 py-1.5 font-bold text-slate-900 text-xs text-right focus:outline-none focus:border-red-600 shadow-inner"
                    required
                  />
                </div>

                <div className="col-span-2 text-left font-bold text-slate-800">
                  الوصف
                </div>
              </div>

              {/* Row 4: Two-Columns Split (Left: Barcode Panel | Right: Pricing & Classification) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1">
                
                {/* LEFT COLUMN: Barcode Scanning & Multi-Barcode Box (md:col-span-5) */}
                <div className="md:col-span-5 flex flex-col justify-between border border-slate-400 rounded-xs p-1.5 bg-[#fafbfc]">
                  
                  <div>
                    {/* Header: إدخال الباركود */}
                    <div className="bg-[#1b1c1e] text-white text-center py-1 font-black text-xs rounded-xs mb-1.5 shadow-xs">
                      إدخال الباركود
                    </div>

                    {/* Barcode scan input row */}
                    <div className="flex items-center gap-1 mb-1.5">
                      <button
                        type="button"
                        onClick={handleGenerateBarcode}
                        className="p-1 bg-white hover:bg-slate-100 border border-slate-400 rounded-xs text-slate-700 shrink-0 shadow-2xs"
                        title="توليد باركود تلقائي"
                      >
                        <BarcodeIcon className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCameraScannerOpen(true)}
                        className="p-1 bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-slate-600 rounded-xs shrink-0 shadow-2xs"
                        title="مسح الباركود بكاميرا الهاتف"
                      >
                        <Camera className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        value={currentBarcodeInput}
                        onChange={e => setCurrentBarcodeInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBarcode();
                          }
                        }}
                        placeholder="الكود بار أو المسح بالكاميرا..."
                        className="flex-1 min-w-0 bg-white border border-slate-400 rounded-xs px-2 py-0.5 font-mono-numbers font-bold text-slate-900 text-xs focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={handleAddBarcode}
                        className="w-6 h-6 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-full flex items-center justify-center font-black shrink-0 shadow-xs cursor-pointer"
                        title="إضافة"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>

                    {/* Barcode Table with Purple Header */}
                    <div className="border border-slate-400 rounded-xs overflow-hidden bg-white min-h-[140px] max-h-[160px] overflow-y-auto">
                      <table className="w-full text-xs text-center border-collapse">
                        <thead className="bg-[#381c3e] text-white font-bold text-[10px]">
                          <tr>
                            <th className="py-1 px-1 border-b border-purple-950 w-12 flex items-center justify-center gap-0.5">
                              <Search className="w-2.5 h-2.5" />
                              <span>إزالة</span>
                            </th>
                            <th className="py-1 px-2 border-b border-purple-950">
                              <div className="flex items-center justify-center gap-1">
                                <Search className="w-2.5 h-2.5" />
                                <span>الكود بار</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed divide-slate-300">
                          {barcodeList.length === 0 ? (
                            <tr>
                              <td colSpan={2} className="py-8 text-center text-slate-400 text-[11px]">
                                لا توجد أكواد مسجلة
                              </td>
                            </tr>
                          ) : (
                            barcodeList.map((code, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-1 px-1 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBarcode(idx)}
                                    className="p-0.5 rounded hover:bg-red-100 text-red-600 mx-auto"
                                    title="حذف"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </td>
                                <td className="py-1 px-2 font-mono-numbers font-bold text-slate-900 text-xs">
                                  {code}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Below Barcodes: Options & Counter */}
                  <div className="pt-2 space-y-1.5 text-[11px]">
                    {/* Radio: عدم فتح vs فتح النافذة */}
                    <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="window_open"
                          checked={autoOpenWindow === 'no_open'}
                          onChange={() => setAutoOpenWindow('no_open')}
                          className="accent-pink-600 w-3 h-3"
                        />
                        <span>عدم فتح</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="window_open"
                          checked={autoOpenWindow === 'open'}
                          onChange={() => setAutoOpenWindow('open')}
                          className="accent-pink-600 w-3 h-3"
                        />
                        <span>فتح النافذة</span>
                      </label>
                    </div>

                    {/* Checkbox: طباعة الباركود 40*20 مم */}
                    <div className="flex items-center gap-1.5 px-1 bg-slate-100 py-0.5 rounded-xs">
                      <input
                        type="checkbox"
                        checked={printBarcodeLabel}
                        onChange={e => setPrintBarcodeLabel(e.target.checked)}
                        className="accent-red-600 rounded-2xs w-3 h-3"
                      />
                      <span className="font-semibold text-slate-700">طباعة الباركود 40*20 مم</span>
                    </div>

                    {/* Counter Control: (+) [0] (-) */}
                    <div className="flex items-center justify-center gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setBarcodePrintCount(prev => prev + 1)}
                        className="w-6 h-6 rounded-full bg-[#d03d3d] hover:bg-red-700 text-white flex items-center justify-center font-black shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={barcodePrintCount}
                        onChange={e => setBarcodePrintCount(Number(e.target.value) || 0)}
                        className="w-16 bg-white border border-slate-400 text-center font-mono-numbers font-black text-xs py-0.5 rounded-xs"
                      />

                      <button
                        type="button"
                        onClick={() => setBarcodePrintCount(prev => Math.max(0, prev - 1))}
                        className="w-6 h-6 rounded-full bg-[#d03d3d] hover:bg-red-700 text-white flex items-center justify-center font-black shadow-xs cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Classification, Prices T01/T02/T03, Stock (md:col-span-7) */}
                <div className="md:col-span-7 space-y-1.5">
                  
                  {/* العائلة (Category) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-9">
                      <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        className="w-full bg-white border border-slate-400 rounded-xs px-2 py-1 font-bold text-slate-800 text-xs focus:outline-none"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      العائلة
                    </div>
                  </div>

                  {/* العلامة التجارية (Brand) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-9">
                      <input
                        type="text"
                        value={brand}
                        onChange={e => setBrand(e.target.value)}
                        placeholder="العلامة التجارية..."
                        className="w-full bg-white border border-slate-400 rounded-xs px-2 py-1 font-bold text-slate-800 text-xs focus:outline-none"
                      >
                      </input>
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      العلامة التجارية
                    </div>
                  </div>

                  {/* الوحدة (Unit) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-9">
                      <select
                        value={unit}
                        onChange={e => setUnit(e.target.value)}
                        className="w-full bg-white border border-slate-400 rounded-xs px-2 py-1 font-bold text-slate-800 text-xs focus:outline-none"
                      >
                        <option value="قطعة">قطعة</option>
                        <option value="كرتون">كرتون</option>
                        <option value="علبة">علبة</option>
                        <option value="كغ">كغ</option>
                        <option value="لتر">لتر</option>
                        <option value="متر">متر</option>
                        <option value="حزمة">حزمة</option>
                      </select>
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      الوحدة
                    </div>
                  </div>

                  {/* Radio: يخزن vs لا يخزن (خدمات) */}
                  <div className="flex items-center justify-end gap-4 py-0.5 border-y border-slate-200">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="stock_type"
                        checked={!isStockable}
                        onChange={() => setIsStockable(false)}
                        className="accent-pink-600 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-slate-700">لا يخزن (خدمات)</span>
                    </label>

                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="stock_type"
                        checked={isStockable}
                        onChange={() => setIsStockable(true)}
                        className="accent-pink-600 w-3.5 h-3.5"
                      />
                      <span className="font-bold text-slate-900">يخزن</span>
                    </label>
                  </div>

                  {/* سعر الشراء + الطابع (%) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-2">
                      <div className="bg-[#d03d3d] text-white text-center font-mono-numbers font-bold text-xs py-1 rounded-xs">
                        {stampPercent.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-7">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={costPrice || ''}
                        onChange={e => setCostPrice(Number(e.target.value) || 0)}
                        placeholder="0,00 دج"
                        className="w-full bg-white border border-slate-400 rounded-xs px-2 py-1 font-mono-numbers font-black text-slate-900 text-xs text-left focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      سعر الشراء
                    </div>
                  </div>

                  {/* سعر البيع (T01) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-2">
                      <div className="bg-[#fbb06c] text-slate-900 text-center font-mono-numbers font-bold text-xs py-1 rounded-xs">
                        {marginT01}
                      </div>
                    </div>
                    <div className="col-span-7">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={sellPriceT01 || ''}
                        onChange={e => setSellPriceT01(Number(e.target.value) || 0)}
                        placeholder="0,00 دج"
                        className="w-full bg-white border border-slate-400 rounded-xs px-2 py-1 font-mono-numbers font-black text-slate-900 text-xs text-left focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      سعر البيع (T01)
                    </div>
                  </div>

                  {/* سعر البيع (T02) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-2">
                      <div className="bg-[#fbb06c] text-slate-900 text-center font-mono-numbers font-bold text-xs py-1 rounded-xs">
                        {marginT02}
                      </div>
                    </div>
                    <div className="col-span-7">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={sellPriceT02 || ''}
                        onChange={e => setSellPriceT02(Number(e.target.value) || 0)}
                        placeholder="0,00 دج"
                        className="w-full bg-white border border-slate-400 rounded-xs px-2 py-1 font-mono-numbers font-black text-slate-900 text-xs text-left focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      سعر البيع (T02)
                    </div>
                  </div>

                  {/* سعر البيع (T03) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-2">
                      <div className="bg-[#fbb06c] text-slate-900 text-center font-mono-numbers font-bold text-xs py-1 rounded-xs">
                        {marginT03}
                      </div>
                    </div>
                    <div className="col-span-7">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={sellPriceT03 || ''}
                        onChange={e => setSellPriceT03(Number(e.target.value) || 0)}
                        placeholder="0,00 دج"
                        className="w-full bg-white border border-slate-400 rounded-xs px-2 py-1 font-mono-numbers font-black text-slate-900 text-xs text-left focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      سعر البيع (T03)
                    </div>
                  </div>

                  {/* Weighing scale ⚖️ & Sizing row */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-xs px-2 py-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="is_scale"
                          checked={!isScaleProduct}
                          onChange={() => setIsScaleProduct(false)}
                          className="accent-pink-600 w-3 h-3"
                        />
                        <span>لا</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="is_scale"
                          checked={isScaleProduct}
                          onChange={() => setIsScaleProduct(true)}
                          className="accent-pink-600 w-3 h-3"
                        />
                        <span>نعم</span>
                      </label>
                    </div>

                    {/* Scale Icon ⚖️ */}
                    <div className="text-slate-800">
                      <Scale className="w-4 h-4 text-slate-800 stroke-[2]" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="has_size"
                          checked={!hasSizes}
                          onChange={() => setHasSizes(false)}
                          className="accent-pink-600 w-3 h-3"
                        />
                        <span>لا يوجد</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="has_size"
                          checked={hasSizes}
                          onChange={() => setHasSizes(true)}
                          className="accent-pink-600 w-3 h-3"
                        />
                        <span>المقاس</span>
                      </label>
                    </div>
                  </div>

                  {/* الكمية (Current Stock) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-9">
                      <input
                        type="number"
                        min="0"
                        value={currentStock}
                        onChange={e => setCurrentStock(Number(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-400 rounded-xs px-2 py-1 font-mono-numbers font-black text-[#d03d3d] text-center text-xs focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      الكمية
                    </div>
                  </div>

                  {/* كمية في كرتون / حزمة (Box/Pack quantity) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-9 flex items-center gap-1">
                      <div className="w-4 h-4 border border-red-600 rounded-2xs flex items-center justify-center bg-white shrink-0" title="تفعيل البيع بالحزمة / الكرتون">
                        <input
                          type="checkbox"
                          checked={hasBoxPack}
                          onChange={e => setHasBoxPack(e.target.checked)}
                          className="accent-red-600 w-3 h-3"
                        />
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={boxQuantity}
                        onChange={e => {
                          const val = Number(e.target.value) || 1;
                          setBoxQuantity(val);
                          if (hasBoxPack && (!packPrice || packPrice === 0)) {
                            const baseP = sellPriceT02 > 0 ? sellPriceT02 : sellPriceT01;
                            if (baseP > 0) setPackPrice(Number((val * baseP).toFixed(2)));
                          }
                        }}
                        className="flex-1 bg-white border border-slate-400 rounded-xs px-2 py-1 font-mono-numbers font-black text-red-600 text-center text-xs focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      كمية في كرتون
                    </div>
                  </div>

                  {/* حقول الحزمة المتقدمة (إذا تم تفعيلها) */}
                  {hasBoxPack && (
                    <>
                      {/* سعر بيع الحزمة */}
                      <div className="grid grid-cols-12 gap-1 items-center bg-amber-50/70 p-1 rounded border border-amber-200">
                        <div className="col-span-9 flex items-center gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={packPrice || ''}
                            onChange={e => setPackPrice(Number(e.target.value) || 0)}
                            placeholder={`${((boxQuantity || 1) * (sellPriceT01 || 0)).toFixed(2)} دج`}
                            className="flex-1 bg-white border border-amber-400 rounded-xs px-2 py-1 font-mono-numbers font-black text-amber-900 text-center text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const base = sellPriceT02 > 0 ? sellPriceT02 : sellPriceT01;
                              setPackPrice(Number(((boxQuantity || 1) * base).toFixed(2)));
                            }}
                            className="px-1.5 py-1 bg-amber-200 hover:bg-amber-300 text-[10px] font-bold text-amber-900 rounded cursor-pointer"
                            title="حساب سعر الحزمة تلقائياً من سعر البيع"
                          >
                            حساب
                          </button>
                        </div>
                        <div className="col-span-3 text-left font-bold text-amber-900 text-[11px]">
                          سعر الحزمة
                        </div>
                      </div>

                      {/* باركود الحزمة / الكرتون */}
                      <div className="grid grid-cols-12 gap-1 items-center bg-amber-50/70 p-1 rounded border border-amber-200">
                        <div className="col-span-9 flex items-center gap-1">
                          <input
                            type="text"
                            value={packBarcode}
                            onChange={e => setPackBarcode(e.target.value)}
                            placeholder="باركود الكرتون..."
                            className="flex-1 bg-white border border-amber-400 rounded-xs px-2 py-1 font-mono-numbers font-bold text-slate-800 text-xs text-left focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setPackBarcode('6139' + Math.floor(100000000 + Math.random() * 900000000))}
                            className="px-1.5 py-1 bg-amber-200 hover:bg-amber-300 text-[10px] font-bold text-amber-900 rounded cursor-pointer"
                            title="توليد باركود كرتون عشوائي"
                          >
                            توليد
                          </button>
                        </div>
                        <div className="col-span-3 text-left font-bold text-amber-900 text-[11px]">
                          باركود الحزمة
                        </div>
                      </div>
                    </>
                  )}

                  {/* كمية التحذير (Alert Stock in Yellow Background) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-9">
                      <input
                        type="number"
                        min="0"
                        value={minStockAlert}
                        onChange={e => setMinStockAlert(Number(e.target.value) || 0)}
                        className="w-full bg-[#fed264] border border-amber-500 rounded-xs px-2 py-1 font-mono-numbers font-black text-slate-900 text-center text-xs focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3 text-left font-bold text-[#d03d3d]">
                      كمية التحذير
                    </div>
                  </div>

                  {/* الموضع (Storage Location) */}
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-9">
                      <input
                        type="text"
                        value={storageLocation}
                        onChange={e => setStorageLocation(e.target.value)}
                        placeholder="المستودع أو الرف..."
                        className="w-full bg-white border border-slate-400 rounded-xs px-2 py-1 font-semibold text-slate-900 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3 text-left font-bold text-slate-800">
                      الموضع
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Red Expiry Ribbon */}
              <div className="bg-[#d03d3d] text-white p-1 rounded-xs flex items-center justify-between gap-2 mt-2">
                
                {/* عدد أيام قبل التنبيه */}
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[11px] font-bold shrink-0">عدد أيام قبل التنبيه:</span>
                  <input
                    type="number"
                    min="1"
                    value={expiryAlertDays}
                    onChange={e => setExpiryAlertDays(Number(e.target.value) || 30)}
                    className="w-20 bg-white text-slate-900 border border-slate-300 text-center font-mono-numbers font-black text-xs py-0.5 rounded-xs focus:outline-none"
                  />
                </div>

                {/* انتهاء الصلاحية */}
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <span className="text-[11px] font-bold shrink-0">انتهاء الصلاحية:</span>
                  <div className="flex items-center bg-white rounded-xs px-2 py-0.5 border border-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={e => setExpiryDate(e.target.value)}
                      className="text-xs font-mono-numbers font-bold text-slate-800 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: الحزمة / الطرد (Pack & Wholesale Details) */}
          {activeTab === 'pack' && (
            <div className="space-y-3 py-2 text-xs">
              <div className="bg-slate-50 border border-slate-300 rounded-xs p-3 space-y-2">
                <h4 className="font-black text-slate-800 border-b border-slate-200 pb-1">تفاصيل الحزمة والكرتون (Colisage)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">القطع في الكرتون:</label>
                    <input
                      type="number"
                      value={boxQuantity}
                      onChange={e => setBoxQuantity(Number(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono-numbers font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">سعر الكرتون الكامل:</label>
                    <input
                      type="text"
                      readOnly
                      value={`${((sellPriceT01 || costPrice) * boxQuantity).toLocaleString()} دج`}
                      className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-mono-numbers font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: الصور (Images) */}
          {activeTab === 'images' && (
            <div className="space-y-3 py-3 text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 bg-slate-50 flex flex-col items-center justify-center space-y-2">
                <ImageIcon className="w-10 h-10 text-slate-400" />
                <h4 className="font-bold text-xs text-slate-700">صورة المنتج أو السلعة</h4>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="رابط الصورة https://..."
                  className="w-full max-w-sm px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                />
                {imageUrl && (
                  <div className="mt-2 p-1.5 bg-white rounded border border-slate-200 shadow-2xs">
                    <img src={imageUrl} alt="Preview" className="w-24 h-24 object-contain mx-auto rounded" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: خصائص / الهواتف (Specs & IMEI) */}
          {activeTab === 'specs' && (
            <div className="space-y-3 py-2">
              <div className="bg-slate-50 border border-slate-300 rounded-xs p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold border-b border-slate-200 pb-1">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  <span>خصائص الهواتف والأجهزة (IMEI / Modèle)</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم التسلسلي / IMEI:</label>
                  <input
                    type="text"
                    value={imeiOrSerial}
                    onChange={e => setImeiOrSerial(e.target.value)}
                    placeholder="864923048912345"
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono-numbers text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اللون / السعة:</label>
                  <input
                    type="text"
                    value={productColor}
                    onChange={e => setProductColor(e.target.value)}
                    placeholder="أسود / 128GB"
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: المقاس (Sizes) */}
          {activeTab === 'sizes' && (
            <div className="space-y-3 py-2">
              <div className="bg-slate-50 border border-slate-300 rounded-xs p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold border-b border-slate-200 pb-1">
                  <Ruler className="w-4 h-4 text-red-600" />
                  <span>المقاسات والأحجام (Tailles / Pointures)</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المقاس (Taille):</label>
                  <input
                    type="text"
                    value={productSize}
                    onChange={e => setProductSize(e.target.value)}
                    placeholder="XL / 42 / 5L"
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Barcode Scanner Modal via Phone Camera */}
      <BarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScan={(code) => {
          if (code && !barcodeList.includes(code)) {
            setBarcodeList(prev => [...prev, code]);
            setCurrentBarcodeInput('');
            addToast(`تم مسح الباركود [${code}] وإضافته للسلعة`, 'success');
          } else if (barcodeList.includes(code)) {
            addToast(`الباركود [${code}] موجود بالفعل في القائمة`, 'info');
          }
        }}
        title="مسح كود السلعة عبر كاميرا الهاتف"
      />
    </div>
  );
};

