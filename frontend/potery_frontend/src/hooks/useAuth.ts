'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '../api/modules/users';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

const clearGuestData = () => {
  localStorage.removeItem('guest_id');
  localStorage.removeItem('guest_name');
  localStorage.removeItem('guest_phone');
  localStorage.removeItem('guest_email');
  localStorage.removeItem('auth_type');
  Cookies.remove('guest_id');
  Cookies.remove('cart_session');
};

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
      // ✅ Kiểm tra cache trước, chỉ fetch từ API khi cần
      const cached = localStorage.getItem('customer');
      if (cached) {
        setUser(JSON.parse(cached));
      } else {
        const userData = await userApi.getCurrentUser();
        if (userData) {
          setUser(userData);
          localStorage.setItem('customer', JSON.stringify(userData));
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.error('checkAuth error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('customer');
      localStorage.removeItem('customerId');
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
      clearGuestData();
      const response = await userApi.login(email, password);
      const { token } = response;
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('auth_type', 'user');

      // ✅ Luôn fetch thông tin mới nhất sau khi login
      try {
        const fullCustomer = await userApi.getCurrentUser();
        setUser(fullCustomer);
        localStorage.setItem('customer', JSON.stringify(fullCustomer));
      } catch (e) {
        // Fallback: dùng thông tin từ response nếu không lấy được chi tiết
        setUser(response.user);
        localStorage.setItem('customer', JSON.stringify(response.user));
      }

      router.push('/');
    } catch (err) {
      toast.error('Đăng nhập thất bại, vui lòng thử lại');
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
    try {
      clearGuestData();
      const payload = {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
      };
      const response = await userApi.register(payload);
      localStorage.setItem('auth_type', 'user');
      let fullCustomer = null;
      try {
        const customerId = localStorage.getItem('customerId');
        if (customerId) {
          const detailRes = await userApi.getCurrentUser();
          fullCustomer = detailRes;
          localStorage.setItem('customer', JSON.stringify(fullCustomer));
        }
      } catch (e) {
        fullCustomer = response.user;
        localStorage.setItem('customer', JSON.stringify(fullCustomer));
      }
      setUser(fullCustomer);
      router.push('/');
    } catch (err: any) {
      toast.error(err?.message || 'Đăng ký thất bại');
      throw err;
    }
  };

  const loginWithGoogle = () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    let redirectUrl = window.location.origin;

    // Fix tạm thời nếu backend thêm "/" sai
    if (redirectUrl.endsWith('/')) {
      redirectUrl = redirectUrl.slice(0, -1);
    }

    window.location.href = `${API_BASE_URL}/login/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await userApi.logout();
      setUser(null);
      localStorage.removeItem('customer');
      localStorage.removeItem('token');
      localStorage.removeItem('customerId');
      clearGuestData();
      router.push('/');
    } catch (err: any) {
      toast.error(err?.message || 'Đăng xuất thất bại');
      throw err;
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser,
  };
};