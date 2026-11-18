'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MFG_WORKFLOWS } from '@/lib/data/ai-demo';
import { Workflow, Plus, Play, ArrowRight, Zap, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(MFG_WORKFLOWS);

  const handleToggle = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: nextStatus as any } : w));
    toast.success(`Workflow ${nextStatus === 'active' ? 'activated' : 'paused'}`);
  };

  const handleTestRun = (name: string) => {
    toast.success(`Simulated trigger: "${name}"`, {
      description: 'Conditions evaluated as TRUE. Action dispatched to agent execution queue.',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Workflow className="w-5 h-5 text-primary" /> Autonomous Trigger-Action Workflows
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Automate business logic, predictive maintenance alerts, auto-reordering, and quality quarantine routines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" /> Create Custom Workflow
          </Button>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map(wf => {
          const isActive = wf.status === 'active';
          return (
            <Card key={wf.id} className="transition-all hover:border-primary/40">
              <CardContent className="p-5 space-y-4">
                {/* Top: Name & Switch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-foreground">{wf.name}</h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {wf.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {wf.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1" onClick={() => handleTestRun(wf.name)}>
                      <Play className="w-3 h-3 fill-current" /> Test Run
                    </Button>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => handleToggle(wf.id, wf.status)}
                    />
                  </div>
                </div>

                {/* Workflow Architecture Chain */}
                <div className="p-3.5 rounded-xl bg-muted/40 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Trigger */}
                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Event Trigger
                    </span>
                    <p className="font-semibold text-foreground mt-1">{wf.trigger}</p>
                  </div>

                  {/* Conditions */}
                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Logical Guardrails
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {wf.conditions.map((c, i) => (
                        <p key={i} className="text-muted-foreground text-[11px]">• {c}</p>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 rounded-lg bg-card border space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Action Sequence
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {wf.actions.map((a, i) => (
                        <p key={i} className="text-foreground font-medium text-[11px]">
                          {i + 1}. {a}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats Footer */}
                <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Last executed: {wf.lastTriggered ? new Date(wf.lastTriggered).toLocaleDateString() : 'Never'} · {wf.totalRuns} total runs</span>
                  <span className="text-emerald-600 font-medium">{wf.successRate}% successful execution</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
