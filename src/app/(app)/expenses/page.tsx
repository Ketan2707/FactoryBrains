'use client';
import { useMemo, useState } from 'react';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RETAIL_EXPENSES } from '@/lib/data/retail-demo';
import { MFG_EXPENSES } from '@/lib/data/manufacturing-demo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Plus, SearchIcon, Download, CreditCard } from 'lucide-react';

export default function ExpensesPage() {
  const { organization } = useOrganizationStore();
  const [search, setSearch] = useState('');
  const expenses = useMemo(() => {
    const data = organization?.businessType === 'manufacturing' ? MFG_EXPENSES : RETAIL_EXPENSES;
    return data.filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));
  }, [organization, search]);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold tracking-tight">Expenses</h1><p className="text-sm text-muted-foreground mt-0.5">Track and categorize expenses</p></div>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Expense</Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Total Expenses</p><p className="text-xl font-semibold">₹{totalExpenses.toLocaleString('en-IN')}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Categories</p><p className="text-xl font-semibold">{categoryTotals.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Largest Category</p><p className="text-xl font-semibold">{categoryTotals[0]?.category || '—'}</p><p className="text-xs text-muted-foreground">₹{(categoryTotals[0]?.amount || 0).toLocaleString('en-IN')}</p></CardContent></Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><CardContent className="p-4"><p className="text-sm font-medium mb-3">Expenses by Category</p>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryTotals.slice(0, 6)} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} /><XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} /><YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} /><RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(value: unknown) => [`₹${Number(value).toLocaleString('en-IN')}`]} /><Bar dataKey="amount" fill="#5b5fc7" radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></div>
        </CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm font-medium mb-3">Top Categories</p>
          <div className="space-y-3">{categoryTotals.slice(0, 5).map(cat => (<div key={cat.category} className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{cat.category}</span><span className="text-xs font-medium">₹{cat.amount.toLocaleString('en-IN')}</span></div>))}</div>
        </CardContent></Card>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs"><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" /></div>
        <Button variant="outline" size="sm" className="gap-1.5 h-9"><Download className="w-3.5 h-3.5" /> Export</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table><TableHeader><TableRow>
          <TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Category</TableHead><TableHead className="text-xs">Description</TableHead><TableHead className="text-xs text-right">Amount</TableHead><TableHead className="text-xs">Method</TableHead><TableHead className="text-xs">Status</TableHead>
        </TableRow></TableHeader><TableBody>{expenses.map(e => (
          <TableRow key={e.id}><TableCell className="text-xs text-muted-foreground">{e.date}</TableCell><TableCell><Badge variant="secondary" className="text-[10px]">{e.category}</Badge></TableCell><TableCell className="text-xs">{e.description}</TableCell><TableCell className="text-xs text-right font-medium">₹{e.amount.toLocaleString('en-IN')}</TableCell><TableCell className="text-xs text-muted-foreground capitalize">{e.paymentMethod.replace('_', ' ')}</TableCell><TableCell><Badge variant="secondary" className={`text-[10px] ${e.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{e.status}</Badge></TableCell></TableRow>
        ))}</TableBody></Table>
      </CardContent></Card>
    </div>
  );
}
