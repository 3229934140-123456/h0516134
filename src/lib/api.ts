import type {
  User, ThanksCard, Recognition, MonthlyStar, Notification,
  SendThanksCardRequest, CreateRecognitionRequest, HRStatsResponse, ThanksType, Department,
} from '@shared/types';

const API_BASE = '/api';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const userId = localStorage.getItem('currentUserId');
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  return headers;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || '请求失败');
  }
  return data as T;
}

export const api = {
  users: {
    list: (params?: { department?: Department; role?: string }) => {
      const q = new URLSearchParams();
      if (params?.department) q.set('department', params.department);
      if (params?.role) q.set('role', params.role);
      const query = q.toString();
      return request<User[]>(`/users${query ? `?${query}` : ''}`);
    },
    me: () => request<User>('/users/me'),
    get: (id: string) => request<User>(`/users/${id}`),
  },
  thanksCards: {
    list: (params?: { senderId?: string; receiverId?: string; type?: ThanksType }) => {
      const q = new URLSearchParams();
      if (params?.senderId) q.set('senderId', params.senderId);
      if (params?.receiverId) q.set('receiverId', params.receiverId);
      if (params?.type) q.set('type', params.type);
      const query = q.toString();
      return request<ThanksCard[]>(`/thanks-cards${query ? `?${query}` : ''}`);
    },
    create: (body: SendThanksCardRequest) =>
      request<ThanksCard>('/thanks-cards', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    get: (id: string) => request<ThanksCard>(`/thanks-cards/${id}`),
  },
  recognitions: {
    list: (receiverId?: string) => {
      const query = receiverId ? `?receiverId=${receiverId}` : '';
      return request<Recognition[]>(`/recognitions${query}`);
    },
    create: (body: CreateRecognitionRequest) =>
      request<Recognition>('/recognitions', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  monthlyStars: {
    list: () => request<MonthlyStar[]>('/monthly-stars'),
    calculate: () =>
      request<{ message: string; data: MonthlyStar[] }>('/monthly-stars/calculate', { method: 'POST' }),
  },
  notifications: {
    list: () => request<Notification[]>('/notifications'),
    unreadCount: () => request<{ count: number }>('/notifications/unread-count'),
    read: (id: string) =>
      request<{ message: string }>(`/notifications/${id}/read`, { method: 'POST' }),
    readAll: () =>
      request<{ message: string; count: number }>('/notifications/read-all', { method: 'POST' }),
  },
  hr: {
    stats: () => request<HRStatsResponse>('/hr/stats'),
    quietContributors: () => request<User[]>('/hr/quiet-contributors'),
  },
};
