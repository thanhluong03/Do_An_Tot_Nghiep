'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useAuth } from '../../../contexts/AuthContext';
import { orderApi } from '../../../api/modules/orders';
import Image from 'next/image';
import Link from 'next/link';
import { productApi } from '../../../api/modules/products';
export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
const [productMap, setProductMap] = useState<Record<number, any>>({});

useEffect(() => {
  const fetchProducts = async () => {
    const productIds = orders.flatMap(o => o.items?.map((i: any) => i.product_id)).filter(Boolean);
    const uniqueIds = [...new Set(productIds)];
    const result: Record<number, any> = {};

    await Promise.all(uniqueIds.map(async id => {
      try {
        const data = await productApi.getProductById(String(id));
        result[id] = data;
      } catch {}
    }));
    setProductMap(result);
  };

  if (orders.length > 0) fetchProducts();
}, [orders]);
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderApi.getOrdersByCustomer(user.id as string, 1, 50);
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : data?.data || [];
        const seen = new Set();
        const unique = list.filter((o: any) => {
          const id = o?.id ?? o?._id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setOrders(unique);
      } catch (e: any) {
        setError(e?.message || 'Không thể tải đơn hàng');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, user?.id]);

  const formatPrice = (price: number | string) => {
    const num = Number(price) || 0;
    return num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'created':
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'completed':
      case 'delivered':
        return 'text-green-700 bg-green-100';
      case 'cancelled':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <BaseLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-semibold mb-8 text-[#2C2A24] text-center">
          Đơn hàng của tôi
        </h1>

        {loading && <div className="text-center py-8 text-gray-600">Đang tải…</div>}
        {error && <div className="text-center text-red-600 py-8">{error}</div>}

        {!loading && !error && (
          orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              
              <p>Chưa có đơn hàng nào.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => {
                const id = order.id ?? order._id;
                const info = order.current_order || order;
                const items = info.items || [];
                const total = info.total_amount ?? info.total ?? order.total_amount ?? 0;

                return (
                  <div
                    key={id}
                    className="bg-white rounded-2xl border border-[#E5E2D8] shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b p-5 bg-[#F9F8F4]">
                      <div>
                        <div className="font-medium text-[#2C2A24]">
                          Mã đơn hàng: <span className="font-bold">#{id}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status || 'Không rõ'}
                      </span>
                    </div>

                    {/* Thông tin giao hàng & thanh toán */}
                    <div className="bg-[#FDFCF9] border-b p-4 text-sm text-gray-700 grid sm:grid-cols-2 gap-2">
                      <p><strong>Địa chỉ giao hàng:</strong> {info.shipping_address || '—'}</p>
                      <p><strong>Phương thức thanh toán:</strong> {info.payment_method || 'Không rõ'}</p>
                      <p><strong>Trạng thái thanh toán:</strong> {info.payment_status || 'Không rõ'}</p>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="divide-y">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-4">
                          <div className="w-24 h-24 relative flex-shrink-0">
                            <Image
                              src={
                                item?.product_images?.[0]?.image_data
                                  ? `data:image/avif;base64,${item.product_images[0].image_data}`
                                  : productMap[item.product_id]?.images?.[0]
                                    ? productMap[item.product_id].images[0]
                                    : '/no-image.png'
                              }
                              alt={item.product_name || 'Sản phẩm'}
                              fill
                              unoptimized
                              className="object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#2C2A24] truncate">
                              {item.product_name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {item.description || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              Cửa hàng: {item.store_name} – {item.store_address}
                            </div>
                            <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                          </div>
                          <div className="text-right font-medium text-[#2C2A24] whitespace-nowrap">
                            {formatPrice(item.price_at_order * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tổng cộng */}
                    <div className="flex justify-between items-center p-5 border-t bg-[#F9F8F4]">
                      <div className="text-sm text-gray-600">
                        Thanh toán: <strong>{info.payment_method || '—'}</strong>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Tổng tiền:</div>
                        <div className="text-xl font-semibold text-[#2C2A24]">
                          {formatPrice(total)}
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex justify-end p-4">
                      <Link
                        href={`/orders/${id}`}
                        className="px-5 py-2 text-sm font-medium border rounded-full hover:bg-[#F5F1EB] text-[#2C2A24] transition"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </BaseLayout>
  );
}
