import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  Barcode,
  X,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  User,
  Coins,
  Package,
  Calendar,
  Printer,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Plus,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Customer, SaleInvoice, CustomerReturn, CustomerReturnItem } from '../../types';
import { api } from '../../services/api';

interface CustomerReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoiceId?: string;
  onReturnCompleted?: (returnRecord: CustomerReturn) => void;
}

export const CustomerReturnModal: React.FC<CustomerReturnModalProps> = ({
  isOpen,
  onClose,
  initialInvoiceId,
  onReturnCompleted
}) => {
  const {
    products,
    customers,
    sales,
    currentUser,
    settings,
    formatCurrency,
    formatDate,
    addToast,
    refreshData
  } = useApp();

  const [returnMode, setReturnMode] = useState<'invoice' | 'direct'>('invoice');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  
  // Direct return state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cash');
  const [directProductSearch, setDirectProductSearch] = useState('');
  
  // Selected items to return
  const [returnItems, setReturnItems] = useState<{
    productId: string;
    productName: string;
    sku?: string;
    barcode?: string;
    maxQuantity: number;
    returnQuantity: number;
    unitPrice: number;
    condition: 'good' | 'damaged' | 'defective';
    reason: string;
  }[]>([]);

  // Refund Options
  const [refundMethod, setRefundMethod] = useState<'cash' | 'deduct_debt' | 'credit_note'>('cash');
  const [restockItems, setRestockItems] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Completed Return view for receipt printing
  const [completedReturn, setCompletedReturn] = useState<CustomerReturn | null>(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCompletedReturn(null);
      setIsSubmitting(false);
      setNotes('');
      setRefundMethod('cash');
      setRestockItems(true);

      if (initialInvoiceId) {
        setReturnMode('invoice');
        setSelectedInvoiceId(initialInvoiceId);
        loadInvoiceItems(initialInvoiceId);
      } else {
        setSelectedInvoiceId('');
        setReturnItems([]);
      }
    }
  }, [isOpen, initialInvoiceId]);

  if (!isOpen) return null;

  // Filter sales for invoice search
  const filteredSales = sales.filter(s => {
    const q = invoiceSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.invoiceNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      (s.customerPhone && s.customerPhone.includes(q))
    );
  });

  const selectedInvoice = sales.find(s => s.id === selectedInvoiceId);

  const loadInvoiceItems = (invId: string) => {
    const inv = sales.find(s => s.id === invId);
    if (!inv) return;
    
    // Default to putting 0 quantity for each item, user can increase
    const items = inv.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      barcode: item.barcode,
      maxQuantity: item.quantity,
      returnQuantity: 0,
      unitPrice: item.unitPrice,
      condition: 'good' as const,
      reason: 'طلب إرجاع من الزبون'
    }));
    setReturnItems(items);
  };

  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    loadInvoiceItems(invId);
  };

  // Direct Mode: Add product to return list
  const handleAddDirectProduct = (prod: Product) => {
    const existingIndex = returnItems.findIndex(i => i.productId === prod.id);
    if (existingIndex >= 0) {
      setReturnItems(prev =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, returnQuantity: item.returnQuantity + 1 }
            : item
        )
      );
    } else {
      setReturnItems(prev => [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          barcode: prod.barcode,
          maxQuantity: 9999,
          returnQuantity: 1,
          unitPrice: prod.sellPrice,
          condition: 'good',
          reason: 'إرجاع مباشر من الزبون'
        }
      ]);
    }
    setDirectProductSearch('');
    addToast(`تمت إضافة ${prod.name} لقائمة الإرجاع`, 'info');
  };

  // Adjust return quantity
  const handleQuantityChange = (index: number, newQty: number) => {
    setReturnItems(prev =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const validQty = Math.max(0, Math.min(newQty, item.maxQuantity));
        return { ...item, returnQuantity: validQty };
      })
    );
  };

  // Adjust condition
  const handleConditionChange = (index: number, condition: 'good' | 'damaged' | 'defective') => {
    setReturnItems(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, condition } : item))
    );
  };

  // Adjust reason
  const handleReasonChange = (index: number, reason: string) => {
    setReturnItems(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, reason } : item))
    );
  };

  // Remove item from direct return
  const handleRemoveItem = (index: number) => {
    setReturnItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Calculate active return items and total
  const activeReturnItems = returnItems.filter(i => i.returnQuantity > 0);
  const totalRefundAmount = activeReturnItems.reduce(
    (sum, item) => sum + item.returnQuantity * item.unitPrice,
    0
  );

  // Submit and process the return
  const handleSubmitReturn = async () => {
    if (activeReturnItems.length === 0) {
      addToast('يرجى تحديد كمية صنف واحد على الأقل للإرجاع', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine Customer Details
      let customerId = 'cust-cash';
      let customerName = 'عميل نقدي عام';
      let customerPhone = '';

      if (returnMode === 'invoice' && selectedInvoice) {
        customerId = selectedInvoice.customerId || 'cust-cash';
        customerName = selectedInvoice.customerName;
        customerPhone = selectedInvoice.customerPhone || '';
      } else if (selectedCustomerId !== 'cash') {
        const cust = customers.find(c => c.id === selectedCustomerId);
        if (cust) {
          customerId = cust.id;
          customerName = cust.name;
          customerPhone = cust.phone;
        }
      }

      const returnNumber = `RET-CLI-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 90000 + 10000)
      )}`;

      const customerReturnData: CustomerReturn = {
        id: 'ret-' + Date.now(),
        returnNumber,
        invoiceId: selectedInvoice?.id,
        invoiceNumber: selectedInvoice?.invoiceNumber,
        customerId,
        customerName,
        customerPhone,
        date: new Date().toISOString().split('T')[0],
        items: activeReturnItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          barcode: i.barcode,
          quantity: i.returnQuantity,
          unitPrice: i.unitPrice,
          total: i.returnQuantity * i.unitPrice,
          condition: i.condition,
          reason: i.reason
        })),
        totalRefund: totalRefundAmount,
        refundMethod,
        restockItems,
        notes: notes.trim() || undefined,
        cashierName: currentUser?.fullName || 'عبدو زين',
        createdAt: new Date().toISOString()
      };

      // 1. Process Stock Adjustments if items are in good condition and restockItems is checked
      for (const item of activeReturnItems) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          if (restockItems && item.condition === 'good') {
            const newStock = prod.currentStock + item.returnQuantity;
            try {
              await api.adjustStock(
                prod.id,
                newStock,
                `إرجاع سلعة من الزبون بموجب وصل ${returnNumber}`
              );
            } catch (err) {
              console.warn('Could not call api.adjustStock directly, updating local state cache:', err);
            }
          }
        }
      }

      // 2. Adjust Customer Debt if refund method is deduct_debt
      if (refundMethod === 'deduct_debt' && customerId !== 'cust-cash') {
        const cust = customers.find(c => c.id === customerId);
        if (cust) {
          const newDebt = Math.max(0, (cust.currentDebt || 0) - totalRefundAmount);
          try {
            await api.updateCustomer(cust.id, { currentDebt: newDebt });
          } catch (err) {
            console.warn('Customer debt update fallback:', err);
          }
        }
      }

      // 3. Save Customer Return into LocalStorage history
      try {
        const existingReturns = JSON.parse(localStorage.getItem('zin_customer_returns') || '[]');
        localStorage.setItem(
          'zin_customer_returns',
          JSON.stringify([customerReturnData, ...existingReturns])
        );
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      // 4. Refresh global data
      await refreshData();

      setCompletedReturn(customerReturnData);
      if (onReturnCompleted) onReturnCompleted(customerReturnData);

      addToast(`تم تسجيل عملية الإرجاع بنجاح: ${returnNumber}`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'حدث خطأ أثناء معالجة عملية الإرجاع', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReturnReceipt = () => {
    window.print();
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget && !completedReturn) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 max-w-3xl w-full overflow-hidden text-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="no-print bg-gradient-to-r from-[#1c1d20] via-[#24262b] to-[#1c1d20] p-4 text-white flex items-center justify-between border-b-2 border-rose-600 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-inner">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                إرجاع واسترداد سلع الزبائن
                <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Retour Client
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                استرجاع بضاعة، تعديل رصيد المخزون، وإرجاع المبلغ أو خصمه من الدين
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="إغلاق"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- IF RETURN COMPLETED: SHOW RETURN RECEIPT --- */}
        {completedReturn ? (
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* Success Message Banner */}
            <div className="no-print p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between gap-3 text-emerald-900">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-black text-sm">تم تسجيل وصل الإرجاع بنجاح في النظام!</div>
                  <div className="text-xs text-emerald-700 font-mono-numbers mt-0.5">
                    رقم الوصل: <strong>{completedReturn.returnNumber}</strong> | المبلغ المسترد: <strong>{formatCurrency(completedReturn.totalRefund)}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePrintReturnReceipt}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الوصل</span>
              </button>
            </div>

            {/* Printable Return Voucher (Bon de Retour) */}
            <div className="p-6 bg-white border-2 border-slate-300 rounded-2xl shadow-sm text-slate-900 font-sans space-y-4">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h2 className="text-xl font-black text-slate-900">{settings.storeName}</h2>
                <div className="text-xs text-slate-500 mt-0.5">{settings.tagline}</div>
                <div className="text-xs font-bold text-slate-600 mt-1">{settings.phone} | {settings.address}</div>
                <div className="mt-2 inline-block px-4 py-1 bg-rose-100 text-rose-800 rounded-full font-black text-sm border border-rose-300">
                  وصل إرجاع بضاعة واسترداد مالي (BON DE RETOUR)
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-bold">رقم وصل الإرجاع: </span>
                  <span className="font-black font-mono-numbers text-slate-900">{completedReturn.returnNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">التاريخ: </span>
                  <span className="font-bold font-mono-numbers text-slate-900">{formatDate(completedReturn.date)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">الزبون: </span>
                  <span className="font-bold text-slate-900">{completedReturn.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">طريقة الاسترداد: </span>
                  <span className="font-bold text-slate-900">
                    {completedReturn.refundMethod === 'cash'
                      ? 'نقداً من الصندوق (Cash)'
                      : completedReturn.refundMethod === 'deduct_debt'
                      ? 'خصم من دين الزبون'
                      : 'رصيد دائن'}
                  </span>
                </div>
                {completedReturn.invoiceNumber && (
                  <div className="col-span-2">
                    <span className="text-slate-500 font-bold">مرجع الفاتورة الأصلية: </span>
                    <span className="font-mono-numbers font-bold text-blue-700">{completedReturn.invoiceNumber}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-right text-xs border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className="p-2 border border-slate-700 text-center w-10">#</th>
                    <th className="p-2 border border-slate-700">اسم السلعة المسترجعة</th>
                    <th className="p-2 border border-slate-700 text-center w-16">الكمية</th>
                    <th className="p-2 border border-slate-700 text-center w-24">سعر الوحدة</th>
                    <th className="p-2 border border-slate-700 text-center w-28">المبلغ المسترد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono-numbers">
                  {completedReturn.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-center border-l font-bold text-slate-600">{idx + 1}</td>
                      <td className="p-2 border-l font-bold font-sans text-slate-900">
                        {item.productName}
                        {item.reason && <span className="text-[10px] text-slate-500 block font-normal">السبب: {item.reason}</span>}
                      </td>
                      <td className="p-2 text-center border-l font-black text-rose-700">{item.quantity}</td>
                      <td className="p-2 text-center border-l text-slate-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2 text-center font-black text-rose-700">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total & Signatures */}
              <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-center justify-between">
                <span className="font-black text-sm text-rose-900">المبلغ الإجمالي المسترد للزبون:</span>
                <span className="text-2xl font-black text-rose-700 font-mono-numbers">
                  {formatCurrency(completedReturn.totalRefund)}
                </span>
              </div>

              <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-600 border-t border-slate-200 mt-4">
                <div>
                  <span className="block font-bold">توقيع وختم المتجر:</span>
                  <div className="h-12"></div>
                </div>
                <div>
                  <span className="block font-bold">توقيع واستلام الزبون:</span>
                  <div className="h-12"></div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="no-print flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          /* --- RETURN WIZARD & SELECTION VIEW --- */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Top Switcher: By Invoice vs Direct Return */}
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setReturnMode('invoice');
                    setReturnItems([]);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    returnMode === 'invoice'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>إرجاع بموجب فاتورة سابقة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReturnMode('direct');
                    setReturnItems([]);
                    setSelectedInvoiceId('');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    returnMode === 'direct'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إرجاع حر ومباشر</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
                {returnMode === 'invoice'
                  ? 'اختر الفاتورة وحدد الأصناف المسترجعة'
                  : 'حدد الزبون والسلع المراد إرجاعها يدوياً'}
              </span>
            </div>

            {/* Selection Area based on Mode */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              {returnMode === 'invoice' ? (
                /* Invoice Search & Select */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      بحث عن الفاتورة برقمها أو اسم الزبون:
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                      <input
                        type="text"
                        value={invoiceSearchQuery}
                        onChange={e => setInvoiceSearchQuery(e.target.value)}
                        placeholder="اكتب رقم الفاتورة أو اسم الزبون..."
                        className="w-full pl-3 pr-9 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      اختيار الفاتورة المرجعية ({filteredSales.length}):
                    </label>
                    <select
                      value={selectedInvoiceId}
                      onChange={e => handleSelectInvoice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500 font-mono-numbers"
                    >
                      <option value="">-- اختر الفاتورة المراد الإرجاع منها --</option>
                      {filteredSales.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} - {inv.customerName} ({formatCurrency(inv.totalAmount)}) - {inv.date}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                /* Direct Return: Select Customer & Search Products */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      الزبون صاحب الإرجاع:
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                    >
                      <option value="cash">عميل نقدي عام (Passager)</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.currentDebt > 0 ? `(عليه دين: ${formatCurrency(c.currentDebt)})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      إضافة سلعة للإرجاع (بحث بالاسم أو الباركود):
                    </label>
                    <div className="relative">
                      <Barcode className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                      <input
                        type="text"
                        value={directProductSearch}
                        onChange={e => setDirectProductSearch(e.target.value)}
                        placeholder="ابحث عن سلعة لإضافتها..."
                        className="w-full pl-3 pr-9 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    {/* Direct Product Dropdown */}
                    {directProductSearch.trim().length > 0 && (
                      <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 z-30">
                        {products
                          .filter(
                            p =>
                              p.name.toLowerCase().includes(directProductSearch.toLowerCase()) ||
                              (p.barcode && p.barcode.includes(directProductSearch)) ||
                              (p.sku && p.sku.toLowerCase().includes(directProductSearch.toLowerCase()))
                          )
                          .map(p => (
                            <div
                              key={p.id}
                              onClick={() => handleAddDirectProduct(p)}
                              className="p-2 hover:bg-rose-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <span className="font-bold text-slate-900">{p.name}</span>
                              <span className="font-mono-numbers font-black text-rose-600">
                                {formatCurrency(p.sellPrice)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Middle: Items List to Return */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-rose-600" />
                  قائمة السلع والكميات المسترجعة:
                </span>
                <span className="text-xs font-mono-numbers text-slate-500 font-bold">
                  الأصناف المحددة: {activeReturnItems.length} صنف
                </span>
              </div>

              {returnItems.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <RotateCcw className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-xs text-slate-600">
                    {returnMode === 'invoice'
                      ? 'يرجى اختيار فاتورة مبيعات من القائمة أعلاه لعرض السلع'
                      : 'ابحث عن السلعة بالاسم أو الكودبار لإضافتها هنا'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {returnItems.map((item, idx) => (
                    <div
                      key={item.productId}
                      className={`p-3 rounded-xl border transition-all ${
                        item.returnQuantity > 0
                          ? 'bg-rose-50/70 border-rose-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Product Info */}
                        <div className="flex-1 min-w-[200px]">
                          <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <span>{item.productName}</span>
                            {returnMode === 'invoice' && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono-numbers">
                                تم شراء: {item.maxQuantity}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            سعر الوحدة: {formatCurrency(item.unitPrice)}
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] font-bold text-slate-600">كمية الإرجاع:</label>
                          <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(idx, item.returnQuantity - 1)}
                              className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={item.maxQuantity}
                              value={item.returnQuantity}
                              onChange={e => handleQuantityChange(idx, parseInt(e.target.value) || 0)}
                              className="w-12 text-center text-xs font-black font-mono-numbers py-1 border-x border-slate-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(idx, item.returnQuantity + 1)}
                              className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Condition selector */}
                        <div className="flex items-center gap-1">
                          <select
                            value={item.condition}
                            onChange={e =>
                              handleConditionChange(idx, e.target.value as 'good' | 'damaged' | 'defective')
                            }
                            className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
                          >
                            <option value="good">سليم (يعاد للمخزون)</option>
                            <option value="damaged">تالف / مكسور</option>
                            <option value="defective">عيب مصنعي</option>
                          </select>

                          {returnMode === 'direct' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Item Total Refund */}
                        <div className="text-left min-w-[80px]">
                          <span className="text-[10px] text-slate-400 block">المسترد:</span>
                          <span className="text-sm font-black text-rose-600 font-mono-numbers">
                            {formatCurrency(item.returnQuantity * item.unitPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Refund Method & Inventory Settings */}
              {activeReturnItems.length > 0 && (
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-3 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Refund Method */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        طريقة إرجاع واسترداد المبلغ للزبون:
                      </label>
                      <select
                        value={refundMethod}
                        onChange={e =>
                          setRefundMethod(e.target.value as 'cash' | 'deduct_debt' | 'credit_note')
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="cash">💵 إرجاع نقدي كاش من الصندوق (Espèce)</option>
                        <option value="deduct_debt">💳 خصم من ديون الزبون الحالي (Déduction Crédit)</option>
                        <option value="credit_note">🏷️ رصيد دائن / وصل شراء لاحق (Avoir Client)</option>
                      </select>
                    </div>

                    {/* Restock Toggle */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">تحديث المخزون:</label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restockItems}
                          onChange={e => setRestockItems(e.target.checked)}
                          className="w-4 h-4 text-rose-600 rounded"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          إعادة الأصناف السليمة إلى كمية المخزون فوراً
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات وسبب الإرجاع:</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="مثال: الزبون غير المقاس، رغبة العميل، تم الفحص بحالة ممتازة..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold">إجمالي المبلغ المسترد:</span>
                <span className="text-2xl font-black text-rose-400 font-mono-numbers">
                  {formatCurrency(totalRefundAmount)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReturn}
                  disabled={activeReturnItems.length === 0 || isSubmitting}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الحفظ والتسجيل...' : 'تأكيد عملية الإرجاع وطباعة الوصل'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
