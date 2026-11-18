'use client';

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitGraph, ShieldAlert, CheckCircle2, AlertTriangle, Layers, Factory, Cog, Users, Package, RefreshCw } from 'lucide-react';

// Custom Node Component
function CustomEntityNode({ data }: { data: any }) {
  const iconMap: Record<string, any> = {
    order: Package,
    product: Layers,
    machine: Cog,
    material: Package,
    worker: Users,
    plant: Factory,
  };
  const Icon = iconMap[data.type] || Factory;

  const borderColors: Record<string, string> = {
    critical: 'border-red-500 bg-red-50/90 text-red-950 ring-2 ring-red-400/50',
    warning: 'border-amber-500 bg-amber-50/90 text-amber-950 ring-2 ring-amber-400/50',
    healthy: 'border-emerald-400 bg-emerald-50/80 text-emerald-950',
    neutral: 'border-border bg-card text-card-foreground',
  };

  const statusBadges: Record<string, { label: string; class: string }> = {
    critical: { label: data.statusLabel || 'Critical Risk', class: 'bg-red-200 text-red-800' },
    warning: { label: data.statusLabel || 'Warning', class: 'bg-amber-200 text-amber-800' },
    healthy: { label: data.statusLabel || 'Healthy', class: 'bg-emerald-200 text-emerald-800' },
    neutral: { label: data.statusLabel || 'Normal', class: 'bg-muted text-muted-foreground' },
  };

  const currentBadge = statusBadges[data.riskLevel || 'neutral'];

  return (
    <div className={`p-3 rounded-xl border shadow-md min-w-44 max-w-56 text-xs transition-all ${borderColors[data.riskLevel || 'neutral']}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-primary" />
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 font-medium">
          <div className="p-1 rounded bg-background/80 shadow-xs">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">{data.title}</span>
        </div>
      </div>
      <p className="text-[11px] opacity-80 line-clamp-1">{data.subtitle}</p>
      {data.metric && (
        <p className="text-[10px] font-mono font-semibold mt-1">
          {data.metric}
        </p>
      )}
      <div className="mt-2 pt-1.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-wider opacity-70 font-semibold">{data.type}</span>
        <Badge variant="secondary" className={`text-[9px] py-0 px-1.5 ${currentBadge.class}`}>
          {currentBadge.label}
        </Badge>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary" />
    </div>
  );
}

const nodeTypes = {
  customEntity: CustomEntityNode,
};

const initialNodes: Node[] = [
  // Top level: Sales Orders
  {
    id: 'order_1',
    type: 'customEntity',
    position: { x: 100, y: 30 },
    data: {
      type: 'order',
      title: 'SO-2026-0482',
      subtitle: 'Tata Power Solutions',
      metric: '50 units · ₹10.6L',
      riskLevel: 'warning',
      statusLabel: '67% Delivery Risk',
    },
  },
  {
    id: 'order_2',
    type: 'customEntity',
    position: { x: 450, y: 30 },
    data: {
      type: 'order',
      title: 'SO-2026-0481',
      subtitle: 'Reliance Industries',
      metric: '20 units · ₹8.6L',
      riskLevel: 'healthy',
      statusLabel: 'On Schedule',
    },
  },

  // Level 2: Finished Products
  {
    id: 'prod_1',
    type: 'customEntity',
    position: { x: 100, y: 180 },
    data: {
      type: 'product',
      title: 'Electric Motor X200',
      subtitle: 'PRD-2026-0891 (42/50)',
      metric: 'Lead Time: 5 days',
      riskLevel: 'warning',
      statusLabel: '8 units behind',
    },
  },
  {
    id: 'prod_2',
    type: 'customEntity',
    position: { x: 450, y: 180 },
    data: {
      type: 'product',
      title: 'Electric Motor X500',
      subtitle: 'PRD-2026-0890 (25/25)',
      metric: 'Lead Time: 8 days',
      riskLevel: 'healthy',
      statusLabel: 'Completed',
    },
  },

  // Level 3: Machines & Lines
  {
    id: 'mch_1',
    type: 'customEntity',
    position: { x: 0, y: 340 },
    data: {
      type: 'machine',
      title: 'MCH-001 (CNC Lathe)',
      subtitle: 'Line 1 · Chandigarh',
      metric: 'Health: 94% · Util: 87%',
      riskLevel: 'healthy',
      statusLabel: 'Running',
    },
  },
  {
    id: 'mch_7',
    type: 'customEntity',
    position: { x: 220, y: 340 },
    data: {
      type: 'machine',
      title: 'MCH-007 (Injection Molder)',
      subtitle: 'Line 4 · Pune Plant',
      metric: 'Vibration: 4.1 mm/s',
      riskLevel: 'critical',
      statusLabel: '82% Failure Risk',
    },
  },
  {
    id: 'worker_1',
    type: 'customEntity',
    position: { x: 450, y: 340 },
    data: {
      type: 'worker',
      title: 'Amit Kumar',
      subtitle: 'Production Manager',
      metric: 'Day Shift · Line 1',
      riskLevel: 'healthy',
      statusLabel: 'Active',
    },
  },

  // Level 4: Raw Materials & Supply
  {
    id: 'mat_copper',
    type: 'customEntity',
    position: { x: 50, y: 500 },
    data: {
      type: 'material',
      title: 'Copper Wire Coil',
      subtitle: 'Bharat Copper Corp',
      metric: 'Stock: 890 kg (9 days left)',
      riskLevel: 'critical',
      statusLabel: 'Stockout Risk',
    },
  },
  {
    id: 'mat_steel',
    type: 'customEntity',
    position: { x: 280, y: 500 },
    data: {
      type: 'material',
      title: 'Steel Sheet (Grade A)',
      subtitle: 'MetalPro Alloys',
      metric: 'Stock: 4,200 kg (28 days)',
      riskLevel: 'healthy',
      statusLabel: 'Optimal Stock',
    },
  },
  {
    id: 'mat_bearing',
    type: 'customEntity',
    position: { x: 500, y: 500 },
    data: {
      type: 'material',
      title: 'Precision Bearing 6204',
      subtitle: 'Precision Parts Ltd',
      metric: 'Stock: 560 pcs (21 days)',
      riskLevel: 'healthy',
      statusLabel: 'In Stock',
    },
  },
];

const initialEdges: Edge[] = [
  // Orders to Products
  { id: 'e_o1_p1', source: 'order_1', target: 'prod_1', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  { id: 'e_o2_p2', source: 'order_2', target: 'prod_2', style: { stroke: '#10b981', strokeWidth: 2 } },

  // Products to Machines / Operators
  { id: 'e_p1_m1', source: 'prod_1', target: 'mch_1', style: { stroke: '#6b7280', strokeWidth: 1.5 } },
  { id: 'e_p1_m7', source: 'prod_1', target: 'mch_7', animated: true, style: { stroke: '#ef4444', strokeWidth: 2.5 } },
  { id: 'e_p1_w1', source: 'prod_1', target: 'worker_1', style: { stroke: '#6b7280', strokeWidth: 1.5 } },
  { id: 'e_p2_w1', source: 'prod_2', target: 'worker_1', style: { stroke: '#6b7280', strokeWidth: 1.5 } },

  // Machines / Products to Raw Materials
  { id: 'e_m1_copper', source: 'mch_1', target: 'mat_copper', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e_m1_steel', source: 'mch_1', target: 'mat_steel', style: { stroke: '#6b7280', strokeWidth: 1.5 } },
  { id: 'e_m7_bearing', source: 'mch_7', target: 'mat_bearing', style: { stroke: '#6b7280', strokeWidth: 1.5 } },
];

export default function FactoryGraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(initialNodes[5]); // Default select MCH-007

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <GitGraph className="w-5 h-5 text-primary" /> FactoryGraph™ Digital Twin
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time entity relationship graph connecting Orders → Products → Machines → Operators → Supply Chain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
            2 Cascading Risks Detected
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Topology
          </Button>
        </div>
      </div>

      {/* Main Canvas & Detail Drawer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        <Card className="lg:col-span-3 overflow-hidden flex flex-col h-full border">
          <div className="flex-1 w-full h-full relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Background color="#cbd5e1" gap={16} />
              <Controls />
              <MiniMap
                nodeColor={(node: Node) => {
                  if (node.data?.riskLevel === 'critical') return '#ef4444';
                  if (node.data?.riskLevel === 'warning') return '#f59e0b';
                  return '#10b981';
                }}
                className="rounded-lg shadow-md border"
              />
            </ReactFlow>
          </div>

          {/* Legend */}
          <div className="p-3 bg-muted/40 border-t flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="font-medium text-muted-foreground">Entity Layers:</span>
              <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Order</span>
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Product</span>
              <span className="flex items-center gap-1"><Cog className="w-3.5 h-3.5" /> Machine</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Operator</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Bottleneck / Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Critical Failure Risk</span>
            </div>
          </div>
        </Card>

        {/* Node Inspector Side Panel */}
        <Card className="h-full flex flex-col justify-between overflow-auto">
          {selectedNode ? (
            <div className="p-4 space-y-4">
              <div className="border-b pb-3">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                  Entity Inspector
                </span>
                <h3 className="text-base font-semibold mt-1">{selectedNode.data.title as string}</h3>
                <p className="text-xs text-muted-foreground">{selectedNode.data.subtitle as string}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/50 space-y-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Telemetry / Metrics</span>
                  <p className="font-mono font-semibold text-sm">{selectedNode.data.metric as string}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      selectedNode.data.riskLevel === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                      selectedNode.data.riskLevel === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {selectedNode.data.statusLabel as string}
                  </Badge>
                </div>

                {selectedNode.data.riskLevel === 'critical' && (
                  <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-red-800">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Impact Propagation</span>
                    </div>
                    <p className="text-[11px] text-red-800 leading-relaxed">
                      Failure on this node propagates downstream to <strong>Order SO-2026-0482</strong> (Tata Power) resulting in an estimated <strong>₹4.2L</strong> delay penalty.
                    </p>
                    <Button size="sm" variant="destructive" className="w-full text-xs h-7 mt-1">
                      Trigger Mitigation Workflow
                    </Button>
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-medium text-muted-foreground">Connected Entities:</span>
                  <div className="space-y-1">
                    <div className="p-2 rounded border text-[11px] flex justify-between">
                      <span>Upstream: Electric Motor X200</span>
                      <span className="text-muted-foreground">Product</span>
                    </div>
                    <div className="p-2 rounded border text-[11px] flex justify-between">
                      <span>Downstream: Copper Wire Coil</span>
                      <span className="text-muted-foreground">Raw Material</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-xs my-auto">
              Select any node in the graph to inspect operational metrics and cascading risk pathways.
            </div>
          )}

          <div className="p-3 border-t bg-muted/20">
            <p className="text-[10px] text-muted-foreground text-center">
              Powered by FactoryBrain Graph Neural Network (GNN)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
