'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { useUIStore } from '@/lib/store/ui-store';
import { AICopilotDrawer } from '@/components/ai/ai-copilot-drawer';
import { AIBusinessEngine } from '@/lib/services/ai-business-engine';
import { getModulesForBusinessType, getModulesByGroup, MODULE_GROUPS } from '@/lib/types/modules';
import type { ModuleGroup } from '@/lib/types/modules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MFG_ALERTS, RETAIL_ALERTS } from '@/lib/data/ai-demo';
import { DEMO_ORGANIZATIONS } from '@/lib/data/demo-organizations';
import * as Icons from './icons';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { organization, userOrganizations, isOnboarded, setOrganization } = useOrganizationStore();
  const { sidebarCollapsed, toggleSidebar, copilotOpen, setCopilotOpen, commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    } else if (mounted && !isOnboarded) {
      router.replace('/onboarding');
    }
  }, [mounted, isAuthenticated, isOnboarded, router]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const modules = useMemo(() => {
    if (!organization) return [];
    return getModulesForBusinessType(organization.businessType, organization.enabledModules);
  }, [organization]);

  const groupedModules = useMemo(() => getModulesByGroup(modules), [modules]);

  const alerts = useMemo(() => {
    if (!organization) return [];
    return organization.businessType === 'manufacturing' ? MFG_ALERTS : RETAIL_ALERTS;
  }, [organization]);

  const unreadAlerts = alerts.filter(a => !a.read).length;

  if (!mounted || !isAuthenticated || !organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeModule = pathname.split('/')[1] || 'dashboard';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b shrink-0 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg fb-gradient-bg flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
          </svg>
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight truncate">FactoryBrain</p>
            <p className="text-[10px] text-muted-foreground truncate">{organization.name}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-4">
          {(Object.entries(groupedModules) as [ModuleGroup, typeof modules][]).map(([group, mods]) => {
            if (mods.length === 0) return null;
            const groupInfo = MODULE_GROUPS[group];
            return (
              <div key={group}>
                {group !== 'core' && !sidebarCollapsed && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                    {groupInfo.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {mods.map(mod => {
                    const isActive = activeModule === mod.route.replace('/', '');
                    const IconComponent = Icons.getIcon(mod.icon);
                    return (
                      <Tooltip key={mod.id}>
                        <TooltipTrigger
                          render={<Link
                            href={mod.route}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                          />}
                        >
                            <IconComponent className="w-4 h-4 shrink-0" />
                            {!sidebarCollapsed && <span className="truncate">{mod.label}</span>}
                        </TooltipTrigger>
                        {sidebarCollapsed && (
                          <TooltipContent side="right">
                            {mod.label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="border-t px-2 py-2 shrink-0">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {sidebarCollapsed ? (
            <Icons.ChevronsRight className="w-4 h-4" />
          ) : (
            <>
              <Icons.ChevronsLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r bg-sidebar shrink-0 transition-all duration-200 ${sidebarCollapsed ? 'w-14' : 'w-56'}`}>
        {renderSidebarContent()}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b bg-card flex items-center gap-2 px-4 shrink-0">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger
              className="md:hidden -ml-2 p-1.5 inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Icons.Menu className="w-4 h-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>

          {/* Search */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/50 text-muted-foreground text-xs hover:bg-muted transition-colors max-w-xs flex-1 md:flex-initial md:w-64"
          >
            <Icons.SearchIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline ml-auto text-[10px] bg-background border rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
          </button>

          <div className="flex-1" />

          {/* Org switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center rounded-md text-xs gap-1.5 h-8 px-2.5 bg-muted/40 hover:bg-accent hover:text-accent-foreground border"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate max-w-[130px] font-semibold">{organization.name}</span>
              <Icons.ChevronsUpDown className="w-3 h-3 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {userOrganizations && userOrganizations.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                    My Shops & Businesses
                  </DropdownMenuLabel>
                  {userOrganizations.map(org => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => setOrganization(org)}
                      className="text-xs cursor-pointer"
                    >
                      <span className="truncate flex-1 font-medium">{org.name}</span>
                      {organization.id === org.id && <Icons.Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuLabel className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                Demo Environments
              </DropdownMenuLabel>
              {Object.values(DEMO_ORGANIZATIONS).map(org => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => setOrganization(org)}
                  className="text-xs cursor-pointer"
                >
                  <span className="truncate flex-1">{org.name}</span>
                  {organization.id === org.id && <Icons.Check className="w-3.5 h-3.5 text-primary ml-auto" />}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/signup')} className="text-xs text-primary font-medium cursor-pointer">
                <Icons.Plus className="w-3.5 h-3.5 mr-1.5" /> + Register Another Shop
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="text-xs text-muted-foreground cursor-pointer">
                <Icons.Settings className="w-3.5 h-3.5 mr-1.5" /> Shop Profile & Outlets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-5 mx-1" />

          {/* AI button */}
          <Tooltip>
            <TooltipTrigger
              className="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
              onClick={() => setCopilotOpen(!copilotOpen)}
            >
              <Icons.Sparkles className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent>AI Copilot</TooltipContent>
          </Tooltip>

          {/* Alerts */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 relative hover:bg-accent hover:text-accent-foreground"
            >
              <Icons.Bell className="w-4 h-4" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[9px] font-medium text-white flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="text-xs flex items-center justify-between">
                Notifications
                <Badge variant="secondary" className="text-[10px]">{unreadAlerts} new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="max-h-80">
                {alerts.slice(0, 5).map(alert => (
                  <DropdownMenuItem key={alert.id} className="flex items-start gap-2 py-2.5 cursor-pointer" onClick={() => alert.actionRoute && router.push(alert.actionRoute)}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'warning' ? 'bg-amber-500' :
                      alert.severity === 'recommendation' ? 'bg-blue-500' :
                      alert.severity === 'approval' ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{alert.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{alert.message}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
                  <Badge variant="secondary" className="text-[9px] uppercase font-mono">
                    {user?.role ? user.role.replace('_', ' ') : 'Member'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')} className="text-xs cursor-pointer">
                <Icons.Settings className="w-3.5 h-3.5 mr-1.5" /> Shop & Staff Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/signup')} className="text-xs cursor-pointer">
                <Icons.Plus className="w-3.5 h-3.5 mr-1.5" /> Register New Shop
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-xs text-destructive cursor-pointer">
                <Icons.LogOut className="w-3.5 h-3.5 mr-1.5" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* AI Copilot Panel */}
      {copilotOpen && <AICopilotDrawer onClose={() => setCopilotOpen(false)} />}

      {/* Command Palette with Natural Language Search */}
      {commandPaletteOpen && (
        <CommandPalette
          modules={modules}
          organization={organization}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(route) => { router.push(route); setCommandPaletteOpen(false); }}
        />
      )}
    </div>
  );
}

// ─── Command Palette & Natural Language Search ───────────────

function CommandPalette({ 
  modules, 
  organization, 
  onClose, 
  onNavigate 
}: {
  modules: { id: string; label: string; route: string; icon: string }[];
  organization: any;
  onClose: () => void;
  onNavigate: (route: string) => void;
}) {
  const { getProducts, getSales, getPurchases, getCustomers, getSuppliers, getExpenses } = useShopDataStore();
  const [search, setSearch] = useState('');

  const orgId = organization?.id || 'default';
  const isCustom = organization?.isCustom || orgId.startsWith('org_custom_');
  const businessType = organization?.businessType || 'retail';

  const products = getProducts(orgId, businessType, isCustom);
  const sales = getSales(orgId, businessType, isCustom);
  const purchases = getPurchases(orgId, isCustom);
  const customers = getCustomers(orgId, isCustom);
  const suppliers = getSuppliers(orgId, isCustom);
  const expenses = getExpenses(orgId, isCustom);

  const engine = useMemo(() => {
    return new AIBusinessEngine(
      products,
      sales,
      purchases,
      customers,
      suppliers,
      expenses,
      organization
    );
  }, [products, sales, purchases, customers, suppliers, expenses, organization]);

  const naturalSearchResult = useMemo(() => {
    if (!search.trim() || search.length < 3) return null;
    return engine.parseSearchQuery(search);
  }, [search, engine]);

  const filtered = modules.filter(m =>
    m.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 animate-in fade-in duration-100" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
      <div className="relative bg-card border rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 px-4 py-3 border-b">
          <Icons.SearchIcon className="w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            placeholder="Search commands or type natural questions (e.g. 'products below 10 stock')..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-xs sm:text-sm bg-transparent outline-hidden placeholder:text-muted-foreground"
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && naturalSearchResult) {
                onNavigate(naturalSearchResult.route);
              }
            }}
          />
        </div>

        {/* AI Intent Suggestion Banner */}
        {naturalSearchResult && (
          <div 
            onClick={() => onNavigate(naturalSearchResult.route)}
            className="p-3 bg-primary/10 border-b flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors text-xs"
          >
            <div className="flex items-center gap-2">
              <Icons.Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">
                AI Intent Recognized: <span className="font-normal text-muted-foreground">{naturalSearchResult.message}</span>
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-background">Press Enter ↵</Badge>
          </div>
        )}

        <ScrollArea className="max-h-80">
          <div className="p-2.5 space-y-1">
            <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {search.trim() ? 'Matched Modules & Navigation' : 'Quick Navigation'}
            </p>
            {filtered.map(mod => {
              const Icon = Icons.getIcon(mod.icon);
              return (
                <button
                  key={mod.id}
                  onClick={() => onNavigate(mod.route)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs hover:bg-accent transition-colors text-left font-medium"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span>{mod.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{mod.route}</span>
                </button>
              );
            })}
            {filtered.length === 0 && !naturalSearchResult && (
              <p className="px-3 py-6 text-xs text-muted-foreground text-center">No results found.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
