import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button, Input, Label, Switch } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Separator } from '@/components/ui';
import type { OrgSettings } from '@/types';

interface OrgSettingsFormProps {
  settings: OrgSettings;
  onSave: (settings: OrgSettings) => void;
}

const timezones = [
  'Asia/Dubai',
  'Asia/Abu_Dhabi',
  'Asia/Riyadh',
  'Asia/Qatar',
  'Asia/Kuwait',
  'Asia/Bahrain',
  'UTC',
];

export function OrgSettingsForm({ settings, onSave }: OrgSettingsFormProps) {
  const [formData, setFormData] = useState<OrgSettings>(settings);
  const [webhookTesting, setWebhookTesting] = useState(false);

  const handleChange = <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const testWebhook = async () => {
    if (!formData.webhookUrl) return;
    setWebhookTesting(true);
    // Simulate webhook test
    await new Promise(resolve => setTimeout(resolve, 1500));
    setWebhookTesting(false);
    alert('Webhook test sent successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
          <CardDescription>Basic organization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={formData.orgName}
                onChange={(e) => handleChange('orgName', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(v) => handleChange('timezone', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Defaults</CardTitle>
          <CardDescription>Default settings for new signing sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTtl">Session TTL (hours)</Label>
              <Input
                id="sessionTtl"
                type="number"
                min={1}
                max={168}
                value={formData.sessionTtlHours}
                onChange={(e) => handleChange('sessionTtlHours', parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sessions expire after this duration
              </p>
            </div>
            <div>
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                min={1}
                max={100}
                value={formData.maxFileSizeMb}
                onChange={(e) => handleChange('maxFileSizeMb', parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum document size allowed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhooks</CardTitle>
          <CardDescription>Receive real-time notifications for session events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://your-server.com/webhooks/facesign"
                value={formData.webhookUrl || ''}
                onChange={(e) => handleChange('webhookUrl', e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={testWebhook}
                disabled={!formData.webhookUrl || webhookTesting}
              >
                {webhookTesting ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Notifications</CardTitle>
          <CardDescription>Configure email notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email notifications for session events</p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(v) => handleChange('emailNotifications', v)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notify on Completion</Label>
              <p className="text-sm text-muted-foreground">Send email when a contract is signed</p>
            </div>
            <Switch
              checked={formData.notifyOnComplete}
              onCheckedChange={(v) => handleChange('notifyOnComplete', v)}
              disabled={!formData.emailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notify on Rejection</Label>
              <p className="text-sm text-muted-foreground">Send email when KYC verification fails</p>
            </div>
            <Switch
              checked={formData.notifyOnReject}
              onCheckedChange={(v) => handleChange('notifyOnReject', v)}
              disabled={!formData.emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
