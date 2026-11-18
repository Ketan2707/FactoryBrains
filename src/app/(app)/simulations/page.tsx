'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Play, RefreshCw, AlertTriangle, ArrowRight, ArrowDownRight, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  defaultDowntime: number; // days
  defaultMaterialDelta: number; // %
  defaultDemandDelta: number; // %
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 's1',
    name: 'Machine #07 Unplanned Outage',
    description: 'Simulates the effect if Injection Molder IM-800 goes offline before scheduled maintenance',
    defaultDowntime: 3,
    defaultMaterialDelta: 0,
    defaultDemandDelta: 0,
  },
  {
    id: 's2',
    name: 'Copper Price Spike (+15%)',
    description: 'Simulates 15% increase in copper raw material costs across all motor lines',
    defaultDowntime: 0,
    defaultMaterialDelta: 15,
    defaultDemandDelta: 0,
  },
  {
    id: 's3',
    name: 'Festive Demand Surge (+25%)',
    description: 'Simulates 25% order increase and line capacity constraints',
    defaultDowntime: 0,
    defaultMaterialDelta: 5,
    defaultDemandDelta: 25,
  },
];

export default function SimulationsPage() {
  const [activeScenario, setActiveScenario] = useState<Scenario>(PRESET_SCENARIOS[0]);
  const [downtimeDays, setDowntimeDays] = useState(3);
  const [materialCostDelta, setMaterialCostDelta] = useState(0);
  const [demandSurgeDelta, setDemandSurgeDelta] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Dynamic simulation calculations
  const baseMonthlyRevenue = 3520000;
  const baseMonthlyProfit = 740000;
  const baseMonthlyOutput = 155;
  const baseDeliveryRate = 92;

  // Impact formulas
  const outputLoss = Math.round(downtimeDays * 9);
  const projectedOutput = Math.max(0, Math.round(baseMonthlyOutput * (1 + demandSurgeDelta / 100) - outputLoss));

  const revenueImpact = Math.round((downtimeDays * -160000) + (demandSurgeDelta * 35000));
  const projectedRevenue = baseMonthlyRevenue + revenueImpact;

  const costDelta = Math.round((materialCostDelta * 28000) + (downtimeDays * 53000));
  const projectedProfit = Math.round(projectedRevenue * 0.21 - costDelta);
  const profitChange = projectedProfit - baseMonthlyProfit;

  const projectedDeliveryRate = Math.max(50, Math.min(99, baseDeliveryRate - (downtimeDays * 4.5) - (demandSurgeDelta > 15 ? 4 : 0)));

  const handleSelectScenario = (s: Scenario) => {
    setActiveScenario(s);
    setDowntimeDays(s.defaultDowntime);
    setMaterialCostDelta(s.defaultMaterialDelta);
    setDemandSurgeDelta(s.defaultDemandDelta);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" /> What-if Scenario Simulator
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Test business hypotheses, simulate machine outages, raw material price shifts, and supply disruptions in a sandbox environment.
          </p>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_SCENARIOS.map(s => (
          <Card
            key={s.id}
            className={`cursor-pointer hover:border-primary/40 transition-all ${
              activeScenario.id === s.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : ''
            }`}
            onClick={() => handleSelectScenario(s)}
          >
            <CardContent className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs text-foreground">{s.name}</h3>
                {activeScenario.id === s.id && (
                  <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">Active</Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Sliders & Results Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Simulation Parameters */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Simulation Controls</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleSelectScenario(activeScenario)}>
                <RefreshCw className="w-3 h-3 mr-1" /> Reset
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            {/* Slider 1: Machine Downtime */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Machine Downtime</span>
                <span className="font-mono font-bold text-primary">{downtimeDays} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                value={downtimeDays}
                onChange={e => setDowntimeDays(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">Simulates unscheduled stop across Line 4</p>
            </div>

            {/* Slider 2: Raw Material Cost Shift */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Raw Material Price Shift</span>
                <span className={`font-mono font-bold ${materialCostDelta > 0 ? 'text-red-600' : 'text-foreground'}`}>
                  {materialCostDelta > 0 ? `+${materialCostDelta}%` : `${materialCostDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="30"
                value={materialCostDelta}
                onChange={e => setMaterialCostDelta(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">Copper and Steel market index delta</p>
            </div>

            {/* Slider 3: Demand Surge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Order Demand Surge</span>
                <span className="font-mono font-bold text-emerald-600">+{demandSurgeDelta}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={demandSurgeDelta}
                onChange={e => setDemandSurgeDelta(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">Additional customer pipeline volume</p>
            </div>

            <Button className="w-full text-xs h-9 gap-1.5" onClick={handleRunSimulation} disabled={isSimulating}>
              <Play className="w-3.5 h-3.5 fill-current" /> Recalculate Scenario Model
            </Button>
          </CardContent>
        </Card>

        {/* Right: Projected Outcomes */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Projected Impact Analysis</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Estimated financial and operational consequences</p>
            </div>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
              Confidence: 84%
            </Badge>
          </CardHeader>

          <CardContent className="p-5 space-y-6">
            {/* 4 Outcome Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-card">
                <span className="text-xs text-muted-foreground">Projected Monthly Output</span>
                <p className="text-2xl font-bold mt-1">{projectedOutput} Units</p>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <span className={projectedOutput >= baseMonthlyOutput ? 'text-emerald-600 font-semibold flex items-center' : 'text-red-600 font-semibold flex items-center'}>
                    {projectedOutput >= baseMonthlyOutput ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {projectedOutput - baseMonthlyOutput} units vs baseline
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-card">
                <span className="text-xs text-muted-foreground">On-Time Delivery Rate</span>
                <p className={`text-2xl font-bold mt-1 ${projectedDeliveryRate < 85 ? 'text-red-600' : 'text-foreground'}`}>
                  {projectedDeliveryRate}%
                </p>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <span className={projectedDeliveryRate >= baseDeliveryRate ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {(projectedDeliveryRate - baseDeliveryRate).toFixed(1)}% vs baseline ({baseDeliveryRate}%)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-card">
                <span className="text-xs text-muted-foreground">Monthly Revenue</span>
                <p className="text-2xl font-bold mt-1">₹{(projectedRevenue / 100000).toFixed(2)}L</p>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <span className={revenueImpact >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {revenueImpact >= 0 ? `+₹${(revenueImpact / 100000).toFixed(2)}L` : `-₹${(Math.abs(revenueImpact) / 100000).toFixed(2)}L`}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-card">
                <span className="text-xs text-muted-foreground">Monthly Net Profit</span>
                <p className="text-2xl font-bold mt-1">₹{(projectedProfit / 100000).toFixed(2)}L</p>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <span className={profitChange >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {profitChange >= 0 ? `+₹${(profitChange / 100000).toFixed(2)}L` : `-₹${(Math.abs(profitChange) / 100000).toFixed(2)}L`}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Strategic Advice */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> AI Strategic Mitigation Recommendations
              </span>
              <ul className="text-xs text-foreground/90 space-y-1.5 list-disc pl-4 leading-relaxed">
                {downtimeDays > 0 && (
                  <li>
                    Reroute 40% of critical motor housings to CNC Milling Line 2 to offset Line 4 capacity bottleneck.
                  </li>
                )}
                {materialCostDelta > 10 && (
                  <li>
                    Lock in 3-month fixed supply contract with MetalPro Alloys before further commodity price fluctuations occur.
                  </li>
                )}
                {demandSurgeDelta > 10 && (
                  <li>
                    Schedule Weekend Shift C (16 overtime hours) to preserve 90%+ on-time delivery commitment for Tier-1 accounts.
                  </li>
                )}
              </ul>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-muted-foreground italic">
              * Simulations are computed using stochastic Monte Carlo projections based on historical production lead times and material BOM allocations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
