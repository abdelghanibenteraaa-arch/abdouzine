import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  QrCode,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  WifiOff,
  Zap,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        addToast('تم بدء تثبيت التطبيق على جهازك بنجاح!', 'success');
        setDeferredPrompt(null);
        onClose();
      }
    } else {
      addToast('يرجى فتح الموقع في متصفح Chrome على هاتفك واختيار "تثبيت التطبيق"', 'info');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl || window.location.href);
    setIsCopied(true);
    addToast('تم نسخ رابط التطبيق للحافظة!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`رابط تحميل وتثبيت تطبيق عبدو زين للمبيعات والمخازن على هاتف الأندرويد:%0A${appUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(appUrl || window.location.href)}`;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col my-auto text-slate-800 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ba2638] via-[#8c1827] to-[#1e2023] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">تطبيق هاتف أندرويد (Android App)</h3>
              <p className="text-xs text-rose-100">تحميل وتثبيت برنامج عبدو زين على الهاتف مباشرة</p>
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
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto text-right">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-4 rounded-xl border border-rose-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-xs border border-rose-100 shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code لتحميل التطبيق على الهاتف"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <div className="flex-1 text-center sm:text-right space-y-2">
              <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>جاهز للتثبيت الفوري (WebAPK / PWA)</span>
              </div>
              <h4 className="font-black text-sm text-slate-900">
                امسح الكود بكاميرا هاتفك أو افتح الرابط في Chrome
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                يعمل البرنامج كتطبيق هاتف أندرويد مستقل بشاشة كاملة، مع دعم مسح الباركود بالكاميرا، والعمل بدون إنترنت.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer animate-pulse"
              >
                <Download className="w-5 h-5" />
                <span>تثبيت التطبيق الآن على هذا الجهاز (Installer)</span>
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{isCopied ? 'تم نسخ الرابط!' : 'نسخ رابط التطبيق'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>إرسال الرابط للواتساب</span>
              </button>
            </div>
          </div>

          {/* Features pills */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <Camera className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="font-bold text-[11px] text-slate-800">كاميرا الهاتف</div>
              <div className="text-[10px] text-slate-500">لمسح الباركود فوراً</div>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <WifiOff className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <div className="font-bold text-[11px] text-slate-800">أوفلاين بدون نت</div>
              <div className="text-[10px] text-slate-500">حفظ محلي في الهاتف</div>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <Zap className="w-4 h-4 text-rose-600 mx-auto mb-1" />
              <div className="font-bold text-[11px] text-slate-800">خفيف وسريع</div>
              <div className="text-[10px] text-slate-500">حجم لا يتعدى 2MB</div>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
            <h5 className="font-bold text-xs text-slate-800">طريقة التثبيت على أي هاتف أندرويد (خلال 5 ثوانٍ):</h5>
            <ol className="space-y-2 text-xs text-slate-600 pr-4 list-decimal">
              <li>
                افتح الرابط في متصفح <strong>Google Chrome</strong> على هاتفك الأندرويد.
              </li>
              <li>
                اضغط على زر القائمة <strong>(⋮ الثلاث نقاط)</strong> أعلى زاوية المتصفح.
              </li>
              <li>
                اضغط على <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong> (Installer l'application).
              </li>
              <li className="text-emerald-700 font-bold">
                مبروك! سيظهر تطبيق عبدو زين في قائمة تطبيقات هاتفك كبرنامج أصلي تماماً.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
