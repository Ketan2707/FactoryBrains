'use client';

import { useMemo, useState } from 'react';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { AIBusinessEngine, type SupplierIntelligenceScorecard } from '@/lib/services/ai-business-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  SearchIcon, 
  Truck, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  TrendingUp, 
  TrendingDown,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuppliersPage() {
  const { organization } = useOrganizationStore();
  const { 
    getSuppliers, 
    getProducts, 
    getSales, 
    getPurchases, 
    getCustomers, 
    getExpenses, 
    addSupplier, 
    deleteSupplier 
  } = useShopDataStore();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // New Supplier Form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

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

  const intelligentSuppliers = useMemo(() => {
    return engine.getSupplierIntelligence().filter(
      s => s.name.toLowerCase().includes(search.toLowerCase()) || s.company.toLowerCase().includes(search.toLowerCase())
    );
  }, [engine, search]);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter supplier contact name');
      return;
    }

    addSupplier(orgId, {
      name: name.trim(),
      company: company.trim() || name.trim(),
      email: email.trim() || 'supplier@vendor.com',
      phone: phone.trim() || '—',
      city: city.trim() || 'Local Market',
      status: 'active',
    });

    toast.success(`Supplier "${name}" added!`);
    setModalOpen(false);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Supplier Intelligence & Performance</h1>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Procurement Analytics
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Reliability scoring, price trends, and vendor benchmarks for <span className="font-semibold text-foreground">{organization.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {intelligentSuppliers.length >= 2 && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => setComparisonModalOpen(true)}>
              <Scale className="w-3.5 h-3.5 text-primary" /> Compare Vendors
            </Button>
          )}
          <Button size="sm" className="gap-1.5 text-xs h-8 font-semibold shadow-xs" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Supplier
          </Button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search suppliers or vendors..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-9 h-8 text-xs" 
        />
      </div>

      {/* Intelligent Supplier Table */}
      <Card className="shadow-xs">
        <CardContent className="p-0">
          {intelligentSuppliers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Supplier / Vendor</TableHead>
                  <TableHead className="text-xs text-right">Supplier Score</TableHead>
                  <TableHead className="text-xs text-right">Price Trend</TableHead>
                  <TableHead className="text-xs text-right">Delivery Lead Time</TableHead>
                  <TableHead className="text-xs">Reliability</TableHead>
                  <TableHead className="text-xs">AI Recommendation</TableHead>
                  <TableHead className="text-xs w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intelligentSuppliers.map(s => (
                  <TableRow key={s.id} className="hover:bg-accent/50 text-xs">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                          <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">{s.company} • {s.city}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-baseline gap-1">
                        <span className="font-bold text-sm text-foreground">{s.score}</span>
                        <span className="text-[10px] text-muted-foreground">/100</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={`text-[11px] font-semibold ${s.priceTrendPercent <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {s.priceTrendPercent <= 0 ? `↓ ${Math.abs(s.priceTrendPercent)}%` : `↑ ${s.priceTrendPercent}%`}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-medium">
                      {s.avgLeadTimeDays} days
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={s.reliabilityScore} className="h-1.5 w-16" />
                        <span className="text-xs font-semibold">{s.reliabilityScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="text-[11px] text-muted-foreground leading-tight">{s.aiRecommendation}</p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          deleteSupplier(orgId, s.id);
                          toast.success(`Removed ${s.name}`);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-10 text-center space-y-3">
              <Truck className="w-10 h-10 mx-auto opacity-30 text-primary" />
              <h3 className="font-semibold text-sm">No suppliers registered yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Keep track of vendors, delivery lead times, and reliability scoring.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button size="sm" className="text-xs h-8 gap-1.5" onClick={() => setModalOpen(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Supplier
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: HEAD-TO-HEAD SUPPLIER COMPARISON */}
      {comparisonModalOpen && intelligentSuppliers.length >= 2 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                  <Scale className="w-4 h-4 text-primary" /> Head-to-Head Supplier Intelligence
                </h3>
                <p className="text-[11px] text-muted-foreground">Comparative performance, lead times, and AI recommendation</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full" onClick={() => setComparisonModalOpen(false)}>✕</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {intelligentSuppliers.slice(0, 2).map((sup, idx) => (
                <div key={sup.id} className="p-4 rounded-xl border bg-muted/20 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Supplier {idx === 0 ? 'A' : 'B'}</span>
                      <h4 className="font-bold text-sm text-foreground">{sup.name}</h4>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">
                      Score: {sup.score}/100
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price Competitiveness:</span>
                      <span className="font-semibold text-foreground">{sup.priceCompetitiveness}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Delivery Lead Time:</span>
                      <span className="font-semibold text-foreground">{sup.avgLeadTimeDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">On-Time Fulfillment Rate:</span>
                      <span className="font-semibold text-emerald-600">{sup.reliabilityScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs space-y-1">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Recommendation Verdict:
              </span>
              <p className="text-foreground leading-relaxed">
                &ldquo;{intelligentSuppliers[0]?.name} is recommended as your primary procurement partner due to higher reliability ({intelligentSuppliers[0]?.reliabilityScore}%) and faster delivery cycle ({intelligentSuppliers[0]?.avgLeadTimeDays} days), minimizing safety stock holding costs.&rdquo;
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setComparisonModalOpen(false)}>
                Close Comparison
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUPPLIER */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Add New Supplier / Vendor
              </h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Contact Person Name *</Label>
                <Input
                  placeholder="e.g. Anil Packaging Solutions"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Company Name</Label>
                <Input
                  placeholder="e.g. Anil Enterprises Pvt Ltd"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Phone Number</Label>
                  <Input
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">City</Label>
                  <Input
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Email Address</Label>
                <Input
                  type="email"
                  placeholder="orders@vendor.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs h-8 gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save Supplier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
