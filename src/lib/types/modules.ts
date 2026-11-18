export interface ModuleConfig {
  id: string;
  label: string;
  icon: string;
  route: string;
  group: ModuleGroup;
  description: string;
  businessTypes: ('retail' | 'wholesale' | 'services' | 'manufacturing' | 'distribution' | 'other')[];
  requiresEnterprise?: boolean;
}

export type ModuleGroup = 
  | 'core'
  | 'business' 
  | 'manufacturing' 
  | 'intelligence' 
  | 'management' 
  | 'administration';

export const MODULE_GROUPS: Record<ModuleGroup, { label: string; order: number }> = {
  core: { label: 'Core', order: 0 },
  business: { label: 'Business', order: 1 },
  manufacturing: { label: 'Manufacturing', order: 2 },
  intelligence: { label: 'Intelligence', order: 3 },
  management: { label: 'Management', order: 4 },
  administration: { label: 'Administration', order: 5 },
};

export const ALL_MODULES: ModuleConfig[] = [
  // Core
  {
    id: 'dashboard',
    label: 'Command Center',
    icon: 'LayoutDashboard',
    route: '/dashboard',
    group: 'core',
    description: 'Overview of your business at a glance',
    businessTypes: ['retail', 'wholesale', 'services', 'manufacturing', 'distribution', 'other'],
  },
  // Business
  {
    id: 'sales',
    label: 'Quick Billing & POS',
    icon: 'ShoppingCart',
    route: '/sales',
    group: 'business',
    description: 'Fast counter billing, invoices and receipts',
    businessTypes: ['retail', 'wholesale', 'services', 'manufacturing', 'distribution', 'other'],
  },
  {
    id: 'products',
    label: 'Products & Catalog',
    icon: 'Package',
    route: '/products',
    group: 'business',
    description: 'Product catalog, prices and barcodes',
    businessTypes: ['retail', 'wholesale', 'services', 'manufacturing', 'distribution', 'other'],
  },
  {
    id: 'inventory',
    label: 'Live Stock',
    icon: 'Warehouse',
    route: '/inventory',
    group: 'business',
    description: 'Track stock levels and stockout alerts',
    businessTypes: ['retail', 'wholesale', 'manufacturing', 'distribution', 'other'],
  },
  {
    id: 'purchases',
    label: 'Buy Stock (Wholesale)',
    icon: 'Receipt',
    route: '/purchases',
    group: 'business',
    description: 'Purchase orders and wholesale procurement',
    businessTypes: ['retail', 'wholesale', 'services', 'manufacturing', 'distribution', 'other'],
  },
  {
    id: 'customers',
    label: 'Customers & Udhaar',
    icon: 'Users',
    route: '/customers',
    group: 'business',
    description: 'Customer ledger, pending dues and WhatsApp reminders',
    businessTypes: ['retail', 'wholesale', 'services', 'manufacturing', 'distribution', 'other'],
  },
  {
    id: 'suppliers',
    label: 'Suppliers & Vendors',
    icon: 'Truck',
    route: '/suppliers',
    group: 'business',
    description: 'Wholesale supplier directory and prices',
    businessTypes: ['retail', 'wholesale', 'manufacturing', 'distribution', 'other'],
  },
  {
    id: 'expenses',
    label: 'Daily Expenses',
    icon: 'CreditCard',
    route: '/expenses',
    group: 'business',
    description: 'Track shop expenses, rent, tea and bills',
    businessTypes: ['retail', 'wholesale', 'services', 'manufacturing', 'distribution', 'other'],
  },
  // Manufacturing
  {
    id: 'production',
    label: 'Production',
    icon: 'Factory',
    route: '/production',
    group: 'manufacturing',
    description: 'Production orders, work orders and scheduling',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'bom',
    label: 'Bill of Materials',
    icon: 'GitBranch',
    route: '/bom',
    group: 'manufacturing',
    description: 'BOM management and component tracking',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'machines',
    label: 'Machines',
    icon: 'Cog',
    route: '/machines',
    group: 'manufacturing',
    description: 'Machine fleet health and utilization',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: 'Wrench',
    route: '/maintenance',
    group: 'manufacturing',
    description: 'Maintenance scheduling and predictive alerts',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'quality',
    label: 'Quality',
    icon: 'ShieldCheck',
    route: '/quality',
    group: 'manufacturing',
    description: 'Quality inspections, defects and traceability',
    businessTypes: ['manufacturing'],
  },
  // Intelligence
  {
    id: 'factory-graph',
    label: 'FactoryGraph',
    icon: 'GitGraph',
    route: '/factory-graph',
    group: 'intelligence',
    description: 'Visual entity relationship graph',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'ai-insights',
    label: 'AI Shop Advisor',
    icon: 'Sparkles',
    route: '/ai-insights',
    group: 'intelligence',
    description: 'AI predictions, restock tips and health scores',
    businessTypes: ['retail', 'wholesale', 'services', 'manufacturing', 'distribution', 'other'],
  },
  {
    id: 'investigations',
    label: 'Investigations',
    icon: 'Search',
    route: '/investigations',
    group: 'intelligence',
    description: 'AI-powered root cause analysis',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'forecasts',
    label: 'Forecasts',
    icon: 'TrendingUp',
    route: '/forecasts',
    group: 'intelligence',
    description: 'Demand and production forecasting',
    businessTypes: ['manufacturing', 'distribution'],
  },
  {
    id: 'simulations',
    label: 'What-if Simulator',
    icon: 'FlaskConical',
    route: '/simulations',
    group: 'intelligence',
    description: 'Simulate business scenarios',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'ai-agents',
    label: 'AI Agents',
    icon: 'Bot',
    route: '/ai-agents',
    group: 'intelligence',
    description: 'Managed AI agents with governed permissions',
    businessTypes: ['manufacturing'],
  },
  // Management
  {
    id: 'finance',
    label: 'Finance',
    icon: 'IndianRupee',
    route: '/finance',
    group: 'management',
    description: 'Revenue, expenses and profitability',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'workforce',
    label: 'Workforce',
    icon: 'HardHat',
    route: '/workforce',
    group: 'management',
    description: 'Employee management, shifts and attendance',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'reports',
    label: 'Reports & P&L',
    icon: 'BarChart3',
    route: '/reports',
    group: 'management',
    description: 'Business reports and analytics',
    businessTypes: ['retail', 'wholesale', 'services', 'manufacturing', 'distribution', 'other'],
  },
  // Administration
  {
    id: 'workflows',
    label: 'Workflows',
    icon: 'Workflow',
    route: '/workflows',
    group: 'administration',
    description: 'Automated workflow builder',
    businessTypes: ['manufacturing'],
    requiresEnterprise: false,
  },
  {
    id: 'approvals',
    label: 'Approvals',
    icon: 'CheckCircle2',
    route: '/approvals',
    group: 'administration',
    description: 'Pending approval queue',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'data-trust',
    label: 'Data Trust',
    icon: 'ShieldCheck',
    route: '/data-trust',
    group: 'administration',
    description: 'Data quality and trust scores',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: 'Plug',
    route: '/integrations',
    group: 'administration',
    description: 'Connect external systems',
    businessTypes: ['manufacturing'],
    requiresEnterprise: false,
  },
  {
    id: 'audit',
    label: 'Audit Log',
    icon: 'ScrollText',
    route: '/audit',
    group: 'administration',
    description: 'Action and change audit trail',
    businessTypes: ['manufacturing'],
  },
  {
    id: 'settings',
    label: 'Shop Settings',
    icon: 'Settings',
    route: '/settings',
    group: 'administration',
    description: 'Shop profile, GST/tax and preferences',
    businessTypes: ['retail', 'wholesale', 'services', 'manufacturing', 'distribution', 'other'],
  },
];

export function getModulesForBusinessType(
  businessType: string,
  enabledModules?: string[]
): ModuleConfig[] {
  if (enabledModules && enabledModules.length > 0) {
    return ALL_MODULES.filter(m => enabledModules.includes(m.id));
  }
  return ALL_MODULES.filter(m => m.businessTypes.includes(businessType as never));
}

export function getModulesByGroup(modules: ModuleConfig[]): Record<ModuleGroup, ModuleConfig[]> {
  const grouped: Record<ModuleGroup, ModuleConfig[]> = {
    core: [],
    business: [],
    manufacturing: [],
    intelligence: [],
    management: [],
    administration: [],
  };
  
  modules.forEach(m => {
    grouped[m.group].push(m);
  });
  
  return grouped;
}

export const DEFAULT_RETAIL_MODULES = [
  'dashboard', 'sales', 'products', 'inventory', 'purchases', 
  'customers', 'suppliers', 'expenses', 'reports', 'ai-insights', 
  'data-trust', 'settings'
];

export const DEFAULT_MANUFACTURING_MODULES = [
  'dashboard', 'sales', 'products', 'inventory', 'purchases',
  'customers', 'suppliers', 'expenses',
  'production', 'bom', 'machines', 'maintenance', 'quality',
  'factory-graph', 'ai-insights', 'investigations', 'forecasts', 
  'simulations', 'ai-agents',
  'finance', 'workforce', 'reports',
  'workflows', 'approvals', 'data-trust', 'integrations', 'audit', 'settings'
];

export const DEFAULT_ENTERPRISE_MODULES = [...DEFAULT_MANUFACTURING_MODULES];
