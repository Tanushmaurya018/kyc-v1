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
- POST /v1/auth/login

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
- GET /v1/analytics?period={7d|30d|90d}&orgId={orgId}

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
- GET /v1/contracts?status={status}&dateFrom={date}&dateTo={date}&search={query}&orgId={orgId}&page={n}&limit={n}

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
- GET /v1/contracts/{contractId}

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
- GET /v1/api-keys
- POST /v1/api-keys
- POST /v1/api-keys/{keyId}/revoke
- DELETE /v1/api-keys/{keyId}

**Available Permissions:**
- `sessions:create` - Create new signing sessions
- `sessions:read` - View session details and status
- `sessions:delete` - Cancel or delete sessions
- `webhooks:manage` - Configure webhook endpoints
- `analytics:read` - Access analytics data

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
- GET /v1/users?search={query}&page={n}&limit={n}
- POST /v1/users
- PUT /v1/users/{userId}
- DELETE /v1/users/{userId}

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
- GET /v1/billing

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
- GET /v1/settings/organization
- PUT /v1/settings/organization

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
- GET /v1/admin/analytics/platform?period={7d|30d|90d}

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
- GET /v1/admin/contracts?orgId={orgId}&status={status}&dateFrom={date}&dateTo={date}&search={query}&page={n}&limit={n}

---

### 3.3 Console Contract Detail

**Route:** `/console/contracts/:id`

**Description:**  
Same as Client Contract Detail but accessible for any organization's contract.

**UI:**
```
[Screenshot placeholder - ICP Contract Detail]
```

**API Contract:**
- GET /v1/contracts/{contractId}

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
- GET /v1/admin/organizations?search={query}&status={status}&page={n}&limit={n}

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
- GET /v1/admin/organizations/{orgId}

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
- POST /v1/admin/organizations

---

## 4. Common API Patterns

### 4.1 Authentication Header
All authenticated endpoints require:
- Authorization: Bearer {jwt_token}

### 4.2 Error Response Format
Standard error format (see main LLD)

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
