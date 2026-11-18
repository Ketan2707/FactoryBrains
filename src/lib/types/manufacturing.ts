// ─── Manufacturing Types ────────────────────────────────────

export interface BOM {
  id: string;
  productId: string;
  productName: string;
  version: string;
  status: 'draft' | 'active' | 'obsolete';
  effectiveDate: string;
  components: BOMComponent[];
  totalCost: number;
  lastModified: string;
}

export interface BOMComponent {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplierId?: string;
  supplierName?: string;
  leadTime?: number;
}

// ─── Production ─────────────────────────────────────────────

export type ProductionOrderStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  completedQuantity: number;
  startDate: string;
  endDate: string;
  status: ProductionOrderStatus;
  workCenter: string;
  productionLine: string;
  efficiency: number; // percentage
  scrapRate: number; // percentage
  assignedTo?: string;
  salesOrderId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface WorkOrder {
  id: string;
  productionOrderId: string;
  operation: string;
  machineId: string;
  machineName: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  operator?: string;
  completedUnits: number;
  targetUnits: number;
}

// ─── Machines ───────────────────────────────────────────────

export type MachineStatus = 'running' | 'idle' | 'maintenance' | 'down' | 'offline';

export interface Machine {
  id: string;
  machineId: string; // e.g., "MCH-007"
  name: string;
  type: string;
  location: string;
  plant: string;
  status: MachineStatus;
  healthScore: number; // 0-100
  failureRisk: number; // 0-100
  utilization: number; // percentage
  runtime: number; // hours
  temperature?: number;
  vibration?: number;
  current?: number;
  predictedMaintenance?: string; // "3-6 days"
  lastMaintenance: string;
  nextScheduledMaintenance?: string;
  totalDowntime: number; // hours this month
  productionLine: string;
}

export interface MachineReading {
  id: string;
  machineId: string;
  timestamp: string;
  temperature: number;
  vibration: number;
  current: number;
  runtime: number;
  status: MachineStatus;
}

// ─── Maintenance ────────────────────────────────────────────

export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'emergency';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface MaintenanceTask {
  id: string;
  taskNumber: string;
  machineId: string;
  machineName: string;
  type: MaintenanceType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: MaintenanceStatus;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  assignedTo: string;
  estimatedDuration: number; // hours
  actualDuration?: number;
  cost?: number;
  aiRecommended: boolean;
  failureProbability?: number;
}

// ─── Quality ────────────────────────────────────────────────

export type InspectionResult = 'passed' | 'failed' | 'partial';

export interface QualityInspection {
  id: string;
  inspectionNumber: string;
  batchId: string;
  batchNumber: string;
  productId: string;
  productName: string;
  inspectionDate: string;
  inspector: string;
  result: InspectionResult;
  totalChecked: number;
  passed: number;
  failed: number;
  defectRate: number; // percentage
  defects: QualityDefect[];
  notes?: string;
}

export interface QualityDefect {
  id: string;
  type: string;
  severity: 'minor' | 'major' | 'critical';
  count: number;
  description: string;
  rootCause?: string;
}

// ─── Shifts & Workforce ─────────────────────────────────────

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  plant: string;
  shift: string;
  email: string;
  phone: string;
  status: 'active' | 'on_leave' | 'inactive';
  joinDate: string;
  skills: string[];
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  employees: number;
  plant: string;
}
