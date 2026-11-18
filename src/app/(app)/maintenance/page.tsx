'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MFG_MAINTENANCE } from '@/lib/data/manufacturing-demo';
import { Wrench, SearchIcon, AlertTriangle, Sparkles, Clock, CheckCircle2, Plus, Calendar, Filter } from 'lucide-react';

const PRIORITY_STYLES: Record<string, { label: string; badge: string }> = {
  critical: { label: 'Critical', badge: 'bg-red-50 text-red-700 border-red-200' },
  high: { label: 'High', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'Low', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const TYPE_STYLES: Record<string, { label: string; badge: string }> = {
  predictive: { label: 'Predictive (AI)', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  preventive: { label: 'Preventive', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  corrective: { label: 'Corrective', badge: 'bg-red-50 text-red-700 border-red-200' },
};

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return MFG_MAINTENANCE.filter(t => {
      const matchSearch = t.taskNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.machineName.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  const stats = useMemo(() => {
    const total = MFG_MAINTENANCE.length;
    const scheduled = MFG_MAINTENANCE.filter(t => t.status === 'scheduled').length;
    const inProgress = MFG_MAINTENANCE.filter(t => t.status === 'in_progress').length;
    const completed = MFG_MAINTENANCE.filter(t => t.status === 'completed').length;
    const aiCount = MFG_MAINTENANCE.filter(t => t.aiRecommended).length;
    return { total, scheduled, inProgress, completed, aiCount };
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Maintenance Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Predictive AI alerts, preventive maintenance routines, and corrective repair schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" /> Create Maintenance Task
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Predictive (AI) Tasks</span>
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.aiCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Sensor-triggered intervention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">In Progress</span>
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground mt-1">Active field technicians</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Scheduled Work</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.scheduled}</p>
            <p className="text-xs text-muted-foreground mt-1">Upcoming maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Completed (Month)</span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground mt-1">Resolved without downtime</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full sm:w-auto">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All Tasks ({stats.total})</TabsTrigger>
            <TabsTrigger value="predictive" className="text-xs">Predictive ({stats.aiCount})</TabsTrigger>
            <TabsTrigger value="preventive" className="text-xs">Preventive</TabsTrigger>
            <TabsTrigger value="corrective" className="text-xs">Corrective</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-xs w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, machines, description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">Task ID</TableHead>
                <TableHead className="text-xs font-semibold">Machine</TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold">Assigned To</TableHead>
                <TableHead className="text-xs font-semibold">Date</TableHead>
                <TableHead className="text-xs font-semibold">Duration</TableHead>
                <TableHead className="text-xs font-semibold">Priority</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => {
                const priorityInfo = PRIORITY_STYLES[task.priority] || { label: task.priority, badge: '' };
                const typeInfo = TYPE_STYLES[task.type] || { label: task.type, badge: '' };
                return (
                  <TableRow key={task.id} className="hover:bg-accent/40 cursor-pointer">
                    <TableCell className="font-mono text-xs font-medium">{task.taskNumber}</TableCell>
                    <TableCell className="text-xs font-medium">
                      <div>
                        <p>{task.machineName}</p>
                        {task.aiRecommended && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-purple-600 font-medium mt-0.5">
                            <Sparkles className="w-3 h-3" /> Risk: {task.failureProbability}%
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${typeInfo.badge}`}>
                        {typeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-sm">
                      <p className="truncate">{task.description}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{task.assignedTo}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{task.scheduledDate}</TableCell>
                    <TableCell className="text-xs font-mono">{task.estimatedDuration}h est.</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${priorityInfo.badge}`}>
                        {priorityInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {task.status.replace('_', ' ')}
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
