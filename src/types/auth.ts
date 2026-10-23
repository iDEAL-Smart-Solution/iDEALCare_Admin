// src/types/auth.ts

export interface PlatformUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PlatformLoginRequest {
  email: string;
  password: string;
}

export interface PlatformLoginResponse {
  accessToken: string;
  expiresAt: string;
  user: PlatformUser;
}

export interface AuthState {
  user: PlatformUser | null;
  accessToken: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
