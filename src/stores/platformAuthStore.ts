// src/stores/platformAuthStore.ts
import { create } from 'zustand';
import { authStorage } from '../lib/authStorage';
import { platformAuthApi } from '../api/platformAuthApi';
import type { PlatformLoginRequest, PlatformUser } from '../types/auth';

interface PlatformAuthState {
  user: PlatformUser | null;
  accessToken: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => void;
  login: (credentials: PlatformLoginRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const getInitialSession = () => {
  if (typeof window !== 'undefined' && authStorage.isTokenValid()) {
    return {
      user: authStorage.getUser(),
      accessToken: authStorage.getToken(),
      expiresAt: authStorage.getExpiresAt(),
      isAuthenticated: true,
      isInitialized: true,
    };
  }
  return {
    user: null,
    accessToken: null,
    expiresAt: null,
    isAuthenticated: false,
    isInitialized: true,
  };
};

const initialSession = getInitialSession();

export const usePlatformAuthStore = create<PlatformAuthState>((set) => ({
  user: initialSession.user,
  accessToken: initialSession.accessToken,
  expiresAt: initialSession.expiresAt,
  isAuthenticated: initialSession.isAuthenticated,
  isLoading: false,
  isInitialized: initialSession.isInitialized,
  error: null,

  initialize: () => {
    if (authStorage.isTokenValid()) {
      const user = authStorage.getUser();
      const token = authStorage.getToken();
      const expiresAt = authStorage.getExpiresAt();

      set({
        user,
        accessToken: token,
        expiresAt,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } else {
      authStorage.clearSession();
      set({
        user: null,
        accessToken: null,
        expiresAt: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  login: async (credentials: PlatformLoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const result = await platformAuthApi.login(credentials);
      authStorage.setSession(result.accessToken, result.expiresAt, result.user);

      set({
        user: result.user,
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const message =
        errorObj.response?.data?.message ||
        errorObj.response?.data?.error ||
        errorObj.message ||
        'Authentication failed. Please verify your administrator credentials.';

      set({
        isLoading: false,
        error: message,
        isAuthenticated: false,
        isInitialized: true,
      });
      return false;
    }
  },

  logout: () => {
    authStorage.clearSession();
    set({
      user: null,
      accessToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isInitialized: true,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
