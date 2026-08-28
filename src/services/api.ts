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
} from '../types';

const BASE_URL = '/api';

// Offline Cache Key Prefix
const CACHE_PREFIX = 'zin_offline_db_';

function saveLocalCache(key: string, data: any) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

function getLocalCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const isGet = !options?.method || options.method === 'GET';
  const cacheKey = url.split('?')[0].replace(/^\//, '').replace(/\//g, '_');

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      let errorMsg = `Error ${res.status}: ${res.statusText}`;
      try {
        const json = await res.json();
        if (json.error) errorMsg = json.error;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();

    // Cache successful GET results for offline operation
    if (isGet) {
      saveLocalCache(cacheKey, data);
    }

    return data;
  } catch (networkError: any) {
    // If offline or network fetch failed, attempt fallback to local cache
    console.warn(`[Offline Mode] Failed to fetch ${url}, checking offline local storage...`, networkError);

    if (isGet) {
      const cached = getLocalCache<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // If it's a mutation (POST/PUT) and we are offline, simulate successful creation locally if cached list exists
    if (options?.method === 'POST' && options?.body) {
      try {
        const payload = JSON.parse(options.body as string);
        const generatedId = 'offline-' + Date.now();
        const offlineItem = {
          ...payload,
          id: generatedId,
          invoiceNumber: payload.invoiceNumber || 'INV-OFF-' + Math.floor(Math.random() * 90000 + 10000),
          createdAt: new Date().toISOString(),
        };

        // If it's products/sales/customers/etc, append to cached collection
        const listKey = cacheKey.split('_')[0];
        const cachedList = getLocalCache<any[]>(listKey);
        if (Array.isArray(cachedList)) {
          const updated = [offlineItem, ...cachedList];
          saveLocalCache(listKey, updated);
        }

        return offlineItem as T;
      } catch {
        // pass through to throw
      }
    }

    throw networkError;
  }
}

export const api = {
  // Settings
  getSettings: () => fetchJson<StoreSettings>('/settings'),
  updateSettings: (data: Partial<StoreSettings>) =>
    fetchJson<StoreSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Categories
  getCategories: () => fetchJson<Category[]>('/categories'),
  createCategory: (data: Omit<Category, 'id' | 'createdAt'>) =>
    fetchJson<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<Category>) =>
    fetchJson<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    fetchJson<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params?: { categoryId?: string; search?: string; lowStock?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);
    if (params?.lowStock) query.append('lowStock', 'true');
    const qs = query.toString();
    return fetchJson<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id: string) => fetchJson<Product>(`/products/${id}`),
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchJson<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<Product>) =>
    fetchJson<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adjustStock: (id: string, newStock: number, reason: string) =>
    fetchJson<Product>(`/products/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify({ newStock, reason }),
    }),
  deleteProduct: (id: string) =>
    fetchJson<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () => fetchJson<Customer[]>('/customers'),
  createCustomer: (data: Omit<Customer, 'id' | 'totalPurchases' | 'currentDebt' | 'createdAt'>) =>
    fetchJson<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    fetchJson<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) =>
    fetchJson<{ success: boolean }>(`/customers/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: () => fetchJson<Supplier[]>('/suppliers'),
  createSupplier: (data: Omit<Supplier, 'id' | 'totalOrders' | 'currentDebt' | 'createdAt'>) =>
    fetchJson<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: string, data: Partial<Supplier>) =>
    fetchJson<Supplier>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id: string) =>
    fetchJson<{ success: boolean }>(`/suppliers/${id}`, { method: 'DELETE' }),

  // Sales
  getSales: () => fetchJson<SaleInvoice[]>('/sales'),
  createSale: (data: Omit<SaleInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) =>
    fetchJson<SaleInvoice>('/sales', { method: 'POST', body: JSON.stringify(data) }),

  // Purchases
  getPurchases: () => fetchJson<PurchaseInvoice[]>('/purchases'),
  createPurchase: (data: Omit<PurchaseInvoice, 'id' | 'invoiceNumber' | 'createdAt'>) =>
    fetchJson<PurchaseInvoice>('/purchases', { method: 'POST', body: JSON.stringify(data) }),

  // Inventory Logs
  getInventoryLogs: () => fetchJson<InventoryLog[]>('/inventory/logs'),

  // Payments
  getPayments: () => fetchJson<PaymentRecord[]>('/payments'),
  createPayment: (data: Omit<PaymentRecord, 'id' | 'createdAt'>) =>
    fetchJson<PaymentRecord>('/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Reports Summary
  getFinancialSummary: () => fetchJson<FinancialSummary>('/reports/summary'),

  // Database Management
  getDatabaseStats: () => fetchJson<DatabaseStats>('/database/stats'),
  getTableData: (tableName: string) => fetchJson<any[]>(`/database/table/${tableName}`),
  exportBackupUrl: () => `${BASE_URL}/database/backup`,
  exportDatabase: () => fetchJson<any>('/database/backup'),
  importDatabase: (backupData: any) =>
    fetchJson<{ message: string; success: boolean }>('/database/restore', {
      method: 'POST',
      body: JSON.stringify(backupData),
    }),
  restoreBackup: (backupData: any) =>
    fetchJson<{ message: string; success: boolean }>('/database/restore', {
      method: 'POST',
      body: JSON.stringify(backupData),
    }),
  resetDatabase: () =>
    fetchJson<{ message: string; success: boolean }>('/database/reset', { method: 'POST' }),
  runSqlQuery: (query: string) =>
    fetchJson<{ success: boolean; table?: string; rowCount: number; rows: any[]; executionTimeMs?: number; message?: string }>('/database/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};
