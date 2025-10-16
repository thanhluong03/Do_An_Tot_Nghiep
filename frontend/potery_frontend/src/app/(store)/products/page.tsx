'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseLayout } from '../../../layouts';
import { ProductGrid } from '../../../components/feature/ProductGrid';
import { useProducts, useCategories } from '../../../hooks/useProducts';
import { Search, ChevronDown, Filter } from 'lucide-react'; 

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 6;
  const { categories } = useCategories();

  const [filters, setFilters] = useState<{ category?: string; sortOrder?: 'asc' | 'desc' }>({});
  const [search, setSearch] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); 

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

      {/* Nội dung chính 2 CỘT được BỌC trong 1 THẺ KHỐI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* 💡 THẺ KHỐI ĐÃ BỌC TẤT CẢ - Đã áp dụng CSS sang trọng: nền trắng, bo góc, bóng mờ lớn */}
        <div className="bg-white rounded-xl shadow-2xl shadow-gray-300/50 p-6 md:p-10">
          
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* CỘT TRÁI: FILTER SIDEBAR (W-64, Tối giản) */}
            <aside className="w-full md:w-64 flex-shrink-0">
              {/* Mobile Filter Toggle */}
              <div className="md:hidden mb-6">
                <button
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 text-base font-semibold bg-gray-100 text-gray-800 border rounded-lg shadow-sm hover:bg-gray-200 transition duration-200"
                >
                  <Filter className="w-4 h-4" />
                  Bộ lọc & Sắp xếp
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMobileFilterOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
              </div>
              
              {/* Sidebar Content */}
              <div className={`space-y-10 md:block ${isMobileFilterOpen ? 'block' : 'hidden'}`}>
                
                {/* Bộ lọc Danh mục (Category) - Kiểu danh sách cao cấp */}
                <div className="border-b border-gray-100 pb-5">
                  <h3 className={`text-xl font-serif font-semibold mb-4 ${PRIMARY_COLOR} tracking-wider`}>
                    Danh mục
                  </h3>
                  <ul className="space-y-1.5 text-base">
                    <li 
                      className={`cursor-pointer p-2 rounded transition ${HOVER_BG} ${
                        !filters.category ? 'font-bold bg-gray-200 text-gray-900 border-l-4 border-[#8B4513]' : 'text-gray-600'
                      }`}
                      onClick={() => handleCategoryChange('')}
                    >
                      Tất cả sản phẩm
                    </li>
                    {categories.map((c) => (
                      <li
                        key={c.id}
                        className={`cursor-pointer p-2 rounded transition ${HOVER_BG} ${
                          filters.category === c.id.toString() ? 'font-bold bg-gray-200 text-gray-900 border-l-4 border-[#8B4513]' : 'text-gray-600'
                        }`}
                        onClick={() => handleCategoryChange(c.id.toString())}
                      >
                        {c.name}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sắp xếp (Sort Order) */}
                <div className="border-b border-gray-100 pb-5">
                  <h3 className={`text-xl font-serif font-semibold mb-4 ${PRIMARY_COLOR} tracking-wider`}>
                    Sắp xếp theo
                  </h3>
                  <div className="relative">
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
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-base bg-white appearance-none transition focus:ring-1 focus:ring-gray-500 pr-10 ${PRIMARY_COLOR}`}
                      >
                        <option value="">Thứ tự mặc định</option>
                        <option value="asc">Giá: Tăng dần</option>
                        <option value="desc">Giá: Giảm dần</option>
                      </select>
                      <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </aside>

            {/* CỘT PHẢI: PRODUCT GRID & SEARCH */}
            <main className="flex-grow">
              {/* Thanh tìm kiếm - Đặt ở đầu cột chính, hiện đại hơn */}
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm gốm bạn yêu thích..."
                  className={`w-full border-2 border-gray-300 rounded-full pl-12 pr-5 py-3 text-base focus:border-gray-500 outline-none transition shadow-sm ${PRIMARY_COLOR}`}
                />
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