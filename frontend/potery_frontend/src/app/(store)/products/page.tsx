'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BaseLayout } from '../../../layouts';
import { ProductGrid } from '../../../components/feature/ProductGrid';
import { useProducts, useCategories } from '../../../hooks/useProducts';
import { Search, ChevronDown, Filter } from 'lucide-react'; 

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ lấy query từ URL
  const [page, setPage] = useState(1);
  const limit = 6;
  const { categories } = useCategories();

 const categoryFromUrl = searchParams.get('category') || undefined;
const [filters, setFilters] = useState<{ category?: string; sortOrder?: 'asc' | 'desc' }>({
  category: categoryFromUrl,
});

  const [search, setSearch] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); 

  // ✅ Khi load page hoặc query thay đổi → cập nhật category từ URL
  useEffect(() => {
    const categoryFromQuery = searchParams.get('category');
    if (categoryFromQuery && categoryFromQuery !== filters.category) {
      setFilters((f) => ({ ...f, category: categoryFromQuery }));
    }
  }, [searchParams, filters.category]);

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
  
  const handleCategoryChange = (categoryId: string) => {
    setFilters((f) => ({ ...f, category: categoryId || undefined }));
    setPage(1); 
  };

  const PRIMARY_COLOR = 'text-gray-900'; 
  const ACCENT_COLOR = '#8B4513'; 
  const HOVER_BG = 'bg-gray-50'; 

  // ✅ Khi người dùng chọn category từ dropdown, cập nhật cả URL
  const handleCategoryChange = (value: string) => {
    setFilters((f) => ({ ...f, category: value || undefined }));
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('category', value);
    else params.delete('category');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <BaseLayout>
      {/* Banner - Tinh tế và Tối giản */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw]">
        <img
          src="/bg-product.jpg"
          alt="Bộ sưu tập sản phẩm gốm sứ thủ công"
          className="w-full h-[300px] md:h-[400px] object-cover object-center"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/50 text-white text-center p-4">
          <h2 className="text-4xl md:text-6xl font-serif font-light tracking-widest mb-4 uppercase">
            Artisan Collection
          </h2>
          <p className="text-lg md:text-2xl font-light italic opacity-90">
            Nghệ thuật thủ công Việt
          </p>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Thanh tìm kiếm riêng */}
        <div className="flex justify-center mb-6 relative w-full">
          <div className="relative w-full md:w-11/12">
            <img
              src="/MagnifyingGlass.png"
              alt="Logo"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 opacity-70"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm gốm bạn yêu thích..."
              className="w-full border rounded-full pl-12 pr-5 py-3 text-base focus:ring-2 focus:ring-[#c4975a] outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Bộ sưu tập và sắp xếp ở dưới */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Bộ sưu tập */}
          <div className="flex items-center gap-2">
            <label className="text-gray-700 text-lg font-bold">Bộ sưu tập</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">Tất cả</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

              <h1 className="text-2xl font-serif font-light text-gray-700 mb-6 border-b border-gray-200 pb-2">
                  Hiển thị {filteredProducts.length} sản phẩm
              </h1>
              
              {/* Lưới sản phẩm */}
              <ProductGrid
                products={filteredProducts}
                loading={loading}
                error={error}
                onViewDetails={(p) => router.push(`/products/${p.id}`)}
                columns={3}
              />
            </main>
          </div>
        </div> 
        {/* 💡 KẾT THÚC THẺ KHỐI BỌC */}
      </div>
    </BaseLayout>
  );
}