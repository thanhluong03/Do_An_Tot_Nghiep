'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api/modules/users';

export default function LoginSuccessPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Xóa sạch thông tin guest khi login thành công qua Google
  const clearGuestData = () => {
    try {
      localStorage.removeItem('guest_id');
      localStorage.removeItem('guest_name');
      localStorage.removeItem('guest_phone');
      localStorage.removeItem('guest_email');
      localStorage.removeItem('auth_type');
      // Cookie nếu có
      if (typeof window !== 'undefined') {
        document.cookie = 'guest_id=; Max-Age=0; path=/;';
        document.cookie = 'cart_session=; Max-Age=0; path=/;';
      }
    } catch { }
  };

  useEffect(() => {
    const run = async () => {
      clearGuestData();
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const name = params.get('name');
      // const email = params.get('email');

      console.log('[LoginSuccess] Params:', { token, name });

      if (!token) {
        console.warn('[LoginSuccess] No token found');
        router.replace('/login');
        return;
      }

      localStorage.setItem('token', token);
      if (name) localStorage.setItem('user_name', name);
      localStorage.setItem('auth_type', 'user');

      // Lấy user thực sự từ token mới nhất
      try {
        const customer = await userApi.getCurrentUser();
        if (customer?.id) localStorage.setItem('customerId', String(customer.id));
        localStorage.setItem('customer', JSON.stringify(customer));
      } catch (err) {
        console.warn('Get current customer failed:', err);
      }

      // Ensure context picks up latest token/user and header updates
      try {
        await refreshUser();
      } catch { }

      console.log('[LoginSuccess] Login success, redirecting...');
      router.replace('/');
    };

    run();
  }, [router, refreshUser]);

  return (
    <div className="flex justify-center items-center min-h-screen text-lg text-gray-700">
      Đang đăng nhập... vui lòng chờ trong giây lát.
    </div>
  );
}
