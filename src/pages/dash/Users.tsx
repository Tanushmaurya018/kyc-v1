import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui';
import { getOrgUsers, createOrgUser, type OrgUser } from '@/services/org-api';
import { orgId } from '@/lib/auth';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function UsersPage() {
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!orgId) return;
      const res = await getOrgUsers(orgId);
      setUsers(res.users);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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

  const handleInviteSubmit = async () => {
    if (!inviteFormValid) return;
    setInviteLoading(true);
    setInviteError(null);
    try {
      await createOrgUser({
        orgId: orgId!,
        username: inviteForm.username,
        email: inviteForm.email,
        phone: inviteForm.phone,
        password: inviteForm.password,
      });
      setInviteOpen(false);
      resetInviteForm();
      fetchUsers();
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

  return (
    <div className="space-y-6 animate-fade-in">
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
    </div>
  );
}
