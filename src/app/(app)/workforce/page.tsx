'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MFG_EMPLOYEES } from '@/lib/data/manufacturing-demo';
import { HardHat, SearchIcon, Plus, Users, Clock, Factory, CheckCircle2, Eye } from 'lucide-react';

export default function WorkforcePage() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredStaff = useMemo(() => {
    return MFG_EMPLOYEES.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.role.toLowerCase().includes(search.toLowerCase()) ||
        emp.plant.toLowerCase().includes(search.toLowerCase()) ||
        emp.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchDept = departmentFilter === 'all' || emp.department === departmentFilter;
      return matchSearch && matchDept;
    });
  }, [search, departmentFilter]);

  const departments = Array.from(new Set(MFG_EMPLOYEES.map(e => e.department)));

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <HardHat className="w-5 h-5 text-primary" /> Workforce & Plant Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Plant floor staff, operator shifts, skill certifications, and line allocations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" /> Add Personnel
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Active Workforce</span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{MFG_EMPLOYEES.length} Staff</p>
            <p className="text-xs text-muted-foreground mt-1">Across 3 manufacturing plants</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Day Shift Roster</span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">
              {MFG_EMPLOYEES.filter(e => e.shift === 'Day').length} Operators
            </p>
            <p className="text-xs text-emerald-600 mt-1">100% Shift Attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Night Shift Roster</span>
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">
              {MFG_EMPLOYEES.filter(e => e.shift === 'Night').length} Operators
            </p>
            <p className="text-xs text-muted-foreground mt-1">Line 1 & 2 coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Skill Certifications</span>
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">24 Verified</p>
            <p className="text-xs text-muted-foreground mt-1">ISO 9001 & Six Sigma compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={departmentFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-8"
            onClick={() => setDepartmentFilter('all')}
          >
            All Departments
          </Button>
          {departments.map(dept => (
            <Button
              key={dept}
              variant={departmentFilter === dept ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-8"
              onClick={() => setDepartmentFilter(dept)}
            >
              {dept}
            </Button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Personnel Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold">Employee</TableHead>
                <TableHead className="text-xs font-semibold">Role & Department</TableHead>
                <TableHead className="text-xs font-semibold">Plant Assignment</TableHead>
                <TableHead className="text-xs font-semibold">Shift</TableHead>
                <TableHead className="text-xs font-semibold">Skill Badges</TableHead>
                <TableHead className="text-xs font-semibold">Contact</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map(emp => (
                <TableRow key={emp.id} className="hover:bg-accent/40 cursor-pointer">
                  <TableCell className="text-xs font-medium">
                    <div>
                      <p className="font-semibold">{emp.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{emp.employeeId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <p>{emp.role}</p>
                    <p className="text-[10px] text-muted-foreground">{emp.department}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{emp.plant}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {emp.shift} Shift
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {emp.skills.map(s => (
                        <Badge key={s} variant="secondary" className="text-[9px] py-0">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <p>{emp.email}</p>
                    <p className="text-[10px]">{emp.phone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      Active
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
