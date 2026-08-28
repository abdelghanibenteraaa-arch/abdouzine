import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { WindowsTaskbar } from './components/WindowsTaskbar';
import { Dashboard } from './components/Dashboard';
import { MainSalesMenu } from './components/MainSalesMenu';
import { POSScreen } from './components/POSScreen';
import { SalesManager } from './components/SalesManager';
import { PurchasesManager } from './components/PurchasesManager';
import { InventoryManager } from './components/InventoryManager';
import { BarcodeManager } from './components/BarcodeManager';
import { StockLogsView } from './components/StockLogsView';
import { CustomersManager } from './components/CustomersManager';
import { SuppliersManager } from './components/SuppliersManager';
import { FinancialReports } from './components/FinancialReports';
import { DatabaseManager } from './components/DatabaseManager';
import { SettingsManager } from './components/SettingsManager';

import { InvoiceViewModal } from './components/modals/InvoiceViewModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { StockAdjustmentModal } from './components/modals/StockAdjustmentModal';
import { AddCustomerModal } from './components/modals/AddCustomerModal';
import { AddSupplierModal } from './components/modals/AddSupplierModal';
import { AddPaymentModal } from './components/modals/AddPaymentModal';
import { AccountCreationModal } from './components/modals/AccountCreationModal';
import { VideoTimelineGuideModal } from './components/modals/VideoTimelineGuideModal';

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, toasts, removeToast, isVideoGuideOpen, setIsVideoGuideOpen } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MainSalesMenu />;
      case 'pos':
        return <POSScreen />;
      case 'sales':
        return <SalesManager />;
      case 'purchases':
        return <PurchasesManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'barcode':
        return <BarcodeManager />;
      case 'stock_logs':
        return <StockLogsView />;
      case 'customers':
        return <CustomersManager />;
      case 'suppliers':
        return <SuppliersManager />;
      case 'reports':
        return <FinancialReports />;
      case 'database':
        return <DatabaseManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <PurchasesManager />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f4f5f7] overflow-hidden font-sans text-slate-900 antialiased select-none" dir="rtl">
      
      {/* Top Navbar Ribbon */}
      <Navbar />

      {/* Main Center Body with Right Sidebar */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Dynamic Screen View (Center Canvas) */}
        <main className="flex-1 overflow-y-auto bg-[#ffffff]">
          {renderActiveScreen()}
        </main>

        {/* Navigation Sidebar on the RIGHT (as in Zin Stock screenshot) */}
        <Sidebar />
      </div>

      {/* Bottom Windows 10 Taskbar */}
      <WindowsTaskbar />

      {/* Global Toast Notifications */}
      <div className="fixed bottom-12 left-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-sky-300 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-80 rounded text-white/70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Modals */}
      <AccountCreationModal />
      <InvoiceViewModal />
      <AddProductModal />
      <StockAdjustmentModal />
      <AddCustomerModal />
      <AddSupplierModal />
      <AddPaymentModal />
      <VideoTimelineGuideModal
        isOpen={isVideoGuideOpen}
        onClose={() => setIsVideoGuideOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
