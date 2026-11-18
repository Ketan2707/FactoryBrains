'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Product, 
  SalesOrder, 
  Customer, 
  Supplier, 
  PurchaseOrder, 
  InventoryItem, 
  Expense 
} from '@/lib/types/entities';
import { 
  RETAIL_PRODUCTS, 
  RETAIL_CUSTOMERS, 
  RETAIL_SUPPLIERS, 
  RETAIL_SALES, 
  RETAIL_PURCHASES, 
  RETAIL_INVENTORY, 
  RETAIL_EXPENSES 
} from '@/lib/data/retail-demo';
import { 
  MFG_PRODUCTS, 
  MFG_SALES, 
  MFG_INVENTORY 
} from '@/lib/data/manufacturing-demo';

interface ShopDataState {
  // Keyed by organizationId
  productsByOrg: Record<string, Product[]>;
  salesByOrg: Record<string, SalesOrder[]>;
  customersByOrg: Record<string, Customer[]>;
  suppliersByOrg: Record<string, Supplier[]>;
  purchasesByOrg: Record<string, PurchaseOrder[]>;
  expensesByOrg: Record<string, Expense[]>;

  // Products
  getProducts: (orgId: string, businessType?: string, isCustom?: boolean) => Product[];
  addProduct: (orgId: string, product: Omit<Product, 'id'>) => Product;
  addMultipleProducts: (orgId: string, products: Omit<Product, 'id'>[]) => Product[];
  updateProduct: (orgId: string, id: string, partial: Partial<Product>) => void;
  deleteProduct: (orgId: string, id: string) => void;

  // Sales
  getSales: (orgId: string, businessType?: string, isCustom?: boolean) => SalesOrder[];
  addSale: (orgId: string, sale: Omit<SalesOrder, 'id'>) => SalesOrder;
  updateSaleStatus: (orgId: string, id: string, status: SalesOrder['status'], paymentStatus?: SalesOrder['paymentStatus']) => void;
  deleteSale: (orgId: string, id: string) => void;

  // Customers
  getCustomers: (orgId: string, isCustom?: boolean) => Customer[];
  addCustomer: (orgId: string, customer: Omit<Customer, 'id' | 'totalOrders' | 'totalRevenue' | 'outstandingAmount' | 'lastOrderDate'>) => Customer;
  deleteCustomer: (orgId: string, id: string) => void;

  // Suppliers
  getSuppliers: (orgId: string, isCustom?: boolean) => Supplier[];
  addSupplier: (orgId: string, supplier: Omit<Supplier, 'id' | 'productsSupplied' | 'avgLeadTime' | 'qualityRating' | 'reliabilityScore' | 'totalOrders' | 'totalSpend' | 'lastOrderDate'>) => Supplier;
  deleteSupplier: (orgId: string, id: string) => void;

  // Purchases
  getPurchases: (orgId: string, isCustom?: boolean) => PurchaseOrder[];
  addPurchase: (orgId: string, purchase: Omit<PurchaseOrder, 'id'>) => PurchaseOrder;

  // Expenses
  getExpenses: (orgId: string, isCustom?: boolean) => Expense[];
  addExpense: (orgId: string, expense: Omit<Expense, 'id'>) => Expense;

  // Inventory items derived from products
  getInventory: (orgId: string, businessType?: string, isCustom?: boolean) => InventoryItem[];

  // Data helpers
  loadSampleData: (orgId: string, businessType: string) => void;
  clearShopData: (orgId: string) => void;
}

export const useShopDataStore = create<ShopDataState>()(
  persist(
    (set, get) => ({
      productsByOrg: {
        org_urbanmart: RETAIL_PRODUCTS,
        org_apex: MFG_PRODUCTS,
        org_enterprise: MFG_PRODUCTS,
      },
      salesByOrg: {
        org_urbanmart: RETAIL_SALES,
        org_apex: MFG_SALES,
        org_enterprise: MFG_SALES,
      },
      customersByOrg: {
        org_urbanmart: RETAIL_CUSTOMERS,
        org_apex: RETAIL_CUSTOMERS,
        org_enterprise: RETAIL_CUSTOMERS,
      },
      suppliersByOrg: {
        org_urbanmart: RETAIL_SUPPLIERS,
        org_apex: RETAIL_SUPPLIERS,
        org_enterprise: RETAIL_SUPPLIERS,
      },
      purchasesByOrg: {
        org_urbanmart: RETAIL_PURCHASES,
        org_apex: [],
        org_enterprise: [],
      },
      expensesByOrg: {
        org_urbanmart: RETAIL_EXPENSES,
        org_apex: [],
        org_enterprise: [],
      },

      // ─── Products ───────────────────────────────────────────
      getProducts: (orgId, businessType, isCustom) => {
        const { productsByOrg } = get();
        if (productsByOrg[orgId]) {
          return productsByOrg[orgId];
        }
        // If it's a custom user shop, it starts clean (empty)
        if (isCustom || orgId.startsWith('org_custom_')) {
          return [];
        }
        // Fallback for pre-seeded demos
        if (orgId === 'org_apex' || orgId === 'org_enterprise' || businessType === 'manufacturing') {
          return MFG_PRODUCTS;
        }
        return RETAIL_PRODUCTS;
      },

      addProduct: (orgId, productData) => {
        const { productsByOrg, getProducts } = get();
        const currentProducts = getProducts(orgId, undefined, true);
        const newProduct: Product = {
          ...productData,
          id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        };
        const updated = [newProduct, ...currentProducts];
        set({
          productsByOrg: { ...productsByOrg, [orgId]: updated },
        });
        return newProduct;
      },

      addMultipleProducts: (orgId, items) => {
        const { productsByOrg, getProducts } = get();
        const currentProducts = getProducts(orgId, undefined, true);
        const newProducts: Product[] = items.map((item, idx) => ({
          ...item,
          id: `prod_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        }));
        const updated = [...newProducts, ...currentProducts];
        set({
          productsByOrg: { ...productsByOrg, [orgId]: updated },
        });
        return newProducts;
      },

      updateProduct: (orgId, id, partial) => {
        const { productsByOrg, getProducts } = get();
        const currentProducts = getProducts(orgId, undefined, true);
        const updated = currentProducts.map(p => p.id === id ? { ...p, ...partial } : p);
        set({
          productsByOrg: { ...productsByOrg, [orgId]: updated },
        });
      },

      deleteProduct: (orgId, id) => {
        const { productsByOrg, getProducts } = get();
        const currentProducts = getProducts(orgId, undefined, true);
        const updated = currentProducts.filter(p => p.id !== id);
        set({
          productsByOrg: { ...productsByOrg, [orgId]: updated },
        });
      },

      // ─── Sales ─────────────────────────────────────────────
      getSales: (orgId, businessType, isCustom) => {
        const { salesByOrg } = get();
        if (salesByOrg[orgId]) {
          return salesByOrg[orgId];
        }
        if (isCustom || orgId.startsWith('org_custom_')) {
          return [];
        }
        if (orgId === 'org_apex' || orgId === 'org_enterprise' || businessType === 'manufacturing') {
          return MFG_SALES;
        }
        return RETAIL_SALES;
      },

      addSale: (orgId, saleData) => {
        const { salesByOrg, getSales, productsByOrg, getProducts } = get();
        const currentSales = getSales(orgId, undefined, true);
        const newSale: SalesOrder = {
          ...saleData,
          id: `so_${Date.now()}`,
        };
        const updatedSales = [newSale, ...currentSales];

        // Deduct inventory for sold products
        const currentProducts = getProducts(orgId, undefined, true);
        let updatedProducts = currentProducts;
        if (currentProducts.length > 0) {
          updatedProducts = currentProducts.map(p => {
            const soldItem = newSale.items.find(item => item.productId === p.id || item.productName === p.name);
            if (soldItem) {
              return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
            }
            return p;
          });
        }

        set({
          productsByOrg: { ...productsByOrg, [orgId]: updatedProducts },
          salesByOrg: { ...salesByOrg, [orgId]: updatedSales },
        });
        return newSale;
      },

      updateSaleStatus: (orgId, id, status, paymentStatus) => {
        const { salesByOrg, getSales } = get();
        const currentSales = getSales(orgId, undefined, true);
        const updated = currentSales.map(s => s.id === id ? { 
          ...s, 
          status, 
          ...(paymentStatus ? { paymentStatus } : {}) 
        } : s);
        set({
          salesByOrg: { ...salesByOrg, [orgId]: updated },
        });
      },

      deleteSale: (orgId, id) => {
        const { salesByOrg, getSales, productsByOrg, getProducts } = get();
        const currentSales = getSales(orgId, undefined, true);
        const saleToDelete = currentSales.find(s => s.id === id);
        const updatedSales = currentSales.filter(s => s.id !== id);

        // Restore deducted inventory when a sale is deleted
        let updatedProducts = getProducts(orgId, undefined, true);
        if (saleToDelete && saleToDelete.items && updatedProducts.length > 0) {
          updatedProducts = updatedProducts.map(p => {
            const soldItem = saleToDelete.items.find(item => item.productId === p.id || item.productName === p.name);
            if (soldItem) {
              return { ...p, stock: p.stock + soldItem.quantity };
            }
            return p;
          });
        }

        set({
          productsByOrg: { ...productsByOrg, [orgId]: updatedProducts },
          salesByOrg: { ...salesByOrg, [orgId]: updatedSales },
        });
      },

      // ─── Customers ──────────────────────────────────────────
      getCustomers: (orgId, isCustom) => {
        const { customersByOrg } = get();
        if (customersByOrg[orgId]) {
          return customersByOrg[orgId];
        }
        if (isCustom || orgId.startsWith('org_custom_')) {
          return [];
        }
        return RETAIL_CUSTOMERS;
      },

      addCustomer: (orgId, customerData) => {
        const { customersByOrg, getCustomers } = get();
        const currentCustomers = getCustomers(orgId, true);
        const newCustomer: Customer = {
          ...customerData,
          id: `cust_${Date.now()}`,
          totalOrders: 0,
          totalRevenue: 0,
          outstandingAmount: 0,
          lastOrderDate: new Date().toISOString().split('T')[0],
        };
        const updated = [newCustomer, ...currentCustomers];
        set({
          customersByOrg: { ...customersByOrg, [orgId]: updated },
        });
        return newCustomer;
      },

      deleteCustomer: (orgId, id) => {
        const { customersByOrg, getCustomers } = get();
        const currentCustomers = getCustomers(orgId, true);
        const updated = currentCustomers.filter(c => c.id !== id);
        set({
          customersByOrg: { ...customersByOrg, [orgId]: updated },
        });
      },

      // ─── Suppliers ──────────────────────────────────────────
      getSuppliers: (orgId, isCustom) => {
        const { suppliersByOrg } = get();
        if (suppliersByOrg[orgId]) {
          return suppliersByOrg[orgId];
        }
        if (isCustom || orgId.startsWith('org_custom_')) {
          return [];
        }
        return RETAIL_SUPPLIERS;
      },

      addSupplier: (orgId, supplierData) => {
        const { suppliersByOrg, getSuppliers } = get();
        const currentSuppliers = getSuppliers(orgId, true);
        const newSupplier: Supplier = {
          ...supplierData,
          id: `sup_${Date.now()}`,
          productsSupplied: 1,
          avgLeadTime: 3,
          qualityRating: 95,
          reliabilityScore: 95,
          totalOrders: 0,
          totalSpend: 0,
          lastOrderDate: new Date().toISOString().split('T')[0],
        };
        const updated = [newSupplier, ...currentSuppliers];
        set({
          suppliersByOrg: { ...suppliersByOrg, [orgId]: updated },
        });
        return newSupplier;
      },

      deleteSupplier: (orgId, id) => {
        const { suppliersByOrg, getSuppliers } = get();
        const currentSuppliers = getSuppliers(orgId, true);
        const updated = currentSuppliers.filter(s => s.id !== id);
        set({
          suppliersByOrg: { ...suppliersByOrg, [orgId]: updated },
        });
      },

      // ─── Purchases ──────────────────────────────────────────
      getPurchases: (orgId, isCustom) => {
        const { purchasesByOrg } = get();
        if (purchasesByOrg[orgId]) {
          return purchasesByOrg[orgId];
        }
        if (isCustom || orgId.startsWith('org_custom_')) {
          return [];
        }
        return RETAIL_PURCHASES;
      },

      addPurchase: (orgId, purchaseData) => {
        const { purchasesByOrg, getPurchases, productsByOrg, getProducts } = get();
        const currentPurchases = getPurchases(orgId, true);
        const newPurchase: PurchaseOrder = {
          ...purchaseData,
          id: `po_${Date.now()}`,
        };
        const updatedPurchases = [newPurchase, ...currentPurchases];

        // Increment inventory for received items
        const currentProducts = getProducts(orgId, undefined, true);
        if (currentProducts.length > 0) {
          const updatedProducts = currentProducts.map(p => {
            const purchasedItem = newPurchase.items.find(item => item.productId === p.id || item.productName === p.name);
            if (purchasedItem) {
              return { ...p, stock: p.stock + purchasedItem.quantity };
            }
            return p;
          });
          set({
            productsByOrg: { ...productsByOrg, [orgId]: updatedProducts },
          });
        }

        set({
          purchasesByOrg: { ...purchasesByOrg, [orgId]: updatedPurchases },
        });
        return newPurchase;
      },

      // ─── Expenses ───────────────────────────────────────────
      getExpenses: (orgId, isCustom) => {
        const { expensesByOrg } = get();
        if (expensesByOrg[orgId]) {
          return expensesByOrg[orgId];
        }
        if (isCustom || orgId.startsWith('org_custom_')) {
          return [];
        }
        return RETAIL_EXPENSES;
      },

      addExpense: (orgId, expenseData) => {
        const { expensesByOrg, getExpenses } = get();
        const currentExpenses = getExpenses(orgId, true);
        const newExpense: Expense = {
          ...expenseData,
          id: `exp_${Date.now()}`,
        };
        const updated = [newExpense, ...currentExpenses];
        set({
          expensesByOrg: { ...expensesByOrg, [orgId]: updated },
        });
        return newExpense;
      },

      // ─── Inventory Calculated from Products ─────────────────
      getInventory: (orgId, businessType, isCustom) => {
        const { getProducts } = get();
        const products = getProducts(orgId, businessType, isCustom);

        return products.map(p => {
          const risk: InventoryItem['risk'] = 
            p.stock <= 0 ? 'critical' :
            p.stock <= p.reorderPoint ? 'high' :
            p.stock <= p.reorderPoint * 1.5 ? 'medium' : 'low';

          return {
            id: `inv_${p.id}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            category: p.category,
            available: p.stock,
            reserved: 0,
            incoming: 0,
            outgoing: 0,
            safetyStock: p.reorderPoint,
            reorderPoint: p.reorderPoint,
            unitCost: p.costPrice,
            totalValue: p.stock * p.costPrice,
            daysRemaining: p.stock > 0 ? Math.round(p.stock / 2) : 0,
            risk,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        });
      },

      // ─── Sample Data Loader / Cleaner ───────────────────────
      loadSampleData: (orgId, businessType) => {
        const { productsByOrg, salesByOrg, customersByOrg, suppliersByOrg, purchasesByOrg, expensesByOrg } = get();
        const sampleProducts = businessType === 'manufacturing' ? MFG_PRODUCTS : RETAIL_PRODUCTS;
        const sampleSales = businessType === 'manufacturing' ? MFG_SALES : RETAIL_SALES;

        set({
          productsByOrg: { ...productsByOrg, [orgId]: sampleProducts },
          salesByOrg: { ...salesByOrg, [orgId]: sampleSales },
          customersByOrg: { ...customersByOrg, [orgId]: RETAIL_CUSTOMERS },
          suppliersByOrg: { ...suppliersByOrg, [orgId]: RETAIL_SUPPLIERS },
          purchasesByOrg: { ...purchasesByOrg, [orgId]: RETAIL_PURCHASES },
          expensesByOrg: { ...expensesByOrg, [orgId]: RETAIL_EXPENSES },
        });
      },

      clearShopData: (orgId) => {
        const { productsByOrg, salesByOrg, customersByOrg, suppliersByOrg, purchasesByOrg, expensesByOrg } = get();
        set({
          productsByOrg: { ...productsByOrg, [orgId]: [] },
          salesByOrg: { ...salesByOrg, [orgId]: [] },
          customersByOrg: { ...customersByOrg, [orgId]: [] },
          suppliersByOrg: { ...suppliersByOrg, [orgId]: [] },
          purchasesByOrg: { ...purchasesByOrg, [orgId]: [] },
          expensesByOrg: { ...expensesByOrg, [orgId]: [] },
        });
      },
    }),
    {
      name: 'factorybrain-shop-data-v1',
    }
  )
);
