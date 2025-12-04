'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { orderApi } from '@/api/modules/orders';
import { useAuth } from '@/contexts/AuthContext';

export default function MoMoReturnPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();

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

                // 🔥 QUAN TRỌNG: Rollback các order COD nếu backend đã cập nhật nhầm
                // Thực hiện rollback TRƯỚC KHI redirect với retry
                if (user?.id && extractedOrderId) {
                    // Hàm rollback với retry
                    const rollbackCODOrders = async (retryCount = 0) => {
                        try {
                            // Đợi một chút để backend callback hoàn tất (tăng delay)
                            await new Promise(resolve => setTimeout(resolve, 5000 + retryCount * 2000));
                            console.log(`🔄 Bắt đầu rollback các đơn COD trong momo-return page (lần thử ${retryCount + 1})...`);
                        const allCustomerOrders = await orderApi.getOrdersByCustomer(user.id as string, 1, 100);
                        console.log('🔍 Raw response từ getOrdersByCustomer:', allCustomerOrders);
                        
                        // Xử lý nhiều cấu trúc response có thể có
                        let ordersList: any[] = [];
                        if (Array.isArray(allCustomerOrders)) {
                            ordersList = allCustomerOrders;
                        } else if (allCustomerOrders?.data) {
                            if (Array.isArray(allCustomerOrders.data)) {
                                ordersList = allCustomerOrders.data;
                            } else if (allCustomerOrders.data?.orders && Array.isArray(allCustomerOrders.data.orders)) {
                                ordersList = allCustomerOrders.data.orders;
                            } else if (allCustomerOrders.data?.data && Array.isArray(allCustomerOrders.data.data)) {
                                ordersList = allCustomerOrders.data.data;
                            }
                        } else if (allCustomerOrders?.orders && Array.isArray(allCustomerOrders.orders)) {
                            ordersList = allCustomerOrders.orders;
                        }
                        
                        console.log('🔍 Tổng số orders của customer:', ordersList.length);
                        console.log('🔍 Orders list:', ordersList);
                        
                        // Lấy danh sách order IDs MOMO từ sessionStorage
                        let momoOrderIds: number[] = [Number(extractedOrderId)];
                        const momoOrderIdsStr = sessionStorage.getItem('momo_order_ids');
                        if (momoOrderIdsStr) {
                            try {
                                const parsed = JSON.parse(momoOrderIdsStr);
                                momoOrderIds = Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
                            } catch {
                                // Ignore parse error
                            }
                        }
                        
                        console.log('🔍 MOMO Order IDs:', momoOrderIds);
                        
                        // Đảm bảo ordersList là array trước khi filter
                        if (!Array.isArray(ordersList)) {
                            console.warn('⚠️ ordersList không phải array, bỏ qua rollback');
                        } else {
                            // Tìm các order COD đã bị cập nhật nhầm thành PAID
                            const codOrdersToRollback = ordersList.filter((order: any) => {
                                const paymentMethod = order?.payment_method || order?.current_order?.payment_method;
                                const paymentStatus = order?.payment_status || order?.current_order?.payment_status;
                                const isCOD = paymentMethod === 'ONSITE' || paymentMethod === 'COD';
                                const isPaid = paymentStatus === 'PAID';
                                // Loại trừ các order MOMO
                                const isNotMomoOrder = !momoOrderIds.includes(order.id);
                                console.log(`🔍 Order #${order.id}: paymentMethod=${paymentMethod}, paymentStatus=${paymentStatus}, isCOD=${isCOD}, isPaid=${isPaid}, isNotMomoOrder=${isNotMomoOrder}`);
                                return isCOD && isPaid && isNotMomoOrder;
                            });
                            
                            if (codOrdersToRollback.length > 0) {
                                console.log(`⚠️ Phát hiện ${codOrdersToRollback.length} đơn COD đã bị cập nhật nhầm, đang rollback...`, codOrdersToRollback.map((o: any) => ({ id: o.id, payment_method: o.payment_method, payment_status: o.payment_status })));
                                
                                // Rollback lại payment_status = UNPAID cho các order COD
                                await Promise.all(
                                    codOrdersToRollback.map((order: any) =>
                                        orderApi.updateOrder(order.id, {
                                            payment_status: 'UNPAID',
                                        }).then(() => {
                                            console.log(`✅ Đã rollback đơn COD #${order.id}`);
                                        }).catch(err => {
                                            console.error(`❌ Lỗi rollback đơn COD #${order.id}:`, err);
                                        })
                                    )
                                );
                                
                                console.log('✅ Đã rollback payment_status cho các đơn COD trong momo-return page');
                                
                                // Retry thêm 2 lần nữa sau 5 giây mỗi lần để đảm bảo
                                if (retryCount < 2) {
                                    setTimeout(() => rollbackCODOrders(retryCount + 1), 5000);
                                }
                            } else {
                                console.log('✅ Không có đơn COD nào bị cập nhật nhầm trong momo-return page');
                            }
                        }
                    } catch (rollbackError) {
                        console.error('❌ Lỗi khi rollback đơn COD trong momo-return page:', rollbackError);
                        // Retry nếu chưa quá 3 lần
                        if (retryCount < 3) {
                            setTimeout(() => rollbackCODOrders(retryCount + 1), 3000);
                        }
                    }
                };
                
                // Bắt đầu rollback (không await để không block redirect)
                rollbackCODOrders();
            }

                // Thanh toán thành công - Kiểm tra có nhiều đơn hàng không
                const multipleOrderIds = sessionStorage.getItem('momo_order_ids');
                if (multipleOrderIds) {
                    try {
                        const orderIds = JSON.parse(multipleOrderIds);
                        console.log('✅ MoMo payment success for multiple orders:', orderIds);

                        // Xóa session storage
                        sessionStorage.removeItem('momo_order_ids');

                        // Redirect đến confirmation với nhiều order IDs
                        const orderIdsParam = encodeURIComponent(JSON.stringify(orderIds));
                        router.replace(`/confirmation?orderIds=${orderIdsParam}&payment=success`);
                        return;
                    } catch (error) {
                        console.error('❌ Error parsing multiple order IDs:', error);
                    }
                }

                // Single order hoặc fallback
                const orderIdParam = extractedOrderId ? `&orderId=${extractedOrderId}` : '';
                console.log('✅ MoMo payment success, redirecting...');
                router.replace(extractedOrderId ? `/confirmation?orderId=${extractedOrderId}&payment=success` : `/orders?payment=success${orderIdParam}`);
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