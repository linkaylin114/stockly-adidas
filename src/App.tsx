/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { TransactionsView } from './components/TransactionsView';
import { AuditView } from './components/AuditView';
import { ReportsView } from './components/ReportsView';
import { RoleManagerModal } from './components/RoleManagerModal';
import { NotificationModal } from './components/NotificationModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { INITIAL_USERS } from './data/mockUsers';
import {
  Product,
  Transaction,
  StockAudit,
  StockAlert,
  DashboardSummary,
  User,
  TransactionType,
} from './types/warehouse';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default Admin

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [audits, setAudits] = useState<StockAudit[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  // Quick Action Params
  const [quickInboundProductId, setQuickInboundProductId] = useState<string | undefined>(undefined);
  const [initialTxType, setInitialTxType] = useState<TransactionType>('inbound');

  // Fetch initial data from backend API
  const fetchAllData = async () => {
    try {
      const [resProd, resTx, resAud, resAlt, resSum] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/transactions').then((r) => r.json()),
        fetch('/api/audits').then((r) => r.json()),
        fetch('/api/alerts').then((r) => r.json()),
        fetch('/api/reports/summary').then((r) => r.json()),
      ]);

      if (resProd.success) setProducts(resProd.data);
      if (resTx.success) setTransactions(resTx.data);
      if (resAud.success) setAudits(resAud.data);
      if (resAlt.success) setAlerts(resAlt.data);
      if (resSum.success) setSummary(resSum.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu kho từ máy chủ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers for Products
  const handleAddProduct = async (newProd: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      }).then((r) => r.json());

      if (res.success) {
        await fetchAllData();
      } else {
        alert(res.message || 'Không thể thêm sản phẩm');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProduct = async (id: string, updated: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).then((r) => r.json());

      if (res.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      }).then((r) => r.json());

      if (res.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for Transactions
  const handleCreateTransaction = async (txData: any) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
      }).then((r) => r.json());

      if (res.success) {
        await fetchAllData();
        setQuickInboundProductId(undefined);
      } else {
        alert(res.message || 'Không thể tạo phiếu nhập/xuất');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver: currentUser }),
      }).then((r) => r.json());

      if (res.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for Audits
  const handleCreateAudit = async (auditData: any) => {
    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData),
      }).then((r) => r.json());

      if (res.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAudit = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/audits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json());

      if (res.success) {
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyAudit = async (id: string) => {
    try {
      const res = await fetch(`/api/audits/${id}/apply`, {
        method: 'POST',
      }).then((r) => r.json());

      if (res.success) {
        alert(res.message || 'Đã cân bằng số liệu thực tế vào kho!');
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Inbound Trigger (from low stock alerts)
  const handleTriggerQuickInbound = (productId?: string) => {
    setInitialTxType('inbound');
    setQuickInboundProductId(productId);
    setActiveTab('transactions');
  };

  const handleTriggerOutbound = () => {
    setInitialTxType('outbound');
    setQuickInboundProductId(undefined);
    setActiveTab('transactions');
  };

  const handleBarcodeScanned = (product: Product) => {
    setIsBarcodeModalOpen(false);
    // Switch to products view and show details
    setActiveTab('products');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-20 md:pb-8">
      {/* Top Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        alerts={alerts}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Đang tải dữ liệu kho Stockly • adidas...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                summary={summary}
                products={products}
                alerts={alerts}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
                onCreateInboundForProduct={handleTriggerQuickInbound}
                onCreateOutbound={handleTriggerOutbound}
                onOpenQuickScan={() => setIsBarcodeModalOpen(true)}
              />
            )}

            {activeTab === 'products' && (
              <ProductsView
                products={products}
                currentUser={currentUser}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onOpenQuickScan={() => setIsBarcodeModalOpen(true)}
                onQuickInbound={handleTriggerQuickInbound}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsView
                transactions={transactions}
                products={products}
                currentUser={currentUser}
                onCreateTransaction={handleCreateTransaction}
                onApproveTransaction={handleApproveTransaction}
                onOpenQuickScan={() => setIsBarcodeModalOpen(true)}
                initialType={initialTxType}
                initialProductId={quickInboundProductId}
              />
            )}

            {activeTab === 'audit' && (
              <AuditView
                audits={audits}
                products={products}
                currentUser={currentUser}
                onCreateAudit={handleCreateAudit}
                onUpdateAudit={handleUpdateAudit}
                onApplyAudit={handleApplyAudit}
                onOpenQuickScan={() => setIsBarcodeModalOpen(true)}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                summary={summary}
                products={products}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onQuickInbound={handleTriggerQuickInbound}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Handheld ergonomic reach zone) */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickScan={() => setIsBarcodeModalOpen(true)}
      />

      {/* Role Manager Modal (RBAC Switcher) */}
      <RoleManagerModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          setIsRoleModalOpen(false);
        }}
      />

      {/* Automated Stock Alerts Modal */}
      <NotificationModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
        onCreateInboundForProduct={handleTriggerQuickInbound}
      />

      {/* Barcode / QR Scanner Viewfinder Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        products={products}
        onScanResult={handleBarcodeScanned}
      />
    </div>
  );
}
