'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseLayout } from '../../../layouts';
import { ProductGrid } from '../../../components/feature/ProductGrid';
import { useProducts, useCategories } from '../../../hooks/useProducts';
import { Product } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { cartApi } from '../../../api/modules/cart';

function ProductFilters({
  onChange,
  initial,
}: {
  onChange: (filters: { search?: string; category?: string; minPrice?: number; maxPrice?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }) => void;
  initial?: { search?: string; category?: string; minPrice?: number; maxPrice?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' };
}) {
  const { categories } = useCategories();
  const [search, setSearch] = useState(initial?.search ?? '');
  const [category, setCategory] = useState<string>(initial?.category ?? '');
  const [minPrice, setMinPrice] = useState<string>(initial?.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState<string>(initial?.maxPrice?.toString() ?? '');
  const [sortBy, setSortBy] = useState<string>(initial?.sortBy ?? '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initial?.sortOrder ?? 'asc');

  const apply = () => {
    onChange({
      search: search || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy || undefined,
      sortOrder,
    });
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        className="border rounded px-3 py-2"
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-3 py-2">
        <option value="">Tất cả danh mục</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug ?? c.name}>{c.name}</option>
        ))}
      </select>
      <input
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        placeholder="Giá tối thiểu"
        className="border rounded px-3 py-2"
        type="number"
      />
      <input
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        placeholder="Giá tối đa"
        className="border rounded px-3 py-2"
        type="number"
      />
      <div className="flex gap-2">
        <select title="Sắp xếp theo" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-2">
          <option value="">Mặc định</option>
          <option value="price">Giá</option>
          <option value="createdAt">Mới nhất</option>
          <option value="name">Tên</option>
        </select>
        <select title="Thứ tự" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="border rounded px-2">
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
        <button onClick={apply} className="bg-[#65604E] text-white px-4 rounded">Lọc</button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [filters, setFilters] = useState<{ search?: string; category?: string; minPrice?: number; maxPrice?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }>({});
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { products, loading, error, total } = useProducts({
    page,
    limit,
    category: filters.category,
    search: filters.search,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const onAddToCart = async (p: Product) => {
    if (!isAuthenticated || !user || !user.id) {
      setMessage('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    setAddingId(p.id);
    setMessage(null);
    try {
      await cartApi.add({ customer_id: user.id as string, product_id: p.id, quantity: 1 });
      setMessage('Đã thêm vào giỏ hàng');
    } catch (e) {
      setMessage('Không thể thêm vào giỏ hàng');
    } finally {
      setAddingId(null);
    }
  };
  const onViewDetails = (p: Product) => {
    router.push(`/products/${p.id}`);
  };

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Tất cả sản phẩm</h1>
        <ProductFilters 
          onChange={(f) => { setPage(1); setFilters(f); }}
          initial={filters} // Thiết lập giá trị category ban đầu
          />
        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
          columns={4}
        />

        {message && (
          <div className="mt-4 text-sm text-gray-700">{message}{addingId ? ` (${addingId})` : ''}</div>
        )}

        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-2 border rounded disabled:opacity-50">Trước</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-2 border rounded disabled:opacity-50">Sau</button>
        </div>
      </div>
    </BaseLayout>
  );
}


