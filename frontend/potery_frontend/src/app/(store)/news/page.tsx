'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BaseLayout } from '../../../layouts';
import { newsApi, NewsItem } from '../../../api/modules/news';
import { useAuth } from '@/contexts/AuthContext';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton, AIChatModal } from '@/components/feature';
import { Bot, Gift, MessageSquare, User } from 'lucide-react';

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 6; // mỗi trang 6 bài
  const totalPages = Math.ceil(total / limit);
  const [loading, setLoading] = useState(true);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
      const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const fetchData = async (pageNum: number) => {
    setLoading(true);
    const { items, total } = await newsApi.list(pageNum, limit);
    setItems(items);
    setTotal(total);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <BaseLayout>
    {isAuthenticated && user?.id && (
        <>
          {/* Voucher Modal */}
          {isVoucherModalOpen && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/10">
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

          {/* AI Chat Modal */}
          <AIChatModal
            isOpen={isAIChatOpen}
            onClose={() => setIsAIChatOpen(false)}
          />

          {/* Floating Buttons */}
          <div
            className={`fixed top-1/2 -translate-y-1/2 flex flex-col items-end gap-4 z-[100] transition-all duration-300 ${
              isChatDropdownOpen ? 'right-1' : 'right-1'
            }`}
          >
            {/* Voucher Button */}
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="bg-yellow-400 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
              title="Nhận Voucher Giảm Giá!"
            >
              <Gift className="w-6 h-6" />
            </button>

            {/* Chat Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsChatDropdownOpen(prev => !prev)}
                className="bg-[#8B7D6B] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                title="Bắt đầu trò chuyện"
              >
                <MessageSquare className="w-6 h-6" />
              </button>

              {isChatDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 flex flex-col gap-3 transition-all duration-300 ease-out transform origin-top-right">
                  {/* Nút Chat với Admin */}
                  <div className="relative group">
                    <button
                      onClick={async () => {
                        if (!isAuthenticated || !user?.id) return;
                        try {
                          const created = await conversationApi.createConversation({
                            sender_id: Number(user.id),
                            sender_type: 'USER',
                            content: 'Xin chào, tôi muốn hỏi về sản phẩm!',
                            user_id: Number(user.id),
                            store_id: 1,
                          });
                          const conv = created?.conversation || created?.data || created;
                          setConversationId(conv?.id || null);
                          setIsChatOpen(true);
                          setIsChatDropdownOpen(false);
                        } catch (err) {
                          console.error('❌ Lỗi tạo conversation:', err);
                        }
                      }}
                      className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                      title="Chat với Admin"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Nút Chat với AI */}
                  <div className="relative group">
                    <button
                      onClick={() => {
                        setIsAIChatOpen(true); // 2. Mở popup AI chat
                        setIsChatDropdownOpen(false);
                      }}
                      className="bg-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
                      title="Chat với AI"
                    >
                      <Bot className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
          
                <ScrollToTopButton />
      {/* Banner giống ảnh */}
      <section className="relative w-screen left-1/2 right-1/2 -mx-[50vw] -mt-[100px] md:-mt-[120px]">
        <img
          src="/bg-new.jpg"
          alt="Tin tức và Câu chuyện"
          className="w-full h-[450px] md:h-[550px] object-cover"
        />
        <div className="absolute inset-0 bg-white/60 flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2C2A24] mb-3">
            Tin tức và <span className="font-semibold">Câu chuyện</span>
          </h1>
        </div>
      </section>

      {/* Tiêu đề + mô tả */}
      <div className="bg-[#FAF9F7] py-14 text-center">
        <span className="inline-block bg-[#EDE8E0] text-[#5B5031] px-4 py-1 rounded-full text-sm mb-4">
          Nhật Ký Gốm Sứ
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-[#2C2A24] mb-3">
          Câu Chuyện & <span className="text-[#A67C52]">Cảm Hứng</span>
        </h2>
        <p className="max-w-2xl mx-auto text-[#65604E] text-base md:text-lg">
          Khám phá những câu chuyện thú vị về nghệ thuật gốm sứ, kỹ thuật chế tác và xu hướng thiết kế
        </p>
      </div>

      {/* Danh sách tin */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div className="text-center text-gray-600">Đang tải…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600 text-center">Chưa có bài viết.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((n) => (
                <article
                  key={n.id}
                  className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col"
                >
                  <img
                    src={n.image || '/pott.jpg'}
                    alt={n.title}
                    className="w-full h-52 object-cover rounded-xl mb-4"
                  />
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="mr-3">
                      {new Date(n.published_at).toLocaleDateString('vi-VN')}
                    </span>
                    <span>• 5 phút đọc</span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#2C2A24] mb-2 line-clamp-2">
                    {n.title}
                  </h2>
                  <p className="text-[#65604E] mb-4 line-clamp-3 flex-grow">
                    {n.content}
                  </p>
                  <div className="mt-auto">
                    <Link
                      href={`/news/${n.id}`}
                      className="inline-block mt-2 text-[#A67C52] font-medium hover:underline"
                    >
                      Đọc Tiếp →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Nút Xem tất cả bài viết */}
            <div className="flex justify-center mt-14">
              <button className="bg-[#A18C6F] text-white font-medium px-10 py-3 rounded-full hover:opacity-90 transition flex items-center gap-2">
                Xem Tất Cả Bài Viết →
              </button>
            </div>

            {/* Phân trang */}
            <div className="flex justify-center items-center gap-3 mt-8">
              <p className="text-sm text-gray-700">Tổng: {total}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  className="px-2 text-gray-600 hover:text-black"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 rounded-md text-sm ${
                      i + 1 === page
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  className="px-2 text-gray-600 hover:text-black"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </BaseLayout>
  );
}
