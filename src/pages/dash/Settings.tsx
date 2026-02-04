import { OrgSettingsForm } from '@/components/settings';
import { currentOrganization } from '@/data';
import type { OrgSettings } from '@/types';

export default function SettingsPage() {
  const settings: OrgSettings = {
    orgName: currentOrganization.name,
    orgLogo: currentOrganization.logoUrl,
    timezone: currentOrganization.timezone,
    sessionTtlHours: currentOrganization.sessionTtlHours,
    maxFileSizeMb: currentOrganization.maxFileSizeMb,
    webhookUrl: currentOrganization.webhookUrl,
    emailNotifications: currentOrganization.emailNotifications,
    notifyOnComplete: currentOrganization.notifyOnComplete,
    notifyOnReject: currentOrganization.notifyOnReject,
  };

  const handleSave = (newSettings: OrgSettings) => {
    console.log('Saving settings:', newSettings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-3xl animate-fade-in">
      <OrgSettingsForm settings={settings} onSave={handleSave} />
    </div>
  );
}
