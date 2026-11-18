export type BusinessType = 'retail' | 'wholesale' | 'services' | 'manufacturing' | 'distribution' | 'other';

export type BusinessSize = '1-10' | '11-50' | '51-250' | '251-1000' | '1000+';

export type ExistingSoftware = 
  | 'none' 
  | 'excel' 
  | 'sap' 
  | 'oracle' 
  | 'dynamics' 
  | 'odoo' 
  | 'erpnext' 
  | 'custom' 
  | 'other';

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  tagline?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  gstin?: string; // GST / Tax Registration Number
  taxRatePercent?: number;
  openingHours?: string;
  receiptNotes?: string;
  businessType: BusinessType;
  businessSize: BusinessSize;
  existingSoftware: ExistingSoftware;
  enabledModules: string[];
  currency: string;
  currencySymbol: string;
  locations: Location[];
  members?: OrganizationMember[];
  isCustom?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'store' | 'warehouse' | 'plant' | 'office' | 'distribution_center';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  managerName?: string;
  isDefault?: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface OnboardingData {
  step: number;
  businessType?: BusinessType;
  businessSize?: BusinessSize;
  existingSoftware?: ExistingSoftware;
  selectedModules?: string[];
  organizationName?: string;
  ownerName?: string;
  phone?: string;
  city?: string;
  address?: string;
  currency?: string;
  currencySymbol?: string;
}

export function getBusinessModeLabel(type: BusinessType): string {
  switch (type) {
    case 'retail': return 'Retail Store';
    case 'wholesale': return 'Wholesale Business';
    case 'services': return 'Services Business';
    case 'manufacturing': return 'Manufacturing Plant';
    case 'distribution': return 'Logistics & Distribution';
    case 'other': return 'Business Enterprise';
  }
}

export function isManufacturing(type: BusinessType): boolean {
  return type === 'manufacturing';
}

export function isEnterprise(size: BusinessSize): boolean {
  return size === '251-1000' || size === '1000+';
}
