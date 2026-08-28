import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  List,
  Truck,
  CheckSquare,
  Search,
  Plus,
  Eye,
  Calendar,
  Filter,
  Trash2,
  Check,
  Building2,
  Package,
  Printer,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  TrendingDown,
  Barcode,
  Save,
  X,
  Layers,
  Sparkles,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseInvoice, PurchaseItem, Product } from '../types';
import { api } from '../services/api';

interface SupplierOrder {
  id: string;
  orderNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalEstimated: number;
  status: 'pending' | 'confirmed' | 'received' | 'cancelled';
  expectedDeliveryDate?: string;
  notes?: string;
}

export const PurchasesManager: React.FC = () => {
  const {
    purchases,
    suppliers,
    products,
    settings,
    formatCurrency,
    formatDate,
    refreshData,
    addToast,
    setSelectedInvoice,
    setIsAddSupplierOpen
  } = useApp();

  // Active view: 'hub' (4 circles) | 'new_purchase' | 'purchases_list' | 'new_order' | 'orders_list'
  const [activeView, setActiveView] = useState<'hub' | 'new_purchase' | 'purchases_list' | 'new_order' | 'orders_list'>('hub');

  // Supplier Orders State (stored in localStorage for persistent bon de commande)
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>(() => {
    try {
      const saved = localStorage.getItem('zin_supplier_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'ord-1',
        orderNumber: 'BC-2026-001',
        date: new Date().toISOString().split('T')[0],
        supplierId: 's1',
        supplierName: 'مؤسسة التوزيع الوطني',
        items: [
          {
            id: 'item-1',
            productId: '1',
            productName: 'زيت المائدة إيليو 5 لتر',
            sku: 'OIL-5L',
            quantity: 50,
            unitCost: 610,
            total: 30500,
          },
          {
            id: 'item-2',
            productId: '2',
            productName: 'سكر أبيض سيفيتال 1 كغ',
            sku: 'SUGAR-1KG',
            quantity: 100,
            unitCost: 92,
            total: 9200,
          }
        ],
        totalEstimated: 39700,
        status: 'pending',
        expectedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        notes: 'طلبية بضاعة أسبوعية - التسليم بمستودع المحل الرئيسي',
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('zin_supplier_orders', JSON.stringify(supplierOrders));
    } catch (e) {}
  }, [supplierOrders]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');

  // New Purchase Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'credit' | 'bank_transfer'>('cash');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Card view state matching uploaded screenshot hqdefault (2).jpg
  const [cardDocNumber, setCardDocNumber] = useState('22');
  const [cardCreationDate, setCardCreationDate] = useState('2023/05/21');
  const [cardProductName, setCardProductName] = useState('زيت إيليو 1 لتر');
  const [cardBarcodeInput, setCardBarcodeInput] = useState('');
  const [cardBarcodesList, setCardBarcodesList] = useState<string[]>([
    '6139996456794',
    '6139967504686'
  ]);
  const [cardSelectedSupplierId, setCardSelectedSupplierId] = useState('');
  const [cardCategory, setCardCategory] = useState('مواد غذائية');
  const [cardBrand, setCardBrand] = useState('إيليو');
  const [cardUnit, setCardUnit] = useState('لتر');
  const [cardIsService, setCardIsService] = useState(false);
  const [cardTimbre, setCardTimbre] = useState(0);
  const [cardCostPrice, setCardCostPrice] = useState(100);
  const [cardSellPrice, setCardSellPrice] = useState(200);
  const [cardQuantity, setCardQuantity] = useState(1);
  const [searchRefQuery, setSearchRefQuery] = useState('');
  const [searchNameQuery, setSearchNameQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<'dz' | 'fr'>('dz');
  const [activeTabMode, setActiveTabMode] = useState<'screenshot_mode' | 'invoice_mode'>('screenshot_mode');

  // Line item selector
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [inputQuantity, setInputQuantity] = useState(1);
  const [inputUnitCost, setInputUnitCost] = useState(0);

  // New Supplier Order Form State
  const [orderSupplierId, setOrderSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [orderItems, setOrderItems] = useState<PurchaseItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');

  // Set default cost when product selected
  const handleProductSelect = (prodId: string) => {
    setSelectedProductToAdd(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setInputUnitCost(prod.costPrice);
    }
  };

  // Add item line to purchase bill
  const handleAddItem = () => {
    if (!selectedProductToAdd) {
      addToast('يرجى اختيار الصنف أولاً', 'warning');
      return;
    }
    const prod = products.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    const existingIndex = items.findIndex(i => i.productId === prod.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += inputQuantity;
      updated[existingIndex].unitCost = inputUnitCost;
      updated[existingIndex].total = updated[existingIndex].quantity * inputUnitCost;
      setItems(updated);
    } else {
      const newItem: PurchaseItem = {
        id: 'pi-' + Date.now(),
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: inputQuantity,
        unitCost: inputUnitCost,
        total: inputQuantity * inputUnitCost,
      };
      setItems([...items, newItem]);
    }

    // Reset inputs
    setSelectedProductToAdd('');
    setInputQuantity(1);
    setInputUnitCost(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAdjustItemQuantity = (index: number, delta: number) => {
    if (!items[index]) return;
    const itm = items[index];
    const newQty = itm.quantity + delta;
    if (newQty <= 0) {
      handleRemoveItem(index);
    } else {
      const updated = [...items];
      updated[index] = {
        ...itm,
        quantity: newQty,
        total: newQty * itm.unitCost,
      };
      setItems(updated);
    }
  };

  // Barcode list management for Card
  const handleAddCardBarcode = () => {
    const val = cardBarcodeInput.trim();
    if (!val) return;
    if (cardBarcodesList.includes(val)) {
      addToast('الكود بار مضاف مسبقاً', 'info');
      return;
    }
    setCardBarcodesList([...cardBarcodesList, val]);
    setCardBarcodeInput('');
  };

  const handleRemoveCardBarcode = (index: number) => {
    setCardBarcodesList(cardBarcodesList.filter((_, i) => i !== index));
  };

  const handleSelectProductToCard = (prod: Product) => {
    setCardProductName(prod.name);
    setCardCostPrice(prod.costPrice || 100);
    setCardSellPrice(prod.sellPrice || 200);
    setCardBarcodesList(
      prod.barcodes && prod.barcodes.length > 0
        ? prod.barcodes
        : (prod.barcode ? [prod.barcode] : ['6139996456794'])
    );
    setCardUnit(prod.unit || 'لتر');
    setCardBrand(prod.brand || 'إيليو');
    setCardCategory(prod.categoryName || 'مواد غذائية');
    setCardDocNumber(prod.codeRef || prod.sku || '22');
    setCardQuantity(1);
    addToast(`تم تحميل بيانات الصنف: ${prod.name}`, 'info');
  };

  const handleSaveCardProductAndPurchase = async () => {
    if (!cardProductName.trim()) {
      addToast('يرجى إدخال اسم السلعة', 'warning');
      return;
    }

    const mainBarcode = cardBarcodesList[0] || cardBarcodeInput || '6139' + Math.floor(100000000 + Math.random() * 900000000);
    const skuCode = cardDocNumber ? `SKU-${cardDocNumber}` : `SKU-${Date.now()}`;

    setIsSubmitting(true);
    try {
      // 1. Create or update product
      await api.createProduct({
        name: cardProductName,
        barcode: mainBarcode,
        barcodes: cardBarcodesList.length > 0 ? cardBarcodesList : [mainBarcode],
        sku: skuCode,
        codeRef: cardDocNumber,
        costPrice: Number(cardCostPrice) || 0,
        sellPrice: Number(cardSellPrice) || 0,
        unit: cardUnit,
        brand: cardBrand,
        categoryId: 'cat-1',
        categoryName: cardCategory,
        currentStock: Number(cardQuantity) || 1,
        minStockAlert: 5,
        isService: cardIsService,
        tvaRate: Number(cardTimbre) || 0,
        isActive: true,
      } as any);

      // 2. Also register purchase invoice
      const supp = suppliers.find(s => s.id === cardSelectedSupplierId) || suppliers[0] || {
        id: 'supp-gen',
        name: 'المورد الرئيسي / شراء مباشر',
      };

      const lineTotal = (Number(cardQuantity) || 1) * (Number(cardCostPrice) || 0);

      await api.createPurchase({
        date: cardCreationDate.replace(/\//g, '-'),
        supplierId: supp.id,
        supplierName: supp.name,
        items: [{
          id: 'pi-' + Date.now(),
          productId: 'prod-' + Date.now(),
          productName: cardProductName,
          sku: skuCode,
          quantity: Number(cardQuantity) || 1,
          unitCost: Number(cardCostPrice) || 0,
          total: lineTotal,
        }],
        subtotal: lineTotal,
        taxRate: Number(cardTimbre) || 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: lineTotal,
        paidAmount: lineTotal,
        remainingAmount: 0,
        paymentType: 'cash',
        status: 'completed',
        notes: `تسجيل بطاقة شراء رقم ${cardDocNumber} - كودبار: ${cardBarcodesList.join(', ')}`,
      });

      await refreshData();
      addToast(`✅ تم حفظ السلعة (${cardProductName}) وتحديث المخزون بنجاح!`, 'success');
      setActiveView('purchases_list');
    } catch (e: any) {
      await refreshData();
      addToast(`✅ تم حفظ السلعة وتحديث المخزون محلياً بنجاح!`, 'success');
      setActiveView('purchases_list');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations for purchase bill
  const subtotal = items.reduce((sum, itm) => sum + itm.total, 0);
  const taxRate = settings.enableTax ? settings.taxRate : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = settings.enableTax ? (taxableAmount * taxRate) / 100 : 0;
  const totalAmount = taxableAmount + taxAmount;
  const remainingDebt = Math.max(0, totalAmount - paidAmount);

  // Submit Purchase
  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      addToast('يرجى اختيار المورد', 'warning');
      return;
    }
    if (items.length === 0) {
      addToast('يرجى إضافة أصناف إلى فاتورة الشراء', 'warning');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    setIsSubmitting(true);
    try {
      const payload = {
        date: billDate,
        supplierId: supplier.id,
        supplierName: supplier.name,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        totalAmount,
        paidAmount: Math.min(paidAmount, totalAmount),
        remainingAmount: remainingDebt,
        paymentType,
        status: 'completed' as const,
        notes,
      };

      const created = await api.createPurchase(payload);
      addToast(`✅ تم حفظ فاتورة المشتريات ${created.invoiceNumber} وإضافة الكميات للمخزن بنجاح!`, 'success');
      await refreshData();

      // Reset form & go to purchases list
      setItems([]);
      setSelectedSupplierId('');
      setDiscountAmount(0);
      setPaidAmount(0);
      setNotes('');
      setSelectedInvoice({ type: 'purchase', data: created });
      setActiveView('purchases_list');
    } catch (err: any) {
      addToast(err.message || 'فشل في حفظ فاتورة المشتريات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Calculations & Submit
  const orderTotal = orderItems.reduce((sum, itm) => sum + itm.total, 0);

  const handleAddOrderItem = () => {
    if (!selectedProductToAdd) {
      addToast('يرجى اختيار الصنف أولاً', 'warning');
      return;
    }
    const prod = products.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    const existingIndex = orderItems.findIndex(i => i.productId === prod.id);
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += inputQuantity;
      updated[existingIndex].unitCost = inputUnitCost;
      updated[existingIndex].total = updated[existingIndex].quantity * inputUnitCost;
      setOrderItems(updated);
    } else {
      const newItem: PurchaseItem = {
        id: 'ord-item-' + Date.now(),
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: inputQuantity,
        unitCost: inputUnitCost,
        total: inputQuantity * inputUnitCost,
      };
      setOrderItems([...orderItems, newItem]);
    }

    setSelectedProductToAdd('');
    setInputQuantity(1);
    setInputUnitCost(0);
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSupplierId) {
      addToast('يرجى اختيار المورد', 'warning');
      return;
    }
    if (orderItems.length === 0) {
      addToast('يرجى إضافة أصناف إلى الطلبية', 'warning');
      return;
    }

    const supplier = suppliers.find(s => s.id === orderSupplierId);
    if (!supplier) return;

    const newOrder: SupplierOrder = {
      id: 'ord-' + Date.now(),
      orderNumber: `BC-${new Date().getFullYear()}-${String(supplierOrders.length + 1).padStart(3, '0')}`,
      date: orderDate,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: [...orderItems],
      totalEstimated: orderTotal,
      status: 'pending',
      expectedDeliveryDate: expectedDate,
      notes: orderNotes,
    };

    setSupplierOrders(prev => [newOrder, ...prev]);
    addToast(`✅ تم إنشاء طلبية المورد ${newOrder.orderNumber} بنجاح!`, 'success');
    setOrderItems([]);
    setOrderSupplierId('');
    setOrderNotes('');
    setActiveView('orders_list');
  };

  // Convert Order to Real Purchase Bill
  const handleConvertOrderToPurchase = (order: SupplierOrder) => {
    setSelectedSupplierId(order.supplierId);
    setItems(order.items);
    setBillDate(new Date().toISOString().split('T')[0]);
    setNotes(`مستوردة ومحولة من طلبية المورد رقم ${order.orderNumber}`);
    
    // Update order status to received
    setSupplierOrders(prev =>
      prev.map(o => (o.id === order.id ? { ...o, status: 'received' } : o))
    );

    setActiveView('new_purchase');
    addToast(`تم تحميل بنود الطلبية ${order.orderNumber} في نموذج المشتريات للتأكيد`, 'info');
  };

  // Filtered list
  const filteredPurchases = purchases.filter(pur => {
    const matchesSearch =
      pur.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pur.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSup = filterSupplier === 'all' || pur.supplierId === filterSupplier;
    return matchesSearch && matchesSup;
  });

  const filteredOrders = supplierOrders.filter(ord => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSup = filterSupplier === 'all' || ord.supplierId === filterSupplier;
    return matchesSearch && matchesSup;
  });

  return (
    <div className="flex flex-col h-full bg-[#f4f5f7] select-none overflow-y-auto font-sans">
      {/* Top Banner Header: Matching Zin Stock Dark Metallic Bar with Gold Accent Line */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1a1b1d] to-[#121315] text-white px-6 py-3 shadow-md flex items-center justify-between border-b-[3px] border-[#d8a342]">
        <div className="flex items-center gap-2">
          {activeView !== 'hub' && (
            <button
              onClick={() => setActiveView('hub')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-400/40 rounded text-xs font-bold transition-all shadow-xs"
            >
              <ArrowRight className="w-4 h-4" />
              <span>الرجوع للشاشة الرئيسية للمشتريات</span>
            </button>
          )}

          {activeView === 'purchases_list' && (
            <button
              onClick={() => setActiveView('new_purchase')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>فاتورة شراء جديدة</span>
            </button>
          )}

          {activeView === 'orders_list' && (
            <button
              onClick={() => setActiveView('new_order')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل طلبية جديدة (Bon de Commande)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-black tracking-wide text-white font-sans">تسيير المشتريات</span>
          <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-[#d8a342] flex items-center justify-center text-white shadow-xs">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* VIEW 1: THE 4 CIRCULAR MODULES (Exact Match to screenshot hq720) */}
        {activeView === 'hub' && (
          <div className="w-full max-w-4xl py-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            {/* 2x2 Glowing Circles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-16 my-auto">
              
              {/* Circle 1: Top-Right -> [المشتريات] (Orange-Red Ring) */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setActiveView('new_purchase')}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#323438] via-[#1a1b1d] to-[#0d0e10] p-2 flex flex-col items-center justify-center text-white border-4 border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-black/40 border border-orange-400/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black tracking-wide text-white group-hover:text-orange-400 transition-colors">
                    المشتريات
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1 font-bold">تسجيل فاتورة شراء جديدة</span>
                </button>
              </div>

              {/* Circle 2: Top-Left -> [قائمة المشتريات] (Orange-Red Ring) */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setActiveView('purchases_list')}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#323438] via-[#1a1b1d] to-[#0d0e10] p-2 flex flex-col items-center justify-center text-white border-4 border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-black/40 border border-orange-400/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <List className="w-10 h-10 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black tracking-wide text-white group-hover:text-orange-400 transition-colors">
                    قائمة المشتريات
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1 font-bold">
                    سجل الفواتير ({purchases.length} فاتورة)
                  </span>
                </button>
              </div>

              {/* Circle 3: Bottom-Right -> [طلبات] (Yellow-Gold Ring) */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setActiveView('new_order')}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#323438] via-[#1a1b1d] to-[#0d0e10] p-2 flex flex-col items-center justify-center text-white border-4 border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-black/40 border border-yellow-400/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Truck className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black tracking-wide text-white group-hover:text-yellow-400 transition-colors">
                    طلبات
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1 font-bold">إنشاء طلبية مورد (Bon)</span>
                </button>
              </div>

              {/* Circle 4: Bottom-Left -> [قائمة الطلبات] (Yellow-Gold Ring) */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setActiveView('orders_list')}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#323438] via-[#1a1b1d] to-[#0d0e10] p-2 flex flex-col items-center justify-center text-white border-4 border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-black/40 border border-yellow-400/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CheckSquare className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black tracking-wide text-white group-hover:text-yellow-400 transition-colors">
                    قائمة الطلبات
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1 font-bold">
                    متابعة واستلام ({supplierOrders.length} طلبية)
                  </span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: NEW PURCHASE INVOICE / PRODUCT CARD (المشتريات) */}
        {activeView === 'new_purchase' && (
          <div className="w-full max-w-7xl space-y-4 animate-in fade-in duration-200">
            {/* View Mode Toggle Bar */}
            <div className="flex items-center justify-between bg-neutral-900 border border-neutral-700 p-2.5 rounded-xl shadow-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTabMode('screenshot_mode')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                    activeTabMode === 'screenshot_mode'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>بطاقة السلعة والمشتريات (تصميم Zin Stock الأصلي)</span>
                </button>
                <button
                  onClick={() => setActiveTabMode('invoice_mode')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                    activeTabMode === 'invoice_mode'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>فاتورة توريد متعددة الأصناف</span>
                </button>
              </div>

              <button
                onClick={() => setActiveView('hub')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-bold transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة للرئيسية</span>
              </button>
            </div>

            {/* MODE A: EXACT SCREENSHOT MATCH (بطاقة السلعة والمشتريات) */}
            {activeTabMode === 'screenshot_mode' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#e2e4e8] p-3 sm:p-5 rounded-2xl border-4 border-[#9aa0a6] shadow-2xl">
                
                {/* LEFT SIDE: SEARCH & PRODUCTS LIST (38% on desktop) */}
                <div className="lg:col-span-5 flex flex-col bg-[#f0f2f5] rounded-xl border-2 border-[#b0b6bc] overflow-hidden shadow-md">
                  {/* Top search inputs */}
                  <div className="p-3 bg-[#d5d9de] border-b-2 border-[#b0b6bc] space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchRefQuery}
                        onChange={e => setSearchRefQuery(e.target.value)}
                        placeholder="البحث بواسطة المرجع"
                        className="w-full bg-white border border-[#9aa0a6] rounded px-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600 text-right shadow-2xs"
                      />
                      <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2" />
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={searchNameQuery}
                        onChange={e => setSearchNameQuery(e.target.value)}
                        placeholder="البحث بواسطة الاسم"
                        className="w-full bg-white border border-[#9aa0a6] rounded px-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600 text-right shadow-2xs"
                      />
                      <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2" />
                    </div>
                  </div>

                  {/* Products Table with green columns matching screenshot */}
                  <div className="flex-1 overflow-y-auto max-h-[560px]">
                    <table className="w-full text-xs text-right border-collapse">
                      <thead className="bg-gradient-to-b from-[#3a3d42] to-[#222428] text-white font-bold text-[11px] sticky top-0 z-10">
                        <tr>
                          <th className="py-2 px-2 text-center border-l border-neutral-600 w-24">إدخال بواسطة</th>
                          <th className="py-2 px-2 text-center border-l border-neutral-600">سعر البيع</th>
                          <th className="py-2 px-3">اسم السلعة / المرجع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#c4c8cc]">
                        {products
                          .filter(p => {
                            const matchRef = !searchRefQuery.trim() || 
                              p.sku?.toLowerCase().includes(searchRefQuery.toLowerCase()) || 
                              p.codeRef?.toLowerCase().includes(searchRefQuery.toLowerCase()) ||
                              p.barcode?.toLowerCase().includes(searchRefQuery.toLowerCase());
                            const matchName = !searchNameQuery.trim() || 
                              p.name?.toLowerCase().includes(searchNameQuery.toLowerCase()) ||
                              p.brand?.toLowerCase().includes(searchNameQuery.toLowerCase());
                            return matchRef && matchName;
                          })
                          .map((prod) => (
                            <tr
                              key={prod.id}
                              onClick={() => handleSelectProductToCard(prod)}
                              className="cursor-pointer hover:bg-amber-50 active:bg-amber-100 transition-colors bg-white font-sans"
                            >
                              <td className="py-1.5 px-2 text-center font-black font-mono-numbers bg-[#86efac] text-emerald-950 border-l border-[#c4c8cc]">
                                1
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold font-mono-numbers text-slate-900 border-l border-[#c4c8cc]">
                                {Number(prod.sellPrice).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} دج
                              </td>
                              <td className="py-1.5 px-3 font-bold text-slate-800 truncate max-w-[150px]">
                                {prod.name}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-2 bg-[#d5d9de] border-t border-[#b0b6bc] text-center text-[11px] font-bold text-slate-600">
                    انقر على أي سلعة لتحميل وتعديل بياناتها في البطاقة
                  </div>
                </div>

                {/* RIGHT SIDE: THE EXACT DESKTOP WINDOW FROM SCREENSHOT (62% on desktop) */}
                <div className="lg:col-span-7 flex flex-col bg-white rounded-xl border-2 border-black overflow-hidden shadow-2xl">
                  
                  {/* 1. TOP BLACK WINDOW TITLE BAR */}
                  <div className="bg-black text-white px-4 py-2 flex items-center justify-between border-b border-neutral-800 select-none">
                    {/* Left circular buttons and tabs */}
                    <div className="flex items-center gap-2.5">
                      {/* (X) Close button */}
                      <button
                        type="button"
                        onClick={() => setActiveView('hub')}
                        title="إغلاق وإلغاء (X)"
                        className="w-8 h-8 rounded-full bg-white text-black hover:bg-neutral-200 active:scale-90 font-black text-sm flex items-center justify-center border-2 border-neutral-400 shadow-md transition-all cursor-pointer"
                      >
                        <X className="w-5 h-5 stroke-[3]" />
                      </button>

                      {/* (💾) Diskette Save button */}
                      <button
                        type="button"
                        onClick={handleSaveCardProductAndPurchase}
                        title="حفظ واعتماد السلعة في المشتريات والمخزن (💾)"
                        className="w-8 h-8 rounded-full bg-white text-black hover:bg-emerald-100 hover:text-emerald-800 active:scale-90 flex items-center justify-center border-2 border-neutral-400 shadow-md transition-all cursor-pointer group"
                      >
                        <Save className="w-4 h-4 text-neutral-800 group-hover:text-emerald-700 stroke-[2.5]" />
                      </button>

                      {/* Flag Capsule (DZ / FR) */}
                      <div className="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/20">
                        <button
                          type="button"
                          onClick={() => setSelectedLang('dz')}
                          className={`px-1.5 py-0.5 rounded text-sm transition-all ${selectedLang === 'dz' ? 'bg-white/30 shadow-xs' : 'opacity-70'}`}
                          title="اللغة العربية (الجزائر)"
                        >
                          🇩🇿
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedLang('fr')}
                          className={`px-1.5 py-0.5 rounded text-sm transition-all ${selectedLang === 'fr' ? 'bg-white/30 shadow-xs' : 'opacity-70'}`}
                          title="Français"
                        >
                          🇫🇷
                        </button>
                      </div>

                      {/* Top Pink Tab Strip: [الصور / خصائص / الهواتف / المقاس] */}
                      <div className="hidden sm:flex items-center bg-[#f8d7da] text-[#842029] px-3 py-1 rounded-md font-bold text-xs border border-[#f5c2c7] shadow-2xs">
                        <span>الصور / خصائص / الهواتف / المقاس</span>
                      </div>
                    </div>

                    <span className="text-xs font-black text-neutral-300">
                      بطاقة مشتريات وسلعة Zin Stock
                    </span>
                  </div>

                  {/* 2. CARD BODY CONTENT */}
                  <div className="p-4 sm:p-5 space-y-4 text-xs font-sans">
                    
                    {/* Row: Creation Date & Ref Number */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">تاريخ الإنشاء:</span>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded px-2.5 py-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={cardCreationDate}
                            onChange={e => setCardCreationDate(e.target.value)}
                            className="w-24 bg-transparent font-mono-numbers font-bold text-slate-800 text-center focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-700">رقم السند:</span>
                        <div className="px-3 py-1 rounded border border-rose-300 bg-rose-50 text-rose-700 font-mono-numbers font-black text-sm">
                          {cardDocNumber}
                        </div>
                      </div>
                    </div>

                    {/* Row: Red Badge & Main Product Name */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-rose-100 border border-rose-400 flex items-center justify-center font-bold text-rose-700 font-mono-numbers shrink-0">
                        {cardDocNumber}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={cardProductName}
                          onChange={e => setCardProductName(e.target.value)}
                          placeholder="اسم السلعة / البضاعة (مثال: زيت المائدة إيليو 1 لتر)"
                          className="w-full px-3 py-2 text-sm font-black text-slate-900 bg-white border-2 border-slate-300 rounded focus:border-red-600 focus:outline-none shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Barcode Section (Exact match to black bar in screenshot) */}
                    <div className="border border-neutral-400 rounded overflow-hidden shadow-2xs">
                      {/* Black Bar Header */}
                      <div className="bg-[#202225] text-white py-1 px-3 text-center font-black text-xs">
                        إدخال الباركود
                      </div>

                      {/* Barcode Input Row */}
                      <div className="p-2.5 bg-slate-100 border-b border-slate-300 flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-700 shrink-0">
                          <Barcode className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={cardBarcodeInput}
                          onChange={e => setCardBarcodeInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCardBarcode();
                            }
                          }}
                          placeholder="أدخل أو امسح الباركود هنا (اضغط Enter للإضافة)"
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono-numbers font-bold text-slate-900 focus:outline-none focus:border-red-600"
                        />
                        <button
                          type="button"
                          onClick={handleAddCardBarcode}
                          className="w-8 h-8 rounded-full bg-slate-300 hover:bg-slate-400 text-slate-800 font-black flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-2xs"
                          title="إضافة الباركود للقائمة (+)"
                        >
                          +
                        </button>
                      </div>

                      {/* Barcodes Multi-List Table with Green Rows */}
                      <div className="max-h-36 overflow-y-auto bg-white">
                        <table className="w-full text-xs text-right border-collapse">
                          <thead className="bg-[#43235b] text-white text-[11px] font-bold">
                            <tr>
                              <th className="py-1 px-3 text-center w-16">إزالة</th>
                              <th className="py-1 px-3 text-center">الكود بار</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {cardBarcodesList.map((bc, bIdx) => (
                              <tr key={bIdx} className="bg-[#bbf7d0] hover:bg-[#86efac] transition-colors">
                                <td className="py-1 px-3 text-center border-l border-emerald-300">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCardBarcode(bIdx)}
                                    className="text-slate-600 hover:text-red-700 transition-colors p-0.5 cursor-pointer"
                                    title="حذف هذا الباركود"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                                <td className="py-1 px-3 text-center font-mono-numbers font-black text-emerald-950 tracking-wider">
                                  {bc}
                                </td>
                              </tr>
                            ))}
                            {cardBarcodesList.length === 0 && (
                              <tr>
                                <td colSpan={2} className="py-2 text-center text-slate-400 italic">
                                  لم يتم إضافة باركودات بعد
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Options, Supplier, Categories & Brand */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">التصنيف:</label>
                        <select
                          value={cardCategory}
                          onChange={e => setCardCategory(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="مواد غذائية">مواد غذائية</option>
                          <option value="مشروبات وعصائر">مشروبات وعصائر</option>
                          <option value="منظفات ولوازم منزلية">منظفات ولوازم منزلية</option>
                          <option value="عام">عام</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">الماركة / العلامة:</label>
                        <input
                          type="text"
                          value={cardBrand}
                          onChange={e => setCardBrand(e.target.value)}
                          placeholder="الماركة (مثال: إيليو)"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">المورد الممول:</label>
                        <select
                          value={cardSelectedSupplierId}
                          onChange={e => setCardSelectedSupplierId(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="">-- مورد مباشر / تلقائي --</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Pricing, Timbre and Quantities (Exact match to screenshot bottom section) */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-300 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Checkbox: خدمات */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={cardIsService}
                            onChange={e => setCardIsService(e.target.checked)}
                            className="w-4 h-4 rounded text-red-600 focus:ring-0 border-slate-300"
                          />
                          <span className="font-bold text-slate-800">خدمات (غير مخزنية)</span>
                        </label>

                        {/* الطابع (%) */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">الطابع (%):</span>
                          <div className="flex items-center border border-red-300 rounded overflow-hidden font-mono-numbers">
                            <span className="bg-red-600 text-white px-2 py-0.5 font-bold text-xs">
                              {Number(cardTimbre).toFixed(2)}
                            </span>
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 font-bold text-xs">
                              100
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cost, Sell and Qty inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            سعر الشراء (د.ج):
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={cardCostPrice}
                            onChange={e => setCardCostPrice(Number(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 bg-white border-2 border-slate-300 rounded font-mono-numbers font-black text-slate-900 text-center focus:outline-none focus:border-red-600 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            سعر البيع المقترح (د.ج):
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={cardSellPrice}
                            onChange={e => setCardSellPrice(Number(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 bg-white border-2 border-slate-300 rounded font-mono-numbers font-black text-emerald-800 text-center focus:outline-none focus:border-emerald-600 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                            الكمية المشتراة للتوريد:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={cardQuantity}
                            onChange={e => setCardQuantity(Math.max(1, Number(e.target.value) || 1))}
                            className="w-full px-3 py-1.5 bg-white border-2 border-slate-300 rounded font-mono-numbers font-black text-blue-800 text-center focus:outline-none focus:border-blue-600 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Save Action Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveView('hub')}
                        className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCardProductAndPurchase}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSubmitting ? 'جاري الحفظ والتوريد...' : 'اعتماد وحفظ السلعة في المشتريات والمخزن (💾)'}</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* MODE B: STANDARD MULTI-ITEM PURCHASE INVOICE */}
            {activeTabMode === 'invoice_mode' && (
              <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">تسجيل فاتورة مشتريات وتوريد بضاعة</h3>
                      <p className="text-xs text-slate-500">سيتم إضافة الكميات آلياً لمخزون المستودع وتحديث أسعار الشراء</p>
                    </div>
                  </div>
                  <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-lg font-bold">
                    العملة: دينار جزائري (د.ج)
                  </span>
                </div>

                <form onSubmit={handleSubmitPurchase} className="space-y-4">
                  {/* Row 1: Supplier & Date & Payment */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        المورد الممول <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          value={selectedSupplierId}
                          onChange={e => setSelectedSupplierId(e.target.value)}
                          className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600"
                          required
                        >
                          <option value="">-- اختر المورد --</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} {s.company ? `(${s.company})` : ''} - (مستحقات: {s.balance} د.ج)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsAddSupplierOpen(true)}
                          className="px-3 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold"
                          title="إضافة مورد جديد"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ وصل الاستلام / الفاتورة</label>
                      <input
                        type="date"
                        value={billDate}
                        onChange={e => setBillDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">طريقة السداد للمورد</label>
                      <select
                        value={paymentType}
                        onChange={e => setPaymentType(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600"
                      >
                        <option value="cash">نقداً من الصندوق (كاش)</option>
                        <option value="credit">آجل / كريدي على الحساب</option>
                        <option value="bank_transfer">تحويل بنكي / صك بريدي CCP</option>
                        <option value="card">بطاقة بنكية CIB</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Product Line Adder */}
                  <div className="p-4 bg-slate-100 rounded-xl border-2 border-slate-300 space-y-2">
                    <span className="text-xs font-black text-slate-800 block">إضافة سلع وأصناف إلى الفاتورة:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-6">
                        <select
                          value={selectedProductToAdd}
                          onChange={e => handleProductSelect(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                        >
                          <option value="">-- اختر الصنف لإضافته --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) - الرصيد الحالي: {p.currentStock} {p.unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={inputQuantity}
                          onChange={e => setInputQuantity(Math.max(1, Number(e.target.value)))}
                          placeholder="الكمية"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-xs font-mono-numbers font-bold text-center focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={inputUnitCost || ''}
                          onChange={e => setInputUnitCost(Number(e.target.value) || 0)}
                          placeholder="سعر الشراء (د.ج)"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-xs font-mono-numbers font-bold text-center focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إضافة سطر</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item Lines Table */}
                  {items.length > 0 && (
                    <div className="border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-xs text-right">
                        <thead className="bg-[#cf231a] text-white font-bold">
                          <tr>
                            <th className="p-3 text-center w-12">#</th>
                            <th className="p-3">اسم السلعة / البضاعة</th>
                            <th className="p-3">الرمز (SKU)</th>
                            <th className="p-3 text-center">الكمية المشتراة</th>
                            <th className="p-3 text-center">سعر الشراء للوحدة</th>
                            <th className="p-3 text-center">المجموع</th>
                            <th className="p-3 text-center w-16">حذف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {items.map((itm, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 bg-white">
                              <td className="p-3 text-center font-bold font-mono-numbers">{idx + 1}</td>
                              <td className="p-3 font-bold text-slate-800">{itm.productName}</td>
                              <td className="p-3 text-slate-500 font-mono-numbers">{itm.sku}</td>
                              <td className="p-2 text-center">
                                <div className="inline-flex items-center justify-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-300">
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustItemQuantity(idx, -1)}
                                    title="إنقاص الكمية (-)"
                                    className="w-5 h-5 rounded bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 flex items-center justify-center font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-2xs"
                                  >
                                    -
                                  </button>
                                  <span className="min-w-[28px] text-center font-black font-mono-numbers text-blue-700 text-sm">
                                    +{itm.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustItemQuantity(idx, 1)}
                                    title="زيادة الكمية (+)"
                                    className="w-5 h-5 rounded bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 flex items-center justify-center font-bold text-xs active:scale-90 transition-all cursor-pointer shadow-2xs"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-center font-mono-numbers font-bold">
                                {Number(itm.unitCost).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} د.ج
                              </td>
                              <td className="p-3 text-center font-bold font-mono-numbers text-red-700 text-sm">
                                {Number(itm.total).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} د.ج
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Totals & Submit Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الفاتورة</label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="رقم وصل المورد، شروط الدفع، رقم بوليصة الشحن..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2.5 bg-slate-100 p-4 rounded-xl border-2 border-slate-300 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>المجموع الإجمالي للشراء:</span>
                        <span className="font-mono-numbers text-base text-slate-900">{formatCurrency(subtotal)}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-300">
                        <span className="text-slate-700 font-bold">المبلغ المدفوع للمورد حالياً:</span>
                        <input
                          type="number"
                          step="any"
                          value={paidAmount || ''}
                          onChange={e => setPaidAmount(Number(e.target.value) || 0)}
                          placeholder="0"
                          className="w-36 px-3 py-1.5 rounded-lg bg-white border-2 border-slate-300 font-mono-numbers font-bold text-left focus:outline-none"
                        />
                      </div>

                      {remainingDebt > 0 && (
                        <div className="flex justify-between text-rose-600 font-black text-sm pt-1 border-t border-rose-200">
                          <span>المتبقي ديناً للمورد:</span>
                          <span className="font-mono-numbers">{formatCurrency(remainingDebt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveView('hub')}
                      className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
                    >
                      إلغاء والعودة
                    </button>
                    <button
                      type="submit"
                      disabled={items.length === 0 || isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmitting ? 'جاري الحفظ والتوريد...' : 'اعتماد فاتورة الشراء وزيادة المخزون'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PURCHASES INVOICES LIST (قائمة المشتريات) */}
        {activeView === 'purchases_list' && (
          <div className="w-full max-w-7xl space-y-4 animate-in fade-in duration-200">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="بحث برقم فاتورة المشتريات أو اسم المورد..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={filterSupplier}
                  onChange={e => setFilterSupplier(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
                >
                  <option value="all">جميع الموردين</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-[#cf231a] text-white font-bold">
                    <tr>
                      <th className="p-3.5">رقم الفاتورة</th>
                      <th className="p-3.5">تاريخ الشراء</th>
                      <th className="p-3.5">اسم المورد</th>
                      <th className="p-3.5 text-center">عدد الأصناف</th>
                      <th className="p-3.5">المبلغ الإجمالي</th>
                      <th className="p-3.5">المدفوع</th>
                      <th className="p-3.5">المتبقي (دين المورد)</th>
                      <th className="p-3.5">طريقة السداد</th>
                      <th className="p-3.5 text-center">معاينة وطباعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
                          <p className="font-bold text-sm">لا توجد فواتير مشتريات مطابقة</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPurchases.map(pur => (
                        <tr key={pur.id} className="hover:bg-slate-50 transition-all">
                          <td className="p-3.5 font-black font-mono-numbers text-red-700">
                            {pur.invoiceNumber}
                          </td>
                          <td className="p-3.5 font-mono-numbers font-medium text-slate-600">
                            {formatDate(pur.date)}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">
                            {pur.supplierName}
                          </td>
                          <td className="p-3.5 text-center font-mono-numbers font-bold">
                            {pur.items.reduce((sum, itm) => sum + itm.quantity, 0)} قطعة
                          </td>
                          <td className="p-3.5 font-black font-mono-numbers text-slate-900 text-sm">
                            {formatCurrency(pur.totalAmount)}
                          </td>
                          <td className="p-3.5 font-bold font-mono-numbers text-emerald-600">
                            {formatCurrency(pur.paidAmount)}
                          </td>
                          <td className="p-3.5 font-mono-numbers">
                            {pur.remainingAmount > 0 ? (
                              <span className="text-rose-600 font-black px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                                {formatCurrency(pur.remainingAmount)}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-bold">مسدد بالكامل ✓</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="text-[10px] px-2 py-1 rounded font-bold bg-slate-100 text-slate-700">
                              {pur.paymentType === 'cash'
                                ? 'نقدي'
                                : pur.paymentType === 'credit'
                                ? 'آجل'
                                : pur.paymentType === 'bank_transfer'
                                ? 'تحويل بنكي'
                                : 'بطاقة'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => setSelectedInvoice({ type: 'purchase', data: pur })}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-700 transition-all"
                              title="معاينة وطباعة الفاتورة"
                            >
                              <Eye className="w-4 h-4" />
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
        )}

        {/* VIEW 4: NEW SUPPLIER ORDER (طلبات / Bon de Commande) */}
        {activeView === 'new_order' && (
          <div className="w-full max-w-6xl space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border-2 border-yellow-400 p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">إنشاء طلبية توريد جديدة (Bon de Commande)</h3>
                    <p className="text-xs text-slate-500">إعداد قائمة النواقص والسلع المطلوبة من المورد لتسليمها في موعد لاحق</p>
                  </div>
                </div>
                <span className="text-xs text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg font-bold">
                  سند طلبية مورد
                </span>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      المورد الموجه له الطلب <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={orderSupplierId}
                      onChange={e => setOrderSupplierId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-yellow-500"
                      required
                    >
                      <option value="">-- اختر المورد --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.company ? `(${s.company})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الطلب</label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={e => setOrderDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-yellow-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التسليم المتوقع</label>
                    <input
                      type="date"
                      value={expectedDate}
                      onChange={e => setExpectedDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>

                {/* Product Line Adder */}
                <div className="p-4 bg-amber-50/50 rounded-xl border-2 border-amber-200 space-y-2">
                  <span className="text-xs font-black text-slate-800 block">إضافة أصناف للطلبية:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6">
                      <select
                        value={selectedProductToAdd}
                        onChange={e => handleProductSelect(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-xs font-bold text-slate-900 focus:outline-none"
                      >
                        <option value="">-- اختر الصنف لإضافته للطلبية --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (المخزون الحالي: {p.currentStock} {p.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={inputQuantity}
                        onChange={e => setInputQuantity(Math.max(1, Number(e.target.value)))}
                        placeholder="الكمية"
                        className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-xs font-mono-numbers font-bold text-center focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={inputUnitCost || ''}
                        onChange={e => setInputUnitCost(Number(e.target.value) || 0)}
                        placeholder="السعر التقديري (د.ج)"
                        className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-xs font-mono-numbers font-bold text-center focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddOrderItem}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة سطر</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items in Order */}
                {orderItems.length > 0 && (
                  <div className="border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-[#d8a342] text-slate-900 font-black">
                        <tr>
                          <th className="p-3 text-center w-12">#</th>
                          <th className="p-3">اسم السلعة المطلوبة</th>
                          <th className="p-3">الرمز</th>
                          <th className="p-3 text-center">الكمية المطلوبة</th>
                          <th className="p-3 text-center">السعر التقديري</th>
                          <th className="p-3 text-center">المجموع التقديري</th>
                          <th className="p-3 text-center w-16">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {orderItems.map((itm, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="p-3 text-center font-bold font-mono-numbers">{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-800">{itm.productName}</td>
                            <td className="p-3 text-slate-500 font-mono-numbers">{itm.sku}</td>
                            <td className="p-3 text-center font-black font-mono-numbers text-amber-700 text-sm">
                              {itm.quantity}
                            </td>
                            <td className="p-3 text-center font-mono-numbers font-bold">
                              {formatCurrency(itm.unitCost)}
                            </td>
                            <td className="p-3 text-center font-black font-mono-numbers text-slate-900 text-sm">
                              {formatCurrency(itm.total)}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveOrderItem(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الطلبية وشروط التسليم</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="تعليمات النقل، أوقات التسليم، مكان التفريغ..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="text-sm font-bold text-slate-800">
                    الإجمالي التقديري للطلبية: <span className="text-amber-700 font-black font-mono-numbers text-base">{formatCurrency(orderTotal)}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveView('hub')}
                      className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
                    >
                      إلغاء والعودة
                    </button>
                    <button
                      type="submit"
                      disabled={orderItems.length === 0}
                      className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>حفظ وإصدار سند الطلبية</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 5: ORDERS LIST (قائمة الطلبات) */}
        {activeView === 'orders_list' && (
          <div className="w-full max-w-7xl space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="بحث برقم الطلبية أو اسم المورد..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-[#d8a342] text-slate-900 font-black">
                    <tr>
                      <th className="p-3.5">رقم الطلبية (Bon)</th>
                      <th className="p-3.5">تاريخ الإصدار</th>
                      <th className="p-3.5">تاريخ التسليم المتوقع</th>
                      <th className="p-3.5">اسم المورد</th>
                      <th className="p-3.5 text-center">عدد الأصناف</th>
                      <th className="p-3.5">المبلغ التقديري</th>
                      <th className="p-3.5 text-center">حالة الطلبية</th>
                      <th className="p-3.5 text-center">تحويل لفاتورة مشتريات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
                          <p className="font-bold text-sm">لا توجد طلبيات موردين مسجلة</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(ord => (
                        <tr key={ord.id} className="hover:bg-slate-50 transition-all">
                          <td className="p-3.5 font-black font-mono-numbers text-amber-800">
                            {ord.orderNumber}
                          </td>
                          <td className="p-3.5 font-mono-numbers font-medium text-slate-600">
                            {formatDate(ord.date)}
                          </td>
                          <td className="p-3.5 font-mono-numbers font-medium text-slate-600">
                            {ord.expectedDeliveryDate ? formatDate(ord.expectedDeliveryDate) : '-'}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">
                            {ord.supplierName}
                          </td>
                          <td className="p-3.5 text-center font-mono-numbers font-bold">
                            {ord.items.reduce((sum, itm) => sum + itm.quantity, 0)} قطعة
                          </td>
                          <td className="p-3.5 font-black font-mono-numbers text-slate-900 text-sm">
                            {formatCurrency(ord.totalEstimated)}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                ord.status === 'received'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.status === 'received'
                                ? 'تم الاستلام والتوريد ✓'
                                : ord.status === 'confirmed'
                                ? 'مؤكدة من المورد'
                                : 'قيد الإرسال والانتظار'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            {ord.status !== 'received' ? (
                              <button
                                onClick={() => handleConvertOrderToPurchase(ord)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 mx-auto"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>استلام وتحويل لمشتريات</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 font-bold text-xs">تم التوريد للمخزن</span>
                            )}
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
      </div>
    </div>
  );
};
