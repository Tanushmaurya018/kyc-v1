# UAE KYC Platform - Journey & Client Onboarding System

## Overview

This prompt covers the **KYC Journey System** and **Client Onboarding Flow** - the foundational components that Face Sign builds upon. The UAE KYC Platform provides identity verification services, and Face Sign is one of its sub-products for document signing.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UAE KYC PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │   KYC SDK       │    │   Face Sign     │    │   Other         │     │
│  │   (Identity)    │    │   (Signing)     │    │   Products      │     │
│  └────────┬────────┘    └────────┬────────┘    └─────────────────┘     │
│           │                      │                                      │
│           └──────────┬───────────┘                                      │
│                      ▼                                                  │
│           ┌─────────────────────┐                                       │
│           │   KYC Backend       │                                       │
│           │   (Safar API)       │                                       │
│           └─────────────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: KYC Journey System

### Journey Types

The KYC SDK supports 4 types of verification journeys:

```typescript
enum JourneyType {
  ONBOARDING = 'ONBOARDING',     // First-time identity registration
  REKYC = 'REKYC',               // Re-verification (periodic refresh)
  AUTHORISE = 'AUTHORISE',       // Authorization/consent for action
  ONE_TO_MANY = 'ONE_TO_MANY'    // 1:N face search (watchlist check)
}
```

### Journey Flow (Step-by-Step)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        KYC JOURNEY FLOW                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌────────┐ │
│  │ HANDSHAKE│───▶│ CONSENT │───▶│DOC SELECT│───▶│DOC SCAN │───▶│DOC     │ │
│  │         │    │(optional)│    │         │    │         │    │VERIFY  │ │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └────┬───┘ │
│                                                                    │     │
│                                           ┌────────────────────────┘     │
│                                           ▼                              │
│                               ┌─────────────────────┐    ┌─────────┐    │
│                               │   FACE LIVENESS     │───▶│ SUCCESS │    │
│                               │   VERIFICATION      │    │         │    │
│                               └─────────────────────┘    └─────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Journey Type Definitions

```typescript
interface Journey {
  id: string;                     // UUID
  token: string;                  // Journey token for SDK init
  type: JourneyType;
  status: JourneyStatus;

  // Configuration
  config: {
    documentsAllowed: DocumentType[];
    consentRequired: boolean;
    skipSuccessPage: boolean;
    gestureQueue: Gesture[];      // For liveness (smile, blink, etc.)
    expiresAt: Date;
  };

  // Results (after completion)
  result?: {
    documentType: DocumentType;
    idNumber: string;
    fullName: string;
    dateOfBirth: Date;
    nationality: string;
    gender: string;
    expiryDate: Date;
    faceMatchScore: number;
    livenessScore: number;
  };

  // Metadata
  createdAt: Date;
  completedAt?: Date;
  orgId: string;
  clientReference?: string;       // Integrator's reference ID
}

type JourneyStatus =
  | 'CREATED'
  | 'IN_PROGRESS'
  | 'DOCUMENT_CAPTURED'
  | 'DOCUMENT_VERIFIED'
  | 'FACE_CAPTURED'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'BLOCKED';

type DocumentType = 'EMIRATES_ID' | 'PASSPORT' | 'GCC_ID';

type Gesture = 'SMILE' | 'BLINK' | 'TURN_LEFT' | 'TURN_RIGHT' | 'NOD';
```

### Journey Steps Detail

#### Step 1: Handshake
- SDK initializes with journey token
- Establishes encrypted session with backend
- Receives journey configuration
- Validates expiration

```typescript
interface HandshakeResponse {
  serverTimestamp: number;
  journeyType: JourneyType;
  publicKey: string;              // For E2E encryption
}
```

#### Step 2: Consent (Optional)
- Display privacy policy and terms
- User must accept to continue
- Configurable per journey

#### Step 3: Document Selection
- User selects document type
- Based on `documentsAllowed` config
- Emirates ID, Passport, or GCC ID

```typescript
interface DocumentInfo {
  type: DocumentType;
  idNumber: string;
  gccNationality?: string;        // Required for GCC ID
}
```

#### Step 4: Document Scanning
- Camera capture of document
- **Emirates ID**: Front + Back required
- **Passport**: Front only (data page)
- **GCC ID**: Front + Back required

```typescript
interface DocumentCapture {
  frontImage: Blob;
  backImage?: Blob;               // Required for Emirates ID / GCC ID
  captureMode: 'AUTO' | 'MANUAL' | 'UPLOAD';
  metadata: {
    emiratesIdFrontNumber?: string;   // OCR from front
    emiratesIdBackMrz?: string;       // MRZ from back
    passportMrz?: string;             // MRZ from passport
  };
}
```

#### Step 5: Document Verification
- Backend validates document images
- OCR extraction of data
- MRZ parsing and validation
- Document authenticity checks

```typescript
interface DocCheckResponse {
  success: boolean;
  retriesExceeded: boolean;
  extractedData?: {
    idNumber: string;
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    gender: string;
    expiryDate: string;
    photo: string;                // Base64 face from document
  };
  errors?: string[];
}
```

#### Step 6: Face Liveness Verification
- Real-time face capture
- Liveness detection (anti-spoofing)
- Optional gesture challenges
- Face match against document photo

```typescript
interface FaceCaptureResponse {
  success: boolean;
  retriesExceeded: boolean;
  icpResponse: boolean;           // ICP (government) validation result
  livenessScore: number;          // 0-100
  faceMatchScore: number;         // 0-100 similarity to document photo
}
```

#### Step 7: Success/Completion
- Journey marked complete
- Results available via callback
- Optional success screen display

---

## Part 2: Client Onboarding System

### Organization Hierarchy

```
UAE KYC Platform
├── ICP (Federal Authority) - Console Admin
│   └── Manages all organizations
│
├── Government Organizations
│   ├── Ministry of Finance
│   ├── Dubai Health Authority
│   └── Abu Dhabi Digital Authority
│
└── Private Organizations
    ├── Emirates Airlines
    ├── First Abu Dhabi Bank
    └── Other private companies
```

### Organization Types

```typescript
interface Organization {
  id: string;
  name: string;
  type: OrgType;
  status: OrgStatus;

  // Contact Information
  contact: {
    email: string;
    phone?: string;
    address?: string;
    website?: string;
  };

  // Legal Information
  legal: {
    tradeLicenseNumber: string;
    taxRegistrationNumber?: string;
    legalName: string;
    incorporationDate?: Date;
  };

  // Products Enabled
  products: {
    kyc: boolean;
    faceSign: boolean;
    // Future products...
  };

  // Configuration
  config: KycConfig & FaceSignConfig;

  // Billing
  billing: BillingConfig;

  // Metadata
  createdAt: Date;
  onboardedBy: string;
  lastUpdatedAt: Date;
}

type OrgType = 'GOVERNMENT' | 'PRIVATE';
type OrgStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
```

### KYC Configuration

```typescript
interface KycConfig {
  // Journey Settings
  allowedJourneyTypes: JourneyType[];
  allowedDocuments: DocumentType[];
  defaultJourneyType: JourneyType;

  // Liveness Settings
  livenessRequired: boolean;
  gesturesRequired: Gesture[];
  minLivenessScore: number;       // 0-100, default 80
  minFaceMatchScore: number;      // 0-100, default 85

  // Session Settings
  journeyTtlMinutes: number;      // Default: 30
  maxRetriesPerStep: number;      // Default: 3

  // UI Customization
  branding: {
    primaryColor?: string;
    logoUrl?: string;
    customCss?: string;
  };

  // Webhooks
  webhooks: {
    journeyCompleted?: string;
    journeyFailed?: string;
  };
}
```

### Face Sign Configuration

```typescript
interface FaceSignConfig {
  // Session Settings
  sessionTtlHours: number;        // Default: 24
  maxFileSizeMb: number;          // Default: 50
  maxPagesPerDocument: number;    // Default: 100

  // Allowed ID Types for Signing
  allowedIdTypes: DocumentType[];

  // Signature Settings
  allowMultipleSignatures: boolean;
  requirePositionConfirmation: boolean;

  // Template Customization
  signatureTemplate: {
    showIdNumber: boolean;
    showName: boolean;
    showDate: boolean;
    showPhoto: boolean;
    customLogo?: string;
  };
}
```

### Billing Configuration (Prepaid Credits Model)

**IMPORTANT**: Billing is PREPAID only. Clients top up credits first, then consume them. No currency displayed on dashboard.

```typescript
interface BillingConfig {
  // Plan (determines credit pricing)
  plan: BillingPlan;

  // Credit pricing (credits per transaction, NOT currency)
  creditPricing: {
    kycPerJourney: number;        // e.g., 1 credit per journey
    faceSignPerContract: number;  // e.g., 1 credit per signed contract
  };

  // Initial credits (on onboarding)
  initialCredits?: number;        // Optional starter credits

  // Low balance threshold
  lowBalanceThreshold: number;    // Warn when below this

  // Billing contact (for top-up requests)
  billingEmail: string;
}

type BillingPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';

// Note: Actual top-ups are handled offline by ICP/sales team
// Dashboard only shows credit balance and consumption
```

### Client Onboarding Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    CLIENT ONBOARDING FLOW                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ICP Console                                                             │
│       │                                                                  │
│       ▼                                                                  │
│  ┌─────────────┐                                                         │
│  │ 1. BASIC    │  Organization name, type, contact info                  │
│  │    INFO     │                                                         │
│  └──────┬──────┘                                                         │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────┐                                                         │
│  │ 2. LEGAL    │  Trade license, tax registration (for private)         │
│  │    DETAILS  │                                                         │
│  └──────┬──────┘                                                         │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────┐                                                         │
│  │ 3. PRODUCTS │  Enable KYC, Face Sign, configure each                 │
│  │    SETUP    │                                                         │
│  └──────┬──────┘                                                         │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────┐                                                         │
│  │ 4. BILLING  │  Select plan, set pricing, billing email               │
│  │    SETUP    │                                                         │
│  └──────┬──────┘                                                         │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────┐                                                         │
│  │ 5. ADMIN    │  Create first admin user, send invitation              │
│  │    USER     │                                                         │
│  └──────┬──────┘                                                         │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────┐                                                         │
│  │ 6. API KEYS │  Generate initial API keys (live + test)               │
│  │    SETUP    │                                                         │
│  └──────┬──────┘                                                         │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────┐                                                         │
│  │ 7. REVIEW   │  Summary, confirm, activate organization               │
│  │    ACTIVATE │                                                         │
│  └─────────────┘                                                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Onboarding Modal (Multi-Step)

```
Step 1: Basic Information
┌─────────────────────────────────────────────────────────────────┐
│  Onboard New Organization                                   [X] │
│  Step 1 of 7: Basic Information                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Organization Name *                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Organization Type *                                            │
│  ○ Government - Federal or local government entity              │
│  ○ Private - Private sector company                             │
│                                                                 │
│  Primary Contact Email *                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Contact Phone                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ +971                                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Website URL                                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ https://                                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────┐                               ┌───────────────┐    │
│  │ Cancel  │                               │     Next      │    │
│  └─────────┘                               └───────────────┘    │
└─────────────────────────────────────────────────────────────────┘

Step 2: Legal Details (Private orgs only)
┌─────────────────────────────────────────────────────────────────┐
│  Onboard New Organization                                   [X] │
│  Step 2 of 7: Legal Details                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Legal/Registered Name *                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Trade License Number *                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Tax Registration Number                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Registered Address                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────┐                               ┌───────────────┐    │
│  │  Back   │                               │     Next      │    │
│  └─────────┘                               └───────────────┘    │
└─────────────────────────────────────────────────────────────────┘

Step 3: Products Setup
┌─────────────────────────────────────────────────────────────────┐
│  Onboard New Organization                                   [X] │
│  Step 3 of 7: Products Setup                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Enable Products                                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ☑ UAE KYC                                                 │  │
│  │   Identity verification for customers                     │  │
│  │                                                           │  │
│  │   Journey Types:                                          │  │
│  │   ☑ Onboarding  ☑ Re-KYC  ☐ Authorise  ☐ 1:Many          │  │
│  │                                                           │  │
│  │   Allowed Documents:                                      │  │
│  │   ☑ Emirates ID  ☑ Passport  ☐ GCC ID                    │  │
│  │                                                           │  │
│  │   Liveness: ☑ Required  Min Score: [80]                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ☑ Face Sign                                               │  │
│  │   Document signing with facial authentication             │  │
│  │                                                           │  │
│  │   Session TTL: [24] hours                                 │  │
│  │   Max File Size: [50] MB                                  │  │
│  │                                                           │  │
│  │   Allowed ID Types:                                       │  │
│  │   ☑ Emirates ID  ☑ Passport  ☐ GCC ID                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────┐                               ┌───────────────┐    │
│  │  Back   │                               │     Next      │    │
│  └─────────┘                               └───────────────┘    │
└─────────────────────────────────────────────────────────────────┘

Step 4: Billing Setup (Prepaid Credits)
┌─────────────────────────────────────────────────────────────────┐
│  Onboard New Organization                                   [X] │
│  Step 4 of 7: Billing Setup                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Billing Plan *                                                 │
│  (Determines credit consumption rate)                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ Starter                                                   ││
│  │   KYC: 1 credit/journey  |  Face Sign: 2 credits/contract   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ● Professional                                              ││
│  │   KYC: 1 credit/journey  |  Face Sign: 1 credit/contract    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ Enterprise                                                ││
│  │   Custom credit rates  |  Volume discounts                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Initial Credits (optional)                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 100                                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│  Starter credits for testing (0 for none)                       │
│                                                                 │
│  Billing Contact Email:                                         │
│  ┌────────────────────────────────────────┐                     │
│  │ billing@organization.com               │                     │
│  └────────────────────────────────────────┘                     │
│                                                                 │
│  ┌─────────┐                               ┌───────────────┐    │
│  │  Back   │                               │     Next      │    │
│  └─────────┘                               └───────────────┘    │
└─────────────────────────────────────────────────────────────────┘

Step 5: Admin User
┌─────────────────────────────────────────────────────────────────┐
│  Onboard New Organization                                   [X] │
│  Step 5 of 7: Admin User                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Create the first administrator for this organization.          │
│  They will receive an email invitation to set up their account. │
│                                                                 │
│  Admin Full Name *                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Admin Email *                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Admin Phone (optional)                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ +971                                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────┐                               ┌───────────────┐    │
│  │  Back   │                               │     Next      │    │
│  └─────────┘                               └───────────────┘    │
└─────────────────────────────────────────────────────────────────┘

Step 6: API Keys
┌─────────────────────────────────────────────────────────────────┐
│  Onboard New Organization                                   [X] │
│  Step 6 of 7: API Keys                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Generate initial API keys for integration.                     │
│                                                                 │
│  ☑ Generate Test API Key                                        │
│    For development and testing (sandbox environment)            │
│                                                                 │
│  ☑ Generate Live API Key                                        │
│    For production use (requires admin to activate)              │
│                                                                 │
│  ⚠️ Keys will be shown only once after organization creation.   │
│     Make sure to save them securely.                            │
│                                                                 │
│  ┌─────────┐                               ┌───────────────┐    │
│  │  Back   │                               │     Next      │    │
│  └─────────┘                               └───────────────┘    │
└─────────────────────────────────────────────────────────────────┘

Step 7: Review & Activate
┌─────────────────────────────────────────────────────────────────┐
│  Onboard New Organization                                   [X] │
│  Step 7 of 7: Review & Activate                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Please review the organization details before activation.      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ BASIC INFORMATION                              [Edit]       ││
│  │ Name: Dubai Health Authority                                ││
│  │ Type: Government                                            ││
│  │ Email: admin@dha.gov.ae                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ PRODUCTS                                       [Edit]       ││
│  │ ✓ UAE KYC (Onboarding, Re-KYC)                              ││
│  │ ✓ Face Sign (Emirates ID, Passport)                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ BILLING                                        [Edit]       ││
│  │ Plan: Professional                                          ││
│  │ KYC: $0.50/journey | Face Sign: $1.00/contract              ││
│  │ Cycle: Monthly | Currency: USD                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ADMIN USER                                     [Edit]       ││
│  │ John Smith (john.smith@dha.gov.ae)                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────┐                    ┌─────────────────────────────┐ │
│  │  Back   │                    │  Create Organization  ✓     │ │
│  └─────────┘                    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Data Models Summary

### Database Schema Overview

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,  -- 'GOVERNMENT' | 'PRIVATE'
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  website_url VARCHAR(255),
  legal_name VARCHAR(255),
  trade_license_number VARCHAR(100),
  tax_registration_number VARCHAR(100),
  address TEXT,
  kyc_config JSONB,
  facesign_config JSONB,
  billing_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  onboarded_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ
);

-- Organization Users
CREATE TABLE organization_users (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) NOT NULL,  -- 'ADMIN' | 'MANAGER' | 'VIEWER'
  status VARCHAR(20) DEFAULT 'INVITED',
  invited_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(255),
  key_hash VARCHAR(255) NOT NULL,  -- Hashed key
  key_prefix VARCHAR(20),          -- First 8 chars for display
  environment VARCHAR(10),         -- 'LIVE' | 'TEST'
  status VARCHAR(20) DEFAULT 'ACTIVE',
  permissions TEXT[],
  created_by UUID REFERENCES organization_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- KYC Journeys
CREATE TABLE kyc_journeys (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  token UUID UNIQUE,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL,
  config JSONB,
  result JSONB,
  client_reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Face Sign Sessions (in Face Sign schema)
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  status VARCHAR(30) NOT NULL,
  kyc_journey_id UUID,
  document_hash VARCHAR(71),
  -- ... other Face Sign fields
);

-- Billing / Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  period_start DATE,
  period_end DATE,
  kyc_count INTEGER DEFAULT 0,
  facesign_count INTEGER DEFAULT 0,
  kyc_amount DECIMAL(10,2),
  facesign_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Part 4: Integration Flow (How They Connect)

### Face Sign using KYC Journey

```
┌──────────────────────────────────────────────────────────────────────────┐
│                  FACE SIGN + KYC INTEGRATION                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INTEGRATOR                    FACE SIGN                    KYC          │
│      │                             │                          │          │
│      │ 1. POST /init               │                          │          │
│      │ ────────────────────────────▶                          │          │
│      │                             │                          │          │
│      │                             │ 2. Create session        │          │
│      │                             │                          │          │
│      │ 3. Load SDK                 │                          │          │
│      │ ────────────────────────────▶                          │          │
│      │                             │                          │          │
│      │                             │ 4. User previews doc     │          │
│      │                             │                          │          │
│      │                             │ 5. Create KYC journey    │          │
│      │                             │ ─────────────────────────▶          │
│      │                             │                          │          │
│      │                             │ 6. Return kyc_token      │          │
│      │                             │ ◀─────────────────────────          │
│      │                             │                          │          │
│      │                             │ 7. Load KYC SDK (iframe) │          │
│      │                             │ ─────────────────────────▶          │
│      │                             │                          │          │
│      │                             │ 8. User completes KYC    │          │
│      │                             │    (doc scan + face)     │          │
│      │                             │                          │          │
│      │                             │ 9. KYC callback(SUCCESS) │          │
│      │                             │ ◀─────────────────────────          │
│      │                             │                          │          │
│      │                             │ 10. Get user data        │          │
│      │                             │ ─────────────────────────▶          │
│      │                             │                          │          │
│      │                             │ 11. User data (name, ID) │          │
│      │                             │ ◀─────────────────────────          │
│      │                             │                          │          │
│      │                             │ 12. Generate signature   │          │
│      │                             │     template with data   │          │
│      │                             │                          │          │
│      │                             │ 13. User positions sig   │          │
│      │                             │                          │          │
│      │                             │ 14. Session COMPLETE     │          │
│      │                             │                          │          │
│      │ 15. Poll status             │                          │          │
│      │ ────────────────────────────▶                          │          │
│      │                             │                          │          │
│      │ 16. Return artifacts        │                          │          │
│      │ ◀────────────────────────────                          │          │
│      │                             │                          │          │
│      │ 17. Stitch document         │                          │          │
│      │     (integrator's job)      │                          │          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack Recommendations

| Component | Technology |
|-----------|------------|
| **ICP Console** | React + TypeScript + shadcn/ui |
| **Client Dashboard** | React + TypeScript + shadcn/ui |
| **KYC SDK** | Dioxus (Rust → WASM) |
| **Face Sign SDK** | Dioxus (Rust → WASM) |
| **Backend** | Rust (Axum) |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Message Queue** | Kafka |
| **Object Storage** | MinIO |
| **Auth** | JWT + OAuth 2.0 |

---

## Summary

This document defines:

1. **KYC Journey System** - The identity verification flow with 4 journey types and 7 steps
2. **Client Onboarding** - 7-step process to onboard new organizations onto the platform
3. **Data Models** - Complete TypeScript interfaces and SQL schema
4. **Integration Flow** - How Face Sign uses KYC journeys for signer verification

Use this as a reference when building the admin dashboard to understand:
- What journey data to display in analytics
- What organization configuration options to expose
- How billing works across products
- The relationship between KYC journeys and Face Sign sessions
