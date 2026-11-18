'use client';

import { useState, useEffect } from 'react';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useAuthStore } from '@/lib/store/auth-store';
import type { Location, OrganizationMember, BusinessType } from '@/lib/types/organization';
import type { UserRole } from '@/lib/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ALL_MODULES } from '@/lib/types/modules';
import { DEMO_ORGANIZATIONS } from '@/lib/data/demo-organizations';
import { 
  Settings, 
  Save, 
  Store, 
  MapPin, 
  Users, 
  Layers, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Globe, 
  Receipt, 
  Clock, 
  UserPlus, 
  ShieldCheck, 
  Download,
  Building,
  Check,
  Star,
  Sparkles,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { 
    organization, 
    userOrganizations,
    setOrganization, 
    updateOrganization, 
    updateShopDetails,
    addLocation,
    updateLocation,
    deleteLocation,
    setDefaultLocation,
    addTeamMember,
    removeTeamMember,
  } = useOrganizationStore();

  const { users, registerNewUser, deleteUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('shop-profile');

  // Shop Profile Form State
  const [shopName, setShopName] = useState(organization?.name || '');
  const [tagline, setTagline] = useState(organization?.tagline || '');
  const [ownerName, setOwnerName] = useState(organization?.ownerName || '');
  const [phone, setPhone] = useState(organization?.phone || '');
  const [email, setEmail] = useState(organization?.email || '');
  const [website, setWebsite] = useState(organization?.website || '');
  const [address, setAddress] = useState(organization?.address || '');
  const [city, setCity] = useState(organization?.city || '');
  const [state, setState] = useState(organization?.state || '');
  const [pincode, setPincode] = useState(organization?.pincode || '');
  const [country, setCountry] = useState(organization?.country || 'India');
  const [gstin, setGstin] = useState(organization?.gstin || '');
  const [taxRatePercent, setTaxRatePercent] = useState(organization?.taxRatePercent ?? 18);
  const [currency, setCurrency] = useState(organization?.currency || 'INR');
  const [openingHours, setOpeningHours] = useState(organization?.openingHours || 'Mon-Sat: 09:00 AM - 09:00 PM');
  const [receiptNotes, setReceiptNotes] = useState(organization?.receiptNotes || 'Thank you for shopping with us! No refund without bill.');
  const [enabledModules, setEnabledModules] = useState<string[]>(organization?.enabledModules || []);

  // Gemini AI Key State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('factorybrain_gemini_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      setGeminiApiKey(saved);
      setIsKeySaved(Boolean(saved));
    }
  }, []);

  const handleSaveGeminiKey = () => {
    if (typeof window !== 'undefined') {
      if (geminiApiKey.trim()) {
        localStorage.setItem('factorybrain_gemini_key', geminiApiKey.trim());
        setIsKeySaved(true);
        toast.success('Gemini AI Vision key saved successfully!', {
          description: 'Multimodal vision is now activated for bill scanning and AI features.',
        });
      } else {
        localStorage.removeItem('factorybrain_gemini_key');
        setIsKeySaved(false);
        toast.info('Gemini AI key cleared. Using offline in-browser OCR.');
      }
    }
  };

  // Branch Modal State
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchType, setBranchType] = useState<Location['type']>('store');
  const [branchCity, setBranchCity] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchManager, setBranchManager] = useState('');

  // New User / Staff Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('welcome123');
  const [newUserRole, setNewUserRole] = useState<UserRole>('cashier');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserDepartment, setNewUserDepartment] = useState('');

  if (!organization) return null;

  // Save Shop Info
  const handleSaveShopInfo = () => {
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
    updateShopDetails({
      name: shopName,
      tagline,
      ownerName,
      phone,
      email,
      website,
      address,
      city,
      state,
      pincode,
      country,
      gstin,
      taxRatePercent: Number(taxRatePercent),
      currency,
      currencySymbol,
      openingHours,
      receiptNotes,
      enabledModules,
    });
    toast.success('Shop details updated successfully!', {
      description: 'Your changes have been saved and applied across all modules.',
    });
  };

  // Branch Actions
  const handleOpenAddBranch = () => {
    setEditingBranchId(null);
    setBranchName('');
    setBranchType(organization.businessType === 'manufacturing' ? 'plant' : 'store');
    setBranchCity(organization.city || '');
    setBranchAddress('');
    setBranchPhone(organization.phone || '');
    setBranchManager(organization.ownerName || '');
    setBranchModalOpen(true);
  };

  const handleOpenEditBranch = (loc: Location) => {
    setEditingBranchId(loc.id);
    setBranchName(loc.name);
    setBranchType(loc.type);
    setBranchCity(loc.city || '');
    setBranchAddress(loc.address || '');
    setBranchPhone(loc.phone || '');
    setBranchManager(loc.managerName || '');
    setBranchModalOpen(true);
  };

  const handleSaveBranch = () => {
    if (!branchName.trim()) {
      toast.error('Please enter a branch name');
      return;
    }

    if (editingBranchId) {
      updateLocation(editingBranchId, {
        name: branchName.trim(),
        type: branchType,
        city: branchCity.trim(),
        address: branchAddress.trim(),
        phone: branchPhone.trim(),
        managerName: branchManager.trim(),
      });
      toast.success('Branch details updated');
    } else {
      const newLoc: Location = {
        id: `loc_${Date.now()}`,
        name: branchName.trim(),
        type: branchType,
        city: branchCity.trim(),
        address: branchAddress.trim(),
        phone: branchPhone.trim(),
        managerName: branchManager.trim(),
        isDefault: (organization.locations || []).length === 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      addLocation(newLoc);
      toast.success(`Branch "${branchName}" added successfully`);
    }

    setBranchModalOpen(false);
  };

  // Team Actions
  const handleAddUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Please enter name and email');
      return;
    }

    const res = await registerNewUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword.trim() || 'welcome123',
      role: newUserRole,
      phone: newUserPhone.trim(),
      department: newUserDepartment.trim(),
      organizationId: organization.id,
    });

    if (res.success) {
      toast.success(`User ${newUserName} registered!`, {
        description: `Login email: ${newUserEmail} with password "${newUserPassword}"`,
      });
      setUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
    } else {
      toast.error(res.message || 'Failed to create user');
    }
  };

  // Toggle Module
  const handleToggleModule = (modId: string) => {
    setEnabledModules(prev =>
      prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]
    );
  };

  // Demo Switcher
  const handleSwitchMode = (demoKey: string) => {
    const demo = DEMO_ORGANIZATIONS[demoKey];
    if (demo) {
      setOrganization(demo);
      setShopName(demo.name);
      setCity(demo.locations[0]?.city || '');
      setEnabledModules(demo.enabledModules);
      toast.success(`Switched to demo: ${demo.name}`);
    }
  };

  // Export JSON
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(organization, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${organization.name.toLowerCase().replace(/\s+/g, '_')}_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Shop configuration exported as JSON');
  };

  // Organization users list
  const orgUsers = Object.values(users).filter(
    u => u.organizationId === organization.id || (!u.organizationId && organization.isCustom)
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Store className="w-6 h-6 text-primary" /> {organization.name}
            </h1>
            <Badge variant="secondary" className="capitalize text-xs">
              {organization.businessType}
            </Badge>
            {organization.isCustom && (
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Custom Shop
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your shop info, store branches, staff logins, tax/GSTIN, and active modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 h-9 font-medium" onClick={handleSaveShopInfo}>
            <Save className="w-4 h-4" /> Save All Changes
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger value="shop-profile" className="text-xs py-2 gap-1.5 font-medium">
            <Store className="w-3.5 h-3.5" /> Shop Profile & Info
          </TabsTrigger>
          <TabsTrigger value="branches" className="text-xs py-2 gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5" /> Branches & Outlets ({organization.locations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs py-2 gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5" /> Staff & Users ({orgUsers.length})
          </TabsTrigger>
          <TabsTrigger value="modules" className="text-xs py-2 gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5" /> Modules & Features
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs py-2 gap-1.5 font-medium">
            <RefreshCw className="w-3.5 h-3.5" /> Demos & Backup
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SHOP & BUSINESS PROFILE */}
        <TabsContent value="shop-profile" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary" /> Shop Identity & Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-name-input" className="text-xs">Shop / Store Name *</Label>
                      <Input
                        id="shop-name-input"
                        value={shopName}
                        onChange={e => setShopName(e.target.value)}
                        className="text-sm h-9 font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-tagline" className="text-xs">Tagline / Business Subtitle</Label>
                      <Input
                        id="shop-tagline"
                        placeholder="e.g. Quality Electronics & Genuine Spares"
                        value={tagline}
                        onChange={e => setTagline(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="owner-name-input" className="text-xs">Shop Owner / Founder</Label>
                      <Input
                        id="owner-name-input"
                        value={ownerName}
                        onChange={e => setOwnerName(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-currency" className="text-xs">Billing Currency</Label>
                      <select
                        id="shop-currency"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-md border bg-background"
                      >
                        <option value="INR">₹ INR (Indian Rupee)</option>
                        <option value="USD">$ USD (US Dollar)</option>
                        <option value="EUR">€ EUR (Euro)</option>
                        <option value="GBP">£ GBP (British Pound)</option>
                        <option value="AED">AED (UAE Dirham)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Physical Address */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Store Location & Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-phone" className="text-xs">Shop Phone / WhatsApp</Label>
                      <Input
                        id="shop-phone"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-email" className="text-xs">Official Contact Email</Label>
                      <Input
                        id="shop-email"
                        placeholder="contact@yourshop.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-website" className="text-xs">Website URL (Optional)</Label>
                      <Input
                        id="shop-website"
                        placeholder="https://yourshop.com"
                        value={website}
                        onChange={e => setWebsite(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="shop-address" className="text-xs">Full Physical Store Address</Label>
                    <Input
                      id="shop-address"
                      placeholder="Shop #4, Market Complex, Main Road"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-city" className="text-xs">City</Label>
                      <Input
                        id="shop-city"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-state" className="text-xs">State / Province</Label>
                      <Input
                        id="shop-state"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-pincode" className="text-xs">Pincode / ZIP</Label>
                      <Input
                        id="shop-pincode"
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-country" className="text-xs">Country</Label>
                      <Input
                        id="shop-country"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoicing, GST & Business Hours */}
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-primary" /> Tax, Invoicing & Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-gstin" className="text-xs">GSTIN / Tax Registration No.</Label>
                      <Input
                        id="shop-gstin"
                        placeholder="e.g. 07AAAAA0000A1Z5"
                        value={gstin}
                        onChange={e => setGstin(e.target.value)}
                        className="text-sm h-9 font-mono uppercase"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-tax" className="text-xs">Default Tax Rate (%)</Label>
                      <Input
                        id="shop-tax"
                        type="number"
                        value={taxRatePercent}
                        onChange={e => setTaxRatePercent(Number(e.target.value))}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="shop-hours" className="text-xs">Store Operating Hours</Label>
                      <Input
                        id="shop-hours"
                        placeholder="Mon-Sat: 09:00 AM - 09:00 PM"
                        value={openingHours}
                        onChange={e => setOpeningHours(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="receipt-notes" className="text-xs">Invoice / Receipt Footer Note</Label>
                    <Input
                      id="receipt-notes"
                      placeholder="e.g. Thank you for your business! Goods once sold cannot be returned without bill."
                      value={receiptNotes}
                      onChange={e => setReceiptNotes(e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Live Business Card / Receipt Preview */}
            <div className="space-y-6">
              <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5 shadow-md">
                <CardHeader className="pb-2 border-b">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500" /> Live Shop Card Preview
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="p-4 rounded-xl border bg-card/80 backdrop-blur shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base text-foreground">{shopName || 'Your Shop Name'}</h3>
                        <p className="text-xs text-muted-foreground">{tagline || 'Shop tagline & quality promise'}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {currency}
                      </Badge>
                    </div>

                    <div className="border-t pt-2 space-y-1.5 text-xs text-muted-foreground">
                      {ownerName && <p><span className="font-medium text-foreground">Proprietor:</span> {ownerName}</p>}
                      {phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-primary" /> {phone}</p>}
                      {email && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-primary" /> {email}</p>}
                      {(address || city) && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span>{[address, city, state, pincode].filter(Boolean).join(', ')}</span>
                        </p>
                      )}
                      {gstin && <p className="font-mono text-[11px]"><span className="font-semibold text-foreground">GSTIN:</span> {gstin}</p>}
                      {openingHours && <p className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-primary" /> {openingHours}</p>}
                    </div>

                    {receiptNotes && (
                      <div className="border-t border-dashed pt-2 text-[11px] text-muted-foreground italic">
                        &quot;{receiptNotes}&quot;
                      </div>
                    )}
                  </div>

                  <Button className="w-full text-xs h-9 gap-1.5" onClick={handleSaveShopInfo}>
                    <Check className="w-3.5 h-3.5" /> Apply & Save Shop Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Info Box */}
              <Card className="bg-muted/40">
                <CardContent className="p-4 text-xs space-y-2 text-muted-foreground">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Persistent Local Database
                  </p>
                  <p>
                    All your shop info, product stocks, customers, invoices, and multi-branch outlets are stored safely in local persistent storage.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: BRANCHES & LOCATIONS */}
        <TabsContent value="branches" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Store Outlets & Warehouse Locations</h2>
              <p className="text-xs text-muted-foreground">
                Manage all your physical store locations, warehouses, and distribution points.
              </p>
            </div>
            <Button size="sm" className="gap-1.5 text-xs h-8" onClick={handleOpenAddBranch}>
              <Plus className="w-3.5 h-3.5" /> Add New Branch
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(organization.locations || []).map((loc) => (
              <Card key={loc.id} className={`transition-all hover:border-primary/40 ${loc.isDefault ? 'border-primary/40 bg-primary/5' : ''}`}>
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{loc.name}</h3>
                      {loc.isDefault && (
                        <Badge variant="default" className="text-[9px] h-4 px-1.5">Default</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{loc.type} • {loc.city || 'Local'}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {loc.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3 text-xs">
                  <div className="space-y-1 text-muted-foreground">
                    {loc.managerName && <p><span className="text-foreground font-medium">Manager:</span> {loc.managerName}</p>}
                    {loc.phone && <p><span className="text-foreground font-medium">Phone:</span> {loc.phone}</p>}
                    {loc.address && <p><span className="text-foreground font-medium">Address:</span> {loc.address}</p>}
                  </div>

                  <div className="flex items-center justify-between border-t pt-2 gap-2">
                    {!loc.isDefault ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-7 px-2 text-primary"
                        onClick={() => {
                          setDefaultLocation(loc.id);
                          toast.success(`Set "${loc.name}" as default branch`);
                        }}
                      >
                        Set Default
                      </Button>
                    ) : <span className="text-[10px] text-muted-foreground">Primary Location</span>}

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleOpenEditBranch(loc)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => {
                          if ((organization.locations || []).length <= 1) {
                            toast.error('You must keep at least one branch for your shop.');
                            return;
                          }
                          deleteLocation(loc.id);
                          toast.success(`Branch "${loc.name}" removed`);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: TEAM & USER MANAGEMENT (NEW USER OPTION) */}
        <TabsContent value="team" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Staff & Team User Logins</h2>
              <p className="text-xs text-muted-foreground">
                Create new user logins for store managers, cashiers, and warehouse operators.
              </p>
            </div>
            <Button size="sm" className="gap-1.5 text-xs h-8 font-medium" onClick={() => setUserModalOpen(true)}>
              <UserPlus className="w-3.5 h-3.5" /> + Add New User / Staff
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgUsers.map((u) => (
              <Card key={u.id} className="transition-all hover:border-primary/30">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-foreground">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] capitalize font-medium">
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="border-t pt-2 text-xs space-y-1 text-muted-foreground">
                    {u.phone && <p>📞 {u.phone}</p>}
                    <p>🔑 <span className="text-foreground font-medium">Status:</span> {u.isActive ? 'Active Login' : 'Disabled'}</p>
                    {u.createdAt && (
                      <p className="text-[10px] text-muted-foreground">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                    )}
                  </div>

                  {u.role !== 'owner' && (
                    <div className="border-t pt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-6 px-2 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          deleteUser(u.id);
                          toast.success(`User ${u.name} removed`);
                        }}
                      >
                        Remove Access
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: MODULES & FEATURES */}
        <TabsContent value="modules" className="space-y-4 mt-0">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Active Sidebar Features
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Toggle features according to your shop workflow (POS, Inventory, Purchases, BOM, AI Copilot, etc.)
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_MODULES.filter(m => m.id !== 'dashboard' && m.id !== 'settings').map(mod => {
                  const isChecked = enabledModules.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/40 ${
                        isChecked ? 'border-primary/40 bg-accent/20' : 'opacity-60'
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleToggleModule(mod.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-foreground truncate">{mod.label}</p>
                          <Badge variant="secondary" className="text-[9px] uppercase">
                            {mod.group}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {mod.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button size="sm" className="text-xs h-8" onClick={handleSaveShopInfo}>
                  Save Module Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: DEMO & DATA MANAGEMENT */}
        <TabsContent value="data" className="space-y-6 mt-0">
          {/* Quick Demo Switcher */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" /> Quick Demo Persona Switcher
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Instantly switch between retail, manufacturing, and enterprise multi-plant modes for testing
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant={organization.id === 'org_urbanmart' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => handleSwitchMode('org_urbanmart')}
              >
                🏪 UrbanMart (Small Business / Retail)
              </Button>
              <Button
                variant={organization.id === 'org_apex' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => handleSwitchMode('org_apex')}
              >
                🏭 Apex Motion (Manufacturing Plant)
              </Button>
              <Button
                variant={organization.id === 'org_enterprise' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => handleSwitchMode('org_enterprise')}
              >
                🏢 Apex Enterprise (Multi-Plant + SAP)
              </Button>
            </CardContent>
          </Card>

          {/* AI Vision & OCR Engine Configuration */}
          <Card className="border-primary/30 shadow-xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" /> Google Gemini Multimodal AI Vision
                </CardTitle>
                {isKeySaved ? (
                  <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px]">
                    ⚡ Vision AI Activated
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                    Offline Tesseract OCR
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Power high-precision invoice OCR scanning, GST bill parsing, and voice-to-inventory translation.
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gemini-key-input" className="text-xs font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-500" /> Gemini API Key
                  </Label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Get Free Gemini API Key from Google AI Studio ↗
                  </a>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="gemini-key-input"
                    type="password"
                    placeholder="Enter API Key: AIzaSy..."
                    value={geminiApiKey}
                    onChange={e => setGeminiApiKey(e.target.value)}
                    className="text-xs h-9 font-mono max-w-md"
                  />
                  <Button size="sm" className="text-xs h-9 gap-1" onClick={handleSaveGeminiKey}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Save AI Key
                  </Button>
                  {isKeySaved && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-9 text-destructive hover:bg-destructive/10" 
                      onClick={() => {
                        setGeminiApiKey('');
                        if (typeof window !== 'undefined') localStorage.removeItem('factorybrain_gemini_key');
                        setIsKeySaved(false);
                        toast.info('API key cleared');
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tip: You can also configure this key in your project root <code className="text-primary bg-muted px-1.5 py-0.5 rounded font-mono">.env.local</code> file as <code className="text-primary bg-muted px-1.5 py-0.5 rounded font-mono">GEMINI_API_KEY=your_key_here</code>.
              </p>
            </CardContent>
          </Card>

          {/* Backup & Export */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" /> Backup & Data Export
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <p className="text-muted-foreground">
                Download a full JSON snapshot of your current shop configuration, locations, and settings.
              </p>
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5" onClick={handleExportData}>
                <Download className="w-3.5 h-3.5" /> Export Shop Data (JSON)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL: ADD / EDIT BRANCH */}
      {branchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> {editingBranchId ? 'Edit Branch Location' : 'Add New Branch / Outlet'}
              </h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setBranchModalOpen(false)}>✕</Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Branch / Outlet Name *</Label>
                <Input
                  placeholder="e.g. South Extension Outlet"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Location Type</Label>
                  <select
                    value={branchType}
                    onChange={e => setBranchType(e.target.value as Location['type'])}
                    className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                  >
                    <option value="store">🏪 Retail Store</option>
                    <option value="warehouse">📦 Warehouse</option>
                    <option value="plant">🏭 Plant / Workshop</option>
                    <option value="office">🏢 Office</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">City</Label>
                  <Input
                    placeholder="e.g. Delhi"
                    value={branchCity}
                    onChange={e => setBranchCity(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Branch Address</Label>
                <Input
                  placeholder="Shop No., Block / Market"
                  value={branchAddress}
                  onChange={e => setBranchAddress(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Branch Manager</Label>
                  <Input
                    placeholder="e.g. Amit Sharma"
                    value={branchManager}
                    onChange={e => setBranchManager(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Phone</Label>
                  <Input
                    placeholder="+91 98765 00000"
                    value={branchPhone}
                    onChange={e => setBranchPhone(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setBranchModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="text-xs h-8" onClick={handleSaveBranch}>
                {editingBranchId ? 'Save Branch' : 'Add Branch'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER / STAFF */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Add New User / Staff Member
              </h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setUserModalOpen(false)}>✕</Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Full Name *</Label>
                <Input
                  placeholder="e.g. Rohan Mehra"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Email Address (Login ID) *</Label>
                <Input
                  type="email"
                  placeholder="rohan@yourshop.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Role</Label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as UserRole)}
                    className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                  >
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier / Billing</option>
                    <option value="store_associate">Store Associate</option>
                    <option value="inventory_manager">Inventory Lead</option>
                    <option value="plant_manager">Plant Manager</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Initial Password</Label>
                  <Input
                    placeholder="welcome123"
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Phone Number</Label>
                  <Input
                    placeholder="+91 98765 11111"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Department (Optional)</Label>
                  <Input
                    placeholder="Sales / Billing"
                    value={newUserDepartment}
                    onChange={e => setNewUserDepartment(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setUserModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="text-xs h-8 gap-1.5" onClick={handleAddUser}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Register User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
