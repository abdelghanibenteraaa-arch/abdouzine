export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  barcodes?: string[];
  name: string;
  nameFr?: string;
  codeRef?: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  brand?: string;
  costPrice: number;    // سعر الشراء
  sellPrice: number;    // سعر البيع
  wholesalePrice?: number; // سعر الجملة
  tvaRate?: number;     // نسبة الضريبة %
  isService?: boolean;  // خدمات
  currentStock: number; // الكمية الحالية بالمخزن
  minStockAlert: number;// الحد الأدنى للتنبيه
  unit: string;         // وحدة القياس (قطعة، كرتون، كغ، إلخ)
  hasBoxPack?: boolean;    // بيع بالحزمة / كرتون
  boxQuantity?: number;   // كمية في الحزمة أو الكرتون (عدد القطع)
  packPrice?: number;     // سعر بيع الحزمة (د.ج)
  packBarcode?: string;   // باركود الحزمة الخاص
  expiryDate?: string;  // تاريخ الصلاحية
  location?: string;    // موقع التخزين (الرف / المستودع)
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  totalPurchases: number;
  currentDebt: number;  // المبلغ المستحق على العميل (الديون)
  creditLimit?: number;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  totalOrders: number;
  totalSupplied?: number;
  currentDebt: number;  // المبلغ المستحق للمورد (ديون علينا)
  currentBalance?: number;
  personalDebt?: number; // الدين الشخصي أو القرض الخاص
  isSuspended?: boolean; // المورد موقوف
  notes?: string;
  createdAt: string;
}

export interface CustomerReturnItem {
  productId: string;
  productName: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  condition: 'good' | 'damaged' | 'defective'; // سليم يعاد للمخزن أو تالف
  reason?: string;
}

export interface CustomerReturn {
  id: string;
  returnNumber: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  items: CustomerReturnItem[];
  totalRefund: number;
  refundMethod: 'cash' | 'deduct_debt' | 'credit_note';
  restockItems: boolean; // إعادة السلع للمخزون السليم
  notes?: string;
  cashierName?: string;
  createdAt: string;
}

export interface SupplierReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
  reason?: string;
}

export interface SupplierReturn {
  id: string;
  returnNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: SupplierReturnItem[];
  totalRefund: number;
  refundMethod: 'deduct_debt' | 'cash';
  notes?: string;
  createdAt: string;
}

export interface SupplierPersonalDebt {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  date: string;
  type: 'borrow' | 'repay'; // استدانة أو سداد دين شخصي
  notes?: string;
  createdAt: string;
}

export interface SupplierSettlement {
  id: string;
  settlementNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  previousDebt: number;
  paidAmount: number;
  discountDeduction: number; // خصم مكتسب / مسامحة
  remainingDebt: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer';
  notes?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  total: number;
  profit: number;
  isPack?: boolean;
  packSize?: number;
  numberOfPacks?: number;
}

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentType: 'cash' | 'card' | 'credit' | 'bank_transfer' | 'split';
  status: 'completed' | 'draft' | 'cancelled' | 'returned';
  notes?: string;
  cashierName?: string;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentType: 'cash' | 'card' | 'credit' | 'bank_transfer';
  status: 'completed' | 'draft' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'sale' | 'purchase' | 'adjustment_in' | 'adjustment_out' | 'return_in' | 'return_out' | 'damage';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  referenceType?: 'sale_invoice' | 'purchase_invoice' | 'manual_adjustment';
  reason: string;
  date: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  type: 'customer_receipt' | 'supplier_payment' | 'receipt' | 'disbursement'; // سند قبض من عميل / سند صرف لمورد
  partyType?: 'customer' | 'supplier';
  partyId: string;
  partyName: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque';
  referenceInvoiceId?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface UserPermissions {
  canEditPrices: boolean;
  canDeleteInvoices: boolean;
  canViewProfits: boolean;
  canManageInventory: boolean;
  canBackupDatabase: boolean;
  canManageUsers: boolean;
  canGiveDiscounts: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  role: 'admin' | 'cashier' | 'manager';
  storeName: string;
  phone: string;
  wilaya?: string;
  activityType?: string;
  password?: string;
  permissions?: UserPermissions;
  createdAt: string;
  isActivated: boolean;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: 'rent' | 'electricity' | 'salaries' | 'transport' | 'maintenance' | 'supplies' | 'tax' | 'other';
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
  recipient?: string;
  notes?: string;
  createdAt: string;
}

export interface PrinterConfig {
  printerType: 'thermal_80' | 'thermal_58' | 'a4' | 'pdf';
  receiptSize: '80mm' | '58mm' | 'a4';
  autoPrintOnSale: boolean;
  printStoreLogo: boolean;
  openCashDrawer: boolean;
  showBarcodeOnReceipt: boolean;
  customHeaderNote?: string;
  customFooterNote?: string;
  copiesCount: number;
}

export interface ZakatConfig {
  goldPriceGram: number; // سعر غرام الذهب عيار 24 (د.ج)
  nisabGoldGrams: number; // 85 غرام
  hawlPassed: boolean;    // مرور الحول (سنة هجرية كاملة)
  customCashDeduct: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  commercialRecord: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // Percentage, e.g. 19
  enableTax: boolean;
  invoiceFooterNote: string;
  lowStockThresholdDefault: number;
  receiptSize: 'thermal' | 'a4';
  language: 'ar' | 'fr';
  screenMode: 'standard' | 'touch' | 'compact';
  theme: 'light' | 'dark' | 'metallic';
  printerConfig: PrinterConfig;
  zakatConfig: ZakatConfig;
  autoBackupOnExit: boolean;
}

export interface DatabaseStats {
  totalTables: number;
  totalRecords: number;
  fileSizeBytes: number;
  sizeKb?: number;
  databasePath?: string;
  lastBackupDate?: string;
  tables: {
    name: string;
    label: string;
    count: number;
  }[];
}

export interface FinancialSummary {
  todaySales: number;
  monthSales: number;
  totalSales: number;
  todayPurchases: number;
  monthPurchases: number;
  totalPurchases: number;
  totalTax?: number;
  netProfit: number;
  inventoryTotalCostValue: number;
  inventoryTotalRetailValue: number;
  totalReceivables: number; // ديون العملاء
  totalPayables: number;    // ديون الموردين
  lowStockCount: number;
  outOfStockCount: number;
  totalProductsCount: number;
  salesCount: number;
  purchasesCount: number;
}
