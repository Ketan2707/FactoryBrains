'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ActionCenterTask } from '@/lib/services/ai-business-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  Clock, 
  TrendingUp, 
  X,
  Send,
  ShoppingCart,
  Percent,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';

interface WhatToDoModalProps {
  open: boolean;
  onClose: () => void;
  tasks: ActionCenterTask[];
  organizationName: string;
}

export function WhatToDoModal({
  open,
  onClose,
  tasks,
  organizationName,
}: WhatToDoModalProps) {
  const router = useRouter();
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  if (!open) return null;

  const handleActionClick = (task: ActionCenterTask) => {
    setCompletedTasks(prev => ({ ...prev, [task.id]: true }));
    toast.success(`Action initiated: "${task.title}"`, {
      description: `Opening ${task.actionRoute}...`,
    });
    onClose();
    router.push(task.actionRoute);
  };

  const getPriorityColor = (priority: ActionCenterTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl fb-gradient-bg flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                What Should I Do Today?
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  AI Action Priorities
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Autonomous multi-factor recommendations for <span className="font-semibold text-foreground">{organizationName}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Explainability Banner */}
        <div className="p-3.5 bg-primary/5 border-b px-5 flex items-center gap-2.5 text-xs text-muted-foreground shrink-0">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>
            Every recommendation explains <strong className="text-foreground">Why</strong>, cites <strong className="text-foreground">Empirical Data Used</strong>, and displays an estimated <strong className="text-foreground">Confidence Score</strong>.
          </span>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {tasks.map((task, index) => {
            const isDone = completedTasks[task.id];
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDone 
                    ? 'opacity-60 bg-muted/40 border-muted' 
                    : 'bg-card hover:border-primary/40 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-sm text-foreground">{task.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority} Priority
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {task.confidence}% Confidence
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Why It Matters:
                    </span>
                    <p className="text-foreground leading-relaxed">{task.why}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Expected Business Impact:
                    </span>
                    <p className="text-emerald-600 font-medium leading-relaxed">{task.expectedImpact}</p>
                  </div>
                </div>

                <div className="pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[10px] text-muted-foreground">
                    Data: <span className="font-mono text-[11px] text-foreground">{task.dataUsed}</span>
                  </span>

                  <Button
                    size="sm"
                    className="text-xs h-8 gap-1.5 font-semibold self-end sm:self-auto"
                    onClick={() => handleActionClick(task)}
                  >
                    {task.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20 flex justify-end shrink-0">
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
