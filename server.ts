import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, DatabaseSchema } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', (req, res) => {
    const created = db.addCategory(req.body);
    res.status(201).json(created);
  });

  app.put('/api/categories/:id', (req, res) => {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'التصنيف غير موجود' });
    res.json(updated);
  });

  app.delete('/api/categories/:id', (req, res) => {
    const success = db.deleteCategory(req.params.id);
    res.json({ success });
  });

  // Products
  app.get('/api/products', (req, res) => {
    const { categoryId, search, lowStock } = req.query;
    let products = db.getProducts();

    if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
      products = products.filter(p => p.categoryId === categoryId);
    }

    if (lowStock === 'true') {
      products = products.filter(p => p.currentStock <= p.minStockAlert);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    res.json(products);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    const created = db.addProduct(req.body);
    res.status(201).json(created);
  });

  app.put('/api/products/:id', (req, res) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(updated);
  });

  app.post('/api/products/:id/adjust-stock', (req, res) => {
    const { newStock, reason } = req.body;
    const updated = db.adjustProductStock(req.params.id, Number(newStock), reason);
    if (!updated) return res.status(404).json({ error: 'تعذر تعديل رصيد المنتج' });
    res.json(updated);
  });

  app.delete('/api/products/:id', (req, res) => {
    const success = db.deleteProduct(req.params.id);
    res.json({ success });
  });

  // Customers
  app.get('/api/customers', (req, res) => {
    res.json(db.getCustomers());
  });

  app.post('/api/customers', (req, res) => {
    const created = db.addCustomer(req.body);
    res.status(201).json(created);
  });

  app.put('/api/customers/:id', (req, res) => {
    const updated = db.updateCustomer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'العميل غير موجود' });
    res.json(updated);
  });

  app.delete('/api/customers/:id', (req, res) => {
    const success = db.deleteCustomer(req.params.id);
    res.json({ success });
  });

  // Suppliers
  app.get('/api/suppliers', (req, res) => {
    res.json(db.getSuppliers());
  });

  app.post('/api/suppliers', (req, res) => {
    const created = db.addSupplier(req.body);
    res.status(201).json(created);
  });

  app.put('/api/suppliers/:id', (req, res) => {
    const updated = db.updateSupplier(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'المورد غير موجود' });
    res.json(updated);
  });

  app.delete('/api/suppliers/:id', (req, res) => {
    const success = db.deleteSupplier(req.params.id);
    res.json({ success });
  });

  // Sales (POS & Invoices)
  app.get('/api/sales', (req, res) => {
    res.json(db.getSales());
  });

  app.post('/api/sales', (req, res) => {
    try {
      const created = db.createSale(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'فشل في إنشاء فاتورة البيع' });
    }
  });

  // Purchases
  app.get('/api/purchases', (req, res) => {
    res.json(db.getPurchases());
  });

  app.post('/api/purchases', (req, res) => {
    try {
      const created = db.createPurchase(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'فشل في إنشاء فاتورة الشراء' });
    }
  });

  // Inventory Audit Logs
  app.get('/api/inventory/logs', (req, res) => {
    res.json(db.getInventoryLogs());
  });

  // Payments / Vouchers (سندات قبض وصرف)
  app.get('/api/payments', (req, res) => {
    res.json(db.getPayments());
  });

  app.post('/api/payments', (req, res) => {
    const created = db.createPayment(req.body);
    res.status(201).json(created);
  });

  // Financial & Inventory Summary
  app.get('/api/reports/summary', (req, res) => {
    res.json(db.getFinancialSummary());
  });

  // Database Management & Explorer APIs
  app.get('/api/database/stats', (req, res) => {
    res.json(db.getDatabaseStats());
  });

  app.get('/api/database/table/:tableName', (req, res) => {
    const tableName = req.params.tableName as keyof DatabaseSchema;
    const data = db.getTableData(tableName);
    res.json(data);
  });

  app.get('/api/database/backup', (req, res) => {
    const fullBackup = db.getRawBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="erp_backup_${new Date().toISOString().split('T')[0]}.json"`);
    res.json(fullBackup);
  });

  app.post('/api/database/restore', (req, res) => {
    try {
      const success = db.restoreDatabase(req.body);
      if (success) {
        res.json({ message: 'تم استعادة قاعدة البيانات بنجاح', success: true });
      } else {
        res.status(400).json({ error: 'صيغة النسخة الاحتياطية غير صالحة', success: false });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message, success: false });
    }
  });

  app.post('/api/database/reset', (req, res) => {
    db.resetToSeed();
    res.json({ message: 'تم إعادة تهيئة قاعدة البيانات للبيانات الافتراضية بنجاح', success: true });
  });

  // Simulated SQL Query / Data Query runner for the database manager UI
  app.post('/api/database/query', (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'استعلام غير صالح' });
    }

    const trimmed = query.trim().toUpperCase();
    const backup = db.getRawBackup();

    try {
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('SHOW')) {
        let targetTable: keyof DatabaseSchema = 'products';
        if (trimmed.includes('FROM PRODUCTS') || trimmed.includes('FROM PRODUCT')) targetTable = 'products';
        else if (trimmed.includes('FROM CATEGORIES') || trimmed.includes('FROM CATEGORY')) targetTable = 'categories';
        else if (trimmed.includes('FROM CUSTOMERS') || trimmed.includes('FROM CUSTOMER')) targetTable = 'customers';
        else if (trimmed.includes('FROM SUPPLIERS') || trimmed.includes('FROM SUPPLIER')) targetTable = 'suppliers';
        else if (trimmed.includes('FROM SALES') || trimmed.includes('FROM SALES_INVOICES')) targetTable = 'sales_invoices';
        else if (trimmed.includes('FROM PURCHASES') || trimmed.includes('FROM PURCHASE_INVOICES')) targetTable = 'purchase_invoices';
        else if (trimmed.includes('FROM LOGS') || trimmed.includes('FROM INVENTORY_LOGS')) targetTable = 'inventory_logs';
        else if (trimmed.includes('FROM PAYMENTS')) targetTable = 'payments';

        const tableData = backup[targetTable];
        res.json({
          success: true,
          table: targetTable,
          rowCount: Array.isArray(tableData) ? tableData.length : 1,
          rows: Array.isArray(tableData) ? tableData : [tableData],
          executionTimeMs: Math.floor(Math.random() * 4) + 1,
        });
      } else {
        res.json({
          success: true,
          message: 'تم تنفيذ الاستعلام بنجاح',
          rows: [],
          rowCount: 0,
        });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Vite Dev & Prod Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ERP & Inventory Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
