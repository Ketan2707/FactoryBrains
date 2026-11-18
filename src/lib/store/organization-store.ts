'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Organization, 
  BusinessType, 
  BusinessSize, 
  ExistingSoftware, 
  OnboardingData, 
  Location, 
  OrganizationMember 
} from '@/lib/types/organization';
import { DEFAULT_RETAIL_MODULES, DEFAULT_MANUFACTURING_MODULES, DEFAULT_ENTERPRISE_MODULES } from '@/lib/types/modules';
import { isEnterprise } from '@/lib/types/organization';
import { DEMO_ORGANIZATIONS } from '@/lib/data/demo-organizations';

interface OrganizationState {
  organization: Organization | null;
  userOrganizations: Organization[];
  onboarding: OnboardingData;
  isOnboarded: boolean;
  
  // Actions
  setOrganization: (org: Organization) => void;
  updateOrganization: (partial: Partial<Organization>) => void;
  updateShopDetails: (partial: Partial<Organization>) => void;
  createCustomShop: (data: Partial<Organization>) => Organization;
  
  // Branch / Location Actions
  addLocation: (location: Location) => void;
  updateLocation: (id: string, partial: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  setDefaultLocation: (id: string) => void;

  // Team Member Actions
  addTeamMember: (member: OrganizationMember) => void;
  removeTeamMember: (id: string) => void;
  updateTeamMember: (id: string, partial: Partial<OrganizationMember>) => void;

  // Navigation & Setup Actions
  setOnboardingStep: (step: number) => void;
  setBusinessType: (type: BusinessType) => void;
  setBusinessSize: (size: BusinessSize) => void;
  setExistingSoftware: (sw: ExistingSoftware) => void;
  setSelectedModules: (modules: string[]) => void;
  setOrganizationName: (name: string) => void;
  completeOnboarding: () => void;
  switchOrganization: (orgId: string) => void;
  switchDemo: (orgId: string) => void;
  reset: () => void;
}

const initialOnboarding: OnboardingData = {
  step: 1,
};

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organization: null,
      userOrganizations: [],
      onboarding: initialOnboarding,
      isOnboarded: false,

      setOrganization: (org) => {
        const { userOrganizations } = get();
        // If it's a custom org, ensure it's in userOrganizations
        if (org.isCustom) {
          const exists = userOrganizations.some(o => o.id === org.id);
          const updated = exists 
            ? userOrganizations.map(o => o.id === org.id ? org : o)
            : [...userOrganizations, org];
          set({ organization: org, userOrganizations: updated, isOnboarded: true });
        } else {
          set({ organization: org, isOnboarded: true });
        }
      },

      updateOrganization: (partial) =>
        set((state) => {
          if (!state.organization) return state;
          const updated = { ...state.organization, ...partial, updatedAt: new Date().toISOString() };
          const updatedUserOrgs = state.userOrganizations.map((o) =>
            o.id === updated.id ? updated : o
          );
          return {
            organization: updated,
            userOrganizations: updatedUserOrgs,
          };
        }),

      updateShopDetails: (partial) => {
        const { organization, updateOrganization } = get();
        if (!organization) return;
        updateOrganization(partial);
      },

      createCustomShop: (data) => {
        const bt = data.businessType || 'retail';
        const bs = data.businessSize || '1-10';
        
        let modules = data.enabledModules;
        if (!modules || modules.length === 0) {
          if (bt === 'manufacturing' && isEnterprise(bs)) {
            modules = DEFAULT_ENTERPRISE_MODULES;
          } else if (bt === 'manufacturing') {
            modules = DEFAULT_MANUFACTURING_MODULES;
          } else {
            modules = DEFAULT_RETAIL_MODULES;
          }
        }

        const currency = data.currency || 'INR';
        const currencySymbol = data.currencySymbol || (currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹');

        const newOrg: Organization = {
          id: data.id || `org_custom_${Date.now()}`,
          name: data.name || 'My Shop',
          tagline: data.tagline || 'Leading Quality Products & Services',
          ownerName: data.ownerName || 'Store Owner',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          country: data.country || 'India',
          gstin: data.gstin || '',
          taxRatePercent: data.taxRatePercent ?? 18,
          openingHours: data.openingHours || 'Mon-Sat: 09:00 AM - 09:00 PM',
          receiptNotes: data.receiptNotes || 'Thank you for your business! Please visit us again.',
          businessType: bt,
          businessSize: bs,
          existingSoftware: data.existingSoftware || 'none',
          enabledModules: modules,
          currency,
          currencySymbol,
          locations: data.locations && data.locations.length > 0 ? data.locations : [
            {
              id: `loc_${Date.now()}`,
              name: `${data.name || 'My Shop'} Main Branch`,
              type: bt === 'manufacturing' ? 'plant' : 'store',
              city: data.city || 'Main City',
              address: data.address || '',
              phone: data.phone || '',
              managerName: data.ownerName || 'Store Manager',
              isDefault: true,
              isActive: true,
              createdAt: new Date().toISOString(),
            },
          ],
          members: data.members || [],
          isCustom: true,
          createdAt: new Date().toISOString(),
        };

        const { userOrganizations } = get();
        const updatedUserOrgs = [...userOrganizations.filter(o => o.id !== newOrg.id), newOrg];

        set({
          organization: newOrg,
          userOrganizations: updatedUserOrgs,
          isOnboarded: true,
          onboarding: initialOnboarding,
        });

        return newOrg;
      },

      addLocation: (location) => {
        const { organization, updateOrganization } = get();
        if (!organization) return;
        const locations = [...(organization.locations || []), location];
        updateOrganization({ locations });
      },

      updateLocation: (id, partial) => {
        const { organization, updateOrganization } = get();
        if (!organization) return;
        const locations = (organization.locations || []).map((loc) =>
          loc.id === id ? { ...loc, ...partial } : loc
        );
        updateOrganization({ locations });
      },

      deleteLocation: (id) => {
        const { organization, updateOrganization } = get();
        if (!organization) return;
        const locations = (organization.locations || []).filter((loc) => loc.id !== id);
        updateOrganization({ locations });
      },

      setDefaultLocation: (id) => {
        const { organization, updateOrganization } = get();
        if (!organization) return;
        const locations = (organization.locations || []).map((loc) => ({
          ...loc,
          isDefault: loc.id === id,
        }));
        updateOrganization({ locations });
      },

      addTeamMember: (member) => {
        const { organization, updateOrganization } = get();
        if (!organization) return;
        const members = [...(organization.members || []).filter(m => m.id !== member.id), member];
        updateOrganization({ members });
      },

      removeTeamMember: (id) => {
        const { organization, updateOrganization } = get();
        if (!organization) return;
        const members = (organization.members || []).filter((m) => m.id !== id);
        updateOrganization({ members });
      },

      updateTeamMember: (id, partial) => {
        const { organization, updateOrganization } = get();
        if (!organization) return;
        const members = (organization.members || []).map((m) =>
          m.id === id ? { ...m, ...partial } : m
        );
        updateOrganization({ members });
      },

      setOnboardingStep: (step) =>
        set((state) => ({ onboarding: { ...state.onboarding, step } })),

      setBusinessType: (type) =>
        set((state) => ({ onboarding: { ...state.onboarding, businessType: type } })),

      setBusinessSize: (size) =>
        set((state) => ({ onboarding: { ...state.onboarding, businessSize: size } })),

      setExistingSoftware: (sw) =>
        set((state) => ({ onboarding: { ...state.onboarding, existingSoftware: sw } })),

      setSelectedModules: (modules) =>
        set((state) => ({ onboarding: { ...state.onboarding, selectedModules: modules } })),

      setOrganizationName: (name) =>
        set((state) => ({ onboarding: { ...state.onboarding, organizationName: name } })),

      completeOnboarding: () => {
        const { onboarding } = get();
        const bt = onboarding.businessType || 'retail';
        const bs = onboarding.businessSize || '1-10';
        
        let modules = onboarding.selectedModules;
        if (!modules || modules.length === 0) {
          if (bt === 'manufacturing' && isEnterprise(bs)) {
            modules = DEFAULT_ENTERPRISE_MODULES;
          } else if (bt === 'manufacturing') {
            modules = DEFAULT_MANUFACTURING_MODULES;
          } else {
            modules = DEFAULT_RETAIL_MODULES;
          }
        }

        const orgName = onboarding.organizationName || 'My Business';
        const org: Organization = {
          id: `org_custom_${Date.now()}`,
          name: orgName,
          tagline: 'Quality Products & Services',
          ownerName: onboarding.ownerName || 'Owner',
          phone: onboarding.phone || '',
          city: onboarding.city || '',
          address: onboarding.address || '',
          businessType: bt,
          businessSize: bs,
          existingSoftware: onboarding.existingSoftware || 'none',
          enabledModules: modules,
          currency: onboarding.currency || 'INR',
          currencySymbol: onboarding.currencySymbol || '₹',
          locations: [
            {
              id: `loc_${Date.now()}`,
              name: `${orgName} Main`,
              type: bt === 'manufacturing' ? 'plant' : 'store',
              city: onboarding.city || 'Main City',
              address: onboarding.address || '',
              phone: onboarding.phone || '',
              managerName: onboarding.ownerName || 'Store Manager',
              isDefault: true,
              isActive: true,
              createdAt: new Date().toISOString(),
            },
          ],
          members: [],
          isCustom: true,
          createdAt: new Date().toISOString(),
        };

        const { userOrganizations } = get();
        set({
          organization: org,
          userOrganizations: [...userOrganizations, org],
          isOnboarded: true,
          onboarding: initialOnboarding,
        });
      },

      switchOrganization: (orgId) => {
        const { userOrganizations } = get();
        // Check custom user orgs
        const customOrg = userOrganizations.find(o => o.id === orgId);
        if (customOrg) {
          set({ organization: customOrg, isOnboarded: true });
          return;
        }

        // Check demo orgs
        const demo = DEMO_ORGANIZATIONS[orgId];
        if (demo) {
          set({ organization: demo, isOnboarded: true });
        }
      },

      switchDemo: (orgId) => {
        const demo = DEMO_ORGANIZATIONS[orgId];
        if (demo) {
          set({
            organization: demo,
            isOnboarded: true,
          });
        }
      },

      reset: () =>
        set({
          organization: null,
          userOrganizations: [],
          onboarding: initialOnboarding,
          isOnboarded: false,
        }),
    }),
    {
      name: 'factorybrain-organization-v2',
    }
  )
);
