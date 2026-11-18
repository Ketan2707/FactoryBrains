'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MFG_QUALITY } from '@/lib/data/manufacturing-demo';
import { ShieldCheck, SearchIcon, AlertTriangle, CheckCircle2, XCircle, Plus, Eye, Download, ChevronRight } from 'lucide-react';

export default function QualityPage() {
  const [search, setSearch] = useState('');
  const [selectedInspection, setSelectedInspection] = useState<typeof MFG_QUALITY[0] | null>(MFG_QUALITY[2]); // Default to failed batch for interesting view

  const filteredInspections = useMemo(() => {
    return MFG_QUALITY.filter(q => {
      return q.inspectionNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.productName.toLowerCase().includes(search.toLowerCase()) ||
        q.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.inspector.toLowerCase().includes(search.toLowerCase());
    });
  }, [search]);

  const stats = useMemo(() => {
    const total = MFG_QUALITY.length;
    const passed = MFG_QUALITY.filter(q => q.result === 'passed').length;
    const failed = MFG_QUALITY.filter(q => q.result === 'failed').length;
    const totalChecked = MFG_QUALITY.reduce((sum, q) => sum + q.totalChecked, 0);
    const totalDefects = MFG_QUALITY.reduce((sum, q) => sum + q.failed, 0);
    const avgDefectRate = ((totalDefects / totalChecked) * 100).toFixed(1);
    return { total, passed, failed, totalChecked, totalDefects, avgDefectRate };
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Quality Assurance & Inspections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Batch inspection reports, defect tracking, tolerance testing, and traceability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Download className="w-3.5 h-3.5" /> Export QC Report
          </Button>
          <Button size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" /> New Inspection
          </Button>
        </div>
      </div>

      {/* Warning Banner for failed lot */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Quality Alert: Batch B-2026-099 Failed Inspection (22.2% Defect Rate)
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Industrial Pump P100 — 3 mechanical seal pressure failures. Strong correlation with Material Batch #882 from new supplier lot.
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="shrink-0 text-xs h-8 bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900">
          Open AI Investigation
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Total Inspected</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.totalChecked} units</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.total} production batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Pass Rate</span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.passed} / {stats.total}</p>
            <p className="text-xs text-emerald-600 mt-1">{Math.round((stats.passed / stats.total) * 100)}% batch acceptance</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Average Defect Rate</span>
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.avgDefectRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalDefects} total rejected units</p>
          </CardContent>
        </Card>

        <Card className={stats.failed > 0 ? 'border-red-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Failed Batches</span>
              <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-red-600">{stats.failed}</p>
            <p className="text-xs text-muted-foreground mt-1">Batch #099 quarantined</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Split: Table + Inspection Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Inspection Records</CardTitle>
            <div className="relative w-60">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search inspections..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Inspection ID</TableHead>
                  <TableHead className="text-xs font-semibold">Batch / Product</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Checked</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Defect %</TableHead>
                  <TableHead className="text-xs font-semibold">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map(item => (
                  <TableRow
                    key={item.id}
                    className={`cursor-pointer hover:bg-accent/40 ${selectedInspection?.id === item.id ? 'bg-accent/60' : ''}`}
                    onClick={() => setSelectedInspection(item)}
                  >
                    <TableCell className="font-mono text-xs font-medium">{item.inspectionNumber}</TableCell>
                    <TableCell className="text-xs">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{item.batchNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.inspectionDate}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{item.totalChecked}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">
                      <span className={item.defectRate > 5 ? 'text-red-600' : 'text-emerald-600'}>
                        {item.defectRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium capitalize ${
                          item.result === 'passed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {item.result}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Selected Inspection Detail View */}
        <Card className="h-fit">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-mono">{selectedInspection?.inspectionNumber}</span>
                <CardTitle className="text-sm font-semibold mt-0.5">
                  {selectedInspection?.productName}
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] capitalize ${
                  selectedInspection?.result === 'passed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {selectedInspection?.result}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
              <div>
                <span className="text-muted-foreground text-[10px]">Batch Number</span>
                <p className="font-mono font-medium">{selectedInspection?.batchNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px]">Inspector</span>
                <p className="font-medium">{selectedInspection?.inspector}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px]">Passed / Tested</span>
                <p className="font-semibold text-emerald-600">{selectedInspection?.passed} / {selectedInspection?.totalChecked}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px]">Defect Count</span>
                <p className="font-semibold text-red-600">{selectedInspection?.failed} units</p>
              </div>
            </div>

            {/* Defects breakdown */}
            <div>
              <p className="font-medium text-xs mb-2">Identified Defects</p>
              <div className="space-y-2">
                {selectedInspection?.defects.map(d => (
                  <div key={d.id} className="p-2.5 rounded border border-border bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs">{d.type} ({d.count} unit{d.count > 1 ? 's' : ''})</span>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] uppercase ${
                          d.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          d.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                          'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {d.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{d.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspector Notes */}
            {selectedInspection?.notes && (
              <div className="p-2.5 rounded bg-blue-50/50 border border-blue-100 text-blue-900">
                <span className="font-medium block text-[11px]">Inspector Notes:</span>
                <p className="text-[11px] text-blue-800 mt-0.5">{selectedInspection.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
