import { User, UserProfile } from '../../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const userApi = {
  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<User> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch current user');
    return response.json();
  },

  // Lấy profile user
  getUserProfile: async (): Promise<UserProfile> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  // Cập nhật profile
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  // Đăng ký
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to register');
    return response.json();
  },

  // Đăng nhập
  login: async (data: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to login');
    return response.json();
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/users/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    localStorage.removeItem('token');
  }
};
