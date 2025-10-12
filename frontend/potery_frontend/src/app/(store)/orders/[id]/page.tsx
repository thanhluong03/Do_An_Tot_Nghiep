'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../../layouts';
import { orderApi } from '../../../../api/modules/orders';
import Image from 'next/image';
import { formatPrice } from '../../../../utils/format';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function OrderDetailPage(props: PageProps) {
  const resolvedParams = 'then' in props.params ? await props.params : props.params;
  const { id } = resolvedParams;
  return <OrderDetailClient id={id} />;
}

function OrderDetailClient({ id }: { id: string }) {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await orderApi.getOrderDetail(id);
        const data = res?.data || res;
        setOrder(data);
      } catch (e: any) {
        setError(e?.message || 'Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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

  if (loading)
    return (
      <BaseLayout>
        <div className="text-center py-12 text-gray-600">Đang tải đơn hàng...</div>
      </BaseLayout>
    );

  if (error)
    return (
      <BaseLayout>
        <div className="text-center py-12 text-red-600">{error}</div>
      </BaseLayout>
    );

  if (!order) return null;

  const current = order.current_order || {};
  const items = current.items || [];
  const statusHistory = order.statusHistory || [];

  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-semibold text-[#2C2A24] mb-2">
          Chi tiết đơn hàng #{order.id}
        </h1>

        {/* Thông tin trạng thái */}
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-700 font-medium">Trạng thái đơn hàng:</div>
              <div
                className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </div>
            </div>
            <div className="text-right text-gray-600 text-sm">
              Ngày đặt: {new Date(order.order_date).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Địa chỉ giao hàng */}
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Địa chỉ giao hàng</h2>
          <div className="text-gray-700">{order.shipping_address || 'Chưa có địa chỉ'}</div>
        </div>

        {/* Thông tin thanh toán */}
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Thanh toán</h2>
          <div className="text-gray-700">
            <div>Phương thức: {order.payment_method}</div>
            <div>Trạng thái: {order.payment_status}</div>
            <div>Tổng tiền: {formatPrice(order.total_amount)}</div>
          </div>
        </div>

        {/* Sản phẩm trong đơn hàng */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
          <div className="divide-y">
            {items.map((it: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <Image
                    src={it.image || '/default-product.jpg'}
                    alt={it.product_name || 'Sản phẩm'}
                    width={64}
                    height={64}
                    className="rounded border object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{it.product_name}</div>
                    <div className="text-sm text-gray-500">{it.description}</div>
                    <div className="text-sm text-gray-600">
                      Cửa hàng: <span className="font-medium">{it.store_name}</span>
                    </div>
                    <div className="text-sm text-gray-500">Địa chỉ: {it.store_address}</div>
                    <div className="text-sm text-gray-600">Số lượng: {it.quantity}</div>
                  </div>
                </div>
                <div className="text-right font-semibold text-gray-800">
                  {formatPrice(it.price_at_order * it.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lịch sử trạng thái đơn hàng */}
        {statusHistory.length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-3">Lịch sử trạng thái</h2>
            <div className="space-y-2">
              {statusHistory.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="text-gray-700 text-sm">
                    <span className="font-medium">{s.status}</span> —{' '}
                    {new Date(s.changed_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
