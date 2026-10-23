// src/api/platformAuthApi.ts
import apiClient from '../lib/apiClient';
import type { PlatformLoginRequest, PlatformLoginResponse, PlatformUser } from '../types/auth';

export const platformAuthApi = {
  async login(credentials: PlatformLoginRequest): Promise<PlatformLoginResponse> {
    const response = await apiClient.post<PlatformLoginResponse>(
      '/api/platform/auth/login',
      credentials
    );
    return response.data;
  },

  async getProfile(): Promise<PlatformUser> {
    const response = await apiClient.get<PlatformUser>('/api/platform/auth/me');
    return response.data;
  },
};
