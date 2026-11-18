'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import type { SalesOrder, SalesOrderItem } from '@/lib/types/entities';
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
  ShoppingCart, 
  CheckCircle2, 
  Receipt, 
  AlertTriangle, 
  Package, 
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  Share2,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-amber-50 text-amber-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  partial: 'bg-amber-50 text-amber-700',
  unpaid: 'bg-red-50 text-red-700',
};

export default function SalesPage() {
  const router = useRouter();
  const { organization } = useOrganizationStore();
  const { getSales, getProducts, addSale, deleteSale, updateSaleStatus } = useShopDataStore();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Sale Form State
  const [customerName, setCustomerName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('0');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');

  if (!organization) return null;

  const orgId = organization.id;
  const isCustom = organization.isCustom || orgId.startsWith('org_custom_');
  const currencySymbol = organization.currencySymbol || '₹';

  const products = getProducts(orgId, organization.businessType, isCustom);
  const sales = getSales(orgId, organization.businessType, isCustom).filter(
    s => s.customerName.toLowerCase().includes(search.toLowerCase()) || s.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = sales.length;
  const paidOrders = sales.filter(s => s.paymentStatus === 'paid').length;

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);
  const parsedPrice = Number(unitPrice) || (selectedProduct ? selectedProduct.sellingPrice : 0);

  // Live Inventory Stock Matching & Validation
  const hasSelectedProduct = Boolean(selectedProduct);
  const currentAvailableStock = selectedProduct ? selectedProduct.stock : 999;
  const isOutOfStock = hasSelectedProduct && currentAvailableStock <= 0;
  const isInsufficientStock = hasSelectedProduct && parsedQty > currentAvailableStock;
  const remainingStockAfterSale = hasSelectedProduct ? currentAvailableStock - parsedQty : null;

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setUnitPrice(String(prod.sellingPrice));
      if (prod.stock > 0 && parsedQty > prod.stock) {
        setQuantity(String(prod.stock));
      }
    }
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Please enter a customer or walk-in client name');
      return;
    }

    if (!selectedProduct && products.length > 0) {
      toast.error('Please choose a product from your catalog');
      return;
    }

    // STRICT INVENTORY CHECK
    if (selectedProduct) {
      if (selectedProduct.stock <= 0) {
        toast.error(`"${selectedProduct.name}" is OUT OF STOCK!`, {
          description: 'Cannot sell an item with 0 available stock. Please restock in Products.',
        });
        return;
      }

      if (parsedQty > selectedProduct.stock) {
        toast.error(`Cannot sell ${parsedQty} units of "${selectedProduct.name}"!`, {
          description: `Only ${selectedProduct.stock} ${selectedProduct.unit} available in inventory.`,
        });
        return;
      }
    }

    const itemPrice = parsedPrice > 0 ? parsedPrice : (selectedProduct ? selectedProduct.sellingPrice : 100);
    const itemTotal = parsedQty * itemPrice;
    const taxAmount = Math.round(itemTotal * (organization.taxRatePercent || 18) / 100);
    const grandTotal = itemTotal + taxAmount;

    const items: SalesOrderItem[] = [
      {
        id: `item_${Date.now()}`,
        productId: selectedProduct ? selectedProduct.id : 'custom_item',
        productName: selectedProduct ? selectedProduct.name : 'General Goods / Services',
        quantity: parsedQty,
        unitPrice: itemPrice,
        discount: 0,
        tax: taxAmount,
        total: itemTotal,
      },
    ];

    addSale(orgId, {
      orderNumber: `SO-${new Date().getFullYear()}-${(sales.length + 1).toString().padStart(4, '0')}`,
      customerId: `cust_${Date.now()}`,
      customerName: customerName.trim(),
      orderDate: new Date().toISOString().split('T')[0],
      status: 'delivered',
      items,
      subtotal: itemTotal,
      tax: taxAmount,
      discount: 0,
      total: grandTotal,
      paymentStatus,
      amountPaid: paymentStatus === 'paid' ? grandTotal : 0,
    });

    toast.success(`Bill created for ${customerName}!`, {
      description: `Deducted ${parsedQty} units. ${selectedProduct ? `Remaining stock: ${selectedProduct.stock - parsedQty}` : ''}`,
    });

    setModalOpen(false);
    setCustomerName('');
    setSelectedProductId('');
    setQuantity('1');
    setUnitPrice('0');
  };

  const handleDeleteOrder = (order: SalesOrder) => {
    deleteSale(orgId, order.id);
    const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
    toast.success(`Deleted order ${order.orderNumber}`, {
      description: `${itemsCount} item(s) restored back into inventory stock.`,
    });
  };

  const handleShareBill = (order: SalesOrder) => {
    const itemsText = order.items.map(i => `• ${i.quantity}x ${i.productName} = ${currencySymbol}${i.total}`).join('\n');
    const msg = `🧾 *INVOICE: ${order.orderNumber}*\n*Store:* ${organization.name}\n*Customer:* ${order.customerName}\n*Date:* ${order.orderDate}\n\n*Items:*\n${itemsText}\n\n*Total Amount:* ${currencySymbol}${order.total.toLocaleString('en-IN')}\n*Payment Status:* ${order.paymentStatus.toUpperCase()}\n\nThank you for shopping with ${organization.name}!`;
    navigator.clipboard.writeText(msg);
    toast.success('Invoice copied for WhatsApp / SMS sharing!', {
      description: `Ready to paste to ${order.customerName}`,
    });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sales, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${organization.name.toLowerCase().replace(/\s+/g, '_')}_sales_orders.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Sales ledger exported!');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" /> Sales Orders & Invoicing
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Live stock-synchronized billing and invoices for <span className="font-semibold text-foreground">{organization.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sales.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export Sales Ledger
            </Button>
          )}
          <Button size="sm" className="gap-1.5 text-xs h-9 font-semibold shadow-md" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Create New Bill / Sale
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Sales Revenue</p>
            <p className="text-xl font-bold text-foreground">{currencySymbol}{totalRevenue.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Bills / Orders</p>
            <p className="text-xl font-bold text-foreground">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Fully Paid Invoices</p>
            <p className="text-xl font-bold text-emerald-600">{paidOrders} <span className="text-xs text-muted-foreground">of {totalOrders}</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders or customer..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 h-8 text-xs" 
          />
        </div>
      </div>

      {/* Sales Orders Table */}
      <Card>
        <CardContent className="p-0">
          {sales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Order ID</TableHead>
                  <TableHead className="text-xs">Customer Name</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Items Sold</TableHead>
                  <TableHead className="text-xs text-right">Total Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Payment</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map(order => (
                  <TableRow key={order.id} className="hover:bg-accent/50 text-xs">
                    <TableCell className="font-mono text-xs font-semibold">{order.orderNumber}</TableCell>
                    <TableCell className="font-medium text-foreground">{order.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">{order.orderDate}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {order.items.map((i, idx) => (
                          <p key={idx} className="text-xs font-medium text-foreground">
                            {i.quantity}x {i.productName}
                          </p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {currencySymbol}{order.total.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] uppercase ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-[9px] uppercase font-semibold ${PAYMENT_COLORS[order.paymentStatus] || ''}`}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-emerald-600 hover:bg-emerald-50"
                          title="Copy WhatsApp Invoice receipt"
                          onClick={() => handleShareBill(order)}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete bill and restore stock"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-10 text-center space-y-3">
              <Receipt className="w-10 h-10 mx-auto opacity-30 text-primary" />
              <h3 className="font-semibold text-sm">No sales records yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create customer invoices, track paid vs pending amounts, and manage stock deductions for {organization.name}.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button size="sm" className="text-xs h-8 gap-1.5 font-semibold" onClick={() => setModalOpen(true)}>
                  <Plus className="w-3.5 h-3.5" /> Record First Sale
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: CREATE SALE WITH REAL-TIME INVENTORY CHECK */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                  <Receipt className="w-4 h-4 text-primary" /> Create Customer Invoice / Bill
                </h3>
                <p className="text-[11px] text-muted-foreground">Automatically validates & deducts inventory stock</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full" onClick={() => setModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Customer / Client Name *</Label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCustomerName('Walk-in Customer')}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors border"
                    >
                      + Walk-in
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerName('Cash Counter')}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors border"
                    >
                      + Cash
                    </button>
                  </div>
                </div>
                <Input
                  placeholder="e.g. Walk-in Client or Rahul Sharma"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="text-xs h-8.5"
                  required
                />
              </div>

              {/* Product Selection with Live Stock Indicators */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Select Product from Catalog *</Label>
                  <button 
                    type="button" 
                    onClick={() => router.push('/products')}
                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                  >
                    Catalog ({products.length}) →
                  </button>
                </div>

                {products.length > 0 ? (
                  <select
                    value={selectedProductId}
                    onChange={e => handleProductSelect(e.target.value)}
                    className="w-full h-9 px-2 text-xs rounded-lg border bg-background font-medium focus:ring-1 focus:ring-primary"
                    required
                  >
                    <option value="">-- Choose Product to Sell --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                        {p.stock <= 0 ? '❌ [OUT OF STOCK] ' : '🟢 '}
                        {p.name} — {currencySymbol}{p.sellingPrice} ({p.stock} {p.unit} in stock)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 border border-dashed rounded-lg bg-muted/40 text-center space-y-1.5">
                    <p className="text-[11px] text-muted-foreground">No products in your catalog yet!</p>
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setModalOpen(false); router.push('/products'); }}>
                      ⚡ Add Products First
                    </Button>
                  </div>
                )}

                {/* Stock Status Badge & Validation Alerts */}
                {selectedProduct && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30">
                      <div>
                        <span className="text-muted-foreground text-[11px]">Available Stock: </span>
                        <span className={`font-bold ${selectedProduct.stock <= 0 ? 'text-destructive' : selectedProduct.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {selectedProduct.stock} {selectedProduct.unit}
                        </span>
                      </div>
                      <Badge variant={selectedProduct.stock <= 0 ? 'destructive' : selectedProduct.stock <= 5 ? 'secondary' : 'outline'} className="text-[10px]">
                        {selectedProduct.stock <= 0 ? 'Out of Stock' : selectedProduct.stock <= 5 ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </div>

                    {/* Warning if Out of Stock */}
                    {isOutOfStock && (
                      <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-[11px] flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Cannot Sell: Product is Out of Stock!</p>
                          <p className="text-[10px] opacity-90">Please add stock in Products or Purchases before creating this sale.</p>
                        </div>
                      </div>
                    )}

                    {/* Warning if trying to sell more than available */}
                    {!isOutOfStock && isInsufficientStock && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Insufficient Stock!</p>
                          <p className="text-[10px]">
                            You entered <strong>{parsedQty}</strong>, but only <strong>{currentAvailableStock}</strong> units are available. Maximum allowed is {currentAvailableStock}.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stock after sale calculator */}
                    {!isOutOfStock && !isInsufficientStock && (
                      <div className="text-[10px] text-muted-foreground flex justify-between px-1">
                        <span>Stock remaining after this sale:</span>
                        <span className="font-semibold text-foreground">{remainingStockAfterSale} {selectedProduct.unit}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity & Unit Price */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Quantity to Sell *</Label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct ? selectedProduct.stock : undefined}
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className={`text-xs h-8.5 font-bold ${isInsufficientStock ? 'border-destructive ring-1 ring-destructive' : ''}`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Unit Price ({currencySymbol}) *</Label>
                  <Input
                    type="number"
                    value={unitPrice}
                    onChange={e => setUnitPrice(e.target.value)}
                    className="text-xs h-8.5 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Payment Status */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Payment Received</Label>
                <select
                  value={paymentStatus}
                  onChange={e => setPaymentStatus(e.target.value as 'paid' | 'partial' | 'unpaid')}
                  className="w-full h-8.5 px-2 text-xs rounded-md border bg-background"
                >
                  <option value="paid">✅ Fully Paid (Cash / UPI / Online)</option>
                  <option value="partial">⏳ Partial Payment (Partially Paid)</option>
                  <option value="unpaid">❌ Unpaid / Credit Account</option>
                </select>
              </div>

              {/* Invoice Summary Card */}
              <div className="p-3 rounded-xl bg-muted/40 border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({parsedQty} units):</span>
                  <span className="font-semibold">{currencySymbol}{(parsedQty * parsedPrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>GST / Tax ({organization.taxRatePercent || 18}%):</span>
                  <span>{currencySymbol}{Math.round((parsedQty * parsedPrice) * (organization.taxRatePercent || 18) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground border-t pt-1.5 mt-1 text-xs">
                  <span>Grand Total:</span>
                  <span className="text-primary text-sm">{currencySymbol}{(parsedQty * parsedPrice + Math.round((parsedQty * parsedPrice) * (organization.taxRatePercent || 18) / 100)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" size="sm" className="text-xs h-8.5" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isOutOfStock || isInsufficientStock}
                  className="text-xs h-8.5 gap-1.5 font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 
                  {isOutOfStock ? 'Cannot Sell (Out of Stock)' : isInsufficientStock ? 'Cannot Sell (Insufficient Stock)' : 'Confirm & Save Bill'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
