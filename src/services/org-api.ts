import { serveApi } from "@/lib/serve-api-client";

// ── Org List ─────────────────────────────────────────────────────────

export interface OrgListItem {
  id: string;
  company_name: string;
  org_type?: string;
  email?: string;
  city?: string;
  country_name?: string;
  created_at?: string;
}

export async function getOrganizations(): Promise<OrgListItem[]> {
  return serveApi.get<OrgListItem[]>(`/org`);
}

// ── Org Detail ───────────────────────────────────────────────────────

export interface OrgRootUser {
  id: string;
  name: string;
  email: string;
}

export interface OrgDetail {
  id: string;
  company_name: string;
  org_type: string;
  email: string;
  phone: string;
  sandbox_mode: boolean;
  digitization: boolean;
  continuous_digitization: boolean;
  generate_certificate: boolean;
  non_visitor_onboarding: boolean;
  nfc_verification: boolean;
  proactive_monitoring: boolean;
  watermark_noise_compress: boolean;
  eligible_for_finance: boolean;
  enabled_transaction_types: string[];
  government_search_org: boolean;
  enable_global_one_to_many_search: boolean;
  allow_non_onboarded_verification: boolean;
  documents_allowed: { type: string; captureMethod: string }[];
  address: string;
  city: string;
  country_name: string;
  primary_contact_name: string;
  primary_contact_email: string;
  additional_information: string;
  created_at: string;
  updated_at: string;
  org_root_users: OrgRootUser[];
  response_template: Record<string, unknown> | null;
}

export async function getOrgDetail(id: string): Promise<OrgDetail> {
  return serveApi.get<OrgDetail>(`/org/${id}`);
}

// ── Org Users ────────────────────────────────────────────────────────

export interface OrgUserRole {
  role_id: string;
  role_name: string;
  role_description: string;
}

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  active: boolean;
  role: OrgUserRole;
}

export interface OrgUsersResponse {
  users: OrgUser[];
}

export async function getOrgUsers(orgId: string): Promise<OrgUsersResponse> {
  return serveApi.get<OrgUsersResponse>(`/org-user/${orgId}`);
}

export interface CreateOrgUserPayload {
  orgId: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export async function createOrgUser(payload: CreateOrgUserPayload): Promise<unknown> {
  return serveApi.post(`/org-user`, payload);
}

// ── Org API Tokens ───────────────────────────────────────────────────

export interface OrgToken {
  id: string;
  name: string;
  created: string;
  modules: string[];
  lastUpdated: string;
  status: string;
  creator: string;
}

export interface OrgTokensResponse {
  tokens: OrgToken[];
  totalCount: number;
}

export async function getOrgTokens(orgId: string): Promise<OrgTokensResponse> {
  return serveApi.get<OrgTokensResponse>(`/tokens/org/${orgId}`);
}

// ── Org Modules (for API key creation) ──────────────────────────────

export interface OrgModule {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface OrgModulesResponse {
  orgId: string;
  modules: OrgModule[];
}

export async function getOrgModules(orgId: string): Promise<OrgModulesResponse> {
  return serveApi.get<OrgModulesResponse>(`/modules/org/${orgId}`);
}

// ── Create API Key ──────────────────────────────────────────────────

export interface CreateApiKeyPayload {
  name: string;
  orgId: string;
  modules: string[];
  rateLimit: number;
  status: string;
}

export async function createApiKey(payload: CreateApiKeyPayload): Promise<unknown> {
  return serveApi.post(`/tokens/create`, payload);
}

export async function revokeApiKey(tokenId: string): Promise<unknown> {
  return serveApi.post(`/tokens/${tokenId}/revoke`, {});
}

// ── Org Balance (credits + usage) ────────────────────────────────────

export interface OrgBalance {
  journeyCount: {
    totalCount: Record<string, number>;
    last7days: Record<string, Record<string, number>>;
    last30days: Record<string, Record<string, number>>;
    last90days: Record<string, Record<string, number>>;
    averageTime: Record<string, number>;
  };
  totalCreditsAlloted: string;
  totalCreditsAvailable: string;
  prices: { price: string; name: string }[];
  creditUsed: Record<string, number>;
}

export async function getOrgBalance(orgId: string): Promise<OrgBalance> {
  return serveApi.get<OrgBalance>(`/org/${orgId}/balance`);
}

// ── Org Credit Top-ups ───────────────────────────────────────────────

export interface OrgCreditTopUp {
  id: string;
  credit_amount: number;
  credit_date: string;
  description: string;
  created_by: string;
  invoice_id: string;
  invoice_details: Record<string, unknown> | null;
}

export interface OrgCreditsResponse {
  credits: OrgCreditTopUp[];
}

export async function getOrgCredits(orgId: string): Promise<OrgCreditsResponse> {
  return serveApi.get<OrgCreditsResponse>(`/org/${orgId}/credits`);
}

export interface AddCreditsPayload {
  credit_amount: number;
  invoice_id: string;
  description?: string;
  invoice_details?: Record<string, unknown>;
  meta_data?: Record<string, unknown>;
}

export async function addOrgCredits(orgId: string, payload: AddCreditsPayload): Promise<OrgCreditTopUp> {
  return serveApi.post<OrgCreditTopUp>(`/org/${orgId}/credits`, payload);
}

// ── Org Types ────────────────────────────────────────────────────────

export interface OrgType {
  id: string;
  name: string;
}

interface OrgTypeApiResponse {
  id: string;
  org_type: string;
}

export const FALLBACK_ORG_TYPES: OrgType[] = [
  { id: "2ac34064-8e7b-4820-8438-214d2e582f8e", name: "Bank" },
  { id: "4bc1ebf1-8a2b-4f9d-8f9b-6fd5d08998f7", name: "Fintech" },
  { id: "e27fcec4-5e7a-4211-ba43-46676c502e6a", name: "Regulator" },
  { id: "placeholder-financial-institute", name: "Financial Institute" },
  { id: "placeholder-insurance", name: "Insurance" },
  { id: "placeholder-others", name: "Others" },
];

export async function getOrgTypes(): Promise<OrgType[]> {
  const raw = await serveApi.get<OrgTypeApiResponse[]>(`/org-types`);
  if (!Array.isArray(raw)) return FALLBACK_ORG_TYPES;
  return raw.map((t) => ({ id: t.id, name: t.org_type }));
}

// ── Countries ────────────────────────────────────────────────────────

export interface Country {
  id: string;
  name: string;
  country_code: string;
}

export const FALLBACK_COUNTRIES: Country[] = [
  { id: "b3b0a3f6-890b-4c78-bb9c-9b6a1b2cbe9e", name: "United Arab Emirates", country_code: "AE" },
  { id: "a4e1f1f2-890b-4f01-a2e6-3a7b9b1b5f71", name: "United States", country_code: "US" },
  { id: "d4b2e0f6-7f8c-4921-8c4a-6c8129a7f124", name: "India", country_code: "IN" },
];

export async function getCountries(): Promise<Country[]> {
  const raw = await serveApi.get<Country[]>(`/country`);
  if (!Array.isArray(raw)) return FALLBACK_COUNTRIES;
  return raw;
}

// ── Modules (transaction types) ──────────────────────────────────────

export interface Module {
  id: string;
  name: string;
  description?: string;
}

export const FALLBACK_MODULES: Module[] = [
  { id: "placeholder-onboarding", name: "onboarding", description: "Onboarding process" },
  { id: "placeholder-rekyc", name: "rekyc", description: "Re-Know Your Customer (reKYC) process" },
  { id: "placeholder-authorise", name: "authorise", description: "Authorisation process" },
  { id: "placeholder-biometric", name: "biometric_verification", description: "Biometric verification process" },
  { id: "placeholder-face-compare", name: "face_compare", description: "Compare two face images for similarity" },
];

export async function getModules(): Promise<Module[]> {
  const raw = await serveApi.get<{ modules: Module[] } | Module[]>(`/modules`);
  const list = Array.isArray(raw) ? raw : raw?.modules;
  if (!Array.isArray(list)) return FALLBACK_MODULES;
  return list;
}

// ── Update Org ──────────────────────────────────────────────────────

export interface UpdateOrgPayload {
  companyName: string;
  orgTypeId: string;
  email: string;
  phone?: string;
  sandboxMode?: boolean;
  digitization?: boolean;
  continuousDigitization?: boolean;
  nonVisitorOnboarding?: boolean;
  nfcVerification?: boolean;
  watermarkNoiseCompress?: boolean;
  proactiveMonitoring?: boolean;
  generateCertificate?: boolean;
  eligibleForFinance?: boolean;
  enableGlobalOneToManySearch?: boolean;
  allowNonOnboardedVerification?: boolean;
  documentsAllowed?: { type: string; captureMethod: string }[];
  enabled_transaction_types?: string[];
  address?: string;
  city?: string;
  countryId?: string;
  primaryContactName: string;
  primaryContactEmail: string;
  additionalInformation?: string;
  responseTemplate?: Record<string, unknown>;
}

export async function updateOrg(orgId: string, payload: UpdateOrgPayload): Promise<{ message: string }> {
  return serveApi.post<{ message: string }>(`/org/${orgId}/update`, payload);
}

// ── Create Org ───────────────────────────────────────────────────────

export interface CreateOrgPayload {
  companyName: string;
  orgTypeId: string;
  email: string;
  phone: string;
  sandboxMode: boolean;
  digitization: boolean;
  continuousDigitization: boolean;
  proactiveMonitoring: boolean;
  nonVisitorOnboarding: boolean;
  nfcVerification: boolean;
  watermarkNoiseCompress: boolean;
  generateCertificate: boolean;
  governmentSearchOrg: boolean;
  enableGlobalOneToManySearch: boolean;
  eligibleForFinance: boolean;
  allowNonOnboardedVerification: boolean;
  documentsAllowed: { type: string; captureMethod: string }[];
  enabled_transaction_types: string[];
  address: string;
  city: string;
  countryId: string;
  primaryContactName: string;
  primaryContactEmail: string;
  additionalInformation: string;
  rootUsername: string;
  rootEmail: string;
  rootUserPhone: string;
  rootPassword: string;
  responseTemplate: Record<string, unknown>;
  roleName: string;
}

export interface CreateOrgResponse {
  orgId: string;
}

export async function createOrg(payload: CreateOrgPayload): Promise<CreateOrgResponse> {
  return serveApi.post<CreateOrgResponse>(`/org`, payload);
}
