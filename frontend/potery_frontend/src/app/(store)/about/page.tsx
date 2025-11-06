'use client';

import React, { useState } from 'react';
import { BaseLayout } from '../../../layouts';
import Image from 'next/image';
import Link from 'next/link';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton, AIChatModal, AboutSection, ValuePropositionSection } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Gift, MessageSquare, User } from 'lucide-react';
export default function NewsPage() {
  const [addingId, setAddingId] = useState<string | null>(null);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const { user, isAuthenticated } = useAuth();
      const [isAIChatOpen, setIsAIChatOpen] = useState(false);
        const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const articles = [
    {
      id: 1,
      title: 'Nghệ thuật gốm Việt trong không gian sống hiện đại',
      description:
        'Khám phá cách gốm sứ thủ công truyền thống được ứng dụng tinh tế trong nội thất hiện đại, mang lại cảm giác ấm cúng và gần gũi.',
      image: '/about10.jpg',
      date: '20/09/2025',
    },
    {
      id: 2,
      title: 'Workshop làm gốm – trải nghiệm sáng tạo từ đất và lửa',
      description:
        'Buổi workshop tháng 9 mang đến cho người tham gia cơ hội tự tay nặn gốm, cảm nhận sự tĩnh lặng và kết nối với thiên nhiên.',
      image: '/about11.jpg',
      date: '05/09/2025',
    },
    {
      id: 3,
      title: 'Gốm thủ công và giá trị bền vững',
      description:
        'Tìm hiểu về quy trình sản xuất thân thiện môi trường và cách Tiệm Gốm Nhà Gạo gìn giữ nghề truyền thống Việt Nam.',
      image: '/about12.jpg',
      date: '18/08/2025',
    },
  ];

  return (
    <BaseLayout>
      {/* === Popup Layer === */}
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
                            content: '',
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
            <AboutSection />
            <ValuePropositionSection />
            <div className="max-w-8xl mx-auto text-center mt-20 mb-30">
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-[#2C2A24] mb-4 mt-2">Hãy ghé Nhà Gạo</h3>
                <p className="text-xl text-[#65604E] font-light mb-6">
                  Đến Tiệm Gốm Nhà Gạo để xem những sản phẩm gốm sứ đẹp và chất lượng nhất nhé!
                </p>
                <button className="bg-[#8D806F] text-white font-semibold px-10 py-3 rounded-2xl shadow-md hover:bg-[#6F6558] transition duration-300">
                  <a href='/products'>Khám Phá Sản Phẩm →</a>
                </button>
              </div>
        {/* --- BANNER --- 
      <section className="relative w-full -mt-[100px] md:-mt-[120px]">
        <img
          src="/bg-about.jpg"
          alt="Tin tức Tiệm Gốm Nhà Gạo"
          className="w-full h-[360px] md:h-[500px] object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40">
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3">
            Tin tức Tiệm Gốm Nhà Gạo
          </h1>
          <p className="text-lg md:text-xl">
            Cập nhật những câu chuyện và hoạt động mới nhất của Nhà Gạo
          </p>
        </div>
      </section>

      
      <section className="bg-[#FDF9F6] py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4 text-[#2C2A24]">
            Chia sẻ từ Nhà Gạo
          </h2>
          <p className="text-[#65604E] text-lg leading-relaxed">
            Nơi chúng tôi kể lại hành trình làm gốm, những câu chuyện về con người, cảm hứng sáng tạo
            và cách những sản phẩm thủ công Việt được tạo nên với cả trái tim.  
            <br />
            Mỗi bài viết là một lát cắt nhỏ trong bức tranh văn hóa và nghệ thuật Việt Nam.
          </p>
        </div>
      </section>

    
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-serif font-semibold text-center mb-10 text-[#2C2A24]">
          Bài viết mới nhất
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col"
            >
              <div className="relative w-full h-[220px] mb-4 overflow-hidden rounded-xl">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-sm text-[#A45A3F] mb-1">{article.date}</p>
              <h3 className="text-xl font-serif font-semibold text-[#2C2A24] mb-3">
                {article.title}
              </h3>
              <p className="text-[#65604E] flex-grow">{article.description}</p>
              <Link
                href={`/news/${article.id}`}
                className="mt-4 inline-block text-[#A45A3F] font-medium hover:underline"
              >
                Xem chi tiết →
              </Link>
            </div>
          ))}
        </div>
      </section>

    
      <section className="bg-[#F3EEE9] py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-6">
          <div className="relative h-[350px] md:h-[420px] rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/about13.jpg"
              alt="Góc cảm hứng Nhà Gạo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-semibold mb-4 text-[#2C2A24]">
              Góc cảm hứng
            </h2>
            <p className="text-[#65604E] text-lg leading-relaxed mb-4">
              Mỗi sản phẩm của Nhà Gạo không chỉ là vật dụng mà còn là kết tinh của đất, lửa và bàn tay người thợ.
              <br />
              <br />
              Chúng tôi hy vọng bạn sẽ tìm thấy nguồn cảm hứng sống chậm, sống đẹp và trân trọng giá trị thủ công trong từng câu chuyện được kể.
            </p>
            <Link
              href="/about"
              className="inline-block mt-4 bg-[#A45A3F] text-white px-5 py-2 rounded-full hover:bg-[#8b4e35] transition"
            >
              Khám phá thêm
            </Link>
          </div>
        </div>
      </section>

      
      <section className="bg-[#2C2A24] text-white py-16 text-center">
        <h2 className="text-3xl font-serif font-semibold mb-4">Theo dõi Nhà Gạo</h2>
        <p className="text-[#D8D3CA] mb-8 text-lg">
          Cùng cập nhật các workshop, bộ sưu tập và ưu đãi đặc biệt mới nhất từ chúng tôi
        </p>
        <div className="flex justify-center gap-4 mb-8">
          <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition">
            <Image src="/facebook.png" alt="Facebook" width={20} height={20} />
          </a>
          <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition">
            <Image src="/instagram.png" alt="Instagram" width={20} height={20} />
          </a>
          <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition">
            <Image src="/tiktok.png" alt="Tiktok" width={20} height={20} />
          </a>
        </div>

        <form className="max-w-md mx-auto flex gap-2">
          <input
            type="email"
            placeholder="Nhập email của bạn..."
            className="flex-grow px-4 py-2 rounded-full text-black outline-none"
          />
          <button
            type="submit"
            className="bg-[#A45A3F] text-white px-6 py-2 rounded-full hover:bg-[#8b4e35] transition"
          >
            Đăng ký
          </button>
        </form>
      </section>
      */}
    </BaseLayout>
  );
}
