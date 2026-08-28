import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Building2,
  Package,
  Trash2,
  Printer,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier, SupplierReturn, SupplierReturnItem } from '../../types';
import { api } from '../../services/api';

interface SupplierReturnsProps {
  preselectedSupplier?: Supplier | null;
  onOpenStatement?: (supplier: Supplier) => void;
}

export const SupplierReturns: React.FC<SupplierReturnsProps> = ({
  preselectedSupplier,
  onOpenStatement
}) => {
  const {
    suppliers,
    products,
    formatCurrency,
    formatDate,
    refreshData,
    addToast
  } = useApp();

  const [isCreatingReturn, setIsCreatingReturn] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(preselectedSupplier?.id || (suppliers[0]?.id || ''));
  const [refundMethod, setRefundMethod] = useState<'deduct_debt' | 'cash'>('deduct_debt');
  const [returnNotes, setReturnNotes] = useState('');
  
  // Return line items
  const [returnItems, setReturnItems] = useState<SupplierReturnItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemCost, setItemCost] = useState<number>(0);
  const [itemReason, setItemReason] = useState('بضاعة تالفة أو بها عيب مصنعي');

  // Search in past returns
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVoucherModal, setActiveVoucherModal] = useState<SupplierReturn | null>(null);

  // Local storage cache for supplier returns
  const [returnsList, setReturnsList] = useState<SupplierReturn[]>(() => {
    try {
      const saved = localStorage.getItem('zin_supplier_returns');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default seed returns
    return [
      {
        id: 'ret-101',
        returnNumber: 'BR-2026-001',
        supplierId: 'sup-1',
        supplierName: 'شركة سيفيتال للصناعات الغذائية (Cevital)',
        date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        items: [
          {
            productId: 'prod-4',
            productName: 'زيت المائدة عافية / إلـيو 5 لتر (Elio 5L)',
            quantity: 5,
            unitCost: 600,
            total: 3000,
            reason: 'تلف في أغطية العبوات أثناء النقل'
          }
        ],
        totalRefund: 3000,
        refundMethod: 'deduct_debt',
        notes: 'تم الخصم المباشر من الفاتورة الآجلة',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ];
  });

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setItemCost(prod.costPrice || 0);
    }
  };

  const handleAddLineItem = () => {
    if (!selectedProductId || itemQty <= 0) {
      addToast('يرجى اختيار السلعة وتحديد كمية صالحة', 'error');
      return;
    }
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const existingIndex = returnItems.findIndex(i => i.productId === selectedProductId);
    if (existingIndex >= 0) {
      const updated = [...returnItems];
      updated[existingIndex].quantity += Number(itemQty);
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unitCost;
      setReturnItems(updated);
    } else {
      setReturnItems([
        ...returnItems,
        {
          productId: prod.id,
          productName: prod.name,
          quantity: Number(itemQty),
          unitCost: Number(itemCost),
          total: Number(itemQty) * Number(itemCost),
          reason: itemReason
        }
      ]);
    }

    // Reset inputs
    setSelectedProductId('');
    setItemQty(1);
    setItemCost(0);
  };

  const handleRemoveLineItem = (index: number) => {
    setReturnItems(returnItems.filter((_, i) => i !== index));
  };

  const totalReturnAmount = returnItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) {
      addToast('يرجى اختيار المورد', 'error');
      return;
    }
    if (returnItems.length === 0) {
      addToast('يرجى إضافة سلعة واحدة على الأقل في وصل الإرجاع', 'error');
      return;
    }

    const returnNumber = `BR-${new Date().getFullYear()}-${String(returnsList.length + 1).padStart(3, '0')}`;
    const newReturn: SupplierReturn = {
      id: 'ret-' + Date.now(),
      returnNumber,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      date: new Date().toISOString().split('T')[0],
      items: returnItems,
      totalRefund: totalReturnAmount,
      refundMethod,
      notes: returnNotes,
      createdAt: new Date().toISOString()
    };

    // 1. If deduct_debt, reduce supplier's current debt
    if (refundMethod === 'deduct_debt') {
      const currentDebt = (selectedSupplier.currentBalance !== undefined ? selectedSupplier.currentBalance : selectedSupplier.currentDebt) || 0;
      const newDebt = Math.max(0, currentDebt - totalReturnAmount);
      try {
        await api.updateSupplier(selectedSupplier.id, {
          currentDebt: newDebt,
          currentBalance: newDebt
        });
      } catch (err) {
        console.error('Failed to update supplier debt:', err);
      }
    }

    // 2. Adjust inventory for returned items (deduct stock returned to supplier)
    for (const item of returnItems) {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const newStock = Math.max(0, prod.currentStock - item.quantity);
        try {
          await api.adjustStock(prod.id, newStock, `إرجاع للمورد ${selectedSupplier.name} (وصل ${returnNumber})`);
        } catch (err) {
          console.error('Failed to adjust stock on return:', err);
        }
      }
    }

    const updatedList = [newReturn, ...returnsList];
    setReturnsList(updatedList);
    try {
      localStorage.setItem('zin_supplier_returns', JSON.stringify(updatedList));
    } catch {}

    addToast(`تم تسجيل وصل الإرجاع ${returnNumber} بنجاح بقيمة ${formatCurrency(totalReturnAmount)}`, 'success');
    setActiveVoucherModal(newReturn);
    setIsCreatingReturn(false);
    setReturnItems([]);
    setReturnNotes('');
    await refreshData();
  };

  const filteredReturns = returnsList.filter(r =>
    r.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalAllReturnsSum = returnsList.reduce((sum, r) => sum + r.totalRefund, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">إجمالي وصولات الإرجاع</span>
            <div className="text-xl font-bold text-slate-800 font-mono-numbers mt-0.5">
              {returnsList.length} وصل إرجاع
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">إجمالي قيمة السلع المرجعة</span>
            <div className="text-xl font-bold text-red-600 font-mono-numbers mt-0.5">
              {formatCurrency(totalAllReturnsSum)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">إجراء سريع</span>
            <button
              onClick={() => setIsCreatingReturn(true)}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل إرجاع جديد</span>
            </button>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* New Return Form Card (collapsible) */}
      {isCreatingReturn && (
        <div className="bg-white rounded-xl border-2 border-red-500/30 p-5 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">تسجيل وصل إرجاع بضاعة إلى المورد (Bon de Retour)</h3>
                <p className="text-[11px] text-slate-500">إرجاع السلع التالفة أو المنتهية الصلاحية وخصمها من ديون المورد أو استردادها نقداً</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreatingReturn(false)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
            >
              إلغاء
            </button>
          </div>

          <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-slate-700 font-bold mb-1">المورد المستلم للبضاعة *</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.company || 'مؤسسة'}) - الرصيد: {formatCurrency(s.currentBalance || s.currentDebt || 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">طريقة التسوية والتعويض *</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="deduct_debt">خصم فوري من ديون المورد (تنقيص الكريدي)</option>
                  <option value="cash">استرداد المبلغ نقداً إلى الصندوق</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات / سبب الإرجاع العام</label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  placeholder="رقم الفاتورة الأصلية أو شروط الاسترجاع..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Line items adder */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Package className="w-4 h-4 text-red-600" />
                <span>إضافة السلع والمنتجات المرجعة:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">السلعة من المخزون *</label>
                  <select
                    value={selectedProductId}
                    onChange={e => handleProductSelect(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">-- اختر السلعة المراد إرجاعها --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (المتوفر: {p.currentStock} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">الكمية المرجعة</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={e => setItemQty(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">سعر التكلفة (د.ج)</label>
                  <input
                    type="number"
                    min="0"
                    value={itemCost}
                    onChange={e => setItemCost(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono-numbers"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="w-full p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    + إضافة للوصل
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">سبب إرجاع هذه السلعة</label>
                <select
                  value={itemReason}
                  onChange={e => setItemReason(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                >
                  <option value="بضاعة تالفة أو بها عيب مصنعي">بضاعة تالفة أو بها عيب مصنعي</option>
                  <option value="انتهاء أو اقتراب تاريخ الصلاحية">انتهاء أو اقتراب تاريخ الصلاحية</option>
                  <option value="بضاعة غير مطابقة للمواصفات أو الطلب">بضاعة غير مطابقة للمواصفات أو الطلب</option>
                  <option value="فائض في المخزون / ركود في المبيعات">فائض في المخزون / ركود في المبيعات</option>
                  <option value="استبدال بموديل أحدث">استبدال بموديل أحدث</option>
                </select>
              </div>

              {/* Items Table */}
              {returnItems.length > 0 && (
                <div className="mt-3 bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">السلعة</th>
                        <th className="p-2.5 text-center">الكمية</th>
                        <th className="p-2.5 text-center">سعر التكلفة</th>
                        <th className="p-2.5 text-center">الإجمالي</th>
                        <th className="p-2.5">السبب</th>
                        <th className="p-2.5 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {returnItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">{item.productName}</td>
                          <td className="p-2.5 text-center font-mono-numbers">{item.quantity}</td>
                          <td className="p-2.5 text-center font-mono-numbers">{formatCurrency(item.unitCost)}</td>
                          <td className="p-2.5 text-center font-mono-numbers font-bold text-red-600">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="p-2.5 text-slate-500 text-[11px]">{item.reason}</td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Total and submit */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800">إجمالي قيمة الوصل:</span>
                <span className="text-base font-extrabold text-red-600 font-mono-numbers">
                  {formatCurrency(totalReturnAmount)}
                </span>
                {refundMethod === 'deduct_debt' && (
                  <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200 font-semibold">
                    سيتم خصمها من رصيد دين المورد تلقائياً
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingReturn(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد وطباعة وصل الإرجاع</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Search in returns */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الوصل، اسم المورد، أو اسم السلعة المرجعة..."
            className="w-full pl-3 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Past returns table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>سجل وصولات إرجاع السلع للموردين (Bons de Retour)</span>
          <span className="text-slate-400 font-normal">عدد الوصولات: {filteredReturns.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">رقم الوصل</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المورد</th>
                <th className="p-3">السلع المرجعة</th>
                <th className="p-3 text-center">إجمالي التعويض</th>
                <th className="p-3 text-center">طريقة التعويض</th>
                <th className="p-3 text-center">معاينة وطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد وصولات إرجاع مسجلة
                  </td>
                </tr>
              ) : (
                filteredReturns.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3 font-bold font-mono-numbers text-red-700">
                      {ret.returnNumber}
                    </td>
                    <td className="p-3 font-mono-numbers text-slate-600">
                      {formatDate(ret.date)}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {ret.supplierName}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div className="space-y-0.5">
                        {ret.items.map((it, idx) => (
                          <div key={idx} className="text-[11px]">
                            • {it.productName} <span className="font-mono-numbers font-bold text-slate-800">({it.quantity} قطعة)</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold font-mono-numbers text-red-600">
                      {formatCurrency(ret.totalRefund)}
                    </td>
                    <td className="p-3 text-center">
                      {ret.refundMethod === 'deduct_debt' ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          خصم من دين المورد
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          استرجاع نقدي للصندوق
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setActiveVoucherModal(ret)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>معاينة وطباعة</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Voucher Printable Modal */}
      {activeVoucherModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                وصل إرجاع سلع لمورد (Bon de Retour)
              </h3>
              <button
                onClick={() => setActiveVoucherModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-4 border border-slate-200 rounded-xl bg-slate-50 text-xs">
              {/* Header */}
              <div className="text-center pb-3 border-b border-slate-300">
                <h2 className="text-lg font-extrabold text-slate-900">مؤسسة عبدو زين للتجارة والتوزيع</h2>
                <p className="text-slate-500 text-[11px]">وصل إرجاع بضاعة رسمية للمورد - BON DE RETOUR</p>
                <div className="mt-2 inline-block px-3 py-1 bg-red-100 text-red-800 rounded font-mono-numbers font-black text-sm">
                  {activeVoucherModal.returnNumber}
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-2 text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold">المورد:</span>
                  <strong className="block text-slate-900">{activeVoucherModal.supplierName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">تاريخ الإرجاع:</span>
                  <strong className="block font-mono-numbers">{formatDate(activeVoucherModal.date)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">طريقة التعويض:</span>
                  <strong className="block text-blue-700">
                    {activeVoucherModal.refundMethod === 'deduct_debt' ? 'خصم من دين المورد (تنقيص الكريدي)' : 'استرجاع نقدي للصندوق'}
                  </strong>
                </div>
                {activeVoucherModal.notes && (
                  <div className="col-span-2">
                    <span className="text-slate-400 font-semibold">الملاحظات:</span>
                    <p className="text-slate-600">{activeVoucherModal.notes}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">السلعة</th>
                      <th className="p-2 text-center">الكمية</th>
                      <th className="p-2 text-center">سعر التكلفة</th>
                      <th className="p-2 text-center">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeVoucherModal.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-800">
                          {it.productName}
                          {it.reason && <div className="text-[10px] text-slate-400">{it.reason}</div>}
                        </td>
                        <td className="p-2 text-center font-mono-numbers">{it.quantity}</td>
                        <td className="p-2 text-center font-mono-numbers">{formatCurrency(it.unitCost)}</td>
                        <td className="p-2 text-center font-mono-numbers font-bold text-red-600">{formatCurrency(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td colSpan={3} className="p-2 text-left">إجمالي التعويض المسترجع:</td>
                      <td className="p-2 text-center text-red-600 font-mono-numbers text-sm">
                        {formatCurrency(activeVoucherModal.totalRefund)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-center text-slate-600">
                <div className="border-t border-slate-300 pt-1">
                  <span>توقيع وخاتم المؤسسة</span>
                </div>
                <div className="border-t border-slate-300 pt-1">
                  <span>توقيع واستلام المورد</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الوصل</span>
              </button>
              <button
                onClick={() => setActiveVoucherModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
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
