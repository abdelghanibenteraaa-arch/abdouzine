import fs from 'fs';
import path from 'path';
import {
  Category,
  Product,
  Customer,
  Supplier,
  SaleInvoice,
  PurchaseInvoice,
  InventoryLog,
  PaymentRecord,
  StoreSettings,
  FinancialSummary,
  DatabaseStats
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'erp_database.json');

export interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales_invoices: SaleInvoice[];
  purchase_invoices: PurchaseInvoice[];
  inventory_logs: InventoryLog[];
  payments: PaymentRecord[];
  settings: StoreSettings;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'مؤسسة عبدو زين للتجارة والتوزيع',
  tagline: 'تسيير المبيعات، المشتريات، المخازن ونقاط البيع',
  phone: '0550 12 34 56 / 021 65 43 21',
  email: 'contact@abdo-zin.dz',
  address: 'الجزائر العاصمة - باب الزوار / شارع ديدوش مراد',
  taxNumber: 'NIF: 001916012345678 - NIS: 0019160100012',
  commercialRecord: 'RC: 16/00-1234567B19 - Art: 16012345678',
  currency: 'DZD',
  currencySymbol: 'د.ج',
  taxRate: 19,
  enableTax: true,
  invoiceFooterNote: 'شكراً لتعاملكم مع مؤسسة عبدو زين! البضاعة المباعة ترد أو تستبدل خلال 7 أيام بموجب الفاتورة الأصلية.',
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
    goldPriceGram: 14500,
    nisabGoldGrams: 85,
    hawlPassed: true,
    customCashDeduct: 0
  },
  autoBackupOnExit: true
};

const SEED_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'أجهزة وإلكترونيات وهواتف', description: 'الهواتف، الحواسيب وملحقاتها والكاميرات', color: '#2563eb', icon: 'Laptop', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'cat-2', name: 'مواد غذائية وتغذية عامة', description: 'السلع الاستهلاكية، الزيوت والمشروبات', color: '#16a34a', icon: 'ShoppingBag', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'cat-3', name: 'كهرومنزلية وأدوات المنزل', description: 'تجهيزات ومعدات كهربائية ومنزلية', color: '#d97706', icon: 'Home', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'cat-4', name: 'قطع غيار ولوازم ميكانيكية', description: 'أدوات الصيانة والمفكات واللوازم', color: '#7c3aed', icon: 'Wrench', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'cat-5', name: 'أدوات مكتبية وقرطاسية', description: 'أوراق الطباعة ومستلزمات المكاتب', color: '#db2777', icon: 'FileText', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
];

const SEED_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'مؤسسة الهضاب للتوزيع (سطيف)', phone: '0555 12 34 56', email: 'elhidhab@example.dz', address: 'حي الباز، سطيف', taxNumber: 'NIF: 099819001234567', totalPurchases: 185000, currentDebt: 24000, creditLimit: 100000, notes: 'عميل جملة معتمد - سداد شهري', createdAt: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: 'cust-2', name: 'شركة الباهية للتجهيزات (وهران)', phone: '0560 99 88 77', email: 'bahia.equip@example.dz', address: 'طريق المطار، السانية، وهران', taxNumber: 'NIF: 099531007654321', totalPurchases: 320000, currentDebt: 0, creditLimit: 250000, notes: 'دفع فوري نقدي أو شيك بنكي', createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 'cust-3', name: 'عبد الرزاق بلقاسم (قسنطينة)', phone: '0541 33 22 11', email: 'belkacem.a@example.dz', address: 'المنطقة الصناعية، قسنطينة', totalPurchases: 42000, currentDebt: 6500, creditLimit: 30000, notes: 'عميل نصف جملة وتجزئة', createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 'cust-4', name: 'مريم بن عيسى (الجزائر العاصمة)', phone: '0552 77 88 99', email: 'meriem.b@example.dz', address: 'حيدرة، الجزائر العاصمة', totalPurchases: 18000, currentDebt: 0, creditLimit: 15000, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'cust-5', name: 'عميل نقدي عام (تجزئة - كاشير)', phone: '0500 00 00 00', email: '', address: 'المحل المركزي - عبدو زين', totalPurchases: 650000, currentDebt: 0, notes: 'المبيعات اليومية المباشرة للزبائن', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
];

const SEED_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'شركة سيفيتال للصناعات الغذائية (Cevital)', company: 'مجمع سيفيتال الجزائر', phone: '034 21 11 00', email: 'commandes@cevital.dz', address: 'المنطقة الصناعية، بجاية', taxNumber: 'NIF: 000006001234567', totalOrders: 750000, currentDebt: 55000, notes: 'المورد الرئيسي للزيوت والسكر والمواد الغذائية', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'sup-2', name: 'شركة كوندور للإلكترونيات (Condor Electronics)', company: 'مجمع كوندور الجزائر', phone: '035 68 22 33', email: 'distrib@condor.dz', address: 'برج بوعريريج، الجزائر', taxNumber: 'NIF: 000234007766554', totalOrders: 420000, currentDebt: 0, notes: 'الأجهزة الإلكترونية والكهرومنزلية والشاشات', createdAt: new Date(Date.now() - 28 * 86400000).toISOString() },
  { id: 'sup-3', name: 'مؤسسة المغرب العربي للورق والطباعة', company: 'المغرب العربي للقرطاسية', phone: '025 41 88 77', email: 'maghreb.paper@example.dz', address: 'البليدة، الجزائر', taxNumber: 'NIF: 000345005544332', totalOrders: 184000, currentDebt: 12000, notes: 'توريد دوري لأوراق الطباعة A4 واللوازم', createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'ZIN-ELEC-01',
    barcode: '6131001000018',
    name: 'شاشة كوندور 32 بوصة LED HD',
    description: 'شاشة تلفزيون وعرض عالية الوضوح مع منافذ HDMI/USB',
    categoryId: 'cat-1',
    categoryName: 'أجهزة وإلكترونيات وهواتف',
    costPrice: 16500,
    sellPrice: 21900,
    currentStock: 18,
    minStockAlert: 5,
    unit: 'قطعة',
    location: 'مستودع A - رف 3',
    isActive: true,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    sku: 'ZIN-ELEC-02',
    barcode: '6131001000025',
    name: 'لوحة مفاتيح وماوس لاسلكي احترافي USB',
    description: 'لوحة مفاتيح عربية/فرنسية مع ماوس بصري سريع الاستجابة',
    categoryId: 'cat-1',
    categoryName: 'أجهزة وإلكترونيات وهواتف',
    costPrice: 2200,
    sellPrice: 3400,
    currentStock: 25,
    minStockAlert: 8,
    unit: 'قطعة',
    location: 'مستودع A - رف 4',
    isActive: true,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    sku: 'ZIN-ELEC-03',
    barcode: '6131001000032',
    name: 'قارئ باركود ليزري أوتوماتيكي USB (Code-barres Scanner)',
    description: 'ماسح ضوئي عالي السرعة متوافق مع كافة أنظمة نقاط البيع',
    categoryId: 'cat-1',
    categoryName: 'أجهزة وإلكترونيات وهواتف',
    costPrice: 4800,
    sellPrice: 6900,
    currentStock: 4, // Low stock trigger
    minStockAlert: 6,
    unit: 'قطعة',
    location: 'مستودع A - رف 1',
    isActive: true,
    createdAt: new Date(Date.now() - 24 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    sku: 'ZIN-FOOD-01',
    barcode: '6132001000017',
    name: 'زيت المائدة عافية / إلـيو 5 لتر (Elio 5L)',
    description: 'زيت نباتي صافي عالي الجودة للطبخ والقلي',
    categoryId: 'cat-2',
    categoryName: 'مواد غذائية وتغذية عامة',
    costPrice: 600,
    sellPrice: 650,
    currentStock: 45,
    minStockAlert: 10,
    unit: 'صفيحة',
    expiryDate: '2027-12-31',
    location: 'مستودع B - رواق المواد الغذائية',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    sku: 'ZIN-FOOD-02',
    barcode: '6132001000024',
    name: 'علبة قهوة فاميليا / أروما جزائرية 250 غ (Café)',
    description: 'بن محمص ومطحون ذو نكهة قوية وجودة ممتازة',
    categoryId: 'cat-2',
    categoryName: 'مواد غذائية وتغذية عامة',
    costPrice: 220,
    sellPrice: 280,
    currentStock: 3, // Low stock
    minStockAlert: 10,
    unit: 'علبة',
    expiryDate: '2028-06-30',
    location: 'مستودع B - رف القهوة',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    sku: 'ZIN-TOOL-01',
    barcode: '6133001000016',
    name: 'طقم مفاتيح وبراغي احترافي 48 قطعة (Boîte Outils)',
    description: 'فولاذ كروم صلب مقاوم للصدأ مع حقيبة حمل متينة',
    categoryId: 'cat-4',
    categoryName: 'قطع غيار ولوازم ميكانيكية',
    costPrice: 3200,
    sellPrice: 4600,
    currentStock: 40,
    minStockAlert: 10,
    unit: 'طقم',
    location: 'مستودع C - رف 1',
    isActive: true,
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    sku: 'ZIN-PAP-01',
    barcode: '6135001000014',
    name: 'كرتون ورق طباعة A4 دبل إيه Double A 80g (5 رزم)',
    description: 'ورق أبيض عالي الكثافة لطباعة الفواتير والتقارير',
    categoryId: 'cat-5',
    categoryName: 'أدوات مكتبية وقرطاسية',
    costPrice: 3100,
    sellPrice: 3800,
    currentStock: 60,
    minStockAlert: 15,
    unit: 'كرتون',
    location: 'مستودع C - رف 5',
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    sku: 'ZIN-TOOL-02',
    barcode: '6131001000049',
    name: 'طابعة فواتير وملصقات حرارية 80mm USB/LAN',
    description: 'طابعة إيصالات سريعة مع قاطع أوتوماتيكي متوافقة مع نقاط البيع',
    categoryId: 'cat-1',
    categoryName: 'أجهزة وإلكترونيات وهواتف',
    costPrice: 12500,
    sellPrice: 16800,
    currentStock: 12,
    minStockAlert: 4,
    unit: 'قطعة',
    location: 'مستودع A - رف 2',
    isActive: true,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_SALES: SaleInvoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'FAC-2026-001',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    customerId: 'cust-1',
    customerName: 'مؤسسة الهضاب للتوزيع (سطيف)',
    customerPhone: '0555 12 34 56',
    items: [
      {
        id: 'si-1',
        productId: 'prod-1',
        productName: 'شاشة كوندور 32 بوصة LED HD',
        sku: 'ZIN-ELEC-01',
        barcode: '6131001000018',
        quantity: 2,
        unitPrice: 21900,
        costPrice: 16500,
        discount: 0,
        total: 43800,
        profit: (21900 - 16500) * 2,
      },
      {
        id: 'si-2',
        productId: 'prod-2',
        productName: 'لوحة مفاتيح وماوس لاسلكي احترافي USB',
        sku: 'ZIN-ELEC-02',
        barcode: '6131001000025',
        quantity: 2,
        unitPrice: 3400,
        costPrice: 2200,
        discount: 0,
        total: 6800,
        profit: (3400 - 2200) * 2,
      },
    ],
    subtotal: 50600,
    taxRate: 19,
    taxAmount: 9614,
    discountAmount: 0,
    totalAmount: 60214,
    paidAmount: 60214,
    remainingAmount: 0,
    paymentType: 'card',
    status: 'completed',
    cashierName: 'عبدو زين',
    notes: 'تم الدفع بالبطاقة الذهبية / CIB',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'FAC-2026-002',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    customerId: 'cust-3',
    customerName: 'عبد الرزاق بلقاسم (قسنطينة)',
    customerPhone: '0541 33 22 11',
    items: [
      {
        id: 'si-3',
        productId: 'prod-4',
        productName: 'زيت المائدة عافية / إلـيو 5 لتر (Elio 5L)',
        sku: 'ZIN-FOOD-01',
        barcode: '6132001000017',
        quantity: 10,
        unitPrice: 650,
        costPrice: 600,
        discount: 100,
        total: 6400,
        profit: 6400 - 600 * 10,
      },
    ],
    subtotal: 6400,
    taxRate: 19,
    taxAmount: 1216,
    discountAmount: 100,
    totalAmount: 7616,
    paidAmount: 1116,
    remainingAmount: 6500,
    paymentType: 'credit',
    status: 'completed',
    cashierName: 'عبدو زين',
    notes: 'دفعة أولى 1,116 د.ج والمتبقي 6,500 د.ج آجل (Crédit)',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'inv-1003',
    invoiceNumber: 'FAC-2026-003',
    date: new Date().toISOString().split('T')[0],
    customerId: 'cust-5',
    customerName: 'عميل نقدي عام (تجزئة - كاشير)',
    customerPhone: '0500 00 00 00',
    items: [
      {
        id: 'si-4',
        productId: 'prod-7',
        productName: 'كرتون ورق طباعة A4 دبل إيه Double A 80g (5 رزم)',
        sku: 'ZIN-PAP-01',
        barcode: '6135001000014',
        quantity: 1,
        unitPrice: 3800,
        costPrice: 3100,
        discount: 0,
        total: 3800,
        profit: 3800 - 3100,
      },
      {
        id: 'si-5',
        productId: 'prod-6',
        productName: 'طقم مفاتيح وبراغي احترافي 48 قطعة (Boîte Outils)',
        sku: 'ZIN-TOOL-01',
        barcode: '6133001000016',
        quantity: 1,
        unitPrice: 4600,
        costPrice: 3200,
        discount: 0,
        total: 4600,
        profit: 4600 - 3200,
      },
    ],
    subtotal: 8400,
    taxRate: 19,
    taxAmount: 1596,
    discountAmount: 0,
    totalAmount: 9996,
    paidAmount: 9996,
    remainingAmount: 0,
    paymentType: 'cash',
    status: 'completed',
    cashierName: 'كاشير عبدو زين',
    notes: 'مبيعات نقدية فورية (Espèces)',
    createdAt: new Date().toISOString(),
  },
];

const SEED_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'pur-1001',
    invoiceNumber: 'BL-2026-001',
    date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    supplierId: 'sup-2',
    supplierName: 'شركة كوندور للإلكترونيات (Condor Electronics)',
    items: [
      {
        id: 'pi-1',
        productId: 'prod-1',
        productName: 'شاشة كوندور 32 بوصة LED HD',
        sku: 'ZIN-ELEC-01',
        quantity: 20,
        unitCost: 16500,
        total: 330000,
      },
      {
        id: 'pi-2',
        productId: 'prod-2',
        productName: 'لوحة مفاتيح وماوس لاسلكي احترافي USB',
        sku: 'ZIN-ELEC-02',
        quantity: 30,
        unitCost: 2200,
        total: 66000,
      },
    ],
    subtotal: 396000,
    taxRate: 19,
    taxAmount: 75240,
    discountAmount: 0,
    totalAmount: 471240,
    paidAmount: 471240,
    remainingAmount: 0,
    paymentType: 'bank_transfer',
    status: 'completed',
    notes: 'توريد شحنة إلكترونيات كوندور من البرج',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'pur-1002',
    invoiceNumber: 'BL-2026-002',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    supplierId: 'sup-1',
    supplierName: 'شركة سيفيتال للصناعات الغذائية (Cevital)',
    items: [
      {
        id: 'pi-3',
        productId: 'prod-4',
        productName: 'زيت المائدة عافية / إلـيو 5 لتر (Elio 5L)',
        sku: 'ZIN-FOOD-01',
        quantity: 50,
        unitCost: 600,
        total: 30000,
      },
    ],
    subtotal: 30000,
    taxRate: 19,
    taxAmount: 5700,
    discountAmount: 700,
    totalAmount: 35000,
    paidAmount: 35000,
    remainingAmount: 0,
    paymentType: 'bank_transfer',
    status: 'completed',
    notes: 'سداد فوري مع خصم سيفيتال',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const SEED_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: 'log-1',
    productId: 'prod-1',
    productName: 'شاشة كوندور 32 بوصة LED HD',
    sku: 'ZIN-ELEC-01',
    type: 'purchase',
    quantityChange: 20,
    previousStock: 0,
    newStock: 20,
    referenceId: 'pur-1001',
    referenceType: 'purchase_invoice',
    reason: 'توريد فاتورة مشتريات BL-2026-001 من كوندور',
    date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'log-2',
    productId: 'prod-1',
    productName: 'شاشة كوندور 32 بوصة LED HD',
    sku: 'ZIN-ELEC-01',
    type: 'sale',
    quantityChange: -2,
    previousStock: 20,
    newStock: 18,
    referenceId: 'inv-1001',
    referenceType: 'sale_invoice',
    reason: 'مبيعات فاتورة FAC-2026-001 لمؤسسة الهضاب',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'log-3',
    productId: 'prod-5',
    productName: 'علبة قهوة فاميليا / أروما جزائرية 250 غ (Café)',
    sku: 'ZIN-FOOD-02',
    type: 'adjustment_out',
    quantityChange: -1,
    previousStock: 4,
    newStock: 3,
    referenceType: 'manual_adjustment',
    reason: 'تسوية مخزنية: علبة قهوة تالفة أثناء التفريغ',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    type: 'customer_receipt',
    partyId: 'cust-1',
    partyName: 'مؤسسة الهضاب للتوزيع (سطيف)',
    amount: 50000,
    paymentMethod: 'bank_transfer',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    notes: 'سداد دفعة من الحساب الجاري عبر شيك CCP / بنكي',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'pay-2',
    type: 'supplier_payment',
    partyId: 'sup-2',
    partyName: 'شركة كوندور للإلكترونيات (Condor Electronics)',
    amount: 100000,
    paymentMethod: 'bank_transfer',
    date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    notes: 'دفعة مستحقات توريد إلكترونيات عبر تحويل بنكي BNA',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

class ErpDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all keys exist
        return {
          categories: parsed.categories || SEED_CATEGORIES,
          products: parsed.products || SEED_PRODUCTS,
          customers: parsed.customers || SEED_CUSTOMERS,
          suppliers: parsed.suppliers || SEED_SUPPLIERS,
          sales_invoices: parsed.sales_invoices || SEED_SALES,
          purchase_invoices: parsed.purchase_invoices || SEED_PURCHASES,
          inventory_logs: parsed.inventory_logs || SEED_INVENTORY_LOGS,
          payments: parsed.payments || SEED_PAYMENTS,
          settings: parsed.settings || DEFAULT_SETTINGS,
        };
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
    }

    const initialData: DatabaseSchema = {
      categories: SEED_CATEGORIES,
      products: SEED_PRODUCTS,
      customers: SEED_CUSTOMERS,
      suppliers: SEED_SUPPLIERS,
      sales_invoices: SEED_SALES,
      purchase_invoices: SEED_PURCHASES,
      inventory_logs: SEED_INVENTORY_LOGS,
      payments: SEED_PAYMENTS,
      settings: DEFAULT_SETTINGS,
    };

    this.saveDatabase(initialData);
    return initialData;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const payload = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  // --- Settings ---
  getSettings(): StoreSettings {
    return this.data.settings || DEFAULT_SETTINGS;
  }

  updateSettings(newSettings: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveDatabase();
    return this.data.settings;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.data.categories;
  }

  addCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
    const newCat: Category = {
      ...category,
      id: 'cat-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.data.categories.push(newCat);
    this.saveDatabase();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.categories[index] = { ...this.data.categories[index], ...updates };
    this.saveDatabase();
    return this.data.categories[index];
  }

  deleteCategory(id: string): boolean {
    const before = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveDatabase();
    return this.data.categories.length !== before;
  }

  // --- Products ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.barcode === id || p.sku === id);
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const category = this.data.categories.find(c => c.id === product.categoryId);
    const newProd: Product = {
      ...product,
      id: 'prod-' + Date.now(),
      categoryName: category ? category.name : product.categoryName || '',
      currentStock: Number(product.currentStock) || 0,
      costPrice: Number(product.costPrice) || 0,
      sellPrice: Number(product.sellPrice) || 0,
      minStockAlert: Number(product.minStockAlert) || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.push(newProd);

    // Initial stock log if > 0
    if (newProd.currentStock > 0) {
      this.data.inventory_logs.push({
        id: 'log-' + Date.now(),
        productId: newProd.id,
        productName: newProd.name,
        sku: newProd.sku,
        type: 'adjustment_in',
        quantityChange: newProd.currentStock,
        previousStock: 0,
        newStock: newProd.currentStock,
        referenceType: 'manual_adjustment',
        reason: 'رصيد افتتاحي للمنتج عند الإضافة',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
    }

    this.saveDatabase();
    return newProd;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    if (updates.categoryId) {
      const category = this.data.categories.find(c => c.id === updates.categoryId);
      if (category) updates.categoryName = category.name;
    }

    this.data.products[index] = {
      ...this.data.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.products[index];
  }

  adjustProductStock(id: string, newStock: number, reason: string): Product | null {
    const prod = this.data.products.find(p => p.id === id);
    if (!prod) return null;

    const previousStock = prod.currentStock;
    const diff = newStock - previousStock;
    if (diff === 0) return prod;

    prod.currentStock = newStock;
    prod.updatedAt = new Date().toISOString();

    this.data.inventory_logs.push({
      id: 'log-' + Date.now(),
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      type: diff > 0 ? 'adjustment_in' : 'adjustment_out',
      quantityChange: diff,
      previousStock,
      newStock,
      referenceType: 'manual_adjustment',
      reason: reason || 'تسوية جردية يدوية',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });

    this.saveDatabase();
    return prod;
  }

  deleteProduct(id: string): boolean {
    const before = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.saveDatabase();
    return this.data.products.length !== before;
  }

  // --- Customers ---
  getCustomers(): Customer[] {
    return this.data.customers;
  }

  addCustomer(customer: Omit<Customer, 'id' | 'totalPurchases' | 'currentDebt' | 'createdAt'>): Customer {
    const newCust: Customer = {
      ...customer,
      id: 'cust-' + Date.now(),
      totalPurchases: 0,
      currentDebt: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.customers.push(newCust);
    this.saveDatabase();
    return newCust;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.customers[index] = { ...this.data.customers[index], ...updates };
    this.saveDatabase();
    return this.data.customers[index];
  }

  deleteCustomer(id: string): boolean {
    const before = this.data.customers.length;
    this.data.customers = this.data.customers.filter(c => c.id !== id);
    this.saveDatabase();
    return this.data.customers.length !== before;
  }

  // --- Suppliers ---
  getSuppliers(): Supplier[] {
    return this.data.suppliers;
  }

  addSupplier(supplier: Omit<Supplier, 'id' | 'totalOrders' | 'currentDebt' | 'createdAt'>): Supplier {
    const newSup: Supplier = {
      ...supplier,
      id: 'sup-' + Date.now(),
      totalOrders: 0,
      currentDebt: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.suppliers.push(newSup);
    this.saveDatabase();
    return newSup;
  }

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const index = this.data.suppliers.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.suppliers[index] = { ...this.data.suppliers[index], ...updates };
    this.saveDatabase();
    return this.data.suppliers[index];
  }

  deleteSupplier(id: string): boolean {
    const before = this.data.suppliers.length;
    this.data.suppliers = this.data.suppliers.filter(s => s.id !== id);
    this.saveDatabase();
    return this.data.suppliers.length !== before;
  }

  // --- Sales ---
  getSales(): SaleInvoice[] {
    return this.data.sales_invoices;
  }

  createSale(saleData: Omit<SaleInvoice, 'id' | 'invoiceNumber' | 'createdAt'>): SaleInvoice {
    const count = this.data.sales_invoices.length + 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    const invoiceId = 'inv-' + Date.now();

    const invoice: SaleInvoice = {
      ...saleData,
      id: invoiceId,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    // 1. Deduct Stock & Create Inventory Logs
    for (const item of invoice.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        const prevStock = prod.currentStock;
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        prod.updatedAt = new Date().toISOString();

        this.data.inventory_logs.push({
          id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'sale',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: prod.currentStock,
          referenceId: invoice.id,
          referenceType: 'sale_invoice',
          reason: `فاتورة بيع ${invoiceNumber} للعميل ${invoice.customerName}`,
          date: invoice.date,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 2. Update Customer Totals & Debt
    const customer = this.data.customers.find(c => c.id === invoice.customerId);
    if (customer) {
      customer.totalPurchases += invoice.totalAmount;
      if (invoice.remainingAmount > 0) {
        customer.currentDebt += invoice.remainingAmount;
      }
    }

    this.data.sales_invoices.unshift(invoice);
    this.saveDatabase();
    return invoice;
  }

  // --- Purchases ---
  getPurchases(): PurchaseInvoice[] {
    return this.data.purchase_invoices;
  }

  createPurchase(purchaseData: Omit<PurchaseInvoice, 'id' | 'invoiceNumber' | 'createdAt'>): PurchaseInvoice {
    const count = this.data.purchase_invoices.length + 1;
    const invoiceNumber = `PUR-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    const invoiceId = 'pur-' + Date.now();

    const invoice: PurchaseInvoice = {
      ...purchaseData,
      id: invoiceId,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    // 1. Add Stock & Update Cost Price if needed
    for (const item of invoice.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        const prevStock = prod.currentStock;
        prod.currentStock += item.quantity;
        if (item.unitCost > 0) {
          prod.costPrice = item.unitCost;
        }
        prod.updatedAt = new Date().toISOString();

        this.data.inventory_logs.push({
          id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'purchase',
          quantityChange: item.quantity,
          previousStock: prevStock,
          newStock: prod.currentStock,
          referenceId: invoice.id,
          referenceType: 'purchase_invoice',
          reason: `فاتورة مشتريات ${invoiceNumber} من المورد ${invoice.supplierName}`,
          date: invoice.date,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 2. Update Supplier Totals & Debt
    const supplier = this.data.suppliers.find(s => s.id === invoice.supplierId);
    if (supplier) {
      supplier.totalOrders += invoice.totalAmount;
      if (invoice.remainingAmount > 0) {
        supplier.currentDebt += invoice.remainingAmount;
      }
    }

    this.data.purchase_invoices.unshift(invoice);
    this.saveDatabase();
    return invoice;
  }

  // --- Payments (Vouchers) ---
  getPayments(): PaymentRecord[] {
    return this.data.payments;
  }

  createPayment(payment: Omit<PaymentRecord, 'id' | 'createdAt'>): PaymentRecord {
    const newPay: PaymentRecord = {
      ...payment,
      id: 'pay-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    if (newPay.type === 'customer_receipt') {
      const cust = this.data.customers.find(c => c.id === newPay.partyId);
      if (cust) {
        cust.currentDebt = Math.max(0, cust.currentDebt - newPay.amount);
      }
    } else if (newPay.type === 'supplier_payment') {
      const sup = this.data.suppliers.find(s => s.id === newPay.partyId);
      if (sup) {
        sup.currentDebt = Math.max(0, sup.currentDebt - newPay.amount);
      }
    }

    this.data.payments.unshift(newPay);
    this.saveDatabase();
    return newPay;
  }

  // --- Inventory Logs ---
  getInventoryLogs(): InventoryLog[] {
    return this.data.inventory_logs;
  }

  // --- Financial Summary ---
  getFinancialSummary(): FinancialSummary {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    let todaySales = 0;
    let monthSales = 0;
    let totalSales = 0;
    let netProfit = 0;

    for (const sale of this.data.sales_invoices) {
      if (sale.status !== 'cancelled') {
        totalSales += sale.totalAmount;
        if (sale.date === today) todaySales += sale.totalAmount;
        if (sale.date.startsWith(currentMonth)) monthSales += sale.totalAmount;

        // calculate profit
        for (const itm of sale.items) {
          netProfit += itm.profit || ((itm.unitPrice - itm.costPrice) * itm.quantity - itm.discount);
        }
      }
    }

    let todayPurchases = 0;
    let monthPurchases = 0;
    let totalPurchases = 0;

    for (const pur of this.data.purchase_invoices) {
      if (pur.status !== 'cancelled') {
        totalPurchases += pur.totalAmount;
        if (pur.date === today) todayPurchases += pur.totalAmount;
        if (pur.date.startsWith(currentMonth)) monthPurchases += pur.totalAmount;
      }
    }

    let inventoryCost = 0;
    let inventoryRetail = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const prod of this.data.products) {
      if (prod.isActive) {
        inventoryCost += prod.currentStock * prod.costPrice;
        inventoryRetail += prod.currentStock * prod.sellPrice;
        if (prod.currentStock <= 0) outOfStock++;
        else if (prod.currentStock <= prod.minStockAlert) lowStock++;
      }
    }

    const totalReceivables = this.data.customers.reduce((sum, c) => sum + (c.currentDebt || 0), 0);
    const totalPayables = this.data.suppliers.reduce((sum, s) => sum + (s.currentDebt || 0), 0);

    return {
      todaySales,
      monthSales,
      totalSales,
      todayPurchases,
      monthPurchases,
      totalPurchases,
      netProfit,
      inventoryTotalCostValue: inventoryCost,
      inventoryTotalRetailValue: inventoryRetail,
      totalReceivables,
      totalPayables,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      totalProductsCount: this.data.products.length,
      salesCount: this.data.sales_invoices.length,
      purchasesCount: this.data.purchase_invoices.length,
    };
  }

  // --- Database Stats & Explorer ---
  getDatabaseStats(): DatabaseStats {
    let fileSizeBytes = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        fileSizeBytes = fs.statSync(DB_FILE).size;
      }
    } catch {
      fileSizeBytes = 0;
    }

    const tables = [
      { name: 'products', label: 'المنتجات والأصناف', count: this.data.products.length },
      { name: 'categories', label: 'التصنيفات والأقسام', count: this.data.categories.length },
      { name: 'sales_invoices', label: 'فواتير المبيعات', count: this.data.sales_invoices.length },
      { name: 'purchase_invoices', label: 'فواتير المشتريات', count: this.data.purchase_invoices.length },
      { name: 'inventory_logs', label: 'سجلات حركة المخزون', count: this.data.inventory_logs.length },
      { name: 'customers', label: 'العملاء والمدينون', count: this.data.customers.length },
      { name: 'suppliers', label: 'الموردون والدائنون', count: this.data.suppliers.length },
      { name: 'payments', label: 'سندات القبض والصرف', count: this.data.payments.length },
    ];

    const totalRecords = tables.reduce((acc, t) => acc + t.count, 0);

    return {
      totalTables: tables.length,
      totalRecords,
      fileSizeBytes,
      tables,
    };
  }

  getTableData(tableName: keyof DatabaseSchema): any[] {
    const table = this.data[tableName];
    if (Array.isArray(table)) return table;
    return [table];
  }

  getRawBackup(): DatabaseSchema {
    return this.data;
  }

  restoreDatabase(backup: DatabaseSchema): boolean {
    if (!backup || typeof backup !== 'object') return false;
    this.data = {
      categories: Array.isArray(backup.categories) ? backup.categories : SEED_CATEGORIES,
      products: Array.isArray(backup.products) ? backup.products : SEED_PRODUCTS,
      customers: Array.isArray(backup.customers) ? backup.customers : SEED_CUSTOMERS,
      suppliers: Array.isArray(backup.suppliers) ? backup.suppliers : SEED_SUPPLIERS,
      sales_invoices: Array.isArray(backup.sales_invoices) ? backup.sales_invoices : SEED_SALES,
      purchase_invoices: Array.isArray(backup.purchase_invoices) ? backup.purchase_invoices : SEED_PURCHASES,
      inventory_logs: Array.isArray(backup.inventory_logs) ? backup.inventory_logs : SEED_INVENTORY_LOGS,
      payments: Array.isArray(backup.payments) ? backup.payments : SEED_PAYMENTS,
      settings: backup.settings || DEFAULT_SETTINGS,
    };
    this.saveDatabase();
    return true;
  }

  resetToSeed(): boolean {
    this.data = {
      categories: SEED_CATEGORIES,
      products: SEED_PRODUCTS,
      customers: SEED_CUSTOMERS,
      suppliers: SEED_SUPPLIERS,
      sales_invoices: SEED_SALES,
      purchase_invoices: SEED_PURCHASES,
      inventory_logs: SEED_INVENTORY_LOGS,
      payments: SEED_PAYMENTS,
      settings: DEFAULT_SETTINGS,
    };
    this.saveDatabase();
    return true;
  }
}

export const db = new ErpDatabase();
