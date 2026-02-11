export interface TokenPayload {
  sub: string;
  org_id: string;
  email: string;
  name: string;
  role: string;
  privilegeLevel: number;
  iss: string;
  exp: number;
  iat: number;
}

function parseToken(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function setTokens(token: string, refreshToken: string): void {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('refresh_token', refreshToken);
}

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function clearTokens(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getTokenPayload(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;
  return parseToken(token);
}

export function getPrivilegeLevel(): number {
  return getTokenPayload()?.privilegeLevel ?? 0;
}

export function getUser(): { name: string; email: string; role: string } | null {
  const payload = getTokenPayload();
  if (!payload) return null;
  return { name: payload.name, email: payload.email, role: payload.role };
}

export const orgId: string | null = getTokenPayload()?.org_id ?? null;
