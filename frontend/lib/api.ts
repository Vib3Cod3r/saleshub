const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089/api';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  auth: {
    login: (data: { email: string; password: string }) =>
      api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    register: (data: any) =>
      api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    getProfile: () => api.request('/auth/me'),
  },

  health: () => fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(res => res.json()),
};
