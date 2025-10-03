import { User, UserProfile } from '../../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const userApi = {
  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<User> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch current user');
    return response.json();
  },

  // Lấy profile user
  getUserProfile: async (): Promise<UserProfile> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  // Cập nhật profile
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  // Đăng ký (backend: POST /login/register)
  register: async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/login/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let message = 'Failed to register';
      try {
        const err = await response.json();
        if (err?.message) message = Array.isArray(err.message) ? err.message.join(', ') : err.message;
      } catch {}
      throw new Error(message);
    }
    return response.json();
  },

  // Đăng nhập (backend: POST /login)
  login: async (data: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let message = 'Failed to login';
      try {
        const err = await response.json();
        if (err?.message) message = Array.isArray(err.message) ? err.message.join(', ') : err.message;
      } catch {}
      throw new Error(message);
    }
    return response.json();
  },

  // Đăng xuất (frontend only clears token)
  logout: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  // URL đăng nhập Google
  getGoogleLoginUrl: () => `${API_BASE_URL}/login/google`,
};
