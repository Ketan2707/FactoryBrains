'use client';

import { useMemo, useState } from 'react';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { AIBusinessEngine } from '@/lib/services/ai-business-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  SearchIcon, 
  Users, 
  Trash2, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Sparkles, 
  Send, 
  Copy, 
  AlertTriangle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const SEGMENT_COLORS: Record<string, string> = {
  VIP: 'bg-purple-50 text-purple-700 border-purple-200',
  Growing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Regular: 'bg-blue-50 text-blue-700 border-blue-200',
  'At Risk': 'bg-amber-50 text-amber-700 border-amber-200',
  Overdue: 'bg-red-50 text-red-700 border-red-200',
  Inactive: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function CustomersPage() {
  const { organization } = useOrganizationStore();
  const { 
    getCustomers, 
    getProducts, 
    getSales, 
    getPurchases, 
    getSuppliers, 
    getExpenses, 
    addCustomer, 
    deleteCustomer 
  } = useShopDataStore();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reminderModalCustomer, setReminderModalCustomer] = useState<any | null>(null);

  // New Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
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

  const intelligentCustomers = useMemo(() => {
    return engine.getCustomerIntelligence().filter(
      c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.company || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [engine, search]);

  const totalOutstanding = intelligentCustomers.reduce((sum, c) => sum + c.outstandingAmount, 0);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    addCustomer(orgId, {
      name: name.trim(),
      phone: phone.trim() || '—',
      email: email.trim() || '—',
      company: company.trim() || undefined,
      city: city.trim() || organization.city || 'Local',
      status: 'active',
      segment: 'regular',
    });

    toast.success(`Customer "${name}" added!`);
    setModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setCompany('');
  };

  const getReminderMessage = (c: any) => {
    return `Dear ${c.name},\n\nGreetings from ${organization.name}. We hope you are doing well.\n\nThis is a gentle reminder that an outstanding balance of ${currencySymbol}${c.outstandingAmount.toLocaleString('en-IN')} is currently due on your account.\n\nPlease find the payment details below:\nBank / UPI: ${organization.name} Accounts\nAmount Due: ${currencySymbol}${c.outstandingAmount.toLocaleString('en-IN')}\n\nKindly confirm once the transfer is completed. Thank you for your continued business!\n\nBest regards,\n${organization.name}`;
  };

  const handleCopyReminder = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Payment reminder message copied to clipboard!');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Customer Intelligence & Retention</h1>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Churn & Risk Analytics
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {intelligentCustomers.length} client accounts analyzed for <span className="font-semibold text-foreground">{organization.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 text-xs h-8 font-semibold shadow-xs" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Active Clients</p>
            <p className="text-xl font-bold text-foreground">{intelligentCustomers.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">VIP & Growing Accounts</p>
            <p className="text-xl font-bold text-emerald-600">
              {intelligentCustomers.filter(c => c.segment === 'VIP' || c.segment === 'Growing').length}
            </p>
          </CardContent>
        </Card>
        <Card className={`shadow-xs ${totalOutstanding > 0 ? 'border-destructive/30 bg-destructive/5' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground mb-1">Total Outstanding Due</p>
              {totalOutstanding > 0 && <AlertTriangle className="w-4 h-4 text-destructive" />}
            </div>
            <p className={`text-xl font-bold ${totalOutstanding > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {currencySymbol}{Math.round(totalOutstanding).toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search customers or company..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-9 h-8 text-xs" 
        />
      </div>

      {/* Customers Table */}
      <Card className="shadow-xs">
        <CardContent className="p-0">
          {intelligentCustomers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Customer Name</TableHead>
                  <TableHead className="text-xs">Classification</TableHead>
                  <TableHead className="text-xs text-right">Lifetime Spent</TableHead>
                  <TableHead className="text-xs text-right">Avg Order</TableHead>
                  <TableHead className="text-xs text-right">Outstanding Due</TableHead>
                  <TableHead className="text-xs">AI Diagnostic Insight</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                  <TableHead className="text-xs w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intelligentCustomers.map(c => (
                  <TableRow key={c.id} className="hover:bg-accent/50 text-xs">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{c.name}</p>
                          {c.company && <p className="text-[10px] text-muted-foreground">{c.company}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] font-bold ${SEGMENT_COLORS[c.segment] || ''}`}>
                        {c.segment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {currencySymbol}{c.totalSpent.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {currencySymbol}{c.averageOrderValue.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={c.outstandingAmount > 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                        {c.outstandingAmount > 0 ? `${currencySymbol}${c.outstandingAmount.toLocaleString('en-IN')}` : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">{c.aiInsight}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.outstandingAmount > 0 ? (
                        <Button
                          size="sm"
                          className="h-7 text-[11px] px-2.5 gap-1 font-semibold bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => setReminderModalCustomer(c)}
                        >
                          <Send className="w-3 h-3" /> Remind
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Settled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          deleteCustomer(orgId, c.id);
                          toast.success(`Removed ${c.name}`);
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
              <Users className="w-10 h-10 mx-auto opacity-30 text-primary" />
              <h3 className="font-semibold text-sm">No customers added yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Add clients to track customer lifetime value and auto-generate overdue payment follow-ups.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <Button size="sm" className="text-xs h-8 gap-1.5" onClick={() => setModalOpen(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Customer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: AI PAYMENT REMINDER GENERATOR */}
      {reminderModalCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Payment Follow-Up Generator
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Personalized draft for {reminderModalCustomer.name} ({currencySymbol}{reminderModalCustomer.outstandingAmount.toLocaleString('en-IN')} Due)
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full" onClick={() => setReminderModalCustomer(null)}>✕</Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Generated Professional Message:</Label>
              <textarea
                rows={9}
                value={getReminderMessage(reminderModalCustomer)}
                readOnly
                className="w-full p-3 text-xs rounded-xl border bg-muted/40 font-sans leading-relaxed focus:outline-hidden"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Safety Check: Messages are never sent automatically without your explicit confirmation.</span>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setReminderModalCustomer(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  handleCopyReminder(getReminderMessage(reminderModalCustomer));
                  setReminderModalCustomer(null);
                }}
              >
                <Copy className="w-3.5 h-3.5" /> Copy Message to Clipboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOMER */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Add New Customer
              </h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setModalOpen(false)}>✕</Button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Customer Full Name *</Label>
                <Input
                  placeholder="e.g. Vikram Joshi"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Phone / WhatsApp</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="customer@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Company Name</Label>
                  <Input
                    placeholder="Optional"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">City</Label>
                  <Input
                    placeholder="e.g. Delhi"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs h-8 gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
