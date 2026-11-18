'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Sparkles, Calendar, ArrowUpRight, Filter, Download, Info } from 'lucide-react';

const FORECAST_DATA = [
  { month: 'Apr', actual: 158, forecast: null, upper: null, lower: null },
  { month: 'May', actual: 164, forecast: null, upper: null, lower: null },
  { month: 'Jun', actual: 148, forecast: null, upper: null, lower: null },
  { month: 'Jul', actual: 172, forecast: null, upper: null, lower: null },
  { month: 'Aug', actual: 155, forecast: 155, upper: 155, lower: 155 },
  { month: 'Sep (P)', actual: null, forecast: 182, upper: 195, lower: 170 },
  { month: 'Oct (P)', actual: null, forecast: 198, upper: 215, lower: 180 },
  { month: 'Nov (P)', actual: null, forecast: 210, upper: 232, lower: 190 },
  { month: 'Dec (P)', actual: null, forecast: 195, upper: 220, lower: 172 },
];

const SKU_FORECASTS = [
  { sku: 'AMI-MOT-X200', name: 'Electric Motor X200', currentStock: 124, projectedDemand: 180, growth: '+18%', confidence: 92, risk: 'Low Risk' },
  { sku: 'AMI-MOT-X500', name: 'Electric Motor X500', currentStock: 67, projectedDemand: 85, growth: '+12%', confidence: 88, risk: 'Adequate' },
  { sku: 'AMI-PMP-P100', name: 'Industrial Pump P100', currentStock: 89, projectedDemand: 110, growth: '+24%', confidence: 85, risk: 'Order Soon' },
  { sku: 'AMI-RAW-COP', name: 'Copper Wire Coil', currentStock: 890, projectedDemand: 1400, growth: '+35%', confidence: 94, risk: 'Stockout Warning' },
];

export default function ForecastsPage() {
  const [selectedHorizon, setSelectedHorizon] = useState('4m');

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Predictive Demand & Production Forecasts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Machine-learning demand projections with confidence intervals, seasonal surge detection, and supply requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Download className="w-3.5 h-3.5" /> Export Forecast
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Q4 Projected Output</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">785 Units</p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-0.5 font-medium">
              <ArrowUpRight className="w-3 h-3" /> +16.2% vs Q3 Actual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Model Confidence</span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">91.4%</p>
            <p className="text-xs text-muted-foreground mt-1">Based on 3-year trailing data</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Critical Surge Alert</span>
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-amber-600">November</p>
            <p className="text-xs text-muted-foreground mt-1">Industrial Pump peak season</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Raw Material Delta</span>
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">+₹18.4L</p>
            <p className="text-xs text-muted-foreground mt-1">Additional procurement required</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Forecast Chart */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Demand Projection (Actuals vs AI Ensemble Forecast)</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Historical production (solid) and 4-month projected demand (dashed with 90% confidence band)</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] bg-primary/5 text-primary border-primary/20">
              Ensemble Model v4.2
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FORECAST_DATA}>
                <defs>
                  <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[120, 250]} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value: unknown, name?: unknown) => [
                    value ? `${value} units` : '—',
                    String(name) === 'actual' ? 'Actual Production' : String(name) === 'forecast' ? 'AI Projected Demand' : String(name ?? '')
                  ]}
                />
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#forecastBand)" name="Upper Confidence Band" />
                <Line type="monotone" dataKey="actual" stroke="#5b5fc7" strokeWidth={3} dot={{ r: 4 }} name="actual" />
                <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} name="forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SKU-level Demand Projections Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">SKU Demand Projections & Stockout Risk</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">Product SKU</TableHead>
                <TableHead className="text-xs font-semibold">Product Name</TableHead>
                <TableHead className="text-xs font-semibold text-right">Current Stock</TableHead>
                <TableHead className="text-xs font-semibold text-right">Projected Demand</TableHead>
                <TableHead className="text-xs font-semibold text-right">Growth Rate</TableHead>
                <TableHead className="text-xs font-semibold text-right">Confidence</TableHead>
                <TableHead className="text-xs font-semibold">Forecast Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SKU_FORECASTS.map(sku => (
                <TableRow key={sku.sku} className="hover:bg-accent/40">
                  <TableCell className="font-mono text-xs font-medium">{sku.sku}</TableCell>
                  <TableCell className="text-xs font-medium">{sku.name}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{sku.currentStock}</TableCell>
                  <TableCell className="text-xs text-right font-mono font-semibold">{sku.projectedDemand}</TableCell>
                  <TableCell className="text-xs text-right text-emerald-600 font-semibold">{sku.growth}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{sku.confidence}%</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        sku.risk.includes('Warning') ? 'bg-red-50 text-red-700 border-red-200' :
                        sku.risk.includes('Order') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {sku.risk}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
