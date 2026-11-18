'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MFG_MACHINES } from '@/lib/data/manufacturing-demo';
import { Cog, SearchIcon, AlertTriangle, Activity, Thermometer, Zap, Wrench, ShieldAlert, CheckCircle2, Clock, Plus } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; dot: string; badge: string }> = {
  running: { label: 'Running', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  idle: { label: 'Idle', dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-700 border-gray-200' },
  maintenance: { label: 'Maintenance', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  down: { label: 'Down', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200' },
};

export default function MachinesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMachines = useMemo(() => {
    return MFG_MACHINES.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.machineId.toLowerCase().includes(search.toLowerCase()) ||
        m.plant.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const total = MFG_MACHINES.length;
    const running = MFG_MACHINES.filter(m => m.status === 'running').length;
    const maintenance = MFG_MACHINES.filter(m => m.status === 'maintenance').length;
    const down = MFG_MACHINES.filter(m => m.status === 'down').length;
    const atRisk = MFG_MACHINES.filter(m => m.failureRisk > 70).length;
    const avgHealth = Math.round(MFG_MACHINES.reduce((sum, m) => sum + m.healthScore, 0) / total);
    return { total, running, maintenance, down, atRisk, avgHealth };
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Machine Fleet & Telemetry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time machine health, IoT sensor metrics, vibration analysis, and failure risk prediction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" /> Add Machine
          </Button>
        </div>
      </div>

      {/* Critical AI Prediction Alert */}
      <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-900">
              High Failure Risk Predicted: MCH-007 (Injection Molder IM-800)
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              AI sensor model detected 3.4x elevated vibration (4.1 mm/s) and overheating (68°C). Estimated failure in 3–6 days.
            </p>
          </div>
        </div>
        <Button size="sm" variant="destructive" className="shrink-0 text-xs h-8">
          Schedule Predictive Service
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Fleet Health</span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.avgHealth}%</p>
            <Progress value={stats.avgHealth} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Operational</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Cog className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.running} / {stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">{Math.round((stats.running / stats.total) * 100)}% uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">In Service / Down</span>
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{stats.maintenance + stats.down}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.down} offline, {stats.maintenance} in maintenance</p>
          </CardContent>
        </Card>

        <Card className={stats.atRisk > 0 ? 'border-red-200' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Predictive AI Risk</span>
              <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-red-600">{stats.atRisk} Machine{stats.atRisk > 1 ? 's' : ''}</p>
            <p className="text-xs text-muted-foreground mt-1">Vibration & temp anomalies</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">All Machines ({stats.total})</TabsTrigger>
            <TabsTrigger value="running" className="text-xs">Running ({stats.running})</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs">Maintenance ({stats.maintenance})</TabsTrigger>
            <TabsTrigger value="down" className="text-xs">Down ({stats.down})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-xs w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or plant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Machine Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map(machine => {
          const statusInfo = STATUS_MAP[machine.status] || STATUS_MAP.idle;
          return (
            <Card key={machine.id} className={`hover:border-primary/40 transition-all ${machine.failureRisk > 70 ? 'border-red-200' : ''}`}>
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                      <span className="font-mono text-xs font-semibold">{machine.machineId}</span>
                      <Badge variant="outline" className={`text-[10px] py-0 ${statusInfo.badge}`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm mt-1 truncate">{machine.name}</h3>
                    <p className="text-xs text-muted-foreground">{machine.plant} · {machine.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold">{machine.healthScore}</span>
                    <span className="text-[10px] text-muted-foreground block">Health Score</span>
                  </div>
                </div>

                {/* Health & Risk Meters */}
                <div className="space-y-2 pt-2 border-t text-xs">
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Utilization</span>
                      <span className="font-medium text-foreground">{machine.utilization}%</span>
                    </div>
                    <Progress value={machine.utilization} className="h-1.5" />
                  </div>

                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Failure Risk</span>
                      <span className={`font-semibold ${machine.failureRisk > 70 ? 'text-red-600' : machine.failureRisk > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {machine.failureRisk}%
                      </span>
                    </div>
                    <Progress
                      value={machine.failureRisk}
                      className={`h-1.5 ${machine.failureRisk > 70 ? '[&>div]:bg-red-500' : ''}`}
                    />
                  </div>
                </div>

                {/* Telemetry Sensor Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center text-xs">
                  <div className="p-1.5 rounded-md bg-muted/60">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px]">
                      <Thermometer className="w-3 h-3" /> Temp
                    </div>
                    <p className={`font-semibold mt-0.5 ${(machine.temperature ?? 0) > 60 ? 'text-red-600 font-bold' : ''}`}>
                      {machine.temperature ?? 0}°C
                    </p>
                  </div>

                  <div className="p-1.5 rounded-md bg-muted/60">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px]">
                      <Activity className="w-3 h-3" /> Vibration
                    </div>
                    <p className={`font-semibold mt-0.5 ${(machine.vibration ?? 0) > 3.0 ? 'text-red-600 font-bold' : ''}`}>
                      {machine.vibration ?? 0} mm/s
                    </p>
                  </div>

                  <div className="p-1.5 rounded-md bg-muted/60">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px]">
                      <Zap className="w-3 h-3" /> Current
                    </div>
                    <p className="font-semibold mt-0.5">
                      {machine.current} A
                    </p>
                  </div>
                </div>

                {/* Footer / Predictive note */}
                {machine.predictedMaintenance && (
                  <div className="p-2 rounded bg-amber-50 text-amber-800 text-[11px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Predictive Service: <strong>{machine.predictedMaintenance}</strong></span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
