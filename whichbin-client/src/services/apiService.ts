import { API_URL } from "../api/config";

export interface ApiInfo {
  version: string;
}

export async function getApiInfo(): Promise<ApiInfo | null> {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      return null;
    }

    return await response.json() as ApiInfo;
  } catch {
    return null;
  }
}
