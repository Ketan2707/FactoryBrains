'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MFG_BOMS } from '@/lib/data/manufacturing-demo';
import { GitBranch, Plus, Download, Layers, Clock, IndianRupee, Truck, CheckCircle2, ChevronRight } from 'lucide-react';

export default function BOMPage() {
  const [selectedBOMId, setSelectedBOMId] = useState(MFG_BOMS[0].id);
  const [search, setSearch] = useState('');

  const currentBOM = MFG_BOMS.find(b => b.id === selectedBOMId) || MFG_BOMS[0];

  const filteredComponents = currentBOM.components.filter(c =>
    c.materialName.toLowerCase().includes(search.toLowerCase()) ||
    (c.supplierName || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = currentBOM.components.reduce((sum, c) => sum + c.totalCost, 0);
  const maxLeadTime = Math.max(...currentBOM.components.map(c => c.leadTime || 0));

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Bill of Materials (BOM)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Multi-level component hierarchy, cost rollups, and component supply lead times
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Download className="w-3.5 h-3.5" /> Export BOM
          </Button>
          <Button size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" /> Create New BOM
          </Button>
        </div>
      </div>

      {/* Selector & Top Level Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Select Product BOM</label>
              <div className="flex gap-2">
                <Select value={selectedBOMId} onValueChange={(val) => val && setSelectedBOMId(val)}>
                  <SelectTrigger className="flex-1 h-9 text-sm">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {MFG_BOMS.map(b => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.productName} ({b.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
              <span>Status: <Badge variant="secondary" className="text-[10px] ml-1 bg-emerald-50 text-emerald-700">Active</Badge></span>
              <span>Effective: {currentBOM.effectiveDate}</span>
              <span>Last Modified: {currentBOM.lastModified}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Total Material Cost</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">₹{totalCost.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground mt-1">Per unit assembly</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Critical Lead Time</span>
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{maxLeadTime} Days</p>
            <p className="text-xs text-muted-foreground mt-1">{currentBOM.components.length} total components</p>
          </CardContent>
        </Card>
      </div>

      {/* BOM Component List */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Components & Raw Materials Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Engineering structure for {currentBOM.productName} ({currentBOM.version})
            </p>
          </div>
          <div className="w-64">
            <Input
              placeholder="Search components or vendors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">Material / Part</TableHead>
                <TableHead className="text-xs font-semibold text-right">Qty / Unit</TableHead>
                <TableHead className="text-xs font-semibold">Unit</TableHead>
                <TableHead className="text-xs font-semibold text-right">Unit Cost</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total Cost</TableHead>
                <TableHead className="text-xs font-semibold">Supplier / Source</TableHead>
                <TableHead className="text-xs font-semibold text-right">Lead Time</TableHead>
                <TableHead className="text-xs font-semibold">Cost Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComponents.map(c => {
                const share = Math.round((c.totalCost / totalCost) * 100);
                return (
                  <TableRow key={c.id} className="hover:bg-accent/40">
                    <TableCell className="font-medium text-xs">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{c.materialName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">{c.quantity}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.unit}</TableCell>
                    <TableCell className="text-xs text-right font-mono">₹{c.unitCost.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-xs text-right font-semibold font-mono">₹{c.totalCost.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-xs">
                      {c.supplierName ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Truck className="w-3 h-3 text-muted-foreground" />
                          {c.supplierName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">In-house / Standard</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">
                      {c.leadTime ? `${c.leadTime} days` : 'Immediate'}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground">{share}%</span>
                      </div>
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
