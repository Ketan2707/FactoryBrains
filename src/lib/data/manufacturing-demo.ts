import type { Product, Customer, Supplier, SalesOrder, PurchaseOrder, InventoryItem, Expense } from '@/lib/types/entities';
import type { BOM, ProductionOrder, Machine, MaintenanceTask, QualityInspection, Employee } from '@/lib/types/manufacturing';

// ─── Apex Motion Products ───────────────────────────────────

export const MFG_PRODUCTS: Product[] = [
  { id: 'mp_1', name: 'Electric Motor X200', sku: 'AMI-MOT-X200', category: 'Motors', unit: 'units', costPrice: 12400, sellingPrice: 18500, taxRate: 18, supplierId: 'ms_1', supplierName: 'MetalPro Alloys', stock: 124, reorderPoint: 40, status: 'active', bomId: 'bom_1', manufacturingLeadTime: 5, productionCost: 14200 },
  { id: 'mp_2', name: 'Electric Motor X500', sku: 'AMI-MOT-X500', category: 'Motors', unit: 'units', costPrice: 24800, sellingPrice: 38000, taxRate: 18, supplierId: 'ms_1', supplierName: 'MetalPro Alloys', stock: 67, reorderPoint: 25, status: 'active', bomId: 'bom_2', manufacturingLeadTime: 8, productionCost: 28600 },
  { id: 'mp_3', name: 'Industrial Pump P100', sku: 'AMI-PMP-P100', category: 'Pumps', unit: 'units', costPrice: 8900, sellingPrice: 14200, taxRate: 18, supplierId: 'ms_2', supplierName: 'Bharat Copper Corp', stock: 89, reorderPoint: 30, status: 'active', bomId: 'bom_3', manufacturingLeadTime: 4, productionCost: 10500 },
  { id: 'mp_4', name: 'Industrial Pump P300', sku: 'AMI-PMP-P300', category: 'Pumps', unit: 'units', costPrice: 18200, sellingPrice: 28500, taxRate: 18, supplierId: 'ms_2', supplierName: 'Bharat Copper Corp', stock: 34, reorderPoint: 15, status: 'active', bomId: 'bom_4', manufacturingLeadTime: 7, productionCost: 21400 },
  { id: 'mp_5', name: 'Copper Wire Coil', sku: 'AMI-RAW-COP', category: 'Raw Materials', unit: 'kg', costPrice: 740, sellingPrice: 0, taxRate: 18, supplierId: 'ms_2', supplierName: 'Bharat Copper Corp', stock: 890, reorderPoint: 400, status: 'active' },
  { id: 'mp_6', name: 'Steel Sheet (Grade A)', sku: 'AMI-RAW-STL', category: 'Raw Materials', unit: 'kg', costPrice: 82, sellingPrice: 0, taxRate: 18, supplierId: 'ms_1', supplierName: 'MetalPro Alloys', stock: 4200, reorderPoint: 1500, status: 'active' },
  { id: 'mp_7', name: 'Precision Bearing 6204', sku: 'AMI-CMP-BRG', category: 'Components', unit: 'pcs', costPrice: 340, sellingPrice: 0, taxRate: 18, supplierId: 'ms_3', supplierName: 'Precision Parts Ltd', stock: 560, reorderPoint: 200, status: 'active' },
  { id: 'mp_8', name: 'Rotor Assembly', sku: 'AMI-CMP-ROT', category: 'Components', unit: 'pcs', costPrice: 2800, sellingPrice: 0, taxRate: 18, supplierId: 'ms_3', supplierName: 'Precision Parts Ltd', stock: 145, reorderPoint: 50, status: 'active' },
];

// ─── Apex Motion BOM ────────────────────────────────────────

export const MFG_BOMS: BOM[] = [
  {
    id: 'bom_1', productId: 'mp_1', productName: 'Electric Motor X200', version: 'v2.3', status: 'active', effectiveDate: '2026-01-15',
    components: [
      { id: 'bc_1', materialId: 'mp_5', materialName: 'Copper Wire Coil', quantity: 2.5, unit: 'kg', unitCost: 740, totalCost: 1850, supplierId: 'ms_2', supplierName: 'Bharat Copper Corp', leadTime: 7 },
      { id: 'bc_2', materialId: 'mp_6', materialName: 'Steel Sheet (Grade A)', quantity: 4, unit: 'kg', unitCost: 82, totalCost: 328, supplierId: 'ms_1', supplierName: 'MetalPro Alloys', leadTime: 5 },
      { id: 'bc_3', materialId: 'mp_7', materialName: 'Precision Bearing 6204', quantity: 2, unit: 'pcs', unitCost: 340, totalCost: 680, supplierId: 'ms_3', supplierName: 'Precision Parts Ltd', leadTime: 10 },
      { id: 'bc_4', materialId: 'mp_8', materialName: 'Rotor Assembly', quantity: 1, unit: 'pcs', unitCost: 2800, totalCost: 2800, supplierId: 'ms_3', supplierName: 'Precision Parts Ltd', leadTime: 12 },
      { id: 'bc_5', materialId: 'misc_1', materialName: 'M6 Hex Bolts', quantity: 12, unit: 'pcs', unitCost: 8, totalCost: 96, leadTime: 3 },
    ],
    totalCost: 5754, lastModified: '2026-07-10',
  },
  {
    id: 'bom_2', productId: 'mp_2', productName: 'Electric Motor X500', version: 'v1.8', status: 'active', effectiveDate: '2026-03-01',
    components: [
      { id: 'bc_6', materialId: 'mp_5', materialName: 'Copper Wire Coil', quantity: 5.5, unit: 'kg', unitCost: 740, totalCost: 4070, supplierId: 'ms_2', supplierName: 'Bharat Copper Corp', leadTime: 7 },
      { id: 'bc_7', materialId: 'mp_6', materialName: 'Steel Sheet (Grade A)', quantity: 8, unit: 'kg', unitCost: 82, totalCost: 656, supplierId: 'ms_1', supplierName: 'MetalPro Alloys', leadTime: 5 },
      { id: 'bc_8', materialId: 'mp_7', materialName: 'Precision Bearing 6204', quantity: 4, unit: 'pcs', unitCost: 340, totalCost: 1360, supplierId: 'ms_3', supplierName: 'Precision Parts Ltd', leadTime: 10 },
      { id: 'bc_9', materialId: 'mp_8', materialName: 'Rotor Assembly', quantity: 2, unit: 'pcs', unitCost: 2800, totalCost: 5600, supplierId: 'ms_3', supplierName: 'Precision Parts Ltd', leadTime: 12 },
      { id: 'bc_10', materialId: 'misc_1', materialName: 'M6 Hex Bolts', quantity: 24, unit: 'pcs', unitCost: 8, totalCost: 192, leadTime: 3 },
    ],
    totalCost: 11878, lastModified: '2026-06-15',
  },
  {
    id: 'bom_3', productId: 'mp_3', productName: 'Industrial Pump P100', version: 'v3.1', status: 'active', effectiveDate: '2025-11-01',
    components: [
      { id: 'bc_11', materialId: 'mp_6', materialName: 'Steel Sheet (Grade A)', quantity: 6, unit: 'kg', unitCost: 82, totalCost: 492, supplierId: 'ms_1', supplierName: 'MetalPro Alloys', leadTime: 5 },
      { id: 'bc_12', materialId: 'mp_7', materialName: 'Precision Bearing 6204', quantity: 3, unit: 'pcs', unitCost: 340, totalCost: 1020, supplierId: 'ms_3', supplierName: 'Precision Parts Ltd', leadTime: 10 },
      { id: 'bc_13', materialId: 'misc_2', materialName: 'Pump Impeller', quantity: 1, unit: 'pcs', unitCost: 1800, totalCost: 1800, leadTime: 8 },
      { id: 'bc_14', materialId: 'misc_3', materialName: 'Mechanical Seal', quantity: 1, unit: 'pcs', unitCost: 920, totalCost: 920, leadTime: 6 },
    ],
    totalCost: 4232, lastModified: '2026-05-20',
  },
  {
    id: 'bom_4', productId: 'mp_4', productName: 'Industrial Pump P300', version: 'v2.0', status: 'active', effectiveDate: '2026-02-01',
    components: [
      { id: 'bc_15', materialId: 'mp_5', materialName: 'Copper Wire Coil', quantity: 1.5, unit: 'kg', unitCost: 740, totalCost: 1110, supplierId: 'ms_2', supplierName: 'Bharat Copper Corp', leadTime: 7 },
      { id: 'bc_16', materialId: 'mp_6', materialName: 'Steel Sheet (Grade A)', quantity: 12, unit: 'kg', unitCost: 82, totalCost: 984, supplierId: 'ms_1', supplierName: 'MetalPro Alloys', leadTime: 5 },
      { id: 'bc_17', materialId: 'mp_7', materialName: 'Precision Bearing 6204', quantity: 4, unit: 'pcs', unitCost: 340, totalCost: 1360, supplierId: 'ms_3', supplierName: 'Precision Parts Ltd', leadTime: 10 },
      { id: 'bc_18', materialId: 'misc_2', materialName: 'Pump Impeller (Heavy Duty)', quantity: 1, unit: 'pcs', unitCost: 3200, totalCost: 3200, leadTime: 10 },
      { id: 'bc_19', materialId: 'misc_3', materialName: 'Mechanical Seal', quantity: 2, unit: 'pcs', unitCost: 920, totalCost: 1840, leadTime: 6 },
    ],
    totalCost: 8494, lastModified: '2026-04-12',
  },
];

// ─── Apex Motion Machines ───────────────────────────────────

export const MFG_MACHINES: Machine[] = [
  { id: 'mch_1', machineId: 'MCH-001', name: 'CNC Lathe Alpha', type: 'CNC Lathe', location: 'Bay A', plant: 'Chandigarh Plant', status: 'running', healthScore: 94, failureRisk: 12, utilization: 87, runtime: 6420, temperature: 42, vibration: 1.2, current: 18.4, lastMaintenance: '2026-08-10', nextScheduledMaintenance: '2026-09-10', totalDowntime: 4, productionLine: 'Line 1' },
  { id: 'mch_2', machineId: 'MCH-002', name: 'CNC Lathe Beta', type: 'CNC Lathe', location: 'Bay A', plant: 'Chandigarh Plant', status: 'running', healthScore: 88, failureRisk: 24, utilization: 82, runtime: 5890, temperature: 45, vibration: 1.8, current: 19.1, lastMaintenance: '2026-07-28', nextScheduledMaintenance: '2026-09-05', totalDowntime: 8, productionLine: 'Line 1' },
  { id: 'mch_3', machineId: 'MCH-003', name: 'Hydraulic Press HP-500', type: 'Hydraulic Press', location: 'Bay B', plant: 'Chandigarh Plant', status: 'running', healthScore: 91, failureRisk: 18, utilization: 79, runtime: 4200, temperature: 38, vibration: 0.8, current: 32.5, lastMaintenance: '2026-08-15', nextScheduledMaintenance: '2026-09-15', totalDowntime: 2, productionLine: 'Line 2' },
  { id: 'mch_4', machineId: 'MCH-004', name: 'Winding Machine W-200', type: 'Winding Machine', location: 'Bay C', plant: 'Chandigarh Plant', status: 'idle', healthScore: 96, failureRisk: 8, utilization: 65, runtime: 3800, temperature: 35, vibration: 0.5, current: 12.2, lastMaintenance: '2026-08-20', totalDowntime: 1, productionLine: 'Line 1' },
  { id: 'mch_5', machineId: 'MCH-005', name: 'Assembly Robot AR-1', type: 'Assembly Robot', location: 'Bay D', plant: 'Delhi Plant', status: 'running', healthScore: 92, failureRisk: 15, utilization: 91, runtime: 7100, temperature: 40, vibration: 0.9, current: 15.8, lastMaintenance: '2026-08-05', nextScheduledMaintenance: '2026-09-05', totalDowntime: 3, productionLine: 'Line 3' },
  { id: 'mch_6', machineId: 'MCH-006', name: 'Grinding Machine GR-300', type: 'Grinding Machine', location: 'Bay B', plant: 'Delhi Plant', status: 'maintenance', healthScore: 68, failureRisk: 52, utilization: 72, runtime: 5400, temperature: 52, vibration: 3.2, current: 28.9, lastMaintenance: '2026-06-15', totalDowntime: 18, productionLine: 'Line 3' },
  { id: 'mch_7', machineId: 'MCH-007', name: 'Injection Molder IM-800', type: 'Injection Molder', location: 'Bay A', plant: 'Pune Plant', status: 'running', healthScore: 71, failureRisk: 82, utilization: 88, runtime: 8200, temperature: 68, vibration: 4.1, current: 45.2, predictedMaintenance: '3–6 days', lastMaintenance: '2026-06-20', totalDowntime: 24, productionLine: 'Line 4' },
  { id: 'mch_8', machineId: 'MCH-008', name: 'Testing Bench TB-100', type: 'Testing Equipment', location: 'QC Lab', plant: 'Chandigarh Plant', status: 'running', healthScore: 97, failureRisk: 5, utilization: 54, runtime: 2800, temperature: 28, vibration: 0.2, current: 8.4, lastMaintenance: '2026-08-25', totalDowntime: 0, productionLine: 'QC' },
  { id: 'mch_9', machineId: 'MCH-009', name: 'CNC Milling Center MC-1', type: 'CNC Mill', location: 'Bay C', plant: 'Pune Plant', status: 'down', healthScore: 42, failureRisk: 94, utilization: 0, runtime: 9100, temperature: 22, vibration: 0.1, current: 0, lastMaintenance: '2026-05-10', totalDowntime: 48, productionLine: 'Line 4' },
  { id: 'mch_10', machineId: 'MCH-010', name: 'Packaging Unit PK-200', type: 'Packaging', location: 'Bay E', plant: 'Delhi Plant', status: 'running', healthScore: 89, failureRisk: 20, utilization: 76, runtime: 4600, temperature: 30, vibration: 0.6, current: 10.5, lastMaintenance: '2026-08-12', nextScheduledMaintenance: '2026-09-12', totalDowntime: 2, productionLine: 'Packaging' },
];

// ─── Apex Motion Production Orders ──────────────────────────

export const MFG_PRODUCTION_ORDERS: ProductionOrder[] = [
  { id: 'po_1', orderNumber: 'PRD-2026-0891', productId: 'mp_1', productName: 'Electric Motor X200', quantity: 50, completedQuantity: 42, startDate: '2026-08-25', endDate: '2026-09-02', status: 'in_progress', workCenter: 'Motor Assembly', productionLine: 'Line 1', efficiency: 91, scrapRate: 2.1, assignedTo: 'Amit Kumar', salesOrderId: 'mso_1', priority: 'high' },
  { id: 'po_2', orderNumber: 'PRD-2026-0890', productId: 'mp_2', productName: 'Electric Motor X500', quantity: 25, completedQuantity: 25, startDate: '2026-08-20', endDate: '2026-08-29', status: 'completed', workCenter: 'Motor Assembly', productionLine: 'Line 1', efficiency: 94, scrapRate: 1.8, assignedTo: 'Suresh Reddy', priority: 'medium' },
  { id: 'po_3', orderNumber: 'PRD-2026-0892', productId: 'mp_3', productName: 'Industrial Pump P100', quantity: 40, completedQuantity: 18, startDate: '2026-08-28', endDate: '2026-09-05', status: 'in_progress', workCenter: 'Pump Assembly', productionLine: 'Line 2', efficiency: 86, scrapRate: 3.2, assignedTo: 'Rajesh Gupta', priority: 'medium' },
  { id: 'po_4', orderNumber: 'PRD-2026-0893', productId: 'mp_4', productName: 'Industrial Pump P300', quantity: 15, completedQuantity: 0, startDate: '2026-09-03', endDate: '2026-09-12', status: 'planned', workCenter: 'Pump Assembly', productionLine: 'Line 2', efficiency: 0, scrapRate: 0, assignedTo: 'Deepak Sharma', salesOrderId: 'mso_3', priority: 'low' },
  { id: 'po_5', orderNumber: 'PRD-2026-0894', productId: 'mp_1', productName: 'Electric Motor X200', quantity: 100, completedQuantity: 0, startDate: '2026-09-05', endDate: '2026-09-15', status: 'planned', workCenter: 'Motor Assembly', productionLine: 'Line 1', efficiency: 0, scrapRate: 0, priority: 'critical' },
  { id: 'po_6', orderNumber: 'PRD-2026-0889', productId: 'mp_1', productName: 'Electric Motor X200', quantity: 30, completedQuantity: 30, startDate: '2026-08-15', endDate: '2026-08-22', status: 'completed', workCenter: 'Motor Assembly', productionLine: 'Line 3', efficiency: 92, scrapRate: 1.5, assignedTo: 'Vikram Singh', priority: 'medium' },
];

// ─── Apex Motion Maintenance Tasks ──────────────────────────

export const MFG_MAINTENANCE: MaintenanceTask[] = [
  { id: 'mt_1', taskNumber: 'MT-2026-0341', machineId: 'mch_7', machineName: 'Injection Molder IM-800', type: 'predictive', priority: 'critical', status: 'scheduled', description: 'AI-predicted bearing failure. Vibration levels elevated 3.4x above baseline. Immediate inspection recommended.', scheduledDate: '2026-09-03', assignedTo: 'Ravi Mechanical Team', estimatedDuration: 8, aiRecommended: true, failureProbability: 82 },
  { id: 'mt_2', taskNumber: 'MT-2026-0340', machineId: 'mch_9', machineName: 'CNC Milling Center MC-1', type: 'corrective', priority: 'critical', status: 'in_progress', description: 'Spindle motor replacement. Machine down since Aug 28.', scheduledDate: '2026-08-29', assignedTo: 'Maintenance Team A', estimatedDuration: 16, actualDuration: 12, aiRecommended: false },
  { id: 'mt_3', taskNumber: 'MT-2026-0342', machineId: 'mch_6', machineName: 'Grinding Machine GR-300', type: 'preventive', priority: 'high', status: 'in_progress', description: 'Scheduled preventive maintenance. Wheel replacement and alignment.', scheduledDate: '2026-08-31', assignedTo: 'Sunil Technicians', estimatedDuration: 6, aiRecommended: false },
  { id: 'mt_4', taskNumber: 'MT-2026-0343', machineId: 'mch_2', machineName: 'CNC Lathe Beta', type: 'preventive', priority: 'medium', status: 'scheduled', description: 'Routine coolant system inspection and filter replacement.', scheduledDate: '2026-09-05', assignedTo: 'Maintenance Team B', estimatedDuration: 3, aiRecommended: false },
  { id: 'mt_5', taskNumber: 'MT-2026-0339', machineId: 'mch_5', machineName: 'Assembly Robot AR-1', type: 'preventive', priority: 'low', status: 'completed', description: 'Annual calibration and firmware update.', scheduledDate: '2026-08-20', completedDate: '2026-08-20', assignedTo: 'Automation Team', estimatedDuration: 4, actualDuration: 3.5, aiRecommended: false },
];

// ─── Apex Motion Quality Inspections ────────────────────────

export const MFG_QUALITY: QualityInspection[] = [
  { id: 'qi_1', inspectionNumber: 'QI-2026-1204', batchId: 'batch_101', batchNumber: 'B-2026-101', productId: 'mp_1', productName: 'Electric Motor X200', inspectionDate: '2026-08-31', inspector: 'Anil Kumar', result: 'passed', totalChecked: 42, passed: 41, failed: 1, defectRate: 2.4, defects: [{ id: 'd1', type: 'Winding Defect', severity: 'minor', count: 1, description: 'Slightly uneven winding tension on unit #38' }] },
  { id: 'qi_2', inspectionNumber: 'QI-2026-1203', batchId: 'batch_100', batchNumber: 'B-2026-100', productId: 'mp_2', productName: 'Electric Motor X500', inspectionDate: '2026-08-29', inspector: 'Priya Mehta', result: 'passed', totalChecked: 25, passed: 24, failed: 1, defectRate: 4.0, defects: [{ id: 'd2', type: 'Bearing Noise', severity: 'major', count: 1, description: 'Excessive bearing noise at high RPM in unit #12' }] },
  { id: 'qi_3', inspectionNumber: 'QI-2026-1202', batchId: 'batch_099', batchNumber: 'B-2026-099', productId: 'mp_3', productName: 'Industrial Pump P100', inspectionDate: '2026-08-28', inspector: 'Anil Kumar', result: 'failed', totalChecked: 18, passed: 14, failed: 4, defectRate: 22.2, defects: [{ id: 'd3', type: 'Seal Leak', severity: 'critical', count: 3, description: 'Mechanical seal leakage under pressure test' }, { id: 'd4', type: 'Surface Finish', severity: 'minor', count: 1, description: 'Impeller surface roughness above tolerance' }], notes: 'Batch correlates with Material Batch #882 from new supplier lot.' },
  { id: 'qi_4', inspectionNumber: 'QI-2026-1201', batchId: 'batch_098', batchNumber: 'B-2026-098', productId: 'mp_1', productName: 'Electric Motor X200', inspectionDate: '2026-08-25', inspector: 'Priya Mehta', result: 'passed', totalChecked: 30, passed: 29, failed: 1, defectRate: 3.3, defects: [{ id: 'd5', type: 'Cosmetic', severity: 'minor', count: 1, description: 'Paint scratch on housing' }] },
];

// ─── Apex Motion Suppliers ──────────────────────────────────

export const MFG_SUPPLIERS: Supplier[] = [
  { id: 'ms_1', name: 'MetalPro Alloys', email: 'sales@metalpro.in', phone: '+91 172 456 7890', company: 'MetalPro Alloys Pvt Ltd', city: 'Ludhiana', productsSupplied: 3, avgLeadTime: 5, qualityRating: 94, reliabilityScore: 91, totalOrders: 124, totalSpend: 4820000, status: 'active', lastOrderDate: '2026-08-28' },
  { id: 'ms_2', name: 'Bharat Copper Corp', email: 'orders@bharatcopper.com', phone: '+91 22 789 0123', company: 'Bharat Copper Corporation Ltd', city: 'Mumbai', productsSupplied: 2, avgLeadTime: 7, qualityRating: 89, reliabilityScore: 85, totalOrders: 98, totalSpend: 6540000, status: 'active', lastOrderDate: '2026-08-25' },
  { id: 'ms_3', name: 'Precision Parts Ltd', email: 'supply@precisionparts.in', phone: '+91 20 234 5678', company: 'Precision Parts Ltd', city: 'Pune', productsSupplied: 4, avgLeadTime: 10, qualityRating: 96, reliabilityScore: 93, totalOrders: 87, totalSpend: 3280000, status: 'active', lastOrderDate: '2026-08-30' },
  { id: 'ms_4', name: 'ElectroPower Systems', email: 'info@electropower.in', phone: '+91 11 345 6789', company: 'ElectroPower Systems India', city: 'Delhi', productsSupplied: 2, avgLeadTime: 12, qualityRating: 82, reliabilityScore: 78, totalOrders: 42, totalSpend: 1890000, status: 'active', lastOrderDate: '2026-08-18' },
  { id: 'ms_5', name: 'Chennai Castings', email: 'sales@chennaicasting.com', phone: '+91 44 567 8901', company: 'Chennai Castings & Forgings', city: 'Chennai', productsSupplied: 3, avgLeadTime: 8, qualityRating: 91, reliabilityScore: 88, totalOrders: 56, totalSpend: 2140000, status: 'active', lastOrderDate: '2026-08-22' },
];

// ─── Apex Motion Customers ──────────────────────────────────

export const MFG_CUSTOMERS: Customer[] = [
  { id: 'mc_1', name: 'Tata Power Solutions', email: 'procurement@tatapower.com', phone: '+91 22 678 9012', company: 'Tata Power Solutions Ltd', city: 'Mumbai', totalOrders: 24, totalRevenue: 18400000, outstandingAmount: 2800000, lastOrderDate: '2026-08-28', status: 'active', segment: 'enterprise' },
  { id: 'mc_2', name: 'Reliance Industries', email: 'vendor@reliance.com', phone: '+91 22 789 0123', company: 'Reliance Industries Ltd', city: 'Mumbai', totalOrders: 18, totalRevenue: 14200000, outstandingAmount: 0, lastOrderDate: '2026-08-30', status: 'active', segment: 'enterprise' },
  { id: 'mc_3', name: 'Ashok Leyland', email: 'supply.chain@ashokleyland.com', phone: '+91 44 890 1234', company: 'Ashok Leyland Ltd', city: 'Chennai', totalOrders: 12, totalRevenue: 8900000, outstandingAmount: 1500000, lastOrderDate: '2026-08-25', status: 'active', segment: 'enterprise' },
  { id: 'mc_4', name: 'Kirloskar Brothers', email: 'purchases@kirloskar.com', phone: '+91 20 901 2345', company: 'Kirloskar Brothers Ltd', city: 'Pune', totalOrders: 8, totalRevenue: 4200000, outstandingAmount: 680000, lastOrderDate: '2026-08-22', status: 'active', segment: 'premium' },
  { id: 'mc_5', name: 'Godrej Engineering', email: 'procurement@godrej.com', phone: '+91 22 012 3456', company: 'Godrej & Boyce', city: 'Mumbai', totalOrders: 15, totalRevenue: 11800000, outstandingAmount: 0, lastOrderDate: '2026-08-29', status: 'active', segment: 'enterprise' },
  { id: 'mc_6', name: 'Bharat Heavy Electricals', email: 'vendor.mgmt@bhel.com', phone: '+91 11 123 4567', company: 'BHEL', city: 'Delhi', totalOrders: 6, totalRevenue: 5600000, outstandingAmount: 2200000, lastOrderDate: '2026-08-20', status: 'active', segment: 'enterprise' },
];

// ─── Apex Motion Sales Orders ───────────────────────────────

export const MFG_SALES: SalesOrder[] = [
  { id: 'mso_1', orderNumber: 'SO-2026-0482', customerId: 'mc_1', customerName: 'Tata Power Solutions', orderDate: '2026-08-28', deliveryDate: '2026-09-10', status: 'processing', items: [{ id: 'mi1', productId: 'mp_1', productName: 'Electric Motor X200', quantity: 50, unitPrice: 18500, discount: 2, tax: 162540, total: 1067540 }], subtotal: 925000, tax: 162540, discount: 18500, total: 1067540, paymentStatus: 'partial', amountPaid: 500000, productionStatus: 'in_production', deliveryRisk: 'medium' },
  { id: 'mso_2', orderNumber: 'SO-2026-0481', customerId: 'mc_2', customerName: 'Reliance Industries', orderDate: '2026-08-25', deliveryDate: '2026-09-05', status: 'processing', items: [{ id: 'mi2', productId: 'mp_2', productName: 'Electric Motor X500', quantity: 20, unitPrice: 38000, discount: 3, tax: 132468, total: 869268 }], subtotal: 760000, tax: 132468, discount: 22800, total: 869268, paymentStatus: 'paid', amountPaid: 869268, productionStatus: 'completed', deliveryRisk: 'low' },
  { id: 'mso_3', orderNumber: 'SO-2026-0483', customerId: 'mc_3', customerName: 'Ashok Leyland', orderDate: '2026-08-30', deliveryDate: '2026-09-18', status: 'confirmed', items: [{ id: 'mi3', productId: 'mp_4', productName: 'Industrial Pump P300', quantity: 15, unitPrice: 28500, discount: 0, tax: 76950, total: 504450 }], subtotal: 427500, tax: 76950, discount: 0, total: 504450, paymentStatus: 'unpaid', amountPaid: 0, productionStatus: 'not_started', deliveryRisk: 'low' },
  { id: 'mso_4', orderNumber: 'SO-2026-0484', customerId: 'mc_5', customerName: 'Godrej Engineering', orderDate: '2026-08-29', deliveryDate: '2026-09-08', status: 'processing', items: [{ id: 'mi4', productId: 'mp_3', productName: 'Industrial Pump P100', quantity: 30, unitPrice: 14200, discount: 1.5, tax: 75438, total: 494838 }], subtotal: 426000, tax: 75438, discount: 6390, total: 494838, paymentStatus: 'partial', amountPaid: 250000, productionStatus: 'in_production', deliveryRisk: 'high' },
];

// ─── Apex Motion Employees ──────────────────────────────────

export const MFG_EMPLOYEES: Employee[] = [
  { id: 'me_1', employeeId: 'EMP-001', name: 'Amit Kumar', role: 'Production Manager', department: 'Production', plant: 'Chandigarh Plant', shift: 'Day', email: 'amit.k@apexmotion.com', phone: '+91 98765 00001', status: 'active', joinDate: '2021-03-15', skills: ['Motor Assembly', 'Quality Control', 'Team Management'] },
  { id: 'me_2', employeeId: 'EMP-002', name: 'Suresh Reddy', role: 'Senior Operator', department: 'Production', plant: 'Chandigarh Plant', shift: 'Day', email: 'suresh.r@apexmotion.com', phone: '+91 98765 00002', status: 'active', joinDate: '2019-07-01', skills: ['CNC Operation', 'Motor Assembly', 'Winding'] },
  { id: 'me_3', employeeId: 'EMP-003', name: 'Rajesh Gupta', role: 'Operator', department: 'Production', plant: 'Chandigarh Plant', shift: 'Night', email: 'rajesh.g@apexmotion.com', phone: '+91 98765 00003', status: 'active', joinDate: '2022-01-10', skills: ['Pump Assembly', 'Testing'] },
  { id: 'me_4', employeeId: 'EMP-004', name: 'Deepak Sharma', role: 'Production Planner', department: 'Planning', plant: 'Chandigarh Plant', shift: 'Day', email: 'deepak.s@apexmotion.com', phone: '+91 98765 00004', status: 'active', joinDate: '2020-09-20', skills: ['Production Planning', 'Scheduling', 'ERP'] },
  { id: 'me_5', employeeId: 'EMP-005', name: 'Priya Mehta', role: 'Quality Inspector', department: 'Quality', plant: 'Chandigarh Plant', shift: 'Day', email: 'priya.m@apexmotion.com', phone: '+91 98765 00005', status: 'active', joinDate: '2021-06-15', skills: ['Quality Inspection', 'Testing', 'Documentation'] },
  { id: 'me_6', employeeId: 'EMP-006', name: 'Vikram Singh', role: 'Maintenance Engineer', department: 'Maintenance', plant: 'Delhi Plant', shift: 'Day', email: 'vikram.s@apexmotion.com', phone: '+91 98765 00006', status: 'active', joinDate: '2020-02-01', skills: ['CNC Maintenance', 'Electrical', 'PLC'] },
  { id: 'me_7', employeeId: 'EMP-007', name: 'Anil Kumar', role: 'Quality Manager', department: 'Quality', plant: 'Chandigarh Plant', shift: 'Day', email: 'anil.k@apexmotion.com', phone: '+91 98765 00007', status: 'active', joinDate: '2018-11-01', skills: ['Quality Management', 'ISO 9001', 'Six Sigma'] },
  { id: 'me_8', employeeId: 'EMP-008', name: 'Neha Patel', role: 'Procurement Officer', department: 'Procurement', plant: 'Chandigarh Plant', shift: 'Day', email: 'neha.p@apexmotion.com', phone: '+91 98765 00008', status: 'active', joinDate: '2023-04-01', skills: ['Vendor Management', 'Negotiation', 'Inventory'] },
];

// ─── Apex Motion Purchase Orders ────────────────────────────

export const MFG_PURCHASES: PurchaseOrder[] = [
  { id: 'mpo_1', poNumber: 'PO-2026-0891', supplierId: 'ms_2', supplierName: 'Bharat Copper Corp', orderDate: '2026-08-25', expectedDate: '2026-09-03', status: 'confirmed', items: [{ id: 'mpi1', productId: 'mp_5', productName: 'Copper Wire Coil', quantity: 500, receivedQuantity: 0, unitPrice: 740, total: 370000 }], subtotal: 370000, tax: 66600, total: 436600, paymentStatus: 'unpaid' },
  { id: 'mpo_2', poNumber: 'PO-2026-0890', supplierId: 'ms_1', supplierName: 'MetalPro Alloys', orderDate: '2026-08-22', expectedDate: '2026-08-28', receivedDate: '2026-08-29', status: 'received', items: [{ id: 'mpi2', productId: 'mp_6', productName: 'Steel Sheet (Grade A)', quantity: 2000, receivedQuantity: 2000, unitPrice: 82, total: 164000 }], subtotal: 164000, tax: 29520, total: 193520, paymentStatus: 'paid' },
  { id: 'mpo_3', poNumber: 'PO-2026-0892', supplierId: 'ms_3', supplierName: 'Precision Parts Ltd', orderDate: '2026-08-28', expectedDate: '2026-09-08', status: 'sent', items: [{ id: 'mpi3', productId: 'mp_7', productName: 'Precision Bearing 6204', quantity: 200, receivedQuantity: 0, unitPrice: 340, total: 68000 }, { id: 'mpi4', productId: 'mp_8', productName: 'Rotor Assembly', quantity: 50, receivedQuantity: 0, unitPrice: 2800, total: 140000 }], subtotal: 208000, tax: 37440, total: 245440, paymentStatus: 'unpaid' },
];

// ─── Apex Motion Inventory ──────────────────────────────────

export const MFG_INVENTORY: InventoryItem[] = [
  { id: 'mi_1', productId: 'mp_1', productName: 'Electric Motor X200', sku: 'AMI-MOT-X200', category: 'Motors', warehouseId: 'loc_wh1', warehouseName: 'Central Warehouse', available: 124, reserved: 50, incoming: 0, outgoing: 0, safetyStock: 30, reorderPoint: 40, unitCost: 14200, totalValue: 1760800, daysRemaining: 18, risk: 'medium', lastUpdated: '2026-08-31T10:00:00Z' },
  { id: 'mi_2', productId: 'mp_2', productName: 'Electric Motor X500', sku: 'AMI-MOT-X500', category: 'Motors', warehouseId: 'loc_wh1', warehouseName: 'Central Warehouse', available: 67, reserved: 20, incoming: 0, outgoing: 0, safetyStock: 15, reorderPoint: 25, unitCost: 28600, totalValue: 1916200, daysRemaining: 32, risk: 'low', lastUpdated: '2026-08-31T10:00:00Z' },
  { id: 'mi_3', productId: 'mp_3', productName: 'Industrial Pump P100', sku: 'AMI-PMP-P100', category: 'Pumps', warehouseId: 'loc_wh1', warehouseName: 'Central Warehouse', available: 89, reserved: 30, incoming: 18, outgoing: 0, safetyStock: 20, reorderPoint: 30, unitCost: 10500, totalValue: 934500, daysRemaining: 24, risk: 'low', lastUpdated: '2026-08-31T10:00:00Z' },
  { id: 'mi_4', productId: 'mp_4', productName: 'Industrial Pump P300', sku: 'AMI-PMP-P300', category: 'Pumps', warehouseId: 'loc_wh1', warehouseName: 'Central Warehouse', available: 34, reserved: 15, incoming: 0, outgoing: 0, safetyStock: 10, reorderPoint: 15, unitCost: 21400, totalValue: 727600, daysRemaining: 14, risk: 'medium', lastUpdated: '2026-08-31T10:00:00Z' },
  { id: 'mi_5', productId: 'mp_5', productName: 'Copper Wire Coil', sku: 'AMI-RAW-COP', category: 'Raw Materials', warehouseId: 'loc_chd', warehouseName: 'Chandigarh Plant', available: 890, reserved: 200, incoming: 500, outgoing: 0, safetyStock: 300, reorderPoint: 400, unitCost: 740, totalValue: 658600, daysRemaining: 9, productionDemand: 480, supplierLeadTime: 7, risk: 'high', lastUpdated: '2026-08-31T10:00:00Z' },
  { id: 'mi_6', productId: 'mp_6', productName: 'Steel Sheet (Grade A)', sku: 'AMI-RAW-STL', category: 'Raw Materials', warehouseId: 'loc_chd', warehouseName: 'Chandigarh Plant', available: 4200, reserved: 800, incoming: 0, outgoing: 0, safetyStock: 1000, reorderPoint: 1500, unitCost: 82, totalValue: 344400, daysRemaining: 28, productionDemand: 1200, supplierLeadTime: 5, risk: 'low', lastUpdated: '2026-08-31T10:00:00Z' },
  { id: 'mi_7', productId: 'mp_7', productName: 'Precision Bearing 6204', sku: 'AMI-CMP-BRG', category: 'Components', warehouseId: 'loc_chd', warehouseName: 'Chandigarh Plant', available: 560, reserved: 120, incoming: 200, outgoing: 0, safetyStock: 150, reorderPoint: 200, unitCost: 340, totalValue: 190400, daysRemaining: 21, productionDemand: 180, supplierLeadTime: 10, risk: 'low', lastUpdated: '2026-08-31T10:00:00Z' },
  { id: 'mi_8', productId: 'mp_8', productName: 'Rotor Assembly', sku: 'AMI-CMP-ROT', category: 'Components', warehouseId: 'loc_chd', warehouseName: 'Chandigarh Plant', available: 145, reserved: 50, incoming: 50, outgoing: 0, safetyStock: 40, reorderPoint: 50, unitCost: 2800, totalValue: 406000, daysRemaining: 12, productionDemand: 75, supplierLeadTime: 12, risk: 'medium', lastUpdated: '2026-08-31T10:00:00Z' },
];

// ─── Apex Motion Expenses ───────────────────────────────────

export const MFG_EXPENSES: Expense[] = [
  { id: 'me_e1', date: '2026-08-31', category: 'Raw Materials', description: 'Copper wire coil procurement - Batch #884', amount: 436600, paymentMethod: 'bank_transfer', vendor: 'Bharat Copper Corp', status: 'approved' },
  { id: 'me_e2', date: '2026-08-29', category: 'Raw Materials', description: 'Steel sheet delivery - Grade A', amount: 193520, paymentMethod: 'bank_transfer', vendor: 'MetalPro Alloys', status: 'approved' },
  { id: 'me_e3', date: '2026-08-31', category: 'Salaries', description: 'Staff salaries - August (all plants)', amount: 1840000, paymentMethod: 'bank_transfer', status: 'approved' },
  { id: 'me_e4', date: '2026-08-30', category: 'Utilities', description: 'Electricity - Chandigarh Plant', amount: 245000, paymentMethod: 'bank_transfer', vendor: 'PSPCL', status: 'approved' },
  { id: 'me_e5', date: '2026-08-30', category: 'Utilities', description: 'Electricity - Delhi Plant', amount: 189000, paymentMethod: 'bank_transfer', vendor: 'BSES', status: 'approved' },
  { id: 'me_e6', date: '2026-08-28', category: 'Maintenance', description: 'CNC Milling Center spindle repair parts', amount: 84000, paymentMethod: 'bank_transfer', vendor: 'CNC Spares India', status: 'approved' },
  { id: 'me_e7', date: '2026-08-25', category: 'Logistics', description: 'Freight charges - Mumbai shipment', amount: 42000, paymentMethod: 'bank_transfer', vendor: 'TransLogix', status: 'approved' },
  { id: 'me_e8', date: '2026-08-20', category: 'Insurance', description: 'Equipment insurance premium - Q3', amount: 128000, paymentMethod: 'bank_transfer', vendor: 'ICICI Lombard', status: 'approved' },
];

// Monthly production data for charts
export const MFG_MONTHLY_PRODUCTION = [
  { month: 'Mar', output: 142, efficiency: 89, defectRate: 2.1 },
  { month: 'Apr', output: 158, efficiency: 91, defectRate: 1.9 },
  { month: 'May', output: 164, efficiency: 92, defectRate: 1.7 },
  { month: 'Jun', output: 148, efficiency: 88, defectRate: 2.4 },
  { month: 'Jul', output: 172, efficiency: 93, defectRate: 1.5 },
  { month: 'Aug', output: 155, efficiency: 90, defectRate: 4.8 },
];

export const MFG_MONTHLY_REVENUE = [
  { month: 'Mar', revenue: 2840000, cost: 2120000, profit: 720000 },
  { month: 'Apr', revenue: 3210000, cost: 2380000, profit: 830000 },
  { month: 'May', revenue: 3450000, cost: 2490000, profit: 960000 },
  { month: 'Jun', revenue: 2980000, cost: 2340000, profit: 640000 },
  { month: 'Jul', revenue: 3680000, cost: 2610000, profit: 1070000 },
  { month: 'Aug', revenue: 3520000, cost: 2780000, profit: 740000 },
];
