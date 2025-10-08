'use client';

import React, { useEffect, useState } from 'react';
import { BaseLayout } from '../../../layouts';
import { useAuth } from '../../../contexts/AuthContext';
import { orderApi } from '../../../api/modules/orders';

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
        const res = await orderApi.getOrdersByCustomer(user.id as any, 1, 50);
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        // Deduplicate by id to prevent duplicates from API
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

  return (
    <BaseLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-4">Đơn hàng của tôi</h1>
        {loading && <div>Đang tải…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          orders.length === 0 ? (
            <div>Chưa có đơn hàng.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((o: any) => {
                const id = o?.id ?? o?._id;
                return (
                  <a key={id} href={`/store/orders/${id}`} className="block border rounded p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Đơn #{id}</div>
                      <span className="text-sm text-blue-600">Xem chi tiết →</span>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">Trạng thái: {o.status}</div>
                    <div className="text-sm text-gray-700">Thanh toán: {o.payment_status}</div>
                    <div className="text-sm text-gray-500">Ngày: {o.order_date ?? o.created_at}</div>
                  </a>
                );
              })}
            </div>
          )
        )}
      </div>
    </BaseLayout>
  );
}


