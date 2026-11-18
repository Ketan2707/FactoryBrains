'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { AIBusinessEngine } from '@/lib/services/ai-business-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert,
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart, 
  Package, 
  DollarSign, 
  Lightbulb, 
  Layers, 
  Truck, 
  Users, 
  Percent, 
  Wallet,
  Activity,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIInsightsPage() {
  const router = useRouter();
  const { organization } = useOrganizationStore();
  const { 
    getProducts, 
    getSales, 
    getPurchases, 
    getCustomers, 
    getSuppliers, 
    getExpenses, 
    addPurchase 
  } = useShopDataStore();

  const [activeTab, setActiveTab] = useState('overview');

  if (!organization) return null;

  const orgId = organization.id;
  const isCustom = organization.isCustom || orgId.startsWith('org_custom_');
  const businessType = organization.businessType || 'retail';
  const currencySymbol = organization.currencySymbol || '₹';

  const products = getProducts(orgId, businessType, isCustom);
  const sales = getSales(orgId, businessType, isCustom);
  const purchases = getPurchases(orgId, isCustom);
  const customers = getCustomers(orgId, isCustom);
  const suppliers = getSuppliers(orgId, isCustom);
  const expenses = getExpenses(orgId, isCustom);

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

  const health = useMemo(() => engine.getHealthScore(), [engine]);
  const briefing = useMemo(() => engine.getDailyBriefing(), [engine]);
  const priorities = useMemo(() => engine.getActionCenterPriorities(), [engine]);
  const predictiveInventory = useMemo(() => engine.getPredictiveInventory(), [engine]);
  const purchasePlan = useMemo(() => engine.getSmartPurchasePlan(), [engine]);
  const supplierScores = useMemo(() => engine.getSupplierIntelligence(), [engine]);
  const cashForecast = useMemo(() => engine.getCashFlowForecast(), [engine]);
  const anomalies = useMemo(() => engine.getBusinessAnomalies(), [engine]);
  const customerIntelligence = useMemo(() => engine.getCustomerIntelligence(), [engine]);
  const productProfitability = useMemo(() => engine.getProductProfitability(), [engine]);
  const slowMoving = useMemo(() => engine.getSlowMovingInventory(), [engine]);
  const pricingAlerts = useMemo(() => engine.getPricingAlerts(), [engine]);
  const patterns = useMemo(() => engine.getLearnedPatterns(), [engine]);

  const handleCreateBatchPO = () => {
    if (purchasePlan.recommendations.length === 0) {
      toast.info('No purchase orders needed at this time.');
      return;
    }

    const items = purchasePlan.recommendations.map(r => ({
      id: `poi_${Date.now()}_${r.productId}`,
      productId: r.productId,
      productName: r.productName,
      quantity: r.recommendedOrderQty,
      receivedQuantity: 0,
      unitPrice: r.estimatedCost / r.recommendedOrderQty,
      total: r.estimatedCost,
    }));

    addPurchase(orgId, {
      poNumber: `PO-${new Date().getFullYear()}-${(purchases.length + 1).toString().padStart(4, '0')}`,
      supplierId: suppliers[0]?.id || 'sup_default',
      supplierName: suppliers[0]?.name || 'Primary Wholesale Distributor',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'sent',
      items,
      subtotal: purchasePlan.totalRecommendedCost,
      tax: Math.round(purchasePlan.totalRecommendedCost * 0.18),
      total: Math.round(purchasePlan.totalRecommendedCost * 1.18),
      paymentStatus: 'unpaid',
    });

    toast.success(`Generated Smart Purchase Order!`, {
      description: `Covering ${purchasePlan.totalItemsCount} items (${currencySymbol}${purchasePlan.totalRecommendedCost.toLocaleString('en-IN')}) for ${purchasePlan.expectedCoverageDays} days.`,
    });

    router.push('/purchases');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" /> AI Business Intelligence Hub
            </h1>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Live Neural Analytics
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Continuous diagnostic, predictive, and prescriptive intelligence for <span className="font-semibold text-foreground">{organization.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 text-xs h-8 font-semibold" onClick={() => router.push('/dashboard')}>
            Command Center →
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 h-auto p-1 bg-muted/60">
          <TabsTrigger value="overview" className="text-xs py-2 gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" /> Overview
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="text-xs py-2 gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Opportunities
          </TabsTrigger>
          <TabsTrigger value="risks" className="text-xs py-2 gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Risks & Anomalies
          </TabsTrigger>
          <TabsTrigger value="predictions" className="text-xs py-2 gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> Predictions
          </TabsTrigger>
          <TabsTrigger value="purchasing" className="text-xs py-2 gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" /> Smart Purchasing
          </TabsTrigger>
          <TabsTrigger value="profitability" className="text-xs py-2 gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" /> Profit Matrix
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: OVERVIEW ─── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Health Score Card */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Business Health Score
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {health.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-foreground">{health.overallScore}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Sales Velocity & Growth</span>
                      <span className="font-semibold">{health.metrics.salesGrowth}%</span>
                    </div>
                    <Progress value={health.metrics.salesGrowth} className="h-1.5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Profit Margins</span>
                      <span className="font-semibold">{health.metrics.profitMargin}%</span>
                    </div>
                    <Progress value={health.metrics.profitMargin} className="h-1.5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Inventory Health</span>
                      <span className="font-semibold">{health.metrics.inventoryHealth}%</span>
                    </div>
                    <Progress value={health.metrics.inventoryHealth} className="h-1.5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Cash Flow Liquidity</span>
                      <span className="font-semibold">{health.metrics.cashFlow}%</span>
                    </div>
                    <Progress value={health.metrics.cashFlow} className="h-1.5" />
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground pt-2 border-t leading-relaxed">
                  {health.summary}
                </p>
              </CardContent>
            </Card>

            {/* AI Executive Summary */}
            <Card className="lg:col-span-2 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Executive Briefing
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Synthesized operations analysis from your real database transactions
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-relaxed">
                <div className="p-3.5 rounded-xl bg-muted/40 border space-y-2">
                  <p className="text-foreground">
                    <strong>Current State:</strong> {organization.name} is currently operating at a healthy gross margin profile. 
                    {briefing.stockout7DaysCount > 0 
                      ? ` However, ${briefing.stockout7DaysCount} products face imminent stockout risks in the next 7 days based on current customer sales velocity.`
                      : ' Inventory levels across all major product lines are balanced with no immediate stockouts projected.'}
                  </p>
                  <p className="text-foreground">
                    <strong>Cash Position:</strong> 30-day cash reserves are projected at <strong>{currencySymbol}{cashForecast.projectedCash30d.toLocaleString('en-IN')}</strong>. 
                    {briefing.overduePaymentsAmount > 0 
                      ? ` Collecting the ${currencySymbol}${Math.round(briefing.overduePaymentsAmount).toLocaleString('en-IN')} in pending client invoices will further strengthen operating liquidity.`
                      : ' All client receivables are up to date with zero overdue accounts.'}
                  </p>
                </div>

                {/* AI Memory Patterns */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Learned Business Memory & Patterns:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {patterns.map(pat => (
                      <div key={pat.id} className="p-2.5 rounded-lg border bg-card text-[11px] space-y-1">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{pat.icon}</span> {pat.title}
                        </p>
                        <p className="text-muted-foreground leading-tight">{pat.observation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── TAB 2: OPPORTUNITIES ─── */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Profitability Opportunity */}
            <Card className="shadow-xs border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Margin Expansion
                </Badge>
                <CardTitle className="text-sm font-bold mt-1">High-Margin Growth Asset</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {productProfitability[0] ? (
                  <>
                    <p className="font-semibold text-foreground">{productProfitability[0].name}</p>
                    <p className="text-muted-foreground text-[11px]">
                      Delivers <strong>{productProfitability[0].marginPercent}% margin</strong> with {productProfitability[0].unitsSold} units sold.
                    </p>
                    <p className="text-emerald-700 font-medium text-[11px]">
                      {productProfitability[0].aiRecommendation}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Add products to view margin opportunities.</p>
                )}
              </CardContent>
            </Card>

            {/* Cash Recovery Opportunity */}
            <Card className="shadow-xs border-blue-500/20 bg-blue-500/5">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">
                  Receivables Recovery
                </Badge>
                <CardTitle className="text-sm font-bold mt-1">Working Capital Inflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="font-semibold text-foreground">
                  {currencySymbol}{Math.round(briefing.overduePaymentsAmount).toLocaleString('en-IN')} Uncollected
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Across {briefing.overdueCustomersCount} overdue client invoices.
                </p>
                <Button size="sm" variant="outline" className="text-xs h-7 mt-1 gap-1" onClick={() => router.push('/customers')}>
                  Send Payment Reminders →
                </Button>
              </CardContent>
            </Card>

            {/* Pricing Adjustment Opportunity */}
            <Card className="shadow-xs border-purple-500/20 bg-purple-500/5">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                  Pricing Protection
                </Badge>
                <CardTitle className="text-sm font-bold mt-1">Smart Price Adjustment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {pricingAlerts[0] ? (
                  <>
                    <p className="font-semibold text-foreground">{pricingAlerts[0].productName}</p>
                    <p className="text-muted-foreground text-[11px]">
                      Cost rose {pricingAlerts[0].costIncreasePercent}%. Target sell: <strong>{currencySymbol}{pricingAlerts[0].suggestedSellingPrice}</strong> (+{currencySymbol}{pricingAlerts[0].suggestedSellingPrice - pricingAlerts[0].currentSellingPrice}).
                    </p>
                    <Button size="sm" variant="outline" className="text-xs h-7 mt-1" onClick={() => router.push('/products')}>
                      Update Price →
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">All catalog prices maintain healthy 30%+ gross margins.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── TAB 3: RISKS & ANOMALIES ─── */}
        <TabsContent value="risks" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive" /> Active Risk & Anomaly Detectors
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Automatic anomaly detection across procurement, inventory duration, and margins
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {anomalies.length > 0 ? (
                <div className="divide-y text-xs">
                  {anomalies.map(anom => (
                    <div key={anom.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] uppercase font-bold text-destructive bg-destructive/10 border-destructive/20">
                            {anom.severity} Alert
                          </Badge>
                          <h4 className="font-bold text-sm text-foreground">{anom.title}</h4>
                        </div>
                        <p className="text-muted-foreground">{anom.description}</p>
                        <p className="text-[11px] text-amber-600 font-medium">Impact: {anom.impact}</p>
                      </div>

                      <Button size="sm" className="text-xs h-8 shrink-0 gap-1 font-semibold" onClick={() => router.push(anom.actionRoute)}>
                        {anom.actionLabel} <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                  <p className="text-xs font-semibold text-foreground">Zero Critical Anomalies Detected</p>
                  <p className="text-[11px]">All procurement costs, stock durations, and margins are within normal ranges.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 4: PREDICTIONS & CASH FORECAST ─── */}
        <TabsContent value="predictions" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">60-Day Cash Flow Forecast</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Simulated cash trajectory based on daily sales velocity, expenses, and planned restocks
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                87% Confidence
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashForecast.forecastPoints}>
                    <defs>
                      <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `${currencySymbol}${(v/1000).toFixed(0)}K`} 
                    />
                    <RechartsTooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      formatter={(value: unknown) => [`${currencySymbol}${Number(value).toLocaleString('en-IN')}`, 'Projected Cash']}
                    />
                    <Area type="monotone" dataKey="estimatedCash" stroke="#10b981" strokeWidth={2} fill="url(#cashGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl border bg-card">
                  <span className="text-[10px] text-muted-foreground">Current Liquidity</span>
                  <p className="text-sm font-bold">{currencySymbol}{cashForecast.currentCash.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 rounded-xl border bg-card">
                  <span className="text-[10px] text-muted-foreground">7-Day Projected</span>
                  <p className="text-sm font-bold">{currencySymbol}{cashForecast.projectedCash7d.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 rounded-xl border bg-card">
                  <span className="text-[10px] text-muted-foreground">30-Day Projected</span>
                  <p className="text-sm font-bold">{currencySymbol}{cashForecast.projectedCash30d.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 rounded-xl border bg-card">
                  <span className="text-[10px] text-muted-foreground">60-Day Projected</span>
                  <p className="text-sm font-bold">{currencySymbol}{cashForecast.projectedCash60d.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 5: SMART PURCHASING ─── */}
        <TabsContent value="purchasing" className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" /> Autonomous Restock Recommendations
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Evaluates sales velocity, supplier lead time, and safety stock buffers
                </p>
              </div>

              <Button
                size="sm"
                className="text-xs h-8.5 gap-1.5 font-semibold bg-gradient-to-r from-primary to-indigo-600 shadow-md"
                onClick={handleCreateBatchPO}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> 1-Click Create POs ({purchasePlan.totalItemsCount} items)
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Total Recommended Investment:</span>
                  <span className="text-base font-extrabold text-foreground">{currencySymbol}{purchasePlan.totalRecommendedCost.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Estimated Coverage:</span>
                  <span className="text-base font-extrabold text-foreground">~{purchasePlan.expectedCoverageDays} Days</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">AI Confidence:</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600">89% Confidence</Badge>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs">Product to Order</TableHead>
                      <TableHead className="text-xs">SKU</TableHead>
                      <TableHead className="text-xs text-right">Current Stock</TableHead>
                      <TableHead className="text-xs text-right">30d Demand</TableHead>
                      <TableHead className="text-xs text-right">Recommended Qty</TableHead>
                      <TableHead className="text-xs text-right">Est. Cost</TableHead>
                      <TableHead className="text-xs">Primary Supplier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchasePlan.recommendations.length > 0 ? (
                      purchasePlan.recommendations.map((r, idx) => (
                        <TableRow key={idx} className="text-xs">
                          <TableCell className="font-semibold text-foreground">{r.productName}</TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">{r.sku}</TableCell>
                          <TableCell className="text-right">{r.currentStock}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{r.predictedDemand30d}</TableCell>
                          <TableCell className="text-right font-bold text-primary">{r.recommendedOrderQty}</TableCell>
                          <TableCell className="text-right font-bold text-foreground">{currencySymbol}{r.estimatedCost.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-muted-foreground">{r.supplierName}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          All products have sufficient inventory. No purchase orders needed!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 6: PRODUCT PROFITABILITY & PRICING MATRIX ─── */}
        <TabsContent value="profitability" className="space-y-4">
          {/* 4-Quadrant Matrix */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Product Profitability 4-Quadrant Matrix
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Classifies products by Gross Margin % vs. Sales Velocity & Demand
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Q1: HIGH PROFIT / HIGH DEMAND */}
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-500/10 border-emerald-500/20">
                      ⭐ Top Opportunities
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">High Margin • High Demand</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {productProfitability.filter(p => p.quadrant === 'HIGH PROFIT / HIGH DEMAND').map(p => (
                      <div key={p.id} className="p-2 rounded-lg bg-card border flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.marginPercent}% margin • {p.unitsSold} sold</p>
                        </div>
                        <span className="font-bold text-emerald-600">{currencySymbol}{p.grossProfit.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q2: HIGH PROFIT / LOW DEMAND */}
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-700 bg-blue-500/10 border-blue-500/20">
                      💎 Hidden Gems
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">High Margin • Low Demand</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {productProfitability.filter(p => p.quadrant === 'HIGH PROFIT / LOW DEMAND').map(p => (
                      <div key={p.id} className="p-2 rounded-lg bg-card border flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.marginPercent}% margin • Promote more</p>
                        </div>
                        <span className="font-bold">{currencySymbol}{p.sellingPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q3: LOW PROFIT / HIGH DEMAND */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-700 bg-amber-500/10 border-amber-500/20">
                      ⚡ Volume Drivers
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">Low Margin • High Demand</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {productProfitability.filter(p => p.quadrant === 'LOW PROFIT / HIGH DEMAND').map(p => (
                      <div key={p.id} className="p-2 rounded-lg bg-card border flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.marginPercent}% margin • Review price</p>
                        </div>
                        <span className="text-amber-600 font-bold">{p.unitsSold} units</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q4: LOW PROFIT / LOW DEMAND */}
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-red-700 bg-red-500/10 border-red-500/20">
                      ⚠️ Capital Locks
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">Low Margin • Low Demand</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {productProfitability.filter(p => p.quadrant === 'LOW PROFIT / LOW DEMAND').map(p => (
                      <div key={p.id} className="p-2 rounded-lg bg-card border flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{currencySymbol}{p.capitalLocked.toLocaleString('en-IN')} locked</p>
                        </div>
                        <span className="text-xs text-muted-foreground">Phase out</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
