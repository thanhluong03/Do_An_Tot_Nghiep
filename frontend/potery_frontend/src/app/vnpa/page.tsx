'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VnPayCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // bạn có thể kiểm tra tham số VNPay trả về
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');

    if (vnp_ResponseCode === '00') {
      // thanh toán thành công
      router.replace('/orders?payment=success');
    } else {
      // thất bại
      router.replace('/orders?payment=failed');
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-gray-700">Đang xử lý kết quả thanh toán...</h1>
      <p className="text-gray-500 mt-3">Vui lòng đợi giây lát...</p>
    </div>
  );
}
