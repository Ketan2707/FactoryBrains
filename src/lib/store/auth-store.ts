'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, StoredUser, SignUpData, NewUserData, UserRole, Permission } from '@/lib/types/auth';
import { useOrganizationStore } from './organization-store';

interface AuthState {
  user: User | null;
  users: Record<string, StoredUser>;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signup: (data: SignUpData) => Promise<{ success: boolean; message?: string; user?: User }>;
  registerNewUser: (data: NewUserData) => Promise<{ success: boolean; message?: string; user?: User }>;
  updateUserProfile: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

// Initial Demo users
const DEMO_USERS: Record<string, StoredUser> = {
  'owner@urbanmart.com': {
    id: 'user_1',
    email: 'owner@urbanmart.com',
    password: 'password123',
    name: 'Rajesh Kumar',
    role: 'owner',
    phone: '+91 98112 34567',
    shopName: 'UrbanMart Retail',
    organizationId: 'org_urbanmart',
    permissions: {
      sales: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      inventory: ['view', 'create', 'edit', 'delete', 'export'],
      purchases: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      customers: ['view', 'create', 'edit', 'delete', 'export'],
      suppliers: ['view', 'create', 'edit', 'delete', 'export'],
      expenses: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      reports: ['view', 'export'],
      settings: ['view', 'edit'],
    },
    isActive: true,
    lastLogin: '2026-08-31T18:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
  },
  'manager@apexmotion.com': {
    id: 'user_2',
    email: 'manager@apexmotion.com',
    password: 'password123',
    name: 'Priya Sharma',
    role: 'plant_manager',
    phone: '+91 98223 45678',
    shopName: 'Apex Motion Industries',
    organizationId: 'org_apex',
    permissions: {
      sales: ['view', 'create', 'edit', 'approve', 'export'],
      inventory: ['view', 'create', 'edit', 'approve', 'export'],
      purchases: ['view', 'create', 'edit', 'approve', 'export'],
      production: ['view', 'create', 'edit', 'approve', 'export'],
      machines: ['view', 'create', 'edit', 'export'],
      maintenance: ['view', 'create', 'edit', 'approve', 'export'],
      quality: ['view', 'create', 'edit', 'export'],
      bom: ['view', 'create', 'edit', 'export'],
      reports: ['view', 'export'],
      settings: ['view', 'edit'],
    },
    isActive: true,
    lastLogin: '2026-08-31T09:30:00Z',
    createdAt: '2022-06-01T00:00:00Z',
  },
  'admin@enterprise.com': {
    id: 'user_3',
    email: 'admin@enterprise.com',
    password: 'password123',
    name: 'Vikram Patel',
    role: 'admin',
    phone: '+91 98334 56789',
    shopName: 'Apex Enterprise Group',
    organizationId: 'org_enterprise',
    permissions: {
      sales: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
      inventory: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
      purchases: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
      production: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
      machines: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
      maintenance: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
      quality: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
      bom: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
      reports: ['view', 'export'],
      settings: ['view', 'edit'],
      integrations: ['view', 'create', 'edit', 'delete'],
      audit: ['view', 'export'],
    },
    isActive: true,
    lastLogin: '2026-08-31T14:00:00Z',
    createdAt: '2020-03-01T00:00:00Z',
  },
};

function getPermissionsForRole(role: UserRole): Record<string, Permission[]> {
  const fullPermissions: Record<string, Permission[]> = {
    sales: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
    inventory: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
    purchases: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
    customers: ['view', 'create', 'edit', 'delete', 'export'],
    suppliers: ['view', 'create', 'edit', 'delete', 'export'],
    expenses: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    production: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
    machines: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
    maintenance: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
    quality: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
    bom: ['view', 'create', 'edit', 'delete', 'approve', 'execute', 'export'],
    reports: ['view', 'export'],
    settings: ['view', 'edit'],
    audit: ['view', 'export'],
  };

  if (role === 'owner' || role === 'admin') {
    return fullPermissions;
  }

  if (role === 'manager' || role === 'plant_manager' || role === 'production_manager') {
    return {
      sales: ['view', 'create', 'edit', 'approve', 'export'],
      inventory: ['view', 'create', 'edit', 'approve', 'export'],
      purchases: ['view', 'create', 'edit', 'approve', 'export'],
      customers: ['view', 'create', 'edit', 'export'],
      suppliers: ['view', 'create', 'edit', 'export'],
      expenses: ['view', 'create', 'edit', 'approve', 'export'],
      production: ['view', 'create', 'edit', 'approve', 'export'],
      machines: ['view', 'create', 'edit', 'export'],
      maintenance: ['view', 'create', 'edit', 'approve', 'export'],
      quality: ['view', 'create', 'edit', 'export'],
      bom: ['view', 'create', 'edit', 'export'],
      reports: ['view', 'export'],
      settings: ['view'],
    };
  }

  if (role === 'cashier' || role === 'store_associate') {
    return {
      sales: ['view', 'create', 'edit'],
      inventory: ['view'],
      customers: ['view', 'create'],
      reports: ['view'],
    };
  }

  return {
    sales: ['view'],
    inventory: ['view'],
    reports: ['view'],
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: DEMO_USERS,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password?: string) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 400));
        
        const normalizedEmail = email.toLowerCase().trim();
        const { users } = get();
        
        // Find existing user in stored users or demo users
        let storedUser = users[normalizedEmail] || DEMO_USERS[normalizedEmail];
        
        if (storedUser) {
          if (password && storedUser.password && storedUser.password !== password && password !== 'demo123') {
            set({ isLoading: false });
            return { success: false, message: 'Invalid password. Please try again.' };
          }

          const loggedInUser: User = {
            ...storedUser,
            lastLogin: new Date().toISOString(),
          };

          // Update users state
          const updatedUsers = { ...users, [normalizedEmail]: loggedInUser };
          set({ user: loggedInUser, users: updatedUsers, isAuthenticated: true, isLoading: false });

          // Switch organization if applicable
          if (loggedInUser.organizationId) {
            useOrganizationStore.getState().switchOrganization(loggedInUser.organizationId);
          }

          return { success: true };
        }
        
        // If not in database, create user session directly
        const newId = `user_${Date.now()}`;
        const defaultUser: StoredUser = {
          id: newId,
          email: normalizedEmail,
          password: password || 'demo123',
          name: normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: 'owner',
          organizationId: '',
          permissions: getPermissionsForRole('owner'),
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = { ...users, [normalizedEmail]: defaultUser };
        set({ user: defaultUser, users: updatedUsers, isAuthenticated: true, isLoading: false });
        return { success: true };
      },

      signup: async (data: SignUpData) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 500));

        const normalizedEmail = data.email.toLowerCase().trim();
        const { users } = get();

        // Generate IDs
        const userId = `user_${Date.now()}`;
        const orgId = `org_custom_${Date.now()}`;

        // Create Custom Organization/Shop in Organization Store
        const currency = data.currency || 'INR';
        const currencySymbol = data.currencySymbol || (currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹');

        const newShop = useOrganizationStore.getState().createCustomShop({
          id: orgId,
          name: data.shopName.trim(),
          ownerName: data.name.trim(),
          email: normalizedEmail,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          gstin: data.gstin || '',
          businessType: data.businessType || 'retail',
          businessSize: data.businessSize || '1-10',
          currency,
          currencySymbol,
          locations: [
            {
              id: `loc_${Date.now()}`,
              name: `${data.shopName.trim()} Main`,
              type: data.businessType === 'manufacturing' ? 'plant' : 'store',
              city: data.city || 'Main',
              address: data.address || '',
              phone: data.phone || '',
              managerName: data.name.trim(),
              isDefault: true,
              isActive: true,
              createdAt: new Date().toISOString(),
            },
          ],
          members: [
            {
              id: userId,
              name: data.name.trim(),
              email: normalizedEmail,
              role: data.role || 'owner',
              phone: data.phone || '',
              isActive: true,
              joinedAt: new Date().toISOString(),
            },
          ],
        });

        // Create and register user
        const newUser: StoredUser = {
          id: userId,
          email: normalizedEmail,
          password: data.password || 'password123',
          name: data.name.trim(),
          role: data.role || 'owner',
          phone: data.phone || '',
          shopName: data.shopName.trim(),
          organizationId: orgId,
          permissions: getPermissionsForRole(data.role || 'owner'),
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = { ...users, [normalizedEmail]: newUser };
        set({ user: newUser, users: updatedUsers, isAuthenticated: true, isLoading: false });

        return { success: true, user: newUser };
      },

      registerNewUser: async (data: NewUserData) => {
        const normalizedEmail = data.email.toLowerCase().trim();
        const { users } = get();

        const userId = `user_${Date.now()}`;
        const newUser: StoredUser = {
          id: userId,
          email: normalizedEmail,
          password: data.password || 'welcome123',
          name: data.name.trim(),
          role: data.role,
          phone: data.phone || '',
          organizationId: data.organizationId,
          permissions: getPermissionsForRole(data.role),
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = { ...users, [normalizedEmail]: newUser };
        set({ users: updatedUsers });

        // Add member to active organization
        useOrganizationStore.getState().addTeamMember({
          id: userId,
          name: data.name.trim(),
          email: normalizedEmail,
          role: data.role,
          phone: data.phone,
          department: data.department,
          isActive: true,
          joinedAt: new Date().toISOString(),
        });

        return { success: true, user: newUser };
      },

      updateUserProfile: (userId: string, data: Partial<User>) => {
        const { user, users } = get();
        if (user && user.id === userId) {
          const updatedUser = { ...user, ...data };
          const normalizedEmail = updatedUser.email.toLowerCase();
          set({
            user: updatedUser,
            users: { ...users, [normalizedEmail]: { ...users[normalizedEmail], ...updatedUser } },
          });
        }
      },

      deleteUser: (userId: string) => {
        const { users, user } = get();
        const newUsers = { ...users };
        for (const [email, u] of Object.entries(newUsers)) {
          if (u.id === userId) {
            delete newUsers[email];
            break;
          }
        }
        set({
          users: newUsers,
          ...(user?.id === userId ? { user: null, isAuthenticated: false } : {}),
        });
      },

      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),

      setUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'factorybrain-auth-v2',
    }
  )
);

export { DEMO_USERS };
