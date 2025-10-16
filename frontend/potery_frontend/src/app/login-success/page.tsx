'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../api/modules/users';

export default function LoginSuccessPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const name = params.get('name');
      const email = params.get('email');

      console.log('[LoginSuccess] Params:', { token, name, email });

      if (!token) {
        console.warn('[LoginSuccess] No token found');
        router.replace('/login');
        return;
      }

      localStorage.setItem('token', token);
      if (name) localStorage.setItem('user_name', name);

      if (email) {
        try {
          const c = await userApi.getCustomerByEmail(email);
          if (c?.id) localStorage.setItem('customerId', String(c.id));
          localStorage.setItem(
            'user',
            JSON.stringify({ id: c?.id, email: c?.email, name })
          );
        } catch (err) {
          console.warn('Get customer by email failed:', err);
        }
      }

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
