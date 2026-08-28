import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  Check,
  Package,
  Plus,
  Minus,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const StockAdjustmentModal: React.FC = () => {
  const { adjustStockProduct, setAdjustStockProduct, refreshData, addToast } = useApp();

  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract' | 'damage'>('set');
  const [amount, setAmount] = useState<number>(adjustStockProduct?.currentStock || 0);
  const [reason, setReason] = useState<string>('جرد دوري للمستودع');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!adjustStockProduct) return null;

  const currentStock = adjustStockProduct.currentStock;

  let calculatedNewStock = currentStock;
  if (adjustmentType === 'set') {
    calculatedNewStock = amount;
  } else if (adjustmentType === 'add') {
    calculatedNewStock = currentStock + amount;
  } else if (adjustmentType === 'subtract' || adjustmentType === 'damage') {
    calculatedNewStock = Math.max(0, currentStock - amount);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.adjustStock(
        adjustStockProduct.id,
        calculatedNewStock,
        reason || 'تسوية مخزنية يدوية'
      );

      addToast(`تم تعديل مخزون "${adjustStockProduct.name}" إلى ${calculatedNewStock} ${adjustStockProduct.unit} بنجاح!`, 'success');
      await refreshData();
      setAdjustStockProduct(null);
    } catch (err: any) {
      addToast(err.message || 'فشل في تسوية المخزون', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">تسوية جردية للمخزون</h3>
              <p className="text-[11px] text-slate-500 font-semibold">{adjustStockProduct.name}</p>
            </div>
          </div>
          <button
            onClick={() => setAdjustStockProduct(null)}
            className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-semibold">الرصيد المقيد حالياً في النظام:</span>
            <strong className="text-slate-900 font-mono-numbers text-sm">
              {currentStock} {adjustStockProduct.unit}
            </strong>
          </div>

          {/* Action Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع العملية:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('set');
                  setAmount(currentStock);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  adjustmentType === 'set'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                تعيين جرد فعلي مباشر
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('add');
                  setAmount(1);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  adjustmentType === 'add'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                إضافة كمية (+)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('subtract');
                  setAmount(1);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  adjustmentType === 'subtract'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                خصم كمية عجز (-)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('damage');
                  setAmount(1);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  adjustmentType === 'damage'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                إتلاف بضاعة تالفة (-)
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {adjustmentType === 'set' ? 'الكمية الفعلية الموجودة على الرف:' : 'عدد القطع المراد تسويتها:'}
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono-numbers font-bold text-slate-900 focus:outline-none"
              required
            />
          </div>

          {/* New Stock Preview */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs text-emerald-900">
            <span className="font-semibold">الرصيد الجديد بعد التسوية:</span>
            <strong className="font-mono-numbers text-base font-black text-emerald-700">
              {calculatedNewStock} {adjustStockProduct.unit}
            </strong>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">سبب التسوية / البيان</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="مثال: تصحيح خطأ إدخال، كسر أثناء النقل، هدية ترويجية..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAdjustStockProduct(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الاعتماد...' : 'اعتماد وتحديث المخزن'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
