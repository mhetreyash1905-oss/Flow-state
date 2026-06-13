/**
 * Frontend API client helper for calling Next.js API Routes.
 */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || response.statusText || 'An error occurred';
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }

  return data as T;
}

export const api = {
  auth: {
    register: (payload: any) =>
      request<any>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    me: () => request<any>('/api/auth/me'),
  },

  dashboard: {
    get: () => request<any>('/api/dashboard'),
  },

  habits: {
    list: (includeArchived = false) =>
      request<{ habits: any[] }>(`/api/habits?includeArchived=${includeArchived}`),
    create: (payload: any) =>
      request<any>('/api/habits', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    get: (id: string) => request<{ habit: any }>(`/api/habits/${id}`),
    update: (id: string, payload: any) =>
      request<{ habit: any }>(`/api/habits/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<any>(`/api/habits/${id}`, {
        method: 'DELETE',
      }),
    complete: (id: string, note?: string, completedAt?: string) =>
      request<any>(`/api/habits/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ note, completedAt }),
      }),
    logs: (id: string, page = 1, limit = 20) =>
      request<any>(`/api/habits/${id}/logs?page=${page}&limit=${limit}`),
    templates: (category?: string) =>
      request<{ templates: any[] }>(
        `/api/habits/templates${category ? `?category=${category}` : ''}`
      ),
    createFromTemplate: (templateId: string) =>
      request<any>('/api/habits/templates', {
        method: 'POST',
        body: JSON.stringify({ templateId }),
      }),
  },

  focus: {
    list: (page = 1, limit = 20, status?: string) =>
      request<any>(
        `/api/focus?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`
      ),
    start: (payload: any) =>
      request<{ session: any }>('/api/focus', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: any) =>
      request<{ session: any }>(`/api/focus/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    stats: () => request<{ stats: any }>('/api/focus/stats'),
  },

  gamification: {
    profile: () => request<{ profile: any }>('/api/gamification/profile'),
    achievements: () => request<{ achievements: any[] }>('/api/gamification/achievements'),
    xpHistory: (page = 1, limit = 20) =>
      request<any>(`/api/gamification/xp-history?page=${page}&limit=${limit}`),
  },

  analytics: {
    overview: () => request<any>('/api/analytics/overview'),
    habits: (days = 30) => request<any>(`/api/analytics/habits?days=${days}`),
    focus: (days = 30) => request<any>(`/api/analytics/focus?days=${days}`),
  },

  journal: {
    list: (page = 1, limit = 20) =>
      request<any>(`/api/journal?page=${page}&limit=${limit}`),
    create: (payload: any) =>
      request<{ entry: any }>('/api/journal', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: any) =>
      request<{ entry: any }>(`/api/journal/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<any>(`/api/journal/${id}`, {
        method: 'DELETE',
      }),
  },

  profile: {
    getPublic: (username: string) =>
      request<any>(`/api/profile/${username}`),
  },
};
