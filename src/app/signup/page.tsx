'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import type { BusinessType } from '@/lib/types/organization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  UserPlus, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [tagline, setTagline] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('retail');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError('Please enter your full name'); return; }
    if (!email.trim()) { setError('Please enter your email address'); return; }
    if (!password.trim()) { setError('Please choose a password'); return; }
    if (!shopName.trim()) { setError('Please enter your shop / business name'); return; }

    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

    const result = await signup({
      name: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
      role: 'owner',
      shopName: shopName.trim(),
      businessType,
      city: city.trim(),
      address: address.trim(),
      currency,
      currencySymbol,
      gstin: gstin.trim(),
    });

    if (result.success) {
      toast.success(`Welcome to FactoryBrain, ${fullName}!`, {
        description: `Your shop "${shopName}" is ready.`,
      });
      router.push('/dashboard');
    } else {
      setError(result.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg fb-gradient-bg flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">FactoryBrain</span>
          <Badge variant="outline" className="text-xs">New Shop Registration</Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Already registered?</span>
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs h-8">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Register Your Shop & Team</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your shop profile, manage billing, branches, inventory, and staff accounts.
            </p>
          </div>

          <Card className="border-primary/20 shadow-md">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" /> Shop & Owner Registration Form
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSignUp} className="space-y-6">
                {/* Step 1: Owner Profile */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
                    <UserPlus className="w-4 h-4" /> 1. Shop Owner / Administrator
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="owner-name" className="text-xs font-medium">Owner Full Name *</Label>
                      <Input
                        id="owner-name"
                        placeholder="e.g. Rajesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="text-sm h-9"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="owner-phone" className="text-xs font-medium">Phone / WhatsApp Number</Label>
                      <Input
                        id="owner-phone"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="owner-email" className="text-xs font-medium">Email Address (Login ID) *</Label>
                      <Input
                        id="owner-email"
                        type="email"
                        placeholder="owner@yourshop.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-sm h-9"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="owner-pass" className="text-xs font-medium">Set Password *</Label>
                      <Input
                        id="owner-pass"
                        type="password"
                        placeholder="Create strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-sm h-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Shop & Store Information */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary border-b pb-2">
                    <Store className="w-4 h-4" /> 2. Shop & Business Information
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="reg-shop-name" className="text-xs font-medium">Shop / Store Name *</Label>
                      <Input
                        id="reg-shop-name"
                        placeholder="e.g. Apex Hardware & Spares"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        className="text-sm h-9"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-currency" className="text-xs font-medium">Primary Currency</Label>
                      <select
                        id="reg-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full h-9 px-3 text-xs rounded-md border bg-background"
                      >
                        <option value="INR">₹ INR (India)</option>
                        <option value="USD">$ USD (US)</option>
                        <option value="EUR">€ EUR (Europe)</option>
                        <option value="GBP">£ GBP (UK)</option>
                        <option value="AED">AED (UAE)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-business-type" className="text-xs font-medium">Business Category</Label>
                      <select
                        id="reg-business-type"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                        className="w-full h-9 px-3 text-xs rounded-md border bg-background"
                      >
                        <option value="retail">🏪 Retail Store / Shop (POS, Inventory, Billing)</option>
                        <option value="wholesale">📦 Wholesale & Distribution</option>
                        <option value="manufacturing">🏭 Manufacturing & Assembly Plant</option>
                        <option value="services">💼 Repair & Service Center</option>
                        <option value="other">🏢 General Business Enterprise</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-gstin" className="text-xs font-medium">GSTIN / Tax Registration No.</Label>
                      <Input
                        id="reg-gstin"
                        placeholder="e.g. 07AAAAA0000A1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        className="text-sm h-9 font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="reg-address" className="text-xs font-medium">Physical Shop Address</Label>
                      <Input
                        id="reg-address"
                        placeholder="Shop No., Market / Complex, Main Street"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-city" className="text-xs font-medium">City / Town</Label>
                      <Input
                        id="reg-city"
                        placeholder="e.g. Chandigarh"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <Button type="submit" size="lg" className="w-full text-sm font-semibold h-11 gap-2 shadow-lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Setting Up Workspace...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Create Shop & Launch Dashboard <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-6 py-3 text-center text-xs text-muted-foreground">
        FactoryBrain OS • Multi-Shop & Enterprise Production Platform
      </footer>
    </div>
  );
}
