import { Search, Bell } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui';
import { organizations } from '@/data';

interface HeaderProps {
  title: string;
  description?: string;
  isConsole?: boolean;
  selectedOrgId?: string;
  onOrgChange?: (orgId: string) => void;
}

export function Header({ 
  title, 
  description, 
  isConsole, 
  selectedOrgId, 
  onOrgChange 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Organization Selector (Console only) */}
          {isConsole && onOrgChange && (
            <Select value={selectedOrgId || 'all'} onValueChange={onOrgChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 w-[200px]"
            />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
