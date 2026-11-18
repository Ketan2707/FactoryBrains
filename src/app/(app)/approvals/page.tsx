'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MFG_APPROVALS } from '@/lib/data/ai-demo';
import { CheckCircle2, XCircle, Clock, Sparkles, Bot, AlertTriangle, IndianRupee, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState(MFG_APPROVALS);

  const handleApprove = (id: string, title: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' as const } : a));
    toast.success(`Approved: "${title}"`, {
      description: 'Transaction signed and dispatched for execution.',
    });
  };

  const handleReject = (id: string, title: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' as const } : a));
    toast.error(`Rejected: "${title}"`, {
      description: 'Action blocked and returned to agent with feedback.',
    });
  };

  const pendingList = approvals.filter(a => a.status === 'pending');
  const resolvedList = approvals.filter(a => a.status !== 'pending');

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" /> Human-in-the-Loop Approvals Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and authorize autonomous AI agent proposals, high-value procurement requests, and critical plant operations
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
          {pendingList.length} Action{pendingList.length === 1 ? '' : 's'} Awaiting Authorization
        </Badge>
      </div>

      {/* Pending Items */}
      <div className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pending Authorization ({pendingList.length})
        </span>

        {pendingList.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            All queued agent recommendations and high-value orders have been reviewed.
          </Card>
        ) : (
          pendingList.map(item => (
            <Card key={item.id} className="border-amber-200 shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base text-foreground">{item.title}</h3>
                        <Badge variant="destructive" className="text-[10px] uppercase">
                          {item.urgency} Urgency
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Proposed by <strong className="text-foreground">{item.requestedBy}</strong> · {new Date(item.requestedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {item.amount && (
                      <span className="font-mono font-bold text-base text-foreground block">
                        ₹{(item.amount / 100000).toFixed(2)} Lakhs
                      </span>
                    )}
                    <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700">
                      <Sparkles className="w-3 h-3 mr-1" /> {item.aiConfidence}% AI Confidence
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed">
                  {item.description}
                </p>

                {item.expectedImpact && (
                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-950 text-xs">
                    <span className="font-semibold block text-[11px]">Anticipated Business Value:</span>
                    <p className="mt-0.5 text-emerald-900">{item.expectedImpact}</p>
                  </div>
                )}

                {/* Approve / Reject Buttons */}
                <div className="pt-3 border-t flex items-center justify-end gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => handleReject(item.id, item.title)}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Proposal
                  </Button>

                  <Button
                    size="sm"
                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(item.id, item.title)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Authorize & Execute
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resolved History */}
      {resolvedList.length > 0 && (
        <div className="space-y-3 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recently Resolved ({resolvedList.length})
          </span>
          <div className="space-y-2">
            {resolvedList.map(item => (
              <Card key={item.id} className="opacity-75">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-xs text-foreground">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${
                      item.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
