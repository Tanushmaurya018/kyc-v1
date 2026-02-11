import { serveApi } from '@/lib/serve-api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

/** Direct login response (2FA disabled) */
export interface LoginDirectResponse {
  token: string;
  refreshToken: string;
  nextStep: 'dashboard';
}

/** 2FA required response */
export interface Login2FAResponse {
  shortLivedToken: string;
  nextStep: 'auth_choice' | 'otp_verification' | 'face_verification';
  availableOptions: ('FACE_AUTH' | 'OTP')[];
  userRegistered: boolean;
}

export type LoginResponse = LoginDirectResponse | Login2FAResponse;

export function login(email: string, password: string, purpose = 'LOGIN'): Promise<LoginResponse> {
  return serveApi.post<LoginResponse>(`/login?purpose=${purpose}`, { email, password });
}

export function updatePassword(newPassword: string): Promise<string> {
  return serveApi.post<string>(`/dashboard/password/update`, { newPassword });
}
