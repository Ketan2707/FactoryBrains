'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MFG_AUDIT } from '@/lib/data/ai-demo';
import { ScrollText, SearchIcon, Download, Bot, User, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const filteredAudit = useMemo(() => {
    return MFG_AUDIT.filter(entry => {
      const matchSearch = entry.description.toLowerCase().includes(search.toLowerCase()) ||
        entry.userName.toLowerCase().includes(search.toLowerCase()) ||
        entry.module.toLowerCase().includes(search.toLowerCase()) ||
        entry.action.toLowerCase().includes(search.toLowerCase());
      const matchSource = sourceFilter === 'all' || (sourceFilter === 'ai' ? entry.aiRecommended : !entry.aiRecommended);
      return matchSearch && matchSource;
    });
  }, [search, sourceFilter]);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" /> Enterprise Compliance & Audit Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Immutable log of all user transactions, autonomous AI agent executions, approvals, and system state modifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Download className="w-3.5 h-3.5" /> Export Audit Log
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            variant={sourceFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-9"
            onClick={() => setSourceFilter('all')}
          >
            All Events ({MFG_AUDIT.length})
          </Button>
          <Button
            variant={sourceFilter === 'ai' ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-9 gap-1"
            onClick={() => setSourceFilter('ai')}
          >
            <Bot className="w-3.5 h-3.5 text-primary" /> AI Agent Actions
          </Button>
          <Button
            variant={sourceFilter === 'user' ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-9 gap-1"
            onClick={() => setSourceFilter('user')}
          >
            <User className="w-3.5 h-3.5" /> Human Actions
          </Button>
        </div>

        <div className="relative max-w-xs w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search audit trail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Audit Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold">Actor / Entity</TableHead>
                <TableHead className="text-xs font-semibold">Action</TableHead>
                <TableHead className="text-xs font-semibold">Module</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold">Confidence</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudit.map(entry => (
                <TableRow key={entry.id} className="hover:bg-accent/40">
                  <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      {entry.aiRecommended ? (
                        <Bot className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p>{entry.userName}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.userRole}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{entry.module}</TableCell>
                  <TableCell className="text-xs max-w-sm">
                    <p className="line-clamp-2">{entry.description}</p>
                  </TableCell>
                  <TableCell className="text-xs">
                    {entry.aiConfidence ? (
                      <span className="font-mono font-semibold text-primary text-[11px]">
                        {entry.aiConfidence}%
                      </span>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      Success
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
