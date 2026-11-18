'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { AIBusinessEngine } from '@/lib/services/ai-business-engine';
import type { PurchaseOrderItem } from '@/lib/types/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  SearchIcon, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  Trash2, 
  Package, 
  DollarSign, 
  X,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = { 
  draft: 'bg-gray-100 text-gray-700 border-gray-200', 
  sent: 'bg-blue-50 text-blue-700 border-blue-200', 
  confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
  received: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
  partial: 'bg-amber-50 text-amber-700 border-amber-200', 
  cancelled: 'bg-red-50 text-red-700 border-red-200' 
};

export default function PurchasesPage() {
  const router = useRouter();
  const { organization } = useOrganizationStore();
  const { 
    getPurchases, 
    getProducts, 
    getSales, 
    getCustomers, 
    getSuppliers, 
    getExpenses, 
    addPurchase 
  } = useShopDataStore();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New PO Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [customSupplierName, setCustomSupplierName] = useState('');
  const [expectedDays, setExpectedDays] = useState('3');
  const [items, setItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>>([
    { productId: '', productName: '', quantity: 10, unitPrice: 100 }
  ]);

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

  const purchasePlan = useMemo(() => engine.getSmartPurchasePlan(), [engine]);

  const filteredPurchases = purchases.filter(
    p => p.supplierName.toLowerCase().includes(search.toLowerCase()) || p.poNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0);
  const pendingOrders = purchases.filter(p => p.status !== 'received' && p.status !== 'cancelled').length;

  const handleAddItemRow = () => {
    const defaultProduct = products[0];
    setItems(prev => [
      ...prev,
      {
        productId: defaultProduct?.id || '',
        productName: defaultProduct?.name || '',
        quantity: 10,
        unitPrice: defaultProduct?.costPrice || 100,
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          productId: prod.id,
          productName: prod.name,
          unitPrice: prod.costPrice,
        };
      }
      return item;
    }));
  };

  const handleItemFieldChange = (index: number, field: 'quantity' | 'unitPrice' | 'productName', value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Subtotal calculations
  const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice)), 0);
  const tax = Math.round(subtotal * ((organization.taxRatePercent || 18) / 100));
  const grandTotal = subtotal + tax;

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || subtotal <= 0) {
      toast.error('Please add at least one valid item to the purchase order');
      return;
    }

    const supplierObj = suppliers.find(s => s.id === selectedSupplierId);
    const supplierName = supplierObj?.name || customSupplierName || 'Wholesale Supplier';

    const poItems: PurchaseOrderItem[] = items.map(item => ({
      id: `poi_${Date.now()}_${Math.random()}`,
      productId: item.productId || `prod_${Date.now()}`,
      productName: item.productName || 'Catalog Product',
      quantity: Number(item.quantity) || 1,
      receivedQuantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    }));

    const poNumber = `PO-${new Date().getFullYear()}-${(purchases.length + 1).toString().padStart(4, '0')}`;
    const orderDate = new Date().toISOString().split('T')[0];
    const expDate = new Date(Date.now() + 86400000 * (Number(expectedDays) || 3)).toISOString().split('T')[0];

    addPurchase(orgId, {
      poNumber,
      supplierId: selectedSupplierId || 'sup_custom',
      supplierName,
      orderDate,
      expectedDate: expDate,
      status: 'received',
      items: poItems,
      subtotal,
      tax,
      total: grandTotal,
      paymentStatus: 'unpaid',
    });

    toast.success(`Created Purchase Order #${poNumber}!`, {
      description: `Stock automatically updated for ${poItems.length} items.`,
    });

    setModalOpen(false);
    setItems([{ productId: '', productName: '', quantity: 10, unitPrice: 100 }]);
  };

  const handleAutoFillSmartPO = () => {
    if (purchasePlan.recommendations.length === 0) {
      toast.info('No urgent restocks needed at this time.');
      return;
    }

    const smartItems = purchasePlan.recommendations.map(r => ({
      id: `poi_${Date.now()}_${r.productId}`,
      productId: r.productId,
      productName: r.productName,
      quantity: r.recommendedOrderQty,
      receivedQuantity: r.recommendedOrderQty,
      unitPrice: Math.round(r.estimatedCost / r.recommendedOrderQty),
      total: r.estimatedCost,
    }));

    const poNumber = `PO-${new Date().getFullYear()}-${(purchases.length + 1).toString().padStart(4, '0')}`;
    const supplier = suppliers[0]?.name || 'Primary Wholesale Distributor';

    addPurchase(orgId, {
      poNumber,
      supplierId: suppliers[0]?.id || 'sup_default',
      supplierName: supplier,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'received',
      items: smartItems,
      subtotal: purchasePlan.totalRecommendedCost,
      tax: Math.round(purchasePlan.totalRecommendedCost * 0.18),
      total: Math.round(purchasePlan.totalRecommendedCost * 1.18),
      paymentStatus: 'unpaid',
    });

    toast.success(`Generated Smart PO #${poNumber}!`, {
      description: `Restocked ${purchasePlan.totalItemsCount} low-stock items into inventory.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Purchase Orders & Inward Stock</h1>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Procurement Ledger
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage vendor purchases, supplier orders, and inward inventory for <span className="font-semibold text-foreground">{organization.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {purchasePlan.recommendations.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8.5 gap-1.5 border-primary/30 text-primary font-semibold"
              onClick={handleAutoFillSmartPO}
            >
              <Sparkles className="w-3.5 h-3.5" /> 1-Click AI Smart Restock ({purchasePlan.totalItemsCount})
            </Button>
          )}

          <Button
            size="sm"
            className="text-xs h-8.5 gap-1.5 font-semibold bg-gradient-to-r from-primary to-indigo-600 shadow-xs"
            onClick={() => {
              if (products.length > 0) {
                setItems([{
                  productId: products[0].id,
                  productName: products[0].name,
                  quantity: 10,
                  unitPrice: products[0].costPrice,
                }]);
              }
              if (suppliers.length > 0) {
                setSelectedSupplierId(suppliers[0].id);
              }
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Create Purchase Order
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Procurement Spend</p>
            <p className="text-xl font-bold text-foreground">{currencySymbol}{totalSpent.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Orders Issued</p>
            <p className="text-xl font-bold text-foreground">{purchases.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground mb-1">AI Recommended Restocks</p>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-xl font-bold text-primary">{purchasePlan.totalItemsCount} items</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search purchases or PO#..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 h-8 text-xs" 
          />
        </div>
      </div>

      {/* Purchases Table */}
      <Card className="shadow-xs">
        <CardContent className="p-0">
          {filteredPurchases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">PO #</TableHead>
                  <TableHead className="text-xs">Supplier / Vendor</TableHead>
                  <TableHead className="text-xs">Order Date</TableHead>
                  <TableHead className="text-xs">Expected Inward</TableHead>
                  <TableHead className="text-xs">Items Count</TableHead>
                  <TableHead className="text-xs">Delivery Status</TableHead>
                  <TableHead className="text-xs text-right">Total Amount</TableHead>
                  <TableHead className="text-xs">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map(po => (
                  <TableRow key={po.id} className="hover:bg-accent/50 text-xs">
                    <TableCell className="font-mono font-bold text-foreground">{po.poNumber}</TableCell>
                    <TableCell className="font-semibold text-foreground">{po.supplierName}</TableCell>
                    <TableCell className="text-muted-foreground">{po.orderDate}</TableCell>
                    <TableCell className="text-muted-foreground">{po.expectedDate || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{po.items?.length || 1} items</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] uppercase font-semibold ${STATUS_COLORS[po.status] || ''}`}>
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {currencySymbol}{po.total.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[9px] uppercase font-semibold">
                        {po.paymentStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-10 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto opacity-30 text-primary" />
              <h3 className="font-semibold text-sm">No purchase orders created yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create purchase orders for your wholesale suppliers or let AI automatically generate a restock plan.
              </p>
              <div className="flex justify-center gap-2 pt-2 flex-wrap">
                <Button 
                  size="sm" 
                  className="text-xs h-8 gap-1.5 font-semibold shadow-xs" 
                  onClick={() => {
                    if (products.length > 0) {
                      setItems([{
                        productId: products[0].id,
                        productName: products[0].name,
                        quantity: 10,
                        unitPrice: products[0].costPrice,
                      }]);
                    }
                    setModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> + Create Purchase Order
                </Button>
                {purchasePlan.recommendations.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 gap-1.5 border-primary/30 text-primary font-semibold"
                    onClick={handleAutoFillSmartPO}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 1-Click AI Restock
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: CREATE PURCHASE ORDER */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                  <ShoppingBag className="w-4 h-4 text-primary" /> Create Purchase Order
                </h3>
                <p className="text-[11px] text-muted-foreground">Order goods from suppliers & update inventory automatically upon receipt</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full" onClick={() => setModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
              {/* Supplier & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Select Supplier / Vendor *</Label>
                  {suppliers.length > 0 ? (
                    <select
                      value={selectedSupplierId}
                      onChange={e => setSelectedSupplierId(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-md border bg-background text-xs"
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.company || 'Vendor'})</option>
                      ))}
                      <option value="custom">+ Other / New Supplier</option>
                    </select>
                  ) : (
                    <Input
                      placeholder="e.g. Balaji Wholesale Traders"
                      value={customSupplierName}
                      onChange={e => setCustomSupplierName(e.target.value)}
                      className="text-xs h-8"
                      required
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Expected Delivery (Days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={expectedDays}
                    onChange={e => setExpectedDays(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Items</Label>
                  <Button type="button" variant="outline" size="sm" className="text-[11px] h-6 px-2 gap-1" onClick={handleAddItemRow}>
                    <Plus className="w-3 h-3" /> Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border bg-muted/20 grid grid-cols-12 gap-2 items-center text-xs">
                      {/* Product Selector */}
                      <div className="col-span-12 sm:col-span-5 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground">Item {idx + 1}</span>
                        {products.length > 0 ? (
                          <select
                            value={item.productId}
                            onChange={e => handleProductSelect(idx, e.target.value)}
                            className="w-full h-8 px-2 rounded-md border bg-background text-xs truncate"
                          >
                            <option value="">Select product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({currencySymbol}{p.costPrice})</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            placeholder="Product name"
                            value={item.productName}
                            onChange={e => handleItemFieldChange(idx, 'productName', e.target.value)}
                            className="text-xs h-8"
                          />
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-5 sm:col-span-3 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground">Quantity</span>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemFieldChange(idx, 'quantity', Number(e.target.value))}
                          className="text-xs h-8"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-5 sm:col-span-3 space-y-0.5">
                        <span className="text-[10px] text-muted-foreground">Unit Cost ({currencySymbol})</span>
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={e => handleItemFieldChange(idx, 'unitPrice', Number(e.target.value))}
                          className="text-xs h-8"
                        />
                      </div>

                      {/* Delete */}
                      <div className="col-span-2 sm:col-span-1 flex justify-end pt-3">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => handleRemoveItemRow(idx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals Summary */}
              <div className="p-3 rounded-xl bg-muted/40 border space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax ({organization.taxRatePercent || 18}%):</span>
                  <span>{currencySymbol}{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t">
                  <span>Total Order Amount:</span>
                  <span className="text-primary">{currencySymbol}{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 border-t pt-3 shrink-0">
                <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs h-8 gap-1.5 font-semibold bg-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Issue & Receive PO
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
