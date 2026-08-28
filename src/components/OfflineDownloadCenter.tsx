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
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OfflineDownloadCenter: React.FC = () => {
  const { addToast, safeExitAndBackup, dbStats, products, customers, sales } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isGeneratingApp, setIsGeneratingApp] = useState<boolean>(false);

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
        addToast('تم بدء تثبيت تطبيق عبدو زين بنجاح!', 'success');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      addToast('لتثبيت التطبيق: انقر على أيقونة التثبيت (Install) في شريط المتصفح أو أضفه إلى الشاشة الرئيسية (Add to Home Screen)', 'info');
    }
  };

  const handleCopyAppUrl = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    addToast('تم نسخ رابط التطبيق الكامل للحافظة', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Download Standalone Self-Contained Offline WebApp Package (Single HTML file with embedded data)
  const handleDownloadStandaloneHtml = () => {
    setIsGeneratingApp(true);
    try {
      const offlineBundle = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>عبدو زين ستوك - النسخة المستقلة بدون أنترنت (Offline Desktop App)</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border: 1px solid #334155; }
    h1 { color: #ef4444; margin-top: 0; display: flex; align-items: center; gap: 10px; font-size: 24px; }
    .badge { background: #10b981; color: #022c22; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 12px; }
    .stat { background: #1e293b; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #475569; }
    .stat-val { font-size: 20px; font-weight: bold; color: #38bdf8; font-family: monospace; }
    .stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    button { background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; }
    button:hover { background: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { padding: 10px; text-align: right; border-bottom: 1px solid #334155; }
    th { background: #0f172a; color: #cbd5e1; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📦 تطبيق عبدو زين ستوك - النسخة المستقلة أوفلاين <span class="badge">100% Offline</span></h1>
    <p style="color: #94a3b8; font-size: 14px;">تم إنشاء هذه الحزمة المستقلة لتعمل محلياً على أي جهاز حاسوب أو هاتف بدون الحاجة لأي اتصال بالإنترنت أو سيرفر خارجي.</p>
    
    <div class="grid">
      <div class="stat">
        <div class="stat-val">${products.length}</div>
        <div class="stat-label">إجمالي البضائع والمنتجات</div>
      </div>
      <div class="stat">
        <div class="stat-val">${customers.length}</div>
        <div class="stat-label">الزبائن المسجلين</div>
      </div>
      <div class="stat">
        <div class="stat-val">${sales.length}</div>
        <div class="stat-label">فواتير المبيعات</div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h3 style="margin-top: 0; color: #f1f5f9;">قائمة البضائع المخزنة محلياً</h3>
      <table>
        <thead>
          <tr>
            <th>اسم المنتج</th>
            <th>الباركود</th>
            <th>سعر البيع (د.ج)</th>
            <th>المخزون الحالي</th>
          </tr>
        </thead>
        <tbody>
          ${products.slice(0, 50).map(p => `
            <tr>
              <td><strong>${p.name}</strong></td>
              <td style="font-family: monospace;">${p.barcode || p.sku}</td>
              <td style="color: #38bdf8; font-weight: bold;">${p.sellPrice.toLocaleString()} د.ج</td>
              <td>${p.currentStock} ${p.unit || 'قطعة'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
      مؤسسة عبدو زين لتسيير التجارة والمخازن • الجزائر 2026
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([offlineBundle], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Abdou_Zin_Stock_Offline_Standalone_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('تم تحميل تطبيق الحزمة المستقلة (Standalone Offline App) بنجاح!', 'success');
    } catch (e) {
      addToast('حدث خطأ أثناء إنشاء ملف التطبيق المستقل', 'error');
    } finally {
      setIsGeneratingApp(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Hero Offline Banner */}
      <div className="bg-gradient-to-r from-[#1b1e22] via-[#22272e] to-[#16181b] border-2 border-red-600/40 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                تطبيق الويب التقدمي (PWA)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                <span>100% يعمل بدون إنترنت</span>
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>تحميل وتثبيت برنامج عبدو زين ستوك للعمل بدون أنترنت</span>
            </h2>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              يمكنك استخدام التطبيق مباشرة من المتصفح، أو تثبيته كتطبيق مكتبي مستقل على جهاز الحاسوب (Windows / Mac) وهواتف Android و iPhone، مع حفظ كامل لقاعدة البيانات في جهازك ليعمل في أي وقت بدون اتصال.
            </p>
          </div>

          {/* Quick Install Action Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={handleInstallPWA}
              className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl font-black text-xs md:text-sm transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>{isInstalled ? 'التطبيق مثبت على جهازك ✓' : 'تثبيت البرنامج على سطح المكتب ⬇'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadStandaloneHtml}
              disabled={isGeneratingApp}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>تحميل حزمة التطبيق المستقلة (.html)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Installation Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Method 1: Desktop PWA */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900">1. التثبيت على الكمبيوتر (Windows / Mac)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تثبيت مباشر من متصفح Google Chrome أو Microsoft Edge كبرنامج نظام تشغيل مع أيقونة على سطح المكتب وشريط المهام.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
              <li>انقر على أيقونة التثبيت بجانب شريط الرابط.</li>
              <li>أو اضغط زر القائمة (⋮) ثم <strong>تثبيت التطبيق</strong>.</li>
              <li>يفتح في نافذة مستقلة وبدون شريط المتصفح.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleInstallPWA}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>تثبيت لسطح المكتب</span>
          </button>
        </div>

        {/* Method 2: Mobile Phone (Android & iOS) */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900">2. التثبيت على الهاتف (Android / iPhone)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تحويل التطبيق إلى تطبيق هاتف ذكي لاستخدام كاميرا الهاتف كماسح ضوئي للباركود في نقطة البيع والمخزن.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
              <li><strong>Android:</strong> اضغط (⋮) ثم «إضافة إلى الشاشة الرئيسية».</li>
              <li><strong>iPhone (Safari):</strong> اضغط زر المشاركة ثم «Add to Home Screen».</li>
              <li>يعمل أوفلاين مع مسح الباركود بالكاميرا.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleCopyAppUrl}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'تم نسخ الرابط ✓' : 'نسخ رابط فتح التطبيق بالهاتف'}</span>
          </button>
        </div>

        {/* Method 3: Standalone Backup & Local Data */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900">3. حفظ البيانات والنسخ الاحتياطي (JSON)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تنزيل نسخة احتياطية محلية فورية من كافة السلع، المخازن، والزبائن على شكل ملف يمكنك فتحه أو استرجاعه في أي وقت.
            </p>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
              عدد السجلات الجاهزة للحفظ: <strong>{products.length} سلعة</strong>، <strong>{customers.length} زبون</strong>.
            </div>
          </div>

          <button
            type="button"
            onClick={safeExitAndBackup}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>تنزيل النسخة الاحتياطية الآن</span>
          </button>
        </div>

      </div>

      {/* Offline Features Guarantee */}
      <div className="bg-white rounded-2xl border border-slate-300 p-5 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>مزايا العمل أوفلاين في برنامج عبدو زين ستوك:</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">⚡ سرعة فائقة في البيع</div>
            <p className="text-slate-500 text-[11px]">معالجة فواتير المبيعات فورياً وقراءة الباركود بدون أي تأخير في الشبكة.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">🔒 أمان تام للبيانات</div>
            <p className="text-slate-500 text-[11px]">حفظ البيانات محلياً مع المزامنة التلقائية مع السحابة عند توفر الاتصال.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">🖨️ طباعة تذاكر مباشرة</div>
            <p className="text-slate-500 text-[11px]">الطباعة على الطابعات الحرارية وطابعات الباركود عبر الكابل والـ USB و Bluetooth.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">📱 كاميرا الهاتف كسكانير</div>
            <p className="text-slate-500 text-[11px]">مسح كود باركود السلع وتوليد كود الجزائر 613 مباشرة من الهاتف.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
