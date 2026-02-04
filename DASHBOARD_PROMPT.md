# Face Sign Admin Dashboard - Development Prompt

## Project Overview

Build a modern admin dashboard for **Face Sign** - a document signing service that uses facial authentication. Face Sign is part of the larger **UAE KYC Platform**. The dashboard will be used by two personas to manage signing contracts/sessions.

### Context
- Face Sign creates "sessions" (contracts) where users sign PDFs after KYC verification
- Session states: `CREATED` → `SIGNED` (complete) | `REJECTED` (KYC failed) | `ABANDONED` (user cancelled) | `EXPIRED`
- Billing is flat-fee per successful signed contract
- Organizations are managed in UAE KYC platform; Face Sign caches org config
- Same authentication system as UAE KYC dashboard

---

## Tech Stack (MANDATORY)

| Technology | Purpose |
|------------|---------|
| **React 18+** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **shadcn/ui** | Component library |
| **Tailwind CSS** | Styling (via shadcn) |
| **React Router v6** | Routing |
| **Lucide React** | Icons |
| **date-fns** | Date formatting |
| **Recharts** | Charts (for analytics) |
| **Tanstack Table** | Data tables |

---

## Design Requirements (CRITICAL)

### Theme: Minimal Black & White

```
Primary Colors:
- Background: #FFFFFF (white)
- Text: #000000 (black)
- Borders: #E5E5E5 (light gray)
- Hover: #F5F5F5 (off-white)
- Accent: #000000 (black buttons/links)

Status Colors (ONLY exception to B&W):
- Signed/Success: #22C55E (green)
- Rejected/Error: #EF4444 (red)
- Pending/Created: #F59E0B (amber)
- Expired/Abandoned: #6B7280 (gray)
```

### Design Principles
1. **Minimalist** - No unnecessary decorations, gradients, or shadows
2. **High contrast** - Black text on white background
3. **Clean typography** - Inter or system font, clear hierarchy
4. **Generous whitespace** - Breathing room between elements
5. **Flat design** - No 3D effects, subtle borders only
6. **Functional** - Every element serves a purpose

### UI Patterns
- Cards with 1px borders, no shadows
- Tables with alternating row backgrounds (#FAFAFA)
- Buttons: Black fill for primary, white fill with black border for secondary
- Inputs: White background, 1px black border, no rounded corners (or minimal 4px)
- Modals: White background, subtle overlay
- No gradients anywhere

---

## Two Dashboard Personas

### 1. ICP Console (Federal Authority View)
- URL prefix: `/console`
- Can see ALL organizations
- Has org selector dropdown
- Views aggregate analytics across all orgs
- Can view any org's contracts/users
- **Can onboard new organizations**

### 2. Client Dashboard (Organization View)
- URL prefix: `/dash`
- Sees only their organization's data
- No org selector (single org context)
- Standard org admin features

### Product Switcher
- Top-left corner toggle: "UAE KYC" ↔ "Face Sign"
- When on Face Sign dashboard, toggle shows Face Sign as active
- Clicking UAE KYC would navigate to KYC dashboard (stub for now)

---

## Application Structure

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── lib/
│   └── utils.ts
├── types/
│   ├── contract.ts
│   ├── user.ts
│   ├── organization.ts
│   ├── api-key.ts
│   └── billing.ts
├── data/
│   ├── contracts.ts      # Stub contract data
│   ├── users.ts          # Stub user data
│   ├── organizations.ts  # Stub org data
│   ├── api-keys.ts       # Stub API key data
│   └── analytics.ts      # Stub analytics data
├── hooks/
│   ├── useContracts.ts
│   ├── useUsers.ts
│   ├── useOrganizations.ts
│   └── useAnalytics.ts
├── components/
│   ├── ui/               # shadcn components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── ProductSwitcher.tsx
│   │   └── Layout.tsx
│   ├── contracts/
│   │   ├── ContractsTable.tsx
│   │   ├── ContractDetail.tsx
│   │   ├── ContractFilters.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── DocumentPreviewModal.tsx
│   │   ├── SignedDocumentCard.tsx
│   │   └── ContractTimeline.tsx
│   ├── organizations/    # ICP Console only
│   │   ├── OrganizationsTable.tsx
│   │   ├── OrganizationDetail.tsx
│   │   ├── OnboardOrgModal.tsx
│   │   ├── EditOrgModal.tsx
│   │   └── SuspendOrgModal.tsx
│   ├── users/
│   │   ├── UsersTable.tsx
│   │   ├── InviteUserModal.tsx
│   │   └── EditUserModal.tsx
│   ├── api-keys/
│   │   ├── ApiKeysTable.tsx
│   │   ├── CreateKeyModal.tsx
│   │   └── RevokeKeyModal.tsx
│   ├── analytics/
│   │   ├── StatsCards.tsx
│   │   ├── ContractsChart.tsx
│   │   └── StatusBreakdown.tsx
│   ├── billing/
│   │   ├── CurrentPlan.tsx
│   │   ├── UsageTable.tsx
│   │   └── InvoicesTable.tsx
│   └── settings/
│       ├── OrgSettings.tsx
│       └── NotificationSettings.tsx
├── pages/
│   ├── console/          # ICP Console pages
│   │   ├── Dashboard.tsx
│   │   ├── Contracts.tsx
│   │   ├── Organizations.tsx
│   │   ├── OrganizationDetail.tsx
│   │   └── Analytics.tsx
│   └── dash/             # Client Dashboard pages
│       ├── Dashboard.tsx
│       ├── Contracts.tsx
│       ├── ContractDetail.tsx
│       ├── ApiKeys.tsx
│       ├── Users.tsx
│       ├── Analytics.tsx
│       ├── Billing.tsx
│       └── Settings.tsx
└── routes.tsx
```

---

## Module Specifications

### 0. Organizations (ICP Console Only)

This module is ONLY available in the ICP Console (`/console`). Federal authority can onboard and manage organizations.

#### Organization Type Definition
```typescript
interface Organization {
  id: string;
  name: string;
  type: 'GOVERNMENT' | 'PRIVATE';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';

  // Contact
  contactEmail: string;
  contactPhone?: string;
  address?: string;

  // Configuration
  config: {
    maxFileSizeMb: number;       // Default: 50
    sessionTtlHours: number;     // Default: 24
    allowedIdTypes: ('EMIRATES_ID' | 'PASSPORT' | 'GCC_ID')[];
  };

  // Billing
  billingPlan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  pricePerContract: number;

  // Stats (computed)
  totalContracts: number;
  activeUsers: number;

  // Timestamps
  createdAt: Date;
  onboardedBy: string;          // ICP user who created
}
```

#### Organizations List Page (`/console/organizations`)
- Table: Name, Type, Status, Contracts, Users, Created
- **"+ Onboard Organization" Button**: Top right
- **Filters**: Type (Government/Private), Status
- **Search**: By org name
- **Actions**: View details, Suspend, Edit

#### Onboard Organization Modal (Multi-step)
```
Step 1: Basic Information
┌─────────────────────────────────────────┐
│  Onboard Organization              [X]  │
│  Step 1 of 3: Basic Information         │
├─────────────────────────────────────────┤
│                                         │
│  Organization Name *                    │
│  ┌─────────────────────────────────┐    │
│  │ e.g., Dubai Health Authority    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Organization Type *                    │
│  ○ Government - Federal/local entity    │
│  ○ Private - Private sector company     │
│                                         │
│  Contact Email *                        │
│  ┌─────────────────────────────────┐    │
│  │ admin@org.gov.ae                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Contact Phone                          │
│  ┌─────────────────────────────────┐    │
│  │ +971 4 xxx xxxx                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────┐           ┌───────────┐    │
│  │ Cancel  │           │   Next    │    │
│  └─────────┘           └───────────┘    │
└─────────────────────────────────────────┘

Step 2: Configuration
┌─────────────────────────────────────────┐
│  Onboard Organization              [X]  │
│  Step 2 of 3: Configuration             │
├─────────────────────────────────────────┤
│                                         │
│  Session TTL (hours) *                  │
│  ┌─────────────────────────────────┐    │
│  │ 24                              │    │
│  └─────────────────────────────────┘    │
│  How long before unsigned sessions      │
│  expire                                 │
│                                         │
│  Max File Size (MB) *                   │
│  ┌─────────────────────────────────┐    │
│  │ 50                              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Allowed ID Types *                     │
│  ☑ Emirates ID                          │
│  ☑ Passport                             │
│  ☐ GCC ID                               │
│                                         │
│  ┌─────────┐           ┌───────────┐    │
│  │  Back   │           │   Next    │    │
│  └─────────┘           └───────────┘    │
└─────────────────────────────────────────┘

Step 3: Billing Plan
┌─────────────────────────────────────────┐
│  Onboard Organization              [X]  │
│  Step 3 of 3: Billing Plan              │
├─────────────────────────────────────────┤
│                                         │
│  Select Billing Plan *                  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ○ Starter                       │    │
│  │   $1.00 per signed contract     │    │
│  │   Up to 100 contracts/month     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ● Professional                  │    │
│  │   $0.75 per signed contract     │    │
│  │   Up to 1,000 contracts/month   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ○ Enterprise                    │    │
│  │   Custom pricing                │    │
│  │   Unlimited contracts           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────┐  ┌─────────────────────┐   │
│  │  Back   │  │ Create Organization │   │
│  └─────────┘  └─────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Organization Detail Page (`/console/organizations/:id`)
- Header: Org name, type badge, status badge
- **Stats cards**: Total contracts, Active users, This month's contracts
- **Tabs**:
  - Overview: Configuration, billing plan, contact info
  - Contracts: Table of org's contracts (same as contracts module)
  - Users: Table of org's users (can add/remove)
  - API Keys: Table of org's keys
  - Billing: Invoices for this org
- **Actions**: Edit Organization, Suspend/Activate, Delete

#### Edit Organization Modal
- Same fields as create, pre-filled
- Can change configuration and billing plan
- Cannot change organization type after creation

#### Suspend Organization Confirmation
```
┌─────────────────────────────────────────┐
│  Suspend Organization               [X] │
├─────────────────────────────────────────┤
│                                         │
│  ⚠ Are you sure you want to suspend    │
│    "Dubai Health Authority"?            │
│                                         │
│  This will:                             │
│  • Disable all API keys                 │
│  • Prevent new contract creation        │
│  • Block user access to dashboard       │
│                                         │
│  Existing contracts will remain         │
│  accessible in read-only mode.          │
│                                         │
│  ┌─────────┐  ┌─────────────────────┐   │
│  │ Cancel  │  │ Suspend Organization│   │
│  └─────────┘  └─────────────────────┘   │
└─────────────────────────────────────────┘
```

---

### 1. Contracts (MAIN FOCUS)

This is the primary module. Contracts = Sessions in Face Sign.

#### Contract Type Definition
```typescript
interface Contract {
  id: string;                    // UUID
  sessionId: string;             // Display ID (e.g., "FS-2026-00001")
  status: ContractStatus;

  // Document
  documentName: string;          // "Employment_Contract.pdf"
  documentHash: string;          // "sha256:abc123..."
  pageCount: number;
  fileSizeKb: number;

  // Signer
  signerName: string;            // From KYC
  signerIdNumber: string;        // Emirates ID / Passport
  signerIdType: 'EMIRATES_ID' | 'PASSPORT' | 'GCC_ID';

  // KYC
  kycJourneyId: string | null;
  kycStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | null;
  kycCompletedAt: Date | null;

  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  completedAt: Date | null;

  // Rejection/Abandonment reason (if applicable)
  terminationReason?: string;

  // Signature positions (for detail view)
  signaturePositions: SignaturePosition[];

  // Document URLs (for preview/download)
  originalDocumentUrl: string;   // URL to preview/download original PDF

  // Signed document (only present when status === 'SIGNED')
  signedDocument?: SignedDocument;

  // Organization
  orgId: string;
  orgName: string;

  // Timeline events
  timeline: TimelineEvent[];
}

type ContractStatus = 'CREATED' | 'SIGNED' | 'REJECTED' | 'ABANDONED' | 'EXPIRED';

interface SignaturePosition {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SignedDocument {
  documentName: string;           // "Employment_Contract_SIGNED.pdf"
  signedAt: Date;
  documentHash: string;           // Hash of signed document
  downloadUrl: string;            // URL to download signed PDF
  previewUrl: string;             // URL to preview signed PDF
  signatureCount: number;         // Number of signatures applied
  certificateInfo: {
    issuer: string;               // "UAE PKI Authority"
    validFrom: Date;
    validTo: Date;
    serialNumber: string;
  };
}

interface TimelineEvent {
  timestamp: Date;
  event: string;                  // "SESSION_CREATED", "KYC_STARTED", etc.
  label: string;                  // "Session Created", "KYC Started"
  status: 'completed' | 'failed' | 'pending';
  details?: string;               // Optional details
}
```

#### Contracts List Page
- **Table columns**: Session ID, Document, Signer, Status, Created, Expires/Completed
- **Filters**: Status (multi-select), Date range, Search (ID, signer name, document name)
- **Sorting**: By date, status, signer name
- **Pagination**: 25 per page default
- **Actions**: View details, Export CSV

#### Contract Detail Page (`/dash/contracts/:id` or `/console/contracts/:id`)
- Header: Session ID, Status badge, timestamps
- **Document section**: Name, hash, page count, size
- **Signer section**: Name, ID type, ID number, KYC status
- **Timeline**: Event log (Created → KYC Started → KYC Passed → Positioned → Completed)
- **For Rejected**: Show rejection reason, KYC failure details
- **For Abandoned**: Show abandonment stage
- **Signature Positions**: Visual representation or list

#### Document Preview Feature
Users should be able to preview the original PDF document within the dashboard.

```
┌─────────────────────────────────────────────────────────────────┐
│  Document Preview                                           [X] │
│  Employment_Contract.pdf                                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │                                                           │  │
│  │                    [PDF VIEWER]                           │  │
│  │                                                           │  │
│  │              Rendered PDF pages here                      │  │
│  │              (use react-pdf or iframe)                    │  │
│  │                                                           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Page: [◀] 1 of 5 [▶]              [🔍-] 100% [🔍+]   [⬇ Download]│
└─────────────────────────────────────────────────────────────────┘
```

**Document Preview Implementation:**
- Use `react-pdf` library or iframe embed
- Support zoom in/out (50%, 75%, 100%, 125%, 150%)
- Page navigation for multi-page documents
- Download original document button
- Fullscreen mode option

#### Signed Document Section (for SIGNED contracts only)
When a contract is successfully signed, show the signed document section.

```typescript
interface SignedDocument {
  documentName: string;           // "Employment_Contract_SIGNED.pdf"
  signedAt: Date;
  documentHash: string;           // Hash of signed document
  downloadUrl: string;            // URL to download signed PDF
  signatureCount: number;         // Number of signatures applied
  certificateInfo: {
    issuer: string;
    validFrom: Date;
    validTo: Date;
    serialNumber: string;
  };
}
```

**Contract Detail - Signed Document Card:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ Signed Document                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Employment_Contract_SIGNED.pdf                                 │
│  Signed on: 15 Jan 2026 at 14:32 UTC                           │
│                                                                 │
│  Document Hash: sha256:def456...                                │
│  Signatures: 1                                                  │
│                                                                 │
│  Certificate Details                                            │
│  ├─ Issuer: UAE PKI Authority                                   │
│  ├─ Valid: 01 Jan 2026 - 31 Dec 2026                           │
│  └─ Serial: 1234567890ABCDEF                                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  Preview Signed  │  │  ⬇ Download PDF  │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

**Preview Signed Document Modal:**
Same as document preview but shows the final signed PDF with:
- Visual signature overlays visible
- PAdES signature indicator
- "Signed" watermark/badge in viewer

#### Contract Detail Page Layout (Full)
```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Contracts                                             │
│                                                                 │
│ FS-2026-00142                               [✓ Signed]          │
│ Created: 15 Jan 2026 10:00 • Signed: 15 Jan 2026 14:32         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│ │ ORIGINAL DOCUMENT       │  │ SIGNER INFORMATION          │   │
│ ├─────────────────────────┤  ├─────────────────────────────┤   │
│ │ Employment_Contract.pdf │  │ Ahmed Al Maktoum            │   │
│ │ 5 pages • 245 KB        │  │ Emirates ID: 784-1990-...   │   │
│ │ Hash: sha256:abc123...  │  │ KYC Status: ✓ Verified      │   │
│ │                         │  │ Verified: 15 Jan 14:30      │   │
│ │ [👁 Preview] [⬇ Download]│  │                             │   │
│ └─────────────────────────┘  └─────────────────────────────┘   │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ ✓ SIGNED DOCUMENT                                         │   │
│ ├───────────────────────────────────────────────────────────┤   │
│ │ Employment_Contract_SIGNED.pdf                            │   │
│ │ Signed: 15 Jan 2026 14:32 • Hash: sha256:def456...       │   │
│ │                                                           │   │
│ │ Certificate: UAE PKI Authority (Valid until Dec 2026)     │   │
│ │                                                           │   │
│ │ [👁 Preview Signed] [⬇ Download Signed PDF]               │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ SIGNATURE POSITIONS                                       │   │
│ ├───────────────────────────────────────────────────────────┤   │
│ │ Page 3: Position (120, 450) - Size 200x80px              │   │
│ │ Page 5: Position (120, 650) - Size 200x80px              │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ TIMELINE                                                  │   │
│ ├───────────────────────────────────────────────────────────┤   │
│ │ ● 10:00  Session Created                                  │   │
│ │ ● 10:05  Document Loaded                                  │   │
│ │ ● 14:25  Preview Confirmed                                │   │
│ │ ● 14:28  KYC Started                                      │   │
│ │ ● 14:30  KYC Verified ✓                                   │   │
│ │ ● 14:31  Signature Positioned                             │   │
│ │ ● 14:32  Session Completed ✓                              │   │
│ └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. API Keys

```typescript
interface ApiKey {
  id: string;
  name: string;                  // "Production Key", "Staging Key"
  keyPrefix: string;             // "fs_live_abc..." (show first 8 chars)
  environment: 'LIVE' | 'TEST';
  status: 'ACTIVE' | 'REVOKED';
  createdAt: Date;
  lastUsedAt: Date | null;
  createdBy: string;             // User who created
  permissions: string[];         // ['sessions:create', 'sessions:read']
}
```

#### API Keys Page
- Table: Name, Key (masked), Environment, Status, Created, Last Used
- **"+ Create API Key" Button**: Top right of page
- **Actions**: Copy key (on create only), Revoke, Delete
- Warning: "Key shown only once" on creation

#### Create API Key Modal
```
┌─────────────────────────────────────────┐
│  Create API Key                     [X] │
├─────────────────────────────────────────┤
│                                         │
│  Key Name *                             │
│  ┌─────────────────────────────────┐    │
│  │ e.g., Production Key            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Environment *                          │
│  ○ Live - For production use            │
│  ○ Test - For development/testing       │
│                                         │
│  Permissions                            │
│  ☑ sessions:create                      │
│  ☑ sessions:read                        │
│  ☑ sessions:status                      │
│  ☐ webhooks:manage                      │
│                                         │
│  ┌─────────┐  ┌───────────────────┐     │
│  │ Cancel  │  │    Create Key     │     │
│  └─────────┘  └───────────────────┘     │
└─────────────────────────────────────────┘
```

#### Key Created Success Modal
```
┌─────────────────────────────────────────┐
│  ✓ API Key Created                  [X] │
├─────────────────────────────────────────┤
│                                         │
│  ⚠ Copy this key now. You won't be     │
│    able to see it again!                │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ fs_live_abc123xyz789...     [📋]│    │
│  └─────────────────────────────────┘    │
│                                         │
│           ┌───────────────────┐         │
│           │       Done        │         │
│           └───────────────────┘         │
└─────────────────────────────────────────┘
```

#### Revoke Key Confirmation
- Confirm dialog: "Are you sure you want to revoke this key?"
- Warning: "This action cannot be undone. Any integrations using this key will stop working."

### 3. Users

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'ACTIVE' | 'INVITED' | 'DISABLED';
  createdAt: Date;
  lastLoginAt: Date | null;
  invitedBy?: string;
}

type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER';
```

#### Role Permissions
| Permission | Admin | Manager | Viewer |
|------------|-------|---------|--------|
| View contracts | ✓ | ✓ | ✓ |
| Export data | ✓ | ✓ | ✗ |
| Manage API keys | ✓ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ |
| Billing access | ✓ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✗ |

#### Users Page
- Table: Name, Email, Role, Status, Last Login
- **"+ Invite User" Button**: Top right of page
- **Actions**: Edit role, Disable, Remove

#### Invite User Modal
```
┌─────────────────────────────────────────┐
│  Invite User                        [X] │
├─────────────────────────────────────────┤
│                                         │
│  Email Address *                        │
│  ┌─────────────────────────────────┐    │
│  │ user@example.com                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Full Name *                            │
│  ┌─────────────────────────────────┐    │
│  │ John Doe                        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Role *                                 │
│  ┌─────────────────────────────────┐    │
│  │ Select role...              [▼] │    │
│  └─────────────────────────────────┘    │
│  ○ Admin - Full access                  │
│  ○ Manager - Contracts & settings       │
│  ○ Viewer - Read-only access            │
│                                         │
│  ┌─────────┐  ┌───────────────────┐     │
│  │ Cancel  │  │  Send Invitation  │     │
│  └─────────┘  └───────────────────┘     │
└─────────────────────────────────────────┘
```

#### Edit User Modal
- Same fields as invite but pre-filled
- Can change role and status
- "Save Changes" / "Cancel" buttons

### 4. Analytics

```typescript
interface AnalyticsData {
  // Overview stats
  totalContracts: number;
  signedContracts: number;
  rejectedContracts: number;
  abandonedContracts: number;
  expiredContracts: number;

  // Rates
  completionRate: number;        // signed / total
  kycPassRate: number;           // kyc success / kyc attempted

  // Time series (last 30 days)
  dailyStats: {
    date: string;
    created: number;
    signed: number;
    rejected: number;
  }[];

  // Average times
  avgTimeToSign: number;         // minutes
  avgKycDuration: number;        // seconds
}
```

#### Analytics Page
- **Stat Cards**: Total, Signed, Rejected, Abandoned, Expired (with % change)
- **Line Chart**: Contracts over time (created vs signed)
- **Pie/Donut Chart**: Status breakdown
- **Table**: Top documents by volume
- Date range selector (7d, 30d, 90d, custom)

### 5. Billing (Prepaid Credits Model)

**IMPORTANT**: Billing follows a PREPAID model only. Clients top up credits first, then consume them. No currency is displayed on the dashboard.

```typescript
interface BillingData {
  // Current balance (credits)
  credits: {
    available: number;           // e.g., 5000 credits
    used: number;                // e.g., 1247 credits used
    total: number;               // Total topped up ever
  };

  // Pricing (per module)
  pricing: {
    faceSign: number;            // e.g., 1 credit per signed contract
  };

  // Usage this period
  currentPeriodUsage: {
    periodStart: Date;
    periodEnd: Date;
    contractsSigned: number;
    creditsConsumed: number;
  };

  // Top-up history
  topUpHistory: TopUpTransaction[];

  // Usage history
  usageHistory: UsageTransaction[];
}

interface TopUpTransaction {
  id: string;
  credits: number;               // Credits added
  date: Date;
  reference?: string;            // Payment reference
}

interface UsageTransaction {
  id: string;
  sessionId: string;             // Which contract consumed this
  creditsUsed: number;
  date: Date;
  description: string;           // "Contract signed: FS-2026-00142"
}
```

#### Billing Page
- **Credits Balance Card**: Available credits, used credits (with progress bar)
- **Pricing Card**: Credits per signed contract (no currency shown)
- **This Period Card**: Contracts signed, credits consumed
- **Top-up History Table**: Date, Credits Added, Reference
- **Usage History Table**: Date, Session ID, Credits Used
- Note: Top-ups are handled by ICP/sales, client just views balance

### 6. Settings

```typescript
interface OrgSettings {
  // General
  orgName: string;
  orgLogo?: string;
  timezone: string;

  // Session defaults
  sessionTtlHours: number;       // Default: 24
  maxFileSizeMb: number;         // Default: 50

  // Notifications
  webhookUrl?: string;
  emailNotifications: boolean;
  notifyOnComplete: boolean;
  notifyOnReject: boolean;
}
```

#### Settings Page
- **Organization**: Name, logo upload, timezone
- **Session Defaults**: TTL, max file size
- **Webhooks**: URL input, test button
- **Notifications**: Email toggles

---

## Layout Structure

### Sidebar (Left, Fixed)
```
┌─────────────────────┐
│ [⟷] UAE KYC / FS   │  ← Product Switcher
├─────────────────────┤
│ MAIN                │
│ ○ Dashboard         │
│ ○ Contracts    ←─── │  (highlighted)
├─────────────────────┤
│ MANAGE              │
│ ○ API Keys          │
│ ○ Users             │
├─────────────────────┤
│ INSIGHTS            │
│ ○ Analytics         │
├─────────────────────┤
│ ACCOUNT             │
│ ○ Billing           │
│ ○ Settings          │
├─────────────────────┤
│                     │
│ [User Avatar]       │
│ John Doe            │
│ Admin               │
└─────────────────────┘
```

### Header (Top)
```
┌────────────────────────────────────────────────────────────┐
│  Contracts                          [Search] [Notifications]│
│  Manage signing sessions                                    │
└────────────────────────────────────────────────────────────┘
```

---

## Stub Data Requirements

Generate realistic stub data:

### Contracts (50+ records)
- Mix of all statuses
- Various document names (Employment_Contract, NDA, Service_Agreement, etc.)
- Emirates ID and Passport signers
- Dates spread over last 90 days
- Some expired (expires_at in past), some expiring soon

### Organizations (5-7 for ICP console)
```typescript
// Example stub organizations
const organizations = [
  {
    id: "org-001",
    name: "Ministry of Finance",
    type: "GOVERNMENT",
    status: "ACTIVE",
    contactEmail: "admin@mof.gov.ae",
    config: { maxFileSizeMb: 100, sessionTtlHours: 48, allowedIdTypes: ["EMIRATES_ID"] },
    billingPlan: "ENTERPRISE",
    pricePerContract: 0.50,
    totalContracts: 1247,
    activeUsers: 23,
    createdAt: "2025-06-15",
    onboardedBy: "ICP Admin"
  },
  {
    id: "org-002",
    name: "Dubai Health Authority",
    type: "GOVERNMENT",
    status: "ACTIVE",
    // ...
  },
  {
    id: "org-003",
    name: "Abu Dhabi Digital Authority",
    type: "GOVERNMENT",
    status: "ACTIVE",
    // ...
  },
  {
    id: "org-004",
    name: "Emirates Airlines",
    type: "PRIVATE",
    status: "ACTIVE",
    // ...
  },
  {
    id: "org-005",
    name: "First Abu Dhabi Bank",
    type: "PRIVATE",
    status: "ACTIVE",
    // ...
  },
  {
    id: "org-006",
    name: "Pending Corp Ltd",
    type: "PRIVATE",
    status: "PENDING",  // Recently onboarded, pending activation
    // ...
  },
  {
    id: "org-007",
    name: "Suspended Entity",
    type: "PRIVATE",
    status: "SUSPENDED",  // Show suspended state
    // ...
  }
];
```

### Users (5-10 per org)
- Mix of roles (Admin, Manager, Viewer)
- Some invited (pending), some active, some disabled
- Include last login dates (some recent, some stale)

### API Keys (3-5 per org)
- Live and test environments
- Some revoked
- Variety of permissions
- Different creation dates and last used dates

### Billing (for prepaid credits)
- Top-up history: Various credit amounts added
- Usage history: Credits consumed per contract
- Show orgs with low credits, healthy credits, recently topped up

---

## Key Implementation Notes

1. **No backend integration** - All data from stub files, simulate API delays with setTimeout

2. **Responsive design** - Desktop-first but should work on tablet

3. **Loading states** - Show skeleton loaders, not spinners

4. **Empty states** - Design empty states for tables ("No contracts found")

5. **Error states** - Handle gracefully with retry options

6. **Toast notifications** - For actions (key created, user invited, etc.)

7. **Keyboard navigation** - Tables should be keyboard accessible

8. **URL state** - Filters should be reflected in URL params

9. **Dark mode** - NOT required for v1 (keep it white only)

10. **Animations** - Subtle only (fade in tables, slide modals)

---

## Routes

```typescript
// ICP Console (Federal Authority)
/console                    → Console Dashboard
/console/contracts          → All Contracts (with org filter)
/console/contracts/:id      → Contract Detail
/console/organizations      → Organizations List
/console/organizations/:id  → Organization Detail
/console/analytics          → Aggregate Analytics

// Client Dashboard (Organization)
/dash                       → Dashboard (overview)
/dash/contracts             → Contracts List
/dash/contracts/:id         → Contract Detail
/dash/api-keys              → API Keys
/dash/users                 → Users
/dash/analytics             → Analytics
/dash/billing               → Billing
/dash/settings              → Settings

// Auth (stub)
/login                      → Login Page (stub)
```

---

## Component Examples

### Status Badge
```tsx
// Minimal, pill-shaped badges
<Badge variant="signed">Signed</Badge>    // Green text, light green bg
<Badge variant="rejected">Rejected</Badge> // Red text, light red bg
<Badge variant="created">Created</Badge>   // Amber text, light amber bg
<Badge variant="expired">Expired</Badge>   // Gray text, light gray bg
```

### Data Table
```tsx
// Clean table with minimal styling
<Table>
  <TableHeader>
    <TableRow className="border-b border-gray-200">
      <TableHead className="font-medium text-black">Session ID</TableHead>
      ...
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-gray-50">
      ...
    </TableRow>
  </TableBody>
</Table>
```

### Button Styles
```tsx
// Primary: Black fill
<Button className="bg-black text-white hover:bg-gray-800">
  Create Contract
</Button>

// Secondary: White fill, black border
<Button variant="outline" className="border-black text-black hover:bg-gray-50">
  Cancel
</Button>
```

---

## Deliverables

1. **Complete React application** with all pages functional
2. **Stub data** that demonstrates all features
3. **Responsive layout** (desktop + tablet)
4. **Clean, minimal black & white UI** following design requirements
5. **TypeScript types** for all data structures
6. **README.md** with setup instructions

---

## Example Commands to Run

```bash
# Create project
npm create vite@latest face-sign-dashboard -- --template react-ts

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Add shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card table input select badge dialog dropdown-menu avatar separator tabs toast

# Additional packages
npm install react-router-dom lucide-react date-fns recharts @tanstack/react-table react-pdf

# Run dev server
npm run dev
```

---

## Final Notes

- Keep it SIMPLE - this is v1 for feedback
- Focus on Contracts module first (it's the main feature)
- Use shadcn/ui defaults where possible, just override colors
- No authentication logic needed - assume user is logged in
- Mock all API calls with stub data + artificial delay (300-500ms)
- Deploy to Vercel when complete and share the link
