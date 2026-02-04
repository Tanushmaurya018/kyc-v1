import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductSwitcherProps {
  collapsed?: boolean;
}

export function ProductSwitcher({ collapsed }: ProductSwitcherProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-3 border-b border-gray-200",
      collapsed && "justify-center px-2"
    )}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-bold">
          FS
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">UAE KYC Platform</span>
            <span className="text-sm font-semibold">Face Sign</span>
          </div>
        )}
      </div>
      {!collapsed && (
        <button 
          className="ml-auto p-1.5 hover:bg-gray-100 transition-colors"
          title="Switch to UAE KYC"
        >
          <ArrowLeftRight className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}
