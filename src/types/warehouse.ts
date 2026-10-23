export type Role = 'admin' | 'manager' | 'staff' | 'auditor';

export interface UserPermissions {
  canCreateTransaction: boolean;
  canApproveTransaction: boolean;
  canEditProduct: boolean;
  canDeleteProduct: boolean;
  canAudit: boolean;
  canReconcileAudit: boolean;
  canManageUsers: boolean;
  canExportExcel: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleTitle: string;
  avatar: string;
  warehouseAssigned: string;
  permissions: UserPermissions;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  location: string;
  quantity: number;
  minThreshold: number;
  maxThreshold: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  imageUrl?: string;
  expiryDate?: string;
  updatedAt: string;
  status: StockStatus;
}

export type TransactionType = 'inbound' | 'outbound' | 'adjustment' | 'transfer';
export type TransactionStatus = 'completed' | 'pending_approval' | 'cancelled';

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
  location: string;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  code: string;
  type: TransactionType;
  date: string;
  partner: string; // Nhà cung cấp hoặc khách hàng/đơn vị nhận
  reason: string;
  items: TransactionItem[];
  totalAmount: number;
  creator: {
    id: string;
    name: string;
    role: string;
  };
  approver?: {
    id: string;
    name: string;
    approvedAt: string;
  };
  status: TransactionStatus;
  note?: string;
  warehouse: string;
}

export interface AuditItem {
  productId: string;
  sku: string;
  productName: string;
  unit: string;
  location: string;
  category: string;
  systemQty: number;
  actualQty: number | null;
  difference: number;
  unitCost: number;
  differenceValue: number;
  reason?: string;
  status: 'pending' | 'matched' | 'surplus' | 'shortage';
}

export interface StockAudit {
  id: string;
  code: string;
  title: string;
  warehouse: string;
  createdAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  auditorName: string;
  notes?: string;
  items: AuditItem[];
  totalSystemQty: number;
  totalActualQty: number;
  totalDifferenceQty: number;
  totalDifferenceValue: number;
}

export interface StockAlert {
  id: string;
  type: 'out_of_stock' | 'low_stock' | 'overstock' | 'expiry_soon';
  severity: 'critical' | 'warning' | 'info';
  productId: string;
  productName: string;
  sku: string;
  currentQty: number;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  location: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardSummary {
  totalStockValue: number;
  totalProductsCount: number;
  totalUnitsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  inboundTransactionsThisMonth: number;
  outboundTransactionsThisMonth: number;
  flowTrend: Array<{
    date: string;
    inboundUnits: number;
    outboundUnits: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    value: number;
    percentage: number;
  }>;
}
