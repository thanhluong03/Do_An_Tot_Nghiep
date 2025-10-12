'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CatchAllPage() {
  const router = useRouter();

  useEffect(() => {
    const currentUrl = window.location.href;

    // Nếu URL chứa "//login-success" thì fix lại
    if (currentUrl.includes('//login-success')) {
      const fixedUrl = currentUrl.replace('//login-success', '/login-success');
      window.location.replace(fixedUrl);
      return;
    }

    // Nếu không phải lỗi login-success => redirect về trang chủ
    router.replace('/');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen text-lg text-gray-700">
      Đang xử lý chuyển hướng...
    </div>
  );
}
