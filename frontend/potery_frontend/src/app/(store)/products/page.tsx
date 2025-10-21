'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BaseLayout } from '../../../layouts';
import { ProductGrid } from '../../../components/feature/ProductGrid';
import { useProducts, useCategories } from '../../../hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton } from '@/components/feature';

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
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');

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
    if (filters.sortOrder) {
      result = result.sort((a, b) =>
        filters.sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      );
    }
    return result;
  }, [products, filters, search]);

  const handleCategoryChange = useCallback((value: string) => {
    // Don't reset page when changing category to maintain scroll position
    // setPage(1); // Remove this line to prevent jumping to top

    // Update filters immediately for smooth UI
    setFilters((f) => ({ ...f, category: value || undefined }));

    // Update URL without causing scroll to top
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }

    // Use replace instead of push to avoid adding to history and preventing scroll
    window.history.replaceState({}, '', `/products?${params.toString()}`);
  }, [searchParams]);

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
      {/* Banner - fix overflow */}
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

      {/* Layout chính */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 flex flex-col lg:flex-row gap-8 overflow-x-hidden">
        {/* Sidebar trái - Improved responsive design */}
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

          <div className="mt-6">
            <h3 className="text-xl font-bold mb-2">Sắp xếp theo</h3>
            <select
              value={filters.sortOrder || ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  sortOrder: e.target.value
                    ? (e.target.value as 'asc' | 'desc')
                    : undefined,
                }))
              }
              className="border rounded-lg px-3 py-2 w-full text-sm"
            >
              <option value="">Thứ tự mặc định</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Nội dung phải */}
        <div className="flex-1 lg:w-4/5 min-w-0">
          {/* Thanh tìm kiếm */}
          <div className="mb-6 relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm gốm bạn yêu thích..."
              className="w-full border rounded-full pl-12 pr-5 py-3 text-base focus:ring-2 focus:ring-[#c4975a] outline-none shadow-sm"
            />
            <img
              src="/MagnifyingGlass.png"
              alt="Tìm kiếm"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70"
            />
          </div>

          {/* Kết quả hiển thị */}
          <div className="mb-4 text-gray-600">
            Hiển thị {filteredProducts.length} sản phẩm
          </div>

          {/* Grid sản phẩm với smooth transition */}
          <div className="transition-opacity duration-200 ease-in-out">
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              error={error}
              onViewDetails={(p) => router.push(`/products/${p.id}`)}
              columns={3}
            />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
