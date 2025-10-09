import { useState, useEffect } from 'react';
import { productApi } from '../api/modules/products';
import { Product, ProductCategory, FlashSale } from '../types';

export const useProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productApi.getProducts(params);
        let filtered = [...response.products];

        // --- Lọc theo giá tại FE ---
        if (params?.minPrice != null) {
          filtered = filtered.filter(p => p.price >= params.minPrice!);
        }
        if (params?.maxPrice != null) {
          filtered = filtered.filter(p => p.price <= params.maxPrice!);
        }

        // --- Sắp xếp theo giá / tên / createdAt ---
        if (params?.sortBy) {
          filtered.sort((a, b) => {
            const order = params.sortOrder === 'desc' ? -1 : 1;

            if (params.sortBy === 'price') {
              return (a.price - b.price) * order;
            }
            if (params.sortBy === 'name') {
              return a.name.localeCompare(b.name) * order;
            }
            if (params.sortBy === 'createdAt') {
              return (a.createdAt.getTime() - b.createdAt.getTime()) * order;
            }
            return 0;
          });
        }

        setProducts(filtered);
        setTotal(filtered.length); // tổng sau khi lọc
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    params?.page,
    params?.limit,
    params?.category,
    params?.search,
    params?.sortBy,
    params?.sortOrder,
    params?.minPrice,
    params?.maxPrice,
  ]);

  return { products, loading, error, total };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export const useFlashSale = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getFlashSaleProducts();
        setFlashSales(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  return { flashSales, loading, error };
};

export const useFeaturedProducts = (limit: number = 8) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getFeaturedProducts(limit);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [limit]);

  return { products, loading, error };
};
