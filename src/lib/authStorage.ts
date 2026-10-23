// src/lib/authStorage.ts
import type { PlatformUser } from '../types/auth';

const TOKEN_KEY = 'idealcare_admin_token';
const EXPIRES_KEY = 'idealcare_admin_expires';
const USER_KEY = 'idealcare_admin_user';

// Clean up legacy localStorage keys once so older global tokens do not leak across tabs
try {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  localStorage.removeItem(USER_KEY);
} catch {
  // Ignore in environments where localStorage is unavailable
}

export const authStorage = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getExpiresAt(): string | null {
    try {
      return sessionStorage.getItem(EXPIRES_KEY);
    } catch {
      return null;
    }
  },

  getUser(): PlatformUser | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(token: string, expiresAt: string, user: PlatformUser): void {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(EXPIRES_KEY, expiresAt);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
      console.error('Failed to save platform auth session to sessionStorage', err);
    }
  },

  clearSession(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(EXPIRES_KEY);
      sessionStorage.removeItem(USER_KEY);

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EXPIRES_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error('Failed to clear platform auth session', err);
    }
  },

  isTokenValid(): boolean {
    const token = this.getToken();
    const expiresAt = this.getExpiresAt();
    if (!token || !expiresAt) return false;

    const expiryTime = new Date(expiresAt).getTime();
    return !isNaN(expiryTime) && expiryTime > Date.now();
  },
};

