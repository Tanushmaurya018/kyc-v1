import { api } from "@/lib/api-client";

// ── Types matching the backend API response (snake_case) ──────────────

export interface SessionListItem {
  id: string;
  token: string;
  state: string;
  org_id: string;
  org_name: string | null;
  signer_name: string | null;
  signer_id_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface SessionListResponse {
  sessions: SessionListItem[];
  pagination: Pagination;
}

export interface SessionEvent {
  id: string;
  event_type: string;
  from_state: string | null;
  to_state: string | null;
  duration_ms: number | null;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

export interface SessionDetail extends SessionListItem {
  org_id: string;
  original_doc_path: string | null;
  signed_doc_path: string | null;
  document_hash: string | null;
  page_count: number | null;
  positions: Record<string, Array<{ x: number; y: number; width: number; height: number }>> | null;
  positions_are_preset: boolean;
  emirates_id_number: string | null;
  passport_number: string | null;
  passport_nationality: string | null;
  passport_type: string | null;
  gcc_id_number: string | null;
  gcc_nationality: string | null;
  gcc_type: string | null;
  person_number: string | null;
  kyc_journey_id: string | null;
  uae_kyc_id: string | null;
  sandbox_mode: boolean;
  error_code: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  expires_at: string;
  events: SessionEvent[];
}

// ── Document fetcher (authenticated) ──────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/dashboard";

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token") || import.meta.env.VITE_AUTH_TOKEN || null;
}

export async function fetchDocumentBlob(
  sessionId: string,
  type: "original" | "signed"
): Promise<string> {
  const url = `${API_BASE}/sessions/${sessionId}/document/${type}`;
  const token = getAuthToken();
  const res = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch document (${res.status})`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ── Query params ──────────────────────────────────────────────────────

export interface SessionListParams {
  page?: number;
  page_size?: number;
  sort_by?: "created_at" | "updated_at" | "state" | "org_name";
  sort_order?: "asc" | "desc";
  search?: string;
  status?: string[];
  org_id?: string;
}

// ── API calls ─────────────────────────────────────────────────────────

export async function getSessions(
  params: SessionListParams = {}
): Promise<SessionListResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.sort_order) query.set("sort_order", params.sort_order);
  if (params.search) query.set("search", params.search);
  if (params.status?.length) query.set("status", params.status.join(","));
  if (params.org_id) query.set("org_id", params.org_id);

  const qs = query.toString();
  return api.get<SessionListResponse>(
    `/sessions${qs ? `?${qs}` : ""}`
  );
}

export async function getSession(id: string): Promise<SessionDetail> {
  return api.get<SessionDetail>(`/sessions/${id}`);
}

// ── Console Dashboard ────────────────────────────────────────────────

export interface RecentSession {
  id: string;
  state: string;
  org_id: string;
  org_name: string | null;
  created_at: string;
  document_name: string | null;
}

export interface ConsoleStats {
  total_sessions: number;
  total_sessions_change: number;
  signed_sessions: number;
  signed_sessions_change: number;
  failed_sessions: number;
  failed_sessions_change: number;
  expired_sessions: number;
  active_sessions: number;
  completion_rate: number;
  completion_rate_change: number;
  kyc_pass_rate: number;
  avg_time_to_sign: number;
}

export interface DailyStatsItem {
  date: string;
  created: number;
  signed: number;
  rejected: number;
  abandoned: number;
  expired: number;
}

export interface FunnelStepItem {
  name: string;
  count: number;
  percentage: number;
  drop_off: number;
}

export interface ConsoleDashboardResponse {
  recent_sessions?: RecentSession[];
  stats: ConsoleStats;
  daily_stats?: DailyStatsItem[];
  drop_off?: {
    steps: FunnelStepItem[];
    total_started: number;
    total_completed: number;
    overall_completion_rate: number;
  };
}

export interface AnalyticsParams {
  org_id?: string;
  days?: number;
}

export async function getConsoleDashboard(
  params: AnalyticsParams = {}
): Promise<ConsoleDashboardResponse> {
  const query = new URLSearchParams();
  if (params.org_id) query.set("org_id", params.org_id);
  if (params.days) query.set("days", String(params.days));
  const qs = query.toString();
  return api.get<ConsoleDashboardResponse>(
    `/console-analytics${qs ? `?${qs}` : ""}`
  );
}

// ── Client Dashboard ─────────────────────────────────────────────────

export interface ClientRecentSession {
  id: string;
  state: string;
  created_at: string;
  document_name: string | null;
  signer_name: string | null;
}

export interface ClientStats {
  total_sessions: number;
  signed_sessions: number;
  rejected_sessions: number;
  abandoned_sessions: number;
  expired_sessions: number;
  created_sessions: number;
  total_change: number;
  signed_change: number;
  rejected_change: number;
  completion_rate: number;
  kyc_pass_rate: number;
  avg_time_to_sign: number;
}

export interface ClientDashboardResponse {
  recent_sessions: ClientRecentSession[];
  stats: ClientStats;
  daily_stats?: DailyStatsItem[];
  drop_off?: {
    steps: FunnelStepItem[];
    total_started: number;
    total_completed: number;
    overall_completion_rate: number;
  };
}

export async function getClientDashboard(
  params: AnalyticsParams = {}
): Promise<ClientDashboardResponse> {
  const query = new URLSearchParams();
  if (params.org_id) query.set("org_id", params.org_id);
  if (params.days) query.set("days", String(params.days));
  const qs = query.toString();
  return api.get<ClientDashboardResponse>(
    `/client-analytics${qs ? `?${qs}` : ""}`
  );
}

