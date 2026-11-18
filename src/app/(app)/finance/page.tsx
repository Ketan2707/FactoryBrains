'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MFG_MONTHLY_REVENUE } from '@/lib/data/manufacturing-demo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { IndianRupee, TrendingUp, ArrowUpRight, ArrowDownRight, Download, Calendar, DollarSign } from 'lucide-react';

export default function FinancePage() {
  const currentMonth = MFG_MONTHLY_REVENUE[MFG_MONTHLY_REVENUE.length - 1];
  const prevMonth = MFG_MONTHLY_REVENUE[MFG_MONTHLY_REVENUE.length - 2];

  const revenueGrowth = (((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1);
  const profitMargin = ((currentMonth.profit / currentMonth.revenue) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" /> Financial Performance & Unit Economics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Profit & Loss statements, COGS breakdown, gross margins, and working capital requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Download className="w-3.5 h-3.5" /> Export P&L Statement
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Monthly Revenue (Aug)</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">₹{(currentMonth.revenue / 100000).toFixed(2)}L</p>
            <p className="text-xs text-muted-foreground mt-1">₹35.2 Lakhs total billed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Cost of Goods Sold</span>
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">₹{(currentMonth.cost / 100000).toFixed(2)}L</p>
            <p className="text-xs text-amber-600 mt-1">79% COGS ratio</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Net Operating Profit</span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">₹{(currentMonth.profit / 100000).toFixed(2)}L</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{profitMargin}% Operating Margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Accounts Receivable</span>
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">₹43.0L</p>
            <p className="text-xs text-muted-foreground mt-1">Avg 24 days DSO</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Profit Trends Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">6-Month Financial Trend (Revenue vs Cost of Production vs Net Profit)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MFG_MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value: unknown, name?: unknown) => [`₹${(Number(value) / 100000).toFixed(2)} Lakhs`, String(name ?? '')]}
                />
                <Bar dataKey="revenue" fill="#5b5fc7" radius={[3, 3, 0, 0]} name="Gross Revenue" />
                <Bar dataKey="cost" fill="#94a3b8" radius={[3, 3, 0, 0]} name="Cost of Goods (COGS)" />
                <Bar dataKey="profit" fill="#10b981" radius={[3, 3, 0, 0]} name="Net Operating Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Financial Statement Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Monthly P&L Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">Period (2026)</TableHead>
                <TableHead className="text-xs font-semibold text-right">Revenue</TableHead>
                <TableHead className="text-xs font-semibold text-right">COGS</TableHead>
                <TableHead className="text-xs font-semibold text-right">Operating Profit</TableHead>
                <TableHead className="text-xs font-semibold text-right">Margin %</TableHead>
                <TableHead className="text-xs font-semibold">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MFG_MONTHLY_REVENUE.map(m => {
                const margin = ((m.profit / m.revenue) * 100).toFixed(1);
                return (
                  <TableRow key={m.month} className="hover:bg-accent/40">
                    <TableCell className="font-medium text-xs">{m.month} 2026</TableCell>
                    <TableCell className="text-xs text-right font-mono font-medium">₹{m.revenue.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-muted-foreground">₹{m.cost.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-xs text-right font-mono font-semibold text-emerald-600">₹{m.profit.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-xs text-right font-mono font-semibold">{margin}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                        Target Met
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
