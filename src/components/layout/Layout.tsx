import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { getOrganizationById } from '@/data';
import { contracts } from '@/data';

export interface LayoutProps {
  mode?: 'dash' | 'console';
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

const pageConfig: Record<string, { title: string; description?: string }> = {
  '/dash': { title: 'Dashboard', description: 'Overview of your signing activity' },
  '/dash/contracts': { title: 'Contracts', description: 'Manage signing sessions' },
  '/dash/api-keys': { title: 'API Keys', description: 'Manage your API credentials' },
  '/dash/users': { title: 'Users', description: 'Manage team members' },
  '/dash/analytics': { title: 'Analytics', description: 'Insights and reports' },
  '/dash/billing': { title: 'Billing', description: 'Manage your subscription and invoices' },
  '/dash/settings': { title: 'Settings', description: 'Configure your organization' },
  '/console': { title: 'Console Dashboard', description: 'System-wide overview' },
  '/console/contracts': { title: 'All Contracts', description: 'View contracts across all organizations' },
  '/console/organizations': { title: 'Organizations', description: 'Manage registered organizations' },
  '/console/onboard-client': { title: 'Onboard Client', description: 'Register a new organization' },
  '/console/analytics': { title: 'Analytics', description: 'Aggregate insights and reports' },
};

function getPageInfo(pathname: string, isConsole: boolean): { title: string; description?: string } {
  // Check for org detail page: /console/organizations/:id
  const orgMatch = pathname.match(/^\/console\/organizations\/(.+)$/);
  if (orgMatch) {
    const org = getOrganizationById(orgMatch[1]);
    if (org) {
      return { title: org.name, description: `${org.industry} · ${org.status}` };
    }
    return { title: 'Organization', description: 'Organization details' };
  }

  const basePath = Object.keys(pageConfig).find(
    path => pathname === path || (path !== '/dash' && path !== '/console' && pathname.startsWith(path))
  ) || (isConsole ? '/console' : '/dash');

  return pageConfig[basePath] || { title: 'Face Sign' };
}

function getBreadcrumbs(pathname: string, isConsole: boolean): Breadcrumb[] {
  const root = isConsole ? '/console' : '/dash';
  const rootLabel = isConsole ? 'Console' : 'Dashboard';
  const crumbs: Breadcrumb[] = [{ label: rootLabel, href: root }];

  if (pathname === root) return crumbs;

  // /dash/contracts/:id or /console/contracts/:id
  const contractDetailMatch = pathname.match(/^\/(dash|console)\/contracts\/(.+)$/);
  if (contractDetailMatch) {
    const base = `/${contractDetailMatch[1]}`;
    const contractId = contractDetailMatch[2];
    const contract = contracts.find(c => c.id === contractId);
    crumbs.push({ label: 'Contracts', href: `${base}/contracts` });
    crumbs.push({ label: contract?.sessionId || contractId });
    return crumbs;
  }

  // /console/organizations/:id
  const orgDetailMatch = pathname.match(/^\/console\/organizations\/(.+)$/);
  if (orgDetailMatch) {
    const org = getOrganizationById(orgDetailMatch[1]);
    crumbs.push({ label: 'Organizations', href: '/console/organizations' });
    crumbs.push({ label: org?.name || 'Organization' });
    return crumbs;
  }

  // Static pages — find in pageConfig
  const config = pageConfig[pathname];
  if (config) {
    crumbs.push({ label: config.title });
    return crumbs;
  }

  return crumbs;
}

export function Layout({ mode = 'dash' }: LayoutProps) {
  const isConsole = mode === 'console';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');
  const location = useLocation();

  const { title, description } = getPageInfo(location.pathname, isConsole);
  const breadcrumbs = getBreadcrumbs(location.pathname, isConsole);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isConsole={isConsole}
      />
      
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          isConsole={isConsole}
          selectedOrgId={selectedOrgId}
          onOrgChange={setSelectedOrgId}
        />
        
        <main className="p-6">
          <Outlet context={{ selectedOrgId, setSelectedOrgId }} />
        </main>
      </div>
    </div>
  );
}
