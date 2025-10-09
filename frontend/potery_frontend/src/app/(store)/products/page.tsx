'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseLayout } from '../../../layouts';
import { ProductGrid } from '../../../components/feature/ProductGrid';
import { useProducts, useCategories } from '../../../hooks/useProducts';
import { Product } from '../../../types';

function ProductFilters({
  onChange,
  initial,
}: {
  onChange: (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => void;
  initial?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}) {
  const { categories } = useCategories();
  const [category, setCategory] = useState(initial?.category ?? '');
  const [minPrice, setMinPrice] = useState(initial?.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice?.toString() ?? '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initial?.sortOrder ?? 'asc');

  const apply = () => {
    onChange({
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortOrder,
    });
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="">Tất cả danh mục</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id.toString()}>
            {c.name}
          </option>
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
      <select
        title="Thứ tự"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
        className="border rounded px-3 py-2"
      >
        <option value="asc">Tăng dần</option>
        <option value="desc">Giảm dần</option>
      </select>
      <button onClick={apply} className="bg-[#65604E] text-white px-4 rounded">
        Lọc
      </button>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [filters, setFilters] = useState<{
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>({});

  const [search, setSearch] = useState('');

  const { products, loading, error, total } = useProducts({
    page,
    limit,
    category: filters.category,
  });

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // ✅ SEARCH + FILTER + SORT LOCAL
  const filteredProducts = useMemo(() => {
    const lowerCaseQuery = search.toLowerCase().trim();

    let result = products.filter((p) => {
      const searchMatch =
        !lowerCaseQuery ||
        p.name.toLowerCase().includes(lowerCaseQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerCaseQuery));
      return searchMatch;
    });

    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.sortOrder) {
      result = result.sort((a, b) =>
        filters.sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      );
    }

    return result;
  }, [products, search, filters]);

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Tất cả sản phẩm</h1>

        {/* --- THANH TÌM KIẾM --- */}
        <div className="mb-6 flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {/* --- LỌC NÂNG CAO --- */}
        <ProductFilters
          onChange={(f) => {
            setPage(1);
            setFilters(f);
          }}
          initial={filters}
        />

        {/* --- GRID SẢN PHẨM --- */}
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          error={error}
          onAddToCart={() => {}}
          onViewDetails={(p) => router.push(`/products/${p.id}`)}
          columns={4}
        />

        {/* --- PHÂN TRANG --- */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </BaseLayout>
  );
}
