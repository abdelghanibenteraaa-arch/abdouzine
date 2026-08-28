import { pgTable, serial, text, timestamp, boolean, doublePrecision, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Firebase Auth linkage)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: text('role').default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color'),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  sku: text('sku'),
  barcode: text('barcode'),
  name: text('name').notNull(),
  nameFr: text('name_fr'),
  categoryId: text('category_id'),
  categoryName: text('category_name'),
  brand: text('brand'),
  costPrice: doublePrecision('cost_price').default(0),
  sellPrice: doublePrecision('sell_price').default(0),
  wholesalePrice: doublePrecision('wholesale_price').default(0),
  tvaRate: doublePrecision('tva_rate').default(0),
  currentStock: doublePrecision('current_stock').default(0),
  minStockAlert: doublePrecision('min_stock_alert').default(5),
  unit: text('unit').default('قطعة'),
  expiryDate: text('expiry_date'),
  location: text('location'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Customers table
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  taxNumber: text('tax_number'),
  totalPurchases: doublePrecision('total_purchases').default(0),
  currentDebt: doublePrecision('current_debt').default(0),
  creditLimit: doublePrecision('credit_limit'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company'),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  taxNumber: text('tax_number'),
  totalOrders: integer('total_orders').default(0),
  totalSupplied: doublePrecision('total_supplied').default(0),
  currentDebt: doublePrecision('current_debt').default(0),
  currentBalance: doublePrecision('current_balance').default(0),
  personalDebt: doublePrecision('personal_debt').default(0),
  isSuspended: boolean('is_suspended').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sales Invoices table
export const salesInvoices = pgTable('sales_invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull(),
  date: text('date').notNull(),
  customerId: text('customer_id'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  subtotal: doublePrecision('subtotal').default(0),
  taxRate: doublePrecision('tax_rate').default(0),
  taxAmount: doublePrecision('tax_amount').default(0),
  discountAmount: doublePrecision('discount_amount').default(0),
  totalAmount: doublePrecision('total_amount').default(0),
  paidAmount: doublePrecision('paid_amount').default(0),
  remainingAmount: doublePrecision('remaining_amount').default(0),
  paymentType: text('payment_type').default('cash'),
  status: text('status').default('completed'),
  itemsJson: text('items_json'),
  notes: text('notes'),
  cashierName: text('cashier_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Purchase Invoices table
export const purchaseInvoices = pgTable('purchase_invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull(),
  date: text('date').notNull(),
  supplierId: text('supplier_id'),
  supplierName: text('supplier_name').notNull(),
  subtotal: doublePrecision('subtotal').default(0),
  taxRate: doublePrecision('tax_rate').default(0),
  taxAmount: doublePrecision('tax_amount').default(0),
  discountAmount: doublePrecision('discount_amount').default(0),
  totalAmount: doublePrecision('total_amount').default(0),
  paidAmount: doublePrecision('paid_amount').default(0),
  remainingAmount: doublePrecision('remaining_amount').default(0),
  paymentType: text('payment_type').default('cash'),
  status: text('status').default('completed'),
  itemsJson: text('items_json'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Inventory Logs table
export const inventoryLogs = pgTable('inventory_logs', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  sku: text('sku'),
  type: text('type').notNull(),
  quantityChange: doublePrecision('quantity_change').notNull(),
  previousStock: doublePrecision('previous_stock').notNull(),
  newStock: doublePrecision('new_stock').notNull(),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  reason: text('reason'),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Payments / Vouchers table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  partyId: text('party_id'),
  partyName: text('party_name').notNull(),
  amount: doublePrecision('amount').notNull(),
  paymentMethod: text('payment_method').default('cash'),
  date: text('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// App Settings table
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
