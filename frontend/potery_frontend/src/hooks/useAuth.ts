'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '../api/modules/users';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie'; // ✅ Đảm bảo bạn đã import thư viện cookie

// 🔥 TẠO MỘT HÀM DỌN DẸP DÙNG CHUNG
const clearGuestData = () => {
  console.log('🧹 Dọn dẹp dữ liệu guest TRƯỚC KHI login/register...');
  
  // Dọn dẹp Local Storage
  localStorage.removeItem('guest_id');
  localStorage.removeItem('guest_name');
  localStorage.removeItem('guest_phone');
  localStorage.removeItem('guest_email');
  localStorage.removeItem('auth_type');
  
  // ✅ Dọn dẹp CẢ COOKIE (Rất quan trọng)
  // (Nếu backend đọc cookie, đây là bước bắt buộc)
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
      // 🔥 BƯỚC 1: DỌN DẸP SẠCH SẼ TRƯỚC KHI GỌI API
      clearGuestData();

      // 🔥 BƯỚC 2: GỌI API LOGIN SAU KHI ĐÃ SẠCH
      const response = await userApi.login(email, password);
      const { token } = response;

      if (token) localStorage.setItem('token', token);

      // 🧩 Ghi rõ loại đăng nhập là user thật
      localStorage.setItem('auth_type', 'user');

      // ✅ Lấy thông tin user thật (lúc này đã an toàn)
      const fullUser = await userApi.getCurrentUser();
      
      // Bạn nên lưu cả customerId thật ở đây nếu có
      // Ví dụ: localStorage.setItem('customerId', fullUser.customerId);
      
      localStorage.setItem('user', JSON.stringify(fullUser));
      setUser(fullUser);

      router.push('/');
    } catch (err) {
      console.error('Login failed:', err);
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
      // 🔥 BƯỚC 1: DỌN DẸP SẠCH SẼ TRƯỚC KHI GỌI API
      clearGuestData();
      
      const payload = {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
      };

      // 🔥 BƯỚC 2: GỌI API REGISTER SAU KHI ĐÃ SẠCH
      const response = await userApi.register(payload);

      // 🧩 Ghi rõ loại đăng nhập là user thật
      localStorage.setItem('auth_type', 'user');
      
      // Giả sử API register tự động login hoặc trả về token
      // Nếu không, bạn cần gọi login ở đây
      // const loginResponse = await userApi.login(data.email, data.password);
      // if (loginResponse.token) localStorage.setItem('token', loginResponse.token);

      // ✅ Sau khi đăng ký → gọi lại API lấy dữ liệu chi tiết
      const fullUser = await userApi.getCurrentUser();

      localStorage.setItem('user', JSON.stringify(fullUser));

      setUser(fullUser);
      router.push('/');
      
    } catch (err: any) {
        console.error('Register failed:', err);
        toast.error(err?.message || 'Đăng ký thất bại');
        throw err;
    }
  };

  const logout = async () => {
    try {
      await userApi.logout();
    } catch (e) {
      console.warn('Logout API failed, logging out locally:', e);
    }
    
    // 🔥 DỌN DẸP TOÀN BỘ KHI LOGOUT
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('customerId'); // Xóa cả customerId của user thật
    clearGuestData(); // Xóa luôn data guest để đảm bảo sạch sẽ
    
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