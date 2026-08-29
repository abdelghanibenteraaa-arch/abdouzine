import React, { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  WifiOff,
  HardDrive,
  Laptop,
  Smartphone,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  FileDown,
  Globe,
  QrCode,
  Share2,
  Check,
  ArrowDownCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OfflineDownloadCenter: React.FC = () => {
  const { addToast, safeExitAndBackup, dbStats, products, customers, sales, setActiveTab } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGeneratingApp, setIsGeneratingApp] = useState<boolean>(false);
  const [isGeneratingApk, setIsGeneratingApk] = useState<boolean>(false);
  const [activeTabSub, setActiveTabSub] = useState<'android' | 'desktop' | 'standalone'>('android');

  // Catch PWA beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        addToast('تم بدء تثبيت تطبيق عبدو زين على جهازك بنجاح!', 'success');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions
      addToast('لتثبيت التطبيق على هاتفك: اضغط على زر الخيارات (⋮) أعلى المتصفح ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"', 'info');
    }
  };

  const handleCopyAppUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    addToast('تم نسخ رابط التطبيق الكامل لفتحه بالهاتف', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Download Standalone Android WebApp Package (.html)
  const handleDownloadAndroidPackage = () => {
    setIsGeneratingApk(true);
    try {
      const androidPackage = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#ba2638">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>عبدو زين - تطبيق الأندرويد أوفلاين</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 16px; min-height: 100vh; }
    .header { background: #ba2638; color: white; padding: 18px; border-radius: 16px; text-align: center; margin-bottom: 16px; box-shadow: 0 10px 15px -3px rgba(186, 38, 56, 0.3); }
    .header h1 { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
    .badge { display: inline-block; background: #10b981; color: #022c22; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 16px; margin-bottom: 14px; }
    .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
    .stat-box { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: center; }
    .stat-num { font-size: 18px; font-weight: bold; color: #38bdf8; }
    .stat-lbl { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .btn { display: block; width: 100%; padding: 14px; background: #ba2638; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: bold; text-align: center; text-decoration: none; cursor: pointer; }
    .btn-green { background: #10b981; color: #022c22; margin-top: 8px; }
    .table-container { overflow-x: auto; margin-top: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: right; }
    th, td { padding: 10px; border-bottom: 1px solid #334155; }
    th { background: #0f172a; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📱 تطبيق عبدو زين للأندرويد</h1>
    <p style="font-size: 12px; opacity: 0.9;">النسخة المستقلة أوفلاين • 100% بدون إنترنت</p>
    <div style="margin-top: 8px;"><span class="badge">جاهز للعمل على الهاتف</span></div>
  </div>

  <div class="stat-row">
    <div class="stat-box">
      <div class="stat-num">${products.length}</div>
      <div class="stat-lbl">البضائع</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${customers.length}</div>
      <div class="stat-lbl">الزبائن</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${sales.length}</div>
      <div class="stat-lbl">المبيعات</div>
    </div>
  </div>

  <div class="card">
    <h3 style="font-size: 15px; margin-bottom: 10px; color: #f1f5f9;">قائمة البضائع والأسعار بالدينار</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>السلعة</th>
            <th>الباركود</th>
            <th>السعر</th>
            <th>المخزون</th>
          </tr>
        </thead>
        <tbody>
          ${products.slice(0, 100).map(p => `
            <tr>
              <td><strong>${p.name}</strong></td>
              <td style="font-family: monospace; font-size: 11px;">${p.barcode || p.sku}</td>
              <td style="color: #38bdf8; font-weight: bold;">${p.sellPrice.toLocaleString()} د.ج</td>
              <td>${p.currentStock} ${p.unit || 'قطعة'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <button class="btn" onclick="window.print()">طباعة قائمة السلع 🖨️</button>
</body>
</html>`;

      const blob = new Blob([androidPackage], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Abdou_Zin_Android_App_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('تم تحميل حزمة تطبيق الأندرويد المستقلة بنجاح!', 'success');
    } catch (e) {
      addToast('حدث خطأ أثناء تنزيل حزمة الأندرويد', 'error');
    } finally {
      setIsGeneratingApk(false);
    }
  };

  const appUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appUrl)}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Android & PWA Top Feature Banner */}
      <div className="bg-gradient-to-r from-[#1b1c1e] via-[#24171a] to-[#121315] border-2 border-red-600/50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>تطبيق أندرويد للهاتف (Android App)</span>
              </span>
              <span className="bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                <span>يعمل 100% بدون إنترنت (Offline)</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
              تحميل وتثبيت برنامج عبدو زين على هاتف الأندرويد والكمبيوتر
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              يمكنك الآن تحويل البرنامج إلى <strong>تطبيق أندرويد متكامل</strong> على هاتفك الذكي واستخدام <strong>كاميرا الهاتف كماسح باركود فوري</strong> في البيع والمخزن، بدون الحاجة لأي جهاز كمبيوتر أو اتصال بالإنترنت.
            </p>
          </div>

          {/* Quick Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full lg:w-72">
            <button
              id="btn-install-android-main"
              type="button"
              onClick={handleInstallPWA}
              className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-5 h-5" />
              <span>{isInstalled ? 'التطبيق مثبت على هاتفك ✓' : '📱 تثبيت تطبيق الأندرويد الآن'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadAndroidPackage}
              disabled={isGeneratingApk}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white border border-neutral-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>تحميل حزمة أندرويد المستقلة (.html)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tabs for Installation Types */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTabSub('android')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTabSub === 'android'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>هواتف الأندرويد (Android)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSub('desktop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTabSub === 'desktop'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>سطح المكتب (Windows / Mac)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSub('standalone')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTabSub === 'standalone'
              ? 'bg-neutral-800 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>حزم البيانات والنسخ الاحتياطي</span>
        </button>
      </div>

      {/* TAB 1: ANDROID PHONE INSTALLATION & QR CODE */}
      {activeTabSub === 'android' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          
          {/* Left / Main Card: Step-by-Step Android Installation */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-300 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">خطوات تثبيت التطبيق على هواتف الأندرويد</h3>
                  <p className="text-xs text-slate-500">يعمل على جميع هواتف Samsung, Xiaomi, Oppo, Realme, Infinix, إلخ</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                PWA / Android WebAPK
              </span>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <strong className="text-slate-900 text-sm block">فتح التطبيق في متصفح Chrome أو Edge على هاتفك:</strong>
                  <p>امسح رمز الاستجابة السريع (QR Code) الظاهر بجانبك بكاميرا هاتفك، أو اضغط زر نسخ الرابط وأرسله لهاتفك.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <strong className="text-slate-900 text-sm block">الضغط على زر خيارات المتصفح (النقاط الثلاث ⋮):</strong>
                  <p>في أعلى يمين أو يسار شاشة الهاتف، اضغط على زر القائمة في Google Chrome.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <strong className="text-emerald-950 text-sm block">اختيار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»:</strong>
                  <p>اختر <strong>«Install app»</strong> أو <strong>«Add to Home screen»</strong>. سيتم تثبيت أيقونة عبدو زين فوراً بجانب تطبيقاتك.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <strong className="text-slate-900 text-sm block">التشغيل واستخدام كاميرا الهاتف كسكانر:</strong>
                  <p>يمكنك فتح التطبيق في أي وقت بدون إنترنت، واستخدام زر <strong>«سكانر الكاميرا»</strong> في نقطة البيع لمسح أكواد السلع بسرعة البرق.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleInstallPWA}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>بدء التثبيت المباشر على الهاتف 📲</span>
              </button>

              <button
                type="button"
                onClick={handleCopyAppUrl}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-300 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'تم نسخ الرابط ✓' : 'نسخ رابط الهاتف'}</span>
              </button>
            </div>
          </div>

          {/* Right Card: QR Code for Phone Camera Scan */}
          <div className="lg:col-span-4 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-lg p-6 flex flex-col items-center justify-between text-center space-y-4">
            <div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">امسح الكود بكاميرا هاتفك</h4>
              <p className="text-[11px] text-slate-400 mt-1">لفتح التطبيق وتثبيته مباشرة على الأندرويد</p>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-xl">
              <img
                src={qrCodeUrl}
                alt="QR Code to Open and Install Android App"
                className="w-44 h-44 rounded-lg object-contain"
              />
            </div>

            <div className="w-full space-y-2">
              <div className="p-2.5 bg-slate-800/80 rounded-xl text-[10px] text-slate-300 border border-slate-700 leading-tight">
                📱 وجّه كاميرا هاتفك نحو هذا الرمز لفتح وتثبيت برنامج عبدو زين فورياً.
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('pos');
                  addToast('تم التوجه لنقطة البيع - اضغط على زر الكاميرا لمسح الباركود', 'info');
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>تجربة سكانر الكاميرا الآن</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DESKTOP (WINDOWS / MAC) */}
      {activeTabSub === 'desktop' && (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-6 space-y-5 animate-in fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">تثبيت التطبيق على جهاز الكمبيوتر (Windows 10 / 11 & Mac)</h3>
              <p className="text-xs text-slate-500">يعمل كبرنامج مكتبي أصلي مستقل مع اختصار على سطح المكتب</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-black text-sm text-blue-900">1. شريط العنوان</div>
              <p className="text-slate-600">انقر على أيقونة التثبيت (Install ⊕) بجانب شريط رابط المتصفح في الأعلى.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-black text-sm text-blue-900">2. زر التثبيت</div>
              <p className="text-slate-600">اضغط على زر «تثبيت» لإنشاء اختصار مباشر في قائمة ابدأ وشريط المهام.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-black text-sm text-blue-900">3. العمل أوفلاين</div>
              <p className="text-slate-600">افتح البرنامج من سطح المكتب في أي وقت بدون الحاجة لفتح المتصفح أو الاتصال بالشبكة.</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleInstallPWA}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت البرنامج على سطح مكتب الكمبيوتر 💻</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: STANDALONE PACKAGE & BACKUPS */}
      {activeTabSub === 'standalone' && (
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-6 space-y-5 animate-in fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">النسخة المستقلة والنسخ الاحتياطي المحلي</h3>
              <p className="text-xs text-slate-500">حفظ كافة بيانات المعاملات والمخازن في ملفات مستقلة يمكنك نقلها بفلاشة USB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Standalone HTML */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-emerald-600" />
                  <span>تنزيل تطبيق الحزمة المستقلة (.html)</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  ملف تنفيذي واحد مدمج به كامل بيانات السلع والأسعار والمخزون، يعمل بالنقر المزدوج على أي جهاز حاسوب أو هاتف.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadAndroidPackage}
                disabled={isGeneratingApk}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل ملف الحزمة المستقلة</span>
              </button>
            </div>

            {/* JSON Backup */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span>تصدير نسخة احتياطية كاملة (JSON)</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  تصدير قاعدة البيانات بالكامل لاسترجاعها عند تغيير الجهاز أو فرمتة الحاسوب.
                </p>
                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                  السجلات: {products.length} سلعة • {customers.length} زبون • {sales.length} فاتورة
                </div>
              </div>

              <button
                type="button"
                onClick={safeExitAndBackup}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>تصدير ملف النسخة الاحتياطية (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Features Summary */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ضمانات العمل بدون إنترنت (100% Offline Ready):</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">⚡ سرعة فائقة بالهاتف والكمبيوتر</div>
            <p className="text-slate-500 text-[11px]">معالجة فواتير المبيعات فورياً وقراءة الباركود بدون أي تأخير.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">🔒 قاعدة بيانات محلية آمنة</div>
            <p className="text-slate-500 text-[11px]">حفظ البيانات محلياً داخل ذاكرة جهازك المشفرة دون انقطاع.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">🖨️ طباعة الفواتير والإيصالات</div>
            <p className="text-slate-500 text-[11px]">دعم الطابعات الحرارية وطابعات الباركود عبر USB و Bluetooth و WiFi.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">📱 كاميرا الهاتف قارئ باركود</div>
            <p className="text-slate-500 text-[11px]">مسح كود السلع وتوليد كود الجزائر 613 مباشرة من كاميرا الهاتف.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
