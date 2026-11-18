'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { SmartListingModal } from '@/components/products/smart-listing-modal';
import { WhatToDoModal } from '@/components/ai/what-to-do-modal';
import { AIBusinessEngine } from '@/lib/services/ai-business-engine';
import type { Product } from '@/lib/types/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Factory, 
  Cog, 
  Wrench, 
  Target, 
  Gauge,
  Plus,
  Store,
  FileText,
  Rocket,
  Zap,
  Clock,
  ArrowRight,
  HelpCircle,
  TrendingDown,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';

const CHART_COLORS = ['#5b5fc7', '#34a87e', '#d9713c', '#8b5cf6', '#0ea5e9', '#f59e0b'];

export default function DashboardPage() {
  const { organization } = useOrganizationStore();

  if (!organization) return null;

  if (organization.businessType === 'manufacturing') {
    return <ManufacturingDashboard />;
  }

  return <RetailDashboard />;
}

// ─── Retail / Small Business Dashboard ───────────────────────

function RetailDashboard() {
  const router = useRouter();
  const { organization } = useOrganizationStore();
  const { 
    getProducts, 
    getSales, 
    getPurchases, 
    getCustomers, 
    getSuppliers, 
    getExpenses, 
    addMultipleProducts,
    loadSampleData 
  } = useShopDataStore();

  const [smartModalOpen, setSmartModalOpen] = useState(false);
  const [whatToDoOpen, setWhatToDoOpen] = useState(false);

  if (!organization) return null;

  const orgId = organization.id;
  const isCustom = organization.isCustom || orgId.startsWith('org_custom_');
  const currencySymbol = organization.currencySymbol || '₹';

  const products = getProducts(orgId, organization.businessType, isCustom);
  const sales = getSales(orgId, organization.businessType, isCustom);
  const purchases = getPurchases(orgId, isCustom);
  const customers = getCustomers(orgId, isCustom);
  const suppliers = getSuppliers(orgId, isCustom);
  const expenses = getExpenses(orgId, isCustom);

  // Initialize Real AI Business Engine
  const engine = useMemo(() => {
    return new AIBusinessEngine(
      products,
      sales,
      purchases,
      customers,
      suppliers,
      expenses,
      organization
    );
  }, [products, sales, purchases, customers, suppliers, expenses, organization]);

  const healthScore = useMemo(() => engine.getHealthScore(), [engine]);
  const briefing = useMemo(() => engine.getDailyBriefing(), [engine]);
  const priorities = useMemo(() => engine.getActionCenterPriorities(), [engine]);
  const predictiveInventory = useMemo(() => engine.getPredictiveInventory(), [engine]);
  const cashFlowForecast = useMemo(() => engine.getCashFlowForecast(), [engine]);

  // Computed KPIs
  const todaySales = useMemo(() => sales.reduce((sum, s) => sum + s.total, 0), [sales]);
  const lowStockCount = useMemo(() => predictiveInventory.filter(p => p.risk === 'critical' || p.risk === 'high').length, [predictiveInventory]);
  const pendingPayments = useMemo(() => {
    return sales
      .filter(s => s.paymentStatus !== 'paid')
      .reduce((sum, s) => sum + (s.total - s.amountPaid), 0);
  }, [sales]);

  // Category breakdown
  const categorySales = useMemo(() => {
    if (sales.length === 0 && products.length === 0) return [];
    const catMap: Record<string, number> = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId || p.name === item.productName);
        const cat = prod?.category || 'General';
        catMap[cat] = (catMap[cat] || 0) + item.total;
      });
    });

    if (Object.keys(catMap).length === 0 && products.length > 0) {
      products.forEach(p => {
        catMap[p.category] = (catMap[p.category] || 0) + (p.sellingPrice * p.stock);
      });
    }

    return Object.entries(catMap).map(([category, revenue]) => ({ category, revenue }));
  }, [sales, products]);

  const topCategory = categorySales.length > 0 
    ? categorySales.sort((a, b) => b.revenue - a.revenue)[0] 
    : { category: 'No Sales Yet', revenue: 0 };

  const isFreshShop = products.length === 0 && sales.length === 0;

  const handleBatchImport = (items: Omit<Product, 'id'>[]) => {
    addMultipleProducts(orgId, items);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Command Center</h1>
            {isFreshShop ? (
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Fresh Workspace
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                AI Autonomous OS
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {briefing.greeting}. Here is your live business intelligence for <span className="font-semibold text-foreground">{organization.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Prominent "What Should I Do Today?" AI Button */}
          <Button 
            size="sm" 
            className="text-xs h-9 gap-1.5 font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 shadow-md"
            onClick={() => setWhatToDoOpen(true)}
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> What Should I Do Today?
          </Button>

          <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5" onClick={() => setSmartModalOpen(true)}>
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Smart List Items
          </Button>

          <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5" onClick={() => router.push('/sales')}>
            <Plus className="w-3.5 h-3.5" /> New Bill
          </Button>
        </div>
      </div>

      {/* ─── 0. RETAIL 1-TAP COUNTER QUICK ACTION DOCK ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <Button
          className="h-14 flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white shadow-sm font-semibold text-xs"
          onClick={() => router.push('/sales')}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>+ Quick New Bill</span>
        </Button>

        <Button
          variant="outline"
          className="h-14 flex flex-col items-center justify-center gap-1 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 font-semibold text-xs"
          onClick={() => setSmartModalOpen(true)}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>+ Smart Add Items</span>
        </Button>

        <Button
          variant="outline"
          className="h-14 flex flex-col items-center justify-center gap-1 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 font-semibold text-xs"
          onClick={() => router.push('/purchases')}
        >
          <Package className="w-4 h-4 text-emerald-600" />
          <span>+ Buy Stock / PO</span>
        </Button>

        <Button
          variant="outline"
          className="h-14 flex flex-col items-center justify-center gap-1 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 font-semibold text-xs"
          onClick={() => router.push('/customers')}
        >
          <Users className="w-4 h-4 text-purple-600" />
          <span>💬 Customer Udhaar</span>
        </Button>

        <Button
          variant="outline"
          className="h-14 flex flex-col items-center justify-center gap-1 rounded-xl border bg-card hover:bg-primary/5 hover:border-primary/40 font-semibold text-xs col-span-2 sm:col-span-1"
          onClick={() => router.push('/expenses')}
        >
          <CreditCard className="w-4 h-4 text-red-500" />
          <span>💸 Daily Expenses</span>
        </Button>
      </div>

      {/* ─── 1. TODAY'S BUSINESS BRIEFING & HEALTH SCORE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Briefing Banner */}
        <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-card shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Today&apos;s Shop Briefing
                </CardTitle>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl border bg-card/60">
                <span className="text-[10px] text-muted-foreground block">Counter Sales</span>
                <p className="font-bold text-sm text-foreground">{currencySymbol}{briefing.yesterdaySales.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-emerald-600 font-medium">↑ {briefing.growthPercent}% vs avg</span>
              </div>

              <div className="p-2.5 rounded-xl border bg-card/60">
                <span className="text-[10px] text-muted-foreground block">Stockout Risk (7d)</span>
                <p className={`font-bold text-sm ${briefing.stockout7DaysCount > 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {briefing.stockout7DaysCount} items low
                </p>
                <span className="text-[10px] text-muted-foreground">order stock</span>
              </div>

              <div className="p-2.5 rounded-xl border bg-card/60">
                <span className="text-[10px] text-muted-foreground block">Customer Udhaar (Dues)</span>
                <p className="font-bold text-sm text-amber-600">{currencySymbol}{Math.round(briefing.overduePaymentsAmount).toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-muted-foreground">{briefing.overdueCustomersCount} accounts</span>
              </div>

              <div className="p-2.5 rounded-xl border bg-card/60">
                <span className="text-[10px] text-muted-foreground block">Cash Available</span>
                <p className="font-bold text-sm text-foreground">{currencySymbol}{cashFlowForecast.projectedCash30d.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-emerald-600 font-medium">safe balance</span>
              </div>
            </div>

            {/* AI Top Recommendation Bar */}
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-start sm:items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-foreground font-medium">
                  <strong>AI Shop Tip:</strong> &ldquo;{briefing.topRecommendation.text}&rdquo;
                </span>
              </div>
              <Button
                size="sm"
                variant="default"
                className="text-xs h-7 self-end sm:self-auto shrink-0 gap-1 font-semibold"
                onClick={() => router.push(briefing.topRecommendation.actionRoute)}
              >
                {briefing.topRecommendation.actionLabel} <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Health Score Card */}
        <Card className="shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Business Health Score
              </CardTitle>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {healthScore.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">{healthScore.overallScore}</span>
              <span className="text-xs text-muted-foreground font-medium">/ 100</span>
            </div>

            {/* Metric breakdown bars */}
            <div className="space-y-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Sales & Margin</span>
                  <span className="font-semibold">{healthScore.metrics.salesGrowth}%</span>
                </div>
                <Progress value={healthScore.metrics.salesGrowth} className="h-1.5" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Inventory Health</span>
                  <span className="font-semibold">{healthScore.metrics.inventoryHealth}%</span>
                </div>
                <Progress value={healthScore.metrics.inventoryHealth} className="h-1.5" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Cash & Receivables</span>
                  <span className="font-semibold">{healthScore.metrics.cashFlow}%</span>
                </div>
                <Progress value={healthScore.metrics.cashFlow} className="h-1.5" />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground pt-1 border-t leading-tight">
              {healthScore.summary}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── 2. AI ACTION CENTER (PRIORITIES) ─── */}
      <Card className="shadow-xs">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Today&apos;s AI Action Priorities
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Autonomous tasks ready for your 1-click execution
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-primary h-7 gap-1" onClick={() => setWhatToDoOpen(true)}>
            View All ({priorities.length}) →
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {priorities.slice(0, 4).map(task => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border bg-card hover:border-primary/40 transition-all flex flex-col justify-between space-y-2.5 group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] uppercase font-bold ${
                        task.priority === 'high' 
                          ? 'bg-red-500/10 text-red-600 border-red-500/20' 
                          : task.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      }`}
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{task.confidence}% match</span>
                  </div>
                  <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {task.why}
                  </p>
                </div>

                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-[10px] font-medium text-emerald-600 truncate max-w-[120px]">
                    {task.expectedImpact.split('.')[0]}
                  </span>
                  <Button
                    size="sm"
                    className="text-xs h-7 px-2.5 gap-1 font-semibold"
                    onClick={() => router.push(task.actionRoute)}
                  >
                    {task.actionLabel.split(' ')[0]} <ArrowRight className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── 3. CORE FINANCIAL KPIS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Sales Revenue" 
          value={`${currencySymbol}${todaySales.toLocaleString('en-IN')}`} 
          change={sales.length > 0 ? `${sales.length} orders` : 'Fresh store'} 
          trend={sales.length > 0 ? 'up' : 'neutral'} 
          icon={<ShoppingCart className="w-4 h-4" />} 
        />
        <KPICard 
          title="Active Products" 
          value={String(products.length)} 
          subtitle={lowStockCount > 0 ? `${lowStockCount} low stock` : 'in catalog'} 
          change="" 
          trend="neutral" 
          icon={<Package className="w-4 h-4" />} 
          alert={lowStockCount > 0} 
        />
        <KPICard 
          title="Pending Receivables" 
          value={`${currencySymbol}${Math.round(pendingPayments).toLocaleString('en-IN')}`} 
          subtitle="Customer dues"
          change="" 
          trend="neutral" 
          icon={<CreditCard className="w-4 h-4" />} 
          alert={pendingPayments > 10000}
        />
        <KPICard 
          title="30-Day Cash Forecast" 
          value={`${currencySymbol}${cashFlowForecast.projectedCash30d.toLocaleString('en-IN')}`} 
          subtitle={cashFlowForecast.status === 'safe' ? 'Liquidity safe' : 'Watch reserve'} 
          change="" 
          trend={cashFlowForecast.status === 'safe' ? 'up' : 'down'} 
          icon={<Wallet className="w-4 h-4" />} 
        />
      </div>

      {/* ─── 4. CHARTS & PREDICTIVE FORECASTS ─── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Sales trend chart */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Revenue Trend & Demand</CardTitle>
              <p className="text-[11px] text-muted-foreground">Historical sales and recurring monthly trajectory</p>
            </div>
            <Badge variant="outline" className="text-[10px]">Real-time</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { month: 'Mar', revenue: Math.round(todaySales * 0.4) },
                  { month: 'Apr', revenue: Math.round(todaySales * 0.6) },
                  { month: 'May', revenue: Math.round(todaySales * 0.75) },
                  { month: 'Jun', revenue: Math.round(todaySales * 0.85) },
                  { month: 'Jul', revenue: Math.round(todaySales * 0.95) },
                  { month: 'Aug', revenue: todaySales },
                ]}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5b5fc7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#5b5fc7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `${currencySymbol}${(v/1000).toFixed(0)}K`} 
                  />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(value: unknown) => [`${currencySymbol}${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#5b5fc7" strokeWidth={2} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sales by Category</CardTitle>
            <p className="text-[11px] text-muted-foreground">Portfolio revenue concentration</p>
          </CardHeader>
          <CardContent>
            {categorySales.length > 0 ? (
              <>
                <div className="h-44 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={categorySales} 
                        dataKey="revenue" 
                        nameKey="category" 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={42} 
                        outerRadius={68} 
                        paddingAngle={2}
                      >
                        {categorySales.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                        formatter={(value: unknown) => [`${currencySymbol}${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-xs">
                  {categorySales.slice(0, 4).map((c, i) => (
                    <div key={c.category} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="truncate">{c.category}</span>
                      </span>
                      <span className="font-semibold">{currencySymbol}{c.revenue.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-muted-foreground space-y-2">
                <Store className="w-8 h-8 opacity-40 text-primary" />
                <p className="text-xs">No category breakdown yet</p>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setSmartModalOpen(true)}>
                  ⚡ Smart Add Items
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── 5. RECENT TRANSACTIONS & PREDICTIVE STOCKOUTS ─── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card className="shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Sales Orders</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-primary h-7" onClick={() => router.push('/sales')}>
              View all →
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {sales.length > 0 ? (
              <div className="divide-y text-xs">
                {sales.slice(0, 5).map(order => (
                  <div key={order.id} className="p-3.5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{order.orderNumber} • {order.customerName}</p>
                      <p className="text-[11px] text-muted-foreground">{order.items.length} items • {order.orderDate}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="font-semibold text-foreground">{currencySymbol}{order.total.toLocaleString('en-IN')}</p>
                      <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-[9px] uppercase font-semibold">
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <FileText className="w-8 h-8 mx-auto opacity-30 text-primary" />
                <p className="text-xs">No sales orders recorded yet.</p>
                <Button size="sm" className="text-xs h-7" onClick={() => router.push('/sales')}>
                  + Create First Bill
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Predictive Inventory Stockouts */}
        <Card className="shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Predictive Stockout Risk</CardTitle>
              <p className="text-[10px] text-muted-foreground">Estimated days of inventory remaining</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary h-7" onClick={() => router.push('/inventory')}>
              Inventory →
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {products.length > 0 ? (
              <div className="divide-y text-xs">
                {predictiveInventory.slice(0, 5).map(item => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.currentStock} in stock • Velocity: {item.dailyVelocity.toFixed(1)}/day
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <Badge 
                        variant={item.risk === 'critical' ? 'destructive' : item.risk === 'high' ? 'secondary' : 'outline'}
                        className="text-[9px]"
                      >
                        {item.daysRemaining <= 0 ? 'Out of Stock' : `${item.daysRemaining} days left`}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground">Runs out: {item.predictedStockoutDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <Package className="w-8 h-8 mx-auto opacity-30 text-primary" />
                <p className="text-xs">No products in inventory.</p>
                <Button size="sm" className="text-xs h-7 gap-1" onClick={() => setSmartModalOpen(true)}>
                  <Zap className="w-3.5 h-3.5" /> Smart Add Products
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* WHAT TO DO TODAY MODAL */}
      <WhatToDoModal
        open={whatToDoOpen}
        onClose={() => setWhatToDoOpen(false)}
        tasks={priorities}
        organizationName={organization.name}
      />

      {/* SMART LISTING MODAL */}
      <SmartListingModal
        open={smartModalOpen}
        onClose={() => setSmartModalOpen(false)}
        currencySymbol={currencySymbol}
        taxRatePercent={organization.taxRatePercent || 18}
        onImportItems={handleBatchImport}
      />
    </div>
  );
}

// ─── Manufacturing Dashboard ────────────────────────────────

function ManufacturingDashboard() {
  const router = useRouter();
  const { organization } = useOrganizationStore();
  const { getProducts, getSales, loadSampleData } = useShopDataStore();

  if (!organization) return null;

  const orgId = organization.id;
  const isCustom = organization.isCustom || orgId.startsWith('org_custom_');

  const products = getProducts(orgId, 'manufacturing', isCustom);
  const sales = getSales(orgId, 'manufacturing', isCustom);

  const isFreshMfg = products.length === 0 && sales.length === 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Plant Command Center</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Operational telemetry for <span className="font-semibold text-foreground">{organization.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFreshMfg && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 gap-1.5 border-primary/30 text-primary" 
              onClick={() => {
                loadSampleData(orgId, 'manufacturing');
                toast.success('Sample manufacturing data loaded!');
              }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Load Sample Plant Data
            </Button>
          )}
          <Button size="sm" className="text-xs h-8 gap-1.5" onClick={() => router.push('/production')}>
            <Plus className="w-3.5 h-3.5" /> New Work Order
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Products" value={String(products.length)} subtitle="BOM items" change="" trend="neutral" icon={<Factory className="w-4 h-4" />} />
        <KPICard title="Total Orders" value={String(sales.length)} subtitle="active orders" change="" trend="neutral" icon={<Cog className="w-4 h-4" />} />
        <KPICard title="Plant OEE" value={isFreshMfg ? "100%" : "84.2%"} subtitle="Target: 85%" change="+1.8%" trend="up" icon={<Gauge className="w-4 h-4" />} />
        <KPICard title="Maintenance Risk" value={isFreshMfg ? "0" : "2"} subtitle="Machines alert" change="" trend="neutral" icon={<Wrench className="w-4 h-4" />} alert={!isFreshMfg} />
      </div>

      {isFreshMfg ? (
        <Card className="p-8 text-center space-y-3 bg-muted/20 border-dashed">
          <Factory className="w-10 h-10 mx-auto opacity-40 text-primary" />
          <h3 className="font-bold text-base">Clean Manufacturing Environment</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Your industrial workspace has been initialized for {organization.name}. You can add production BOMs, machines, work centers, or load sample plant data.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button size="sm" onClick={() => router.push('/products')}>+ Add Industrial Products</Button>
            <Button variant="outline" size="sm" onClick={() => { loadSampleData(orgId, 'manufacturing'); toast.success('Sample plant data loaded!'); }}>
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Load Sample Data
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Active Production Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All plant machinery and telemetry systems synchronized.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Reusable KPI Card ──────────────────────────────────────

function KPICard({
  title,
  value,
  subtitle,
  change,
  trend,
  icon,
  alert,
}: {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <Card className={alert ? 'border-destructive/30 bg-destructive/5' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{title}</span>
          <span className="text-muted-foreground/60">{icon}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        {change && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-600" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3 text-destructive" />}
            <span className={trend === 'up' ? 'text-emerald-600 font-medium' : trend === 'down' ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
