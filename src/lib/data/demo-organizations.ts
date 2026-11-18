import type { Organization } from '@/lib/types/organization';
import { DEFAULT_RETAIL_MODULES, DEFAULT_MANUFACTURING_MODULES, DEFAULT_ENTERPRISE_MODULES } from '@/lib/types/modules';

export const DEMO_ORGANIZATIONS: Record<string, Organization> = {
  org_urbanmart: {
    id: 'org_urbanmart',
    name: 'UrbanMart',
    businessType: 'retail',
    businessSize: '1-10',
    existingSoftware: 'excel',
    enabledModules: DEFAULT_RETAIL_MODULES,
    currency: 'INR',
    currencySymbol: '₹',
    locations: [
      { id: 'loc_1', name: 'Main Store', type: 'store', city: 'Delhi', isActive: true },
      { id: 'loc_2', name: 'Warehouse', type: 'warehouse', city: 'Delhi', isActive: true },
    ],
    createdAt: '2024-01-15T00:00:00Z',
  },
  org_apex: {
    id: 'org_apex',
    name: 'Apex Motion Industries',
    businessType: 'manufacturing',
    businessSize: '51-250',
    existingSoftware: 'excel',
    enabledModules: DEFAULT_MANUFACTURING_MODULES,
    currency: 'INR',
    currencySymbol: '₹',
    locations: [
      { id: 'loc_chd', name: 'Chandigarh Plant', type: 'plant', city: 'Chandigarh', isActive: true },
      { id: 'loc_del', name: 'Delhi Plant', type: 'plant', city: 'Delhi', isActive: true },
      { id: 'loc_pun', name: 'Pune Plant', type: 'plant', city: 'Pune', isActive: true },
      { id: 'loc_wh1', name: 'Central Warehouse', type: 'warehouse', city: 'Delhi', isActive: true },
    ],
    createdAt: '2022-06-01T00:00:00Z',
  },
  org_enterprise: {
    id: 'org_enterprise',
    name: 'Apex Motion Industries (Enterprise)',
    businessType: 'manufacturing',
    businessSize: '1000+',
    existingSoftware: 'sap',
    enabledModules: DEFAULT_ENTERPRISE_MODULES,
    currency: 'INR',
    currencySymbol: '₹',
    locations: [
      { id: 'loc_chd', name: 'Chandigarh Plant', type: 'plant', city: 'Chandigarh', isActive: true },
      { id: 'loc_del', name: 'Delhi Plant', type: 'plant', city: 'Delhi', isActive: true },
      { id: 'loc_pun', name: 'Pune Plant', type: 'plant', city: 'Pune', isActive: true },
      { id: 'loc_wh1', name: 'Central Warehouse', type: 'warehouse', city: 'Delhi', isActive: true },
      { id: 'loc_wh2', name: 'Regional Warehouse', type: 'warehouse', city: 'Mumbai', isActive: true },
      { id: 'loc_off', name: 'Head Office', type: 'office', city: 'Mumbai', isActive: true },
    ],
    createdAt: '2020-03-01T00:00:00Z',
  },
};
