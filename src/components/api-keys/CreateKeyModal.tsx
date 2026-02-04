import { useState } from 'react';
import { Copy, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Button, Input, Label, Checkbox } from '@/components/ui';
import { availablePermissions, type ApiKeyPermission, type ApiKeyEnvironment } from '@/types';

interface CreateKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    environment: ApiKeyEnvironment;
    permissions: ApiKeyPermission[];
  }) => void;
  createdKey?: string;
}

export function CreateKeyModal({ open, onOpenChange, onSubmit, createdKey }: CreateKeyModalProps) {
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<ApiKeyEnvironment>('TEST');
  const [permissions, setPermissions] = useState<ApiKeyPermission[]>(['sessions:create', 'sessions:read']);
  const [copied, setCopied] = useState(false);

  const handlePermissionToggle = (permission: ApiKeyPermission) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, environment, permissions });
  };

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName('');
    setEnvironment('TEST');
    setPermissions(['sessions:create', 'sessions:read']);
    setCopied(false);
    onOpenChange(false);
  };

  // Show created key
  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. You won't be able to see it again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Store this key securely. It will only be shown once.
              </p>
            </div>

            <div>
              <Label>Your API Key</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-3 bg-gray-100 font-mono text-sm break-all">
                  {createdKey}
                </code>
                <Button variant="outline" onClick={copyKey}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to integrate with Face Sign.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Key Name</Label>
            <Input
              id="name"
              placeholder="e.g., Production API Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="environment">Environment</Label>
            <Select value={environment} onValueChange={(v) => setEnvironment(v as ApiKeyEnvironment)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEST">Test</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {environment === 'TEST' 
                ? 'Use for development and testing' 
                : 'Use for production integrations'}
            </p>
          </div>

          <div>
            <Label>Permissions</Label>
            <div className="mt-2 space-y-3">
              {availablePermissions.map((perm) => (
                <div key={perm.value} className="flex items-start gap-3">
                  <Checkbox
                    id={perm.value}
                    checked={permissions.includes(perm.value)}
                    onCheckedChange={() => handlePermissionToggle(perm.value)}
                  />
                  <div>
                    <Label htmlFor={perm.value} className="cursor-pointer">
                      {perm.label}
                    </Label>
                    <p className="text-xs text-gray-500">{perm.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name || permissions.length === 0}>
              Create Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
