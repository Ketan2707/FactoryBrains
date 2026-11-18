'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ALL_MODULES, DEFAULT_RETAIL_MODULES, DEFAULT_MANUFACTURING_MODULES } from '@/lib/types/modules';
import type { BusinessType, BusinessSize, ExistingSoftware } from '@/lib/types/organization';

const STEPS = ['Business Type', 'Organization Size', 'Existing Software', 'Modules'];

const BUSINESS_TYPES: { value: BusinessType; label: string; icon: string; description: string }[] = [
  { value: 'retail', label: 'Retail', icon: '🏪', description: 'Local shops, stores, retail businesses' },
  { value: 'wholesale', label: 'Wholesale', icon: '📦', description: 'Wholesale trading and distribution' },
  { value: 'services', label: 'Services', icon: '💼', description: 'Service-based businesses' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭', description: 'Factories, manufacturers, industrial' },
  { value: 'distribution', label: 'Distribution', icon: '🚛', description: 'Logistics and distribution' },
  { value: 'other', label: 'Other', icon: '🏢', description: 'Other business types' },
];

const BUSINESS_SIZES: { value: BusinessSize; label: string }[] = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-250', label: '51–250 employees' },
  { value: '251-1000', label: '251–1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
];

const SOFTWARE_OPTIONS: { value: ExistingSoftware; label: string }[] = [
  { value: 'none', label: 'No' },
  { value: 'excel', label: 'Excel / Google Sheets' },
  { value: 'sap', label: 'SAP' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'dynamics', label: 'Microsoft Dynamics' },
  { value: 'odoo', label: 'Odoo' },
  { value: 'erpnext', label: 'ERPNext' },
  { value: 'custom', label: 'Custom ERP' },
  { value: 'other', label: 'Other' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    setBusinessType, setBusinessSize, setExistingSoftware,
    setSelectedModules, setOrganizationName, completeOnboarding,
  } = useOrganizationStore();

  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [selectedBT, setSelectedBT] = useState<BusinessType | null>(null);
  const [selectedBS, setSelectedBS] = useState<BusinessSize | null>(null);
  const [selectedSW, setSelectedSW] = useState<ExistingSoftware | null>(null);
  const [selectedMods, setSelectedMods] = useState<string[]>([]);

  const getDefaultModules = () => {
    if (selectedBT === 'manufacturing') return DEFAULT_MANUFACTURING_MODULES;
    return DEFAULT_RETAIL_MODULES;
  };

  const getAvailableModules = () => {
    if (!selectedBT) return [];
    return ALL_MODULES.filter(m =>
      m.businessTypes.includes(selectedBT) && m.id !== 'dashboard' && m.id !== 'settings'
    );
  };

  const handleNext = () => {
    if (step === 1 && selectedBT) {
      setBusinessType(selectedBT);
      const defaults = selectedBT === 'manufacturing' ? DEFAULT_MANUFACTURING_MODULES : DEFAULT_RETAIL_MODULES;
      setSelectedMods(defaults);
      setStep(2);
    } else if (step === 2 && selectedBS) {
      setBusinessSize(selectedBS);
      setStep(3);
    } else if (step === 3 && selectedSW) {
      setExistingSoftware(selectedSW);
      setStep(4);
    } else if (step === 4) {
      setOrganizationName(orgName || 'My Organization');
      setSelectedModules(selectedMods);
      completeOnboarding();
      router.push('/dashboard');
    }
  };

  const toggleModule = (modId: string) => {
    setSelectedMods(prev =>
      prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg fb-gradient-bg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight">FactoryBrain</span>
        <span className="text-sm text-muted-foreground ml-2">Setup</span>
      </div>

      {/* Progress */}
      <div className="border-b">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center shrink-0 ${
                  i + 1 < step ? 'bg-primary text-primary-foreground' :
                  i + 1 === step ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i + 1 < step ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-2xl">
          {/* Step 1: Business Type */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-1">What type of business do you operate?</h2>
              <p className="text-sm text-muted-foreground mb-6">This helps us configure the right experience for you.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BUSINESS_TYPES.map(bt => (
                  <Card
                    key={bt.value}
                    className={`cursor-pointer transition-all hover:border-primary/30 ${selectedBT === bt.value ? 'border-primary ring-1 ring-primary/20' : ''}`}
                    onClick={() => setSelectedBT(bt.value)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{bt.icon}</div>
                      <p className="text-sm font-medium">{bt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{bt.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Organization Size */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-1">How large is your organization?</h2>
              <p className="text-sm text-muted-foreground mb-6">This determines default feature complexity.</p>
              <div className="space-y-2">
                {BUSINESS_SIZES.map(bs => (
                  <Card
                    key={bs.value}
                    className={`cursor-pointer transition-all hover:border-primary/30 ${selectedBS === bs.value ? 'border-primary ring-1 ring-primary/20' : ''}`}
                    onClick={() => setSelectedBS(bs.value)}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">{bs.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Existing Software */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Do you already use business software?</h2>
              <p className="text-sm text-muted-foreground mb-6">FactoryBrain can integrate with your existing systems.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SOFTWARE_OPTIONS.map(sw => (
                  <Card
                    key={sw.value}
                    className={`cursor-pointer transition-all hover:border-primary/30 ${selectedSW === sw.value ? 'border-primary ring-1 ring-primary/20' : ''}`}
                    onClick={() => setSelectedSW(sw.value)}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{sw.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Module Selection */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-1">What would you like to manage?</h2>
              <p className="text-sm text-muted-foreground mb-4">Select the modules you need. You can change this later.</p>
              <div className="mb-6">
                <Label htmlFor="org-name">Organization name</Label>
                <Input
                  id="org-name"
                  placeholder="e.g., Acme Industries"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="mt-1.5 max-w-sm"
                />
              </div>
              <div className="space-y-2">
                {getAvailableModules().map(mod => (
                  <label key={mod.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={selectedMods.includes(mod.id)}
                      onCheckedChange={() => toggleModule(mod.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{mod.label}</p>
                      <p className="text-xs text-muted-foreground">{mod.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{mod.group}</Badge>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : router.push('/login')} className="text-sm">
              {step === 1 ? '← Back to login' : '← Back'}
            </Button>
            <Button onClick={handleNext} disabled={
              (step === 1 && !selectedBT) ||
              (step === 2 && !selectedBS) ||
              (step === 3 && !selectedSW)
            }>
              {step === 4 ? 'Launch FactoryBrain →' : 'Continue →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
