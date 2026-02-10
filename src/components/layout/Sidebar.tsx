import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Key,
  Users,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  KeyRound,
  LogOut,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductSwitcher } from './ProductSwitcher';
import {
  Avatar,
  AvatarFallback,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Separator,
} from '@/components/ui';
import { currentUser } from '@/data';
import { useOrganizations } from '@/hooks';
import { roleLabels } from '@/types/user';

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
      { label: 'Sessions', href: '/dash/sessions', icon: FileText },
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
      { label: 'Sessions', href: '/console/sessions', icon: FileText },
    ],
  },
];

export function Sidebar({ collapsed, onToggle, isConsole }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { orgs } = useOrganizations();
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
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <ProductSwitcher collapsed={collapsed} showToggle={!isConsole} />

      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((group) => (
          <div key={group.section} className="mb-6">
            {!collapsed && (
              <div className="px-4 mb-2">
                <span className="text-xs font-medium text-muted-foreground tracking-wider">
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
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
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

        {/* Organizations section (Console only) */}
        {isConsole && (
          <div className="mb-6">
            {!collapsed && (
              <div className="px-4 mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground tracking-wider">
                  ORGANIZATIONS
                </span>
                <button
                  onClick={() => navigate('/console/onboard-client')}
                  className="h-5 w-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent active:bg-sidebar-accent/80 transition-colors"
                  title="Onboard Client"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {/* Pinned Onboard Client button */}
            <div className="px-2 mb-1">
              <button
                onClick={() => navigate('/console/onboard-client')}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors w-full border border-dashed border-border text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 hover:border-transparent",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? "Onboard Client" : undefined}
              >
                <Plus className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Onboard Client</span>}
              </button>
            </div>
            <ul className="space-y-1 px-2">
              {orgs.map((org) => {
                const orgHref = `/console/organizations/${org.id}`;
                const orgActive = location.pathname === orgHref;
                const initials = org.company_name.split(' ').map(w => w[0]).join('').slice(0, 2);
                return (
                  <li key={org.id}>
                    <NavLink
                      to={orgHref}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors",
                        orgActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? org.company_name : undefined}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-md bg-muted flex items-center justify-center flex-shrink-0",
                        orgActive && "bg-foreground/10"
                      )}>
                        <span className="text-[10px] font-semibold text-muted-foreground">{initials}</span>
                      </div>
                      {!collapsed && (
                        <span className="truncate">{org.company_name}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className={cn(
        "border-t border-sidebar-border p-4",
        collapsed && "px-2"
      )}>
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 w-full rounded-xl px-2 py-1.5 hover:bg-sidebar-accent/50 transition-colors text-left",
              collapsed && "justify-center px-0"
            )}>
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{roleLabels[currentUser.role]}</p>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" sideOffset={8} className="w-64 p-0">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[currentUser.role]}</p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="p-1">
              <button
                onClick={() => alert('Update password dialog')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
              >
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                Update Password
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
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
