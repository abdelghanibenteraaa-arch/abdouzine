import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  Camera,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  Banknote,
  Clock,
  Check,
  RotateCcw,
  Printer,
  Scale,
  Package,
  Flame,
  ListOrdered,
  RefreshCw,
  X,
  Sparkles,
  Coins,
  Monitor,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Customer, SaleItem, SaleInvoice } from '../types';
import { api } from '../services/api';
import { BarcodeScannerModal } from './modals/BarcodeScannerModal';
import { PriceCheckModal } from './modals/PriceCheckModal';
import { CustomerReturnModal } from './modals/CustomerReturnModal';

interface HeldSale {
  id: string;
  heldAt: string;
  cart: SaleItem[];
  customerId: string;
  customerName: string;
  notes: string;
}

export const POSScreen: React.FC = () => {
  const {
    products,
    categories,
    customers,
    settings,
    formatCurrency,
    refreshData,
    addToast,
    setSelectedInvoice,
    setIsAddCustomerOpen,
    setActiveTab,
    sales,
    isPriceCheckOpen,
    setIsPriceCheckOpen,
    isCustomerReturnOpen,
    setIsCustomerReturnOpen
  } = useApp();

  // Core Cart State
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'credit' | 'bank_transfer'>('cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSuggestIndex, setSelectedSuggestIndex] = useState<number>(0);
  const [isSuggestOpen, setIsSuggestOpen] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCatalogDrawer, setShowCatalogDrawer] = useState<boolean>(false);
  const [printFormat, setPrintFormat] = useState<'none' | 'ticket80' | 'a5' | 'ticket55' | 'a4'>('ticket80');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Queue / Waitlist (قائمة الإنتظار)
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState<boolean>(false);

  // Modals for Zin Stock features
  const [isScaleModalOpen, setIsScaleModalOpen] = useState<boolean>(false);
  const [scaleWeight, setScaleWeight] = useState<string>('1.000');
  const [isPackModalOpen, setIsPackModalOpen] = useState<boolean>(false);
  const [packQuantity, setPackQuantity] = useState<number>(6);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState<boolean>(false);
  const [customQtyInput, setCustomQtyInput] = useState<string>('');
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [isDamagedGoodsModalOpen, setIsDamagedGoodsModalOpen] = useState<boolean>(false);
  const [damagedNotes, setDamagedNotes] = useState<string>('');
  const [isRecentSalesModalOpen, setIsRecentSalesModalOpen] = useState<boolean>(false);
  const [isReturnsModalOpen, setIsReturnsModalOpen] = useState<boolean>(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto focus barcode input on mount and after actions
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [cart]);

  // Set default customer (Cash Customer)
  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      const defaultCashCust = customers.find(c => c.name.includes('نقدي') || c.name.includes('تجزئة')) || customers[0];
      setSelectedCustomerId(defaultCashCust.id);
    }
  }, [customers, selectedCustomerId]);

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxRate = settings.enableTax ? settings.taxRate : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = settings.enableTax ? (taxableAmount * taxRate) / 100 : 0;
  const grandTotal = taxableAmount + taxAmount;

  // Auto update paid amount for cash/card
  useEffect(() => {
    if (paymentType === 'cash' || paymentType === 'card' || paymentType === 'bank_transfer') {
      setPaidAmount(grandTotal);
    } else if (paymentType === 'credit') {
      setPaidAmount(0);
    }
  }, [grandTotal, paymentType]);

  const changeAmount = Math.max(0, paidAmount - grandTotal);
  const remainingDebt = Math.max(0, grandTotal - paidAmount);

  // Add product to cart helper
  const addProductToCart = (product: Product, quantityToAdd = 1, customPrice?: number) => {
    if (product.currentStock <= 0) {
      addToast(`تنبيه: مخزون الصنف "${product.name}" منعدم (${product.currentStock} ${product.unit})`, 'warning');
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id);
      const effectivePrice = customPrice !== undefined ? customPrice : product.sellPrice;

      if (existingIndex > -1) {
        const updated = [...prev];
        const currentItem = updated[existingIndex];
        const newQty = Number((currentItem.quantity + quantityToAdd).toFixed(3));
        
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          unitPrice: effectivePrice,
          total: Number((newQty * effectivePrice - currentItem.discount).toFixed(2)),
          profit: Number(((effectivePrice - product.costPrice) * newQty - currentItem.discount).toFixed(2)),
        };
        setSelectedRowIndex(existingIndex);
        return updated;
      } else {
        const newItem: SaleItem = {
          id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          barcode: product.barcode,
          quantity: quantityToAdd,
          unitPrice: effectivePrice,
          costPrice: product.costPrice,
          discount: 0,
          total: Number((quantityToAdd * effectivePrice).toFixed(2)),
          profit: Number(((effectivePrice - product.costPrice) * quantityToAdd).toFixed(2)),
        };
        setSelectedRowIndex(prev.length);
        return [...prev, newItem];
      }
    });

    setSearchQuery('');
  };

  // Live matched products as user types barcode or text
  const liveMatchedProducts = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p => {
      if (p.isActive === false) return false;
      const matchBarcode = p.barcode?.toLowerCase().includes(q);
      const matchMultiBarcodes = Array.isArray(p.barcodes) && p.barcodes.some(b => b.toLowerCase().includes(q));
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchRef = p.codeRef?.toLowerCase().includes(q);
      const matchName = p.name?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      return matchBarcode || matchMultiBarcodes || matchSku || matchRef || matchName || matchBrand;
    }).slice(0, 8);
  }, [products, searchQuery]);

  // Reset suggested index on query change
  useEffect(() => {
    setSelectedSuggestIndex(0);
    if (searchQuery.trim().length > 0) {
      setIsSuggestOpen(true);
    }
  }, [searchQuery]);

  // Handle keyboard navigation inside search query
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (liveMatchedProducts.length > 0 && isSuggestOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestIndex(prev => (prev + 1) % liveMatchedProducts.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestIndex(prev => (prev - 1 + liveMatchedProducts.length) % liveMatchedProducts.length);
      } else if (e.key === 'Escape') {
        setIsSuggestOpen(false);
      }
    }
  };

  // Barcode or text search submit
  const handleBarcodeSubmit = (e?: React.FormEvent, directProduct?: Product) => {
    if (e) e.preventDefault();
    
    if (directProduct) {
      addProductToCart(directProduct);
      setIsSuggestOpen(false);
      return;
    }

    const query = searchQuery.trim();
    if (!query) return;

    // If suggestion is active and user pressed Enter
    if (liveMatchedProducts.length > 0 && isSuggestOpen) {
      const targetProd = liveMatchedProducts[selectedSuggestIndex] || liveMatchedProducts[0];
      if (targetProd) {
        addProductToCart(targetProd);
        setIsSuggestOpen(false);
        return;
      }
    }

    // Check exact barcode match first
    const matchedByBarcode = products.find(
      p => p.barcode === query || 
           (Array.isArray(p.barcodes) && p.barcodes.includes(query)) ||
           p.sku.toLowerCase() === query.toLowerCase()
    );

    if (matchedByBarcode) {
      addProductToCart(matchedByBarcode);
      setIsSuggestOpen(false);
      return;
    }

    // Check matching by name
    const matchedByName = products.filter(
      p => p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matchedByName.length === 1) {
      addProductToCart(matchedByName[0]);
      setIsSuggestOpen(false);
    } else if (matchedByName.length > 1) {
      setShowCatalogDrawer(true);
    } else {
      addToast('لم يتم العثور على أي منتج يطابق: ' + query, 'warning');
    }
  };

  // Handle scanned barcode directly from phone/web camera
  const handleCameraScanBarcode = (decodedBarcode: string) => {
    const cleanCode = decodedBarcode.trim();
    if (!cleanCode) return;

    // Search exact product by barcode or SKU
    const matched = products.find(
      p => p.barcode === cleanCode ||
           (Array.isArray(p.barcodes) && p.barcodes.includes(cleanCode)) ||
           p.sku?.toLowerCase() === cleanCode.toLowerCase()
    );

    if (matched) {
      addProductToCart(matched);
      addToast(`✅ تمت إضافة: ${matched.name} عبر كاميرا الهاتف`, 'success');
    } else {
      setSearchQuery(cleanCode);
      addToast(`تم مسح الكود [${cleanCode}] ولكن غير مسجل، يمكنك إضافته لسلعة جديدة`, 'warning');
    }
  };

  // Adjust quantity of selected row or specific row
  const adjustSelectedRowQuantity = (delta: number, specificIndex?: number) => {
    const targetIdx = specificIndex !== undefined
      ? specificIndex
      : (selectedRowIndex !== null && cart[selectedRowIndex]
          ? selectedRowIndex
          : (cart.length > 0 ? cart.length - 1 : null));

    if (targetIdx === null || !cart[targetIdx]) {
      return;
    }

    const currentItem = cart[targetIdx];
    const newQty = Number((currentItem.quantity + delta).toFixed(3));

    if (newQty <= 0) {
      // Remove item
      setCart(prev => prev.filter((_, idx) => idx !== targetIdx));
      setSelectedRowIndex(cart.length > 1 ? Math.max(0, targetIdx - 1) : null);
      addToast(`تم حذف الصنف ${currentItem.productName} من الوصل`, 'info');
    } else {
      setCart(prev => {
        const updated = [...prev];
        updated[targetIdx] = {
          ...currentItem,
          quantity: newQty,
          total: Number((newQty * currentItem.unitPrice - currentItem.discount).toFixed(2)),
          profit: Number(((currentItem.unitPrice - currentItem.costPrice) * newQty - currentItem.discount).toFixed(2)),
        };
        return updated;
      });
      setSelectedRowIndex(targetIdx);
    }
  };

  // Delete selected item
  const removeSelectedRow = () => {
    const targetIdx = selectedRowIndex !== null && cart[selectedRowIndex]
      ? selectedRowIndex
      : (cart.length > 0 ? cart.length - 1 : null);

    if (targetIdx === null || !cart[targetIdx]) return;
    const item = cart[targetIdx];
    setCart(prev => prev.filter((_, idx) => idx !== targetIdx));
    setSelectedRowIndex(cart.length > 1 ? Math.max(0, targetIdx - 1) : null);
    addToast(`تم حذف الصنف ${item.productName}`, 'info');
  };

  // Clear receipt (إلغاء الوصل)
  const handleCancelReceipt = () => {
    if (cart.length === 0) return;
    if (window.confirm('هل أنت متأكد من إلغاء كامل الوصل الحالي وإفراغ السلة؟')) {
      setCart([]);
      setSelectedRowIndex(null);
      setDiscountAmount(0);
      setPaidAmount(0);
      addToast('تم إلغاء الوصل الحالي', 'info');
      barcodeInputRef.current?.focus();
    }
  };

  // Hold current ticket (قائمة الإنتظار)
  const handleHoldCurrentSale = () => {
    if (cart.length === 0) {
      addToast('السلة فارغة، لا يمكن تعليق وصل فارغ', 'warning');
      return;
    }

    const currentCustomer = customers.find(c => c.id === selectedCustomerId);
    const newHeldSale: HeldSale = {
      id: 'queue-' + Date.now(),
      heldAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      customerId: selectedCustomerId,
      customerName: currentCustomer?.name || 'زبون عام',
      notes: `وصل يحتوي على ${cart.length} أصناف بقيمة ${formatCurrency(grandTotal)}`,
    };

    setHeldSales(prev => [...prev, newHeldSale]);
    setCart([]);
    setSelectedRowIndex(null);
    setDiscountAmount(0);
    setPaidAmount(0);
    addToast('تم نقل الوصل إلى قائمة الإنتظار بنجاح 🕒', 'success');
  };

  // Restore ticket from waitlist
  const handleRestoreHeldSale = (heldSale: HeldSale) => {
    if (cart.length > 0) {
      const confirmReplace = window.confirm('يوجد وصل مفتوح حالياً. هل تريد استبداله بالوصل المعلق؟');
      if (!confirmReplace) return;
    }

    setCart(heldSale.cart);
    setSelectedCustomerId(heldSale.customerId);
    setSelectedRowIndex(heldSale.cart.length - 1);
    setHeldSales(prev => prev.filter(h => h.id !== heldSale.id));
    setIsQueueModalOpen(false);
    addToast('تم استرجاع الوصل من قائمة الإنتظار', 'success');
  };

  // Handle Scale (الميزان)
  const handleApplyWeightScale = () => {
    const weightNum = parseFloat(scaleWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      addToast('يرجى إدخال وزن صحيح', 'warning');
      return;
    }

    if (selectedRowIndex !== null && cart[selectedRowIndex]) {
      const item = cart[selectedRowIndex];
      setCart(prev => {
        const updated = [...prev];
        updated[selectedRowIndex] = {
          ...item,
          quantity: weightNum,
          total: Number((weightNum * item.unitPrice - item.discount).toFixed(2)),
          profit: Number(((item.unitPrice - item.costPrice) * weightNum - item.discount).toFixed(2)),
        };
        return updated;
      });
      addToast(`تم تحديث وزن الصنف: ${weightNum} كغ`, 'success');
      setIsScaleModalOpen(false);
    } else {
      addToast('يرجى تحديد صنف من الجدول لتطبيق الوزن عليه', 'warning');
    }
  };

  // Handle Pack / Colisage (الحزمة)
  const handleApplyPackQuantity = () => {
    if (selectedRowIndex !== null && cart[selectedRowIndex]) {
      const item = cart[selectedRowIndex];
      const newQty = Number((item.quantity * packQuantity).toFixed(3));
      setCart(prev => {
        const updated = [...prev];
        updated[selectedRowIndex] = {
          ...item,
          quantity: newQty,
          total: Number((newQty * item.unitPrice - item.discount).toFixed(2)),
          profit: Number(((item.unitPrice - item.costPrice) * newQty - item.discount).toFixed(2)),
        };
        return updated;
      });
      addToast(`تم تطبيق حزمة (${packQuantity} قطع) على الصنف`, 'success');
      setIsPackModalOpen(false);
    } else {
      addToast('يرجى تحديد صنف لتطبيق مضاعفة الحزمة عليه', 'warning');
    }
  };

  // Handle Custom Price / Quantity Modal (اخرى [/])
  const handleApplyCustomOther = () => {
    if (selectedRowIndex === null || !cart[selectedRowIndex]) {
      addToast('يرجى تحديد صنف أولاً', 'warning');
      return;
    }

    const item = cart[selectedRowIndex];
    let newQty = item.quantity;
    let newPrice = item.unitPrice;

    if (customQtyInput.trim()) {
      const parsedQty = parseFloat(customQtyInput);
      if (!isNaN(parsedQty) && parsedQty > 0) newQty = parsedQty;
    }

    if (customPriceInput.trim()) {
      const parsedPrice = parseFloat(customPriceInput);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) newPrice = parsedPrice;
    }

    setCart(prev => {
      const updated = [...prev];
      updated[selectedRowIndex] = {
        ...item,
        quantity: newQty,
        unitPrice: newPrice,
        total: Number((newQty * newPrice - item.discount).toFixed(2)),
        profit: Number(((newPrice - item.costPrice) * newQty - item.discount).toFixed(2)),
      };
      return updated;
    });

    setIsOtherModalOpen(false);
    setCustomQtyInput('');
    setCustomPriceInput('');
    addToast('تم تحديث بيانات الصنف المحدد', 'success');
  };

  // Record damaged goods (بضاعة تالفة)
  const handleSaveDamagedGoods = async () => {
    if (selectedRowIndex === null || !cart[selectedRowIndex]) {
      addToast('يرجى تحديد السلعة التالفة من الجدول أولاً', 'warning');
      return;
    }

    const item = cart[selectedRowIndex];
    const targetProduct = products.find(p => p.id === item.productId);
    if (!targetProduct) {
      addToast('تعذر العثور على بيانات الصنف في قاعدة البيانات', 'error');
      return;
    }

    try {
      const newStock = Math.max(0, targetProduct.currentStock - item.quantity);
      await api.adjustStock(
        targetProduct.id,
        newStock,
        damagedNotes || `تسجيل بضاعة تالفة وخسائر (${item.quantity} ${targetProduct.unit}) من كاشير POS`
      );
      await refreshData();
      addToast(`تم تسجيل تلف (${item.quantity} ${item.productName}) وخصمها من المخزون بنجاح`, 'success');
      removeSelectedRow();
      setIsDamagedGoodsModalOpen(false);
      setDamagedNotes('');
    } catch (err: any) {
      addToast('فشل في تسجيل البضاعة التالفة', 'error');
    }
  };

  // Execute Sale Validation
  const handleExecuteSale = async (forcedPaymentType?: 'cash' | 'credit') => {
    if (cart.length === 0) {
      addToast('سلة المبيعات فارغة! قم بمسح أو إضافة أصناف أولاً', 'warning');
      return;
    }

    const actualPaymentType = forcedPaymentType || paymentType;
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      addToast('يرجى اختيار حساب العميل أولاً', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalPaid = actualPaymentType === 'cash' ? grandTotal : (actualPaymentType === 'credit' ? 0 : paidAmount);
      const finalDebt = Math.max(0, grandTotal - finalPaid);

      const payload = {
        date: new Date().toISOString().split('T')[0],
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: cart,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount: grandTotal,
        paidAmount: finalPaid,
        remainingAmount: finalDebt,
        paymentType: actualPaymentType,
        status: 'completed' as const,
        notes: `عملية بيع سريعة عبر كاشير Zin Stock (صيغة الطباعة: ${printFormat})`,
        cashierName: 'كاشير نقطة البيع',
      };

      const createdInvoice = await api.createSale(payload);
      addToast(`✅ تم حفظ الفاتورة ${createdInvoice.invoiceNumber} بنجاح!`, 'success');

      await refreshData();

      // If printing is requested and not 'none'
      if (printFormat !== 'none') {
        setSelectedInvoice({ type: 'sale', data: createdInvoice });
      }

      // Reset cart
      setCart([]);
      setSelectedRowIndex(null);
      setDiscountAmount(0);
      setPaidAmount(0);
      barcodeInputRef.current?.focus();
    } catch (err: any) {
      addToast(err.message || 'فشل في إتمام عملية البيع', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard Shortcuts (F4, F5, F6, F7, +, -, Del)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      // Intercept + and - when outside text inputs OR when barcode input is active but empty
      if (e.key === '+' || e.code === 'NumpadAdd' || (e.key === '=' && e.shiftKey)) {
        if (!isInput || (target === barcodeInputRef.current && searchQuery.trim() === '')) {
          e.preventDefault();
          adjustSelectedRowQuantity(1);
          return;
        }
      } else if (e.key === '-' || e.code === 'NumpadSubtract') {
        if (!isInput || (target === barcodeInputRef.current && searchQuery.trim() === '')) {
          e.preventDefault();
          adjustSelectedRowQuantity(-1);
          return;
        }
      } else if (e.key === 'Delete') {
        if (!isInput) {
          e.preventDefault();
          removeSelectedRow();
          return;
        }
      }

      if (e.key === 'F2') {
        e.preventDefault();
        setIsPriceCheckOpen(true);
      } else if (e.key === 'F3') {
        e.preventDefault();
        setIsCustomerReturnOpen(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleExecuteSale();
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (sales.length > 0) {
          setSelectedInvoice({ type: 'sale', data: sales[0] });
        } else {
          addToast('لا توجد فواتير سابقة للطباعة', 'info');
        }
      } else if (e.key === 'F6') {
        e.preventDefault();
        setPaymentType('credit');
        handleExecuteSale('credit');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setPaymentType('cash');
        handleExecuteSale('cash');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, grandTotal, selectedCustomerId, printFormat, sales, searchQuery, selectedRowIndex]);

  const filteredCatalogProducts = products.filter(p => {
    if (!p.isActive) return false;
    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="h-full flex flex-col bg-[#e3e6eb] select-none text-slate-800 overflow-hidden font-sans">
      {/* Top Banner Bar: Dark Metallic Theme */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1f2023] to-[#161719] text-white px-4 py-2 shadow-md flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-neutral-900/80 px-2.5 py-1 rounded border border-neutral-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-neutral-300">نظام نقطة البيع السريعة POS - Zin Stock</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2.5 py-0.5 rounded text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>يعمل بدون إنترنت 100% (Offline Local DB)</span>
          </div>

          <button
            onClick={() => setShowCatalogDrawer(!showCatalogDrawer)}
            className="flex items-center gap-1.5 px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>{showCatalogDrawer ? 'إخفاء دليل الأصناف' : 'دليل الأصناف والكاتالوج'}</span>
          </button>

          <button
            onClick={() => setIsPriceCheckOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded text-xs font-black transition-all shadow-sm cursor-pointer"
            title="معرفة السعر (اختصار F2)"
          >
            <Tag className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />
            <span>معرفة السعر</span>
            <span className="text-[10px] bg-slate-900/20 px-1 py-0.2 rounded font-mono">F2</span>
          </button>

          <button
            onClick={() => setIsCustomerReturnOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-black transition-all shadow-sm cursor-pointer"
            title="إرجاع الزبون (اختصار F3)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span>إرجاع الزبون</span>
            <span className="text-[10px] bg-black/20 px-1 py-0.2 rounded font-mono">F3</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Customer Selector */}
          <div className="flex items-center gap-1 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer py-1"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id} className="bg-neutral-800 text-white">
                  {c.name} {c.currentDebt > 0 ? `(دين: ${c.currentDebt} د.ج)` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center text-xs font-bold"
              title="إضافة عميل جديد"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-amber-400 font-mono-numbers">
              {new Date().toLocaleDateString('ar-DZ')}
            </div>
          </div>
        </div>
      </div>

      {/* Main POS Interface Layout (Exact matching Zin Stock screenshot) */}
      <div className="flex-1 flex overflow-hidden p-2.5 gap-2.5">
        {/* Left Column (Zone 1): Waitlist, Function Keys, Print Options, Brand Screen */}
        <div className="w-[280px] flex flex-col gap-2 bg-[#d7dadf] p-2.5 rounded-lg border-2 border-[#b0b5bd] shadow-sm">
          {/* 1. قائمة الإنتظار (Waitlist Box) */}
          <div
            onClick={() => setIsQueueModalOpen(true)}
            className="bg-white border-2 border-slate-300 hover:border-slate-400 rounded-lg p-2.5 flex flex-col items-center justify-center cursor-pointer shadow-xs transition-all hover:bg-slate-50 group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center mb-1 text-slate-800 group-hover:rotate-12 transition-transform">
              <Clock className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="text-base font-black text-slate-900 tracking-wide">قائمة الإنتظار</div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5">
              {heldSales.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold animate-pulse">
                  {heldSales.length} تذكرة معلقة
                </span>
              ) : (
                'لا توجد تذاكر معلقة (انقر للحفظ)'
              )}
            </div>
          </div>

          {/* 2. Four Square Function Keys (F4, F5, F6, F7) */}
          <div className="grid grid-cols-4 gap-1.5 py-1">
            {/* (F4) Confirm / Checkmark */}
            <button
              onClick={() => handleExecuteSale()}
              title="F4: تأكيد عملية البيع"
              className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gradient-to-b from-[#2a9d4a] to-[#1e7837] text-white border-2 border-[#165a29] shadow-xs active:translate-y-0.5 hover:brightness-110"
            >
              <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center mb-1">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <span className="text-[10px] font-mono-numbers font-black">(F4)</span>
            </button>

            {/* (F5) Print Ticket */}
            <button
              onClick={() => {
                if (sales.length > 0) setSelectedInvoice({ type: 'sale', data: sales[0] });
                else addToast('لا توجد فواتير للطباعة', 'info');
              }}
              title="F5: طباعة الفاتورة"
              className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gradient-to-b from-[#3a3d42] to-[#242629] text-white border-2 border-[#161719] shadow-xs active:translate-y-0.5 hover:brightness-110"
            >
              <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center mb-1">
                <Printer className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono-numbers font-black">(F5)</span>
            </button>

            {/* (F6) Customer Credit */}
            <button
              onClick={() => {
                setPaymentType('credit');
                handleExecuteSale('credit');
              }}
              title="F6: حساب العميل / كريدي آجل"
              className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gradient-to-b from-[#3a3d42] to-[#242629] text-white border-2 border-[#161719] shadow-xs active:translate-y-0.5 hover:brightness-110"
            >
              <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center mb-1 text-amber-300">
                <User className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono-numbers font-black">(F6)</span>
            </button>

            {/* (F7) 100 Cash */}
            <button
              onClick={() => {
                setPaymentType('cash');
                handleExecuteSale('cash');
              }}
              title="F7: دفع فوري نقدي 100%"
              className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-gradient-to-b from-[#3a3d42] to-[#242629] text-white border-2 border-[#161719] shadow-xs active:translate-y-0.5 hover:brightness-110"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mb-1 text-[11px] font-black font-mono-numbers">
                100
              </div>
              <span className="text-[10px] font-mono-numbers font-black">(F7)</span>
            </button>
          </div>

          {/* 3. Print Options Radio Buttons */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-2 text-xs">
            <div className="text-[11px] font-bold text-slate-600 mb-1.5 border-b pb-1 text-center">
              خيارات طباعة الوصل (Ticket Print):
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-bold text-[11px] text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="printFormat"
                  checked={printFormat === 'none'}
                  onChange={() => setPrintFormat('none')}
                  className="accent-red-600"
                />
                <span>بدون طباعة</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="printFormat"
                  checked={printFormat === 'ticket80'}
                  onChange={() => setPrintFormat('ticket80')}
                  className="accent-red-600"
                />
                <span>اتكات 80</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="printFormat"
                  checked={printFormat === 'a5'}
                  onChange={() => setPrintFormat('a5')}
                  className="accent-red-600"
                />
                <span>A5</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="printFormat"
                  checked={printFormat === 'ticket55'}
                  onChange={() => setPrintFormat('ticket55')}
                  className="accent-red-600"
                />
                <span>اتكات 55</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer col-span-2">
                <input
                  type="radio"
                  name="printFormat"
                  checked={printFormat === 'a4'}
                  onChange={() => setPrintFormat('a4')}
                  className="accent-red-600"
                />
                <span>A4 فاتورة رسمية</span>
              </label>
            </div>
          </div>

          {/* 4. Brand Monitor Display (Zin Stock اختياركم الأفضل) */}
          <div className="mt-auto bg-[#1b1c1e] rounded-lg p-2 border-2 border-slate-700 flex flex-col items-center justify-center text-center shadow-inner">
            <div className="w-full bg-white rounded p-2 text-slate-900 shadow-sm border border-slate-300">
              <div className="text-xl font-black tracking-tighter text-slate-900 flex items-center justify-center gap-1">
                <span>Zin</span> <span className="text-red-600">Stock</span>
              </div>
              <div className="bg-red-600 text-white text-[11px] font-black py-0.5 px-2 rounded-xs mt-1 shadow-xs tracking-wide">
                اختياركم الأفضل
              </div>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono-numbers mt-1.5 flex items-center gap-1">
              <span>Service:</span> <span className="text-amber-400 font-bold">06.71.36.19.19</span>
            </div>
          </div>
        </div>

        {/* Middle Column (Zone 2): Beveled Action Buttons (+, -, أخرى, ثلاجة, الحزمة, ميزان, إلغاء) */}
        <div className="w-[110px] flex flex-col gap-1.5 bg-[#d7dadf] p-2 rounded-lg border-2 border-[#b0b5bd]">
          {/* Plus (+) */}
          <button
            onClick={() => adjustSelectedRowQuantity(1)}
            title="زيادة الكمية"
            className="h-12 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-400 active:border-slate-600 rounded-md font-black text-2xl flex items-center justify-center shadow-xs active:translate-y-0.5"
          >
            +
          </button>

          {/* Minus (-) */}
          <button
            onClick={() => adjustSelectedRowQuantity(-1)}
            title="إنقاص الكمية"
            className="h-12 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-400 active:border-slate-600 rounded-md font-black text-2xl flex items-center justify-center shadow-xs active:translate-y-0.5"
          >
            -
          </button>

          {/* معرفة السعر (F2) */}
          <button
            onClick={() => setIsPriceCheckOpen(true)}
            title="معرفة السعر وبحث المنتجات (F2)"
            className="h-13 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-2 border-amber-600 rounded-md font-black text-xs flex flex-col items-center justify-center shadow-sm active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Tag className="w-4 h-4 stroke-[2.5] mb-0.5" />
            <span className="leading-tight">معرفة السعر</span>
            <span className="text-[9px] font-mono font-bold bg-slate-900/20 px-1 rounded">F2</span>
          </button>

          {/* اخرى [/] */}
          <button
            onClick={() => setIsOtherModalOpen(true)}
            title="أخرى: تعديل الكمية أو السعر المخصص"
            className="h-12 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-400 rounded-md font-bold text-xs flex flex-col items-center justify-center shadow-xs active:translate-y-0.5"
          >
            <span>أخرى</span>
            <span className="text-[10px] text-slate-500 font-mono">[/]</span>
          </button>

          {/* ثلاجة / مجمدات */}
          <button
            onClick={() => {
              const fridgeCat = categories.find(c => c.name.includes('مجمد') || c.name.includes('بارد') || c.name.includes('حليب'));
              if (fridgeCat) {
                setSelectedCategory(fridgeCat.id);
                setShowCatalogDrawer(true);
              } else {
                setShowCatalogDrawer(true);
              }
            }}
            title="أصناف الثلاجة والمجمدات"
            className="h-12 bg-gradient-to-b from-[#414449] to-[#222427] hover:brightness-110 text-white border-2 border-slate-600 rounded-md font-bold text-xs flex flex-col items-center justify-center shadow-xs active:translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 mb-0.5" />
            <span className="text-[10px]">ثلاجة</span>
          </button>

          {/* الحزمة (Pack) */}
          <button
            onClick={() => setIsPackModalOpen(true)}
            title="الحزمة: بيع بالكرتون أو العلبة"
            className="h-12 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-400 rounded-md font-black text-xs flex items-center justify-center shadow-xs active:translate-y-0.5"
          >
            الحزمة
          </button>

          {/* ميزان (Scale) */}
          <button
            onClick={() => setIsScaleModalOpen(true)}
            title="ميزان: إدخال أو قراءة وزن السلعة"
            className="h-12 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-400 rounded-md font-black text-xs flex flex-col items-center justify-center shadow-xs active:translate-y-0.5"
          >
            <Scale className="w-5 h-5 text-slate-800" />
          </button>

          {/* تعليق الوصل */}
          <button
            onClick={handleHoldCurrentSale}
            title="تعليق الوصل الحالي وحفظه في قائمة الإنتظار"
            className="h-11 bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-300 rounded-md font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>تعليق</span>
          </button>

          {/* إلغاء الوصل */}
          <button
            onClick={handleCancelReceipt}
            title="إلغاء الوصل الحالي"
            className="mt-auto h-12 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 border-2 border-slate-400 hover:border-red-400 rounded-md font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
          >
            <X className="w-4 h-4 text-red-600 stroke-[3]" />
            <span>إلغاء الوصل</span>
          </button>
        </div>

        {/* Right Main Table & Barcode Area (Zone 3 & Catalog Drawer) */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border-2 border-[#b0b5bd] shadow-sm overflow-hidden">
          {/* Barcode Search Strip with Live Instant Matching and Phone Camera Scanner */}
          <div className="p-2 bg-[#f0f2f5] border-b-2 border-slate-300 flex items-center gap-2 relative z-30">
            <form onSubmit={handleBarcodeSubmit} className="flex-1 relative">
              <Barcode className="w-5 h-5 text-slate-500 absolute right-3 top-2.5" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setIsSuggestOpen(true)}
                placeholder="امسح الباركود بجهاز السكانير أو اكتب بداية الكودبار / اسم السلعة..."
                className="w-full pl-3 pr-11 py-2 rounded-md bg-white border-2 border-slate-400 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 shadow-inner"
              />

              {/* Live Matching Dropdown Menu (عند بداية كتابة الكودبار يظهر المنتج فوراً) */}
              {searchQuery.trim().length > 0 && isSuggestOpen && liveMatchedProducts.length > 0 && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-white border-2 border-red-600 rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Top Bar info */}
                  <div className="bg-gradient-to-r from-red-600 to-neutral-900 text-white px-3 py-1.5 text-xs font-black flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Barcode className="w-3.5 h-3.5" />
                      السلع المطابقة للباركود والبحث ({liveMatchedProducts.length})
                    </span>
                    <span className="text-[10px] text-red-100 font-normal">
                      اضغط [Enter] أو انقر للإضافة السريعة
                    </span>
                  </div>

                  {/* Suggestions List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {liveMatchedProducts.map((prod, idx) => {
                      const isSelected = idx === selectedSuggestIndex;
                      const hasLowStock = prod.currentStock <= (prod.alertStock || 5);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleBarcodeSubmit(undefined, prod)}
                          onMouseEnter={() => setSelectedSuggestIndex(idx)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-red-50/90 border-r-4 border-r-red-600'
                              : 'hover:bg-slate-50 border-r-4 border-r-transparent'
                          }`}
                        >
                          {/* Product Info */}
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${
                              isSelected ? 'bg-red-600 text-white border-red-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                              {prod.image ? (
                                <img src={prod.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span>{prod.name.substring(0, 2)}</span>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <span>{prod.name}</span>
                                {prod.brand && (
                                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                    {prod.brand}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                                <span className="font-bold text-slate-700 flex items-center gap-1">
                                  <Barcode className="w-3 h-3 text-red-600 inline" />
                                  {prod.barcode || 'بدون باركود'}
                                </span>
                                {prod.codeRef && (
                                  <span className="text-slate-400">المرجع: {prod.codeRef}</span>
                                )}
                                {prod.sku && prod.sku !== prod.barcode && (
                                  <span className="text-slate-400">SKU: {prod.sku}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price & Stock info */}
                          <div className="text-left flex flex-col items-end gap-1">
                            <div className="text-base font-black text-red-600 font-mono-numbers">
                              {prod.sellPrice?.toLocaleString()} <span className="text-xs">د.ج</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                hasLowStock
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}>
                                المخزون: {prod.currentStock} {prod.unit}
                              </span>
                              
                              <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                                + إضافة
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer hint */}
                  <div className="bg-slate-100 px-3 py-1 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 font-sans">
                    <span>استخدم الأسهم ⬆ ⬇ للتنقل</span>
                    <span>اضغط Enter للتأكيد وإضافة السلعة فوراً للوصل</span>
                  </div>
                </div>
              )}
            </form>

            <div className="flex items-center gap-1.5">
              {/* Phone / Webcam Barcode Scanner Button */}
              <button
                type="button"
                onClick={() => setIsCameraScannerOpen(true)}
                title="مسح الباركود باستخدام كاميرا الهاتف أو الويب كام"
                className="px-3.5 py-2 bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-white font-bold text-xs rounded-md shadow-md flex items-center gap-1.5 border border-neutral-700 cursor-pointer transition-all active:scale-95 group"
              >
                <Camera className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-black">سكانر الكاميرا</span>
              </button>

              <button
                onClick={() => handleBarcodeSubmit()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-md shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          {/* Optional Product Catalog Drawer */}
          {showCatalogDrawer && (
            <div className="h-44 bg-slate-100 border-b-2 border-slate-300 p-2 flex flex-col overflow-hidden">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap ${
                    selectedCategory === 'all' ? 'bg-red-600 text-white' : 'bg-white text-slate-700 border'
                  }`}
                >
                  الكل ({products.length})
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap ${
                      selectedCategory === c.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                {filteredCatalogProducts.map(prod => (
                  <button
                    key={prod.id}
                    onClick={() => addProductToCart(prod)}
                    className="p-1.5 bg-white hover:bg-red-50 border rounded text-right flex flex-col justify-between transition-all"
                  >
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{prod.name}</span>
                    <div className="flex justify-between items-center text-[10px] font-mono-numbers mt-1">
                      <span className="text-red-600 font-bold">{prod.sellPrice} د.ج</span>
                      <span className="text-slate-400">({prod.currentStock})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sales Grid Table (Exact Match to Zin Stock Red Header) */}
          <div className="flex-1 overflow-y-auto bg-white">
            <table className="w-full border-collapse text-right text-sm select-none">
              {/* Red Header as in screenshot */}
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#cf231a] text-white font-black text-sm border-b-2 border-red-800 shadow-xs">
                  <th className="py-2 px-3 text-center border-l border-red-400/30 w-12">الرقم</th>
                  <th className="py-2 px-3 text-right border-l border-red-400/30 w-32">الباركود</th>
                  <th className="py-2 px-3 text-right border-l border-red-400/30">اسم السلعة / البضاعة</th>
                  <th className="py-2 px-3 text-center border-l border-red-400/30 w-24">الكمية</th>
                  <th className="py-2 px-3 text-center border-l border-red-400/30 w-28">سعر الوحدة</th>
                  <th className="py-2 px-3 text-center w-36">المجموع الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cart.length === 0 ? (
                  // Empty rows representation like classic ERP
                  Array.from({ length: 9 }).map((_, i) => (
                    <tr key={i} className="h-9 border-b border-slate-100">
                      <td className="border-l border-slate-200 text-center text-slate-300 font-mono-numbers text-xs">
                        {i + 1}
                      </td>
                      <td className="border-l border-slate-200"></td>
                      <td className="border-l border-slate-200"></td>
                      <td className="border-l border-slate-200"></td>
                      <td className="border-l border-slate-200"></td>
                      <td></td>
                    </tr>
                  ))
                ) : (
                  <>
                    {cart.map((item, index) => {
                      const isSelected = selectedRowIndex === index;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedRowIndex(index)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-100 text-blue-950 font-bold border-y-2 border-blue-400'
                              : index % 2 === 0
                              ? 'bg-white hover:bg-slate-50'
                              : 'bg-[#fbfcfd] hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 text-center border-l border-slate-200 font-mono-numbers font-bold text-xs">
                            {index + 1}
                          </td>
                          <td className="py-2 px-3 text-right border-l border-slate-200 font-mono-numbers text-xs text-slate-600 truncate max-w-[130px]">
                            {item.barcode || item.sku}
                          </td>
                          <td className="py-2 px-3 text-right border-l border-slate-200 font-bold text-slate-900">
                            {item.productName}
                          </td>
                          <td className="py-1 px-2 text-center border-l border-slate-200">
                            <div className="inline-flex items-center justify-center gap-1 bg-slate-100/90 p-0.5 rounded border border-slate-300 shadow-2xs">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adjustSelectedRowQuantity(-1, index);
                                }}
                                title="إنقاص الكمية (-)"
                                className="w-5 h-5 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 flex items-center justify-center font-black text-xs active:scale-90 transition-all cursor-pointer shadow-xs"
                              >
                                -
                              </button>
                              <span className="min-w-[26px] text-center font-mono-numbers font-black text-slate-900 text-sm">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adjustSelectedRowQuantity(1, index);
                                }}
                                title="زيادة الكمية (+)"
                                className="w-5 h-5 rounded bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 flex items-center justify-center font-black text-xs active:scale-90 transition-all cursor-pointer shadow-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center border-l border-slate-200 font-mono-numbers font-bold text-slate-800">
                            {Number(item.unitPrice).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-center font-mono-numbers font-black text-red-700 text-base">
                            {Number(item.total).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Pad extra empty rows */}
                    {cart.length < 8 &&
                      Array.from({ length: 8 - cart.length }).map((_, i) => (
                        <tr key={'empty-' + i} className="h-9 border-b border-slate-100">
                          <td className="border-l border-slate-200 text-center text-slate-300 font-mono-numbers text-xs">
                            {cart.length + i + 1}
                          </td>
                          <td className="border-l border-slate-200"></td>
                          <td className="border-l border-slate-200"></td>
                          <td className="border-l border-slate-200"></td>
                          <td className="border-l border-slate-200"></td>
                          <td></td>
                        </tr>
                      ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Big Currency & Grand Total Indicator Strip */}
          <div className="p-3 bg-[#e8ebf0] border-t-2 border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-600">عدد الأصناف: {cart.length}</span>
              <span className="text-xs font-bold text-slate-600">
                إجمالي الكميات: {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-left">
                <span className="text-[11px] font-bold text-slate-500 block">المبلغ الإجمالي المستحق:</span>
                <span className="text-2xl font-black text-red-700 font-mono-numbers">
                  {Number(grandTotal).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Algerian Currency DZD Badge matching the image */}
              <div className="px-4 py-1.5 rounded bg-white border-2 border-slate-400 text-slate-900 font-black text-xl shadow-xs">
                د.ج
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Red Banner Strip + Dark Bar with 5 Circular 3D Buttons (Zone 4) */}
      <div className="bg-[#121315] border-t-2 border-neutral-700 text-white flex flex-col">
        {/* Red Title Banner */}
        <div className="bg-[#cf231a] px-6 py-1 text-xs font-black tracking-wider text-center text-white shadow-xs">
          طباعة / الإرجاع / قائمة البيع / البضاعة التالفة
        </div>

        {/* Circular Action Buttons Bar */}
        <div className="px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Button 1: 100 / Cash Payment */}
            <button
              onClick={() => {
                setPaymentType('cash');
                handleExecuteSale('cash');
              }}
              title="دفع فوري 100% نقدي"
              className="w-12 h-12 rounded-full bg-white hover:bg-neutral-100 border-2 border-neutral-300 text-slate-900 flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <div className="text-[11px] font-black text-emerald-700 font-mono-numbers leading-none">100</div>
              <Coins className="w-3.5 h-3.5 text-amber-500" />
            </button>

            {/* Button 2: Damaged Goods (بضاعة تالفة / خسائر) */}
            <button
              onClick={() => setIsDamagedGoodsModalOpen(true)}
              title="تسجيل بضاعة تالفة وخسائر"
              className="w-12 h-12 rounded-full bg-white hover:bg-neutral-100 border-2 border-neutral-300 text-slate-900 flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <Flame className="w-6 h-6 text-red-600" />
            </button>

            {/* Button 3: Sales List (قائمة البيع) */}
            <button
              onClick={() => setIsRecentSalesModalOpen(true)}
              title="سجل وقائمة المبيعات السابقة"
              className="w-12 h-12 rounded-full bg-white hover:bg-neutral-100 border-2 border-neutral-300 text-slate-900 flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <ListOrdered className="w-6 h-6 text-slate-800" />
            </button>

            {/* Button 4: Return (الإرجاع) */}
            <button
              onClick={() => setIsCustomerReturnOpen(true)}
              title="إرجاع واسترداد سلع الزبائن (F3)"
              className="w-12 h-12 rounded-full bg-white hover:bg-neutral-100 border-2 border-neutral-300 text-slate-900 flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              <RotateCcw className="w-6 h-6 text-rose-600" />
            </button>

            {/* Button 5: Print (طابعة) */}
            <button
              onClick={() => {
                if (sales.length > 0) setSelectedInvoice({ type: 'sale', data: sales[0] });
                else addToast('لا توجد فواتير للطباعة', 'info');
              }}
              title="طباعة آخر وصل أو فاتورة"
              className="w-12 h-12 rounded-full bg-white hover:bg-neutral-100 border-2 border-neutral-300 text-slate-900 flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <Printer className="w-6 h-6 text-slate-800" />
            </button>
          </div>

          {/* Quick status text & shortcut reminders */}
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="bg-neutral-800 px-2.5 py-1 rounded font-mono-numbers border border-neutral-700">
              <strong className="text-white">(F4)</strong> تأكيد | <strong className="text-white">(F5)</strong> طباعة |{' '}
              <strong className="text-white">(F6)</strong> كريدي | <strong className="text-white">(F7)</strong> كاش
            </span>
          </div>
        </div>
      </div>

      {/* --- POPUP MODALS --- */}

      {/* 1. Modal: قائمة الإنتظار (Waitlist / Held Tickets) */}
      {isQueueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-lg w-full overflow-hidden text-slate-800">
            <div className="bg-gradient-to-r from-[#2a2c30] to-[#18191b] p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">قائمة الإنتظار (التذاكر المعلقة)</h3>
              </div>
              <button onClick={() => setIsQueueModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {heldSales.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-sm">لا توجد فواتير معلقة في قائمة الإنتظار حالياً</p>
                  <p className="text-xs text-slate-400 mt-1">
                    يمكنك تعليق أي وصل مفتوح بالضغط على زر "تعليق" من القائمة الجانبية
                  </p>
                </div>
              ) : (
                heldSales.map((held, idx) => (
                  <div
                    key={held.id}
                    className="p-3 rounded-lg border-2 border-slate-200 hover:border-blue-500 bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs bg-slate-200 px-2 py-0.5 rounded font-mono-numbers">
                          #{idx + 1}
                        </span>
                        <span className="font-black text-slate-800 text-sm">{held.customerName}</span>
                        <span className="text-[11px] text-slate-500">({held.heldAt})</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">{held.notes}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreHeldSale(held)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-xs"
                      >
                        استرجاع للبيع
                      </button>
                      <button
                        onClick={() => setHeldSales(prev => prev.filter(h => h.id !== held.id))}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-end">
              <button
                onClick={() => setIsQueueModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: الميزان (Scale / Weight) */}
      {isScaleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-sm w-full overflow-hidden text-slate-800">
            <div className="bg-[#1e2023] p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">وزن السلعة (الميزان الإلكتروني)</h3>
              </div>
              <button onClick={() => setIsScaleModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الوزن المقاس (بالكيلوغرام):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={scaleWeight}
                    onChange={e => setScaleWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded font-mono-numbers font-black text-xl text-center focus:border-red-600 focus:outline-none"
                    autoFocus
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-500">كغ (Kg)</span>
                </div>
              </div>

              {/* Quick weight buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {['0.250', '0.500', '1.000', '1.500', '2.000', '3.000', '5.000', '10.000'].map(w => (
                  <button
                    key={w}
                    onClick={() => setScaleWeight(w)}
                    className="py-1 bg-slate-100 hover:bg-slate-200 border rounded text-xs font-mono-numbers font-bold"
                  >
                    {w} كغ
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsScaleModalOpen(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleApplyWeightScale}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded"
              >
                تطبيق الوزن على الصنف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: الحزمة (Pack / Colisage) */}
      {isPackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-sm w-full overflow-hidden text-slate-800">
            <div className="bg-[#1e2023] p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">بيع بالحزمة / الكرتون (Colisage)</h3>
              </div>
              <button onClick={() => setIsPackModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">عدد القطع في الحزمة الواحدة:</label>
                <input
                  type="number"
                  min="1"
                  value={packQuantity}
                  onChange={e => setPackQuantity(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded font-mono-numbers font-black text-xl text-center focus:border-red-600 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[6, 12, 24, 48].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setPackQuantity(cnt)}
                    className="py-1 bg-slate-100 hover:bg-slate-200 border rounded text-xs font-mono-numbers font-bold"
                  >
                    حزمة {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsPackModalOpen(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleApplyPackQuantity}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded"
              >
                تطبيق الحزمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: أخرى (Other / Custom Qty & Price) */}
      {isOtherModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-sm w-full overflow-hidden text-slate-800">
            <div className="bg-[#1e2023] p-3 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">تعديل الكمية والسعر المخصص [/]</h3>
              <button onClick={() => setIsOtherModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الكمية الجديدة:</label>
                <input
                  type="number"
                  step="any"
                  value={customQtyInput}
                  onChange={e => setCustomQtyInput(e.target.value)}
                  placeholder={selectedRowIndex !== null && cart[selectedRowIndex] ? String(cart[selectedRowIndex].quantity) : '1'}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono-numbers font-bold text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">سعر الوحدة المخصص (د.ج):</label>
                <input
                  type="number"
                  step="any"
                  value={customPriceInput}
                  onChange={e => setCustomPriceInput(e.target.value)}
                  placeholder={selectedRowIndex !== null && cart[selectedRowIndex] ? String(cart[selectedRowIndex].unitPrice) : '0'}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono-numbers font-bold text-sm"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsOtherModalOpen(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleApplyCustomOther}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: بضاعة تالفة (Damaged Goods / Losses) */}
      {isDamagedGoodsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-md w-full overflow-hidden text-slate-800">
            <div className="bg-red-700 p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                <h3 className="font-bold text-sm">تسجيل بضاعة تالفة وخسائر (Perte / Avarie)</h3>
              </div>
              <button onClick={() => setIsDamagedGoodsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {selectedRowIndex !== null && cart[selectedRowIndex] ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs">
                  <div className="font-bold text-red-900 text-sm">{cart[selectedRowIndex].productName}</div>
                  <div className="text-red-700 font-mono-numbers mt-1">
                    الكمية المحددة للتلف: {cart[selectedRowIndex].quantity}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  يرجى التأكد من اختيار صنف من الجدول قبل تسجيل التلف
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">سبب التلف أو الملاحظات:</label>
                <textarea
                  rows={3}
                  value={damagedNotes}
                  onChange={e => setDamagedNotes(e.target.value)}
                  placeholder="مثال: تلف أثناء التخزين، انتهاء الصلاحية، كسر العبوة..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsDamagedGoodsModalOpen(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveDamagedGoods}
                disabled={selectedRowIndex === null || !cart[selectedRowIndex]}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded"
              >
                تأكيد تسجيل التلف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: قائمة البيع (Sales List History) */}
      {isRecentSalesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-2xl w-full overflow-hidden text-slate-800">
            <div className="bg-[#1e2023] p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">قائمة المبيعات اليومية وفواتير الكاشير</h3>
              </div>
              <button onClick={() => setIsRecentSalesModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[420px] overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b">
                    <th className="py-2 px-3">رقم الفاتورة</th>
                    <th className="py-2 px-3">الزبون</th>
                    <th className="py-2 px-3">المبلغ الإجمالي</th>
                    <th className="py-2 px-3">طريقة الدفع</th>
                    <th className="py-2 px-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono-numbers">
                  {sales.slice(0, 15).map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{s.invoiceNumber}</td>
                      <td className="py-2 px-3 font-sans font-medium">{s.customerName}</td>
                      <td className="py-2 px-3 font-bold text-emerald-700">{formatCurrency(s.totalAmount)}</td>
                      <td className="py-2 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-bold">
                          {s.paymentType === 'cash' ? 'نقدي' : s.paymentType === 'credit' ? 'آجل' : 'بطاقة'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-sans">
                        <button
                          onClick={() => {
                            setSelectedInvoice({ type: 'sale', data: s });
                            setIsRecentSalesModalOpen(false);
                          }}
                          className="px-2 py-1 bg-slate-800 text-white rounded text-[11px] font-bold hover:bg-slate-900"
                        >
                          معاينة وطباعة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-end">
              <button
                onClick={() => setIsRecentSalesModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold text-xs rounded"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: الإرجاع (Returns / Refunds) */}
      {isReturnsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-slate-300 max-w-md w-full overflow-hidden text-slate-800">
            <div className="bg-blue-700 p-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-bold text-sm">استرجاع سلعة (Retour Marchandise)</h3>
              </div>
              <button onClick={() => setIsReturnsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                لاسترجاع سلعة وإعادة إدخالها إلى رصيد المخزون مع إرجاع المبلغ للزبون:
              </p>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-blue-900 space-y-1">
                <div>• يمكنك إدخال الكمية بالسالب (مثال: <strong>-1</strong>) في جدول المبيعات.</div>
                <div>• أو التوجه مباشرة إلى قسم المبيعات لتسجيل وصل إرجاع مالي معتمد.</div>
              </div>
            </div>

            <div className="p-3 bg-slate-100 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsReturnsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white font-bold text-xs rounded"
              >
                حسناً
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 8. Modal: ماسح الباركود بكاميرا الهاتف والويب كام */}
      <BarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => {
          setIsCameraScannerOpen(false);
          barcodeInputRef.current?.focus();
        }}
        onScan={(code) => {
          handleCameraScanBarcode(code);
        }}
        title="ماسح الباركود بكاميرا الهاتف (Zin Stock Scanner)"
      />
    </div>
  );
};
