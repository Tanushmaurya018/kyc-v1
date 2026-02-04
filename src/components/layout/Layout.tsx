import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export interface LayoutProps {
  mode?: 'dash' | 'console';
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
  '/console/analytics': { title: 'Analytics', description: 'Aggregate insights and reports' },
};

export function Layout({ mode = 'dash' }: LayoutProps) {
  const isConsole = mode === 'console';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');
  const location = useLocation();

  const currentPath = location.pathname;
  const basePath = Object.keys(pageConfig).find(
    path => currentPath === path || (path !== '/dash' && path !== '/console' && currentPath.startsWith(path))
  ) || (isConsole ? '/console' : '/dash');
  
  const { title, description } = pageConfig[basePath] || { title: 'Face Sign' };

  return (
    <div className="min-h-screen bg-white">
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
