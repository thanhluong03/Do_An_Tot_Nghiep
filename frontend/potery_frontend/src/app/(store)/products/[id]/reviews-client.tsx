'use client';

import React, { useEffect, useState } from 'react';
import { reviewsApi, ReviewItem } from '../../../../api/modules/reviews';
import { useAuth } from '../../../../contexts/AuthContext';

export function ReviewsClient({
  productId,
  productRating, // Prop này sẽ không được dùng nữa, theo yêu cầu của bạn
  productReviewCount, // Prop này sẽ không được dùng nữa, theo yêu cầu của bạn
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

  // 🔹 Lấy danh sách đánh giá (LOGIC GIỮ NGUYÊN)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await reviewsApi.listByProduct(productId);

        if (mounted) {
          // Chuẩn hóa dữ liệu để dễ render
          const formatted = data.map((item: any) => ({
            id: item.review.id,
            rating: item.review.rating,
            comment: item.review.comment,
            customer_name: item.customer?.name || 'Khách hàng',
            created_at: item.review.created_at || new Date().toISOString(),
            // Cần thêm: images: item.review.images || [],
          }));

          setReviews(formatted);
        }
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

  // 🔹 Gửi đánh giá (LOGIC GIỮ NGUYÊN)
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
      const payload = [
        {
          orderitem_id: Number(productId), // hoặc ID thật từ order item
          customer_id: Number(user.id),
          rating,
          comment: comment.trim(),
        },
      ];

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

  // 🔽 PHẦN JSX (HTML/CSS) ĐÃ ĐƯỢC THAY ĐỔI ĐỂ GIỐNG ẢNH 🔽
  // 🔽 LOGIC TÍNH TOÁN TỔNG QUAN ĐƯỢC GIỮ NGUYÊN THEO YÊU CẦU 🔽
  return (
    <section className="mt-14 p-6 rounded-2xl bg-white shadow ">
      {/* TIÊU ĐỀ - Đã sửa lại style từ code gốc */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Đánh giá sản phẩm
      </h2>

      {/* 🔹 Tổng quan đánh giá (Đã di chuyển lên đây) */}
      {/* (Bỏ 'p-6 rounded-2xl bg-white shadow' và 'grid' layout) */}
      <div className="mb-8">
        {loading ? (
          <div className="text-gray-600">Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">Không thể tải đánh giá</div>
        ) : (
          (() => {
            // LOGIC TÍNH TOÁN GỐC CỦA BẠN (ĐƯỢC GIỮ NGUYÊN)
            const totalReviews = reviews.length;
            const averageRating =
              totalReviews > 0
                ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
                  totalReviews
                : 0;

            return (
              // LAYOUT MỚI (giống ảnh)
              <div className="flex items-center space-x-3">
                <div className="text-4xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={
                          i < Math.round(averageRating)
                            ? '/star.png'
                            : '/star-empti.png'
                        }
                        alt="star"
                        className="w-5 h-5"
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {totalReviews} đánh giá
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* 🔹 Form và danh sách đánh giá */}
      {/* (Bỏ 'lg:col-span-2' layout) */}
      <div className="space-y-8">
        {/* Form nhập đánh giá (Giữ nguyên, đang bị comment out)
         <div className="p-6 rounded-2xl bg-white shadow space-y-3">
           ...
         </div>
        */}

        {/* 🔹 Danh sách đánh giá (Layout mới) */}
        {loading && (
          // Bỏ 'p-6 rounded-2xl bg-white shadow'
          <div className="text-gray-600">Đang tải đánh giá…</div>
        )}

        {!loading && error && (
          // Bỏ 'p-6 rounded-2xl bg-white shadow'
          <div className="text-red-600">{error}</div>
        )}

        {/* DANH SÁCH REVIEW ITEMS */}
        {!loading &&
          !error &&
          reviews.map((r) => (
            // Mỗi item không còn 'bg-white shadow'
            <div key={r.id}>
              {/* Phần thông tin user (flex-row) */}
              <div className="flex items-start space-x-4">
                <img
                  // Placeholder cho avatar
                  src="https://i.imgur.com/4Ym9kQj.png"
                  alt={r.customer_name}
                  className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {r.customer_name ||
                      (r.customer_id === user?.id ? 'Bạn' : 'Khách hàng')}
                  </div>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src={
                          i < Math.floor(r.rating)
                            ? '/star.png'
                            : '/star-empti.png'
                        }
                        alt="star"
                        className="w-4 h-4"
                      />
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {/* Format ngày tháng giống ảnh: YYYY-MM-DD HH:MM */}
                    {r.created_at
                      ? new Date(r.created_at)
                          .toLocaleString('sv-SE', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          .replace(',', '')
                      : ''}
                  </div>
                </div>
              </div>

              {/* Nội dung comment (thụt lề bằng padding-left) */}
              <p className="mt-3 text-gray-700 pl-14">{r.comment || '—'}</p>

              {/* Ảnh đính kèm (thụt lề bằng padding-left) */}
              <div className="mt-3 flex space-x-3 pl-14">
                {/* PHẦN NÀY CẦN LOGIC TỪ BẠN ĐỂ LẤY ẢNH REVIEW
                  Dưới đây là 2 ảnh placeholder để demo layout giống hệt ảnh mẫu:
                */}
                <img
                  src="https://i.imgur.com/gA5g9Zz.png" // Placeholder
                  alt="review image 1"
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <img
                  src="https://i.imgur.com/v8tq9fA.png" // Placeholder
                  alt="review image 2"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              </div>
            </div>
          ))}

        {/* TRƯỜNG HỢP KHÔNG CÓ REVIEW */}
        {!loading && !error && reviews.length === 0 && (
          // Bỏ 'p-6 rounded-2xl bg-white shadow'
          <div className="text-gray-600">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        )}
      </div>
    </section>
  );
}