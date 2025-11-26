'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MoMoCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra tham số MoMo trả về
    const resultCode = searchParams.get('resultCode');
    const orderId = searchParams.get('orderId');

    if (resultCode === '0') {
      // thanh toán thành công
      const orderIdParam = orderId ? `&order_id=${orderId}` : '';
      router.replace(`/orders?payment=success${orderIdParam}`);
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
