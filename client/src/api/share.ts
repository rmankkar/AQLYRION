import type { ShareResponse, ShareSnapshot } from '../types/share.js';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? `HTTP error ${response.status}`);
  }

  return response.json();
}

export const shareApi = {
  async createShare(tab: string, data: Record<string, unknown>, title?: string): Promise<ShareResponse> {
    return fetchJson<ShareResponse>(`${API_BASE}/shares`, {
      method: 'POST',
      body: JSON.stringify({ tab, data, title }),
    });
  },

  async getShare(shareId: string): Promise<ShareSnapshot> {
    return fetchJson<ShareSnapshot>(`${API_BASE}/shares/${shareId}`);
  },
};
