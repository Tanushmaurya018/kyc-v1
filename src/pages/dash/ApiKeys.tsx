import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, MoreHorizontal, Ban } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Label,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui';
import {
  getOrgTokens,
  getOrgModules,
  createApiKey,
  revokeApiKey,
  type OrgToken,
  type OrgModule,
} from '@/services/org-api';
import { orgId } from '@/lib/auth';

export default function ApiKeysPage() {
  const [tokens, setTokens] = useState<OrgToken[]>([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!orgId) return;
      const res = await getOrgTokens(orgId);
      setTokens(res.tokens);
      setTokenCount(res.totalCount);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  // Create API Key state
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [apiKeyForm, setApiKeyForm] = useState({ name: '', rateLimit: '1000' });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [orgModules, setOrgModules] = useState<OrgModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const apiKeyFormValid =
    apiKeyForm.name.trim() !== '' &&
    selectedModules.length > 0 &&
    Number(apiKeyForm.rateLimit) > 0;

  const openApiKeyDialog = async () => {
    setApiKeyForm({ name: '', rateLimit: '1000' });
    setSelectedModules([]);
    setApiKeyError(null);
    setApiKeyOpen(true);
    setModulesLoading(true);
    try {
      if (!orgId) return;
      const res = await getOrgModules(orgId);
      setOrgModules(res.modules);
    } catch {
      setOrgModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const handleApiKeySubmit = async () => {
    if (!apiKeyFormValid) return;
    setApiKeyLoading(true);
    setApiKeyError(null);
    try {
      await createApiKey({
        name: apiKeyForm.name,
        orgId: orgId!,
        modules: selectedModules,
        rateLimit: Number(apiKeyForm.rateLimit),
        status: 'active',
      });
      setApiKeyOpen(false);
      fetchTokens();
    } catch (err) {
      setApiKeyError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setApiKeyLoading(false);
    }
  };

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevokeKey = async (tokenId: string) => {
    setRevokingId(tokenId);
    try {
      await revokeApiKey(tokenId);
      fetchTokens();
    } catch {
      // silently fail
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tokenCount} key{tokenCount !== 1 ? 's' : ''}</p>
        <Button onClick={openApiKeyDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Create API Key
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left font-medium px-4 py-3">ID</th>
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Modules</th>
                  <th className="text-left font-medium px-4 py-3">Created</th>
                  <th className="text-left font-medium px-4 py-3">Creator</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No API keys found
                    </td>
                  </tr>
                ) : (
                  tokens.map((token) => {
                    const modules = token.modules ?? [];
                    const maxVisible = 2;
                    const visible = modules.slice(0, maxVisible);
                    const remaining = modules.length - maxVisible;

                    return (
                      <tr key={token.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-muted-foreground">{token.id}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">{token.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant={token.status === 'active' ? 'default' : 'secondary'}>
                            {token.status ?? '—'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {visible.map((m) => (
                              <Badge key={m} variant="outline" className="text-xs">
                                {m}
                              </Badge>
                            ))}
                            {remaining > 0 && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                +{remaining} more
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {token.created ? new Date(token.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{token.creator ?? '—'}</td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                {revokingId === token.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                disabled={token.status !== 'active' || revokingId === token.id}
                                onClick={() => handleRevokeKey(token.id)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Revoke Key
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={apiKeyOpen} onOpenChange={setApiKeyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="apikey-name">Name</Label>
              <Input
                id="apikey-name"
                placeholder="e.g. Production Key"
                value={apiKeyForm.name}
                onChange={(e) => setApiKeyForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apikey-rate">Rate Limit</Label>
              <Input
                id="apikey-rate"
                type="number"
                placeholder="1000"
                value={apiKeyForm.rateLimit}
                onChange={(e) => setApiKeyForm((f) => ({ ...f, rateLimit: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Modules</Label>
              {modulesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading modules...
                </div>
              ) : orgModules.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No modules available.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-3 rounded-xl border p-3">
                  {orgModules.map((mod) => (
                    <div key={mod.id} className="flex items-start gap-2">
                      <Checkbox
                        id={`mod-${mod.id}`}
                        checked={selectedModules.includes(mod.id)}
                        onCheckedChange={() => handleModuleToggle(mod.id)}
                      />
                      <div className="grid gap-0.5 leading-none">
                        <Label htmlFor={`mod-${mod.id}`} className="text-sm cursor-pointer">
                          {mod.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {mod.description} · {mod.price} credit{mod.price !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {apiKeyError && (
              <p className="text-sm text-destructive">{apiKeyError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApiKeySubmit} disabled={!apiKeyFormValid || apiKeyLoading}>
              {apiKeyLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
