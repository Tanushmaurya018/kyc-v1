import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Settings,
  Eye,
  EyeOff,
  Users,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  getOrgTypes,
  getCountries,
  getModules,
  createOrg,
  FALLBACK_ORG_TYPES,
  FALLBACK_COUNTRIES,
  FALLBACK_MODULES,
  type OrgType,
  type Country,
  type Module,
  type CreateOrgPayload,
} from '@/services/org-api';

// Types
type PrivateStep = 'org-details' | 'allowed-docs' | 'module-config';
// Future steps (commented out for now):
// type PrivateStep = 'org-details' | 'allowed-docs' | 'module-config' | 'pricing' | 'features';

interface OnboardingData {
  // Organization Details
  organization: {
    name: string;
    orgTypeId: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    countryId: string;
  };

  // Root User
  rootUser: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };

  // Primary Contact
  primaryContact: {
    name: string;
    email: string;
    additionalInfo: string;
  };

  // Allowed Documents
  allowedDocs: { id: string; method: 'scan' | 'manual' | 'all' }[];

  // Selected Modules (IDs from BACKEND_MODULES)
  selectedModules: string[];

  /* ---- COMMENTED OUT: will be needed in the future ----
  // Module Configuration (old complex structure)
  modules: {
    kyc: {
      enabled: boolean;
      journeys: KYCJourney[];
    };
    authentication: {
      enabled: boolean;
      services: AuthService[];
    };
    validation: {
      enabled: boolean;
      services: ValidationService[];
    };
    additional: {
      populationMigration: boolean;
      biometricVerification: boolean;
    };
    api: {
      enabled: boolean;
      modules: APIModule[];
    };
  };

  // Pricing
  pricing: {
    initialCredits: number;
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    perModulePricing: Record<string, { price: number; includedTransactions: number }>;
  };

  // Features
  features: {
    nonVisitorOnboarding: boolean;
    requireOnboarding: boolean;
    generateCertificate: boolean;
    proactiveMonitoring: boolean;
    sandboxMode: boolean;
    eligibleForFinance: boolean;
    watermarkCompression: boolean;
    activeLiveness: boolean;
    passiveLiveness: boolean;
  };
  ---- END COMMENTED OUT ---- */
}

// Constants

const ALLOWED_DOCUMENT_TYPES = [
  { id: 'emirates_id', name: 'Emirates ID', description: 'UAE national identity card' },
  { id: 'passport', name: 'Passport', description: 'International travel document' },
  { id: 'gcc_id', name: 'GCC ID', description: 'Gulf Cooperation Council identity card' },
];

// Map form method values → API captureMethod values
const CAPTURE_METHOD_MAP: Record<string, string> = {
  scan: 'scan',
  manual: 'manual_input',
  all: 'all',
};

// Initial state — pre-filled for dev convenience
const initialData: OnboardingData = {
  organization: {
    name: 'Acme Financial Services',
    orgTypeId: '2ac34064-8e7b-4820-8438-214d2e582f8e',
    email: 'contact@acmefinancial.ae',
    phone: '+971 50 123 4567',
    address: 'Tower 5, Floor 12, Business Bay',
    city: 'Dubai',
    countryId: 'b3b0a3f6-890b-4c78-bb9c-9b6a1b2cbe9e',
  },
  rootUser: {
    name: 'Ahmed Al Rashid',
    email: 'ahmed.rashid@acmefinancial.ae',
    phone: '+971 55 987 6543',
    password: 'Admin@1234',
  },
  primaryContact: {
    name: 'Mohammed Al Farsi',
    email: 'mohammed@acmefinancial.ae',
    additionalInfo: '',
  },
  allowedDocs: [
    { id: 'emirates_id', method: 'all' },
    { id: 'passport', method: 'scan' },
  ],
  selectedModules: [],
};

export default function OnboardClient() {
  const navigate = useNavigate();
  const [data, setData] = useState<OnboardingData>(initialData);
  const [privateStep, setPrivateStep] = useState<PrivateStep>('org-details');
  const [submitting, setSubmitting] = useState(false);

  // Reference data fetched from API
  const [orgTypes, setOrgTypes] = useState<OrgType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [refLoading, setRefLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOrgTypes().catch(() => FALLBACK_ORG_TYPES),
      getCountries().catch(() => FALLBACK_COUNTRIES),
      getModules().catch(() => FALLBACK_MODULES),
    ]).then(([orgTypesRes, countriesRes, modulesRes]) => {
      setOrgTypes(orgTypesRes);
      setCountries(countriesRes);
      setModules(modulesRes);
      setRefLoading(false);
    });
  }, []);

  // Build API payload from form data
  const buildPayload = (): CreateOrgPayload => ({
    companyName: data.organization.name,
    orgTypeId: data.organization.orgTypeId,
    email: data.organization.email,
    phone: data.organization.phone,
    address: data.organization.address,
    city: data.organization.city,
    countryId: data.organization.countryId,
    primaryContactName: data.primaryContact.name,
    primaryContactEmail: data.primaryContact.email,
    additionalInformation: data.primaryContact.additionalInfo,
    rootUsername: data.rootUser.name,
    rootEmail: data.rootUser.email,
    rootUserPhone: data.rootUser.phone,
    rootPassword: data.rootUser.password,
    documentsAllowed: data.allowedDocs.map(d => ({
      type: d.id,
      captureMethod: CAPTURE_METHOD_MAP[d.method] || d.method,
    })),
    enabled_transaction_types: data.selectedModules,
    responseTemplate: {},
    roleName: 'OrgRootUser',
    // Boolean defaults — can be made configurable in a future step
    sandboxMode: true,
    digitization: false,
    continuousDigitization: false,
    proactiveMonitoring: false,
    nonVisitorOnboarding: true,
    nfcVerification: false,
    watermarkNoiseCompress: false,
    generateCertificate: true,
    governmentSearchOrg: false,
    enableGlobalOneToManySearch: false,
    eligibleForFinance: false,
    allowNonOnboardedVerification: false,
  });

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const payload = buildPayload();
      console.log('Submitting:', payload);
      const res = await createOrg(payload);
      toast.success('Organization created successfully');
      navigate(`/console/organizations/${res.orgId}`);
    } catch (err: any) {
      console.error('Create org failed:', err);
      toast.error(err?.message || 'Failed to create organization. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (refLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PrivateFlow
      data={data}
      setData={setData}
      currentStep={privateStep}
      setCurrentStep={setPrivateStep}
      orgTypes={orgTypes}
      countries={countries}
      modules={modules}
      submitting={submitting}
      onComplete={handleComplete}
      onBack={() => navigate('/console/organizations')}
    />
  );
}

// Private Flow Component
function PrivateFlow({
  data,
  setData,
  currentStep,
  setCurrentStep,
  orgTypes,
  countries,
  modules,
  submitting,
  onComplete,
  onBack,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  currentStep: PrivateStep;
  setCurrentStep: (step: PrivateStep) => void;
  orgTypes: OrgType[];
  countries: Country[];
  modules: Module[];
  submitting: boolean;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Check step completion
  const isOrgDetailsComplete = data.organization.name && data.organization.email &&
    data.organization.phone && data.organization.orgTypeId && data.organization.countryId &&
    data.rootUser.name && data.rootUser.email && data.rootUser.password;

  const isAllowedDocsComplete = data.allowedDocs.length > 0;
  const isModuleConfigComplete = data.selectedModules.length > 0;

  return (
    <div className="min-h-[80vh] flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-border p-6 bg-muted/30 overflow-y-auto">
        <div className="space-y-1 mb-6">
          <h2 className="font-semibold">Private Organization</h2>
          <p className="text-xs text-muted-foreground">Complete all steps to onboard</p>
        </div>

        <div className="space-y-1">
          {/* Organization Details */}
          <SidebarStep
            number={1}
            title="Organization Details"
            description="Company & admin info"
            isActive={currentStep === 'org-details'}
            isComplete={!!isOrgDetailsComplete && currentStep !== 'org-details'}
            onClick={() => setCurrentStep('org-details')}
          />

          {/* Allowed Documents */}
          <SidebarStep
            number={2}
            title="Allowed Documents"
            description="Select document types"
            isActive={currentStep === 'allowed-docs'}
            isComplete={isAllowedDocsComplete && currentStep !== 'allowed-docs' && currentStep !== 'org-details'}
            onClick={() => setCurrentStep('allowed-docs')}
          />

          {/* Module Configuration */}
          <SidebarStep
            number={3}
            title="Module Configuration"
            description="Select modules"
            isActive={currentStep === 'module-config'}
            isComplete={false}
            onClick={() => setCurrentStep('module-config')}
          />

          {/* COMMENTED OUT: Pricing & Credits step
          <SidebarStep
            number={4}
            title="Pricing & Credits"
            description="Pricing configuration"
            isActive={currentStep === 'pricing'}
            isComplete={currentStep === 'features'}
            onClick={() => setCurrentStep('pricing')}
          />
          */}

          {/* COMMENTED OUT: Additional Features step
          <SidebarStep
            number={5}
            title="Additional Features"
            description="Extra configurations"
            isActive={currentStep === 'features'}
            isComplete={false}
            onClick={() => setCurrentStep('features')}
          />
          */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl">
          {/* Organization Details Step */}
          {currentStep === 'org-details' && (
            <OrgDetailsStep
              data={data}
              setData={setData}
              orgTypes={orgTypes}
              countries={countries}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onBack={onBack}
              onNext={() => setCurrentStep('allowed-docs')}
              canProceed={!!isOrgDetailsComplete}
            />
          )}

          {/* Allowed Documents Step */}
          {currentStep === 'allowed-docs' && (
            <AllowedDocsStep
              data={data}
              setData={setData}
              onBack={() => setCurrentStep('org-details')}
              onNext={() => setCurrentStep('module-config')}
              canProceed={isAllowedDocsComplete}
            />
          )}

          {/* Module Configuration Step */}
          {currentStep === 'module-config' && (
            <ModuleConfigStep
              data={data}
              setData={setData}
              modules={modules}
              submitting={submitting}
              onBack={() => setCurrentStep('allowed-docs')}
              onComplete={onComplete}
              canProceed={isModuleConfigComplete}
            />
          )}

          {/* COMMENTED OUT: Pricing Step
          {currentStep === 'pricing' && (
            <PricingStep
              data={data}
              setData={setData}
              onBack={() => setCurrentStep('module-config')}
              onNext={() => setCurrentStep('features')}
            />
          )}
          */}

          {/* COMMENTED OUT: Features Step
          {currentStep === 'features' && (
            <FeaturesStep
              data={data}
              setData={setData}
              onBack={() => setCurrentStep('pricing')}
              onComplete={onComplete}
            />
          )}
          */}
        </div>
      </div>
    </div>
  );
}

// Sidebar Step Component
function SidebarStep({
  number,
  title,
  description,
  isActive,
  isComplete,
  onClick,
}: {
  number: number;
  title: string;
  description: string;
  isActive: boolean;
  isComplete: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
        isActive
          ? "bg-primary/10 text-primary"
          : isComplete
            ? "text-foreground hover:bg-muted"
            : "text-muted-foreground hover:bg-muted"
      )}
    >
      <div className={cn(
        "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
        isActive
          ? "bg-primary text-primary-foreground"
          : isComplete
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
      )}>
        {isComplete && !isActive ? <Check className="h-3 w-3" /> : number}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

// Organization Details Step
function OrgDetailsStep({
  data,
  setData,
  orgTypes,
  countries,
  showPassword,
  setShowPassword,
  onBack,
  onNext,
  canProceed,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  orgTypes: OrgType[];
  countries: Country[];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Organization Details</h2>
        <p className="text-muted-foreground">Company & admin info</p>
      </div>

      {/* Organization Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Organization Information</h3>
        <p className="text-sm text-muted-foreground">Basic company details</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="orgName">Organization Name *</Label>
            <Input
              id="orgName"
              value={data.organization.name}
              onChange={(e) => setData({
                ...data,
                organization: { ...data.organization, name: e.target.value }
              })}
              placeholder="Acme Financial Services"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="orgType">Organization Type *</Label>
            <Select
              value={data.organization.orgTypeId}
              onValueChange={(value) => setData({
                ...data,
                organization: { ...data.organization, orgTypeId: value }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {orgTypes.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="orgEmail">Company Email *</Label>
            <Input
              id="orgEmail"
              type="email"
              value={data.organization.email}
              onChange={(e) => setData({
                ...data,
                organization: { ...data.organization, email: e.target.value }
              })}
              placeholder="contact@company.ae"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="orgPhone">Company Phone *</Label>
            <Input
              id="orgPhone"
              type="tel"
              value={data.organization.phone}
              onChange={(e) => setData({
                ...data,
                organization: { ...data.organization, phone: e.target.value }
              })}
              placeholder="+971 50 123 4567"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Format: +971 XX XXX XXXX</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={data.organization.address}
              onChange={(e) => setData({
                ...data,
                organization: { ...data.organization, address: e.target.value }
              })}
              placeholder="Tower 5, Floor 12, Business Bay"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={data.organization.city}
              onChange={(e) => setData({
                ...data,
                organization: { ...data.organization, city: e.target.value }
              })}
              placeholder="Dubai"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select
              value={data.organization.countryId}
              onValueChange={(value) => setData({
                ...data,
                organization: { ...data.organization, countryId: value }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Primary Contact */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h3 className="text-lg font-semibold">Primary Contact</h3>
          <p className="text-sm text-muted-foreground">Main point of contact for the organization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryContactName">Primary Contact Name</Label>
            <Input
              id="primaryContactName"
              value={data.primaryContact.name}
              onChange={(e) => setData({
                ...data,
                primaryContact: { ...data.primaryContact, name: e.target.value }
              })}
              placeholder="Mohammed Al Farsi"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
            <Input
              id="primaryContactEmail"
              type="email"
              value={data.primaryContact.email}
              onChange={(e) => setData({
                ...data,
                primaryContact: { ...data.primaryContact, email: e.target.value }
              })}
              placeholder="contact@company.ae"
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={data.primaryContact.additionalInfo}
              onChange={(e) => setData({
                ...data,
                primaryContact: { ...data.primaryContact, additionalInfo: e.target.value }
              })}
              placeholder="Any additional notes or information..."
              className="mt-1"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Provide any relevant details about the organization
            </p>
          </div>
        </div>
      </div>

      {/* Root User */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h3 className="text-lg font-semibold">Root User / Admin</h3>
          <p className="text-sm text-muted-foreground">Admin credentials for the organization</p>
        </div>

        <div className="p-3 bg-muted/50 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Root user will have full administrative access
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              value={data.rootUser.name}
              onChange={(e) => setData({
                ...data,
                rootUser: { ...data.rootUser, name: e.target.value }
              })}
              placeholder="Ahmed Al Rashid"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={data.rootUser.email}
              onChange={(e) => setData({
                ...data,
                rootUser: { ...data.rootUser, email: e.target.value }
              })}
              placeholder="ahmed.rashid@company.ae"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">Contact Phone *</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={data.rootUser.phone}
              onChange={(e) => setData({
                ...data,
                rootUser: { ...data.rootUser, phone: e.target.value }
              })}
              placeholder="+971 55 987 6543"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Format: +971 XX XXX XXXX</p>
          </div>
          <div>
            <Label htmlFor="rootPassword">Root User Password *</Label>
            <div className="relative mt-1">
              <Input
                id="rootPassword"
                type={showPassword ? 'text' : 'password'}
                value={data.rootUser.password}
                onChange={(e) => setData({
                  ...data,
                  rootUser: { ...data.rootUser, password: e.target.value }
                })}
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
              Min 8 chars, uppercase, lowercase, number, special char
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Allowed Documents Step
function AllowedDocsStep({
  data,
  setData,
  onBack,
  onNext,
  canProceed,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}) {
  const isDocEnabled = (docId: string) => data.allowedDocs.some(d => d.id === docId);
  const getDocMethod = (docId: string) => data.allowedDocs.find(d => d.id === docId)?.method || 'all';

  const toggleDoc = (docId: string) => {
    setData({
      ...data,
      allowedDocs: isDocEnabled(docId)
        ? data.allowedDocs.filter(d => d.id !== docId)
        : [...data.allowedDocs, { id: docId, method: 'all' }],
    });
  };

  const setDocMethod = (docId: string, method: 'scan' | 'manual' | 'all') => {
    setData({
      ...data,
      allowedDocs: data.allowedDocs.map(d =>
        d.id === docId ? { ...d, method } : d
      ),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Allowed Documents</h2>
          <p className="text-muted-foreground">Select which document types this organization can use</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{data.organization.name || 'Organization'}</p>
          <p className="text-sm text-muted-foreground">{data.allowedDocs.length} selected</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Document Types</h3>
          <p className="text-sm text-muted-foreground">Select at least one document type and choose the input method</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ALLOWED_DOCUMENT_TYPES.map(doc => {
            const enabled = isDocEnabled(doc.id);
            return (
              <div
                key={doc.id}
                className={cn(
                  "p-4 rounded-xl border transition-colors",
                  enabled
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{doc.name}</span>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggleDoc(doc.id)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-3">{doc.description}</p>
                <Select
                  value={getDocMethod(doc.id)}
                  onValueChange={(value: 'scan' | 'manual' | 'all') => setDocMethod(doc.id, value)}
                  disabled={!enabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All (Scan + Manual)</SelectItem>
                    <SelectItem value="scan">Scan Only</SelectItem>
                    <SelectItem value="manual">Manual Input Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Module Configuration Step (simplified — just shows module names with checkboxes)
function ModuleConfigStep({
  data,
  setData,
  modules,
  submitting,
  onBack,
  onComplete,
  canProceed,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  modules: Module[];
  submitting: boolean;
  onBack: () => void;
  onComplete: () => void;
  canProceed: boolean;
}) {
  const toggleModule = (moduleId: string) => {
    setData({
      ...data,
      selectedModules: data.selectedModules.includes(moduleId)
        ? data.selectedModules.filter(id => id !== moduleId)
        : [...data.selectedModules, moduleId],
    });
  };

  const toggleAll = (enabled: boolean) => {
    setData({
      ...data,
      selectedModules: enabled ? modules.map(m => m.id) : [],
    });
  };

  const allSelected = modules.length > 0 && data.selectedModules.length === modules.length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Module Configuration</h2>
          <p className="text-muted-foreground">Select modules for this organization</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{data.organization.name || 'Organization'}</p>
          <p className="text-sm text-muted-foreground">
            {data.selectedModules.length}/{modules.length} modules selected
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Available Modules</CardTitle>
                <CardDescription>
                  {data.selectedModules.length}/{modules.length} modules enabled
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={allSelected}
                onCheckedChange={(checked) => toggleAll(checked)}
              />
              <span className="text-sm font-medium">Enable All</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {data.selectedModules.length} selected
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modules.map(module => {
              const isSelected = data.selectedModules.includes(module.id);
              return (
                <div
                  key={module.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{module.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                    {module.description && (
                      <p className="text-xs text-muted-foreground">{module.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={isSelected}
                    onCheckedChange={() => toggleModule(module.id)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* COMMENTED OUT: Old module config sections (KYC journeys, auth services, validation services, additional services, API modules)
         These will be needed in the future when service-level configuration is re-enabled.
         See git history for the full implementation of:
         - KYC Service with journey selection (Onboarding, Re-KYC)
         - Authentication Service (Authorise, One-to-Many)
         - Validation Service (Emirates ID, Passport)
         - Additional Services (Population Migration, Biometric Verification)
         - API Modules (16 individual endpoints with select-all)
         - Service Configuration sub-steps (documents allowed, verification methods, delivery channels, response templates)
      */}

      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onBack} disabled={submitting}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={onComplete} disabled={!canProceed || submitting}>
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitting ? 'Creating...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================================
   COMMENTED OUT COMPONENTS — Will be needed in the future
   ============================================================================

// Government Flow Component
function GovernmentFlow({
  data,
  step,
  setStep,
  setData,
  onComplete,
  onBack,
}: {
  data: OnboardingData;
  step: number;
  setStep: (step: number) => void;
  setData: (data: OnboardingData) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const canProceedStep1 = data.organization.name && data.organization.email && data.organization.phone;
  const canProceedStep2 = data.organization.address && data.organization.city && data.organization.country &&
    data.primaryContact.name && data.primaryContact.email;

  return (
    <div className="min-h-[80vh] flex">
      <div className="w-64 border-r border-border p-6 bg-muted/30">
        <div className="space-y-1 mb-6">
          <h2 className="font-semibold">Government Organization</h2>
          <p className="text-xs text-muted-foreground">Complete all steps to onboard</p>
        </div>

        <div className="space-y-2">
          <SidebarStep
            number={1}
            title="Organization Info"
            description="Basic details"
            isActive={step === 0}
            isComplete={step > 0}
            onClick={() => step > 0 && setStep(0)}
          />
          <SidebarStep
            number={2}
            title="Address & Contact"
            description="Location & contact person"
            isActive={step === 1}
            isComplete={step > 1}
            onClick={() => {}}
          />
        </div>
      </div>

      <div className="flex-1 p-8 max-w-3xl">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Organization Information</h2>
              <p className="text-muted-foreground">Basic organization details</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input id="orgName" value={data.organization.name}
                  onChange={(e) => setData({ ...data, organization: { ...data.organization, name: e.target.value } })}
                  placeholder="Enter organization name" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="orgEmail">Organization Email *</Label>
                <Input id="orgEmail" type="email" value={data.organization.email}
                  onChange={(e) => setData({ ...data, organization: { ...data.organization, email: e.target.value } })}
                  placeholder="organization@example.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="orgPhone">Organization Phone *</Label>
                <Input id="orgPhone" type="tel" value={data.organization.phone}
                  onChange={(e) => setData({ ...data, organization: { ...data.organization, phone: e.target.value } })}
                  placeholder="+971 XX XXX XXXX" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button onClick={() => setStep(1)} disabled={!canProceedStep1}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Address & Contact</h2>
              <p className="text-muted-foreground">Location and primary contact information</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input id="address" value={data.organization.address}
                  onChange={(e) => setData({ ...data, organization: { ...data.organization, address: e.target.value } })}
                  placeholder="Enter address" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="contactName">Primary Contact Name *</Label>
                <Input id="contactName" value={data.primaryContact.name}
                  onChange={(e) => setData({ ...data, primaryContact: { ...data.primaryContact, name: e.target.value } })}
                  placeholder="Enter contact name" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="contactEmail">Primary Contact Email *</Label>
                <Input id="contactEmail" type="email" value={data.primaryContact.email}
                  onChange={(e) => setData({ ...data, primaryContact: { ...data.primaryContact, email: e.target.value } })}
                  placeholder="contact@example.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea id="additionalInfo" value={data.primaryContact.additionalInfo}
                  onChange={(e) => setData({ ...data, primaryContact: { ...data.primaryContact, additionalInfo: e.target.value } })}
                  placeholder="Any additional notes or information..." className="mt-1" rows={3} />
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setStep(0)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button onClick={onComplete} disabled={!canProceedStep2}>Complete Onboarding</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Old complex module config types
interface KYCJourney {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config?: JourneyConfig;
}

interface JourneyConfig {
  journeyId: string;
  documentsAllowed: {
    emiratesId: { enabled: boolean; method: 'scan' | 'manual' | 'all' };
    passport: { enabled: boolean; method: 'scan' | 'manual' | 'all' };
    gccId: { enabled: boolean; method: 'scan' | 'manual' | 'all' };
  };
  verificationMethods: {
    faceRecognition: boolean;
    fingerprint: boolean;
  };
  deliveryChannels: {
    sdk: boolean;
    remoteLink: boolean;
    headless: boolean;
  };
  responseTemplate: {
    personalInfo: string[];
    activePassport: string[];
    contactDetails: string[];
    travelDetail: string[];
    residenceInfo: string[];
    familyBook: string[];
    sponsorDetails: string[];
    tradeLicense: string[];
    immigrationFile: string[];
    sponsorContactDetails: string[];
    activeVisa: string[];
    documents: string[];
  };
}

interface AuthService {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface ValidationService {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config?: ValidationConfig;
}

interface ValidationConfig {
  apiBased: {
    enabled: boolean;
    pricePerCall: number;
    apiHitLimit: number;
  };
  batchProcessing: {
    enabled: boolean;
    pricePerRecord: number;
    batchHitLimit: number;
    maxRecordsPerBatch: number;
    maxFiles: number;
  };
}

interface APIModule {
  id: string;
  name: string;
  enabled: boolean;
}

const RESPONSE_TEMPLATE_FIELDS = {
  personalInfo: [
    'Full Name (EN)', 'Full Name (AR)', 'First Name', 'Last Name', 'Gender', 'Date of Birth',
    'Nationality', 'Emirates ID Number', 'ID Expiry Date', 'Photo', 'Signature',
    'Mother Name (EN)', 'Mother Name (AR)', 'Occupation (EN)', 'Occupation (AR)',
    'Place of Birth', 'Marital Status', 'Religion', 'Blood Group', 'Height', 'Weight',
    'Eye Color', 'Hair Color', 'Special Marks', 'Education Level', 'Qualification',
    'Passport Number', 'Passport Issue Date',
  ],
  activePassport: [
    'Passport Number', 'Issue Date', 'Expiry Date', 'Issue Country', 'Issue Place',
    'Passport Type', 'MRZ Line 1', 'MRZ Line 2',
  ],
  contactDetails: [
    'Mobile Number', 'Phone Number', 'Email', 'PO Box', 'Postal Code',
    'Address Line 1', 'Address Line 2', 'Building Name', 'Street', 'Area',
    'City', 'Emirate',
  ],
  travelDetail: [
    'Entry Date', 'Entry Port', 'Visa Number', 'Visa Type', 'Visa Status',
    'Last Exit Date', 'Travel History',
  ],
  residenceInfo: [
    'Residence Type', 'Residence Address', 'Residence Emirate', 'Residence City',
    'Residence Area', 'Residence Street', 'Building Name', 'Flat Number',
    'Residence Since', 'Landlord Name', 'Rental Contract',
  ],
  familyBook: ['Family Book Number', 'Family Head', 'Members Count', 'Issue Date'],
  sponsorDetails: [
    'Sponsor Name (EN)', 'Sponsor Name (AR)', 'Sponsor ID', 'Sponsor Type',
    'Company Name', 'Trade License', 'Sponsor Phone', 'Sponsor Email',
    'Sponsor Address', 'Relationship',
  ],
  tradeLicense: ['Trade License Number'],
  immigrationFile: [
    'File Number', 'File Type', 'File Status', 'Establishment', 'PRO Name',
    'PRO Contact', 'File Notes',
  ],
  sponsorContactDetails: [
    'Contact Name', 'Contact Phone', 'Contact Mobile', 'Contact Email',
    'Contact Fax', 'Office Address', 'Office City', 'Office Emirate',
    'Office PO Box', 'Office Postal Code', 'Contact Position', 'Contact Department',
    'Working Hours',
  ],
  activeVisa: [
    'Visa Number', 'Visa Type', 'Issue Date', 'Expiry Date', 'Status',
    'Sponsor', 'Profession', 'Entry Permit', 'UID', 'Unified Number',
  ],
  documents: [
    'Emirates ID Front', 'Emirates ID Back', 'Passport Bio Page',
    'Visa Page', 'Photo', 'Signature',
  ],
};

const API_MODULES_OLD: APIModule[] = [
  { id: 'person-detail', name: 'Person Detail', enabled: false },
  { id: 'person-gov-photo', name: 'Person Gov Photo', enabled: false },
  { id: 'digital-eid', name: 'Digital EID', enabled: false },
  { id: 'search-name-dob', name: 'Search Name/DOB', enabled: false },
  { id: 'immigration-details', name: 'Immigration Details', enabled: false },
  { id: 'sponsor-details', name: 'Sponsor Details', enabled: false },
  { id: 'fingerprint-fetch', name: 'Fingerprint Fetch', enabled: false },
  { id: 'fingerprint-match', name: 'Fingerprint Match', enabled: false },
  { id: 'face-compare', name: 'Face Compare', enabled: false },
  { id: 'face-person-match', name: 'Face Person Match', enabled: false },
  { id: 'document-ocr', name: 'Document OCR', enabled: false },
  { id: 'person-live-photo', name: 'Person Live Photo', enabled: false },
  { id: 'person-live-image-exists', name: 'Person Live Image Exists', enabled: false },
  { id: 'record-exists', name: 'Record Exists', enabled: false },
  { id: 'person-authenticate', name: 'Person Authenticate', enabled: false },
  { id: 'customer-bio', name: 'Customer Bio', enabled: false },
];

function generateJourneyId(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${result}`;
}

// PricingStep component
function PricingStep({
  data,
  setData,
  enabledKYCJourneys,
  onBack,
  onNext,
}: {
  data: any;
  setData: (data: any) => void;
  enabledKYCJourneys: KYCJourney[];
  onBack: () => void;
  onNext: () => void;
}) {
  const updatePricing = (journeyId: string, field: 'price' | 'includedTransactions', value: number) => {
    setData({
      ...data,
      pricing: {
        ...data.pricing,
        perModulePricing: {
          ...data.pricing.perModulePricing,
          [journeyId]: {
            ...data.pricing.perModulePricing[journeyId],
            [field]: value,
          }
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pricing & Credits</h2>
          <p className="text-muted-foreground">Pricing configuration</p>
        </div>
        <p className="text-sm text-muted-foreground">{data.organization.name}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Initial Credits</h3>
        <p className="text-sm text-muted-foreground">Starting credit balance</p>
        <Input
          type="number"
          value={data.pricing.initialCredits}
          onChange={(e) => setData({
            ...data,
            pricing: { ...data.pricing, initialCredits: parseInt(e.target.value) || 0 }
          })}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Billing Cycle</h3>
        <Select
          value={data.pricing.billingCycle}
          onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => setData({
            ...data,
            pricing: { ...data.pricing, billingCycle: value }
          })}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {enabledKYCJourneys.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Per-Module Pricing</h3>
          <div className="space-y-4">
            {enabledKYCJourneys.map(journey => {
              const pricing = data.pricing.perModulePricing[journey.id] || { price: 5, includedTransactions: 0 };
              return (
                <Card key={journey.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{journey.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price per Transaction (AED)</Label>
                        <Input type="number" value={pricing.price}
                          onChange={(e) => updatePricing(journey.id, 'price', parseFloat(e.target.value) || 0)}
                          className="mt-1" />
                      </div>
                      <div>
                        <Label>Included Transactions</Label>
                        <Input type="number" value={pricing.includedTransactions}
                          onChange={(e) => updatePricing(journey.id, 'includedTransactions', parseInt(e.target.value) || 0)}
                          className="mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
        <Button onClick={onNext}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
      </div>
    </div>
  );
}

// FeaturesStep component
function FeaturesStep({
  data,
  setData,
  onBack,
  onComplete,
}: {
  data: any;
  setData: (data: any) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const toggleFeature = (feature: string) => {
    setData({
      ...data,
      features: {
        ...data.features,
        [feature]: !data.features[feature]
      }
    });
  };

  const features = [
    { key: 'nonVisitorOnboarding', label: 'Non-Visitor Onboarding', description: 'Allow onboarding for non-visitors' },
    { key: 'requireOnboarding', label: 'Require Onboarding', description: 'Mandate onboarding process' },
    { key: 'generateCertificate', label: 'Generate Certificate', description: 'Auto-generate verification certificates' },
    { key: 'proactiveMonitoring', label: 'Proactive Monitoring', description: 'Enable proactive transaction monitoring' },
    { key: 'sandboxMode', label: 'Sandbox Mode', description: 'Enable testing environment' },
    { key: 'eligibleForFinance', label: 'Eligible for Finance', description: 'Allow financial services' },
    { key: 'watermarkCompression', label: 'Watermark Compression', description: 'Apply watermark noise compression' },
    { key: 'activeLiveness', label: 'Active Liveness', description: 'Require active liveness check' },
    { key: 'passiveLiveness', label: 'Passive Liveness', description: 'Enable passive liveness detection' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Additional Features</h2>
          <p className="text-muted-foreground">Extra configurations</p>
        </div>
        <p className="text-sm text-muted-foreground">{data.organization.name}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Organization Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map(feature => (
            <div key={feature.key}
              className="flex items-center justify-between p-4 rounded-xl border border-border">
              <div>
                <p className="font-medium">{feature.label}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch checked={data.features[feature.key]} onCheckedChange={() => toggleFeature(feature.key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onBack}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
        <Button onClick={onComplete}>Complete Setup</Button>
      </div>
    </div>
  );
}

// ServiceConfigStep — full journey/service configuration
// This is a large component that handles KYC journey config, auth config, and validation config.
// It includes: documents allowed, verification methods, delivery channels, response templates,
// processing modes (API based, batch processing), etc.
// Preserved here for future use when detailed service configuration is re-enabled.

============================================================================ */
