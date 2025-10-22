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
      const email = params.get('email');
      const userId = params.get('id');

      console.log('[LoginSuccess] Params:', { token, name, email, userId });

      if (!token) {
        console.warn('[LoginSuccess] No token found');
        router.replace('/login');
        return;
      }

      localStorage.setItem('token', token);
      if (name) localStorage.setItem('user_name', name);
      if (userId) localStorage.setItem('customerId', userId);
      localStorage.setItem('auth_type', 'user');

      // Tạo user object từ params trước để tránh lỗi API
      if (email && name) {
        const fallbackUser = {
          id: userId || '',
          email,
          full_name: name,
          name: name
        };
        localStorage.setItem('customer', JSON.stringify(fallbackUser));
      }

      // Thử lấy user chi tiết từ API (không bắt buộc)
      try {
        if (userId) {
          // Nếu có userId từ Google login, sử dụng trực tiếp
          const customer = await userApi.getCustomerDetailById(userId);
          localStorage.setItem('customer', JSON.stringify(customer));
        } else {
          // Fallback: lấy từ email
          const customer = await userApi.getCurrentUser();
          if (customer?.id) localStorage.setItem('customerId', String(customer.id));
          localStorage.setItem('customer', JSON.stringify(customer));
        }
      } catch (err) {
        console.warn('Get current customer failed, using fallback data:', err);
        // Đã có fallback data ở trên rồi, không cần làm gì thêm
      }

      // Ensure context picks up latest token/user and header updates
      try {
        await refreshUser();
      } catch (refreshErr) {
        console.warn('Refresh user failed:', refreshErr);
      }

      console.log('[LoginSuccess] Login success, redirecting...');

      // Thêm delay nhỏ để đảm bảo localStorage đã được set
      setTimeout(() => {
        try {
          router.replace('/');
        } catch (routerErr) {
          console.error('Router redirect failed:', routerErr);
          // Fallback: dùng window.location
          window.location.href = '/';
        }
      }, 100);
    };

    run();
  }, [router, refreshUser]);

  return (
    <div className="flex justify-center items-center min-h-screen text-lg text-gray-700">
      Đang đăng nhập... vui lòng chờ trong giây lát.
    </div>
  );
}
