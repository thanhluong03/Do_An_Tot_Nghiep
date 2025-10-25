'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BaseLayout } from '../../../layouts';
import { ProductGrid } from '../../../components/feature/ProductGrid';
import { useProducts, useCategories } from '../../../hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton, AIChatModal } from '@/components/feature';
import { Bot, Gift, MessageSquare, User } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const limit = 6;
  const { categories } = useCategories();

  const categoryFromUrl = searchParams.get('category') || undefined;
  const [filters, setFilters] = useState<{ category?: string; sortOrder?: 'asc' | 'desc' }>({
    category: categoryFromUrl,
  });
  // State mới để theo dõi nút sort nào đang active (cho UI)
  const [activeSortType, setActiveSortType] = useState<'default' | 'banchay' | 'gia'>('default');
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  useEffect(() => {
    const categoryFromQuery = searchParams.get('category');
    setFilters((prevFilters) => {
      if (categoryFromQuery !== prevFilters.category) {
        return { ...prevFilters, category: categoryFromQuery || undefined };
      }
      return prevFilters;
    });
  }, [searchParams]);

  const { products, loading, error, total } = useProducts({
    page,
    limit,
    category: filters.category,
  });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const filteredProducts = useMemo(() => {
    let result = products;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    // Logic sort giá vẫn được giữ nguyên
    if (filters.sortOrder) {
      result = result.sort((a, b) =>
        filters.sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      );
    }
    // TODO: Thêm logic sort "banchay" ở đây nếu cần
    return result;
  }, [products, filters, search]);

  const handleCategoryChange = useCallback((value: string) => {
    setFilters((f) => ({ ...f, category: value || undefined }));
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    window.history.replaceState({}, '', `/products?${params.toString()}`);
  }, [searchParams]);

  // === Handlers cho UI Sort mới ===
  // Xử lý khi chọn sort giá (giữ nguyên logic select)
  const handlePriceSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters((f) => ({
      ...f,
      sortOrder: value ? (value as 'asc' | 'desc') : undefined,
    }));
    // Cập nhật UI
    setActiveSortType(value ? 'gia' : 'default');
  };

  // Xử lý khi bấm "Bán chạy"
  const handleBestSellingClick = () => {
    setActiveSortType('banchay');
    // Reset sort giá, vì logic 'banchay' chưa có trong useMemo
    setFilters(f => ({ ...f, sortOrder: undefined }));
    // GHI CHÚ: Logic sort 'banchay' gốc không có trong useMemo.
    // Nếu cần, bạn phải thêm vào useMemo.
  };

  return (
    <BaseLayout>
      {/* === Popup Layer === (Giữ nguyên) */}
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
      {/* Banner (Giữ nguyên) */}
      <div className="relative w-full overflow-x-hidden">
        <img
          src="/bg-product.jpg"
          alt="Bộ sưu tập sản phẩm"
          className="w-full h-[260px] md:h-[340px] object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/30 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">
            Bộ sưu tập sản phẩm
          </h2>
          <p className="text-base md:text-lg">Tinh tế – Mộc mạc – Đậm hơi thở thủ công Việt</p>
        </div>
      </div>

      {/* Layout chính (Giữ nguyên) */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 flex flex-col lg:flex-row gap-8 overflow-x-hidden">
        {/* === Sidebar trái (Giữ nguyên logic Danh mục) === */}
        <div className="w-full lg:w-1/5 lg:min-w-[240px]">
          <h3 className="text-xl font-bold mb-4">Danh mục</h3>
          <ul className="space-y-2 mb-6">
            <li
              className={`cursor-pointer px-3 py-2 rounded-lg transition ${!filters.category
                ? 'bg-[#f7f4ef] border-l-4 border-[#b47d32] font-semibold'
                : 'hover:bg-[#f7f4ef]'
                }`}
              onClick={() => handleCategoryChange('')}
            >
              Tất cả sản phẩm
            </li>
            {categories.map((c) => (
              <li
                key={c.id}
                onClick={() => handleCategoryChange(c.id.toString())}
                className={`cursor-pointer px-3 py-2 rounded-lg transition ${filters.category === c.id.toString()
                  ? 'bg-[#f7f4ef] border-l-4 border-[#b47d32] font-semibold'
                  : 'hover:bg-[#f7f4ef]'
                  }`}
              >
                {c.name}
              </li>
            ))}
          </ul>

          {/* Phần Sắp xếp đã được di chuyển sang phải */}
        </div>

        {/* === Nội dung phải (Đã cập nhật) === */}
        <div className="flex-1 lg:w-4/5 min-w-0">
          {/* === Thanh Filter & Tìm kiếm mới === */}
         <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-3">
  {/* Cụm Sắp xếp (Thêm w-full md:w-auto) */}
  <div className="w-full md:w-auto flex items-center gap-3 flex-wrap">
    <span className="text-sm font-medium text-gray-700">
      Sắp xếp theo
    </span>
    <button
      onClick={handleBestSellingClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
        activeSortType === 'banchay'
          ? 'bg-orange-600 text-white shadow-sm'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      Bán chạy
    </button>

    {/* Giữ nguyên logic <select> cho Sắp xếp giá, nhưng style lại */}
    <div className="relative">
      <select
        title='sort'
        value={filters.sortOrder || ''}
        onChange={handlePriceSortChange}
        className={`appearance-none px-4 py-2 pr-8 rounded-md text-sm font-medium transition cursor-pointer ${
          activeSortType === 'gia'
            ? 'bg-orange-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      >
        {/* Đổi "Thứ tự mặc định" thành "Giá" cho giống ảnh */}
        <option value="">Giá</option>
        <option value="asc">Giá tăng dần</option>
        <option value="desc">Giá giảm dần</option>
      </select>
      {/* Icon dropdown tùy chỉnh */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg
          className={`w-4 h-4 ${activeSortType === 'gia' ? 'text-white' : 'text-gray-600'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>

  {/* Thanh Tìm kiếm (Thay w-full bằng w-full md:flex-1) */}
  <div className="relative w-full md:flex-1">
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Tìm kiếm sản phẩm..."
      className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
    />
    <img
      src="/MagnifyingGlass.png" // Sử dụng icon cũ
      alt="Tìm kiếm"
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
    />
  </div>
</div>
          {/* === Hết Thanh Filter & Tìm kiếm === */}


          {/* Kết quả hiển thị (Giữ nguyên) */}
          <div className="mb-4 text-gray-600">
            Hiển thị {filteredProducts.length} sản phẩm
          </div>

          {/* Grid sản phẩm (Giữ nguyên) */}
          <div className="transition-opacity duration-200 ease-in-out">
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              error={error}
              onViewDetails={(p) => router.push(`/products/${p.id}`)}
              columns={3} // Bạn có thể chỉnh số cột ở đây
            />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}