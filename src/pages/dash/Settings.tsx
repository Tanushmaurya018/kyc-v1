import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { OrgSettingsForm } from '@/components/settings';
import { getOrgDetail, type OrgDetail } from '@/services/org-api';
import { orgId } from '@/lib/auth';

export default function SettingsPage() {
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        if (!orgId) return;
        const data = await getOrgDetail(orgId);
        if (!cancelled) setOrg(data);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Settings not available</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <OrgSettingsForm org={org} />
    </div>
  );
}
