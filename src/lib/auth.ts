const token = localStorage.getItem('auth_token')
const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;

export const orgId: string | null = payload?.org_id ?? null;
