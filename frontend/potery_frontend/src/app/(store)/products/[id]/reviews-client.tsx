'use client';

import React, { useEffect, useState } from 'react';
import { reviewsApi, ReviewItem } from '../../../../api/modules/reviews';

export function ReviewsClient({ productId, productRating, productReviewCount } : { productId: string; productRating: number; productReviewCount: number; }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await reviewsApi.list(productId);
        if (mounted) setReviews(data);
      } catch (e) {
        if (mounted) setError('Không thể tải đánh giá');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [productId]);

  return (
    <section className="mt-14">
      <h2 className="text-2xl font-serif font-bold text-[#2C2A24] mb-6">Đánh giá sản phẩm</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-white shadow">
          <div className="text-4xl font-bold text-[#2C2A24]">{productRating.toFixed(1)}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={i < Math.floor(productRating) ? '/images/star-filled.png' : '/images/star-empty.png'} alt="star" className="w-5 h-5" />
              ))}
            </div>
            <span className="text-sm text-gray-600">{productReviewCount} đánh giá</span>
          </div>
          <p className="mt-3 text-sm text-gray-600">Chia sẻ cảm nhận của bạn để mọi người cùng biết.</p>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading && (<div className="p-6 rounded-2xl bg-white shadow text-gray-600">Đang tải đánh giá…</div>)}
          {error && (<div className="p-6 rounded-2xl bg-white shadow text-red-600">{error}</div>)}
          {!loading && !error && reviews.length === 0 && (
            <div className="p-6 rounded-2xl bg-white shadow text-gray-600">Chưa có đánh giá nào cho sản phẩm này.</div>
          )}
          {!loading && !error && reviews.map((r) => (
            <div key={r.id} className="p-6 rounded-2xl bg-white shadow">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">Khách hàng</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={i < Math.floor(r.rating) ? '/images/star-filled.png' : '/images/star-empty.png'} alt="star" className="w-4 h-4" />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-gray-700">{r.comment || '—'}</p>
              <div className="mt-2 text-xs text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleString('vi-VN') : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


