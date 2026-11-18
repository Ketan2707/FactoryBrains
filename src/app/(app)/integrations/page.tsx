'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plug, Database, Server, Cpu, RefreshCw, CheckCircle2, XCircle, ArrowUpRight, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationConnector {
  id: string;
  name: string;
  category: 'ERP' | 'IoT / SCADA' | 'Supply Chain' | 'Files';
  description: string;
  status: 'connected' | 'syncing' | 'disconnected';
  lastSync: string;
  recordsSynced: number;
  icon: string;
}

const INITIAL_CONNECTORS: IntegrationConnector[] = [
  {
    id: 'sap',
    name: 'SAP S/4HANA',
    category: 'ERP',
    description: 'Bi-directional sync of Purchase Orders, Master Data, BOMs, and GL Accounts.',
    status: 'connected',
    lastSync: '4 minutes ago',
    recordsSynced: 12450,
    icon: 'SAP',
  },
  {
    id: 'oracle',
    name: 'Oracle Cloud ERP',
    category: 'ERP',
    description: 'Supply chain management and procurement order synchronization.',
    status: 'disconnected',
    lastSync: 'Never',
    recordsSynced: 0,
    icon: 'Oracle',
  },
  {
    id: 'dynamics',
    name: 'Microsoft Dynamics 365',
    category: 'ERP',
    description: 'Financial ledger, customer accounts, and manufacturing work orders.',
    status: 'disconnected',
    lastSync: 'Never',
    recordsSynced: 0,
    icon: 'MSFT',
  },
  {
    id: 'mqtt',
    name: 'IoT MQTT Sensor Gateway',
    category: 'IoT / SCADA',
    description: 'Real-time high frequency vibration, temperature, and current machine telemetry.',
    status: 'connected',
    lastSync: 'Live (Real-time)',
    recordsSynced: 842000,
    icon: 'MQTT',
  },
  {
    id: 'scada',
    name: 'OPC-UA / SCADA Bridge',
    category: 'IoT / SCADA',
    description: 'PLC line controller status, machine cycle times, and automated fault codes.',
    status: 'connected',
    lastSync: 'Live (Real-time)',
    recordsSynced: 345000,
    icon: 'OPC',
  },
  {
    id: 'odoo',
    name: 'Odoo Enterprise',
    category: 'ERP',
    description: 'Inventory movements, sales quotations, and warehouse bin tracking.',
    status: 'disconnected',
    lastSync: 'Never',
    recordsSynced: 0,
    icon: 'Odoo',
  },
  {
    id: 'excel',
    name: 'Excel / CSV Pipeline',
    category: 'Files',
    description: 'Automated ingestion from Google Drive, SharePoint, or FTP batch uploads.',
    status: 'connected',
    lastSync: 'Today, 06:00 AM',
    recordsSynced: 4200,
    icon: 'CSV',
  },
];

export default function IntegrationsPage() {
  const [connectors, setConnectors] = useState(INITIAL_CONNECTORS);

  const handleToggleConnect = (id: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'connected' ? 'disconnected' : 'connected';
    setConnectors(prev => prev.map(c => c.id === id ? {
      ...c,
      status: nextStatus,
      lastSync: nextStatus === 'connected' ? 'Just now' : 'Never',
      recordsSynced: nextStatus === 'connected' ? 5200 : 0
    } : c));

    if (nextStatus === 'connected') {
      toast.success(`Connected to ${name}`, {
        description: 'Authentication token verified. Initial data sync completed.',
      });
    } else {
      toast(`Disconnected from ${name}`);
    }
  };

  const handleSyncAll = () => {
    toast.success('Syncing all active pipelines...', {
      description: 'SAP S/4HANA, MQTT Broker, and OPC-UA data streams refreshed.',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Plug className="w-5 h-5 text-primary" /> Enterprise Systems & IoT Integrations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect FactoryBrain to SAP, Oracle, Microsoft Dynamics, Odoo, SCADA, and IoT field telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={handleSyncAll}>
            <RefreshCw className="w-3.5 h-3.5" /> Sync Active Feeds
          </Button>
          <Button size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" /> Add Custom Connector
          </Button>
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map(conn => {
          const isConnected = conn.status === 'connected';
          return (
            <Card key={conn.id} className={`hover:border-primary/40 transition-all flex flex-col justify-between ${isConnected ? 'border-primary/20 bg-primary/5' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-card border shadow-2xs flex items-center justify-center font-bold text-xs font-mono text-primary">
                      {conn.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{conn.name}</CardTitle>
                      <Badge variant="secondary" className="text-[9px] mt-0.5">
                        {conn.category}
                      </Badge>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${
                      isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {conn.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {conn.description}
                </p>

                <div className="pt-3 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Last Sync: {conn.lastSync}</span>
                  {isConnected && (
                    <span className="font-mono text-emerald-600 font-medium">
                      {conn.recordsSynced.toLocaleString()} rows
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={isConnected ? 'outline' : 'default'}
                    size="sm"
                    className="w-full text-xs h-8"
                    onClick={() => handleToggleConnect(conn.id, conn.name, conn.status)}
                  >
                    {isConnected ? 'Disconnect' : 'Connect Pipeline'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
