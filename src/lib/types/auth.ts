export type UserRole = 
  | 'owner' 
  | 'admin' 
  | 'manager' 
  | 'employee'
  | 'cashier'
  | 'store_associate'
  // Manufacturing roles
  | 'plant_manager'
  | 'production_manager'
  | 'procurement_manager'
  | 'inventory_manager'
  | 'quality_manager'
  | 'maintenance_manager'
  | 'finance_manager'
  | 'operator';

export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'execute' | 'export';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  organizationId: string;
  shopName?: string;
  permissions: Record<string, Permission[]>;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface StoredUser extends User {
  password?: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  shopName: string;
  businessType: 'retail' | 'wholesale' | 'services' | 'manufacturing' | 'distribution' | 'other';
  businessSize?: '1-10' | '11-50' | '51-250' | '251-1000' | '1000+';
  city?: string;
  address?: string;
  currency?: string;
  currencySymbol?: string;
  gstin?: string;
}

export interface NewUserData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  department?: string;
  organizationId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
