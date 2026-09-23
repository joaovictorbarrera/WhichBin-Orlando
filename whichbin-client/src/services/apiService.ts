import { apiFetch } from './apiClient';

export interface ApiInfo {
  version: string;
}

export async function getApiInfo(): Promise<ApiInfo | null> {
  try {
    const response = await apiFetch('');

    if (!response.ok) {
      return null;
    }

    return await response.json() as ApiInfo;
  } catch {
    return null;
  }
}
