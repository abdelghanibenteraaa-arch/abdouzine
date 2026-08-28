import React, { useState } from 'react';
import {
  Settings,
  Store,
  DollarSign,
  Receipt,
  Check,
  Save,
  Percent,
  MapPin,
  Phone,
  Hash,
  Printer,
  Monitor,
  Languages,
  Users,
  Shield,
  UserPlus,
  Trash2,
  Edit2,
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  Laptop,
  Smartphone,
  Sparkles,
  Lock,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StoreSettings, UserProfile, UserPermissions } from '../types';
import { OfflineDownloadCenter } from './OfflineDownloadCenter';

export const SettingsManager: React.FC = () => {
  const {
    settings,
    updateSettings,
    addToast,
    language,
    setLanguage,
    screenMode,
    setScreenMode,
    userProfiles,
    addUserProfile,
    updateUserProfile,
    deleteUserProfile,
    safeExitAndBackup,
    setActiveTab,
    refreshData
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'screen_lang' | 'printer' | 'users' | 'database_pwa'>('general');
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  // User form modal state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<{
    fullName: string;
    username: string;
    role: 'admin' | 'cashier' | 'manager';
    phone: string;
    password?: string;
    permissions: UserPermissions;
  }>({
    fullName: '',
    username: '',
    role: 'cashier',
    phone: '',
    password: '',
    permissions: {
      canEditPrices: false,
      canDeleteInvoices: false,
      canViewProfits: false,
      canManageInventory: false,
      canBackupDatabase: false,
      canManageUsers: false,
      canGiveDiscounts: false
    }
  });

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      localStorage.setItem('zin_store_settings', JSON.stringify(formData));
      addToast('تم حفظ جميع إعدادات النظام بنجاح', 'success');
    } catch (err: any) {
      addToast(err.message || 'فشل في حفظ الإعدادات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.fullName.trim()) {
      addToast('يرجى إدخال اسم المستخدم بالكامل', 'warning');
      return;
    }

    if (editingUserId) {
      await updateUserProfile(editingUserId, userFormData);
      addToast('تم تحديث بيانات وصلاحيات المستخدم بنجاح', 'success');
    } else {
      await addUserProfile({
        ...userFormData,
        storeName: formData.storeName,
        isActivated: true
      });
      addToast('تمت إضافة المستخدم الجديد وتحديد المهام بنجاح', 'success');
    }

    setIsAddingUser(false);
    setEditingUserId(null);
    setUserFormData({
      fullName: '',
      username: '',
      role: 'cashier',
      phone: '',
      password: '',
      permissions: {
        canEditPrices: false,
        canDeleteInvoices: false,
        canViewProfits: false,
        canManageInventory: false,
        canBackupDatabase: false,
        canManageUsers: false,
        canGiveDiscounts: false
      }
    });
  };

  const startEditUser = (user: UserProfile) => {
    setEditingUserId(user.id);
    setUserFormData({
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      phone: user.phone || '',
      password: user.password || '',
      permissions: user.permissions || {
        canEditPrices: user.role === 'admin' || user.role === 'manager',
        canDeleteInvoices: user.role === 'admin',
        canViewProfits: user.role === 'admin' || user.role === 'manager',
        canManageInventory: user.role === 'admin' || user.role === 'manager',
        canBackupDatabase: user.role === 'admin',
        canManageUsers: user.role === 'admin',
        canGiveDiscounts: user.role === 'admin' || user.role === 'manager'
      }
    });
    setIsAddingUser(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#e9ebed] select-none overflow-y-auto font-sans" dir="rtl">
      
      {/* Top Banner Header (Dark metallic bar matching Zin Stock) */}
      <div className="bg-gradient-to-b from-[#2d2f33] via-[#1f2023] to-[#161719] text-white px-5 py-3 shadow-md flex items-center justify-between border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
          </button>

          <button
            type="button"
            onClick={safeExitAndBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded text-xs font-bold transition-all border border-neutral-600 cursor-pointer"
            title="حفظ تلقائي والخروج"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span>حفظ وخروج آمن</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg md:text-xl font-black tracking-tight text-white">إعدادات النظام والتحكم الشامل</span>
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-white">
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Navigation Ribbon (Tabs matching the 11-step index) */}
      <div className="bg-[#1f2125] border-b border-neutral-700 px-4 py-2 flex items-center gap-2 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'general'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>3:06 .. الإعدادات العامة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('screen_lang')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'screen_lang'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>2:00 .. اللغة ونوع الشاشة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('printer')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'printer'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>4:05 .. إعدادات الطابعة والتذاكر</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>8:00 .. المستخدمين وتحديد المهام</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('database_pwa')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'database_pwa'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>0:30 & 3:34 .. التثبيت وقاعدة البيانات</span>
        </button>
      </div>

      <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto w-full">
        
        {/* TAB 1: GENERAL SETTINGS */}
        {activeSubTab === 'general' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Store Information */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Store className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm text-slate-900">بيانات المتجر والمنشأة التجارية</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المؤسسة / المتجر</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">النشاط التجاري / الشعار الفرعي</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="تجارة عامة ومواد غذائية بالجملة والتجزئة"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف / الجوال</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono-numbers text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">العنوان / الولاية والبلدية</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم التعريف الجبائي والتعريف الإحصائي (NIF / NIS)</label>
                  <input
                    type="text"
                    value={formData.taxNumber || ''}
                    onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
                    placeholder="NIF: 001916012345678 - NIS: 0019160100012"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono-numbers text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السجل التجاري ورقم المادة (RC / Art)</label>
                  <input
                    type="text"
                    value={formData.commercialRecord || ''}
                    onChange={e => setFormData({ ...formData, commercialRecord: e.target.value })}
                    placeholder="RC: 16/00-1234567B19 - Art: 16012345678"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono-numbers text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Currency & Tax */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">العملة والضريبة الرسمية</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم العملة</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="دينار جزائري"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رمز العملة (الاختصار)</label>
                  <input
                    type="text"
                    value={formData.currencySymbol}
                    onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                    placeholder="د.ج"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نسبة ضريبة القيمة المضافة (TVA %)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono-numbers font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.enableTax}
                    onChange={e => setFormData({ ...formData, enableTax: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    تفعيل حساب ضريبة القيمة المضافة آلياً على الفواتير والمبيعات
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LANGUAGE & SCREEN DISPLAY MODE */}
        {activeSubTab === 'screen_lang' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Language Selector */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Languages className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">2:00 .. تغيير لغة البرنامج (اللغة الافتراضية)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    setLanguage('ar');
                    setFormData({ ...formData, language: 'ar' });
                    addToast('تم تحديد اللغة العربية كلغة رئيسية للنظام 🇩🇿', 'success');
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    language === 'ar'
                      ? 'border-red-600 bg-red-50/50 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🇩🇿</span>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">اللغة العربية (الجزائر)</h4>
                      <p className="text-xs text-slate-500">واجهة كاملة باللغة العربية مع اتجاه من اليمين إلى اليسار (RTL)</p>
                    </div>
                  </div>
                  {language === 'ar' && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                </div>

                <div
                  onClick={() => {
                    setLanguage('fr');
                    setFormData({ ...formData, language: 'fr' });
                    addToast('Langue définie sur Français 🇫🇷', 'success');
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    language === 'fr'
                      ? 'border-red-600 bg-red-50/50 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🇫🇷</span>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">Français (France / Algérie)</h4>
                      <p className="text-xs text-slate-500">Interface en Français pour tickets et gestion commerciale</p>
                    </div>
                  </div>
                  {language === 'fr' && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                </div>
              </div>
            </div>

            {/* Screen Mode Selector */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Monitor className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-sm text-slate-900">نوع الشاشة وطريقة العرض (Touch POS / Desktop)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Standard Desktop */}
                <div
                  onClick={() => {
                    setScreenMode('standard');
                    setFormData({ ...formData, screenMode: 'standard' });
                    addToast('تم تفعيل وضع الشاشة المكتبية القياسية', 'info');
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    screenMode === 'standard'
                      ? 'border-red-600 bg-red-50/40 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-slate-700" />
                    <h4 className="font-bold text-xs text-slate-900">شاشة مكتبية قياسية (Standard Desktop)</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    تصميم Zin Stock الأصلي الكلاسيكي مع جداول تفصيلية وأزرار اختصار سطح المكتب.
                  </p>
                  <div className="text-[10px] font-bold text-red-600 font-mono">الوضع الافتراضي</div>
                </div>

                {/* Touch Screen POS */}
                <div
                  onClick={() => {
                    setScreenMode('touch');
                    setFormData({ ...formData, screenMode: 'touch' });
                    addToast('تم تفعيل وضع الشاشة اللمسية السريعة (Touch POS)', 'info');
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    screenMode === 'touch'
                      ? 'border-red-600 bg-red-50/40 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-red-600" />
                    <h4 className="font-bold text-xs text-slate-900">شاشة لمسية (Touch Screen POS)</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    أزرار كبيرة، لمس سريع، لوحة أرقام مدمجة، مثالية لمحلات السوبرماركت والمطاعم.
                  </p>
                  <div className="text-[10px] font-bold text-emerald-600 font-mono">لمس سريع ⚡</div>
                </div>

                {/* Compact Mode */}
                <div
                  onClick={() => {
                    setScreenMode('compact');
                    setFormData({ ...formData, screenMode: 'compact' });
                    addToast('تم تفعيل الوضع المصغر Compact', 'info');
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    screenMode === 'compact'
                      ? 'border-red-600 bg-red-50/40 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-xs text-slate-900">شاشة مدمجة (Compact Mode)</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    كثافة بيانات عالية للشاشات الصغيرة وشاشات 15 بوصة القديمة (1024x768).
                  </p>
                  <div className="text-[10px] font-bold text-blue-600 font-mono">أقصى كثافة</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRINTER & TICKETS SETTINGS */}
        {activeSubTab === 'printer' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-sm text-slate-900">4:05 .. إعدادات الطابعة وتنسيق التذاكر والفواتير</h3>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة تجريبية للتذكرة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حجم ونوع الورق المطبوع</label>
                  <select
                    value={formData.printerConfig?.receiptSize || '80mm'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        printerConfig: {
                          ...formData.printerConfig,
                          receiptSize: e.target.value as any,
                          printerType: e.target.value === 'a4' ? 'a4' : (e.target.value === '58mm' ? 'thermal_58' : 'thermal_80')
                        }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="80mm">تذكرة حرارية 80 مم (Thermal Ticket 80mm - القياسية)</option>
                    <option value="58mm">تذكرة حرارية صغيرة 58 مم (Thermal Ticket 58mm)</option>
                    <option value="a4">فاتورة صفحة كاملة (A4 Invoices & Bon de livraison)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عدد النسخ عند الطباعة</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.printerConfig?.copiesCount || 1}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        printerConfig: {
                          ...formData.printerConfig,
                          copiesCount: Number(e.target.value) || 1
                        }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono-numbers text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ترويسة أعلى التذكرة (Header)</label>
                  <input
                    type="text"
                    value={formData.printerConfig?.customHeaderNote || 'مرحباً بكم في متجرنا'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        printerConfig: {
                          ...formData.printerConfig,
                          customHeaderNote: e.target.value
                        }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.printerConfig?.autoPrintOnSale ?? true}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        printerConfig: {
                          ...formData.printerConfig,
                          autoPrintOnSale: e.target.checked
                        }
                      })
                    }
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">طباعة التذكرة تلقائياً بعد إنهاء البيع</span>
                    <span className="text-[11px] text-slate-500">إرسال أمر الطباعة مباشرة بعد الضغط على قبض المبلغ</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.printerConfig?.openCashDrawer ?? true}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        printerConfig: {
                          ...formData.printerConfig,
                          openCashDrawer: e.target.checked
                        }
                      })
                    }
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">فتح درج النقود آلياً عند الطباعة (Tiroir-Caisse)</span>
                    <span className="text-[11px] text-slate-500">إرسال نبضة لفتح درج النقود المتصل بالطابعة</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.printerConfig?.printStoreLogo ?? true}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        printerConfig: {
                          ...formData.printerConfig,
                          printStoreLogo: e.target.checked
                        }
                      })
                    }
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">طباعة شعار المتجر أعلى الفاتورة</span>
                    <span className="text-[11px] text-slate-500">إظهار شعار عبدو زين أو شعار المحل المخصص</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.printerConfig?.showBarcodeOnReceipt ?? true}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        printerConfig: {
                          ...formData.printerConfig,
                          showBarcodeOnReceipt: e.target.checked
                        }
                      })
                    }
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">طباعة باركود الفاتورة أسفل التذكرة</span>
                    <span className="text-[11px] text-slate-500">لسهولة الإرجاع واسترجاع الفاتورة بالماسح الضوئي</span>
                  </div>
                </label>
              </div>

              {/* Invoice Footer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص وتذييل أسفل التذكرة</label>
                <textarea
                  rows={2}
                  value={formData.invoiceFooterNote}
                  onChange={e => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
                  placeholder="شكراً لزيارتكم! البضاعة المباعة ترد وتستبدل خلال 3 أيام مع إحضار التذكرة."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USERS & PERMISSIONS */}
        {activeSubTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">8:00 .. إضافة مستخدم مع تحديد المهام والصلاحيات</h3>
                    <p className="text-xs text-slate-500">إدارة حسابات الكاشير، مسؤولي المبيعات، والمدراء مع تخصيص الصلاحيات</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingUserId(null);
                    setUserFormData({
                      fullName: '',
                      username: '',
                      role: 'cashier',
                      phone: '',
                      password: '',
                      permissions: {
                        canEditPrices: false,
                        canDeleteInvoices: false,
                        canViewProfits: false,
                        canManageInventory: false,
                        canBackupDatabase: false,
                        canManageUsers: false,
                        canGiveDiscounts: false
                      }
                    });
                    setIsAddingUser(true);
                  }}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-red-600 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>إضافة مستخدم جديد +</span>
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">اسم المستخدم</th>
                      <th className="p-3">اسم الدخول</th>
                      <th className="p-3">الدور / الوظيفة</th>
                      <th className="p-3">رقم الهاتف</th>
                      <th className="p-3">الصلاحيات الممنوحة</th>
                      <th className="p-3 text-center">العمليات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {userProfiles.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                            {u.fullName.charAt(0)}
                          </div>
                          <span>{u.fullName}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{u.username}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              u.role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : u.role === 'manager'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role === 'admin' ? 'مدير عام (Admin)' : u.role === 'manager' ? 'مسؤول مخزن ومبيعات' : 'كاشير نقطة بيع'}
                          </span>
                        </td>
                        <td className="p-3 font-mono-numbers text-slate-700">{u.phone || '—'}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {u.permissions?.canEditPrices && (
                              <span className="bg-slate-100 text-slate-700 text-[9px] px-1.5 py-0.5 rounded">تعديل أسعار</span>
                            )}
                            {u.permissions?.canViewProfits && (
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-bold">رؤية الأرباح</span>
                            )}
                            {u.permissions?.canManageInventory && (
                              <span className="bg-blue-50 text-blue-700 text-[9px] px-1.5 py-0.5 rounded">إدارة المخزون</span>
                            )}
                            {u.permissions?.canDeleteInvoices && (
                              <span className="bg-rose-50 text-rose-700 text-[9px] px-1.5 py-0.5 rounded font-bold">حذف فواتير</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditUser(u)}
                              className="p-1 text-slate-600 hover:text-indigo-600 transition-colors"
                              title="تعديل المستخدم والصلاحيات"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {u.id !== 'usr-admin' && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`هل أنت متأكد من حذف المستخدم ${u.fullName}؟`)) {
                                    deleteUserProfile(u.id);
                                    addToast('تم حذف المستخدم بنجاح', 'info');
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="حذف المستخدم"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add / Edit User Form Modal/Box */}
              {isAddingUser && (
                <div className="p-4 bg-slate-50 border-2 border-indigo-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="font-black text-xs text-indigo-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>{editingUserId ? 'تعديل بيانات وصلاحيات المستخدم' : 'إضافة مستخدم جديد وتحديد المهام'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      إلغاء
                    </button>
                  </div>

                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                        <input
                          type="text"
                          value={userFormData.fullName}
                          onChange={e => setUserFormData({ ...userFormData, fullName: e.target.value })}
                          placeholder="مثال: يوسف العربي"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المستخدم (Login)</label>
                        <input
                          type="text"
                          value={userFormData.username}
                          onChange={e => setUserFormData({ ...userFormData, username: e.target.value })}
                          placeholder="youcef_pos"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">الدور / الرتبة</label>
                        <select
                          value={userFormData.role}
                          onChange={e => {
                            const newRole = e.target.value as any;
                            setUserFormData({
                              ...userFormData,
                              role: newRole,
                              permissions: {
                                canEditPrices: newRole === 'admin' || newRole === 'manager',
                                canDeleteInvoices: newRole === 'admin',
                                canViewProfits: newRole === 'admin' || newRole === 'manager',
                                canManageInventory: newRole === 'admin' || newRole === 'manager',
                                canBackupDatabase: newRole === 'admin',
                                canManageUsers: newRole === 'admin',
                                canGiveDiscounts: newRole === 'admin' || newRole === 'manager'
                              }
                            });
                          }}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none"
                        >
                          <option value="cashier">كاشير نقطة بيع (Cashier)</option>
                          <option value="manager">مسؤول مخزن ومشتريات (Manager)</option>
                          <option value="admin">مدير عام كامل الصلاحيات (Admin)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">كلمة المرور (اختياري)</label>
                        <input
                          type="password"
                          value={userFormData.password}
                          onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                          placeholder="••••••"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Permissions Checkboxes */}
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-2">
                        تحديد المهام والصلاحيات التفصيلية:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userFormData.permissions.canEditPrices}
                            onChange={e =>
                              setUserFormData({
                                ...userFormData,
                                permissions: { ...userFormData.permissions, canEditPrices: e.target.checked }
                              })
                            }
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span>تعديل أسعار البيع أثناء البيع</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userFormData.permissions.canGiveDiscounts}
                            onChange={e =>
                              setUserFormData({
                                ...userFormData,
                                permissions: { ...userFormData.permissions, canGiveDiscounts: e.target.checked }
                              })
                            }
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span>تقديم تخفيضات للزبائن (%)</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userFormData.permissions.canDeleteInvoices}
                            onChange={e =>
                              setUserFormData({
                                ...userFormData,
                                permissions: { ...userFormData.permissions, canDeleteInvoices: e.target.checked }
                              })
                            }
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span>حذف وتعديل الفواتير السابقة</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userFormData.permissions.canViewProfits}
                            onChange={e =>
                              setUserFormData({
                                ...userFormData,
                                permissions: { ...userFormData.permissions, canViewProfits: e.target.checked }
                              })
                            }
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span>رؤية الأرباح، الصندوق، والزكاة</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userFormData.permissions.canManageInventory}
                            onChange={e =>
                              setUserFormData({
                                ...userFormData,
                                permissions: { ...userFormData.permissions, canManageInventory: e.target.checked }
                              })
                            }
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span>تعديل وجرد المخزون والسلع</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={userFormData.permissions.canBackupDatabase}
                            onChange={e =>
                              setUserFormData({
                                ...userFormData,
                                permissions: { ...userFormData.permissions, canBackupDatabase: e.target.checked }
                              })
                            }
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span>تصدير واسترجاع قاعدة البيانات</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingUser(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingUserId ? 'تحديث المستخدم' : 'حفظ المستخدم الجديد'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE & OFFLINE PWA SETUP */}
        {activeSubTab === 'database_pwa' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <OfflineDownloadCenter />

            {/* Save Database & Auto Backup on Exit */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                <Database className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">3:34 .. إعدادات النسخ الاحتياطي التلقائي والصيانة</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900">تصدير لقطة احتياطية فورية (JSON Backup)</h4>
                  <p className="text-[11px] text-slate-500">
                    تنزيل نسخة احتياطية مشفرة وشاملة لكافة السلع، الفواتير، الزبائن، والموردين.
                  </p>
                  <button
                    type="button"
                    onClick={safeExitAndBackup}
                    className="w-full py-2 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير وتحميل النسخة الاحتياطية الآن</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900">استرجاع قاعدة بيانات من ملف خارجي</h4>
                  <p className="text-[11px] text-slate-500">
                    استيراد نسخة احتياطية سابقة واسترجاع جميع السجلات في ثوانٍ.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('database')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>فتح مركز الصيانة واسترجاع البيانات</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.autoBackupOnExit ?? true}
                    onChange={e => setFormData({ ...formData, autoBackupOnExit: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    تفعيل النسخ الاحتياطي التلقائي عند الخروج من البرنامج (9:30 الخروج الآمن)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button bottom bar */}
        <div className="flex items-center justify-between pt-3 pb-6">
          <div className="text-xs text-slate-500 font-bold">
            مؤسسة عبدو زين للتجارة والتوزيع V2026
          </div>
          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all shadow-lg shadow-red-600/30 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ وتثبيت كافة التعديلات'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
