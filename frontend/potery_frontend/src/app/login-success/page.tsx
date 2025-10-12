'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('[LoginSuccess] Mounted'); // Debug xem có chạy không

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name = params.get('name');
    console.log('[LoginSuccess] Params:', { token, name });

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user_name', name || '');
      console.log('[LoginSuccess] Token saved, redirecting...');
      router.replace('/');
    } else {
      console.warn('[LoginSuccess] No token found');
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen text-lg text-gray-700">
      Đang đăng nhập... vui lòng chờ trong giây lát.
    </div>
  );
}
