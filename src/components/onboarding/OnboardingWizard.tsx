import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import { 
  Building2, 
  Users, 
  Key, 
  Coins, 
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: OnboardingData) => void;
}

interface OnboardingData {
  organization: {
    name: string;
    industry: string;
    contactEmail: string;
    address: string;
    logo?: File;
  };
  rootUser: {
    name: string;
    email: string;
  };
  apiKeys: {
    createSandbox: boolean;
    createProduction: boolean;
    webhookUrl?: string;
  };
  credits: {
    initialCredits: number;
    reference: string;
  };
}

const STEPS = [
  { id: 'org', title: 'Organization', icon: Building2 },
  { id: 'user', title: 'Root User', icon: Users },
  { id: 'api', title: 'API Setup', icon: Key },
  { id: 'credits', title: 'Credits', icon: Coins },
  { id: 'review', title: 'Review', icon: Check },
];

export function OnboardingWizard({ open, onOpenChange, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    organization: {
      name: '',
      industry: '',
      contactEmail: '',
      address: '',
    },
    rootUser: {
      name: '',
      email: '',
    },
    apiKeys: {
      createSandbox: true,
      createProduction: false,
    },
    credits: {
      initialCredits: 1000,
      reference: '',
    },
  });

  const isLastStep = step === STEPS.length - 1;
  const isFirstStep = step === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(data);
      onOpenChange(false);
      resetForm();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setStep(s => s - 1);
    }
  };

  const resetForm = () => {
    setStep(0);
    setData({
      organization: {
        name: '',
        industry: '',
        contactEmail: '',
        address: '',
      },
      rootUser: {
        name: '',
        email: '',
      },
      apiKeys: {
        createSandbox: true,
        createProduction: false,
      },
      credits: {
        initialCredits: 1000,
        reference: '',
      },
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0: // Organization
        return data.organization.name && data.organization.industry && data.organization.contactEmail;
      case 1: // Root User
        return data.rootUser.name && data.rootUser.email;
      case 2: // API Setup
        return true;
      case 3: // Credits
        return data.credits.initialCredits > 0;
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Follow the steps below to onboard a new client organization.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4 py-6 border-b">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={s.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors",
                  isComplete ? "bg-black border-black text-white" :
                  isActive ? "border-black text-black" :
                  "border-gray-200 text-gray-400"
                )}>
                  {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-2",
                    i < step ? "bg-black" : "bg-gray-200"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="py-6 min-h-[300px]">
          {step === 0 && (
            <OrganizationStep 
              data={data.organization} 
              onChange={(org) => setData(d => ({ ...d, organization: org }))} 
            />
          )}
          {step === 1 && (
            <RootUserStep 
              data={data.rootUser} 
              onChange={(user) => setData(d => ({ ...d, rootUser: user }))} 
            />
          )}
          {step === 2 && (
            <ApiSetupStep 
              data={data.apiKeys} 
              onChange={(api) => setData(d => ({ ...d, apiKeys: api }))} 
            />
          )}
          {step === 3 && (
            <CreditsStep 
              data={data.credits} 
              onChange={(credits) => setData(d => ({ ...d, credits }))} 
            />
          )}
          {step === 4 && (
            <ReviewStep data={data} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {isLastStep ? 'Create Organization' : 'Continue'}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Step Components
function OrganizationStep({ 
  data, 
  onChange 
}: { 
  data: OnboardingData['organization']; 
  onChange: (data: OnboardingData['organization']) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="orgName">Organization Name *</Label>
        <Input
          id="orgName"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g., Abu Dhabi Digital Authority"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="industry">Industry *</Label>
        <Input
          id="industry"
          value={data.industry}
          onChange={(e) => onChange({ ...data, industry: e.target.value })}
          placeholder="e.g., Government, Healthcare, Finance"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="contactEmail">Contact Email *</Label>
        <Input
          id="contactEmail"
          type="email"
          value={data.contactEmail}
          onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
          placeholder="contact@organization.ae"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          placeholder="Organization address"
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <Label>Logo (optional)</Label>
        <div className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors cursor-pointer">
          <Upload className="h-6 w-6 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
        </div>
      </div>
    </div>
  );
}

function RootUserStep({ 
  data, 
  onChange 
}: { 
  data: OnboardingData['rootUser']; 
  onChange: (data: OnboardingData['rootUser']) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        The root user will have full administrative access to the organization and can invite other users.
      </p>
      <div>
        <Label htmlFor="userName">Full Name *</Label>
        <Input
          id="userName"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g., Ahmed Al Malik"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="userEmail">Email Address *</Label>
        <Input
          id="userEmail"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          placeholder="admin@organization.ae"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          An invitation will be sent to this email address.
        </p>
      </div>
    </div>
  );
}

function ApiSetupStep({ 
  data, 
  onChange 
}: { 
  data: OnboardingData['apiKeys']; 
  onChange: (data: OnboardingData['apiKeys']) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        Configure API access for the organization. Keys can be managed later.
      </p>
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={data.createSandbox}
            onChange={(e) => onChange({ ...data, createSandbox: e.target.checked })}
            className="rounded border-gray-300"
          />
          <div>
            <p className="font-medium">Create Sandbox API Key</p>
            <p className="text-sm text-gray-500">For testing and development</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={data.createProduction}
            onChange={(e) => onChange({ ...data, createProduction: e.target.checked })}
            className="rounded border-gray-300"
          />
          <div>
            <p className="font-medium">Create Production API Key</p>
            <p className="text-sm text-gray-500">For live document signing</p>
          </div>
        </label>
      </div>
      <div className="pt-4">
        <Label htmlFor="webhook">Webhook URL (optional)</Label>
        <Input
          id="webhook"
          value={data.webhookUrl || ''}
          onChange={(e) => onChange({ ...data, webhookUrl: e.target.value })}
          placeholder="https://api.organization.ae/webhooks/facesign"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Receive real-time notifications for signing events.
        </p>
      </div>
    </div>
  );
}

function CreditsStep({ 
  data, 
  onChange 
}: { 
  data: OnboardingData['credits']; 
  onChange: (data: OnboardingData['credits']) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        Add initial credits to the organization's account. 1 credit = 1 signed contract.
      </p>
      <div>
        <Label htmlFor="credits">Initial Credits *</Label>
        <Input
          id="credits"
          type="number"
          min="0"
          step="100"
          value={data.initialCredits}
          onChange={(e) => onChange({ ...data, initialCredits: parseInt(e.target.value) || 0 })}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Recommended: 1,000+ credits for new organizations.
        </p>
      </div>
      <div>
        <Label htmlFor="reference">Payment Reference</Label>
        <Input
          id="reference"
          value={data.reference}
          onChange={(e) => onChange({ ...data, reference: e.target.value })}
          placeholder="e.g., INV-2026-ORG-001"
          className="mt-1"
        />
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: OnboardingData }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        Review the details below and click "Create Organization" to complete setup.
      </p>
      
      <div className="border rounded-lg divide-y">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-500">Organization</h4>
          <p className="font-semibold mt-1">{data.organization.name}</p>
          <p className="text-sm text-gray-600">{data.organization.industry}</p>
          <p className="text-sm text-gray-600">{data.organization.contactEmail}</p>
        </div>
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-500">Root User</h4>
          <p className="font-semibold mt-1">{data.rootUser.name}</p>
          <p className="text-sm text-gray-600">{data.rootUser.email}</p>
        </div>
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-500">API Keys</h4>
          <div className="mt-1 space-x-2">
            {data.apiKeys.createSandbox && (
              <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
                Sandbox Key
              </span>
            )}
            {data.apiKeys.createProduction && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Production Key
              </span>
            )}
            {!data.apiKeys.createSandbox && !data.apiKeys.createProduction && (
              <span className="text-sm text-gray-500">No keys</span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-500">Initial Credits</h4>
          <p className="font-semibold mt-1">{data.credits.initialCredits.toLocaleString()} credits</p>
          {data.credits.reference && (
            <p className="text-sm text-gray-600">Ref: {data.credits.reference}</p>
          )}
        </div>
      </div>
    </div>
  );
}
