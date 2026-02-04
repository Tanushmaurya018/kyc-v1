import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Key, 
  Users, 
  BarChart3, 
  CreditCard, 
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductSwitcher } from './ProductSwitcher';
import { Avatar, AvatarFallback } from '@/components/ui';
import { currentUser } from '@/data';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isConsole?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const dashNavItems: { section: string; items: NavItem[] }[] = [
  {
    section: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/dash', icon: LayoutDashboard },
      { label: 'Contracts', href: '/dash/contracts', icon: FileText },
    ],
  },
  {
    section: 'MANAGE',
    items: [
      { label: 'API Keys', href: '/dash/api-keys', icon: Key },
      { label: 'Users', href: '/dash/users', icon: Users },
    ],
  },
  {
    section: 'INSIGHTS',
    items: [
      { label: 'Analytics', href: '/dash/analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'ACCOUNT',
    items: [
      { label: 'Billing', href: '/dash/billing', icon: CreditCard },
      { label: 'Settings', href: '/dash/settings', icon: Settings },
    ],
  },
];

const consoleNavItems: { section: string; items: NavItem[] }[] = [
  {
    section: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/console', icon: LayoutDashboard },
      { label: 'Contracts', href: '/console/contracts', icon: FileText },
      { label: 'Organizations', href: '/console/organizations', icon: Building2 },
    ],
  },
  {
    section: 'INSIGHTS',
    items: [
      { label: 'Analytics', href: '/console/analytics', icon: BarChart3 },
    ],
  },
];

export function Sidebar({ collapsed, onToggle, isConsole }: SidebarProps) {
  const location = useLocation();
  const navItems = isConsole ? consoleNavItems : dashNavItems;

  const isActive = (href: string) => {
    if (href === '/dash' || href === '/console') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <ProductSwitcher collapsed={collapsed} />
      
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((group) => (
          <div key={group.section} className="mb-6">
            {!collapsed && (
              <div className="px-4 mb-2">
                <span className="text-xs font-medium text-gray-400 tracking-wider">
                  {group.section}
                </span>
              </div>
            )}
            <ul className="space-y-1 px-2">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-gray-100 text-black font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className={cn(
        "border-t border-gray-200 p-4",
        collapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-black text-white text-xs">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
