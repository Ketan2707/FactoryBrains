import type { Product, Customer, Supplier, SalesOrder, PurchaseOrder, InventoryItem, Expense } from '@/lib/types/entities';

// ─── UrbanMart Products ─────────────────────────────────────

export const RETAIL_PRODUCTS: Product[] = [
  { id: 'rp_1', name: 'Classic Cotton T-Shirt', sku: 'UM-TSH-001', category: 'T-Shirts', unit: 'pcs', costPrice: 280, sellingPrice: 599, taxRate: 12, supplierId: 'rs_1', supplierName: 'Fabric World Textiles', stock: 145, reorderPoint: 50, status: 'active' },
  { id: 'rp_2', name: 'Slim Fit Denim Jeans', sku: 'UM-JNS-001', category: 'Jeans', unit: 'pcs', costPrice: 650, sellingPrice: 1499, taxRate: 12, supplierId: 'rs_2', supplierName: 'DenimCraft Industries', stock: 78, reorderPoint: 30, status: 'active' },
  { id: 'rp_3', name: 'Running Sports Shoes', sku: 'UM-SHO-001', category: 'Shoes', unit: 'pairs', costPrice: 920, sellingPrice: 2199, taxRate: 18, supplierId: 'rs_3', supplierName: 'StepRight Footwear', stock: 42, reorderPoint: 20, status: 'active' },
  { id: 'rp_4', name: 'Winter Puffer Jacket', sku: 'UM-JKT-001', category: 'Jackets', unit: 'pcs', costPrice: 1100, sellingPrice: 2899, taxRate: 12, supplierId: 'rs_1', supplierName: 'Fabric World Textiles', stock: 18, reorderPoint: 15, status: 'active' },
  { id: 'rp_5', name: 'Leather Belt', sku: 'UM-ACC-001', category: 'Accessories', unit: 'pcs', costPrice: 180, sellingPrice: 499, taxRate: 12, supplierId: 'rs_4', supplierName: 'Metro Accessories', stock: 210, reorderPoint: 40, status: 'active' },
  { id: 'rp_6', name: 'Printed Polo Shirt', sku: 'UM-TSH-002', category: 'T-Shirts', unit: 'pcs', costPrice: 340, sellingPrice: 799, taxRate: 12, supplierId: 'rs_1', supplierName: 'Fabric World Textiles', stock: 92, reorderPoint: 35, status: 'active' },
  { id: 'rp_7', name: 'Cargo Pants', sku: 'UM-PNT-001', category: 'Pants', unit: 'pcs', costPrice: 520, sellingPrice: 1199, taxRate: 12, supplierId: 'rs_2', supplierName: 'DenimCraft Industries', stock: 56, reorderPoint: 25, status: 'active' },
  { id: 'rp_8', name: 'Canvas Sneakers', sku: 'UM-SHO-002', category: 'Shoes', unit: 'pairs', costPrice: 480, sellingPrice: 1099, taxRate: 18, supplierId: 'rs_3', supplierName: 'StepRight Footwear', stock: 8, reorderPoint: 20, status: 'active' },
  { id: 'rp_9', name: 'Cotton Socks (Pack of 3)', sku: 'UM-ACC-002', category: 'Accessories', unit: 'packs', costPrice: 90, sellingPrice: 249, taxRate: 5, supplierId: 'rs_4', supplierName: 'Metro Accessories', stock: 320, reorderPoint: 60, status: 'active' },
  { id: 'rp_10', name: 'Aviator Sunglasses', sku: 'UM-ACC-003', category: 'Accessories', unit: 'pcs', costPrice: 250, sellingPrice: 699, taxRate: 18, supplierId: 'rs_4', supplierName: 'Metro Accessories', stock: 5, reorderPoint: 15, status: 'active' },
  { id: 'rp_11', name: 'Formal Trousers', sku: 'UM-PNT-002', category: 'Pants', unit: 'pcs', costPrice: 580, sellingPrice: 1399, taxRate: 12, supplierId: 'rs_2', supplierName: 'DenimCraft Industries', stock: 34, reorderPoint: 20, status: 'active' },
  { id: 'rp_12', name: 'Hooded Sweatshirt', sku: 'UM-SWT-001', category: 'Sweatshirts', unit: 'pcs', costPrice: 480, sellingPrice: 1099, taxRate: 12, supplierId: 'rs_1', supplierName: 'Fabric World Textiles', stock: 67, reorderPoint: 25, status: 'active' },
];

// ─── UrbanMart Customers ────────────────────────────────────

export const RETAIL_CUSTOMERS: Customer[] = [
  { id: 'rc_1', name: 'Ankit Verma', email: 'ankit.verma@gmail.com', phone: '+91 98765 43210', address: 'Sector 22, Chandigarh', city: 'Chandigarh', totalOrders: 12, totalRevenue: 28400, outstandingAmount: 2400, lastOrderDate: '2026-08-29', status: 'active', segment: 'regular' },
  { id: 'rc_2', name: 'Meera Gupta', email: 'meera.g@gmail.com', phone: '+91 87654 32109', address: 'Rajouri Garden, Delhi', city: 'Delhi', totalOrders: 28, totalRevenue: 67200, outstandingAmount: 0, lastOrderDate: '2026-08-30', status: 'active', segment: 'premium' },
  { id: 'rc_3', name: 'Rohit Singh', email: 'rohit.singh@outlook.com', phone: '+91 76543 21098', address: 'Model Town, Delhi', city: 'Delhi', totalOrders: 5, totalRevenue: 12300, outstandingAmount: 4500, lastOrderDate: '2026-08-25', status: 'active', segment: 'regular' },
  { id: 'rc_4', name: 'Deepika Nair', email: 'deepika.nair@gmail.com', phone: '+91 65432 10987', address: 'Koramangala, Bangalore', city: 'Bangalore', totalOrders: 18, totalRevenue: 45600, outstandingAmount: 1200, lastOrderDate: '2026-08-31', status: 'active', segment: 'premium' },
  { id: 'rc_5', name: 'Arjun Kapoor', email: 'arjun.k@yahoo.com', phone: '+91 54321 09876', address: 'Bandra, Mumbai', city: 'Mumbai', totalOrders: 3, totalRevenue: 8900, outstandingAmount: 8900, lastOrderDate: '2026-08-15', status: 'active', segment: 'regular' },
  { id: 'rc_6', name: 'Sneha Joshi', email: 'sneha.joshi@gmail.com', phone: '+91 43210 98765', address: 'MG Road, Pune', city: 'Pune', totalOrders: 9, totalRevenue: 21800, outstandingAmount: 0, lastOrderDate: '2026-08-28', status: 'active', segment: 'regular' },
  { id: 'rc_7', name: 'Karan Mehta', email: 'karan.m@hotmail.com', phone: '+91 32109 87654', address: 'Connaught Place, Delhi', city: 'Delhi', totalOrders: 15, totalRevenue: 38900, outstandingAmount: 4500, lastOrderDate: '2026-08-27', status: 'active', segment: 'premium' },
  { id: 'rc_8', name: 'Priya Reddy', email: 'priya.reddy@gmail.com', phone: '+91 21098 76543', address: 'Jubilee Hills, Hyderabad', city: 'Hyderabad', totalOrders: 7, totalRevenue: 16400, outstandingAmount: 0, lastOrderDate: '2026-08-22', status: 'active', segment: 'regular' },
];

// ─── UrbanMart Suppliers ────────────────────────────────────

export const RETAIL_SUPPLIERS: Supplier[] = [
  { id: 'rs_1', name: 'Fabric World Textiles', email: 'orders@fabricworld.in', phone: '+91 11 2345 6789', company: 'Fabric World Textiles Pvt Ltd', city: 'Ludhiana', productsSupplied: 4, avgLeadTime: 5, qualityRating: 92, reliabilityScore: 88, totalOrders: 48, totalSpend: 284000, status: 'active', lastOrderDate: '2026-08-28' },
  { id: 'rs_2', name: 'DenimCraft Industries', email: 'supply@denimcraft.in', phone: '+91 11 3456 7890', company: 'DenimCraft Industries Ltd', city: 'Ahmedabad', productsSupplied: 3, avgLeadTime: 7, qualityRating: 89, reliabilityScore: 91, totalOrders: 35, totalSpend: 198000, status: 'active', lastOrderDate: '2026-08-25' },
  { id: 'rs_3', name: 'StepRight Footwear', email: 'sales@stepright.com', phone: '+91 22 4567 8901', company: 'StepRight Footwear Co', city: 'Agra', productsSupplied: 2, avgLeadTime: 10, qualityRating: 86, reliabilityScore: 82, totalOrders: 22, totalSpend: 156000, status: 'active', lastOrderDate: '2026-08-20' },
  { id: 'rs_4', name: 'Metro Accessories', email: 'info@metroacc.in', phone: '+91 22 5678 9012', company: 'Metro Accessories Trading', city: 'Mumbai', productsSupplied: 3, avgLeadTime: 3, qualityRating: 94, reliabilityScore: 96, totalOrders: 52, totalSpend: 124000, status: 'active', lastOrderDate: '2026-08-30' },
];

// ─── UrbanMart Sales Orders ─────────────────────────────────

export const RETAIL_SALES: SalesOrder[] = [
  { id: 'rso_1', orderNumber: 'SO-2026-0841', customerId: 'rc_4', customerName: 'Deepika Nair', orderDate: '2026-08-31', deliveryDate: '2026-09-02', status: 'confirmed', items: [{ id: 'i1', productId: 'rp_1', productName: 'Classic Cotton T-Shirt', quantity: 3, unitPrice: 599, discount: 0, tax: 215.64, total: 2012.64 }, { id: 'i2', productId: 'rp_5', productName: 'Leather Belt', quantity: 1, unitPrice: 499, discount: 0, tax: 59.88, total: 558.88 }], subtotal: 2296, tax: 275.52, discount: 0, total: 2571.52, paymentStatus: 'paid', amountPaid: 2571.52 },
  { id: 'rso_2', orderNumber: 'SO-2026-0840', customerId: 'rc_2', customerName: 'Meera Gupta', orderDate: '2026-08-30', deliveryDate: '2026-09-01', status: 'shipped', items: [{ id: 'i3', productId: 'rp_3', productName: 'Running Sports Shoes', quantity: 1, unitPrice: 2199, discount: 100, tax: 377.82, total: 2476.82 }, { id: 'i4', productId: 'rp_12', productName: 'Hooded Sweatshirt', quantity: 2, unitPrice: 1099, discount: 0, tax: 263.76, total: 2461.76 }], subtotal: 4397, tax: 641.58, discount: 100, total: 4938.58, paymentStatus: 'paid', amountPaid: 4938.58 },
  { id: 'rso_3', orderNumber: 'SO-2026-0839', customerId: 'rc_1', customerName: 'Ankit Verma', orderDate: '2026-08-29', status: 'processing', items: [{ id: 'i5', productId: 'rp_2', productName: 'Slim Fit Denim Jeans', quantity: 2, unitPrice: 1499, discount: 200, tax: 335.76, total: 3133.76 }], subtotal: 2998, tax: 335.76, discount: 200, total: 3133.76, paymentStatus: 'partial', amountPaid: 1500 },
  { id: 'rso_4', orderNumber: 'SO-2026-0838', customerId: 'rc_7', customerName: 'Karan Mehta', orderDate: '2026-08-27', status: 'delivered', items: [{ id: 'i6', productId: 'rp_4', productName: 'Winter Puffer Jacket', quantity: 1, unitPrice: 2899, discount: 0, tax: 347.88, total: 3246.88 }], subtotal: 2899, tax: 347.88, discount: 0, total: 3246.88, paymentStatus: 'unpaid', amountPaid: 0 },
  { id: 'rso_5', orderNumber: 'SO-2026-0837', customerId: 'rc_5', customerName: 'Arjun Kapoor', orderDate: '2026-08-25', status: 'delivered', items: [{ id: 'i7', productId: 'rp_6', productName: 'Printed Polo Shirt', quantity: 4, unitPrice: 799, discount: 0, tax: 383.52, total: 3579.52 }, { id: 'i8', productId: 'rp_9', productName: 'Cotton Socks (Pack of 3)', quantity: 2, unitPrice: 249, discount: 0, tax: 24.9, total: 522.9 }], subtotal: 3694, tax: 408.42, discount: 0, total: 4102.42, paymentStatus: 'unpaid', amountPaid: 0 },
  { id: 'rso_6', orderNumber: 'SO-2026-0836', customerId: 'rc_6', customerName: 'Sneha Joshi', orderDate: '2026-08-28', status: 'delivered', items: [{ id: 'i9', productId: 'rp_7', productName: 'Cargo Pants', quantity: 1, unitPrice: 1199, discount: 0, tax: 143.88, total: 1342.88 }], subtotal: 1199, tax: 143.88, discount: 0, total: 1342.88, paymentStatus: 'paid', amountPaid: 1342.88 },
  { id: 'rso_7', orderNumber: 'SO-2026-0835', customerId: 'rc_3', customerName: 'Rohit Singh', orderDate: '2026-08-25', status: 'confirmed', items: [{ id: 'i10', productId: 'rp_10', productName: 'Aviator Sunglasses', quantity: 2, unitPrice: 699, discount: 50, tax: 242.64, total: 1590.64 }], subtotal: 1398, tax: 242.64, discount: 50, total: 1590.64, paymentStatus: 'unpaid', amountPaid: 0 },
  { id: 'rso_8', orderNumber: 'SO-2026-0834', customerId: 'rc_8', customerName: 'Priya Reddy', orderDate: '2026-08-22', status: 'delivered', items: [{ id: 'i11', productId: 'rp_11', productName: 'Formal Trousers', quantity: 1, unitPrice: 1399, discount: 0, tax: 167.88, total: 1566.88 }, { id: 'i12', productId: 'rp_1', productName: 'Classic Cotton T-Shirt', quantity: 2, unitPrice: 599, discount: 0, tax: 143.76, total: 1341.76 }], subtotal: 2597, tax: 311.64, discount: 0, total: 2908.64, paymentStatus: 'paid', amountPaid: 2908.64 },
];

// ─── UrbanMart Purchase Orders ──────────────────────────────

export const RETAIL_PURCHASES: PurchaseOrder[] = [
  { id: 'rpo_1', poNumber: 'PO-2026-0412', supplierId: 'rs_1', supplierName: 'Fabric World Textiles', orderDate: '2026-08-28', expectedDate: '2026-09-03', status: 'confirmed', items: [{ id: 'pi1', productId: 'rp_1', productName: 'Classic Cotton T-Shirt', quantity: 100, receivedQuantity: 0, unitPrice: 280, total: 28000 }, { id: 'pi2', productId: 'rp_4', productName: 'Winter Puffer Jacket', quantity: 30, receivedQuantity: 0, unitPrice: 1100, total: 33000 }], subtotal: 61000, tax: 7320, total: 68320, paymentStatus: 'unpaid' },
  { id: 'rpo_2', poNumber: 'PO-2026-0411', supplierId: 'rs_3', supplierName: 'StepRight Footwear', orderDate: '2026-08-20', expectedDate: '2026-08-30', receivedDate: '2026-08-31', status: 'received', items: [{ id: 'pi3', productId: 'rp_8', productName: 'Canvas Sneakers', quantity: 40, receivedQuantity: 38, unitPrice: 480, total: 19200 }], subtotal: 19200, tax: 3456, total: 22656, paymentStatus: 'paid' },
  { id: 'rpo_3', poNumber: 'PO-2026-0410', supplierId: 'rs_4', supplierName: 'Metro Accessories', orderDate: '2026-08-25', expectedDate: '2026-08-28', receivedDate: '2026-08-28', status: 'received', items: [{ id: 'pi4', productId: 'rp_10', productName: 'Aviator Sunglasses', quantity: 25, receivedQuantity: 25, unitPrice: 250, total: 6250 }], subtotal: 6250, tax: 1125, total: 7375, paymentStatus: 'paid' },
];

// ─── UrbanMart Inventory ────────────────────────────────────

export const RETAIL_INVENTORY: InventoryItem[] = RETAIL_PRODUCTS.map((p, idx) => ({
  id: `ri_${idx + 1}`,
  productId: p.id,
  productName: p.name,
  sku: p.sku,
  category: p.category,
  available: p.stock,
  reserved: Math.floor(p.stock * 0.05),
  incoming: idx < 3 ? Math.floor(Math.random() * 50) : 0,
  outgoing: Math.floor(Math.random() * 10),
  safetyStock: Math.floor(p.reorderPoint * 0.7),
  reorderPoint: p.reorderPoint,
  unitCost: p.costPrice,
  totalValue: p.stock * p.costPrice,
  risk: p.stock <= p.reorderPoint * 0.5 ? 'critical' : p.stock <= p.reorderPoint ? 'high' : p.stock <= p.reorderPoint * 1.5 ? 'medium' : 'low',
  lastUpdated: '2026-08-31T10:00:00Z',
}));

// ─── UrbanMart Expenses ─────────────────────────────────────

export const RETAIL_EXPENSES: Expense[] = [
  { id: 're_1', date: '2026-08-31', category: 'Rent', description: 'Monthly store rent - August', amount: 45000, paymentMethod: 'bank_transfer', vendor: 'Property Owner', status: 'approved' },
  { id: 're_2', date: '2026-08-30', category: 'Utilities', description: 'Electricity bill - August', amount: 8500, paymentMethod: 'upi', vendor: 'BSES Delhi', status: 'approved' },
  { id: 're_3', date: '2026-08-28', category: 'Marketing', description: 'Social media ads - August', amount: 12000, paymentMethod: 'card', vendor: 'Meta Ads', status: 'approved' },
  { id: 're_4', date: '2026-08-25', category: 'Transport', description: 'Delivery charges - week 4', amount: 3200, paymentMethod: 'cash', vendor: 'Local Transport', status: 'approved' },
  { id: 're_5', date: '2026-08-20', category: 'Packaging', description: 'Packaging materials', amount: 4800, paymentMethod: 'upi', vendor: 'PackRight Solutions', status: 'approved' },
  { id: 're_6', date: '2026-08-31', category: 'Salaries', description: 'Staff salaries - August', amount: 68000, paymentMethod: 'bank_transfer', status: 'pending' },
  { id: 're_7', date: '2026-08-15', category: 'Maintenance', description: 'AC service and repair', amount: 2500, paymentMethod: 'cash', vendor: 'CoolTech Services', status: 'approved' },
  { id: 're_8', date: '2026-08-10', category: 'Software', description: 'POS software subscription', amount: 1500, paymentMethod: 'card', vendor: 'POS Solutions', status: 'approved' },
];

// Monthly sales data for charts
export const RETAIL_MONTHLY_SALES = [
  { month: 'Mar', revenue: 210000, orders: 89 },
  { month: 'Apr', revenue: 245000, orders: 102 },
  { month: 'May', revenue: 238000, orders: 98 },
  { month: 'Jun', revenue: 189000, orders: 76 },
  { month: 'Jul', revenue: 267000, orders: 112 },
  { month: 'Aug', revenue: 284200, orders: 118 },
];

export const RETAIL_CATEGORY_SALES = [
  { category: 'T-Shirts', revenue: 72400, quantity: 142 },
  { category: 'Jeans', revenue: 58900, quantity: 41 },
  { category: 'Shoes', revenue: 48200, quantity: 28 },
  { category: 'Jackets', revenue: 34800, quantity: 12 },
  { category: 'Accessories', revenue: 38400, quantity: 124 },
  { category: 'Pants', revenue: 31500, quantity: 29 },
];
