import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  X,
  Search,
  Plus,
  Trash2,
  Save,
  Printer,
  Calendar,
  User,
  Barcode,
  Package,
  CheckCircle2,
  DollarSign,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SaleItem, SaleInvoice, Product, Customer } from '../../types';
import { api } from '../../services/api';

interface AddSaleInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSaleInvoiceModal: React.FC<AddSaleInvoiceModalProps> = ({ isOpen, onClose }) => {
  const {
    products,
    customers,
    settings,
    sales,
    formatCurrency,
    formatDate,
    refreshData,
    addToast,
    setSelectedInvoice,
    currentUser,
    t,
    language
  } = useApp();

  // Next Invoice Number
  const nextInvNum = useMemo(() => {
    const year = new Date().getFullYear();
    const count = (sales?.length || 0) + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  }, [sales]);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvNum);
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'credit' | 'bank_transfer'>('cash');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(settings.enableTax ? settings.taxRate : 0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [cashierName, setCashierName] = useState(currentUser?.fullName || 'كاشير المبيعات');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & add products
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInvoiceNumber(nextInvNum);
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setSelectedCustomerId('walk-in');
      setPaymentType('cash');
      setItems([]);
      setGlobalDiscount(0);
      setTaxRate(settings.enableTax ? settings.taxRate : 0);
      setPaidAmount(0);
      setNotes('');
      setCashierName(currentUser?.fullName || (language === 'ar' ? 'مسؤول المبيعات' : 'Responsable Ventes'));
      setProductSearch('');
      setShowProductDropdown(false);
    }
  }, [isOpen, nextInvNum, settings, currentUser, language]);

  // Selected customer object
  const selectedCustomer: Customer | undefined = useMemo(() => {
    if (selectedCustomerId === 'walk-in') return undefined;
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Filter products for dropdown
  const matchedProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        (p.nameFr && p.nameFr.toLowerCase().includes(q)) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [products, productSearch]);

  // Add product to items list
  const handleAddProduct = (prod: Product) => {
    const existingIndex = items.findIndex(item => item.productId === prod.id && !item.isPack);
    if (existingIndex >= 0) {
      // Increase qty
      const updated = [...items];
      const newQty = updated[existingIndex].quantity + 1;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].total = Number((newQty * updated[existingIndex].unitPrice - updated[existingIndex].discount).toFixed(2));
      updated[existingIndex].profit = Number(((updated[existingIndex].unitPrice - prod.costPrice) * newQty).toFixed(2));
      setItems(updated);
    } else {
      // Add new row
      const newItem: SaleItem = {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        barcode: prod.barcode || prod.sku,
        quantity: 1,
        unitPrice: prod.sellPrice,
        costPrice: prod.costPrice,
        discount: 0,
        total: prod.sellPrice,
        profit: Number((prod.sellPrice - prod.costPrice).toFixed(2)),
      };
      setItems(prev => [...prev, newItem]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  // Update item quantity
  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...items];
    const item = updated[index];
    item.quantity = newQty;
    item.total = Number((newQty * item.unitPrice - item.discount).toFixed(2));
    item.profit = Number(((item.unitPrice - item.costPrice) * newQty).toFixed(2));
    setItems(updated);
  };

  // Update item unit price
  const handleUpdatePrice = (index: number, newPrice: number) => {
    const updated = [...items];
    const item = updated[index];
    item.unitPrice = Math.max(0, newPrice);
    item.total = Number((item.quantity * item.unitPrice - item.discount).toFixed(2));
    item.profit = Number(((item.unitPrice - item.costPrice) * item.quantity).toFixed(2));
    setItems(updated);
  };

  // Update item discount
  const handleUpdateDiscount = (index: number, newDiscount: number) => {
    const updated = [...items];
    const item = updated[index];
    item.discount = Math.max(0, newDiscount);
    item.total = Math.max(0, Number((item.quantity * item.unitPrice - item.discount).toFixed(2)));
    setItems(updated);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    if (!taxRate || taxRate <= 0) return 0;
    return Number(((subtotal * taxRate) / 100).toFixed(2));
  }, [subtotal, taxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, Number((subtotal + taxAmount - globalDiscount).toFixed(2)));
  }, [subtotal, taxAmount, globalDiscount]);

  // Keep paidAmount in sync when cash
  useEffect(() => {
    if (paymentType === 'cash') {
      setPaidAmount(grandTotal);
    } else if (paymentType === 'credit') {
      setPaidAmount(0);
    }
  }, [paymentType, grandTotal]);

  const remainingDebt = useMemo(() => {
    return Math.max(0, Number((grandTotal - paidAmount).toFixed(2)));
  }, [grandTotal, paidAmount]);

  if (!isOpen) return null;

  // Save invoice
  const handleSaveInvoice = async (printImmediately = false) => {
    if (items.length === 0) {
      addToast(language === 'ar' ? 'يرجى إضافة صنف واحد على الأقل للفاتورة' : 'Veuillez ajouter au moins un article', 'warning');
      return;
    }

    if (paymentType === 'credit' && selectedCustomerId === 'walk-in') {
      addToast(language === 'ar' ? 'لا يمكن البيع بالدين لزبون عادي. يرجى اختيار عميل مسجل.' : 'Le crédit nécessite un client enregistré', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const custName = selectedCustomer ? selectedCustomer.name : (language === 'ar' ? 'زبون عادي' : 'Client Comptoir');
      const custPhone = selectedCustomer ? selectedCustomer.phone : '';

      const payload = {
        date: invoiceDate,
        customerId: selectedCustomerId,
        customerName: custName,
        customerPhone: custPhone,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount: globalDiscount,
        totalAmount: grandTotal,
        paidAmount,
        remainingAmount: remainingDebt,
        paymentType,
        status: 'completed' as const,
        notes: notes.trim() || (language === 'ar' ? 'فاتورة مبيعات مباشرة' : 'Facture de vente directe'),
        cashierName: cashierName.trim() || 'كاشير المبيعات',
      };

      const createdInvoice = await api.createSale(payload);
      addToast(t('addInv_successToast') + ` [${createdInvoice.invoiceNumber}]`, 'success');

      await refreshData();

      if (printImmediately) {
        setSelectedInvoice({ type: 'sale', data: createdInvoice });
      }

      onClose();
    } catch (err: any) {
      addToast(err.message || 'فشل في حفظ فاتورة المبيعات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col my-auto text-slate-800 animate-in zoom-in-95 duration-150 max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ba2638] via-[#8c1827] to-[#1e2023] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">
                {t('addInv_modalTitle')}
              </h3>
              <p className="text-xs text-rose-100">
                {t('addInv_modalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-right">
          
          {/* Top Section: Invoice Meta & Customer Selection */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Invoice Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {t('addInv_invNumber')}
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {t('addInv_invDate')}
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="w-full pr-8 pl-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Customer Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {t('addInv_customerSelect')}
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="walk-in">{t('addInv_walkInCustomerOption')}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''} {c.currentDebt > 0 ? `[دين: ${formatCurrency(c.currentDebt)}]` : ''}
                  </option>
                ))}
              </select>
              {selectedCustomer && selectedCustomer.currentDebt > 0 && (
                <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                  {t('addInv_customerDebtBadge')} {formatCurrency(selectedCustomer.currentDebt)}
                </span>
              )}
            </div>
          </div>

          {/* Add Items Product Search Bar */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('addInv_addItemsTitle')}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder={t('addInv_searchProductPlaceholder')}
                  className="w-full pr-9 pl-3 py-2 bg-white border-2 border-slate-300 focus:border-rose-600 rounded-xl text-xs font-bold focus:outline-none shadow-xs"
                />
              </div>
            </div>

            {/* Live Autocomplete Dropdown */}
            {showProductDropdown && matchedProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-300 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {matchedProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddProduct(prod)}
                    className="p-2.5 hover:bg-rose-50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{prod.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          كود: {prod.barcode || prod.sku} | المخزون: {prod.currentStock} {prod.unit}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-black text-xs text-emerald-700 font-mono-numbers">
                        {formatCurrency(prod.sellPrice)}
                      </div>
                      <span className="text-[10px] text-rose-600 font-bold">
                        + إضافة للفاتورة
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Table of Invoice Items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2.5">{t('addInv_colItemName')}</th>
                    <th className="p-2.5">{t('addInv_colBarcode')}</th>
                    <th className="p-2.5 text-center w-24">{t('addInv_colQty')}</th>
                    <th className="p-2.5 text-center w-28">{t('addInv_colPrice')}</th>
                    <th className="p-2.5 text-center w-20">{t('addInv_colDiscount')}</th>
                    <th className="p-2.5 font-bold">{t('addInv_colTotal')}</th>
                    <th className="p-2.5 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        <Layers className="w-8 h-8 mx-auto mb-1 opacity-30 text-slate-400" />
                        <span>{t('addInv_noItemsAdded')}</span>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{item.productName}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">{item.barcode || item.sku}</td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, item.quantity - 1)}
                              className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => handleUpdateQty(idx, parseFloat(e.target.value) || 1)}
                              className="w-12 text-center py-0.5 border border-slate-300 rounded font-mono font-bold text-xs"
                              min="0.1"
                              step="any"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, item.quantity + 1)}
                              className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={e => handleUpdatePrice(idx, parseFloat(e.target.value) || 0)}
                            className="w-20 text-center py-0.5 border border-slate-300 rounded font-mono font-bold text-xs"
                            min="0"
                            step="any"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={e => handleUpdateDiscount(idx, parseFloat(e.target.value) || 0)}
                            className="w-16 text-center py-0.5 border border-slate-300 rounded font-mono text-xs text-rose-600"
                            min="0"
                            step="any"
                          />
                        </td>
                        <td className="p-2.5 font-bold font-mono-numbers text-slate-900">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Summary & Payment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            {/* Payment terms & cashier */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700">{t('addInv_paymentMethodLabel')}</h4>
              
              {/* Payment Type selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('cash')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentType === 'cash'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>نقدي (Espèces)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('credit')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentType === 'credit'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>آجل / ذمة (Crédit)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentType === 'card'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>بطاقة بنكية / بريدي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('bank_transfer')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    paymentType === 'bank_transfer'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>تحويل بنكي</span>
                </button>
              </div>

              {/* Paid & Remaining */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    {t('addInv_paidAmountLabel')}
                  </label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:outline-none"
                    min="0"
                    step="any"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    {t('addInv_remainingDebtLabel')}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formatCurrency(remainingDebt)}
                    className="w-full px-2.5 py-1.5 bg-slate-200 border border-slate-300 rounded-lg text-xs font-mono font-bold text-rose-700"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  {t('addInv_notesLabel')}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ملاحظات أو شروط خاصة بالفاتورة..."
                  className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Financial Summary Calculation */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div className="space-y-1.5 divide-y divide-slate-100 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold">{t('addInv_subtotalLabel')}</span>
                  <span className="font-mono font-bold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold">{t('addInv_taxTvaLabel')}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={taxRate}
                      onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-12 text-center py-0.5 border border-slate-300 rounded text-xs font-mono"
                      min="0"
                      max="100"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">({formatCurrency(taxAmount)})</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold">{t('addInv_discountLabel')}</span>
                  <input
                    type="number"
                    value={globalDiscount}
                    onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                    className="w-20 text-center py-0.5 border border-slate-300 rounded text-xs font-mono text-rose-600"
                    min="0"
                    step="any"
                  />
                </div>
              </div>

              {/* Net Grand Total Highlight */}
              <div className="bg-gradient-to-r from-slate-900 to-neutral-900 text-white p-3 rounded-xl flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] text-slate-300 block">{t('addInv_netTotalLabel')}</span>
                  <span className="text-xl font-black font-mono-numbers text-emerald-400">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
                <div className="text-left text-[11px] text-slate-300">
                  <span>{items.length} أصناف</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            {t('cancel')}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting || items.length === 0}
              onClick={() => handleSaveInvoice(false)}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>{t('addInv_btnSaveOnly')}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting || items.length === 0}
              onClick={() => handleSaveInvoice(true)}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>{t('addInv_btnSaveAndPrint')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
