'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../../layouts';
import { orderApi } from '../../../../api/modules/orders';
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

  return (
    <BaseLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-4">Chi tiết đơn hàng #{id}</h1>
        {loading && <div>Đang tải…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && order && (
          <div className="space-y-4">
            <div className="border rounded p-4">
              <div>Trạng thái: {order.status}</div>
              <div>Thanh toán: {order.payment_status}</div>
              <div>Phương thức: {order.payment_method}</div>
              <div>Địa chỉ: {order.shipping_address}</div>
              <div>Ngày: {order.order_date ?? order.created_at}</div>
            </div>
            {Array.isArray(order.items) && order.items.length > 0 && (
              <div className="border rounded p-4">
                <div className="font-semibold mb-2">Sản phẩm</div>
                <div className="space-y-2">
                  {order.items.map((it: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>SP #{it.product_id} x{it.quantity}</div>
                      <div>{formatPrice(it.price_at_order * it.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseLayout>
  );
}


