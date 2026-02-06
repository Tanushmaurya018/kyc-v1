# Face Sign Platform - Low Level Design (Endpoints Only)

**Version:** 1.0  
**Last Updated:** 5 February 2026

---

## 1. Application Entry

### 1.1 Login Page

**Route:** `/login`

**API Endpoint:**
- POST /v1/auth/login

---

## 2. Client Dashboard (`/dash`)

### 2.1 Dashboard Home

**Route:** `/dash`

**API Endpoint:**
- GET /v1/analytics?period={7d|30d|90d}&orgId={orgId}

---

### 2.2 Contracts List

**Route:** `/dash/contracts`

**API Endpoint:**
- GET /v1/contracts?status={status}&dateFrom={date}&dateTo={date}&search={query}&orgId={orgId}&page={n}&limit={n}

---

### 2.3 Contract Detail

**Route:** `/dash/contracts/:id`

**API Endpoint:**
- GET /v1/contracts/{contractId}

---

### 2.4 API Keys

**Route:** `/dash/api-keys`

**API Endpoints:**
- GET /v1/api-keys
- POST /v1/api-keys
- POST /v1/api-keys/{keyId}/revoke
- DELETE /v1/api-keys/{keyId}

---

### 2.5 Users

**Route:** `/dash/users`

**API Endpoints:**
- GET /v1/users?search={query}&page={n}&limit={n}
- POST /v1/users
- PUT /v1/users/{userId}
- DELETE /v1/users/{userId}

---

### 2.6 Billing

**Route:** `/dash/billing`

**API Endpoint:**
- GET /v1/billing

---

### 2.7 Settings

**Route:** `/dash/settings`

**API Endpoints:**
- GET /v1/settings/organization
- PUT /v1/settings/organization

---

## 3. ICP Console (`/console`)

### 3.1 Console Dashboard

**Route:** `/console`

**API Endpoint:**
- GET /v1/admin/analytics/platform?period={7d|30d|90d}

---

### 3.2 Console Contracts

**Route:** `/console/contracts`

**API Endpoint:**
- GET /v1/admin/contracts?orgId={orgId}&status={status}&dateFrom={date}&dateTo={date}&search={query}&page={n}&limit={n}

---

### 3.3 Console Contract Detail

**Route:** `/console/contracts/:id`

**API Endpoint:**
- GET /v1/contracts/{contractId}

---

### 3.4 Organizations List

**Route:** `/console/organizations`

**API Endpoint:**
- GET /v1/admin/organizations?search={query}&status={status}&page={n}&limit={n}

---

### 3.5 Organization Detail

**Route:** `/console/organizations/:id`

**API Endpoint:**
- GET /v1/admin/organizations/{orgId}

---

### 3.6 Onboard Client

**Route:** `/console/onboard-client`

**API Endpoint:**
- POST /v1/admin/organizations

---

## 4. Common API Patterns

### 4.1 Authentication Header
- Authorization: Bearer {jwt_token}

### 4.2 Error Response Format
- Standard error format (see main LLD)

### 4.3 Common Error Codes
- UNAUTHORIZED (401)
- FORBIDDEN (403)
- NOT_FOUND (404)
- VALIDATION_ERROR (400)
- RATE_LIMITED (429)
- INTERNAL_ERROR (500)

---

## 5. Navigation Flow

Refer to main LLD for navigation diagram.

---

*Document Version: 1.0*  
*Last Updated: 5 February 2026*
