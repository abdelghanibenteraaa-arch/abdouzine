import React, { useState, useEffect } from 'react';
import { AlertTriangle, PlusCircle, ShoppingCart, X, Barcode, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface UnregisteredProductPromptModalProps {
  isOpen: boolean;
  unregisteredCode: string;
  onClose: () => void;
  onRegisterProduct: (code: string) => void;
  onSellAsFreeItem: (name: string, price: number, qty: number, cost?: number) => void;
}

export const UnregisteredProductPromptModal: React.FC<UnregisteredProductPromptModalProps> = ({
  isOpen,
  unregisteredCode,
  onClose,
  onRegisterProduct,
  onSellAsFreeItem,
}) => {
  const { t, language } = useApp();
  const [mode, setMode] = useState<'prompt' | 'free_entry'>('prompt');
  const [freeName, setFreeName] = useState('سلعة غير مسجلة');
  const [freePrice, setFreePrice] = useState('');
  const [freeCost, setFreeCost] = useState('');
  const [freeQty, setFreeQty] = useState('1');

  useEffect(() => {
    if (isOpen) {
      setMode('prompt');
      setFreeName(language === 'ar' ? 'سلعة حرة غير مسجلة' : 'Article libre non enregistré');
      setFreePrice('');
      setFreeCost('');
      setFreeQty('1');
    }
  }, [isOpen, language]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'F1' && mode === 'prompt') {
        e.preventDefault();
        onRegisterProduct(unregisteredCode);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, unregisteredCode, onRegisterProduct, onClose]);

  if (!isOpen) return null;

  const handleFreeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(freePrice) || 0;
    const qty = parseFloat(freeQty) || 1;
    const cost = parseFloat(freeCost) || 0;

    if (price <= 0) {
      alert(language === 'ar' ? 'يرجى إدخال سعر بيع صحيح' : 'Veuillez saisir un prix valide');
      return;
    }

    onSellAsFreeItem(freeName.trim() || 'سلعة غير مسجلة', price, qty, cost);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col my-auto text-slate-800 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">
                {t('unreg_title')}
              </h3>
              <p className="text-xs text-amber-100">
                {t('unreg_subtitle')}
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Barcode Display Badge */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-900">
              <Barcode className="w-6 h-6 shrink-0 text-amber-700" />
              <div>
                <span className="text-[11px] font-bold text-amber-800 block">
                  {t('unreg_codeLabel')}
                </span>
                <span className="font-mono text-base font-black tracking-wider text-slate-900 select-all">
                  {unregisteredCode || '---'}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-black bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full shrink-0">
              غير مسجل
            </span>
          </div>

          {mode === 'prompt' ? (
            <>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('unreg_explanation')}
              </p>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* 1. Primary Recommendation: Register as New Product */}
                <button
                  type="button"
                  onClick={() => {
                    onRegisterProduct(unregisteredCode);
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-black text-sm rounded-xl flex items-center justify-between shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                    <span className="text-right">
                      {t('unreg_btnRegisterNow')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-md text-emerald-100">
                    Enter / F1
                  </span>
                </button>

                {/* 2. Secondary: Free Sale without registration */}
                <button
                  type="button"
                  onClick={() => setMode('free_entry')}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-between border border-slate-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                    <span>{t('unreg_btnSellAsFree')}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">مباشر</span>
                </button>

                {/* 3. Cancel */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {t('unreg_btnCancel')} (Esc)
                </button>
              </div>
            </>
          ) : (
            /* Free Sale Form */
            <form onSubmit={handleFreeSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('unreg_freeItemName')}
                </label>
                <input
                  type="text"
                  value={freeName}
                  onChange={(e) => setFreeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('unreg_freeItemPrice')} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={freePrice}
                    onChange={(e) => setFreePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border-2 border-emerald-500 rounded-lg text-sm font-black text-emerald-700 font-mono-numbers focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('unreg_freeItemQty')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={freeQty}
                    onChange={(e) => setFreeQty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold font-mono-numbers focus:outline-none"
                    min="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  {t('unreg_freeItemCost')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={freeCost}
                  onChange={(e) => setFreeCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono-numbers focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('prompt')}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  {t('back')}
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>إضافة السلعة للسلة وإتمام البيع</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
