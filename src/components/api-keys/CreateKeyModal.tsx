import { useState } from 'react';
import { Copy, AlertTriangle, Key } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Button, Input, Label, Checkbox, Switch } from '@/components/ui';

// Stub data for available modules - in production, this would come from the organization's onboarding config
const AVAILABLE_MODULES = [
  { id: 'onboarding', name: 'Onboarding', description: 'New customer registration journey' },
  { id: 'rekyc', name: 'Re-KYC', description: 'Periodic identity reverification' },
  { id: 'authorise', name: 'Authorise', description: 'Transaction authorization service' },
  { id: 'one-to-many', name: 'One-to-Many', description: 'Face search in database' },
  { id: 'emirates-id', name: 'Emirates ID', description: 'Emirates ID validation' },
  { id: 'passport', name: 'Passport', description: 'Passport validation' },
  { id: 'person-detail', name: 'Person Detail', description: 'Person detail API' },
  { id: 'person-gov-photo', name: 'Person Gov Photo', description: 'Government photo API' },
  { id: 'digital-eid', name: 'Digital EID', description: 'Digital Emirates ID' },
  { id: 'face-compare', name: 'Face Compare', description: 'Face comparison API' },
];

interface CreateKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    modules: string[];
  }) => void;
  createdKey?: string;
}

export function CreateKeyModal({ open, onOpenChange, onSubmit, createdKey }: CreateKeyModalProps) {
  const [name, setName] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, modules: selectedModules });
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
    setSelectedModules([]);
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
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Store this key securely. It will only be shown once.
              </p>
            </div>

            <div>
              <Label>Your API Key</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-3 bg-muted rounded-xl font-mono text-sm break-all">
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to access our services. You will only be able to view the key once after creation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <Label htmlFor="name">API Key Name</Label>
            <Input
              id="name"
              placeholder="e.g. Production API Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Give your API key a descriptive name for easy identification.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Enabled Modules</Label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {selectedModules.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedModules.length === AVAILABLE_MODULES.length}
                    onCheckedChange={(checked) => {
                      setSelectedModules(checked ? AVAILABLE_MODULES.map(m => m.id) : []);
                    }}
                  />
                  <span className="text-sm font-medium">Select All</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((module) => (
                <label
                  key={module.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedModules.includes(module.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <Checkbox
                    id={module.id}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => handleModuleToggle(module.id)}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{module.name}</p>
                  </div>
                </label>
              ))}
            </div>
            {selectedModules.length === 0 && (
              <p className="text-xs text-destructive mt-2">
                Please select at least one module
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name || selectedModules.length === 0}>
              Create API Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
