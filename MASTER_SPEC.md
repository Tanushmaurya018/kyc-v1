# Face Sign Admin Dashboard - Master Specification

> **📌 This is the SINGLE SOURCE OF TRUTH**
> 
> All context, requirements, and changes are documented here. This file is updated with every change made to the project.

---

## 📅 Last Updated: 5 February 2026

## 📝 Change Log

| Date | Change | Details |
|------|--------|---------|
| 5 Feb 2026 | Initial creation | Consolidated all 3 spec files into this master document |
| 5 Feb 2026 | Billing model | Changed from currency-based to **prepaid credits** model |
| 5 Feb 2026 | User roles | Changed from ADMIN/MANAGER/VIEWER to **ROOT/ADMIN/USER** |
| 5 Feb 2026 | Onboarding wizard | Added 5-step wizard for ICP Console |
| 5 Feb 2026 | Drop-off funnel | Added conversion funnel analytics visualization |
| 5 Feb 2026 | Document preview | Added PDF embed preview in contract detail |
| 5 Feb 2026 | Green colors | Changed to **emerald** shade for better aesthetics |
| 5 Feb 2026 | **Rounded corners** | Added `--radius` CSS variables (0.5rem default) |
| 5 Feb 2026 | **Chart colors** | Muted/softer palette (emerald-300, red-300, amber-300) |
| 5 Feb 2026 | **Funnel UI redesign** | Cleaner design with step numbers, rounded bars, drop-off indicators |
| 5 Feb 2026 | **Area chart** | Changed from LineChart to AreaChart with gradients |

---

## 🎯 Project Overview

### What is Face Sign?
**Face Sign** is a digital document signing platform that uses **facial recognition/KYC** to verify the signer's identity before they can sign. It's part of the larger **UAE KYC Platform**.

### What are we building?
The **Admin Dashboard** - a control panel with two personas:
1. **Client Dashboard** (`/dash`) - For businesses that USE Face Sign
2. **ICP Console** (`/console`) - For Face Sign internal staff (ICP = Internal Control Panel)

### Why two dashboards?
Different users need different things:
- Clients should only see their own organization's data
- Internal staff needs to see ALL organizations and manage them

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UAE KYC PLATFORM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    KYC DASHBOARD (Existing)                      │   │
│  │  • KYC Journeys (Onboarding, ReKYC, Authorise, 1:Many)          │   │
│  │  • Organization Management                                       │   │
│  │  • User Management                                               │   │
│  │  • API Keys                                                      │   │
│  │  • Billing & Credits                                             │   │
│  │  • Analytics                                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              FACE SIGN DASHBOARD (This Project)                  │   │
│  │  • Face Sign Sessions (Contracts)                                │   │
│  │  • Abstracts KYC journey details                                 │   │
│  │  • Shows signing-specific data points                            │   │
│  │  • Separate ownership/branding possible                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Session vs Journey Relationship

```
FACE SIGN SESSION (Parent Workflow)
        │
        ├── Session Token generated by Face Sign
        ├── User previews document
        ├── User confirms preview
        │
        └── KYC JOURNEY (Child Workflow) ◄── Created just before face verification
                ├── Face liveness check
                └── Returns to Face Sign session
                        ├── User positions signature
                        └── Session COMPLETE
```

---

## 🛠️ Tech Stack

| Technology | Purpose | Why? |
|------------|---------|------|
| **React 18+** | UI framework | Most popular, huge ecosystem |
| **TypeScript** | Type safety | Catches bugs before runtime |
| **Vite** | Build tool | Super fast development |
| **Tailwind CSS v4** | Styling | Rapid development with utility classes |
| **shadcn/ui-style** | Components | Beautiful, customizable (manually created) |
| **React Router v6** | Navigation | Handle different pages/URLs |
| **Lucide React** | Icons | Clean, consistent icon set |
| **date-fns** | Dates | Lightweight date formatting |
| **Recharts** | Charts | Easy data visualization |
| **TanStack Table** | Tables | Powerful data tables |

---

## 🎨 Design System

### Theme: Minimal Black & White

```css
:root {
  /* Core Colors */
  --background: #FFFFFF;
  --foreground: #000000;
  --border: #E5E5E5;
  --muted: #F5F5F5;
  --muted-foreground: #6B7280;

  /* Status Colors (ONLY exceptions to B&W) */
  --success: emerald-500/600;     /* Signed, completed */
  --error: #EF4444;               /* Rejected, failed */
  --warning: #F59E0B;             /* Pending, created */
  --info: #6B7280;                /* Expired, abandoned */
}
```

### Design Principles
1. **Minimalist** - No unnecessary decorations
2. **High contrast** - Black text on white background
3. **Clean typography** - Clear hierarchy
4. **Generous whitespace** - Breathing room
5. **Flat design** - No 3D effects
6. **Functional** - Every element serves a purpose

---

## 📁 Project Structure

```
src/
├── main.tsx                    # App entry point
├── App.tsx                     # Root component with router
├── routes.tsx                  # Route definitions
├── index.css                   # Global styles
│
├── types/                      # TypeScript definitions
│   ├── contract.ts             # Contract/Session types
│   ├── user.ts                 # User & role types
│   ├── organization.ts         # Organization types
│   ├── api-key.ts              # API key types
│   ├── billing.ts              # Credits & billing types
│   └── analytics.ts            # Analytics types
│
├── data/                       # Mock/stub data
│   ├── contracts.ts
│   ├── users.ts
│   ├── organizations.ts
│   ├── api-keys.ts
│   ├── billing.ts
│   └── analytics.ts
│
├── hooks/                      # Custom React hooks
│   ├── useContracts.ts
│   ├── useUsers.ts
│   └── useAnalytics.ts
│
├── lib/
│   └── utils.ts                # Utility functions (cn, formatters)
│
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── Header.tsx          # Page header
│   │   └── ProductSwitcher.tsx # UAE KYC ↔ Face Sign toggle
│   │
│   ├── contracts/
│   │   ├── ContractsTable.tsx
│   │   ├── ContractDetail.tsx  # With PDF preview
│   │   ├── ContractFilters.tsx
│   │   └── StatusBadge.tsx
│   │
│   ├── analytics/
│   │   ├── StatsCards.tsx
│   │   ├── ContractsChart.tsx
│   │   ├── StatusBreakdown.tsx
│   │   └── DropOffFunnel.tsx   # Conversion funnel
│   │
│   ├── billing/
│   │   ├── CurrentPlan.tsx     # Credits balance card
│   │   └── InvoicesTable.tsx   # Top-up & usage history
│   │
│   ├── users/
│   │   ├── UsersTable.tsx
│   │   └── UserForm.tsx
│   │
│   ├── api-keys/
│   │   ├── ApiKeysTable.tsx
│   │   └── CreateKeyModal.tsx
│   │
│   ├── onboarding/
│   │   └── OnboardingWizard.tsx  # 5-step org wizard
│   │
│   └── settings/
│       └── OrgSettings.tsx
│
└── pages/
    ├── Login.tsx
    │
    ├── console/                # ICP Console pages
    │   ├── Dashboard.tsx
    │   ├── Contracts.tsx
    │   ├── ContractDetail.tsx
    │   ├── Organizations.tsx
    │   ├── OrganizationDetail.tsx
    │   └── Analytics.tsx
    │
    └── dash/                   # Client Dashboard pages
        ├── Dashboard.tsx
        ├── Contracts.tsx
        ├── ContractDetail.tsx
        ├── ApiKeys.tsx
        ├── Users.tsx
        ├── Analytics.tsx
        ├── Billing.tsx
        └── Settings.tsx
```

---

## 📊 Data Models

### Contract (Session)

```typescript
interface Contract {
  id: string;                    // UUID
  sessionId: string;             // Display ID "FS-2026-XXXXX"
  status: ContractStatus;
  
  // Document
  documentName: string;
  documentHash: string;          // "sha256:..."
  pageCount: number;
  fileSizeKb: number;
  documentUrl?: string;          // Original PDF URL
  signedDocumentUrl?: string;    // Signed PDF URL
  
  // Signer
  signerName: string;
  signerIdNumber: string;
  signerIdType: 'EMIRATES_ID' | 'PASSPORT' | 'GCC_ID';
  
  // KYC
  kycJourneyId: string | null;
  kycStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | null;
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  completedAt: Date | null;
  
  // Organization
  orgId: string;
  orgName: string;
}

type ContractStatus = 'CREATED' | 'SIGNED' | 'REJECTED' | 'ABANDONED' | 'EXPIRED';
```

### User Roles ✅ UPDATED

```typescript
// NEW role system (changed from ADMIN/MANAGER/VIEWER)
type UserRole = 'ROOT' | 'ADMIN' | 'USER';

const roleLabels: Record<UserRole, string> = {
  ROOT: 'Root',
  ADMIN: 'Admin',
  USER: 'User',
};

const rolePermissions: Record<UserRole, string[]> = {
  ROOT: ['*'],  // Full access including billing & delete
  ADMIN: ['contracts:*', 'users:read', 'users:invite', 'analytics:read', 'settings:read'],
  USER: ['contracts:read', 'contracts:create'],
};
```

| Permission | ROOT | ADMIN | USER |
|------------|------|-------|------|
| View contracts | ✓ | ✓ | ✓ |
| Create contracts | ✓ | ✓ | ✓ |
| Manage users | ✓ | ✓ | ✗ |
| Manage API keys | ✓ | ✓ | ✗ |
| Billing access | ✓ | ✗ | ✗ |
| Delete organization | ✓ | ✗ | ✗ |
| All settings | ✓ | ✓ | ✗ |

### Billing (Prepaid Credits) ✅ UPDATED

**IMPORTANT**: Billing is PREPAID only. No currency displayed on dashboard.

```typescript
interface CreditsBalance {
  available: number;          // Current credits
  used: number;               // Total consumed
  lowBalanceThreshold: number;// Warn when below this
}

interface TopUpTransaction {
  id: string;
  credits: number;
  date: Date;
  addedBy: string;            // ICP user who added
  reference?: string;
}

interface UsageTransaction {
  id: string;
  contractId: string;
  contractName: string;
  creditsUsed: number;
  date: Date;
}

type BillingPlan = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
```

### Analytics ✅ UPDATED

```typescript
interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
}

interface DropOffAnalytics {
  steps: FunnelStep[];
  totalStarted: number;
  totalCompleted: number;
  overallCompletionRate: number;
}

// Funnel steps (in order):
// 1. Link Opened
// 2. Document Viewed
// 3. KYC Started
// 4. KYC Completed
// 5. Signature Started
// 6. Signed ✓
```

---

## 🗺️ Routes

```typescript
// Auth
/login                      → Login Page (stub)

// ICP Console (Internal Staff)
/console                    → Console Dashboard
/console/contracts          → All Contracts (all orgs)
/console/contracts/:id      → Contract Detail
/console/organizations      → Organizations List
/console/organizations/:id  → Organization Detail
/console/analytics          → Aggregate Analytics

// Client Dashboard (Business Users)
/dash                       → Dashboard (overview)
/dash/contracts             → Contracts List
/dash/contracts/:id         → Contract Detail
/dash/api-keys              → API Keys
/dash/users                 → Users
/dash/analytics             → Analytics
/dash/billing               → Billing & Credits
/dash/settings              → Settings
```

---

## 🧙 Organization Onboarding Wizard ✅ IMPLEMENTED

5-step wizard for ICP to onboard new organizations:

```
Step 1: Organization Details
├── Organization name
├── Type (Government/Private)
├── Contact email
└── Industry

Step 2: Root User
├── Full name
├── Email address
└── Will receive invitation email

Step 3: API Setup
├── Generate test API key
└── Generate live API key (optional)

Step 4: Initial Credits
├── Select initial credit amount
└── 100 / 500 / 1000 / Custom

Step 5: Review & Create
├── Summary of all inputs
└── Create Organization button
```

---

## 📈 Drop-Off Funnel Analytics ✅ IMPLEMENTED

Shows where users abandon the signing process:

```
Link Opened      ████████████████████████ 1,000 (100%)
                      ↓ -50 dropped
Document Viewed  ██████████████████████░░   950 (95%)
                      ↓ -190 dropped
KYC Started      ██████████████████░░░░░░   760 (80%)
                      ↓ -228 dropped
KYC Completed    █████████████░░░░░░░░░░░   532 (70%)
                      ↓ -53 dropped
Signature Start  ████████████░░░░░░░░░░░░   479 (90%)
                      ↓ -72 dropped
Signed ✓         ██████████░░░░░░░░░░░░░░   407 (85%)
```

Colors: Uses **emerald** green for positive metrics.

---

## 📄 Document Preview ✅ IMPLEMENTED

Contract detail page includes embedded PDF preview:

- Uses `<object>` tag for PDF embed
- Fallback link for unsupported browsers
- Shows both original and signed documents
- "Digitally Signed" overlay badge on signed docs
- Sample PDF from Mozilla's PDF.js project for demo

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ✅ Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Project setup | ✅ Done | Vite + React + TypeScript |
| Layout & Navigation | ✅ Done | Sidebar, Header, Product Switcher |
| Contracts module | ✅ Done | List, Detail, Filters, PDF Preview |
| Users module | ✅ Done | Table, Form, Roles |
| API Keys module | ✅ Done | Table, Create Modal |
| Analytics module | ✅ Done | Stats, Charts, Drop-Off Funnel |
| Billing module | ✅ Done | Credits model, Top-up/Usage history |
| Settings module | ✅ Done | Org settings form |
| Onboarding Wizard | ✅ Done | 5-step wizard in ICP Console |
| ICP Console | ✅ Done | All pages |
| Client Dashboard | ✅ Done | All pages |
| Document Preview | ✅ Done | PDF embed with fallback |
| Prepaid Credits | ✅ Done | No currency, credits only |
| User Roles | ✅ Done | ROOT/ADMIN/USER |

---

## 🔮 Future Enhancements

- [ ] Real backend API integration
- [ ] Authentication (OAuth/JWT)
- [ ] Email notifications
- [ ] Webhooks configuration
- [ ] Export to CSV/Excel
- [ ] Dark mode support
- [ ] Mobile responsiveness
- [ ] Internationalization (i18n)

---

## 📚 Reference Documents

The following original spec files are preserved for reference:
- `DASHBOARD_PROMPT.md` - Original dashboard development prompt
- `FACE_SIGN_DASHBOARD_SPEC.md` - Technical specification from discussions
- `JOURNEY_ONBOARDING_PROMPT.md` - KYC journey and onboarding system details

**Note**: This MASTER_SPEC.md supersedes those documents. All future changes should be documented here.

---

## 🆘 Quick Reference

### Contract Statuses
| Status | Color | Meaning |
|--------|-------|---------|
| `CREATED` | Amber | New, waiting for signer |
| `SIGNED` | Emerald | ✅ Successfully completed |
| `REJECTED` | Red | KYC verification failed |
| `ABANDONED` | Gray | User quit mid-process |
| `EXPIRED` | Gray | Time ran out |

### User Roles
| Role | Description |
|------|-------------|
| `ROOT` | Organization owner, full access |
| `ADMIN` | Manager, can manage users/contracts |
| `USER` | Regular user, can only create/view contracts |

### Key Terminology
| Term | Meaning |
|------|---------|
| **Contract** | A document signing session |
| **Session** | Same as contract (interchangeable) |
| **KYC** | "Know Your Customer" - identity verification |
| **ICP** | Internal Control Panel (admin console) |
| **Credits** | Prepaid units for using the service |
| **Top-up** | Adding more credits to balance |
