import { Product, ProductCategory, FlashSale } from '../../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    if (params?.limit) queryParams.append('size', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) {
      queryParams.append('search', params.search);
      queryParams.append('key', params.search);
    }
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products/listproduct${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    const raw = await response.json();

    // Backend trả về mảng sản phẩm (không có phân trang). Map sang kiểu Product frontend
    const products: Product[] = (Array.isArray(raw) ? raw : raw?.products || []).map((p: any): Product => {
      const images: string[] = Array.isArray(p.images)
        ? p.images
            .sort((a: any, b: any) => (a?.priority || 0) - (b?.priority || 0))
            .map((img: any) => (img?.image_data ? `data:image/jpeg;base64,${img.image_data}` : ''))
            .filter(Boolean)
        : [];

      return {
        id: String(p.id ?? p._id ?? ''),
        name: p.name ?? 'Sản phẩm',
        description: p.description ?? '',
        price: Number(p.price ?? 0),
        originalPrice: undefined,
        discount: undefined,
        images,
        category: p.category ?? '',
        rating: Number(p.rating ?? 5),
        reviewCount: Number(p.reviewCount ?? 0),
        stock: Number(p.quantity ?? p.stock ?? 0),
        isFlashSale: Boolean(p.isFlashSale),
        flashSalePrice: p.flashSalePrice ? Number(p.flashSalePrice) : undefined,
        flashSaleEndTime: p.flashSaleEndTime ? new Date(p.flashSaleEndTime) : undefined,
        supplier: {
          id: String(p.supplier_id ?? ''),
          name: p.supplier_name ?? 'Nhà cung cấp',
          logo: p.supplier_logo,
        },
        store: {
          id: String(p.store_id ?? ''),
          name: p.store_name ?? 'Cửa hàng',
          address: p.store_address ?? '',
        },
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      };
    });

    return {
      products,
      total: Number(raw?.total ?? products.length),
      page: Number(raw?.page ?? params?.page ?? 1),
      limit: Number(raw?.limit ?? params?.limit ?? products.length),
    };
  },

  // Lấy chi tiết sản phẩm
  getProductById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/productdetail/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    const p = await response.json();

    const images: string[] = Array.isArray(p.images)
      ? p.images
          .sort((a: any, b: any) => (a?.priority || 0) - (b?.priority || 0))
          .map((img: any) => (img?.image_data ? `data:image/jpeg;base64,${img.image_data}` : ''))
          .filter(Boolean)
      : [];

    return {
      id: String(p.id ?? p._id ?? ''),
      name: p.name ?? 'Sản phẩm',
      description: p.description ?? '',
      price: Number(p.price ?? 0),
      originalPrice: undefined,
      discount: undefined,
      images,
      category: p.category ?? '',
      rating: Number(p.rating ?? 5),
      reviewCount: Number(p.reviewCount ?? 0),
      stock: Number(p.quantity ?? p.stock ?? 0),
      isFlashSale: Boolean(p.isFlashSale),
      flashSalePrice: p.flashSalePrice ? Number(p.flashSalePrice) : undefined,
      flashSaleEndTime: p.flashSaleEndTime ? new Date(p.flashSaleEndTime) : undefined,
      supplier: {
        id: String(p.supplier_id ?? ''),
        name: p.supplier_name ?? 'Nhà cung cấp',
        logo: p.supplier_logo,
      },
      store: {
        id: String(p.store_id ?? ''),
        name: p.store_name ?? 'Cửa hàng',
        address: p.store_address ?? '',
      },
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    };
  },

  // Lấy danh mục (backend chưa có endpoint -> trả rỗng để tránh 404)
  getCategories: async (): Promise<ProductCategory[]> => {
    return [];
  },

  // Lấy sản phẩm flash sale
  getFlashSaleProducts: async (): Promise<FlashSale[]> => {
    const response = await fetch(`${API_BASE_URL}/flashsales/listflashsales`);
    if (!response.ok) throw new Error('Failed to fetch flash sale products');
    const data = await response.json();
    const mapProduct = (p: any): Product => {
      const images: string[] = Array.isArray(p.images)
        ? p.images
            .sort((a: any, b: any) => (a?.priority || 0) - (b?.priority || 0))
            .map((img: any) => (img?.image_data ? `data:image/jpeg;base64,${img.image_data}` : ''))
            .filter(Boolean)
        : [];

      return {
        id: String(p.id ?? p._id ?? ''),
        name: p.name ?? 'Sản phẩm',
        description: p.description ?? '',
        price: Number(p.price ?? 0),
        originalPrice: undefined,
        discount: undefined,
        images,
        category: p.category ?? '',
        rating: Number(p.rating ?? 5),
        reviewCount: Number(p.reviewCount ?? 0),
        stock: Number(p.quantity ?? p.stock ?? 0),
        isFlashSale: Boolean(p.isFlashSale ?? true),
        flashSalePrice: p.flashSalePrice ? Number(p.flashSalePrice) : undefined,
        flashSaleEndTime: p.flashSaleEndTime ? new Date(p.flashSaleEndTime) : undefined,
        supplier: {
          id: String(p.supplier_id ?? ''),
          name: p.supplier_name ?? 'Nhà cung cấp',
          logo: p.supplier_logo,
        },
        store: {
          id: String(p.store_id ?? ''),
          name: p.store_name ?? 'Cửa hàng',
          address: p.store_address ?? '',
        },
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      };
    };

    return (Array.isArray(data) ? data : []).map((fs: any): FlashSale => ({
      id: String(fs.id ?? fs._id ?? ''),
      title: fs.title ?? fs.name ?? 'Flash Sale',
      description: fs.description ?? '',
      startTime: fs.start_time ? new Date(fs.start_time) : new Date(),
      endTime: fs.end_time ? new Date(fs.end_time) : new Date(),
      isActive: Boolean(fs.is_active ?? true),
      products: Array.isArray(fs.products) ? fs.products.map(mapProduct) : [],
    }));
  },

  // Lấy sản phẩm nổi bật (fallback dùng listproduct + limit)
  getFeaturedProducts: async (limit: number = 8): Promise<Product[]> => {
    const { products } = await productApi.getProducts({ page: 1, limit });
    return products;
  },

  // Lấy sản phẩm mới nhất (fallback dùng listproduct + limit)
  getLatestProducts: async (limit: number = 8): Promise<Product[]> => {
    const { products } = await productApi.getProducts({ page: 1, limit });
    return products;
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
