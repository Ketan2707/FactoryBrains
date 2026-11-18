'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { DEMO_ORGANIZATIONS } from '@/lib/data/demo-organizations';
import type { BusinessType } from '@/lib/types/organization';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ArrowRight, 
  Store, 
  UserPlus, 
  LogIn, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, isLoading } = useAuthStore();
  const { setOrganization } = useOrganizationStore();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [email, setEmail] = useState('manager@apexmotion.com');
  const [password, setPassword] = useState('demo123');
  const [loginError, setLoginError] = useState('');

  // Sign Up / New User & Shop State
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('retail');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [gstin, setGstin] = useState('');
  const [signupError, setSignupError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email.trim()) { setLoginError('Please enter your email'); return; }
    
    const result = await login(email, password);
    if (result.success) {
      toast.success('Signed in successfully');
      router.push('/dashboard');
    } else {
      setLoginError(result.message || 'Invalid credentials');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!fullName.trim()) { setSignupError('Please enter your full name'); return; }
    if (!signupEmail.trim()) { setSignupError('Please enter your email address'); return; }
    if (!signupPassword.trim()) { setSignupError('Please set a password'); return; }
    if (!shopName.trim()) { setSignupError('Please enter your shop / business name'); return; }

    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

    const result = await signup({
      name: fullName.trim(),
      email: signupEmail.trim(),
      password: signupPassword.trim(),
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
        description: `Your shop "${shopName}" is now active and ready.`,
      });
      router.push('/dashboard');
    } else {
      setSignupError(result.message || 'Failed to create account. Please try again.');
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string, orgId: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    const result = await login(demoEmail, demoPass);
    if (result.success) {
      if (DEMO_ORGANIZATIONS[orgId]) {
        setOrganization(DEMO_ORGANIZATIONS[orgId]);
      }
      toast.success(`Logged in as ${DEMO_ORGANIZATIONS[orgId]?.name || 'Demo Account'}`);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding & value proposition */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] fb-gradient-bg flex-col justify-between p-10 text-white shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">FactoryBrain</span>
          </div>
          <Badge variant="outline" className="text-white/90 border-white/30 bg-white/10 text-xs px-2.5 py-0.5">
            Enterprise & Shop Operating System
          </Badge>
        </div>

        <div className="space-y-6 my-auto py-10">
          <div>
            <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-3">
              One Brain for your Shop & Factory.
            </h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-sm">
              Manage inventory, live sales, suppliers, customer billing, multi-store branches, and AI automations in one unified workspace.
            </p>
          </div>

          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/10">
              <Store className="w-5 h-5 text-amber-300 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">Retail & Wholesale Shops</p>
                <p className="text-white/70">Point of Sale, stocks, purchases & GST invoices</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/10">
              <Building2 className="w-5 h-5 text-cyan-300 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">Manufacturing Units</p>
                <p className="text-white/70">Production lines, BOM, IoT machines & predictive AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-2.5 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">Multi-Location & Staff Access</p>
                <p className="text-white/70">Branch management, cashier accounts & role security</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs text-white/60">
          <p className="flex items-center gap-1.5 font-medium text-white/80">
            <Zap className="w-3.5 h-3.5 text-amber-300" /> Instant Setup with Persistent Local Workspace
          </p>
          <p>© 2026 FactoryBrain AI. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — Tabs for Sign In & Sign Up */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-[480px] py-4">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl fb-gradient-bg flex items-center justify-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">FactoryBrain</span>
              <p className="text-[11px] text-muted-foreground">Shop & Industrial Intelligence</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {activeTab === 'signin' ? 'Sign In' : 'Create Shop Account'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeTab === 'signin' 
                    ? 'Access your shop workspace or test with demo personas' 
                    : 'Register your shop, setup branches, and start managing today'}
                </p>
              </div>
              <TabsList className="grid grid-cols-2 w-48 h-9">
                <TabsTrigger value="signin" className="text-xs font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-xs font-medium">Sign Up</TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: SIGN IN */}
            <TabsContent value="signin" className="space-y-4 mt-0">
              {/* Quick Demo Access Box */}
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Personas
                  </span>
                  <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">Pre-loaded Data</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-2 bg-card hover:bg-accent border-primary/20"
                    onClick={() => handleQuickDemoLogin('owner@urbanmart.com', 'demo123', 'org_urbanmart')}
                  >
                    🏪 Retail Shop
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-2 bg-card hover:bg-accent border-primary/20"
                    onClick={() => handleQuickDemoLogin('manager@apexmotion.com', 'demo123', 'org_apex')}
                  >
                    🏭 Apex Plant
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-2 bg-card hover:bg-accent border-primary/20"
                    onClick={() => handleQuickDemoLogin('admin@enterprise.com', 'demo123', 'org_enterprise')}
                  >
                    🏢 Enterprise
                  </Button>
                </div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-medium">Email address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@yourshop.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="text-sm h-9 pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-xs font-medium">Password</Label>
                    <span className="text-[10px] text-muted-foreground">Demo pass: <code>demo123</code></span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="text-sm h-9 pl-9"
                    />
                  </div>
                </div>

                {loginError && <p className="text-xs text-destructive font-medium">{loginError}</p>}

                <Button type="submit" className="w-full text-xs h-9 gap-1.5 font-medium" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In to Shop <LogIn className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-2 text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary" 
                  onClick={() => setActiveTab('signup')}
                >
                  Don&apos;t have an account yet? <span className="text-primary font-semibold ml-1">Create Shop & User →</span>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: SIGN UP / NEW SHOP & USER */}
            <TabsContent value="signup" className="space-y-4 mt-0">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Section A: Owner / User Info */}
                <div className="p-3.5 rounded-xl border bg-card/50 space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b">
                    <UserPlus className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">1. Account & Owner Information</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="signup-name" className="text-[11px] font-medium">Your Full Name *</Label>
                      <Input
                        id="signup-name"
                        placeholder="e.g. Aarav Arora"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="text-xs h-8"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="signup-phone" className="text-[11px] font-medium">Phone / WhatsApp</Label>
                      <Input
                        id="signup-phone"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="signup-email" className="text-[11px] font-medium">Email Address *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="owner@myshop.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="text-xs h-8"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="signup-pass" className="text-[11px] font-medium">Password *</Label>
                      <Input
                        id="signup-pass"
                        type="password"
                        placeholder="Create password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="text-xs h-8"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Shop & Store Details */}
                <div className="p-3.5 rounded-xl border bg-card/50 space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b">
                    <Store className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">2. Shop & Business Details</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="shop-name" className="text-[11px] font-medium">Shop / Store Name *</Label>
                      <Input
                        id="shop-name"
                        placeholder="e.g. Arora Electronics & Spares"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        className="text-xs h-8"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="currency" className="text-[11px] font-medium">Currency</Label>
                      <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                      >
                        <option value="INR">₹ INR (India)</option>
                        <option value="USD">$ USD (US)</option>
                        <option value="EUR">€ EUR (Europe)</option>
                        <option value="GBP">£ GBP (UK)</option>
                        <option value="AED">AED (UAE)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="business-type" className="text-[11px] font-medium">Business Type</Label>
                      <select
                        id="business-type"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                        className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                      >
                        <option value="retail">🏪 Retail Store / Shop</option>
                        <option value="wholesale">📦 Wholesale & Trading</option>
                        <option value="manufacturing">🏭 Manufacturing & Workshop</option>
                        <option value="distribution">🚛 Logistics & Distribution</option>
                        <option value="services">💼 Services & Repairs</option>
                        <option value="other">🏢 Other Business</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-[11px] font-medium">City / Town</Label>
                      <Input
                        id="city"
                        placeholder="e.g. New Delhi"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="address" className="text-[11px] font-medium">Store Address</Label>
                      <Input
                        id="address"
                        placeholder="Shop No., Market / Street"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="gstin" className="text-[11px] font-medium">GSTIN / Tax ID (Optional)</Label>
                      <Input
                        id="gstin"
                        placeholder="e.g. 07AAAAA0000A1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        className="text-xs h-8 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {signupError && <p className="text-xs text-destructive font-medium">{signupError}</p>}

                <Button type="submit" className="w-full text-xs h-9 gap-1.5 font-medium" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Creating Shop Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Create Account & Launch Shop
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-primary" 
                    onClick={() => setActiveTab('signin')}
                  >
                    Already have an account? <span className="text-primary font-semibold ml-1">Sign In →</span>
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
