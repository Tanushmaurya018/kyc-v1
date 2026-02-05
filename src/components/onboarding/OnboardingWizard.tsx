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
  Switch,
  Checkbox,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { 
  Building2, 
  MapPin, 
  UserCog, 
  Check,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: OnboardingData) => void;
}

// Document types available
type DocumentType = 'emirates_id' | 'passport' | 'gcc';
type CaptureMethod = 'manual' | 'scan';
type ModuleType = 'onboarding' | 'card_details' | 'face_verification' | 'liveness' | 'document_scan';

interface DocumentConfig {
  type: DocumentType;
  captureMethod: CaptureMethod;
  enabled: boolean;
}

interface OnboardingData {
  // Step 1: Company Information
  company: {
    name: string;
    organizationType: string;
    email: string;
    phone: string;
    // Toggles
    sandboxMode: boolean;
    populationMigration: boolean;
    proactiveMonitoring: boolean;
    nfcVerification: boolean;
    // Document configuration
    documents: DocumentConfig[];
    // Selected modules
    modules: ModuleType[];
  };
  // Step 2: Address & Contact
  addressContact: {
    city: string;
    country: string;
    primaryContactName: string;
    primaryContactEmail: string;
    additionalInfo: string;
  };
  // Step 3: Root User
  rootUser: {
    username: string;
    email: string;
    phone: string;
    password: string;
  };
}

const STEPS = [
  { id: 'company', title: 'Company Information', icon: Building2 },
  { id: 'address', title: 'Address & Contact', icon: MapPin },
  { id: 'rootUser', title: 'Root User', icon: UserCog },
];

const ORGANIZATION_TYPES = [
  'Government',
  'Semi-Government',
  'Private',
  'Free Zone',
  'Financial Institution',
  'Healthcare',
  'Education',
  'Telecom',
  'Real Estate',
  'Other',
];

const COUNTRIES = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
];

const UAE_CITIES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];

const MODULES: { id: ModuleType; label: string; description: string }[] = [
  { id: 'onboarding', label: 'Onboarding', description: 'Customer onboarding flow' },
  { id: 'card_details', label: 'Card Details', description: 'Card information capture' },
  { id: 'face_verification', label: 'Face Verification', description: 'Facial recognition check' },
  { id: 'liveness', label: 'Liveness Detection', description: 'Anti-spoofing verification' },
  { id: 'document_scan', label: 'Document Scan', description: 'ID document scanning' },
];

const DOCUMENT_TYPES: { id: DocumentType; label: string }[] = [
  { id: 'emirates_id', label: 'Emirates ID' },
  { id: 'passport', label: 'Passport' },
  { id: 'gcc', label: 'GCC ID' },
];

export function OnboardingWizard({ open, onOpenChange, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    company: {
      name: '',
      organizationType: '',
      email: '',
      phone: '',
      sandboxMode: true,
      populationMigration: false,
      proactiveMonitoring: true,
      nfcVerification: false,
      documents: [
        { type: 'emirates_id', captureMethod: 'scan', enabled: true },
        { type: 'passport', captureMethod: 'scan', enabled: false },
        { type: 'gcc', captureMethod: 'manual', enabled: false },
      ],
      modules: ['onboarding', 'face_verification', 'liveness'],
    },
    addressContact: {
      city: '',
      country: 'United Arab Emirates',
      primaryContactName: '',
      primaryContactEmail: '',
      additionalInfo: '',
    },
    rootUser: {
      username: '',
      email: '',
      phone: '',
      password: '',
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
      company: {
        name: '',
        organizationType: '',
        email: '',
        phone: '',
        sandboxMode: true,
        populationMigration: false,
        proactiveMonitoring: true,
        nfcVerification: false,
        documents: [
          { type: 'emirates_id', captureMethod: 'scan', enabled: true },
          { type: 'passport', captureMethod: 'scan', enabled: false },
          { type: 'gcc', captureMethod: 'manual', enabled: false },
        ],
        modules: ['onboarding', 'face_verification', 'liveness'],
      },
      addressContact: {
        city: '',
        country: 'United Arab Emirates',
        primaryContactName: '',
        primaryContactEmail: '',
        additionalInfo: '',
      },
      rootUser: {
        username: '',
        email: '',
        phone: '',
        password: '',
      },
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0: // Company Information
        return data.company.name && data.company.organizationType && data.company.email && data.company.phone;
      case 1: // Address & Contact
        return data.addressContact.city && data.addressContact.country && data.addressContact.primaryContactName && data.addressContact.primaryContactEmail;
      case 2: // Root User
        return data.rootUser.username && data.rootUser.email && data.rootUser.phone && data.rootUser.password;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard New Client</DialogTitle>
          <DialogDescription>
            Complete the following steps to onboard a new client to UAE KYC.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator / Breadcrumb */}
        <div className="flex items-center justify-between px-2 py-4 border-b border-border">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isComplete && "cursor-pointer",
                    i > step && "cursor-not-allowed opacity-50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors",
                    isComplete ? "bg-primary border-primary text-primary-foreground" :
                    isActive ? "border-primary text-primary" :
                    "border-border text-muted-foreground"
                  )}>
                    {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className={cn(
                      "text-xs",
                      isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                    )}>
                      Step {i + 1}
                    </p>
                    <p className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {s.title}
                    </p>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-4",
                    i < step ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="py-6 min-h-[400px]">
          {step === 0 && (
            <CompanyInformationStep 
              data={data.company} 
              onChange={(company) => setData(d => ({ ...d, company }))} 
            />
          )}
          {step === 1 && (
            <AddressContactStep 
              data={data.addressContact} 
              onChange={(addressContact) => setData(d => ({ ...d, addressContact }))} 
            />
          )}
          {step === 2 && (
            <RootUserStep 
              data={data.rootUser} 
              onChange={(rootUser) => setData(d => ({ ...d, rootUser }))} 
            />
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {isLastStep ? 'Complete Onboarding' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Step 1: Company Information
function CompanyInformationStep({ 
  data, 
  onChange 
}: { 
  data: OnboardingData['company']; 
  onChange: (data: OnboardingData['company']) => void;
}) {
  const toggleModule = (moduleId: ModuleType) => {
    const modules = data.modules.includes(moduleId)
      ? data.modules.filter(m => m !== moduleId)
      : [...data.modules, moduleId];
    onChange({ ...data, modules });
  };

  const updateDocument = (type: DocumentType, updates: Partial<DocumentConfig>) => {
    const documents = data.documents.map(doc => 
      doc.type === type ? { ...doc, ...updates } : doc
    );
    onChange({ ...data, documents });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="e.g., Emirates NBD"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="orgType">Organization Type *</Label>
          <Select 
            value={data.organizationType} 
            onValueChange={(value) => onChange({ ...data, organizationType: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ORGANIZATION_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="companyEmail">Email *</Label>
          <Input
            id="companyEmail"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="contact@company.ae"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="companyPhone">Phone *</Label>
          <Input
            id="companyPhone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+971 4 XXX XXXX"
            className="mt-1"
          />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Configuration Options</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Sandbox Mode</p>
              <p className="text-xs text-muted-foreground">Enable test environment</p>
            </div>
            <Switch
              checked={data.sandboxMode}
              onCheckedChange={(checked) => onChange({ ...data, sandboxMode: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Population Migration</p>
              <p className="text-xs text-muted-foreground">Bulk data import support</p>
            </div>
            <Switch
              checked={data.populationMigration}
              onCheckedChange={(checked) => onChange({ ...data, populationMigration: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Proactive Monitoring</p>
              <p className="text-xs text-muted-foreground">Real-time alerts & monitoring</p>
            </div>
            <Switch
              checked={data.proactiveMonitoring}
              onCheckedChange={(checked) => onChange({ ...data, proactiveMonitoring: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">NFC Verification</p>
              <p className="text-xs text-muted-foreground">Enable NFC chip reading</p>
            </div>
            <Switch
              checked={data.nfcVerification}
              onCheckedChange={(checked) => onChange({ ...data, nfcVerification: checked })}
            />
          </div>
        </div>
      </div>

      {/* Document Configuration */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Document Types & Capture Methods</Label>
        <div className="space-y-2">
          {DOCUMENT_TYPES.map(docType => {
            const docConfig = data.documents.find(d => d.type === docType.id);
            return (
              <div key={docType.id} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <Checkbox
                  checked={docConfig?.enabled || false}
                  onCheckedChange={(checked) => updateDocument(docType.id, { enabled: !!checked })}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{docType.label}</p>
                </div>
                <Select 
                  value={docConfig?.captureMethod || 'scan'} 
                  onValueChange={(value: CaptureMethod) => updateDocument(docType.id, { captureMethod: value })}
                  disabled={!docConfig?.enabled}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scan">Scan</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Enabled Modules</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {MODULES.map(module => (
            <label
              key={module.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                data.modules.includes(module.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <Checkbox
                checked={data.modules.includes(module.id)}
                onCheckedChange={() => toggleModule(module.id)}
              />
              <div>
                <p className="text-sm font-medium">{module.label}</p>
                <p className="text-xs text-muted-foreground">{module.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 2: Address & Contact
function AddressContactStep({ 
  data, 
  onChange 
}: { 
  data: OnboardingData['addressContact']; 
  onChange: (data: OnboardingData['addressContact']) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Physical Address */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Physical Address</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select 
              value={data.country} 
              onValueChange={(value) => onChange({ ...data, country: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Select 
              value={data.city} 
              onValueChange={(value) => onChange({ ...data, city: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {UAE_CITIES.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Primary Contact Person */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Primary Contact Person</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactName">Full Name *</Label>
            <Input
              id="contactName"
              value={data.primaryContactName}
              onChange={(e) => onChange({ ...data, primaryContactName: e.target.value })}
              placeholder="e.g., Ahmed Al Malik"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contactEmail">Email Address *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={data.primaryContactEmail}
              onChange={(e) => onChange({ ...data, primaryContactEmail: e.target.value })}
              placeholder="ahmed@company.ae"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <Label htmlFor="additionalInfo">Additional Information</Label>
        <Textarea
          id="additionalInfo"
          value={data.additionalInfo}
          onChange={(e) => onChange({ ...data, additionalInfo: e.target.value })}
          placeholder="Any special requirements, notes, or comments..."
          className="mt-1"
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Include any special configuration needs or business requirements.
        </p>
      </div>
    </div>
  );
}

// Step 3: Root User
function RootUserStep({ 
  data, 
  onChange 
}: { 
  data: OnboardingData['rootUser']; 
  onChange: (data: OnboardingData['rootUser']) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          The root user will have full administrative access to the client's UAE KYC dashboard.
          This account can manage users, view analytics, and configure settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={data.username}
            onChange={(e) => onChange({ ...data, username: e.target.value })}
            placeholder="e.g., admin_emirates"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Used for login. Letters, numbers, and underscores only.
          </p>
        </div>
        <div>
          <Label htmlFor="rootEmail">Email Address *</Label>
          <Input
            id="rootEmail"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="admin@company.ae"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Verification email will be sent to this address.
          </p>
        </div>
        <div>
          <Label htmlFor="rootPhone">Phone Number *</Label>
          <Input
            id="rootPhone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+971 50 XXX XXXX"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            For 2FA and account recovery.
          </p>
        </div>
        <div>
          <Label htmlFor="rootPassword">Password *</Label>
          <div className="relative mt-1">
            <Input
              id="rootPassword"
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => onChange({ ...data, password: e.target.value })}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Min 8 characters with uppercase, lowercase, and number.
          </p>
        </div>
      </div>

      {/* Password strength indicator */}
      {data.password && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => {
              const strength = getPasswordStrength(data.password);
              return (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    level <= strength
                      ? strength <= 1 ? "bg-destructive" 
                        : strength <= 2 ? "bg-chart-3" 
                        : "bg-chart-2"
                      : "bg-border"
                  )}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Password strength: {getPasswordStrengthLabel(data.password)}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  return strength;
}

function getPasswordStrengthLabel(password: string): string {
  const strength = getPasswordStrength(password);
  if (strength <= 1) return 'Weak';
  if (strength <= 2) return 'Fair';
  if (strength <= 3) return 'Good';
  return 'Strong';
}
