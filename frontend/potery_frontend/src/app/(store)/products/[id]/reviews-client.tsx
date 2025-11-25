'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Image from 'next/image';
import { reviewsApi, ReviewItem } from '../../../../api/modules/reviews';
import { useAuth } from '../../../../contexts/AuthContext';

export function ReviewsClient({
  productId,
  productRating, // Prop này sẽ không được dùng nữa, theo yêu cầu của bạn
  productReviewCount, // Prop này sẽ không được dùng nữa, theo yêu cầu của bạn
  onStatsChange,
}: {
  productId: string;
  productRating: number;
  productReviewCount: number;
  onStatsChange?: (average: number, count: number) => void;
}) {
  const { user, isAuthenticated } = useAuth();
  type ReviewDisplayItem = ReviewItem & {
    customer_name?: string;
    customer_avatar?: string;
    images?: string[];
    customer_id?: string | number;
  };
  const [reviews, setReviews] = useState<ReviewDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Modal xem ảnh lớn dạng slider
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalIndex, setModalIndex] = useState<number>(0);
  const handleOpenImage = (images: string[], idx: number) => {
    setModalImages(images);
    setModalIndex(idx);
  };
  const handleCloseModal = () => {
    setModalImages([]);
    setModalIndex(0);
  };
  const Star = ({ filled, size = 20 }: { filled: boolean; size?: number }) => {
    const fillColor = filled ? '#ffdc7bff' : 'transparent';
    const strokeColor = filled ? '#ffdc7bff' : '#fbe3a2ff';
    const dropShadow = filled ? 'filter: drop-shadow(0 1px 0 rgba(0,0,0,0.06))' : undefined;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{ display: 'inline-block', verticalAlign: 'middle', ...(dropShadow ? { filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.06))' } : {}) }}
      >
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={1.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // State cho từng review: mở rộng comment hay không
  const [expandedComments, setExpandedComments] = useState<{ [id: string]: boolean }>({});
  // State cho số lượng review hiển thị
  const [visibleCount, setVisibleCount] = useState(5);
  // State để xác định vừa ẩn bớt
  const [justCollapsed, setJustCollapsed] = useState(false);

  const reviewRefs = React.useRef<{ [id: string]: HTMLDivElement | null }>({});
  const handleToggleComment = (id: string, hide?: boolean) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
    if (hide && reviewRefs.current[id]) {
      const el = reviewRefs.current[id];
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({
          top: rect.top + scrollTop - 70,
          behavior: 'smooth',
        });
      }
    }
  };

  // Khi vừa ẩn bớt, cuộn lên review cuối cùng đang hiển thị
  useEffect(() => {
    if (justCollapsed) {
      // Tìm review cuối cùng đang hiển thị
      const lastReview = reviews[visibleCount - 1];
      if (lastReview && lastReview.id && reviewRefs.current[lastReview.id]) {
        const el = reviewRefs.current[lastReview.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          window.scrollTo({
            top: rect.top + scrollTop - 70,
            behavior: 'smooth',
          });
        }
      }
      setJustCollapsed(false);
    }
  }, [visibleCount, justCollapsed, reviews]);

  // 🔹 Lấy danh sách đánh giá (LOGIC GIỮ NGUYÊN)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await reviewsApi.listByProduct(productId);

        if (mounted) {
          // Chuẩn hóa dữ liệu để dễ render
          const formatted = data.map((item: { review: ReviewItem & { image_review?: { image: string }[] }; customer?: { name?: string; avatar_image?: string; id?: string | number } }) => ({
            id: item.review.id,
            rating: item.review.rating,
            comment: item.review.comment,
            customer_name: item.customer?.name || 'Khách hàng',
            customer_avatar: item.customer?.avatar_image ? `data:image/jpeg;base64,${item.customer.avatar_image}` : '',
            created_at: item.review.created_at || new Date().toISOString(),
            images: Array.isArray(item.review.image_review) ? item.review.image_review.map((img) => `data:image/jpeg;base64,${img.image}`) : [],
            customer_id: item.customer?.id,
          }));

          setReviews(formatted);
          const totalReviews = formatted.length;
          const averageRating = totalReviews > 0 ? formatted.reduce((sum: number, r: { rating?: number }) => sum + (r.rating || 0), 0) / totalReviews : 0;
          if (onStatsChange) onStatsChange(averageRating, totalReviews);
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
  }, [productId, onStatsChange]);

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
    <section className="my-5 p-6 rounded-2xl bg-white shadow ">
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
                    {[...Array(5)].map((_, i) => {
                      let starType: 'full' | 'half' | 'quarter' | 'empty' = 'empty';
                      const fullStars = Math.floor(averageRating);
                      const decimal = averageRating - fullStars;
                      if (i < fullStars) {
                        starType = 'full';
                      } else if (i === fullStars) {
                        if (decimal >= 0.8) starType = 'full';
                        else if (decimal >= 0.5) starType = 'half';
                        else if (decimal >= 0.1) starType = 'quarter';
                        else starType = 'empty';
                      } else {
                        starType = 'empty';
                      }
                      if (starType === 'half') {
                        return (
                          <svg key={i} width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                            <defs>
                              <linearGradient id={`half-star-${i}`} x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                                <stop offset="50%" stopColor="#ffdc7bff" />
                                <stop offset="50%" stopColor="transparent" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                              fill={`url(#half-star-${i})`}
                              stroke="#ffdc7bff"
                              strokeWidth={1.25}
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />
                          </svg>
                        );
                      }
                      if (starType === 'quarter') {
                        return (
                          <svg key={i} width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                            <defs>
                              <linearGradient id={`quarter-star-${i}`} x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                                <stop offset="25%" stopColor="#ffdc7bff" />
                                <stop offset="25%" stopColor="transparent" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                              fill={`url(#quarter-star-${i})`}
                              stroke="#ffdc7bff"
                              strokeWidth={1.25}
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />
                          </svg>
                        );
                      }
                      return <Star key={i} filled={starType === 'full'} size={20} />;
                    })}
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
          <div className="text-red-600">{error}</div>
        )}

        {/* DANH SÁCH REVIEW ITEMS */}
        {!loading && !error && (
          <>
            {reviews.slice(0, visibleCount).map((r) => {
              // Xử lý comment: cắt 3 dòng đầu nếu chưa mở rộng
              const commentLines = r.comment ? r.comment.split(/\r?\n/) : [];
              const isLong = commentLines.length > 3;
              const expanded = r.id ? expandedComments[r.id] : false;
              let displayComment: string;
              if (!expanded && isLong) {
                displayComment = commentLines.slice(0, 3).join('\n');
              } else {
                displayComment = r.comment || '';
              }
              return (
                <div key={r.id ?? String(Math.random())} ref={el => { if (r.id) reviewRefs.current[r.id] = el; }}>
                  {/* Phần thông tin user (flex-row) */}
                  <div className="flex items-start space-x-4">
                    <Image
                      src={r.customer_avatar || '/images/default-avatar.jpg'}
                      alt={r.customer_name || ''}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {r.customer_name || (r.customer_id === user?.id ? 'Bạn' : 'Khách hàng')}
                      </div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} filled={i < Math.floor(r.rating)} size={16} />
                        ))}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
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
                  <p className="mt-3 text-gray-700 pl-14" dangerouslySetInnerHTML={{ __html: displayComment ? displayComment.replace(/\n/g, '<br />') : '—' }} />
                  {isLong && r.id && (
                    <div className="pl-14 mt-1 flex justify-end">
                      {!expanded ? (
                        <button
                          className="text-gray-500 hover:text-gray-700 hover:underline text-xs font-medium transition-colors duration-150"
                          onClick={() => r.id && handleToggleComment(r.id)}
                        >
                          Xem thêm
                        </button>
                      ) : (
                        <button
                          className="text-gray-500 hover:text-gray-700 hover:underline text-xs font-medium transition-colors duration-150"
                          onClick={() => r.id && handleToggleComment(r.id, true)}
                        >
                          Ẩn bớt
                        </button>
                      )}
                    </div>
                  )}

                  {/* Ảnh đính kèm (thụt lề bằng padding-left) */}
                  {Array.isArray(r.images) && r.images.length > 0 && (
                    <div className="mt-3 flex space-x-3 pl-14">
                      {r.images.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          className="focus:outline-none"
                          onClick={() => handleOpenImage(r.images!, idx)}
                        >
                          <Image
                            src={img}
                            alt={`review image ${idx + 1}`}
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-lg object-cover hover:ring-2 hover:ring-yellow-400"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Modal xem ảnh lớn dạng slider */}
                  {modalImages.length > 0 && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-white-500 bg-opacity-60 backdrop-blur"
                      style={{ cursor: 'default' }}
                    >
                      <button
                        className="absolute top-6 right-6 z-50 focus:outline-none group"
                        onClick={handleCloseModal}
                        type="button"
                        aria-label="Đóng"
                      >
                        <svg width={40} height={40} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="20" cy="20" r="18" fill="#fff" fillOpacity="0.7" />
                          <path d="M14 14L26 26M26 14L14 26" stroke="#616161ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-red-500 transition-colors duration-150" />
                        </svg>
                      </button>
                      <div className="relative w-[90vw] max-w-[700px]">
                        <Swiper
                          initialSlide={modalIndex}
                          spaceBetween={20}
                          slidesPerView={1}
                          style={{ width: '100%', height: '100%' }}
                        >
                          {modalImages.map((img, idx) => (
                            <SwiperSlide key={idx}>
                              <Image
                                src={img}
                                alt={`Ảnh đánh giá lớn ${idx + 1}`}
                                width={700}
                                height={700}
                                className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-lg mx-auto"
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Nút Xem thêm/Ẩn bớt */}
            {reviews.length > visibleCount && (
              <div className="flex justify-center mt-4">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                >
                  Xem thêm
                </button>
              </div>
            )}
            {visibleCount > 5 && (
              <div className="flex justify-center mt-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setVisibleCount((prev) => Math.max(5, prev - 20));
                    setJustCollapsed(true);
                  }}
                >
                  Ẩn bớt
                </button>
              </div>
            )}
            {/* Trường hợp không có review */}
            {reviews.length === 0 && (
              <div className="text-gray-600">
                Chưa có đánh giá nào cho sản phẩm này.
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}