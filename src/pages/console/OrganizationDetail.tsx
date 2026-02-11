import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, FileText, Key, Coins, Search, Filter, X, Loader2, Plus, Eye, EyeOff, MoreHorizontal, Ban } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Checkbox,
  Label,
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
import { SessionsTable } from '@/components/sessions';
import { useOrgDetail, useSessions } from '@/hooks';
import { getBackendStatesForStatus } from '@/lib/state-mapper';
import { createOrgUser, getOrgModules, createApiKey, revokeApiKey, addOrgCredits, type OrgModule, type AddCreditsPayload } from '@/services/org-api';
import { CreditsOverview, TopUpHistoryTable, PricingTable, UsageBreakdownTable } from '@/components/billing';
import { OrgSettingsForm } from '@/components/settings';
import { format } from 'date-fns';
import { formatNumber } from '@/lib/utils';
import type { ContractStatus } from '@/types';
import type { SessionListParams } from '@/services/sessions-api';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

type SortField = 'created_at' | 'updated_at' | 'state' | 'org_name';

const statusOptions: { value: ContractStatus; label: string }[] = [
  { value: 'CREATED', label: 'Created' },
  { value: 'SIGNED', label: 'Signed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ABANDONED', label: 'Abandoned' },
  { value: 'EXPIRED', label: 'Expired' },
];

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { org, users, tokens, tokenCount, balance, topUps, isLoading, error } = useOrgDetail(id);

  // Sessions tab state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ContractStatus[]>([]);

  const backendStates = selectedStatuses.flatMap(getBackendStatesForStatus);

  const sessionParams: SessionListParams = {
    page,
    page_size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...(appliedSearch && { search: appliedSearch }),
    ...(backendStates.length > 0 && { status: backendStates }),
    ...(id && { org_id: id }),
  };

  const { sessions, pagination, isLoading: sessionsLoading } = useSessions(sessionParams);

  const handleSort = useCallback((field: SortField) => {
    if (field === sortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  }, [sortBy]);

  const handleSearchSubmit = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleStatusToggle = (status: ContractStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const activeFilterCount =
    selectedStatuses.length + (appliedSearch ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setSelectedStatuses([]);
    setPage(1);
  };

  // Invite user state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const passwordValid = PASSWORD_REGEX.test(inviteForm.password);
  const passwordsMatch = inviteForm.password === inviteForm.confirmPassword;
  const inviteFormValid =
    inviteForm.username.trim() !== '' &&
    inviteForm.email.trim() !== '' &&
    inviteForm.phone.trim() !== '' &&
    passwordValid &&
    passwordsMatch;

  const resetInviteForm = () => {
    setInviteForm({ username: '', email: '', phone: '', password: '', confirmPassword: '' });
    setInviteError(null);
    setShowPassword(false);
    setShowConfirm(false);
  };

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
    if (id) {
      setModulesLoading(true);
      try {
        const res = await getOrgModules(id);
        setOrgModules(res.modules);
      } catch {
        setOrgModules([]);
      } finally {
        setModulesLoading(false);
      }
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const handleApiKeySubmit = async () => {
    if (!id || !apiKeyFormValid) return;
    setApiKeyLoading(true);
    setApiKeyError(null);
    try {
      await createApiKey({
        name: apiKeyForm.name,
        orgId: id,
        modules: selectedModules,
        rateLimit: Number(apiKeyForm.rateLimit),
        status: 'active',
      });
      setApiKeyOpen(false);
      window.location.reload();
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
      window.location.reload();
    } catch {
      // silently fail — user can retry
    } finally {
      setRevokingId(null);
    }
  };

  // Add Credits state
  const [addCreditsOpen, setAddCreditsOpen] = useState(false);
  const [addCreditsForm, setAddCreditsForm] = useState({ credit_amount: '', invoice_id: '', description: '' });
  const [addCreditsLoading, setAddCreditsLoading] = useState(false);
  const [addCreditsError, setAddCreditsError] = useState<string | null>(null);

  const resetAddCreditsForm = () => {
    setAddCreditsForm({ credit_amount: '', invoice_id: '', description: '' });
    setAddCreditsError(null);
  };

  const handleAddCredits = async () => {
    if (!id || !addCreditsForm.credit_amount || !addCreditsForm.invoice_id.trim()) return;
    setAddCreditsLoading(true);
    setAddCreditsError(null);
    try {
      const payload: AddCreditsPayload = {
        credit_amount: Number(addCreditsForm.credit_amount),
        invoice_id: addCreditsForm.invoice_id.trim(),
        ...(addCreditsForm.description.trim() && { description: addCreditsForm.description.trim() }),
      };
      await addOrgCredits(id, payload);
      setAddCreditsOpen(false);
      resetAddCreditsForm();
      window.location.reload();
    } catch (err) {
      setAddCreditsError(err instanceof Error ? err.message : 'Failed to add credits');
    } finally {
      setAddCreditsLoading(false);
    }
  };

  const handleInviteSubmit = async () => {
    if (!id || !inviteFormValid) return;
    setInviteLoading(true);
    setInviteError(null);
    try {
      await createOrgUser({
        orgId: id,
        username: inviteForm.username,
        email: inviteForm.email,
        phone: inviteForm.phone,
        password: inviteForm.password,
      });
      setInviteOpen(false);
      resetInviteForm();
      // Reload the page data to show the new user
      window.location.reload();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setInviteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error?.message || 'Organization not found'}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/console/organizations')}
        >
          Back to Organizations
        </Button>
      </div>
    );
  }

  // Session count from the actual sessions API (source of truth)
  const totalSessions = pagination?.total_items ?? null;
  const creditsAvailable = balance?.totalCreditsAvailable != null
    ? parseFloat(balance.totalCreditsAvailable)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Org Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-muted rounded-xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{org.company_name}</h2>
                  {org.sandbox_mode && (
                    <Badge variant="secondary">Sandbox</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground capitalize">{org.org_type}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {org.city && org.country_name ? `${org.city}, ${org.country_name}` : ''}{org.created_at ? ` · Member since ${format(new Date(org.created_at), 'MMMM yyyy')}` : ''}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-8 text-center">
              <div>
                <FileText className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="text-2xl font-bold mt-1">{totalSessions != null ? formatNumber(totalSessions) : '—'}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div>
                <Users className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="text-2xl font-bold mt-1">{users.length}</p>
                <p className="text-xs text-muted-foreground">Users</p>
              </div>
              <div>
                <Key className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="text-2xl font-bold mt-1">{tokenCount}</p>
                <p className="text-xs text-muted-foreground">API Keys</p>
              </div>
              <div>
                <Coins className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="text-2xl font-bold mt-1">{creditsAvailable != null ? formatNumber(creditsAvailable) : '—'}</p>
                <p className="text-xs text-muted-foreground">Credits</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">
            Sessions {totalSessions != null ? `(${totalSessions})` : ''}
          </TabsTrigger>
          <TabsTrigger value="users">
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            API Keys ({tokenCount})
          </TabsTrigger>
          <TabsTrigger value="billing">
            Billing
          </TabsTrigger>
          <TabsTrigger value="settings">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or signer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="pl-9"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status
                  {selectedStatuses.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5">
                      {selectedStatuses.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="start">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Filter by status</p>
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`org-${option.value}`}
                        checked={selectedStatuses.includes(option.value)}
                        onCheckedChange={() => handleStatusToggle(option.value)}
                      />
                      <Label htmlFor={`org-${option.value}`} className="text-sm cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {activeFilterCount > 0 && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>

          <SessionsTable
            sessions={sessions}
            pagination={pagination}
            isLoading={sessionsLoading}
            basePath="/console"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{users.length} user{users.length !== 1 ? 's' : ''}</p>
            <Button onClick={() => { resetInviteForm(); setInviteOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Invite User
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left font-medium px-4 py-3">Name</th>
                      <th className="text-left font-medium px-4 py-3">Email</th>
                      <th className="text-left font-medium px-4 py-3">Phone</th>
                      <th className="text-left font-medium px-4 py-3">Role</th>
                      <th className="text-left font-medium px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                          <td className="px-4 py-3 text-muted-foreground">{user.phone_number || '—'}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">{user.role?.role_name ?? '—'}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={user.active ? 'default' : 'secondary'}>
                              {user.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Invite User Dialog */}
          <Dialog open={inviteOpen} onOpenChange={(open) => { if (!open) resetInviteForm(); setInviteOpen(open); }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="invite-username">Username</Label>
                  <Input
                    id="invite-username"
                    placeholder="Enter username"
                    value={inviteForm.username}
                    onChange={(e) => setInviteForm((f) => ({ ...f, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-phone">Phone Number</Label>
                  <Input
                    id="invite-phone"
                    placeholder="Enter phone number"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="invite-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={inviteForm.password}
                      onChange={(e) => setInviteForm((f) => ({ ...f, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {inviteForm.password && !passwordValid && (
                    <p className="text-xs text-destructive">
                      Must be 8+ characters with 1 uppercase, 1 number, and 1 special character.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="invite-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={inviteForm.confirmPassword}
                      onChange={(e) => setInviteForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {inviteForm.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-destructive">Passwords do not match.</p>
                  )}
                </div>
                {inviteError && (
                  <p className="text-sm text-destructive">{inviteError}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { resetInviteForm(); setInviteOpen(false); }}>
                  Cancel
                </Button>
                <Button onClick={handleInviteSubmit} disabled={!inviteFormValid || inviteLoading}>
                  {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="mt-6 space-y-4">
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
                              {token.created ? format(new Date(token.created), 'MMM d, yyyy') : '—'}
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
                    <p className="text-sm text-muted-foreground py-2">No modules available for this organization.</p>
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
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          {balance ? (
            <>
              {/* Credits Overview */}
              <CreditsOverview balance={balance} />

              {/* Pricing + Usage Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {balance.prices && balance.prices.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PricingTable prices={balance.prices} />
                    </CardContent>
                  </Card>
                )}
                {balance.creditUsed && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Usage by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UsageBreakdownTable creditUsed={balance.creditUsed} />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Top-Up History + Add Credits */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Top-Up History</CardTitle>
                  <Button onClick={() => { resetAddCreditsForm(); setAddCreditsOpen(true); }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Credits
                  </Button>
                </CardHeader>
                <CardContent>
                  <TopUpHistoryTable topUps={topUps} />
                </CardContent>
              </Card>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Billing information not available
            </p>
          )}

          {/* Add Credits Dialog */}
          <Dialog open={addCreditsOpen} onOpenChange={setAddCreditsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Credits</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="credit-amount">Credit Amount *</Label>
                  <Input
                    id="credit-amount"
                    type="number"
                    placeholder="e.g. 10000"
                    value={addCreditsForm.credit_amount}
                    onChange={(e) => setAddCreditsForm((f) => ({ ...f, credit_amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit-invoice">Invoice ID *</Label>
                  <Input
                    id="credit-invoice"
                    placeholder="e.g. INV-2026-001"
                    value={addCreditsForm.invoice_id}
                    onChange={(e) => setAddCreditsForm((f) => ({ ...f, invoice_id: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit-desc">Description</Label>
                  <Input
                    id="credit-desc"
                    placeholder="e.g. Annual top-up"
                    value={addCreditsForm.description}
                    onChange={(e) => setAddCreditsForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                {addCreditsError && (
                  <p className="text-sm text-destructive">{addCreditsError}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddCreditsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCredits}
                  disabled={!addCreditsForm.credit_amount || !addCreditsForm.invoice_id.trim() || addCreditsLoading}
                >
                  {addCreditsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Credits
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <div className="max-w-3xl">
            <OrgSettingsForm org={org} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
