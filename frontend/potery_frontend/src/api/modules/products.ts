import { Product, ProductCategory, FlashSale } from '../../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const productApi = {
  // Lấy danh sách sản phẩm
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[]; total: number; page: number; limit: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // Lấy chi tiết sản phẩm
  getProductById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  // Lấy danh sách danh mục
  getCategories: async (): Promise<ProductCategory[]> => {
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // Lấy sản phẩm flash sale
  getFlashSaleProducts: async (): Promise<FlashSale[]> => {
    const response = await fetch(`${API_BASE_URL}/flashsale/active`);
    if (!response.ok) throw new Error('Failed to fetch flash sale products');
    return response.json();
  },

  // Lấy sản phẩm nổi bật
  getFeaturedProducts: async (limit: number = 8): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products/featured?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch featured products');
    return response.json();
  },

  // Lấy sản phẩm mới nhất
  getLatestProducts: async (limit: number = 8): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products/latest?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch latest products');
    return response.json();
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (query: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  }): Promise<Product[]> => {
    const queryParams = new URLSearchParams({ q: query });
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters?.rating) queryParams.append('rating', filters.rating.toString());

    const response = await fetch(`${API_BASE_URL}/products/search?${queryParams}`);
    if (!response.ok) throw new Error('Failed to search products');
    return response.json();
  }
};
