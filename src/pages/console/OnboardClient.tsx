import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input, 
  Label, 
  Textarea, 
  Switch, 
  Checkbox,
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
  Building2, 
  Briefcase,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  Key,
  Settings,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Users,
  FileText,
  Fingerprint,
  ScanFace,
  Smartphone,
  Link2,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type OrganizationType = 'government' | 'private' | null;
type PrivateStep = 'org-details' | 'module-config' | 'pricing' | 'features';

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

interface OnboardingData {
  // Common
  organizationType: OrganizationType;
  
  // Organization Details
  organization: {
    name: string;
    category: string;
    registrationNumber: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  
  // Root User (Private only)
  rootUser: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  
  // Government specific
  primaryContact: {
    name: string;
    email: string;
    additionalInfo: string;
  };
  
  // Module Configuration (Private only)
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
  
  // Pricing (Private only)
  pricing: {
    initialCredits: number;
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    perModulePricing: Record<string, { price: number; includedTransactions: number }>;
  };
  
  // Features (Private only)
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
}

// Constants
const ORGANIZATION_CATEGORIES = [
  'Financial',
  'Healthcare',
  'Government',
  'Telecom',
  'Real Estate',
  'Education',
  'Retail',
  'Technology',
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

const API_MODULES: APIModule[] = [
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

// Generate random journey ID
function generateJourneyId(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${result}`;
}

// Initial state with test data for development
const initialData: OnboardingData = {
  organizationType: null,
  organization: {
    name: 'Acme Financial Services',
    category: 'Financial',
    registrationNumber: 'REG-2024-78523',
    email: 'contact@acmefinancial.ae',
    phone: '+971 50 123 4567',
    address: 'Tower 5, Floor 12, Business Bay',
    city: 'Dubai',
    country: 'United Arab Emirates',
  },
  rootUser: {
    name: 'Ahmed Al Rashid',
    email: 'ahmed.rashid@acmefinancial.ae',
    phone: '+971 55 987 6543',
    password: 'Test@1234',
  },
  primaryContact: {
    name: 'Mohammed Al Farsi',
    email: 'mohammed.farsi@gov.ae',
    additionalInfo: 'Priority government client - expedited processing required.',
  },
  modules: {
    kyc: {
      enabled: true,
      journeys: [
        { id: 'onboarding', name: 'Onboarding', description: 'New customer registration', enabled: true },
        { id: 'rekyc', name: 'Re-KYC', description: 'Periodic identity reverification', enabled: true },
      ],
    },
    authentication: {
      enabled: true,
      services: [
        { id: 'authorise', name: 'Authorise', description: 'Transaction authorization', enabled: true },
        { id: 'one-to-many', name: 'One-to-Many', description: 'Face search in database', enabled: false },
      ],
    },
    validation: {
      enabled: true,
      services: [
        { id: 'emirates-id', name: 'Emirates ID', description: 'Emirates ID validation', enabled: true },
        { id: 'passport', name: 'Passport', description: 'Passport validation', enabled: false },
      ],
    },
    additional: {
      populationMigration: true,
      biometricVerification: false,
    },
    api: {
      enabled: true,
      modules: API_MODULES.map((m, i) => ({ ...m, enabled: i < 5 })), // First 5 enabled
    },
  },
  pricing: {
    initialCredits: 10000,
    billingCycle: 'monthly',
    perModulePricing: {
      'onboarding': { price: 5, includedTransactions: 1000 },
      'rekyc': { price: 3, includedTransactions: 500 },
    },
  },
  features: {
    nonVisitorOnboarding: true,
    requireOnboarding: true,
    generateCertificate: true,
    proactiveMonitoring: true,
    sandboxMode: true,
    eligibleForFinance: false,
    watermarkCompression: false,
    activeLiveness: true,
    passiveLiveness: true,
  },
};

export default function OnboardClient() {
  const navigate = useNavigate();
  const [data, setData] = useState<OnboardingData>(initialData);
  
  // Government flow state
  const [govStep, setGovStep] = useState(0);
  
  // Private flow state
  const [privateStep, setPrivateStep] = useState<PrivateStep>('org-details');
  const [currentServiceConfig, setCurrentServiceConfig] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'module-config': true,
  });

  // Get enabled journeys that need configuration
  const enabledKYCJourneys = data.modules.kyc.journeys.filter(j => j.enabled);
  const enabledAuthServices = data.modules.authentication.services.filter(s => s.enabled);
  const enabledValidationServices = data.modules.validation.services.filter(s => s.enabled);

  // Calculate total selected services
  const totalSelectedServices = 
    enabledKYCJourneys.length + 
    enabledAuthServices.length + 
    enabledValidationServices.length +
    (data.modules.additional.populationMigration ? 1 : 0);

  const totalSelectedAPIModules = data.modules.api.modules.filter(m => m.enabled).length;

  // Handle organization type selection
  const selectOrgType = (type: OrganizationType) => {
    setData({ ...data, organizationType: type });
  };

  // Toggle section expansion in sidebar
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle complete onboarding
  const handleComplete = () => {
    console.log('Onboarding Data:', data);
    // TODO: Submit to API
    navigate('/console/organizations');
  };

  // Render organization type selection
  if (!data.organizationType) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Onboard New Client</h1>
            <p className="text-muted-foreground">
              Select the organization type to begin the onboarding process
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Government Option */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors group"
              onClick={() => selectOrgType('government')}
            >
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Government Organization</CardTitle>
                <CardDescription>
                  Simplified 2-step onboarding for government entities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                    <Zap className="h-3 w-3" /> Quick Setup
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                    <Key className="h-3 w-3" /> Auto Credentials
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Private Option */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors group"
              onClick={() => selectOrgType('private')}
            >
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Private Organization</CardTitle>
                <CardDescription>
                  Comprehensive 6-step onboarding with full configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                    <Settings className="h-3 w-3" /> Module Config
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                    <CreditCard className="h-3 w-3" /> Custom Pricing
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                    <Key className="h-3 w-3" /> API Keys
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate('/console/organizations')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Organizations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render Government flow
  if (data.organizationType === 'government') {
    return (
      <GovernmentFlow
        data={data}
        step={govStep}
        setStep={setGovStep}
        setData={setData}
        onComplete={handleComplete}
        onBack={() => setData({ ...data, organizationType: null })}
      />
    );
  }

  // Render Private flow
  return (
    <PrivateFlow
      data={data}
      setData={setData}
      currentStep={privateStep}
      setCurrentStep={setPrivateStep}
      currentServiceConfig={currentServiceConfig}
      setCurrentServiceConfig={setCurrentServiceConfig}
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      enabledKYCJourneys={enabledKYCJourneys}
      enabledAuthServices={enabledAuthServices}
      enabledValidationServices={enabledValidationServices}
      totalSelectedServices={totalSelectedServices}
      totalSelectedAPIModules={totalSelectedAPIModules}
      onComplete={handleComplete}
      onBack={() => setData({ ...data, organizationType: null })}
    />
  );
}

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
      {/* Sidebar */}
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

      {/* Main Content */}
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
                <Input
                  id="orgName"
                  value={data.organization.name}
                  onChange={(e) => setData({
                    ...data,
                    organization: { ...data.organization, name: e.target.value }
                  })}
                  placeholder="Enter organization name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="orgEmail">Organization Email *</Label>
                <Input
                  id="orgEmail"
                  type="email"
                  value={data.organization.email}
                  onChange={(e) => setData({
                    ...data,
                    organization: { ...data.organization, email: e.target.value }
                  })}
                  placeholder="organization@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="orgPhone">Organization Phone *</Label>
                <Input
                  id="orgPhone"
                  type="tel"
                  value={data.organization.phone}
                  onChange={(e) => setData({
                    ...data,
                    organization: { ...data.organization, phone: e.target.value }
                  })}
                  placeholder="+971 XX XXX XXXX"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Format: +971 XX XXX XXXX</p>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={onBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(1)} disabled={!canProceedStep1}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
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
                <Input
                  id="address"
                  value={data.organization.address}
                  onChange={(e) => setData({
                    ...data,
                    organization: { ...data.organization, address: e.target.value }
                  })}
                  placeholder="Enter address"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select
                    value={data.organization.city}
                    onValueChange={(value) => setData({
                      ...data,
                      organization: { ...data.organization, city: value }
                    })}
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
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={data.organization.country}
                    onValueChange={(value) => setData({
                      ...data,
                      organization: { ...data.organization, country: value }
                    })}
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
              </div>
              <div>
                <Label htmlFor="contactName">Primary Contact Name *</Label>
                <Input
                  id="contactName"
                  value={data.primaryContact.name}
                  onChange={(e) => setData({
                    ...data,
                    primaryContact: { ...data.primaryContact, name: e.target.value }
                  })}
                  placeholder="Enter contact name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Primary Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={data.primaryContact.email}
                  onChange={(e) => setData({
                    ...data,
                    primaryContact: { ...data.primaryContact, email: e.target.value }
                  })}
                  placeholder="contact@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
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

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={onComplete} disabled={!canProceedStep2}>
                Complete Onboarding
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Private Flow Component
function PrivateFlow({
  data,
  setData,
  currentStep,
  setCurrentStep,
  currentServiceConfig,
  setCurrentServiceConfig,
  expandedSections,
  toggleSection,
  enabledKYCJourneys,
  enabledAuthServices,
  enabledValidationServices,
  totalSelectedServices,
  totalSelectedAPIModules,
  onComplete,
  onBack,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  currentStep: PrivateStep;
  setCurrentStep: (step: PrivateStep) => void;
  currentServiceConfig: string | null;
  setCurrentServiceConfig: (service: string | null) => void;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  enabledKYCJourneys: KYCJourney[];
  enabledAuthServices: AuthService[];
  enabledValidationServices: ValidationService[];
  totalSelectedServices: number;
  totalSelectedAPIModules: number;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  
  // Track which sub-item within a service we're configuring (e.g., 0 = first journey, 1 = second journey)
  const [currentServiceSubIndex, setCurrentServiceSubIndex] = useState(0);

  // Check step completion
  const isOrgDetailsComplete = data.organization.name && data.organization.email && 
    data.organization.phone && data.rootUser.name && data.rootUser.email && data.rootUser.password;
  
  const isModuleConfigComplete = totalSelectedServices > 0 || totalSelectedAPIModules > 0;
  
  // Define parent services that need configuration (with their sub-items)
  const servicesToConfigure: {
    type: 'kyc' | 'auth' | 'validation';
    name: string;
    icon: typeof Shield;
    items: { id: string; name: string }[];
  }[] = [];

  if (enabledKYCJourneys.length > 0) {
    servicesToConfigure.push({
      type: 'kyc',
      name: 'KYC Service',
      icon: Shield,
      items: enabledKYCJourneys.map(j => ({ id: j.id, name: j.name })),
    });
  }

  if (enabledAuthServices.length > 0) {
    servicesToConfigure.push({
      type: 'auth',
      name: 'Authentication Service',
      icon: ScanFace,
      items: enabledAuthServices.map(s => ({ id: s.id, name: s.name })),
    });
  }

  if (enabledValidationServices.length > 0) {
    servicesToConfigure.push({
      type: 'validation',
      name: 'Validation Service',
      icon: FileText,
      items: enabledValidationServices.map(s => ({ id: s.id, name: s.name })),
    });
  }

  // Get current service being configured
  const currentServiceType = currentServiceConfig;
  const currentService = servicesToConfigure.find(s => s.type === currentServiceType);
  const currentItem = currentService?.items[currentServiceSubIndex];

  // Get service index
  const currentServiceIndex = currentServiceType 
    ? servicesToConfigure.findIndex(s => s.type === currentServiceType)
    : -1;

  // Navigate to next service config or next step
  const navigateAfterServiceSelection = () => {
    if (servicesToConfigure.length > 0) {
      setCurrentServiceConfig(servicesToConfigure[0].type);
      setCurrentServiceSubIndex(0);
    } else {
      setCurrentStep('pricing');
    }
  };

  // Navigate to next item or next service
  const goToNextService = () => {
    if (!currentService) return;
    
    // If there are more items in current service
    if (currentServiceSubIndex < currentService.items.length - 1) {
      setCurrentServiceSubIndex(currentServiceSubIndex + 1);
    } 
    // Move to next service
    else if (currentServiceIndex < servicesToConfigure.length - 1) {
      setCurrentServiceConfig(servicesToConfigure[currentServiceIndex + 1].type);
      setCurrentServiceSubIndex(0);
    } 
    // All services configured, move to pricing
    else {
      setCurrentServiceConfig(null);
      setCurrentStep('pricing');
    }
  };

  // Navigate to previous item or previous service
  const goToPrevService = () => {
    if (!currentService) return;
    
    // If there are previous items in current service
    if (currentServiceSubIndex > 0) {
      setCurrentServiceSubIndex(currentServiceSubIndex - 1);
    }
    // Move to previous service (last item)
    else if (currentServiceIndex > 0) {
      const prevService = servicesToConfigure[currentServiceIndex - 1];
      setCurrentServiceConfig(prevService.type);
      setCurrentServiceSubIndex(prevService.items.length - 1);
    }
    // Go back to module selection
    else {
      setCurrentServiceConfig(null);
      setCurrentServiceSubIndex(0);
    }
  };

  // Check if a service is complete (all items configured)
  const isServiceComplete = (serviceType: string) => {
    if (!currentServiceType) return false;
    const serviceIdx = servicesToConfigure.findIndex(s => s.type === serviceType);
    const currentIdx = servicesToConfigure.findIndex(s => s.type === currentServiceType);
    return serviceIdx < currentIdx;
  };

  // Check if a service is active
  const isServiceActive = (serviceType: string) => {
    return currentServiceType === serviceType;
  };

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
            isActive={currentStep === 'org-details' && !currentServiceConfig}
            isComplete={!!isOrgDetailsComplete && currentStep !== 'org-details'}
            onClick={() => { setCurrentStep('org-details'); setCurrentServiceConfig(null); }}
          />
          
          {/* Module Configuration */}
          <div>
            <button
              onClick={() => toggleSection('module-config')}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                currentStep === 'module-config' || currentServiceConfig
                  ? "bg-primary/10 text-primary"
                  : isModuleConfigComplete
                    ? "text-foreground"
                    : "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
                  currentStep === 'module-config' || currentServiceConfig
                    ? "bg-primary text-primary-foreground"
                    : isModuleConfigComplete
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}>
                  {isModuleConfigComplete && currentStep !== 'module-config' && !currentServiceConfig ? (
                    <Check className="h-3 w-3" />
                  ) : '2'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Module Configuration</p>
                  <p className="text-xs text-muted-foreground">Journey & verification setup</p>
                </div>
              </div>
              {expandedSections['module-config'] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections['module-config'] && servicesToConfigure.length > 0 && (
              <div className="ml-9 mt-1 space-y-1 border-l-2 border-border pl-3">
                {servicesToConfigure.map((service) => {
                  const isActive = isServiceActive(service.type);
                  const isComplete = isServiceComplete(service.type);
                  const ServiceIcon = service.icon;
                  
                  return (
                    <button
                      key={service.type}
                      onClick={() => {
                        setCurrentStep('module-config');
                        setCurrentServiceConfig(service.type);
                        setCurrentServiceSubIndex(0);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : isComplete
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isComplete ? (
                          <Check className="h-3 w-3 text-primary" />
                        ) : (
                          <ServiceIcon className="h-3 w-3" />
                        )}
                        <span>{service.name}</span>
                      </div>
                      {isActive && (
                        <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded">
                          {currentServiceSubIndex + 1}/{service.items.length}
                        </span>
                      )}
                      {isComplete && (
                        <span className="text-xs text-muted-foreground">
                          {service.items.length}/{service.items.length}
                        </span>
                      )}
                    </button>
                  );
                })}
                {totalSelectedAPIModules > 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">API</span>
                    {totalSelectedAPIModules} modules
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Pricing & Credits */}
          <SidebarStep
            number={3}
            title="Pricing & Credits"
            description="Pricing configuration"
            isActive={currentStep === 'pricing' && !currentServiceConfig}
            isComplete={currentStep === 'features'}
            onClick={() => { setCurrentStep('pricing'); setCurrentServiceConfig(null); }}
          />
          
          {/* Additional Features */}
          <SidebarStep
            number={4}
            title="Additional Features"
            description="Extra configurations"
            isActive={currentStep === 'features' && !currentServiceConfig}
            isComplete={false}
            onClick={() => { setCurrentStep('features'); setCurrentServiceConfig(null); }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl">
          {/* Organization Details Step */}
          {currentStep === 'org-details' && !currentServiceConfig && (
            <OrgDetailsStep
              data={data}
              setData={setData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onBack={onBack}
              onNext={() => setCurrentStep('module-config')}
              canProceed={!!isOrgDetailsComplete}
            />
          )}

          {/* Module Configuration Step */}
          {currentStep === 'module-config' && !currentServiceConfig && (
            <ModuleConfigStep
              data={data}
              setData={setData}
              totalSelectedServices={totalSelectedServices}
              totalSelectedAPIModules={totalSelectedAPIModules}
              onBack={() => setCurrentStep('org-details')}
              onNext={navigateAfterServiceSelection}
            />
          )}

          {/* Service Configuration Sub-steps */}
          {currentServiceConfig && currentItem && (
            <ServiceConfigStep
              data={data}
              setData={setData}
              serviceId={currentItem.id}
              serviceName={currentItem.name}
              serviceType={currentServiceConfig as 'kyc' | 'auth' | 'validation'}
              parentServiceName={currentService?.name || ''}
              currentIndex={currentServiceSubIndex}
              totalItems={currentService?.items.length || 0}
              onBack={goToPrevService}
              onNext={goToNextService}
              isFirstItem={currentServiceIndex === 0 && currentServiceSubIndex === 0}
              isLastItem={
                currentServiceIndex === servicesToConfigure.length - 1 && 
                currentServiceSubIndex === (currentService?.items.length || 1) - 1
              }
            />
          )}

          {/* Pricing Step */}
          {currentStep === 'pricing' && !currentServiceConfig && (
            <PricingStep
              data={data}
              setData={setData}
              enabledKYCJourneys={enabledKYCJourneys}
              onBack={() => {
                if (servicesToConfigure.length > 0) {
                  const lastService = servicesToConfigure[servicesToConfigure.length - 1];
                  setCurrentServiceConfig(lastService.type);
                  setCurrentServiceSubIndex(lastService.items.length - 1);
                } else {
                  setCurrentStep('module-config');
                }
              }}
              onNext={() => setCurrentStep('features')}
            />
          )}

          {/* Features Step */}
          {currentStep === 'features' && !currentServiceConfig && (
            <FeaturesStep
              data={data}
              setData={setData}
              onBack={() => setCurrentStep('pricing')}
              onComplete={onComplete}
            />
          )}
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
  showPassword,
  setShowPassword,
  onBack,
  onNext,
  canProceed,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
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
            <Label htmlFor="orgCategory">Organization Category *</Label>
            <Select
              value={data.organization.category}
              onValueChange={(value) => setData({
                ...data,
                organization: { ...data.organization, category: value }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {ORGANIZATION_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="regNumber">Registration Number</Label>
            <Input
              id="regNumber"
              value={data.organization.registrationNumber}
              onChange={(e) => setData({
                ...data,
                organization: { ...data.organization, registrationNumber: e.target.value }
              })}
              placeholder="REG-2024-XXXXX"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="orgEmail">Organization Email *</Label>
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
          <div className="md:col-span-2">
            <Label htmlFor="orgPhone">Organization Phone *</Label>
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
            <Select
              value={data.organization.city}
              onValueChange={(value) => setData({
                ...data,
                organization: { ...data.organization, city: value }
              })}
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
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select
              value={data.organization.country}
              onValueChange={(value) => setData({
                ...data,
                organization: { ...data.organization, country: value }
              })}
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
        </div>
      </div>

      {/* Root User */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h3 className="text-lg font-semibold">Root User / Admin</h3>
          <p className="text-sm text-muted-foreground">Primary contact and admin credentials</p>
        </div>
        
        <div className="p-3 bg-muted/50 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Root user will be the primary contact
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

// Module Configuration Step
function ModuleConfigStep({
  data,
  setData,
  totalSelectedServices,
  totalSelectedAPIModules,
  onBack,
  onNext,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  totalSelectedServices: number;
  totalSelectedAPIModules: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const toggleKYCJourney = (journeyId: string) => {
    const journeys = data.modules.kyc.journeys.map(j =>
      j.id === journeyId ? { ...j, enabled: !j.enabled } : j
    );
    const hasEnabled = journeys.some(j => j.enabled);
    setData({
      ...data,
      modules: {
        ...data.modules,
        kyc: { ...data.modules.kyc, enabled: hasEnabled, journeys }
      }
    });
  };

  const toggleAuthService = (serviceId: string) => {
    const services = data.modules.authentication.services.map(s =>
      s.id === serviceId ? { ...s, enabled: !s.enabled } : s
    );
    const hasEnabled = services.some(s => s.enabled);
    setData({
      ...data,
      modules: {
        ...data.modules,
        authentication: { ...data.modules.authentication, enabled: hasEnabled, services }
      }
    });
  };

  const toggleValidationService = (serviceId: string) => {
    const services = data.modules.validation.services.map(s =>
      s.id === serviceId ? { ...s, enabled: !s.enabled } : s
    );
    const hasEnabled = services.some(s => s.enabled);
    setData({
      ...data,
      modules: {
        ...data.modules,
        validation: { ...data.modules.validation, enabled: hasEnabled, services }
      }
    });
  };

  const toggleAPIModule = (moduleId: string) => {
    const modules = data.modules.api.modules.map(m =>
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    );
    const hasEnabled = modules.some(m => m.enabled);
    setData({
      ...data,
      modules: {
        ...data.modules,
        api: { ...data.modules.api, enabled: hasEnabled, modules }
      }
    });
  };

  const toggleAllAPIModules = (enabled: boolean, disableSection = false) => {
    const modules = data.modules.api.modules.map(m => ({ ...m, enabled }));
    setData({
      ...data,
      modules: {
        ...data.modules,
        api: { ...data.modules.api, enabled: disableSection ? false : data.modules.api.enabled, modules }
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Module Configuration</h2>
          <p className="text-muted-foreground">Select and configure services for this organization</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{data.organization.name || 'Organization'}</p>
          <p className="text-sm text-muted-foreground">{totalSelectedServices} Services Selected</p>
        </div>
      </div>

      {/* Configurable Services */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Configurable Services</h3>
          <p className="text-sm text-muted-foreground">Requires Setup</p>
        </div>

        {/* KYC Service */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">KYC Service</CardTitle>
                  <CardDescription>Identity verification journeys</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.modules.kyc.journeys.map(journey => (
                <label
                  key={journey.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                    journey.enabled
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Checkbox
                    checked={journey.enabled}
                    onCheckedChange={() => toggleKYCJourney(journey.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{journey.name}</p>
                    <p className="text-xs text-muted-foreground">{journey.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Authentication Service */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ScanFace className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Authentication Service</CardTitle>
                  <CardDescription>User verification methods</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.modules.authentication.services.map(service => (
                <label
                  key={service.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                    service.enabled
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Checkbox
                    checked={service.enabled}
                    onCheckedChange={() => toggleAuthService(service.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Validation Service */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Validation Service</CardTitle>
                  <CardDescription>Document validation APIs</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.modules.validation.services.map(service => (
                <label
                  key={service.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                    service.enabled
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Checkbox
                    checked={service.enabled}
                    onCheckedChange={() => toggleValidationService(service.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Services */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Additional Services</CardTitle>
                <CardDescription>Extended service options</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                data.modules.additional.populationMigration
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <Checkbox
                checked={data.modules.additional.populationMigration}
                onCheckedChange={(checked) => setData({
                  ...data,
                  modules: {
                    ...data.modules,
                    additional: { ...data.modules.additional, populationMigration: !!checked }
                  }
                })}
              />
              <div>
                <p className="text-sm font-medium">Population Migration</p>
                <p className="text-xs text-muted-foreground">Bulk data migration service</p>
              </div>
            </label>
            <label
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                data.modules.additional.biometricVerification
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <Checkbox
                checked={data.modules.additional.biometricVerification}
                onCheckedChange={(checked) => setData({
                  ...data,
                  modules: {
                    ...data.modules,
                    additional: { ...data.modules.additional, biometricVerification: !!checked }
                  }
                })}
              />
              <div>
                <p className="text-sm font-medium">Biometric Verification</p>
                <p className="text-xs text-muted-foreground">Include biometric identity verification</p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* API Modules */}
      <Card className={cn(!data.modules.api.enabled && "opacity-60")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Code className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">API Modules</CardTitle>
                <CardDescription>
                  {totalSelectedAPIModules}/{data.modules.api.modules.length} Individual API endpoints
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={data.modules.api.enabled}
              onCheckedChange={(checked) => {
                if (!checked) {
                  toggleAllAPIModules(false, true);
                } else {
                  setData({
                    ...data,
                    modules: {
                      ...data.modules,
                      api: { ...data.modules.api, enabled: true }
                    }
                  });
                }
              }}
            />
          </div>
        </CardHeader>
        {data.modules.api.enabled && (
          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={data.modules.api.modules.every(m => m.enabled)}
                  onCheckedChange={(checked) => toggleAllAPIModules(!!checked)}
                />
                <span className="text-sm font-medium">Select All</span>
              </label>
              <span className="text-sm text-muted-foreground">
                {totalSelectedAPIModules} selected
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.modules.api.modules.map(module => (
                <label
                  key={module.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors text-sm",
                    module.enabled
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Checkbox
                    checked={module.enabled}
                    onCheckedChange={() => toggleAPIModule(module.id)}
                  />
                  <span className="truncate">{module.name}</span>
                </label>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={onNext} disabled={totalSelectedServices === 0 && totalSelectedAPIModules === 0}>
          Configure Selected Services
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Service Configuration Step (for KYC journeys)
function ServiceConfigStep({
  data,
  setData,
  serviceId,
  serviceName,
  serviceType,
  parentServiceName,
  currentIndex,
  totalItems,
  onBack,
  onNext,
  isFirstItem,
  isLastItem,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  serviceId: string;
  serviceName: string;
  serviceType: 'kyc' | 'auth' | 'validation';
  parentServiceName: string;
  currentIndex: number;
  totalItems: number;
  onBack: () => void;
  onNext: () => void;
  isFirstItem: boolean;
  isLastItem: boolean;
}) {
  // Generate journey ID if not exists
  const journeyId = generateJourneyId(serviceName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 10));

  // Get or initialize config
  const journey = data.modules.kyc.journeys.find(j => j.id === serviceId);
  const config: JourneyConfig = journey?.config || {
    journeyId,
    documentsAllowed: {
      emiratesId: { enabled: true, method: 'all' },
      passport: { enabled: true, method: 'all' },
      gccId: { enabled: false, method: 'scan' },
    },
    verificationMethods: {
      faceRecognition: true,
      fingerprint: false,
    },
    deliveryChannels: {
      sdk: true,
      remoteLink: false,
      headless: false,
    },
    responseTemplate: {
      personalInfo: [],
      activePassport: [],
      contactDetails: [],
      travelDetail: [],
      residenceInfo: [],
      familyBook: [],
      sponsorDetails: [],
      tradeLicense: [],
      immigrationFile: [],
      sponsorContactDetails: [],
      activeVisa: [],
      documents: [],
    },
  };

  const updateConfig = (updates: Partial<JourneyConfig>) => {
    const newConfig = { ...config, ...updates };
    const journeys = data.modules.kyc.journeys.map(j =>
      j.id === serviceId ? { ...j, config: newConfig } : j
    );
    setData({
      ...data,
      modules: {
        ...data.modules,
        kyc: { ...data.modules.kyc, journeys }
      }
    });
  };

  // Get or initialize validation config for validation services
  const validationService = data.modules.validation.services.find(s => s.id === serviceId);
  const validationConfig: ValidationConfig = validationService?.config || {
    apiBased: {
      enabled: true,
      pricePerCall: 1,
      apiHitLimit: 70000,
    },
    batchProcessing: {
      enabled: true,
      pricePerRecord: 0.5,
      batchHitLimit: 30000,
      maxRecordsPerBatch: 1000,
      maxFiles: 10,
    },
  };

  const updateValidationConfig = (updates: Partial<ValidationConfig>) => {
    const newConfig = { ...validationConfig, ...updates };
    const services = data.modules.validation.services.map(s =>
      s.id === serviceId ? { ...s, config: newConfig } : s
    );
    setData({
      ...data,
      modules: {
        ...data.modules,
        validation: { ...data.modules.validation, services }
      }
    });
  };

  // For Validation services, show Processing Modes config
  if (serviceType === 'validation') {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{parentServiceName}</span>
              <span>•</span>
              <span>{currentIndex + 1}/{totalItems}</span>
            </div>
            <h2 className="text-2xl font-bold">{serviceName} Configuration</h2>
          </div>
          <p className="text-sm text-muted-foreground">{data.organization.name}</p>
        </div>

        {/* Processing Modes */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Processing Modes</h3>
            <p className="text-sm text-muted-foreground">Select how this service will be accessed</p>
          </div>

          {/* API Based */}
          <div className={cn(
            "p-4 rounded-xl border space-y-4",
            validationConfig.apiBased.enabled ? "border-primary bg-primary/5" : "border-border"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={validationConfig.apiBased.enabled}
                  onCheckedChange={(checked) => updateValidationConfig({
                    apiBased: { ...validationConfig.apiBased, enabled: checked }
                  })}
                />
                <div>
                  <p className="font-medium">API Based</p>
                  <p className="text-sm text-muted-foreground">Real-time API validation</p>
                </div>
              </div>
            </div>

            {validationConfig.apiBased.enabled && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePerCall">Price per Call (AED)</Label>
                      <Input
                        id="pricePerCall"
                        type="number"
                        min="0"
                        step="0.01"
                        value={validationConfig.apiBased.pricePerCall}
                        onChange={(e) => updateValidationConfig({
                          apiBased: { ...validationConfig.apiBased, pricePerCall: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apiHitLimit">API Hit Limit</Label>
                      <Input
                        id="apiHitLimit"
                        type="number"
                        min="0"
                        value={validationConfig.apiBased.apiHitLimit}
                        onChange={(e) => updateValidationConfig({
                          apiBased: { ...validationConfig.apiBased, apiHitLimit: parseInt(e.target.value) || 0 }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Batch Processing */}
          <div className={cn(
            "p-4 rounded-xl border space-y-4",
            validationConfig.batchProcessing.enabled ? "border-primary bg-primary/5" : "border-border"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={validationConfig.batchProcessing.enabled}
                  onCheckedChange={(checked) => updateValidationConfig({
                    batchProcessing: { ...validationConfig.batchProcessing, enabled: checked }
                  })}
                />
                <div>
                  <p className="font-medium">Batch Processing</p>
                  <p className="text-sm text-muted-foreground">Bulk validation via CSV</p>
                </div>
              </div>
            </div>

            {validationConfig.batchProcessing.enabled && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Batch Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePerRecord">Price per Record (AED)</Label>
                      <Input
                        id="pricePerRecord"
                        type="number"
                        min="0"
                        step="0.01"
                        value={validationConfig.batchProcessing.pricePerRecord}
                        onChange={(e) => updateValidationConfig({
                          batchProcessing: { ...validationConfig.batchProcessing, pricePerRecord: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="batchHitLimit">Batch Hit Limit</Label>
                      <Input
                        id="batchHitLimit"
                        type="number"
                        min="0"
                        value={validationConfig.batchProcessing.batchHitLimit}
                        onChange={(e) => updateValidationConfig({
                          batchProcessing: { ...validationConfig.batchProcessing, batchHitLimit: parseInt(e.target.value) || 0 }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxRecordsPerBatch">Max Records per Batch</Label>
                      <Input
                        id="maxRecordsPerBatch"
                        type="number"
                        min="1"
                        value={validationConfig.batchProcessing.maxRecordsPerBatch}
                        onChange={(e) => updateValidationConfig({
                          batchProcessing: { ...validationConfig.batchProcessing, maxRecordsPerBatch: parseInt(e.target.value) || 1 }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxFiles">Max Files</Label>
                      <Input
                        id="maxFiles"
                        type="number"
                        min="1"
                        value={validationConfig.batchProcessing.maxFiles}
                        onChange={(e) => updateValidationConfig({
                          batchProcessing: { ...validationConfig.batchProcessing, maxFiles: parseInt(e.target.value) || 1 }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-border">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {isFirstItem ? 'Back to Modules' : 'Previous'}
          </Button>
          <Button onClick={onNext}>
            {isLastItem ? 'Continue to Pricing' : 'Next'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // For Auth services, show same config as KYC (keep serviceType check)
  if (serviceType === 'auth') {
    // Clone the journey config for auth (same UI as KYC)
    const authService = data.modules.authentication.services.find(s => s.id === serviceId);
    const authConfig = (authService as any)?.config || config;

    const updateAuthConfig = (updates: Partial<JourneyConfig>) => {
      const newConfig = { ...authConfig, ...updates };
      const services = data.modules.authentication.services.map(s =>
        s.id === serviceId ? { ...s, config: newConfig } : s
      );
      setData({
        ...data,
        modules: {
          ...data.modules,
          authentication: { ...data.modules.authentication, services }
        }
      });
    };

    const authToggleTemplateField = (category: keyof typeof authConfig.responseTemplate, field: string) => {
      const currentFields = authConfig.responseTemplate?.[category] || [];
      const newFields = currentFields.includes(field)
        ? currentFields.filter((f: string) => f !== field)
        : [...currentFields, field];
      updateAuthConfig({
        responseTemplate: {
          ...authConfig.responseTemplate,
          [category]: newFields
        }
      });
    };

    const authGetTotalSelectedFields = () => {
      if (!authConfig.responseTemplate) return 0;
      return Object.values(authConfig.responseTemplate).reduce((sum: number, arr: any) => sum + (arr?.length || 0), 0);
    };

    const [authExpandedTemplates, setAuthExpandedTemplates] = useState<Record<string, boolean>>({});

    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{parentServiceName}</span>
              <span>•</span>
              <span>{currentIndex + 1}/{totalItems}</span>
            </div>
            <h2 className="text-2xl font-bold">{serviceName} Configuration</h2>
            <p className="text-sm text-muted-foreground font-mono">{authConfig.journeyId || journeyId}</p>
          </div>
          <p className="text-sm text-muted-foreground">{data.organization.name}</p>
        </div>

        {/* Documents Allowed */}
        <div className="space-y-4">
          <h3 className="font-semibold">Documents Allowed</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Emirates ID */}
            <div className={cn(
              "p-4 rounded-xl border",
              authConfig.documentsAllowed?.emiratesId?.enabled ? "border-primary bg-primary/5" : "border-border"
            )}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Emirates ID</span>
                <Switch
                  checked={authConfig.documentsAllowed?.emiratesId?.enabled ?? true}
                  onCheckedChange={(checked) => updateAuthConfig({
                    documentsAllowed: {
                      ...authConfig.documentsAllowed,
                      emiratesId: { ...authConfig.documentsAllowed?.emiratesId, enabled: checked }
                    }
                  })}
                />
              </div>
              <Select
                value={authConfig.documentsAllowed?.emiratesId?.method || 'all'}
                onValueChange={(value: 'scan' | 'manual' | 'all') => updateAuthConfig({
                  documentsAllowed: {
                    ...authConfig.documentsAllowed,
                    emiratesId: { ...authConfig.documentsAllowed?.emiratesId, method: value }
                  }
                })}
                disabled={!authConfig.documentsAllowed?.emiratesId?.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All (Scan + Manual)</SelectItem>
                  <SelectItem value="scan">Scan Only</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Passport */}
            <div className={cn(
              "p-4 rounded-xl border",
              authConfig.documentsAllowed?.passport?.enabled ? "border-primary bg-primary/5" : "border-border"
            )}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Passport</span>
                <Switch
                  checked={authConfig.documentsAllowed?.passport?.enabled ?? true}
                  onCheckedChange={(checked) => updateAuthConfig({
                    documentsAllowed: {
                      ...authConfig.documentsAllowed,
                      passport: { ...authConfig.documentsAllowed?.passport, enabled: checked }
                    }
                  })}
                />
              </div>
              <Select
                value={authConfig.documentsAllowed?.passport?.method || 'all'}
                onValueChange={(value: 'scan' | 'manual' | 'all') => updateAuthConfig({
                  documentsAllowed: {
                    ...authConfig.documentsAllowed,
                    passport: { ...authConfig.documentsAllowed?.passport, method: value }
                  }
                })}
                disabled={!authConfig.documentsAllowed?.passport?.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All (Scan + Manual)</SelectItem>
                  <SelectItem value="scan">Scan Only</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* GCC ID */}
            <div className={cn(
              "p-4 rounded-xl border",
              authConfig.documentsAllowed?.gccId?.enabled ? "border-primary bg-primary/5" : "border-border"
            )}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">GCC ID</span>
                <Switch
                  checked={authConfig.documentsAllowed?.gccId?.enabled ?? false}
                  onCheckedChange={(checked) => updateAuthConfig({
                    documentsAllowed: {
                      ...authConfig.documentsAllowed,
                      gccId: { ...authConfig.documentsAllowed?.gccId, enabled: checked }
                    }
                  })}
                />
              </div>
              <Select
                value={authConfig.documentsAllowed?.gccId?.method || 'scan'}
                onValueChange={(value: 'scan' | 'manual' | 'all') => updateAuthConfig({
                  documentsAllowed: {
                    ...authConfig.documentsAllowed,
                    gccId: { ...authConfig.documentsAllowed?.gccId, method: value }
                  }
                })}
                disabled={!authConfig.documentsAllowed?.gccId?.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All (Scan + Manual)</SelectItem>
                  <SelectItem value="scan">Scan Only</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Verification Methods */}
        <div className="space-y-4">
          <h3 className="font-semibold">Verification Methods</h3>
          <div className="flex flex-wrap gap-4">
            <label className={cn(
              "flex items-center gap-3 p-4 rounded-xl border cursor-pointer",
              authConfig.verificationMethods?.faceRecognition ? "border-primary bg-primary/5" : "border-border"
            )}>
              <Checkbox
                checked={authConfig.verificationMethods?.faceRecognition ?? true}
                onCheckedChange={(checked) => updateAuthConfig({
                  verificationMethods: { ...authConfig.verificationMethods, faceRecognition: !!checked }
                })}
              />
              <div className="flex items-center gap-2">
                <ScanFace className="h-5 w-5 text-primary" />
                <span className="font-medium">Face Recognition</span>
              </div>
            </label>
            <label className={cn(
              "flex items-center gap-3 p-4 rounded-xl border cursor-pointer",
              authConfig.verificationMethods?.fingerprint ? "border-primary bg-primary/5" : "border-border"
            )}>
              <Checkbox
                checked={authConfig.verificationMethods?.fingerprint ?? false}
                onCheckedChange={(checked) => updateAuthConfig({
                  verificationMethods: { ...authConfig.verificationMethods, fingerprint: !!checked }
                })}
              />
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                <span className="font-medium">Fingerprint</span>
              </div>
            </label>
          </div>
        </div>

        {/* Delivery Channels */}
        <div className="space-y-4">
          <h3 className="font-semibold">Delivery Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={cn(
              "flex items-center gap-3 p-4 rounded-xl border cursor-pointer",
              authConfig.deliveryChannels?.sdk ? "border-primary bg-primary/5" : "border-border"
            )}>
              <Checkbox
                checked={authConfig.deliveryChannels?.sdk ?? true}
                onCheckedChange={(checked) => updateAuthConfig({
                  deliveryChannels: { ...authConfig.deliveryChannels, sdk: !!checked }
                })}
              />
              <div>
                <p className="font-medium">SDK</p>
                <p className="text-xs text-muted-foreground">Mobile & Web SDK</p>
              </div>
            </label>
            <label className={cn(
              "flex items-center gap-3 p-4 rounded-xl border cursor-pointer",
              authConfig.deliveryChannels?.remoteLink ? "border-primary bg-primary/5" : "border-border"
            )}>
              <Checkbox
                checked={authConfig.deliveryChannels?.remoteLink ?? false}
                onCheckedChange={(checked) => updateAuthConfig({
                  deliveryChannels: { ...authConfig.deliveryChannels, remoteLink: !!checked }
                })}
              />
              <div>
                <p className="font-medium">Remote Link</p>
                <p className="text-xs text-muted-foreground">Share via URL</p>
              </div>
            </label>
            <label className={cn(
              "flex items-center gap-3 p-4 rounded-xl border cursor-pointer",
              authConfig.deliveryChannels?.headless ? "border-primary bg-primary/5" : "border-border"
            )}>
              <Checkbox
                checked={authConfig.deliveryChannels?.headless ?? false}
                onCheckedChange={(checked) => updateAuthConfig({
                  deliveryChannels: { ...authConfig.deliveryChannels, headless: !!checked }
                })}
              />
              <div>
                <p className="font-medium">Headless</p>
                <p className="text-xs text-muted-foreground">API only</p>
              </div>
            </label>
          </div>
        </div>

        {/* Response Template */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Response Template</h3>
              <p className="text-sm text-muted-foreground">Select fields to include in response</p>
            </div>
            <span className="text-sm text-muted-foreground">
              {authGetTotalSelectedFields()} fields selected
            </span>
          </div>

          <div className="space-y-2">
            {Object.entries(RESPONSE_TEMPLATE_FIELDS).map(([category, fields]) => (
              <div key={category} className="border rounded-xl">
                <button
                  onClick={() => setAuthExpandedTemplates(prev => ({ ...prev, [category]: !prev[category] }))}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-xs text-muted-foreground">
                      ({authConfig.responseTemplate?.[category as keyof typeof config.responseTemplate]?.length || 0}/{fields.length})
                    </span>
                  </div>
                  {authExpandedTemplates[category] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {authExpandedTemplates[category] && (
                  <div className="p-3 pt-0 border-t">
                    <div className="flex flex-wrap gap-2">
                      {fields.map(field => (
                        <label
                          key={field}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors",
                            authConfig.responseTemplate?.[category as keyof typeof config.responseTemplate]?.includes(field)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          <Checkbox
                            checked={authConfig.responseTemplate?.[category as keyof typeof config.responseTemplate]?.includes(field) || false}
                            onCheckedChange={() => authToggleTemplateField(category as keyof typeof config.responseTemplate, field)}
                            className="hidden"
                          />
                          {field}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-border">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {isFirstItem ? 'Back to Modules' : 'Previous'}
          </Button>
          <Button onClick={onNext}>
            {isLastItem ? 'Continue to Pricing' : 'Next'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // For non-KYC/Auth/Validation services, show placeholder
  if (serviceType !== 'kyc') {
    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{parentServiceName}</span>
              <span>•</span>
              <span>{currentIndex + 1}/{totalItems}</span>
            </div>
            <h2 className="text-2xl font-bold">{serviceName} Configuration</h2>
          </div>
          <p className="text-sm text-muted-foreground">{data.organization.name}</p>
        </div>

        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Configuration for {serviceName} will be available after onboarding.</p>
            <p className="text-sm mt-2">Default settings will be applied.</p>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-6 border-t border-border">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {isFirstItem ? 'Back to Modules' : 'Previous'}
          </Button>
          <Button onClick={onNext}>
            {isLastItem ? 'Continue to Pricing' : 'Next'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Response template toggle
  const toggleTemplateField = (category: keyof typeof config.responseTemplate, field: string) => {
    const currentFields = config.responseTemplate[category];
    const newFields = currentFields.includes(field)
      ? currentFields.filter(f => f !== field)
      : [...currentFields, field];
    updateConfig({
      responseTemplate: {
        ...config.responseTemplate,
        [category]: newFields
      }
    });
  };

  const getTotalSelectedFields = () => {
    return Object.values(config.responseTemplate).reduce((sum, arr) => sum + arr.length, 0);
  };

  const [expandedTemplates, setExpandedTemplates] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>{parentServiceName}</span>
            <span>•</span>
            <span>{currentIndex + 1}/{totalItems}</span>
          </div>
          <h2 className="text-2xl font-bold">{serviceName} Configuration</h2>
          <p className="text-sm text-muted-foreground font-mono">{config.journeyId}</p>
        </div>
        <p className="text-sm text-muted-foreground">{data.organization.name}</p>
      </div>

      {/* Documents Allowed */}
      <div className="space-y-4">
        <h3 className="font-semibold">Documents Allowed</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Emirates ID */}
          <div className={cn(
            "p-4 rounded-xl border",
            config.documentsAllowed.emiratesId.enabled ? "border-primary bg-primary/5" : "border-border"
          )}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Emirates ID</span>
              <Switch
                checked={config.documentsAllowed.emiratesId.enabled}
                onCheckedChange={(checked) => updateConfig({
                  documentsAllowed: {
                    ...config.documentsAllowed,
                    emiratesId: { ...config.documentsAllowed.emiratesId, enabled: checked }
                  }
                })}
              />
            </div>
            <Select
              value={config.documentsAllowed.emiratesId.method}
              onValueChange={(value: 'scan' | 'manual' | 'all') => updateConfig({
                documentsAllowed: {
                  ...config.documentsAllowed,
                  emiratesId: { ...config.documentsAllowed.emiratesId, method: value }
                }
              })}
              disabled={!config.documentsAllowed.emiratesId.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Scan + Manual)</SelectItem>
                <SelectItem value="scan">Scan Only</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Passport */}
          <div className={cn(
            "p-4 rounded-xl border",
            config.documentsAllowed.passport.enabled ? "border-primary bg-primary/5" : "border-border"
          )}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Passport</span>
              <Switch
                checked={config.documentsAllowed.passport.enabled}
                onCheckedChange={(checked) => updateConfig({
                  documentsAllowed: {
                    ...config.documentsAllowed,
                    passport: { ...config.documentsAllowed.passport, enabled: checked }
                  }
                })}
              />
            </div>
            <Select
              value={config.documentsAllowed.passport.method}
              onValueChange={(value: 'scan' | 'manual' | 'all') => updateConfig({
                documentsAllowed: {
                  ...config.documentsAllowed,
                  passport: { ...config.documentsAllowed.passport, method: value }
                }
              })}
              disabled={!config.documentsAllowed.passport.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Scan + Manual)</SelectItem>
                <SelectItem value="scan">Scan Only</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GCC ID */}
          <div className={cn(
            "p-4 rounded-xl border",
            config.documentsAllowed.gccId.enabled ? "border-primary bg-primary/5" : "border-border"
          )}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">GCC ID</span>
              <Switch
                checked={config.documentsAllowed.gccId.enabled}
                onCheckedChange={(checked) => updateConfig({
                  documentsAllowed: {
                    ...config.documentsAllowed,
                    gccId: { ...config.documentsAllowed.gccId, enabled: checked }
                  }
                })}
              />
            </div>
            <Select
              value={config.documentsAllowed.gccId.method}
              onValueChange={(value: 'scan' | 'manual' | 'all') => updateConfig({
                documentsAllowed: {
                  ...config.documentsAllowed,
                  gccId: { ...config.documentsAllowed.gccId, method: value }
                }
              })}
              disabled={!config.documentsAllowed.gccId.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (Scan + Manual)</SelectItem>
                <SelectItem value="scan">Scan Only</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Verification Methods */}
      <div className="space-y-4">
        <h3 className="font-semibold">Verification Methods</h3>
        <div className="flex flex-wrap gap-4">
          <label className={cn(
            "flex items-center gap-3 p-4 rounded-xl border cursor-pointer",
            config.verificationMethods.faceRecognition ? "border-primary bg-primary/5" : "border-border"
          )}>
            <Checkbox
              checked={config.verificationMethods.faceRecognition}
              onCheckedChange={(checked) => updateConfig({
                verificationMethods: { ...config.verificationMethods, faceRecognition: !!checked }
              })}
            />
            <div className="flex items-center gap-2">
              <ScanFace className="h-5 w-5 text-primary" />
              <span className="font-medium">Face Recognition</span>
            </div>
          </label>
          <label className={cn(
            "flex items-center gap-3 p-4 rounded-xl border cursor-pointer",
            config.verificationMethods.fingerprint ? "border-primary bg-primary/5" : "border-border"
          )}>
            <Checkbox
              checked={config.verificationMethods.fingerprint}
              onCheckedChange={(checked) => updateConfig({
                verificationMethods: { ...config.verificationMethods, fingerprint: !!checked }
              })}
            />
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-primary" />
              <span className="font-medium">Fingerprint</span>
            </div>
          </label>
        </div>
      </div>

      {/* Delivery Channels */}
      <div className="space-y-4">
        <h3 className="font-semibold">Delivery Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={cn(
            "flex items-start gap-3 p-4 rounded-xl border cursor-pointer",
            config.deliveryChannels.sdk ? "border-primary bg-primary/5" : "border-border"
          )}>
            <Checkbox
              checked={config.deliveryChannels.sdk}
              onCheckedChange={(checked) => updateConfig({
                deliveryChannels: { ...config.deliveryChannels, sdk: !!checked }
              })}
              className="mt-0.5"
            />
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <span className="font-medium">SDK Based</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Native SDK integration</p>
            </div>
          </label>
          <label className={cn(
            "flex items-start gap-3 p-4 rounded-xl border cursor-pointer",
            config.deliveryChannels.remoteLink ? "border-primary bg-primary/5" : "border-border"
          )}>
            <Checkbox
              checked={config.deliveryChannels.remoteLink}
              onCheckedChange={(checked) => updateConfig({
                deliveryChannels: { ...config.deliveryChannels, remoteLink: !!checked }
              })}
              className="mt-0.5"
            />
            <div>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Remote Link</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Web-based remote flow</p>
            </div>
          </label>
          <label className={cn(
            "flex items-start gap-3 p-4 rounded-xl border cursor-pointer",
            config.deliveryChannels.headless ? "border-primary bg-primary/5" : "border-border"
          )}>
            <Checkbox
              checked={config.deliveryChannels.headless}
              onCheckedChange={(checked) => updateConfig({
                deliveryChannels: { ...config.deliveryChannels, headless: !!checked }
              })}
              className="mt-0.5"
            />
            <div>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <span className="font-medium">Headless/API</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Direct API integration</p>
            </div>
          </label>
        </div>
      </div>

      {/* Response Template */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Response Template</h3>
          <span className="text-sm text-muted-foreground">{getTotalSelectedFields()} fields selected</span>
        </div>
        
        <div className="space-y-2">
          {Object.entries(RESPONSE_TEMPLATE_FIELDS).map(([category, fields]) => {
            const categoryKey = category as keyof typeof config.responseTemplate;
            const selectedCount = config.responseTemplate[categoryKey].length;
            const isExpanded = expandedTemplates[category];
            
            return (
              <div key={category} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedTemplates(prev => ({ ...prev, [category]: !prev[category] }))}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50"
                >
                  <span className="font-medium capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{selectedCount}/{fields.length}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="p-3 border-t border-border bg-muted/30">
                    <div className="flex flex-wrap gap-2">
                      {fields.map(field => (
                        <label
                          key={field}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-sm",
                            config.responseTemplate[categoryKey].includes(field)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <Checkbox
                            checked={config.responseTemplate[categoryKey].includes(field)}
                            onCheckedChange={() => toggleTemplateField(categoryKey, field)}
                            className="h-3 w-3"
                          />
                          {field}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {isFirstItem ? 'Back to Modules' : 'Previous'}
        </Button>
        <Button onClick={onNext}>
          {isLastItem ? 'Continue to Pricing' : 'Next'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Pricing Step
function PricingStep({
  data,
  setData,
  enabledKYCJourneys,
  onBack,
  onNext,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
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

      {/* Initial Credits */}
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

      {/* Billing Cycle */}
      <div className="space-y-4">
        <h3 className="font-semibold">Billing Cycle</h3>
        <p className="text-sm text-muted-foreground">Invoice generation frequency</p>
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

      {/* Per-Module Pricing */}
      {enabledKYCJourneys.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Per-Module Pricing</h3>
          <p className="text-sm text-muted-foreground">Configure pricing for each enabled journey</p>
          
          <div className="space-y-4">
            {enabledKYCJourneys.map(journey => {
              const journeyConfig = journey.config;
              const pricing = data.pricing.perModulePricing[journey.id] || { price: 5, includedTransactions: 0 };
              
              return (
                <Card key={journey.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{journey.name}</CardTitle>
                        <CardDescription className="font-mono text-xs">
                          {journeyConfig?.journeyId || journey.id}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price per Transaction (AED)</Label>
                        <Input
                          type="number"
                          value={pricing.price}
                          onChange={(e) => updatePricing(journey.id, 'price', parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Included Transactions</Label>
                        <Input
                          type="number"
                          value={pricing.includedTransactions}
                          onChange={(e) => updatePricing(journey.id, 'includedTransactions', parseInt(e.target.value) || 0)}
                          className="mt-1"
                        />
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
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={onNext}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Features Step
function FeaturesStep({
  data,
  setData,
  onBack,
  onComplete,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const toggleFeature = (feature: keyof OnboardingData['features']) => {
    setData({
      ...data,
      features: {
        ...data.features,
        [feature]: !data.features[feature]
      }
    });
  };

  const features: { key: keyof OnboardingData['features']; label: string; description: string }[] = [
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
        <p className="text-sm text-muted-foreground">Enable or disable additional features</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map(feature => (
            <div
              key={feature.key}
              className="flex items-center justify-between p-4 rounded-xl border border-border"
            >
              <div>
                <p className="font-medium">{feature.label}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                checked={data.features[feature.key]}
                onCheckedChange={() => toggleFeature(feature.key)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={onComplete}>
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
