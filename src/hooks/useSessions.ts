import { useState, useEffect, useCallback } from "react";
import {
  getSessions,
  getSession,
  getConsoleDashboard,
  getClientDashboard,
  type SessionListItem,
  type SessionDetail,
  type SessionListParams,
  type AnalyticsParams,
  type Pagination,
  type ConsoleDashboardResponse,
  type ClientDashboardResponse,
} from "@/services/sessions-api";

// ── List hook (with server-side pagination / sort / search / filter) ──

export function useSessions(params: SessionListParams = {}) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serialize params so useEffect can compare them
  const paramsKey = JSON.stringify(params);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSessions(params);
      setSessions(res.sessions);
      setPagination(res.pagination);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, pagination, isLoading, error, refetch: fetchSessions };
}

// ── Detail hook ───────────────────────────────────────────────────────

export function useSessionDetail(id: string | undefined) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSession() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSession(id!);
        if (!cancelled) setSession(data);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSession();
    return () => { cancelled = true; };
  }, [id]);

  return { session, isLoading, error };
}

// ── Console Dashboard hook ───────────────────────────────────────────

export function useConsoleDashboard(params: AnalyticsParams = {}) {
  const [data, setData] = useState<ConsoleDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getConsoleDashboard(params);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, isLoading, error };
}

// ── Client Dashboard hook ────────────────────────────────────────────

export function useClientDashboard(params: AnalyticsParams = {}) {
  const [data, setData] = useState<ClientDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getClientDashboard(params);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, isLoading, error };
}
