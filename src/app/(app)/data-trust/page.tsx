'use client';

import { useState } from 'react';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MFG_DATA_TRUST, RETAIL_DATA_TRUST } from '@/lib/data/ai-demo';
import { ShieldCheck, RefreshCw, AlertTriangle, Database, CheckCircle2, Server, Cpu, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

export default function DataTrustPage() {
  const { organization } = useOrganizationStore();
  const [dataTrust, setDataTrust] = useState(
    organization?.businessType === 'manufacturing' ? MFG_DATA_TRUST : RETAIL_DATA_TRUST
  );
  const [isReconciling, setIsReconciling] = useState(false);

  const avgScore = Math.round(dataTrust.reduce((sum, d) => sum + d.score, 0) / dataTrust.length);
  const totalIssues = dataTrust.reduce((sum, d) => sum + d.issues.reduce((sub, i) => sub + i.count, 0), 0);

  const handleReconcile = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
      toast.success('Data reconciliation completed', {
        description: 'All external ERP, IoT and database connections re-synchronized.',
      });
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Data Trust & Observability Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Continuous data quality monitoring, conflict detection, stale sensor mitigation, and source reliability scoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={handleReconcile} disabled={isReconciling}>
            <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
            {isReconciling ? 'Reconciling Feeds...' : 'Run Data Reconciliation'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Overall Data Trust Index</span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{avgScore}%</p>
            <Progress value={avgScore} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Audited Records</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">
              {(dataTrust.reduce((sum, d) => sum + d.recordCount, 0)).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Real-time monitored rows</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Connected Pipelines</span>
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{dataTrust.length} Sources</p>
            <p className="text-xs text-muted-foreground mt-1">100% telemetry online</p>
          </CardContent>
        </Card>

        <Card className={totalIssues > 10 ? 'border-amber-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Flagged Anomalies</span>
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-amber-600">{totalIssues} Items</p>
            <p className="text-xs text-muted-foreground mt-1">Stale / missing telemetry gaps</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Source Breakdown Cards */}
      <div className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Source Integrity Scorecards
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataTrust.map(dt => (
            <Card key={dt.source} className="hover:border-primary/40 transition-all">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{dt.source}</CardTitle>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {dt.recordCount.toLocaleString()} synchronized records
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-bold text-base ${dt.score >= 90 ? 'text-emerald-600' : dt.score >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                    {dt.score}%
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Trust Score</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                {dt.issues.length === 0 ? (
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Clean feed. Zero conflicts, missing values, or stale timestamps.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Detected Data Quality Issues ({dt.issues.length}):
                    </span>
                    {dt.issues.map((issue, i) => (
                      <div key={i} className="p-2.5 rounded border bg-card flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold capitalize text-foreground">{issue.type} Data</span>
                            <Badge
                              variant="secondary"
                              className={`text-[9px] uppercase ${
                                issue.severity === 'high' ? 'bg-red-100 text-red-700' :
                                issue.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{issue.description}</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-muted-foreground shrink-0">
                          {issue.count} rows
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
