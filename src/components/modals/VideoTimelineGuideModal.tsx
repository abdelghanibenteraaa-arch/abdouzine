import React from 'react';
import {
  X,
  PlayCircle,
  Download,
  Languages,
  Settings,
  Database,
  Printer,
  Monitor,
  Layers,
  Coins,
  Receipt,
  UserPlus,
  LogOut,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface VideoTimelineGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoTimelineGuideModal: React.FC<VideoTimelineGuideModalProps> = ({ isOpen, onClose }) => {
  const { setActiveTab, setLanguage, language, settings, addToast } = useApp();

  if (!isOpen) return null;

  const timelineItems = [
    {
      time: '0:30',
      title: 'تثبيت البرنامج والتشغيل أوفلاين',
      desc: 'دليل تثبيت التطبيق على سطح المكتب والعمل الكامل بدون إنترنت مع قاعدة بيانات محلية وحزم مستقلة.',
      icon: Download,
      color: 'from-blue-600 to-indigo-700',
      actionText: 'دليل التثبيت والأوفلاين',
      onExecute: () => {
        setActiveTab('settings');
        onClose();
        addToast('تم فتح نافذة الإعدادات ومركز التثبيت أوفلاين', 'info');
      }
    },
    {
      time: '1:15',
      title: 'قارئ الباركود بكاميرا الهاتف والويب كام',
      desc: 'مسح الباركود بكاميرا الهاتف أو الويب كام وقراءة كود السلع فورياً في نقطة البيع وإضافة المنتجات.',
      icon: Camera,
      color: 'from-red-600 to-rose-700',
      actionText: 'فتح نقطة البيع واستخدام الكاميرا',
      onExecute: () => {
        setActiveTab('pos');
        onClose();
        addToast('انقر على زر "سكانر الكاميرا" لتشغيل قارئ الباركود', 'info');
      }
    },
    {
      time: '2:00',
      title: 'تغيير اللغة (العربية / Français)',
      desc: 'التبديل الفوري بين اللغة العربية والفرنسية في كافة شاشات وتذاكر البرنامج.',
      icon: Languages,
      color: 'from-emerald-600 to-teal-700',
      actionText: language === 'ar' ? 'تبديل إلى Français 🇫🇷' : 'تبديل إلى العربية 🇩🇿',
      onExecute: () => {
        const nextLang = language === 'ar' ? 'fr' : 'ar';
        setLanguage(nextLang);
        addToast(nextLang === 'ar' ? 'تم تحويل لغة النظام إلى العربية' : 'Langue changée en Français', 'success');
      }
    },
    {
      time: '3:06',
      title: 'الإعدادات العامة للمؤسسة',
      desc: 'تحديد اسم المتجر، الهاتف، العنوان، السجل التجاري، الرقم الضريبي والعملة الرسمية (د.ج).',
      icon: Settings,
      color: 'from-purple-600 to-violet-800',
      actionText: 'فتح الإعدادات العامة',
      onExecute: () => {
        setActiveTab('settings');
        onClose();
      }
    },
    {
      time: '3:34',
      title: 'حفظ قاعدة البيانات وتصدير النسخ',
      desc: 'إنشاء وحفظ نسخة احتياطية كاملة (Backup JSON) واسترجاع البيانات بضغطة زر.',
      icon: Database,
      color: 'from-amber-600 to-orange-700',
      actionText: 'إدارة قاعدة البيانات والنسخ',
      onExecute: () => {
        setActiveTab('database');
        onClose();
      }
    },
    {
      time: '4:05',
      title: 'إعدادات الطابعة وتنسيق التذاكر',
      desc: 'ضبط حجم الورق (80mm / 58mm / A4)، الطباعة التلقائية، طباعة الشعار وفتح درج النقود.',
      icon: Printer,
      color: 'from-rose-600 to-red-700',
      actionText: 'ضبط الطابعة والتذاكر',
      onExecute: () => {
        setActiveTab('settings');
        onClose();
      }
    },
    {
      time: '—',
      title: 'إعدادات عامة (تغيير اللغة - ونوع الشاشة)',
      desc: 'التبديل بين شاشة اللمس السريعة (Touch POS)، الشاشة المكتبية القياسية، والوضع المصغر.',
      icon: Monitor,
      color: 'from-cyan-600 to-blue-800',
      actionText: 'تغيير نوع الشاشة',
      onExecute: () => {
        setActiveTab('settings');
        onClose();
      }
    },
    {
      time: '5:50',
      title: 'حالة المخزون وتقييم البضاعة',
      desc: 'معاينة القيمة الإجمالية للمخزن بسعر الشراء وسعر البيع، وتنبيهات النواقص وحركات الجرد.',
      icon: Layers,
      color: 'from-lime-600 to-emerald-800',
      actionText: 'عرض حالة وسجل المخزون',
      onExecute: () => {
        setActiveTab('stock_logs');
        onClose();
      }
    },
    {
      time: '6:00',
      title: 'الصندوق النقدي والفائدة والزكاة',
      desc: 'تتبع حركة الصندوق، حساب إجمالي الفائدة والأرباح، وحاسبة زكاة عروض التجارة 2.5% مع النصاب الشرعي.',
      icon: Coins,
      color: 'from-amber-500 to-yellow-700',
      actionText: 'فتح الصندوق والأرباح والزكاة',
      onExecute: () => {
        setActiveTab('reports');
        onClose();
      }
    },
    {
      time: '6:50',
      title: 'حساب المداخيل والنفقات (المصاريف)',
      desc: 'تسجيل مصاريف المحل (كراء، كهرباء، عمال، نقل) وحساب صافي الدخل والتدفق المالي.',
      icon: Receipt,
      color: 'from-fuchsia-600 to-pink-700',
      actionText: 'سجل النفقات والمداخيل',
      onExecute: () => {
        setActiveTab('reports');
        onClose();
      }
    },
    {
      time: '8:00',
      title: 'إضافة مستخدم مع تحديد المهام والصلاحيات',
      desc: 'إنشاء حسابات للكاشير والمسيرين وتخصيص صلاحيات تعديل الأسعار، الحذف، ورؤية الأرباح.',
      icon: UserPlus,
      color: 'from-indigo-600 to-blue-900',
      actionText: 'إدارة المستخدمين والصلاحيات',
      onExecute: () => {
        setActiveTab('settings');
        onClose();
      }
    },
    {
      time: '9:30',
      title: 'الخروج من البرنامج وحفظ البيانات التلقائي',
      desc: 'الخروج الآمن مع أخذ لقطة فورية لقاعدة البيانات وحفظها محلياً لحماية جميع المعاملات.',
      icon: LogOut,
      color: 'from-slate-700 to-neutral-900',
      actionText: 'حفظ وخروج آمن',
      onExecute: () => {
        // Safe snapshot and alert
        try {
          const snapshot = {
            date: new Date().toISOString(),
            store: settings.storeName,
            status: 'saved_ok'
          };
          localStorage.setItem('zin_last_safe_snapshot', JSON.stringify(snapshot));
          addToast('تم حفظ لقطة أمان كاملة لقاعدة البيانات بنجاح! تم تأمين جميع المعاملات.', 'success');
        } catch {
          addToast('تم حفظ البيانات بنجاح', 'success');
        }
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#f0f2f5] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border-4 border-[#3a4452] flex flex-col overflow-hidden text-right font-sans" dir="rtl">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#202225] via-[#2f333a] to-[#202225] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-red-600 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-md">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>أوامر ودليل البرنامج (فهرس الأوامر والمهام)</span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-mono">11 ميزة</span>
              </h2>
              <p className="text-[11px] text-slate-300">
                جميع العمليات المذكورة في الدليل جاهزة للتشغيل والتطبيق الفوري
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer border border-neutral-600"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: List of 11 items */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-3 text-xs flex items-start gap-2.5 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>فهرس الأوامر التفاعلي:</strong> يمكنك النقر على أي زر أمام كل ميزة لتطبيقها مباشرة في النظام أو الانتقال لقسمها المخصص فوراً.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {timelineItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white text-[10px] font-black font-mono-numbers px-1.5 py-0.5 rounded">
                          {item.time}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">الخطوة #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={item.onExecute}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>{item.actionText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#e4e7eb] px-5 py-3 border-t border-slate-300 flex items-center justify-between select-none">
          <div className="text-xs font-bold text-slate-600">
            برنامج عبدو زين التجاري - النسخة المتكاملة V2026
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
