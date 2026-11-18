'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MFG_AI_AGENTS } from '@/lib/data/ai-demo';
import { Bot, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Sliders, Activity, Clock, Plus, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAgentsPage() {
  const [agents, setAgents] = useState(MFG_AI_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState(MFG_AI_AGENTS[3].id); // Default to Procurement Agent

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const handleToggleAgent = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus as any } : a));
    toast.success(`Agent ${nextStatus === 'active' ? 'activated' : 'paused'}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> Autonomous AI Agents & Governance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Governed domain agents with strict guardrails, approval thresholds, spending limits, and tool permissions
          </p>
        </div>
      </div>

      {/* Safety & Governance Notice */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-foreground">Zero Unauthorized Actions Guarantee</p>
          <p className="text-muted-foreground leading-relaxed">
            All agents operate under strict sandboxed permissions. High-impact decisions (PO creation &gt; ₹1L, machine shutdowns, batch quarantine) mandate human-in-the-loop approval.
          </p>
        </div>
      </div>

      {/* Agent Grid & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agent Cards */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Deployed Agents ({agents.length})
          </span>
          <div className="space-y-2.5">
            {agents.map(agent => {
              const isSelected = selectedAgentId === agent.id;
              const isActive = agent.status === 'active';
              return (
                <Card
                  key={agent.id}
                  className={`cursor-pointer hover:border-primary/40 transition-all ${
                    isSelected ? 'border-primary ring-1 ring-primary/20 bg-accent/20' : ''
                  }`}
                  onClick={() => setSelectedAgentId(agent.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xs text-foreground">{agent.name}</h3>
                          <p className="text-[10px] text-muted-foreground capitalize">{agent.type} Agent</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] capitalize ${
                          isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {agent.status}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t text-[10px] text-muted-foreground">
                      <span>{agent.totalActions} actions executed</span>
                      <span className="text-emerald-600 font-medium">{agent.successRate}% success rate</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Agent Governance Policy */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4 border-b space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">{selectedAgent.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedAgent.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Status</span>
                <Switch
                  checked={selectedAgent.status === 'active'}
                  onCheckedChange={() => handleToggleAgent(selectedAgent.id, selectedAgent.status)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-6">
            {/* Guardrail Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40">
                <span className="text-muted-foreground text-[10px] block">Confidence Threshold</span>
                <span className="text-base font-mono font-bold text-foreground mt-0.5 block">
                  {selectedAgent.confidenceThreshold}%
                </span>
                <span className="text-[10px] text-muted-foreground">Min required score</span>
              </div>

              <div className="p-3 rounded-lg bg-muted/40">
                <span className="text-muted-foreground text-[10px] block">Autonomous Spend Cap</span>
                <span className="text-base font-mono font-bold text-foreground mt-0.5 block">
                  {selectedAgent.spendingLimit ? `₹${(selectedAgent.spendingLimit / 1000).toFixed(0)}K` : '₹0'}
                </span>
                <span className="text-[10px] text-muted-foreground">PO approval threshold</span>
              </div>

              <div className="p-3 rounded-lg bg-muted/40">
                <span className="text-muted-foreground text-[10px] block">Human Approval</span>
                <span className="text-base font-bold text-primary mt-0.5 block">
                  {selectedAgent.approvalRequired ? 'Mandatory' : 'Optional'}
                </span>
                <span className="text-[10px] text-muted-foreground">For critical actions</span>
              </div>
            </div>

            {/* Granular Permissions Matrix */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fine-Grained Permission Matrix & Tool Access
              </span>
              <div className="space-y-2">
                {selectedAgent.permissions.map((perm, idx) => (
                  <div key={idx} className="p-3 rounded-lg border bg-card flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">{perm.action}</p>
                      <p className="text-[11px] text-muted-foreground">{perm.description}</p>
                    </div>
                    <div>
                      {perm.allowed ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Allowed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 text-[10px]">
                          <XCircle className="w-3 h-3" /> Prohibited
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Allowed Tool Integrations */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assigned Tool Function Calls
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.allowedTools.map(tool => (
                  <Badge key={tool} variant="secondary" className="font-mono text-xs py-1 px-2.5">
                    <Zap className="w-3 h-3 mr-1 text-primary" /> {tool}()
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
