'use client';

import { useMemo, useState } from 'react';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { SmartListingModal } from '@/components/products/smart-listing-modal';
import type { Product } from '@/lib/types/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  SearchIcon, 
  Download, 
  Trash2, 
  Package, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  FileText, 
  Mic, 
  QrCode, 
  Table as TableIcon,
  Store
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { organization } = useOrganizationStore();
  const { getProducts, addProduct, addMultipleProducts, deleteProduct, clearShopData } = useShopDataStore();

  const [search, setSearch] = useState('');
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [smartModalOpen, setSmartModalOpen] = useState(false);

  // Manual Product Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState('0');
  const [sellingPrice, setSellingPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [reorderPoint, setReorderPoint] = useState('5');
  const [unit, setUnit] = useState('pcs');

  if (!organization) return null;

  const orgId = organization.id;
  const isCustom = organization.isCustom || orgId.startsWith('org_custom_');
  const currencySymbol = organization.currencySymbol || '₹';

  const products = getProducts(orgId, organization.businessType, isCustom).filter(
    p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleManualAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    const generatedSku = sku.trim() || `SKU-${Date.now().toString().slice(-4)}`;

    addProduct(orgId, {
      name: name.trim(),
      sku: generatedSku,
      category: category.trim() || 'General',
      unit: unit.trim() || 'pcs',
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      taxRate: organization.taxRatePercent || 18,
      stock: Number(stock) || 0,
      reorderPoint: Number(reorderPoint) || 5,
      status: 'active',
    });

    toast.success(`Product "${name}" added to catalog!`);
    setManualModalOpen(false);
    setName('');
    setSku('');
    setCategory('');
    setCostPrice('0');
    setSellingPrice('0');
    setStock('0');
  };

  const handleBatchImport = (items: Omit<Product, 'id'>[]) => {
    addMultipleProducts(orgId, items);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${organization.name.toLowerCase().replace(/\s+/g, '_')}_products.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Product catalog exported!');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Products & Inventory Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {products.length} active products in <span className="font-semibold text-foreground">{organization.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Smart Listing Studio Button */}
          <Button 
            size="sm" 
            className="gap-1.5 text-xs h-9 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 font-semibold shadow-md"
            onClick={() => setSmartModalOpen(true)}
          >
            <Zap className="w-4 h-4 text-amber-300" /> Smart List Items (Fast)
          </Button>

          {/* Manual Add Button */}
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9 font-medium" onClick={() => setManualModalOpen(true)}>
            <Plus className="w-4 h-4" /> Manual Add
          </Button>
        </div>
      </div>

      {/* Quick Automated Listing Modes Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setSmartModalOpen(true)}
          className="p-3 rounded-xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
            ⚡
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">1-Click Starter Packs</p>
            <p className="text-[10px] text-muted-foreground truncate">Stationery, Kirana, Electronics</p>
          </div>
        </button>

        <button
          onClick={() => setSmartModalOpen(true)}
          className="p-3 rounded-xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
            📄
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">AI Bill & Invoice OCR</p>
            <p className="text-[10px] text-muted-foreground truncate">Auto-extract from photo / PDF</p>
          </div>
        </button>

        <button
          onClick={() => setSmartModalOpen(true)}
          className="p-3 rounded-xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
            🎙️
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">Voice & Natural Prompt</p>
            <p className="text-[10px] text-muted-foreground truncate">Speak or type items & prices</p>
          </div>
        </button>

        <button
          onClick={() => setSmartModalOpen(true)}
          className="p-3 rounded-xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
            📋
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">Excel Copy-Paste Grid</p>
            <p className="text-[10px] text-muted-foreground truncate">Paste rows directly (Ctrl+V)</p>
          </div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search products or SKU..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 h-8 text-xs" 
          />
        </div>
        {products.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export Catalog
            </Button>
          </div>
        )}
      </div>

      {/* Product Catalog Table */}
      <Card>
        <CardContent className="p-0">
          {products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Product Name</TableHead>
                  <TableHead className="text-xs">SKU</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs text-right">Cost Price</TableHead>
                  <TableHead className="text-xs text-right">Selling Price</TableHead>
                  <TableHead className="text-xs text-right">In Stock</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id} className="hover:bg-accent/50 text-xs">
                    <TableCell className="font-semibold text-foreground">
                      {product.name}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{product.sku}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{product.category}</Badge></TableCell>
                    <TableCell className="text-right text-muted-foreground">{currencySymbol}{product.costPrice.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right font-bold text-foreground">{currencySymbol}{product.sellingPrice.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={product.stock <= product.reorderPoint ? 'text-destructive font-bold' : ''}>
                        {product.stock} {product.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock <= product.reorderPoint ? 'destructive' : 'outline'} className="text-[9px]">
                        {product.stock <= product.reorderPoint ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          deleteProduct(orgId, product.id);
                          toast.success(`Removed ${product.name}`);
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
            <div className="p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">Your Product Catalog is Empty</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Skip manual typing! Use 1-Click Starter Packs, upload a supplier invoice, paste from Excel, or speak a voice note to list items in seconds.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <Button size="sm" className="text-xs h-9 gap-1.5 font-semibold shadow-md" onClick={() => setSmartModalOpen(true)}>
                  <Zap className="w-4 h-4 text-amber-300" /> Open Smart Listing Studio
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-9" onClick={() => setManualModalOpen(true)}>
                  + Manual Add Single Item
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMART LISTING STUDIO MODAL */}
      <SmartListingModal
        open={smartModalOpen}
        onClose={() => setSmartModalOpen(false)}
        currencySymbol={currencySymbol}
        taxRatePercent={organization.taxRatePercent || 18}
        onImportItems={handleBatchImport}
      />

      {/* MANUAL ADD SINGLE PRODUCT MODAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Add Single Product
              </h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setManualModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleManualAddProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Product Name *</Label>
                <Input
                  placeholder="e.g. A4 Spiral Notebook 200 Pages"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Category</Label>
                  <Input
                    placeholder="e.g. Stationery"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">SKU Code</Label>
                  <Input
                    placeholder="Auto-generated if blank"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="text-xs h-8 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Cost Price ({currencySymbol})</Label>
                  <Input
                    type="number"
                    value={costPrice}
                    onChange={e => setCostPrice(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Selling Price ({currencySymbol}) *</Label>
                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(e.target.value)}
                    className="text-xs h-8 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Stock</Label>
                  <Input
                    type="number"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Reorder Alert</Label>
                  <Input
                    type="number"
                    value={reorderPoint}
                    onChange={e => setReorderPoint(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Unit</Label>
                  <Input
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => setManualModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs h-8 gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
