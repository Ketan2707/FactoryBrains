'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MFG_PRODUCTION_ORDERS } from '@/lib/data/manufacturing-demo';
import { Plus, SearchIcon, Factory, AlertTriangle, CheckCircle2, Clock, PlayCircle, Filter, Download } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planned', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  on_hold: { label: 'On Hold', color: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const PRIORITY_BADGES: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'default',
  critical: 'destructive',
};

export default function ProductionPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = useMemo(() => {
    return MFG_PRODUCTION_ORDERS.filter(o => {
      const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.productName.toLowerCase().includes(search.toLowerCase()) ||
        o.workCenter.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'all' || o.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [search, activeTab]);

  const stats = useMemo(() => {
    const total = MFG_PRODUCTION_ORDERS.length;
    const inProgress = MFG_PRODUCTION_ORDERS.filter(o => o.status === 'in_progress').length;
    const completed = MFG_PRODUCTION_ORDERS.filter(o => o.status === 'completed').length;
    const planned = MFG_PRODUCTION_ORDERS.filter(o => o.status === 'planned').length;
    const avgEfficiency = Math.round(
      MFG_PRODUCTION_ORDERS.filter(o => o.efficiency > 0).reduce((sum, o) => sum + o.efficiency, 0) /
      Math.max(1, MFG_PRODUCTION_ORDERS.filter(o => o.efficiency > 0).length)
    );
    return { total, inProgress, completed, planned, avgEfficiency };
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Production Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor real-time work orders, machine line output, and execution schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" /> New Production Order
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Active Work Orders</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <PlayCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.planned} orders queued</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Line Efficiency</span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.avgEfficiency}%</p>
            <p className="text-xs text-emerald-600 mt-1">Target: 90% achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Completed (Aug)</span>
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground mt-1">155 total units produced</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Delivery Risk Alerts</span>
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-amber-600">1 Order</p>
            <p className="text-xs text-muted-foreground mt-1">SO-2026-0482 (Tata Power)</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All Orders ({stats.total})</TabsTrigger>
            <TabsTrigger value="in_progress" className="text-xs">In Progress ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="planned" className="text-xs">Planned ({stats.planned})</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">Completed ({stats.completed})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-xs w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, products, lines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Production Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">Order ID</TableHead>
                <TableHead className="text-xs font-semibold">Product</TableHead>
                <TableHead className="text-xs font-semibold">Work Center</TableHead>
                <TableHead className="text-xs font-semibold">Progress</TableHead>
                <TableHead className="text-xs font-semibold">Timeline</TableHead>
                <TableHead className="text-xs font-semibold">Efficiency</TableHead>
                <TableHead className="text-xs font-semibold">Scrap</TableHead>
                <TableHead className="text-xs font-semibold">Priority</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => {
                const percent = Math.round((order.completedQuantity / order.quantity) * 100);
                const statusConf = STATUS_CONFIG[order.status] || { label: order.status, color: '' };
                return (
                  <TableRow key={order.id} className="hover:bg-accent/40 cursor-pointer">
                    <TableCell className="font-mono text-xs font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-medium">{order.productName}</p>
                        <p className="text-[10px] text-muted-foreground">{order.assignedTo || 'Unassigned'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>
                        <p>{order.workCenter}</p>
                        <p className="text-[10px] text-muted-foreground">{order.productionLine}</p>
                      </div>
                    </TableCell>
                    <TableCell className="w-44">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>{order.completedQuantity} / {order.quantity} units</span>
                          <span className="font-medium">{percent}%</span>
                        </div>
                        <Progress value={percent} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{order.startDate} → {order.endDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {order.efficiency > 0 ? (
                        <span className={`font-medium ${order.efficiency >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {order.efficiency}%
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.scrapRate > 0 ? `${order.scrapRate}%` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={PRIORITY_BADGES[order.priority] || 'secondary'} className="text-[10px] uppercase tracking-wider">
                        {order.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-medium border ${statusConf.color}`}>
                        {statusConf.label}
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
