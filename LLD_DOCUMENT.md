# Face Sign Platform - Low Level Design

**Version:** 1.0  
**Last Updated:** 5 February 2026

---

## 1. Application Entry

### 1.1 Login Page

**Route:** `/login`

**Description:**  
Authentication page for both Client Dashboard and ICP Console users. After successful login, users are redirected based on their role.

**UI:**
```
[Screenshot placeholder - Login Page]
```

**API Contract:**

```http
POST /v1/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "********"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "user-001",
      "email": "ahmed.malik@mof.gov.ae",
      "name": "Ahmed Al Malik",
      "role": "ROOT",
      "status": "ACTIVE",
      "orgId": "org-001",
      "isIcpUser": false
    }
  }
}
```

**Navigation After Login:**
- If `isIcpUser: true` → Redirect to `/console`
- If `isIcpUser: false` → Redirect to `/dash`

---

## 2. Client Dashboard (`/dash`)

Features available to client organizations using Face Sign.

### 2.1 Dashboard Home

**Route:** `/dash`

**Description:**  
Overview page showing key metrics, charts, and recent contracts for the logged-in organization.

**UI:**
```
[Screenshot placeholder - Client Dashboard Home]
```

**Components:**
- Stats Cards (Total, Signed, Rejected, Abandoned, Expired, Created)
- Contracts Over Time (Area Chart)
- Status Breakdown (Donut Chart)
- Drop-off Funnel
- Recent Contracts List

**API Contract:**

#### Get Analytics Data
```http
GET /v1/analytics?period={7d|30d|90d}&orgId={orgId}
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContracts": 1250,
    "signedContracts": 820,
    "rejectedContracts": 150,
    "abandonedContracts": 180,
    "expiredContracts": 100,
    "createdContracts": 0,
    "completionRate": 65.6,
    "kycPassRate": 78.5,
    "avgTimeToSign": 12.5,
    "avgKycDuration": 45,
    "totalChange": 12.5,
    "signedChange": 8.3,
    "rejectedChange": -2.1,
    "dailyStats": [
      {
        "date": "2026-01-06",
        "created": 45,
        "signed": 32,
        "rejected": 5,
        "abandoned": 6,
        "expired": 2
      },
      {
        "date": "2026-01-07",
        "created": 52,
        "signed": 38,
        "rejected": 4,
        "abandoned": 8,
        "expired": 2
      }
    ],
    "topDocuments": [
      { "name": "Employment_Contract.pdf", "count": 250, "signedCount": 180 },
      { "name": "NDA_Agreement.pdf", "count": 180, "signedCount": 145 }
    ],
    "dropOff": {
      "steps": [
        { "name": "Link Opened", "count": 1250, "percentage": 100, "dropOff": 0 },
        { "name": "Document Viewed", "count": 1150, "percentage": 92, "dropOff": 100 },
        { "name": "KYC Started", "count": 1062, "percentage": 85, "dropOff": 88 },
        { "name": "KYC Completed", "count": 975, "percentage": 78, "dropOff": 87 },
        { "name": "Signature Started", "count": 900, "percentage": 72, "dropOff": 75 },
        { "name": "Signed", "count": 820, "percentage": 65.6, "dropOff": 80 }
      ],
      "totalStarted": 1250,
      "totalCompleted": 820,
      "overallCompletionRate": 0.656
    }
  }
}
```

---

### 2.2 Contracts List

**Route:** `/dash/contracts`

**Description:**  
Table view of all contracts with filtering, searching, sorting, and pagination.

**UI:**
```
[Screenshot placeholder - Contracts List]
```

**Features:**
- Status filter dropdown (CREATED, SIGNED, REJECTED, ABANDONED, EXPIRED)
- Date range picker
- Search by contract ID or signer name
- Sortable columns
- Pagination
- Click row to view detail

**API Contract:**

```http
GET /v1/contracts?status={status}&dateFrom={date}&dateTo={date}&search={query}&orgId={orgId}&page={n}&limit={n}
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string[] | Filter by status: CREATED, SIGNED, REJECTED, ABANDONED, EXPIRED |
| dateFrom | date | Start date (ISO 8601) |
| dateTo | date | End date (ISO 8601) |
| search | string | Search by session ID or signer name |
| orgId | string | Filter by organization (ICP only) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contract-001",
      "sessionId": "FS-2026-00142",
      "status": "SIGNED",
      "documentName": "Employment_Contract.pdf",
      "documentHash": "sha256:abc123def456...",
      "pageCount": 5,
      "fileSizeKb": 245,
      "signerName": "Abdullah Mohammed",
      "signerIdNumber": "784-1985-1234567-1",
      "signerIdType": "EMIRATES_ID",
      "signerEmail": "abdullah@email.com",
      "kycJourneyId": "kyc-journey-001",
      "kycStatus": "SUCCESS",
      "kycCompletedAt": "2026-02-04T14:45:00Z",
      "createdAt": "2026-02-04T14:30:00Z",
      "expiresAt": "2026-02-05T14:30:00Z",
      "completedAt": "2026-02-04T14:50:00Z",
      "orgId": "org-004",
      "orgName": "Emirates Airlines"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### 2.3 Contract Detail

**Route:** `/dash/contracts/:id`

**Description:**  
Detailed view of a single contract showing document preview, signer info, and event timeline.

**UI:**
```
[Screenshot placeholder - Contract Detail]
```

**Components:**
- Document PDF preview/embed
- Contract metadata card
- Signer information card
- Event timeline
- Download buttons (original, signed)

**API Contract:**

```http
GET /v1/contracts/{contractId}
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contract-001",
    "sessionId": "FS-2026-00142",
    "status": "SIGNED",
    "documentName": "Employment_Contract.pdf",
    "documentHash": "sha256:abc123def456789...",
    "pageCount": 5,
    "fileSizeKb": 245,
    "documentUrl": "https://storage.facesign.ae/docs/contract-001/original.pdf",
    "signedDocumentUrl": "https://storage.facesign.ae/docs/contract-001/signed.pdf",
    "signerName": "Abdullah Mohammed",
    "signerIdNumber": "784-1985-1234567-1",
    "signerIdType": "EMIRATES_ID",
    "signerEmail": "abdullah@email.com",
    "kycJourneyId": "kyc-journey-001",
    "kycStatus": "SUCCESS",
    "kycCompletedAt": "2026-02-04T14:45:00Z",
    "signaturePositions": [
      { "page": 1, "x": 100, "y": 650, "width": 150, "height": 50 },
      { "page": 5, "x": 100, "y": 700, "width": 150, "height": 50 }
    ],
    "events": [
      {
        "id": "evt-abc123",
        "type": "CREATED",
        "timestamp": "2026-02-04T14:30:00Z",
        "description": "Session created and document uploaded"
      },
      {
        "id": "evt-def456",
        "type": "KYC_STARTED",
        "timestamp": "2026-02-04T14:35:00Z",
        "description": "Signer initiated KYC verification"
      },
      {
        "id": "evt-ghi789",
        "type": "KYC_COMPLETED",
        "timestamp": "2026-02-04T14:45:00Z",
        "description": "KYC verification completed successfully"
      },
      {
        "id": "evt-jkl012",
        "type": "SIGNATURE_POSITIONED",
        "timestamp": "2026-02-04T14:48:00Z",
        "description": "Signer positioned signature on document"
      },
      {
        "id": "evt-mno345",
        "type": "SIGNED",
        "timestamp": "2026-02-04T14:50:00Z",
        "description": "Document signed successfully"
      }
    ],
    "createdAt": "2026-02-04T14:30:00Z",
    "expiresAt": "2026-02-05T14:30:00Z",
    "completedAt": "2026-02-04T14:50:00Z",
    "orgId": "org-004",
    "orgName": "Emirates Airlines"
  }
}
```

**Event Types:**
- `CREATED` - Session created and document uploaded
- `KYC_STARTED` - Signer initiated KYC verification
- `KYC_COMPLETED` - KYC verification completed successfully
- `KYC_FAILED` - KYC verification failed
- `SIGNATURE_POSITIONED` - Signer positioned signature on document
- `SIGNED` - Document signed successfully
- `REJECTED` - Signer rejected the document
- `ABANDONED` - Session abandoned by signer
- `EXPIRED` - Session expired

---

### 2.4 API Keys

**Route:** `/dash/api-keys`

**Description:**  
Manage API keys for integrating Face Sign SDK. Create new keys, view existing keys, revoke keys.

**UI:**
```
[Screenshot placeholder - API Keys]
```

**Features:**
- API keys table (name, prefix, environment, status, created, last used, permissions)
- Create new key button → opens modal
- Revoke/Delete actions per key
- Full key shown only once on creation

**API Contracts:**

#### List API Keys
```http
GET /v1/api-keys
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "key-007",
      "name": "HR System Integration",
      "keyPrefix": "fs_live_ek01",
      "environment": "LIVE",
      "status": "ACTIVE",
      "createdAt": "2025-09-05T00:00:00Z",
      "lastUsedAt": "2026-02-04T08:00:00Z",
      "createdBy": "user-009",
      "createdByName": "Layla Ahmed",
      "permissions": ["sessions:create", "sessions:read", "webhooks:manage"],
      "orgId": "org-004"
    },
    {
      "id": "key-008",
      "name": "Test Environment",
      "keyPrefix": "fs_test_ek01",
      "environment": "TEST",
      "status": "ACTIVE",
      "createdAt": "2025-09-05T00:00:00Z",
      "lastUsedAt": "2026-01-20T10:30:00Z",
      "createdBy": "user-009",
      "createdByName": "Layla Ahmed",
      "permissions": ["sessions:create", "sessions:read", "sessions:delete"],
      "orgId": "org-004"
    }
  ]
}
```

#### Create API Key
```http
POST /v1/api-keys
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Mobile App Integration",
  "environment": "LIVE",
  "permissions": ["sessions:create", "sessions:read", "webhooks:manage"]
}
```

**Available Permissions:**
- `sessions:create` - Create new signing sessions
- `sessions:read` - View session details and status
- `sessions:delete` - Cancel or delete sessions
- `webhooks:manage` - Configure webhook endpoints
- `analytics:read` - Access analytics data

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "key-new-001",
    "name": "Mobile App Integration",
    "keyPrefix": "fs_live_ek02",
    "fullKey": "fs_live_ek02_sk_abc123xyz789defghijklmnop",
    "environment": "LIVE",
    "status": "ACTIVE",
    "createdAt": "2026-02-05T10:00:00Z",
    "lastUsedAt": null,
    "createdBy": "user-009",
    "createdByName": "Layla Ahmed",
    "permissions": ["sessions:create", "sessions:read", "webhooks:manage"],
    "orgId": "org-004"
  },
  "warning": "Store this key securely. It will not be shown again."
}
```

#### Revoke API Key
```http
POST /v1/api-keys/{keyId}/revoke
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "key-007",
    "status": "REVOKED"
  }
}
```

#### Delete API Key
```http
DELETE /v1/api-keys/{keyId}
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

---

### 2.5 Users

**Route:** `/dash/users`

**Description:**  
Manage team members within the organization. Add users, edit roles, disable/enable users.

**UI:**
```
[Screenshot placeholder - Users]
```

**Features:**
- Users table (name, email, role, status, last active)
- Add user button → opens form/modal
- Edit/Delete actions per user
- Role badges (ROOT, ADMIN, USER)

**User Roles:**
- `ROOT` - Full access, can manage users
- `ADMIN` - Full access except user management
- `USER` - View-only access to contracts

**User Status:**
- `ACTIVE` - User can log in
- `INVITED` - User has been invited but not activated
- `DISABLED` - User account is disabled

**API Contracts:**

#### List Users
```http
GET /v1/users?search={query}&page={n}&limit={n}
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-009",
      "email": "layla.ahmed@emirates.com",
      "name": "Layla Ahmed",
      "role": "ROOT",
      "status": "ACTIVE",
      "createdAt": "2025-09-01T00:00:00Z",
      "lastLoginAt": "2026-02-04T11:00:00Z",
      "orgId": "org-004"
    },
    {
      "id": "user-010",
      "email": "tariq.hassan@emirates.com",
      "name": "Tariq Hassan",
      "role": "ADMIN",
      "status": "ACTIVE",
      "createdAt": "2025-09-10T00:00:00Z",
      "lastLoginAt": "2026-02-03T15:30:00Z",
      "orgId": "org-004"
    },
    {
      "id": "user-011",
      "email": "new.employee@emirates.com",
      "name": "New Employee",
      "role": "USER",
      "status": "INVITED",
      "createdAt": "2026-02-01T00:00:00Z",
      "lastLoginAt": null,
      "invitedBy": "user-009",
      "orgId": "org-004"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

#### Create User
```http
POST /v1/users
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Team Member",
  "email": "newmember@emirates.com",
  "role": "USER"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "user-new-001",
    "email": "newmember@emirates.com",
    "name": "New Team Member",
    "role": "USER",
    "status": "INVITED",
    "createdAt": "2026-02-05T10:00:00Z",
    "lastLoginAt": null,
    "invitedBy": "user-009",
    "orgId": "org-004"
  }
}
```

#### Update User
```http
PUT /v1/users/{userId}
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Updated Name",
  "role": "ADMIN",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-010",
    "email": "tariq.hassan@emirates.com",
    "name": "Updated Name",
    "role": "ADMIN",
    "status": "ACTIVE",
    "orgId": "org-004"
  }
}
```

#### Delete User
```http
DELETE /v1/users/{userId}
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 2.6 Billing

**Route:** `/dash/billing`

**Description:**  
View prepaid credits balance, usage metrics, and transaction history. Billing is **prepaid credits only** - no currency displayed.

**UI:**
```
[Screenshot placeholder - Billing]
```

**Features:**
- Credits balance card (available, used, threshold warning)
- Current period usage
- Top-up history
- Usage history (per contract)

**API Contract:**

#### Get Billing Data
```http
GET /v1/billing
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plan": "ENTERPRISE",
    "planName": "Government Enterprise",
    "credits": {
      "available": 8750,
      "used": 1250,
      "lowBalanceThreshold": 500
    },
    "pricing": {
      "kycPerJourney": 1,
      "faceSignPerContract": 1
    },
    "currentPeriod": {
      "start": "2026-02-01T00:00:00Z",
      "end": "2026-02-28T23:59:59Z",
      "contractsSigned": 145,
      "creditsConsumed": 145
    },
    "topUpHistory": [
      {
        "id": "topup-001",
        "credits": 10000,
        "date": "2025-12-15T00:00:00Z",
        "addedBy": "icp-001",
        "addedByName": "ICP Admin",
        "reference": "INV-2025-EK-001"
      }
    ],
    "usageHistory": [
      {
        "id": "usage-001",
        "sessionId": "contract-142",
        "sessionDisplayId": "FS-2026-00142",
        "creditsUsed": 1,
        "date": "2026-02-04T14:32:00Z",
        "type": "FACE_SIGN"
      },
      {
        "id": "usage-002",
        "sessionId": "contract-141",
        "sessionDisplayId": "FS-2026-00141",
        "creditsUsed": 1,
        "date": "2026-02-04T11:15:00Z",
        "type": "FACE_SIGN"
      }
    ]
  }
}
```

**Plan Types:**
- `STARTER` - For small organizations
- `PROFESSIONAL` - For medium organizations
- `ENTERPRISE` - For large organizations
- `CUSTOM` - Custom pricing

**Usage Types:**
- `FACE_SIGN` - Credits used for Face Sign contract
- `KYC` - Credits used for KYC journey

---

### 2.7 Settings

**Route:** `/dash/settings`

**Description:**  
Organization settings and preferences.

**UI:**
```
[Screenshot placeholder - Settings]
```

**Features:**
- Organization profile (name, logo, timezone)
- Session configuration (TTL, max file size)
- Webhook URL
- Notification preferences

**API Contracts:**

#### Get Organization Settings
```http
GET /v1/settings/organization
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org-004",
    "name": "Emirates Airlines",
    "slug": "emirates",
    "logoUrl": null,
    "timezone": "Asia/Dubai",
    "status": "ACTIVE",
    "industry": "Aviation",
    "sessionTtlHours": 72,
    "maxFileSizeMb": 50,
    "webhookUrl": "https://hr.emirates.com/api/signing-webhook",
    "emailNotifications": true,
    "notifyOnComplete": true,
    "notifyOnReject": true,
    "totalContracts": 3450,
    "activeUsers": 156,
    "createdAt": "2025-09-01T00:00:00Z"
  }
}
```

#### Update Organization Settings
```http
PUT /v1/settings/organization
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "orgName": "Emirates Airlines",
  "timezone": "Asia/Dubai",
  "sessionTtlHours": 48,
  "maxFileSizeMb": 75,
  "webhookUrl": "https://hr.emirates.com/api/signing-webhook/v2",
  "emailNotifications": true,
  "notifyOnComplete": true,
  "notifyOnReject": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org-004",
    "name": "Emirates Airlines",
    "timezone": "Asia/Dubai",
    "sessionTtlHours": 48,
    "maxFileSizeMb": 75,
    "webhookUrl": "https://hr.emirates.com/api/signing-webhook/v2",
    "emailNotifications": true,
    "notifyOnComplete": true,
    "notifyOnReject": false
  }
}
```

---

## 3. ICP Console (`/console`)

Features available to Face Sign internal staff (ICP = Internal Control Panel).

### 3.1 Console Dashboard

**Route:** `/console`

**Description:**  
Platform-wide overview for ICP staff showing aggregate metrics across all organizations.

**UI:**
```
[Screenshot placeholder - ICP Dashboard]
```

**Components:**
- Platform-wide stats (total orgs, total contracts, completion rate)
- Contracts over time (all orgs)
- Top organizations by volume
- Organization breakdown

**API Contract:**

```http
GET /v1/admin/analytics/platform?period={7d|30d|90d}
Authorization: Bearer {icp_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContracts": 13360,
    "signedContracts": 9850,
    "rejectedContracts": 1200,
    "abandonedContracts": 1500,
    "expiredContracts": 810,
    "createdContracts": 0,
    "completionRate": 73.7,
    "kycPassRate": 82.5,
    "totalChange": 15.2,
    "signedChange": 12.8,
    "rejectedChange": -3.5,
    "dailyStats": [
      {
        "date": "2026-02-03",
        "created": 450,
        "signed": 320,
        "rejected": 45,
        "abandoned": 60,
        "expired": 25
      }
    ],
    "topOrganizations": [
      { "id": "org-005", "name": "First Abu Dhabi Bank", "contracts": 5670 },
      { "id": "org-004", "name": "Emirates Airlines", "contracts": 3450 },
      { "id": "org-003", "name": "Abu Dhabi Digital Authority", "contracts": 2100 }
    ],
    "dropOff": {
      "steps": [
        { "name": "Link Opened", "count": 13360, "percentage": 100, "dropOff": 0 },
        { "name": "Document Viewed", "count": 12291, "percentage": 92, "dropOff": 1069 },
        { "name": "KYC Started", "count": 11356, "percentage": 85, "dropOff": 935 },
        { "name": "KYC Completed", "count": 10420, "percentage": 78, "dropOff": 936 },
        { "name": "Signature Started", "count": 9619, "percentage": 72, "dropOff": 801 },
        { "name": "Signed", "count": 9850, "percentage": 73.7, "dropOff": -231 }
      ],
      "totalStarted": 13360,
      "totalCompleted": 9850,
      "overallCompletionRate": 0.737
    }
  }
}
```

---

### 3.2 Console Contracts

**Route:** `/console/contracts`

**Description:**  
View ALL contracts across ALL organizations. Same as client contracts but with organization filter.

**UI:**
```
[Screenshot placeholder - ICP Contracts]
```

**Features:**
- All features from Client Contracts (2.2)
- Additional: Organization filter dropdown

**API Contract:**

```http
GET /v1/admin/contracts?orgId={orgId}&status={status}&dateFrom={date}&dateTo={date}&search={query}&page={n}&limit={n}
Authorization: Bearer {icp_jwt_token}
```

**Response:** Same structure as Client Contracts (2.2) - includes `orgId` and `orgName` for each contract.

---

### 3.3 Console Contract Detail

**Route:** `/console/contracts/:id`

**Description:**  
Same as Client Contract Detail but accessible for any organization's contract.

**UI:**
```
[Screenshot placeholder - ICP Contract Detail]
```

**API Contract:** Same as Client Contract Detail (2.3)

---

### 3.4 Organizations List

**Route:** `/console/organizations`

**Description:**  
View and manage all client organizations on the platform.

**UI:**
```
[Screenshot placeholder - Organizations List]
```

**Features:**
- Organizations table (name, industry, contracts count, users count, status, created date)
- Search by org name
- Filter by status (ACTIVE, SUSPENDED, PENDING)
- Click row to view org detail
- "Onboard Client" button

**API Contract:**

```http
GET /v1/admin/organizations?search={query}&status={status}&page={n}&limit={n}
Authorization: Bearer {icp_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "org-001",
      "name": "Ministry of Finance",
      "slug": "mof",
      "logoUrl": null,
      "timezone": "Asia/Dubai",
      "createdAt": "2025-06-15T00:00:00Z",
      "status": "ACTIVE",
      "industry": "Government",
      "sessionTtlHours": 24,
      "maxFileSizeMb": 50,
      "webhookUrl": "https://api.mof.gov.ae/webhooks/facesign",
      "emailNotifications": true,
      "notifyOnComplete": true,
      "notifyOnReject": true,
      "totalContracts": 1250,
      "activeUsers": 45
    },
    {
      "id": "org-002",
      "name": "Dubai Health Authority",
      "slug": "dha",
      "logoUrl": null,
      "timezone": "Asia/Dubai",
      "createdAt": "2025-07-20T00:00:00Z",
      "status": "ACTIVE",
      "industry": "Healthcare",
      "sessionTtlHours": 48,
      "maxFileSizeMb": 100,
      "webhookUrl": "https://api.dha.gov.ae/facesign/webhook",
      "emailNotifications": true,
      "notifyOnComplete": true,
      "notifyOnReject": false,
      "totalContracts": 890,
      "activeUsers": 32
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

**Organization Status:**
- `ACTIVE` - Organization is active and can use the platform
- `SUSPENDED` - Organization is temporarily suspended
- `PENDING` - Organization is pending activation

---

### 3.5 Organization Detail

**Route:** `/console/organizations/:id`

**Description:**  
Detailed view of a specific organization with stats, users, and quick actions.

**UI:**
```
[Screenshot placeholder - Organization Detail]
```

**Features:**
- Organization info card
- Stats cards (contracts, users, API keys)
- Recent contracts for this org
- Users list for this org
- Actions: Suspend, Edit, View All Contracts

**API Contract:**

```http
GET /v1/admin/organizations/{orgId}
Authorization: Bearer {icp_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "org-004",
      "name": "Emirates Airlines",
      "slug": "emirates",
      "logoUrl": null,
      "timezone": "Asia/Dubai",
      "createdAt": "2025-09-01T00:00:00Z",
      "status": "ACTIVE",
      "industry": "Aviation",
      "sessionTtlHours": 72,
      "maxFileSizeMb": 50,
      "webhookUrl": "https://hr.emirates.com/api/signing-webhook",
      "emailNotifications": true,
      "notifyOnComplete": true,
      "notifyOnReject": true,
      "totalContracts": 3450,
      "activeUsers": 156
    },
    "stats": {
      "totalContracts": 3450,
      "signedContracts": 2500,
      "rejectedContracts": 350,
      "abandonedContracts": 400,
      "expiredContracts": 200,
      "completionRate": 72.5,
      "totalUsers": 156,
      "apiKeysCount": 3,
      "creditsAvailable": 8750
    },
    "recentContracts": [
      {
        "id": "contract-142",
        "sessionId": "FS-2026-00142",
        "status": "SIGNED",
        "documentName": "Employment_Contract.pdf",
        "signerName": "Abdullah Mohammed",
        "createdAt": "2026-02-04T14:30:00Z"
      }
    ],
    "users": [
      {
        "id": "user-009",
        "name": "Layla Ahmed",
        "email": "layla.ahmed@emirates.com",
        "role": "ROOT",
        "status": "ACTIVE"
      }
    ]
  }
}
```

---

### 3.6 Onboard Client

**Route:** `/console/onboard-client`

**Description:**  
Multi-step wizard to onboard a new client organization.

**UI:**
```
[Screenshot placeholder - Onboard Client Wizard]
```

**Steps:**
1. **Organization Details** - Name, slug, industry, timezone
2. **Admin User** - Email, name (creates ROOT user)
3. **Configuration** - Session TTL, max file size, webhook URL
4. **Review & Submit** - Confirm all details and create

**API Contract:**

```http
POST /v1/admin/organizations
Authorization: Bearer {icp_jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "organization": {
    "name": "New Client Corporation",
    "slug": "newclient",
    "industry": "Technology",
    "timezone": "Asia/Dubai",
    "sessionTtlHours": 24,
    "maxFileSizeMb": 50,
    "webhookUrl": "https://api.newclient.com/webhook",
    "emailNotifications": true,
    "notifyOnComplete": true,
    "notifyOnReject": true
  },
  "adminUser": {
    "email": "admin@newclient.com",
    "name": "Admin User"
  },
  "initialCredits": 1000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "org-new-001",
      "name": "New Client Corporation",
      "slug": "newclient",
      "status": "ACTIVE",
      "createdAt": "2026-02-05T10:00:00Z"
    },
    "adminUser": {
      "id": "user-new-001",
      "email": "admin@newclient.com",
      "name": "Admin User",
      "role": "ROOT",
      "status": "INVITED",
      "inviteSent": true
    },
    "apiKey": {
      "id": "key-new-001",
      "name": "Default API Key",
      "keyPrefix": "fs_test_nc01",
      "fullKey": "fs_test_nc01_sk_abc123xyz789...",
      "environment": "TEST",
      "status": "ACTIVE"
    },
    "credits": {
      "available": 1000,
      "used": 0
    }
  }
}
```

---

## 4. Common API Patterns

### 4.1 Authentication Header

All authenticated endpoints require:
```http
Authorization: Bearer {jwt_token}
```

### 4.2 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 4.3 Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## 5. Navigation Flow

```
                            ┌─────────────┐
                            │   LOGIN     │
                            │   /login    │
                            └──────┬──────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
              isIcpUser?                    isIcpUser?
                true                          false
                    │                             │
                    ▼                             ▼
         ┌─────────────────┐           ┌─────────────────┐
         │  ICP CONSOLE    │           │ CLIENT DASHBOARD│
         │    /console     │           │     /dash       │
         └────────┬────────┘           └────────┬────────┘
                  │                             │
    ┌─────────────┼─────────────┐    ┌──────────┼──────────────┐
    │             │             │    │          │              │
    ▼             ▼             ▼    ▼          ▼              ▼
┌────────┐  ┌──────────┐  ┌─────┐  ┌────────┐ ┌─────────┐ ┌────────┐
│Dashboard│  │Contracts │  │Orgs │  │Dashboard│ │Contracts│ │API Keys│
└────────┘  └──────────┘  └─────┘  └────────┘ └─────────┘ └────────┘
                              │                     │          │
                              ▼                     ▼          ▼
                         ┌────────┐           ┌─────────┐ ┌────────┐
                         │Onboard │           │ Detail  │ │ Users  │
                         │ Client │           │  View   │ └────────┘
                         └────────┘           └─────────┘      │
                                                               ▼
                                                          ┌────────┐
                                                          │Billing │
                                                          └────────┘
                                                               │
                                                               ▼
                                                          ┌────────┐
                                                          │Settings│
                                                          └────────┘
```

---

*Document Version: 1.0*  
*Last Updated: 5 February 2026*
