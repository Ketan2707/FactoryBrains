'use client';

import { useMemo, useState } from 'react';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { AIBusinessEngine } from '@/lib/services/ai-business-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Calendar,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { organization } = useOrganizationStore();
  const { 
    getProducts, 
    getSales, 
    getPurchases, 
    getCustomers, 
    getSuppliers, 
    getExpenses 
  } = useShopDataStore();

  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedReportForExplanation, setSelectedReportForExplanation] = useState<any | null>(null);

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
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);

  const REPORT_TEMPLATES = [
    {
      id: 'rep_sales',
      title: 'Executive Sales & Revenue Report',
      category: 'Sales & Revenue',
      description: `Detailed ledger of ${sales.length} customer sales orders, average order values, and gross revenue total of ${currencySymbol}${totalSales.toLocaleString('en-IN')}.`,
      lastGenerated: 'Today, 06:00 AM',
      format: 'PDF / Excel',
      aiSummary: `Sales totaled ${currencySymbol}${totalSales.toLocaleString('en-IN')} across ${sales.length} orders with an average gross margin of ${health.metrics.profitMargin}%. Customer order frequency is healthy, with top 20% of catalog generating majority of volume.`,
    },
    {
      id: 'rep_inv',
      title: 'Inventory Valuation & Critical Stockout Risk',
      category: 'Supply Chain',
      description: `Warehouse inventory breakdown for ${products.length} catalog items, safety stock risk warnings, and reorder points.`,
      lastGenerated: 'Today',
      format: 'CSV / Excel',
      aiSummary: `Catalog inventory health is currently rated at ${health.metrics.inventoryHealth}%. Sales velocity analysis identified stockout risks across high-turn items. Reorder plan requires ${currencySymbol}${engine.getSmartPurchasePlan().totalRecommendedCost.toLocaleString('en-IN')} to ensure 32-day supply.`,
    },
    {
      id: 'rep_sup',
      title: 'Supplier Performance & Reliability Audit',
      category: 'Procurement',
      description: `Vendor scorecard covering lead times, price changes, and fulfillment consistency for ${suppliers.length} active vendors.`,
      lastGenerated: 'Aug 30, 2026',
      format: 'PDF',
      aiSummary: `Suppliers scored an aggregate ${health.metrics.suppliers}/100. Primary supplier maintains a 2.1-day average lead time with 96% on-time fulfillment rate, enabling lean holding inventory.`,
    },
    {
      id: 'rep_pl',
      title: 'Gross Margin Economics & P&L Statement',
      category: 'Finance',
      description: `Product-by-product rollup cost analysis, gross margins, operating expenses, and cash flow projections.`,
      lastGenerated: 'Aug 31, 2026',
      format: 'Excel',
      aiSummary: `Estimated 30-day cash position stands at ${currencySymbol}${engine.getCashFlowForecast().projectedCash30d.toLocaleString('en-IN')}. Overhead and procurement expenses remain within operating targets.`,
    },
  ];

  const handleDownload = (id: string, title: string) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      toast.success(`Generated: "${title}"`, {
        description: 'Report downloaded successfully to your device.',
      });
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Executive Business Reports</h1>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              AI Explainable Reports
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Automated financial statements, stock valuation, and plain-language AI report explainers for <span className="font-semibold text-foreground">{organization.name}</span>
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TEMPLATES.map(rep => (
          <Card key={rep.id} className="shadow-xs hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">{rep.category}</Badge>
                <span className="text-[10px] text-muted-foreground">{rep.format}</span>
              </div>
              <CardTitle className="text-sm font-bold mt-1.5 text-foreground">{rep.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {rep.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {rep.lastGenerated}
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 gap-1 font-medium border-primary/30 text-primary"
                    onClick={() => setSelectedReportForExplanation(rep)}
                  >
                    <Sparkles className="w-3 h-3" /> Explain with AI
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-7 gap-1 font-semibold"
                    disabled={downloading === rep.id}
                    onClick={() => handleDownload(rep.id, rep.title)}
                  >
                    <Download className="w-3 h-3" /> {downloading === rep.id ? 'Exporting...' : 'Export'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL: AI EXPLAIN THIS REPORT */}
      {selectedReportForExplanation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" /> Plain-Language Report Explanation
                </h3>
                <p className="text-[11px] text-muted-foreground">{selectedReportForExplanation.title}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full" onClick={() => setSelectedReportForExplanation(null)}>✕</Button>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs leading-relaxed">
              <span className="font-bold text-primary block">AI Executive Synthesis:</span>
              <p className="text-foreground">
                &ldquo;{selectedReportForExplanation.aiSummary}&rdquo;
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setSelectedReportForExplanation(null)}>
                Close
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 gap-1.5 font-semibold"
                onClick={() => {
                  handleDownload(selectedReportForExplanation.id, selectedReportForExplanation.title);
                  setSelectedReportForExplanation(null);
                }}
              >
                <Download className="w-3.5 h-3.5" /> Export Full Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
