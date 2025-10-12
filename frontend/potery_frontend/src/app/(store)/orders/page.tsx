'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useAuth } from '../../../contexts/AuthContext';
import { orderApi } from '../../../api/modules/orders';
import Image from 'next/image';
import Link from 'next/link';

export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        return 'text-yellow-700 bg-yellow-50';
      case 'completed':
      case 'delivered':
        return 'text-green-700 bg-green-50';
      case 'cancelled':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <BaseLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6 text-[#2C2A24]">
          Đơn hàng của tôi
        </h1>

        {loading && <div className="text-center py-8 text-gray-600">Đang tải…</div>}
        {error && <div className="text-center text-red-600 py-8">{error}</div>}

        {!loading && !error && (
          orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Image
                src="/empty-box.png"
                alt="Chưa có đơn hàng"
                width={120}
                height={120}
                className="mx-auto mb-4 opacity-70"
              />
              <p>Chưa có đơn hàng nào.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const id = order.id ?? order._id;
                const info = order.current_order || order;
                const items = info.items || [];
                const total = info.total_amount ?? info.total ?? order.total_amount ?? 0;

                return (
                  <div
                    key={id}
                    className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b p-4 bg-gray-50">
                      <div>
                        <span className="text-gray-700 font-medium">
                          Mã đơn hàng:
                        </span>{' '}
                        <span className="text-[#2C2A24] font-semibold">
                          #{id}
                        </span>
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

                    {/* Shipping & Payment Info */}
                    <div className="flex flex-wrap justify-between items-start gap-4 p-4 bg-gray-50 border-b text-sm text-gray-700">
                      <div>
                        <p>
                          <strong>Địa chỉ giao hàng:</strong>{' '}
                          {info.shipping_address || order.shipping_address || '—'}
                        </p>
                        <p>
                          <strong>Phương thức thanh toán:</strong>{' '}
                          {info.payment_method || 'Không rõ'}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Trạng thái thanh toán:</strong>{' '}
                          {info.payment_status || 'Không rõ'}
                        </p>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="divide-y">
                      {items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex gap-4 items-center p-4"
                        >
                          <Image
                            src={item.image || '/default-product.jpg'}
                            alt={item.product_name || 'Sản phẩm'}
                            width={80}
                            height={80}
                            className="rounded-md border object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {item.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.description || ''}
                            </div>
                            <div className="text-sm text-gray-500">
                              Cửa hàng: {item.store_name} - {item.store_address}
                            </div>
                            <div className="text-sm text-gray-500">
                              SL: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right text-gray-700 font-medium">
                            {formatPrice(item.price_at_order * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                      <div className="text-sm text-gray-600">
                        Thanh toán: {info.payment_method || 'Chưa rõ'}
                      </div>
                      <div className="text-right">
                        <div className="text-gray-600 text-sm">Tổng tiền:</div>
                        <div className="text-xl font-semibold text-[#2C2A24]">
                          {formatPrice(total)}
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end p-4">
                      <Link
                        href={`/orders/${id}`}
                        className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-100 text-[#2C2A24]"
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
