'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '../api/modules/users';
import { User } from '../types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const cached = localStorage.getItem('user');
      if (cached) {
        setUser(JSON.parse(cached));
      } else {
        const userData = await userApi.getCurrentUser();
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.warn('[Auth] Invalid or expired token:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
  try {
    const response = await userApi.login(email, password);

    // ✅ Sau khi login thành công → lấy user đầy đủ
    const fullUser = await userApi.getCurrentUser();

    // ✅ Lưu localStorage để các component khác (như Header) nhận được ngay
    localStorage.setItem('user', JSON.stringify(fullUser));

    setUser(fullUser);
    router.push('/');
  } catch (err) {
    console.error('Login failed:', err);
    throw err;
  }
};

const register = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) => {
  const payload = {
    email: data.email,
    password: data.password,
    name: `${data.firstName} ${data.lastName}`.trim(),
    phone: data.phone,
  };

  const response = await userApi.register(payload);

  // ✅ Sau khi đăng ký → gọi lại API lấy dữ liệu chi tiết
  const fullUser = await userApi.getCurrentUser();

  localStorage.setItem('user', JSON.stringify(fullUser));

  setUser(fullUser);
  router.push('/');
};


  const logout = async () => {
    await userApi.logout();
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };
};
