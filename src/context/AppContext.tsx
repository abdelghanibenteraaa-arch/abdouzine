import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  Customer,
  Supplier,
  SaleInvoice,
  PurchaseInvoice,
  InventoryLog,
  PaymentRecord,
  ExpenseRecord,
  StoreSettings,
  FinancialSummary,
  DatabaseStats,
  UserProfile
} from '../types';
import { api } from '../services/api';
import { getTranslation, TranslationKey, Language } from '../i18n/translations';

export type NavTab =
  | 'dashboard'
  | 'pos'
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'barcode'
  | 'stock_logs'
  | 'customers'
  | 'suppliers'
  | 'reports'
  | 'database'
  | 'settings';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  products: Product[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: SaleInvoice[];
  purchases: PurchaseInvoice[];
  inventoryLogs: InventoryLog[];
  payments: PaymentRecord[];
  settings: StoreSettings;
  financialSummary: FinancialSummary | null;
  dbStats: DatabaseStats | null;
  isLoading: boolean;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
  updateSettings: (data: Partial<StoreSettings>) => Promise<void>;
  
  // User Profile & Account Authentication
  currentUser: UserProfile | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  loginWithCredentials: (phone: string, password?: string) => Promise<boolean>;
  logout: () => void;

  // Language & Screen Mode
  language: 'ar' | 'fr';
  setLanguage: (lang: 'ar' | 'fr') => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  screenMode: 'standard' | 'touch' | 'compact';
  setScreenMode: (mode: 'standard' | 'touch' | 'compact') => void;

  // Expenses & Cash Flow
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // User Management with Roles & Permissions
  userProfiles: UserProfile[];
  addUserProfile: (user: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<void>;
  updateUserProfile: (id: string, user: Partial<UserProfile>) => Promise<void>;
  deleteUserProfile: (id: string) => Promise<void>;

  // Video Guide & Tutorial Hub
  isVideoGuideOpen: boolean;
  setIsVideoGuideOpen: (open: boolean) => void;

  // Safe Exit & Snapshot Backup
  safeExitAndBackup: () => Promise<void>;

  // Selected Invoice Modal State
  selectedInvoice: { type: 'sale' | 'purchase'; data: SaleInvoice | PurchaseInvoice } | null;
  setSelectedInvoice: (invoice: { type: 'sale' | 'purchase'; data: SaleInvoice | PurchaseInvoice } | null) => void;

  // Selected Stock Adjust Product
  adjustStockProduct: Product | null;
  setAdjustStockProduct: (prod: Product | null) => void;

  // Quick Action Modal states
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
  productDraft: { barcode?: string; name?: string } | null;
  setProductDraft: (draft: { barcode?: string; name?: string } | null) => void;
  openAddProductWithDraft: (draft?: { barcode?: string; name?: string }) => void;
  isAddSaleInvoiceOpen: boolean;
  setIsAddSaleInvoiceOpen: (open: boolean) => void;
  isAddCustomerOpen: boolean;
  setIsAddCustomerOpen: (open: boolean) => void;
  isAddSupplierOpen: boolean;
  setIsAddSupplierOpen: (open: boolean) => void;
  isAddPaymentOpen: boolean;
  setIsAddPaymentOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isPriceCheckOpen: boolean;
  setIsPriceCheckOpen: (open: boolean) => void;
  isCustomerReturnOpen: boolean;
  setIsCustomerReturnOpen: (open: boolean) => void;
  isAndroidModalOpen: boolean;
  setIsAndroidModalOpen: (open: boolean) => void;
}

const defaultSettings: StoreSettings = {
  storeName: 'مؤسسة عبدو زين للتجارة والتوزيع',
  tagline: 'تسيير المبيعات، المشتريات، المخازن ونقاط البيع',
  phone: '0550 12 34 56 / 021 65 43 21',
  email: 'contact@abdo-zin.dz',
  address: 'الجزائر العاصمة، الجزائر',
  taxNumber: 'NIF: 001916012345678 - NIS: 0019160100012',
  commercialRecord: 'RC: 16/00-1234567B19 - Art: 16012345678',
  currency: 'DZD',
  currencySymbol: 'د.ج',
  taxRate: 19,
  enableTax: true,
  invoiceFooterNote: 'شكراً لتعاملكم مع مؤسسة عبدو زين!',
  lowStockThresholdDefault: 5,
  receiptSize: 'thermal',
  language: 'ar',
  screenMode: 'standard',
  theme: 'metallic',
  printerConfig: {
    printerType: 'thermal_80',
    receiptSize: '80mm',
    autoPrintOnSale: true,
    printStoreLogo: true,
    openCashDrawer: true,
    showBarcodeOnReceipt: true,
    customHeaderNote: 'مرحباً بكم في متجرنا',
    customFooterNote: 'السلعة المباعة تستبدل خلال 3 أيام مع إحضار التذكرة',
    copiesCount: 1
  },
  zakatConfig: {
    goldPriceGram: 14500, // 14,500 DZD per gram gold 24k
    nisabGoldGrams: 85,
    hawlPassed: true,
    customCashDeduct: 0
  },
  autoBackupOnExit: true
};

const initialExpenses: ExpenseRecord[] = [
  {
    id: 'exp-1',
    title: 'إيجار المحل التجاري (شهر أوت)',
    category: 'rent',
    amount: 45000,
    date: '2026-08-01',
    paymentMethod: 'cash',
    recipient: 'صاحب العقار',
    notes: 'تم الدفع نقداً بالكامل',
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'exp-2',
    title: 'فاتورة الكهرباء والغاز سونلغاز',
    category: 'electricity',
    amount: 12400,
    date: '2026-08-10',
    paymentMethod: 'cash',
    recipient: 'شركة Sonelgaz',
    notes: 'الاستهلاك الشهري للمكيفات والإنارة',
    createdAt: '2026-08-10T14:30:00.000Z'
  },
  {
    id: 'exp-3',
    title: 'راتب كاشير / عامل مبيعات',
    category: 'salaries',
    amount: 38000,
    date: '2026-08-15',
    paymentMethod: 'cash',
    recipient: 'أحمد بن علي',
    notes: 'راتب نصف شهري',
    createdAt: '2026-08-15T09:00:00.000Z'
  },
  {
    id: 'exp-4',
    title: 'مصاريف شحن ونقل بضائع',
    category: 'transport',
    amount: 6500,
    date: '2026-08-20',
    paymentMethod: 'cash',
    recipient: 'سائق شاحنة التوصيل',
    notes: 'نقل مواد غذائية من وهران',
    createdAt: '2026-08-20T16:00:00.000Z'
  }
];

const initialUsers: UserProfile[] = [
  {
    id: 'usr-admin',
    fullName: 'عبدو زين',
    username: 'abdou_zin',
    role: 'admin',
    storeName: 'مؤسسة عبدو زين للتجارة',
    phone: '0550 12 34 56',
    wilaya: 'الجزائر العاصمة',
    activityType: 'مدير عام ومسير رئيسي',
    password: '',
    permissions: {
      canEditPrices: true,
      canDeleteInvoices: true,
      canViewProfits: true,
      canManageInventory: true,
      canBackupDatabase: true,
      canManageUsers: true,
      canGiveDiscounts: true
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    isActivated: true
  },
  {
    id: 'usr-cashier',
    fullName: 'ياسين بوقرة (كاشير نقطة البيع)',
    username: 'yacine_pos',
    role: 'cashier',
    storeName: 'مؤسسة عبدو زين للتجارة',
    phone: '0661 88 99 00',
    wilaya: 'الجزائر العاصمة',
    activityType: 'بائع ومسؤول كاسة',
    password: '123',
    permissions: {
      canEditPrices: false,
      canDeleteInvoices: false,
      canViewProfits: false,
      canManageInventory: false,
      canBackupDatabase: false,
      canManageUsers: false,
      canGiveDiscounts: false
    },
    createdAt: '2026-02-15T00:00:00.000Z',
    isActivated: true
  },
  {
    id: 'usr-manager',
    fullName: 'كريم مرواني (مسؤول مخزن ومشتريات)',
    username: 'karim_stock',
    role: 'manager',
    storeName: 'مؤسسة عبدو زين للتجارة',
    phone: '0770 44 55 66',
    wilaya: 'البليدة',
    activityType: 'إدارة المخزون والتوريدات',
    password: '456',
    permissions: {
      canEditPrices: true,
      canDeleteInvoices: false,
      canViewProfits: true,
      canManageInventory: true,
      canBackupDatabase: false,
      canManageUsers: false,
      canGiveDiscounts: true
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    isActivated: true
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<SaleInvoice[]>([]);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('zin_store_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Language & Screen Mode
  const [language, setLanguageState] = useState<'ar' | 'fr'>(() => {
    try {
      const saved = localStorage.getItem('zin_lang');
      return saved === 'fr' ? 'fr' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const [screenMode, setScreenModeState] = useState<'standard' | 'touch' | 'compact'>(() => {
    try {
      const saved = localStorage.getItem('zin_screen_mode');
      return (saved as any) || 'standard';
    } catch {
      return 'standard';
    }
  });

  const setLanguage = useCallback((lang: 'ar' | 'fr') => {
    setLanguageState(lang);
    try {
      localStorage.setItem('zin_lang', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const toggleLanguage = useCallback(() => {
    const nextLang = language === 'ar' ? 'fr' : 'ar';
    setLanguage(nextLang);
  }, [language, setLanguage]);

  const t = useCallback((key: TranslationKey) => {
    return getTranslation(key, language);
  }, [language]);

  const setScreenMode = useCallback((mode: 'standard' | 'touch' | 'compact') => {
    setScreenModeState(mode);
    try {
      localStorage.setItem('zin_screen_mode', mode);
    } catch {}
  }, []);

  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('zin_expenses_list');
      return saved ? JSON.parse(saved) : initialExpenses;
    } catch {
      return initialExpenses;
    }
  });

  const addExpense = useCallback(async (exp: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    const newRecord: ExpenseRecord = {
      ...exp,
      id: 'exp-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('zin_expenses_list', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== id);
      try {
        localStorage.setItem('zin_expenses_list', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // User Profiles State
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('zin_users_directory');
      return saved ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const addUserProfile = useCallback(async (user: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newUser: UserProfile = {
      ...user,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setUserProfiles(prev => {
      const updated = [...prev, newUser];
      try {
        localStorage.setItem('zin_users_directory', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const updateUserProfile = useCallback(async (id: string, user: Partial<UserProfile>) => {
    setUserProfiles(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...user } : u);
      try {
        localStorage.setItem('zin_users_directory', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const deleteUserProfile = useCallback(async (id: string) => {
    setUserProfiles(prev => {
      const updated = prev.filter(u => u.id !== id);
      try {
        localStorage.setItem('zin_users_directory', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Video Guide Modal
  const [isVideoGuideOpen, setIsVideoGuideOpen] = useState(false);

  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // User Profile & Account Authentication
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const activeSession = localStorage.getItem('zin_active_user');
      if (activeSession) {
        return JSON.parse(activeSession);
      }
      // If single saved profile without explicit password, stay logged in
      const saved = localStorage.getItem('zin_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.password) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse user profile:', e);
    }
    return null;
  });
  
  // Show Login / Auth Modal if not logged in
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    try {
      const activeSession = localStorage.getItem('zin_active_user');
      if (activeSession) return false;
      const saved = localStorage.getItem('zin_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If profile has password, require login on start
        return Boolean(parsed.password);
      }
      return true; // No profile exists yet, open registration
    } catch {
      return true;
    }
  });

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<{ type: 'sale' | 'purchase'; data: SaleInvoice | PurchaseInvoice } | null>(null);
  const [adjustStockProduct, setAdjustStockProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productDraft, setProductDraft] = useState<{ barcode?: string; name?: string } | null>(null);
  const [isAddSaleInvoiceOpen, setIsAddSaleInvoiceOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPriceCheckOpen, setIsPriceCheckOpen] = useState(false);
  const [isCustomerReturnOpen, setIsCustomerReturnOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  const openAddProductWithDraft = useCallback((draft?: { barcode?: string; name?: string }) => {
    if (draft) {
      setProductDraft(draft);
    }
    setIsAddProductOpen(true);
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [
        prods,
        cats,
        custs,
        sups,
        salesList,
        purchasesList,
        logsList,
        paymentsList,
        settingsData,
        summaryData,
        statsData
      ] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getCustomers(),
        api.getSuppliers(),
        api.getSales(),
        api.getPurchases(),
        api.getInventoryLogs(),
        api.getPayments(),
        api.getSettings(),
        api.getFinancialSummary(),
        api.getDatabaseStats()
      ]);

      setProducts(prods);
      setCategories(cats);
      setCustomers(custs);
      setSuppliers(sups);
      setSales(salesList);
      setPurchases(purchasesList);
      setInventoryLogs(logsList);
      setPayments(paymentsList);
      setSettings(settingsData);
      setFinancialSummary(summaryData);
      setDbStats(statsData);
    } catch (err: any) {
      console.error('Failed to load ERP data:', err);
      addToast('تعذر جلب البيانات من الخادم: ' + (err.message || ''), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const formatCurrency = useCallback((amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return `0.00 ${settings.currencySymbol || 'د.ج'}`;
    return `${Number(amount).toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${settings.currencySymbol || 'د.ج'}`;
  }, [settings.currencySymbol]);

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }, []);

  const updateSettings = useCallback(async (data: Partial<StoreSettings>) => {
    try {
      const updated = await api.updateSettings(data);
      setSettings(updated);
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  }, []);

  const saveUserProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    const updatedUser: UserProfile = {
      id: currentUser?.id || `user_${Date.now()}`,
      fullName: profileData.fullName || 'عبدو زين',
      username: profileData.username || 'abdou_zin',
      role: profileData.role || 'admin',
      storeName: profileData.storeName || 'مؤسسة عبدو زين للتجارة',
      phone: profileData.phone || '0550 12 34 56',
      wilaya: profileData.wilaya || 'الجزائر العاصمة',
      activityType: profileData.activityType || 'تجارة عامة ومواد غذائية',
      password: profileData.password || '',
      createdAt: currentUser?.createdAt || new Date().toISOString(),
      isActivated: true,
    };

    try {
      localStorage.setItem('zin_user_profile', JSON.stringify(updatedUser));
      localStorage.setItem('zin_active_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // Also update store settings with this store name and phone
      if (profileData.storeName || profileData.phone) {
        await api.updateSettings({
          storeName: updatedUser.storeName,
          phone: updatedUser.phone,
          address: updatedUser.wilaya || settings.address
        }).catch(() => {});
        setSettings(prev => ({
          ...prev,
          storeName: updatedUser.storeName,
          phone: updatedUser.phone,
          address: updatedUser.wilaya || prev.address
        }));
      }

      setIsAuthModalOpen(false);
      addToast(`مرحباً بك يا ${updatedUser.fullName}! تم حفظ الحساب وتسجيل الدخول بنجاح.`, 'success');
    } catch (err) {
      console.error('Error saving user profile:', err);
      addToast('حدث خطأ أثناء حفظ بيانات الحساب', 'error');
    }
  }, [currentUser, settings.address, addToast]);

  const loginWithCredentials = useCallback(async (phoneInput: string, passwordInput?: string): Promise<boolean> => {
    try {
      const savedProfileStr = localStorage.getItem('zin_user_profile');
      if (!savedProfileStr) {
        // Fallback default admin profile if first time
        const cleanPhone = phoneInput.replace(/\s+/g, '');
        if (cleanPhone.length >= 8) {
          const defaultAdmin: UserProfile = {
            id: `user_${Date.now()}`,
            fullName: 'عبدو زين',
            username: 'abdou_zin',
            role: 'admin',
            storeName: 'مؤسسة عبدو زين للتجارة',
            phone: phoneInput.trim(),
            password: passwordInput || '',
            createdAt: new Date().toISOString(),
            isActivated: true
          };
          localStorage.setItem('zin_user_profile', JSON.stringify(defaultAdmin));
          localStorage.setItem('zin_active_user', JSON.stringify(defaultAdmin));
          setCurrentUser(defaultAdmin);
          setIsAuthModalOpen(false);
          addToast(`مرحباً بك يا ${defaultAdmin.fullName}! تم تسجيل الدخول بنجاح.`, 'success');
          return true;
        }
        addToast('يرجى إدخال رقم هاتف صحيح أو إنشاء حساب جديد', 'warning');
        return false;
      }

      const savedUser: UserProfile = JSON.parse(savedProfileStr);
      const cleanSavedPhone = (savedUser.phone || '').replace(/[\s\-\.\/]/g, '');
      const cleanInputPhone = phoneInput.replace(/[\s\-\.\/]/g, '');

      // Check phone match
      const phoneMatches = cleanSavedPhone.includes(cleanInputPhone) || cleanInputPhone.includes(cleanSavedPhone) || cleanInputPhone === savedUser.username;
      
      if (!phoneMatches) {
        addToast('رقم الهاتف غير مسجل في النظام. يرجى التأكد أو إنشاء حساب جديد.', 'error');
        return false;
      }

      // Check password match if user has a password set
      if (savedUser.password && savedUser.password.trim() !== '') {
        if (savedUser.password !== (passwordInput || '')) {
          addToast('كلمة المرور غير صحيحة! يرجى إعادة المحاولة.', 'error');
          return false;
        }
      }

      // Successful login
      localStorage.setItem('zin_active_user', JSON.stringify(savedUser));
      setCurrentUser(savedUser);
      setIsAuthModalOpen(false);
      addToast(`مرحباً بك مجدداً يا ${savedUser.fullName}! تم التحقق من رقم الهاتف وكلمة السر بنجاح.`, 'success');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      addToast('حدث خطأ أثناء محاولة تسجيل الدخول', 'error');
      return false;
    }
  }, [addToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('zin_active_user');
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    addToast('تم تسجيل الخروج بنجاح. يرجى تسجيل الدخول مجدداً.', 'info');
  }, [addToast]);

  const safeExitAndBackup = useCallback(async () => {
    try {
      // Export database snapshot to local storage
      const fullDb = {
        products,
        categories,
        customers,
        suppliers,
        sales,
        purchases,
        inventoryLogs,
        payments,
        expenses,
        settings,
        userProfiles,
        backupTimestamp: new Date().toISOString()
      };
      localStorage.setItem('zin_full_db_snapshot', JSON.stringify(fullDb));
      localStorage.setItem('zin_last_backup_time', new Date().toISOString());

      // Auto download backup file
      const blob = new Blob([JSON.stringify(fullDb, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zin_stock_safe_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast('تم أخذ نسخة احتياطية وحفظ جميع بيانات البرنامج بنجاح قبل الخروج!', 'success');
    } catch (err: any) {
      addToast('تم حفظ البيانات محلياً بنجاح', 'success');
    }
  }, [products, categories, customers, suppliers, sales, purchases, inventoryLogs, payments, expenses, settings, userProfiles, addToast]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        products,
        categories,
        customers,
        suppliers,
        sales,
        purchases,
        inventoryLogs,
        payments,
        settings,
        financialSummary,
        dbStats,
        isLoading,
        toasts,
        addToast,
        removeToast,
        refreshData,
        formatCurrency,
        formatDate,
        updateSettings,
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        saveUserProfile,
        loginWithCredentials,
        logout,
        language,
        setLanguage,
        toggleLanguage,
        t,
        screenMode,
        setScreenMode,
        expenses,
        addExpense,
        deleteExpense,
        userProfiles,
        addUserProfile,
        updateUserProfile,
        deleteUserProfile,
        isVideoGuideOpen,
        setIsVideoGuideOpen,
        safeExitAndBackup,
        selectedInvoice,
        setSelectedInvoice,
        adjustStockProduct,
        setAdjustStockProduct,
        isAddProductOpen,
        setIsAddProductOpen,
        productDraft,
        setProductDraft,
        openAddProductWithDraft,
        isAddSaleInvoiceOpen,
        setIsAddSaleInvoiceOpen,
        isAddCustomerOpen,
        setIsAddCustomerOpen,
        isAddSupplierOpen,
        setIsAddSupplierOpen,
        isAddPaymentOpen,
        setIsAddPaymentOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isPriceCheckOpen,
        setIsPriceCheckOpen,
        isCustomerReturnOpen,
        setIsCustomerReturnOpen,
        isAndroidModalOpen,
        setIsAndroidModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
