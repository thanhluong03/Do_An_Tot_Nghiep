'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BaseLayout } from '../../../../layouts';
import { newsApi, NewsItem } from '../../../../api/modules/news';
import Link from 'next/link';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';

export default function NewsDetailPage() {
  const { id } = useParams();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [related, setRelated] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const detail = await newsApi.detail(String(id));
        setNews(detail);

        // fetch bài liên quan trực tiếp từ API (fetch)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${API_BASE_URL}/news/listnews?page=1&limit=12`, { cache: 'no-store' });
        const raw = await res.json();
        const arr = Array.isArray(raw) ? raw : raw?.data || [];

        // ánh xạ dữ liệu thô thành NewsItem với xử lý published_at an toàn
        const mapped: NewsItem[] = arr.map((n: any) => {
          const publishedRaw = n?.published_at ?? n?.created_at ?? n?.createdAt ?? null;
          // chuyển sang ISO / Date nếu có thể
          const publishedDate = publishedRaw ? new Date(publishedRaw) : null;
          const publishedIso = publishedDate && !isNaN(publishedDate.getTime()) ? publishedDate.toISOString() : new Date().toISOString();

          const image =
            n?.image_data
              ? `data:image/jpeg;base64,${n.image_data}`
              : n?.image
              ? n.image
              : '/pott.jpg';

          return {
            id: String(n?.id ?? n?._id ?? ''),
            title: n?.title ?? n?.name ?? '',
            content: n?.content ?? n?.description ?? '',
            image,
            published_at: publishedIso,
            is_published: typeof n?.is_published === 'boolean' ? n.is_published : Number(n?.is_published ?? 1) === 1,
            user: n?.user ? { id: String(n.user.id ?? ''), name: n.user.name ?? 'Tác giả' } : undefined,
          } as NewsItem;
        });

        // sắp xếp theo published_at giảm dần (mới nhất trước)
        const sorted = mapped.sort((a, b) => {
          const da = new Date(a.published_at).getTime();
          const db = new Date(b.published_at).getTime();
          return db - da;
        });

        // loại bỏ bài hiện tại (so sánh id dưới dạng string) và lấy 3 bài mới nhất
        const filtered = sorted.filter((x) => String(x.id) !== String(detail.id)).slice(0, 3);

        setRelated(filtered);
      } catch (err) {
        console.error('Lỗi fetch news hoặc related:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNews();
  }, [id]);

  if (loading) {
    return (
      <BaseLayout>
        <div className="max-w-5xl mx-auto py-20 text-center text-gray-600">
          Đang tải bài viết...
        </div>
      </BaseLayout>
    );
  }

  if (!news) {
    return (
      <BaseLayout>
        <div className="max-w-5xl mx-auto py-20 text-center text-gray-600">
          Không tìm thấy bài viết.
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
    {/* === Popup Layer === */}
                {isAuthenticated && user?.id && (
                  <>
                    {/* Voucher Modal */}
                    {isVoucherModalOpen && (
                      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black bg-opacity-30">
                        <VoucherModal
                          customerId={user.id}
                          isOpen={isVoucherModalOpen}
                          onClose={() => setIsVoucherModalOpen(false)}
                        />
                      </div>
                    )}
          
                    {/* Chat Modal */}
                    {isChatOpen && (
                      <ChatModal
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        userId={Number(user.id)}
                        storeId={0}
                        conversationId={conversationId} // ✅ truyền id xuống
                      />
                    )}
          
                    {/* Floating Buttons */}
                    <div className="fixed top-1/2 right-6 -translate-y-1/2 flex flex-col items-end gap-4 z-[100]">
                      {/* Voucher Button */}
                      <button
                        onClick={() => setIsVoucherModalOpen(true)}
                        className="bg-yellow-400 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
                        title="Nhận Voucher Giảm Giá!"
                      >
                        🎁
                      </button>
          
                      {/* Chat Button */}
                      <button
                        onClick={async () => {
                          if (!isAuthenticated || !user?.id) return;
                          try {
                            console.log('%c💬 Tạo conversation trước khi mở chat...', 'color:deepskyblue');
                            const created = await conversationApi.createConversation({
                              sender_id: Number(user.id),
                              sender_type: 'USER',
                              content: 'Xin chào, tôi muốn hỏi về sản phẩm!',
                              user_id: Number(user.id),
                              store_id: 1,
                            });
          
                            const conv = created?.conversation || created?.data || created;
                            console.log('%c✅ Conversation created:', 'color:limegreen', conv);
                            setConversationId(conv?.id || null);
                            setIsChatOpen(true);
                          } catch (err) {
                            console.error('❌ Lỗi tạo conversation:', err);
                          }
                        }}
                        className="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                        title="Chat với Admin"
                      >
                        💬
                      </button>
                    </div>
                  </>
                )}
          
                <ScrollToTopButton />
      <section className="bg-[#FAFAF9] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Nút quay lại */}
          <div className="mb-8">
            <Link
              href="/news"
              className="text-[#A67C52] hover:underline text-sm flex items-center gap-1"
            >
              ← Quay lại danh sách tin tức
            </Link>
          </div>

          {/* Nội dung bài viết */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2C2A24] mb-4 leading-snug">
              {news.title}
            </h1>

            <div className="text-sm text-gray-500 mb-6 flex items-center gap-3">
              <span>{new Date(news.published_at).toLocaleDateString('vi-VN')}</span>
              <span>•</span>
              <span>Tác giả: <strong>{news.user?.name ?? 'Admin'}</strong></span>
            </div>

            {news.image && (
              <img
                src={news.image}
                alt={news.title}
                className="w-full rounded-xl mb-8 object-cover shadow-md"
              />
            )}

            <div className="prose prose-lg max-w-none text-[#3D3D3D] leading-relaxed break-words whitespace-normal">
              <p className="whitespace-pre-line">{news.content}</p>
            </div>

            {/* --- BÀI VIẾT LIÊN QUAN (HIỂN THỊ NGAY DƯỚI NỘI DUNG) --- */}
            <div className="mt-12">
              <h2 className="text-xl md:text-2xl font-serif text-[#2C2A24] mb-6 border-l-4 border-[#A67C52] pl-4">
                Bài viết liên quan
              </h2>

              {related.length === 0 ? (
                <div className="text-sm text-gray-500">Không có bài liên quan.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/news/${r.id}`}
                      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden"
                    >
                      <img
                        src={r.image || '/pott.jpg'}
                        alt={r.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-4">
                        <h3 className="text-md md:text-lg font-semibold text-[#2C2A24] mb-2 line-clamp-2 group-hover:text-[#A67C52] transition">
                          {r.title}
                        </h3>
                        <div className="text-xs text-gray-400 mb-2">
                          {new Date(r.published_at).toLocaleDateString('vi-VN')}
                        </div>
                        <div
                          className="prose prose-lg max-w-none text-[#3D3D3D] leading-relaxed break-words whitespace-normal"
                          dangerouslySetInnerHTML={{ __html: news.content }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* --- end related --- */}
          </article>
        </div>
      </section>
    </BaseLayout>
  );
}
