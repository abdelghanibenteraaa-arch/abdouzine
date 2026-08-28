import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Building,
  Phone,
  MapPin,
  Lock,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  KeyRound,
  LogIn,
  UserPlus,
  ArrowRight,
  Eye,
  EyeOff,
  Store,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AccountCreationModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    saveUserProfile,
    loginWithCredentials
  } = useApp();

  // Mode: 'login' (الدخول إلى الحساب) or 'register' (إنشاء وتفعيل حساب جديد)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState('0550 12 34 56');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [formData, setFormData] = useState({
    fullName: 'عبدو زين',
    username: 'abdou_zin',
    storeName: 'مؤسسة عبدو زين للتجارة والتوزيع',
    phone: '0550 12 34 56',
    wilaya: '16 - الجزائر العاصمة',
    activityType: 'تجارة عامة ومواد غذائية (Superette & Alimentation Générale)',
    password: '',
    confirmPassword: '',
    licenseKey: 'ZIN-2026-COMMERCIAL-PRO-8899-DZ',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check whether a profile already exists in localStorage to suggest login or register
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zin_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone) {
          setLoginPhone(parsed.phone);
        }
        // If current user is null and profile exists -> default to login
        if (!currentUser) {
          setAuthMode('login');
        }
      } else {
        // No saved profile -> start with register
        setAuthMode('register');
      }
    } catch {
      // fallback
    }
  }, [currentUser, isAuthModalOpen]);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.fullName || prev.fullName,
        username: currentUser.username || prev.username,
        storeName: currentUser.storeName || prev.storeName,
        phone: currentUser.phone || prev.phone,
        wilaya: currentUser.wilaya || prev.wilaya,
        activityType: currentUser.activityType || prev.activityType,
        password: currentUser.password || '',
        confirmPassword: currentUser.password || '',
      }));
      setLoginPhone(currentUser.phone || '0550 12 34 56');
    }
  }, [currentUser]);

  if (!isAuthModalOpen) return null;

  // Handle Login with registered phone number and password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginPhone || loginPhone.trim() === '') {
      setLoginError('يرجى إدخال رقم الهاتف المسجل به');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await loginWithCredentials(loginPhone, loginPassword);
      if (!success) {
        setLoginError('رقم الهاتف أو كلمة السر غير مطابقة للحساب المسجل');
      }
    } catch (err: any) {
      setLoginError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle New Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      alert('كلمتا المرور غير متطابقتين!');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveUserProfile({
        fullName: formData.fullName,
        username: formData.username,
        storeName: formData.storeName,
        phone: formData.phone,
        wilaya: formData.wilaya,
        activityType: formData.activityType,
        password: formData.password,
        role: 'admin',
        isActivated: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const wilayas = [
    '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة',
    '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
    '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو',
    '16 - الجزائر العاصمة', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
    '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة',
    '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
    '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس',
    '36 - الطارف', '37 - تندوف', '38 - تسمسيلت', '39 - الوادي', '40 - خنشلة',
    '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة',
    '46 - عين تموشنت', '47 - غرداية', '48 - غليزان'
  ];

  const activities = [
    'تجارة عامة ومواد غذائية (Superette & Alimentation Générale)',
    'محل بيع الملابس والأحذية (Habillement & Chaussures)',
    'كوسميتيك وعطور (Cosmétiques & Parfumerie)',
    'هواتف وإلكترونيات (Téléphonie & Informatique)',
    'قطع غيار وميكانيك (Pièces de Rechange Auto)',
    'خردوات ومواد بناء (Quincaillerie & Droguerie)',
    'صيدلية وشبه صيدلاني (Pharmacie & Parapharmacie)',
    'مكتبة وأدوات مدرسية (Librairie & Papeterie)',
    'مطعم، مقهى ومأكولات سريعة (Fast Food & Café)',
    'مخزن وتجارة الجملة (Commerce de Gros & Stock)'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto font-sans" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-red-600 max-w-xl w-full overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#181a1d] via-[#24272c] to-[#181a1d] text-white p-4 flex items-center justify-between border-b-2 border-red-600 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg border border-red-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white">
                  {authMode === 'login' ? 'الدخول إلى حسابك المسجل' : 'إنشاء وتفعيل حساب جديد'}
                </span>
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  عبدو زين
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">نظام تسيير المبيعات، المخازن ونقاط البيع Zin Stock</p>
            </div>
          </div>

          {currentUser && (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="p-1 rounded hover:bg-neutral-800 text-slate-400 hover:text-white transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Auth Mode Toggle Tabs (تسجيل الدخول / إنشاء حساب جديد) */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setLoginError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>الدخول إلى حسابك (رقم الهاتف + كلمة السر)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setLoginError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء / تعديل حساب المتجر</span>
          </button>
        </div>

        {/* License & Status Bar */}
        <div className="bg-gradient-to-r from-red-50 to-amber-50 px-4 py-2 border-b border-red-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px] font-bold text-slate-800">
              {authMode === 'login'
                ? 'الرجاء إدخال رقم الهاتف المسجل به وكلمة السر للوصول للنظام'
                : 'إعداد وتخصيص بيانات المتجر والمدير مع كلمة السر'}
            </div>
          </div>
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            مفعل 2026
          </span>
        </div>

        {/* ---------------- MODE 1: LOGIN (الدخول إلى الحساب) ---------------- */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
            
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2 text-xs text-red-700 font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 shadow-2xs">
              
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-red-600" />
                    رقم الهاتف المسجل به الحساب:
                  </span>
                  <span className="text-[11px] text-red-600 font-bold">* مطلوب</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 focus:border-red-600 rounded-lg px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-hidden transition-all shadow-inner font-mono text-left"
                    placeholder="مثال: 0550 12 34 56 أو 0661 00 00 00"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  أدخل رقم الهاتف الذي تم حفظه أثناء إنشاء الحساب أو الرقم الافتراضي.
                </p>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-red-600" />
                    كلمة السر:
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">(اتركها فارغة إن لم تحدد كلمة سر)</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    dir="ltr"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 focus:border-red-600 rounded-lg px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-hidden transition-all shadow-inner font-mono text-left"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Demo Info Box */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-slate-700 text-xs flex items-start gap-2">
              <Store className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">ملاحظة سريعة:</span> الحساب الافتراضي المسجل للمدير هو رقم الهاتف: <span className="font-mono font-bold text-red-700 bg-red-100/80 px-1.5 py-0.5 rounded">0550 12 34 56</span>. يمكنك الدخول به مباشرة أو إنشاء حساب جديد برقم هاتفك الخاص.
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                ليس لديك حساب؟ إنشاء حساب جديد
              </button>

              <div className="flex items-center gap-2">
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-xs font-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول إلى الحساب'}
                </button>
              </div>
            </div>

          </form>
        ) : (
          /* ---------------- MODE 2: REGISTER (إنشاء حساب جديد) ---------------- */
          <form onSubmit={handleRegisterSubmit} className="p-4 sm:p-5 space-y-3.5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-red-600" />
                  الاسم واللقب (المدير):
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-hidden transition-all shadow-2xs"
                  placeholder="مثال: عبدو زين"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                  اسم الدخول (Username):
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-hidden transition-all shadow-2xs font-mono"
                  placeholder="abdou_zin"
                />
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-red-600" />
                اسم المحل أو المؤسسة التجاريّة (يظهر في أعلى الفواتير):
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-hidden transition-all shadow-2xs"
                placeholder="مثال: مؤسسة عبدو زين للتجارة والتوزيع"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone Number (Primary Login ID) */}
              <div>
                <label className="block text-xs font-black text-red-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  رقم الهاتف (يُستخدم لتسجيل الدخول):
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-red-50/50 border-2 border-red-400 focus:border-red-600 focus:bg-white rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-hidden transition-all shadow-2xs font-mono text-left"
                  placeholder="0550 12 34 56"
                />
              </div>

              {/* Wilaya */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  الولاية / المدينة:
                </label>
                <select
                  value={formData.wilaya}
                  onChange={e => setFormData({ ...formData, wilaya: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-lg px-2.5 py-2 text-xs font-medium text-slate-900 outline-hidden transition-all shadow-2xs"
                >
                  {wilayas.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Activity Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نوع النشاط التجاري:
              </label>
              <select
                value={formData.activityType}
                onChange={e => setFormData({ ...formData, activityType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-red-600 focus:bg-white rounded-lg px-2.5 py-2 text-xs font-medium text-slate-900 outline-hidden transition-all shadow-2xs"
              >
                {activities.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  كلمة السر للحساب:
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    dir="ltr"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-red-600 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-hidden transition-all shadow-2xs font-mono text-left"
                    placeholder="كلمة المرور الجديدة"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  تأكيد كلمة السر:
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-white border border-slate-300 focus:border-red-600 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-hidden transition-all shadow-2xs font-mono text-left"
                  placeholder="أعد كتابة كلمة المرور"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                لديك حساب بالفعل؟ الدخول الآن
              </button>

              <div className="flex items-center gap-2">
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-xs font-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isSubmitting ? 'جاري الحفظ والتفعيل...' : 'حفظ الحساب وتفعيله والدخول'}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
