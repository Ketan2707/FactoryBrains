'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MFG_INVESTIGATIONS } from '@/lib/data/ai-demo';
import { Search, Sparkles, AlertCircle, Database, CheckCircle2, ChevronRight, ArrowRight, ShieldAlert, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState(MFG_INVESTIGATIONS);
  const [selectedId, setSelectedId] = useState(MFG_INVESTIGATIONS[0].id);
  const [query, setQuery] = useState('');
  const [isInvestigating, setIsInvestigating] = useState(false);

  const currentInvestigation = investigations.find(i => i.id === selectedId) || investigations[0];

  const handleNewInvestigation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsInvestigating(true);

    setTimeout(() => {
      const newInv = {
        id: `inv_${Date.now()}`,
        question: query,
        status: 'completed' as const,
        summary: `Analysis completed across 48,000+ data points. Primary root cause correlated with recent parameter drift and upstream supplier lot variance.`,
        contributors: [
          { factor: 'Supplier Batch Variability', contribution: 68, description: 'Incoming material tolerance shifted by 2.3% compared to baseline standard.', severity: 'high' as const },
          { factor: 'Thermal Cycling in Bay B', contribution: 45, description: 'Ambient temperature spikes during 14:00–17:00 window affected cooling phase.', severity: 'medium' as const },
        ],
        evidence: [
          { label: 'Variance delta', value: '+2.3% above spec', source: 'QA Inspection' },
          { label: 'Affected units', value: '14 units', source: 'Production Log' },
        ],
        recommendedActions: [
          'Request certified material test report from vendor',
          'Recalibrate thermal sensors on Line 2',
        ],
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        dataSourcesAnalyzed: ['ERP', 'IoT Sensors', 'Quality', 'Procurement'],
      };
      setInvestigations([newInv, ...investigations]);
      setSelectedId(newInv.id);
      setQuery('');
      setIsInvestigating(false);
      toast.success('AI Root-Cause Investigation completed');
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Root-Cause Investigations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ask any &quot;Why?&quot; question across your entire enterprise dataset to synthesize root-cause hypotheses with statistical contribution scoring.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <Card className="p-2 border-primary/30 shadow-xs">
        <form onSubmit={handleNewInvestigation} className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input
              placeholder="Ask a diagnostic question (e.g. 'Why did scrap rate spike on Line 3?')..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 text-sm border-0 focus-visible:ring-0 shadow-none"
            />
          </div>
          <Button type="submit" size="sm" disabled={isInvestigating} className="gap-1.5 px-4">
            {isInvestigating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" /> Investigate
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Investigation Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Previous Investigations List */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Completed Analyses ({investigations.length})
          </span>
          <div className="space-y-2">
            {investigations.map(inv => (
              <Card
                key={inv.id}
                className={`cursor-pointer hover:border-primary/40 transition-all ${
                  selectedId === inv.id ? 'border-primary ring-1 ring-primary/20 bg-accent/20' : ''
                }`}
                onClick={() => setSelectedId(inv.id)}
              >
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-xs text-foreground line-clamp-2">{inv.question}</p>
                    <Badge variant="secondary" className="text-[9px] shrink-0 bg-emerald-50 text-emerald-700">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {inv.summary}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
                    <span>{inv.contributors.length} primary factors</span>
                    <span>{inv.dataSourcesAnalyzed.length} data feeds</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Selected Investigation Deep-Dive */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4 border-b space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Diagnostic Case Study</span>
                <CardTitle className="text-base font-bold mt-1 text-foreground">
                  {currentInvestigation.question}
                </CardTitle>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                AI Synthesized
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Database className="w-3 h-3" /> Data feeds audited:
              </span>
              {currentInvestigation.dataSourcesAnalyzed.map(ds => (
                <Badge key={ds} variant="secondary" className="text-[10px] font-mono">
                  {ds}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-6">
            {/* Executive Synthesis */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Executive Synthesis
              </span>
              <p className="text-xs leading-relaxed p-3.5 rounded-lg bg-muted/40 text-foreground">
                {currentInvestigation.summary}
              </p>
            </div>

            {/* Causal Contributor Breakdown */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Causal Factor Contribution Attribution
              </span>
              <div className="space-y-3">
                {currentInvestigation.contributors.map((c, i) => (
                  <div key={i} className="p-3.5 rounded-lg border bg-card space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{c.factor}</span>
                      <span className="font-mono font-bold text-primary">{c.contribution}% weight</span>
                    </div>
                    <Progress value={c.contribution} className="h-1.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence & Action Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Supporting Signals
                </span>
                <div className="space-y-1.5">
                  {currentInvestigation.evidence.map((e, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-muted/50 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">{e.label}</p>
                        <p className="text-[10px] text-muted-foreground">{e.source}</p>
                      </div>
                      <span className="font-mono font-semibold text-xs">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recommended Remediation
                </span>
                <div className="space-y-1.5">
                  {currentInvestigation.recommendedActions.map((action, idx) => (
                    <div key={idx} className="p-2.5 rounded border border-emerald-200 bg-emerald-50/40 text-emerald-950 text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
