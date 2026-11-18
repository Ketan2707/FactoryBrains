// ─── Products ───────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  supplierId?: string;
  supplierName?: string;
  stock: number;
  reorderPoint: number;
  status: 'active' | 'inactive' | 'discontinued';
  // Manufacturing fields
  bomId?: string;
  manufacturingLeadTime?: number; // days
  productionCost?: number;
  workCenters?: string[];
}

// ─── Customers ──────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  city?: string;
  totalOrders: number;
  totalRevenue: number;
  outstandingAmount: number;
  lastOrderDate: string;
  status: 'active' | 'inactive';
  segment?: 'regular' | 'premium' | 'enterprise';
}

// ─── Suppliers ──────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address?: string;
  city?: string;
  productsSupplied: number;
  avgLeadTime: number; // days
  qualityRating: number; // 0-100
  reliabilityScore: number; // 0-100
  totalOrders: number;
  totalSpend: number;
  status: 'active' | 'inactive' | 'blocked';
  lastOrderDate: string;
}

// ─── Sales ──────────────────────────────────────────────────

export type SalesOrderStatus = 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  deliveryDate?: string;
  status: SalesOrderStatus;
  items: SalesOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  amountPaid: number;
  // Manufacturing
  productionStatus?: 'not_started' | 'in_production' | 'completed';
  deliveryRisk?: 'low' | 'medium' | 'high';
}

export interface SalesOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

// ─── Purchases ──────────────────────────────────────────────

export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'partial' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
}

// ─── Inventory ──────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  warehouseId?: string;
  warehouseName?: string;
  available: number;
  reserved: number;
  incoming: number;
  outgoing: number;
  safetyStock: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  daysRemaining?: number; // AI-estimated
  productionDemand?: number; // manufacturing
  supplierLeadTime?: number; // days
  risk: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reference: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  date: string;
  performedBy: string;
}

// ─── Expenses ───────────────────────────────────────────────

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'upi';
  vendor?: string;
  receipt?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

// ─── Reports ────────────────────────────────────────────────

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'inventory' | 'purchases' | 'customers' | 'suppliers' | 'expenses' | 'profit' | 'production' | 'quality' | 'maintenance' | 'machines' | 'plant';
  businessTypes: string[];
  filters: string[];
}
