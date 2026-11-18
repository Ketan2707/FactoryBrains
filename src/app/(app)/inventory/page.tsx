'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { AIBusinessEngine } from '@/lib/services/ai-business-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  SearchIcon, 
  Download, 
  AlertTriangle, 
  Package, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ShoppingCart,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const RISK_COLORS: Record<string, string> = {
  optimal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

export default function InventoryPage() {
  const router = useRouter();
  const { organization } = useOrganizationStore();
  const { getProducts, getSales, getPurchases, getCustomers, getSuppliers, getExpenses } = useShopDataStore();
  const [search, setSearch] = useState('');

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

  const predictiveInventory = useMemo(() => {
    return engine.getPredictiveInventory().filter(
      item => item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [engine, search]);

  const totalValue = predictiveInventory.reduce((sum, i) => sum + (i.currentStock * i.costPrice), 0);
  const criticalStockCount = predictiveInventory.filter(i => i.risk === 'critical' || i.risk === 'high').length;
  const totalItems = predictiveInventory.length;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(predictiveInventory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${organization.name.toLowerCase().replace(/\s+/g, '_')}_predictive_inventory.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Predictive inventory report exported!');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Predictive Stock & Inventory Intelligence</h1>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Demand Forecast
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Stockout prediction, sales velocity, and automated reorder buffers for <span className="font-semibold text-foreground">{organization.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {predictiveInventory.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export Report
            </Button>
          )}
          <Button size="sm" className="gap-1.5 text-xs h-8 font-semibold shadow-xs" onClick={() => router.push('/products')}>
            <Plus className="w-4 h-4" /> Add Products
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Valuation (Cost Basis)</p>
            <p className="text-xl font-bold">{currencySymbol}{totalValue.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Active Catalog SKUs</p>
            <p className="text-xl font-bold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card className={`shadow-xs ${criticalStockCount > 0 ? 'border-destructive/30 bg-destructive/5' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground mb-1">Stockout Alerts (7 Days)</p>
              {criticalStockCount > 0 && <AlertTriangle className="w-4 h-4 text-destructive" />}
            </div>
            <p className={`text-xl font-bold ${criticalStockCount > 0 ? 'text-destructive' : ''}`}>{criticalStockCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search products or SKU..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 h-8 text-xs" 
          />
        </div>
      </div>

      {/* Predictive Inventory Table */}
      <Card className="shadow-xs">
        <CardContent className="p-0">
          {predictiveInventory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Product Name</TableHead>
                  <TableHead className="text-xs text-right">In Stock</TableHead>
                  <TableHead className="text-xs text-right">Sales Velocity</TableHead>
                  <TableHead className="text-xs text-right">Est. Days Remaining</TableHead>
                  <TableHead className="text-xs">Predicted Stockout</TableHead>
                  <TableHead className="text-xs text-right">Demand Trend</TableHead>
                  <TableHead className="text-xs text-right">Recommended PO</TableHead>
                  <TableHead className="text-xs">Risk Status</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictiveInventory.map(item => (
                  <TableRow key={item.id} className="hover:bg-accent/50 text-xs">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{item.sku} • {item.category}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      <span className={item.currentStock <= 0 ? 'text-destructive' : ''}>
                        {item.currentStock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-medium">
                      {item.dailyVelocity.toFixed(1)} / day
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      <span className={item.daysRemaining <= 5 ? 'text-destructive' : item.daysRemaining <= 12 ? 'text-amber-600' : 'text-foreground'}>
                        {item.daysRemaining <= 0 ? '0 days' : `${item.daysRemaining} days`}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px]">
                      {item.predictedStockoutDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-emerald-600 font-semibold text-[11px]">
                        ↑ {item.demandTrendPercent}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {item.recommendedReorderQty} {item.unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] capitalize ${RISK_COLORS[item.risk] || ''}`}>
                        {item.risk}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] text-primary hover:bg-primary/10 gap-1"
                        onClick={() => router.push('/purchases')}
                        title="Create Purchase Order"
                      >
                        PO <ArrowRight className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-10 text-center space-y-3">
              <Package className="w-10 h-10 mx-auto opacity-30 text-primary" />
              <h3 className="font-semibold text-sm">No inventory recorded yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Add products to your catalog to activate predictive sales velocity and stockout predictions.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button size="sm" className="text-xs h-8 gap-1.5" onClick={() => router.push('/products')}>
                  <Plus className="w-3.5 h-3.5" /> Add Products
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
