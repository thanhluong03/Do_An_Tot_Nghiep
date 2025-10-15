'use client';

import React, { useEffect, useState } from 'react';
import { reviewsApi, ReviewItem } from '../../../../api/modules/reviews';
import { useAuth } from '../../../../contexts/AuthContext';

export function ReviewsClient({
  productId,
  productRating,
  productReviewCount,
}: {
  productId: string;
  productRating: number;
  productReviewCount: number;
}) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🔹 Lấy danh sách đánh giá
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await reviewsApi.list(productId);
        if (mounted) setReviews(data);
      } catch {
        if (mounted) setError('Không thể tải đánh giá');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId]);

  // 🔹 Gửi đánh giá
  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!isAuthenticated || !user?.id) {
      setError('Vui lòng đăng nhập để gửi đánh giá');
      return;
    }

    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Vui lòng chọn số sao từ 1 đến 5');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        product_id: productId,
        customer_id: user.id,
        rating, // ✅ giữ dạng number
        comment: comment.trim(),
      };

      console.log('📦 Gửi review:', payload);
      const res = await reviewsApi.create(payload);

      const newReview: ReviewItem = {
        id: res.id || String(Date.now()),
        product_id: productId,
        customer_id: user.id,
        rating,
        comment,
        created_at: new Date().toISOString(),
      };

      setReviews((prev) => [newReview, ...prev]);
      setComment('');
      setRating(5);
      setSuccessMessage('✅ Đã gửi đánh giá thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      console.error('❌ Lỗi gửi review:', e);
      setError('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-14">
      <h2 className="text-2xl font-serif font-bold text-[#2C2A24] mb-6">Đánh giá sản phẩm</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🔹 Tổng quan đánh giá */}
        <div className="p-6 rounded-2xl bg-white shadow">
          <div className="text-4xl font-bold text-[#2C2A24]">{productRating.toFixed(1)}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={i < Math.floor(productRating) ? '/star.png' : '/star-empti.png'}
                  alt="star"
                  className="w-5 h-5"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">{productReviewCount} đánh giá</span>
          </div>
          <p className="mt-3 text-sm text-gray-600">Chia sẻ cảm nhận của bạn về sản phẩm này.</p>
        </div>

        {/* 🔹 Form và danh sách đánh giá */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form nhập đánh giá 
          <div className="p-6 rounded-2xl bg-white shadow space-y-3">
            {isAuthenticated ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Chọn số sao:</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <img
                          src={star <= rating ? '/heart.png' : '/leaf.png'}
                          alt={`${star} sao`}
                          className={`w-6 h-6 transition-transform duration-150 ${
                            star <= rating ? 'scale-110' : 'opacity-70'
                          } hover:scale-125`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Bạn chọn: <strong>{rating}</strong> sao
                  </p>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded-lg p-3 text-sm"
                  rows={3}
                  placeholder="Nhập cảm nhận của bạn..."
                />

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 bg-[#65604E] text-white rounded-lg hover:bg-[#3D3A2F] disabled:opacity-50"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>

                {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </>
            ) : (
              <div className="text-gray-600 text-sm">
                Vui lòng{' '}
                <a href="/login" className="text-[#65604E] font-semibold underline">
                  đăng nhập
                </a>{' '}
                để viết đánh giá.
              </div>
            )}
          </div>
*/}
          {/* Danh sách đánh giá */}
          {loading && (
            <div className="p-6 rounded-2xl bg-white shadow text-gray-600">Đang tải đánh giá…</div>
          )}

          {!loading && error && (
            <div className="p-6 rounded-2xl bg-white shadow text-red-600">{error}</div>
          )}

          {!loading &&
            !error &&
            reviews.map((r) => (
              <div key={r.id} className="p-6 rounded-2xl bg-white shadow">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">
                    {r.customer_id === user?.id ? 'Bạn' : 'Khách hàng'}
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={i < Math.floor(r.rating) ? '/star.png' : '/star-empti.png'}
                        alt="star"
                        className="w-4 h-4"
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-gray-700">{r.comment || '—'}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {r.created_at ? new Date(r.created_at).toLocaleString('vi-VN') : ''}
                </div>
              </div>
            ))}

          {!loading && !error && reviews.length === 0 && (
            <div className="p-6 rounded-2xl bg-white shadow text-gray-600">
              Chưa có đánh giá nào cho sản phẩm này.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
