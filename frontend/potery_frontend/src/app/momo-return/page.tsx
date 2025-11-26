'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MoMoReturnPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const handleMomoReturn = async () => {
            // Kiểm tra tham số MoMo trả về
            const resultCode = searchParams.get('resultCode');
            const orderId = searchParams.get('orderId');
            const orderInfo = searchParams.get('orderInfo');
            const amount = searchParams.get('amount');
            const requestId = searchParams.get('requestId');

            // Trích xuất order ID từ orderInfo nếu có
            let extractedOrderId = orderId;
            if (!extractedOrderId && orderInfo) {
                const match = orderInfo.match(/#(\d+)/);
                if (match) {
                    extractedOrderId = match[1];
                }
            }

            console.log('🔍 MoMo return params:', {
                resultCode,
                orderId,
                orderInfo,
                extractedOrderId,
                amount,
                requestId
            });

            if (resultCode === '0') {
                // Thanh toán thành công - Manual save transaction
                if (extractedOrderId && amount && requestId) {
                    try {
                        console.log('💾 Manually saving transaction...');

                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/paymenttransaction/momo/test-manual-callback`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                partnerCode: 'MOMO',
                                requestId: requestId,
                                orderId: orderId,
                                orderInfo: orderInfo || `Thanh toan don hang #${extractedOrderId}`,
                                amount: parseInt(amount),
                                resultCode: 0,
                                message: `Thanh toan don hang #${extractedOrderId}`,
                                payType: 'qr',
                                responseTime: Date.now(),
                                extraData: '',
                                signature: 'manual-save'
                            })
                        });

                        const result = await response.json();
                        console.log('💾 Manual save result:', result);

                        if (result.success) {
                            console.log('✅ Transaction saved manually');
                        } else {
                            console.error('❌ Failed to save transaction manually:', result);
                        }
                    } catch (error) {
                        console.error('❌ Error saving transaction manually:', error);
                    }
                }

                // thanh toán thành công
                const orderIdParam = extractedOrderId ? `&order_id=${extractedOrderId}` : '';
                console.log('✅ MoMo payment success, redirecting to orders page');
                router.replace(`/orders?payment=success${orderIdParam}`);
            } else {
                // thất bại
                console.log('❌ MoMo payment failed, redirecting to orders page');
                router.replace('/orders?payment=failed');
            }
        };

        handleMomoReturn();
    }, [searchParams, router]); return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A38D64] mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-700 mb-2">Đang xử lý kết quả thanh toán MoMo...</h1>
                <p className="text-gray-500">Vui lòng đợi giây lát...</p>
            </div>
        </div>
    );
}