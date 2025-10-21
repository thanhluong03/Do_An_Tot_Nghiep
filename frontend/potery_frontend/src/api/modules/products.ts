import axios from 'axios';
import { Product, ProductCategory, FlashSale } from '../../types';

// Cấu hình base URL cho axios instance
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
export interface StoreInventory {
    store_id: string;
    store_name: string;
    store_address: string;
    quantity_stock: number; // Tồn kho tại cửa hàng này
}

// Kiểu Product Detail chứa danh sách các Store Inventory
export interface ProductDetail extends Product {
    stores: StoreInventory[]; // Mảng các cửa hàng phân phối
    promotion: any;           // Dữ liệu promotion (nếu có)
}
const mapProductDetail = (p: any): ProductDetail => {
  const baseProduct = mapProduct(p);

  const stores: StoreInventory[] = Array.isArray(p.stores)
    ? p.stores.map((s: any) => ({
        store_id: String(s.store_id ?? ''),
        store_name: s.store_name ?? 'Cửa hàng',
        store_address: s.store_address ?? '',
        quantity_stock: Number(s.quantity_stock ?? 0),
      }))
    : [];

  const originalPrice = Number(p.price ?? 0);
  let currentPrice = originalPrice;

  // Nếu có promotion → tính toán giảm giá
  if (p.promotion && p.promotion.discount_type && p.promotion.discount_value) {
    const discountValue = Number(p.promotion.discount_value);
    if (p.promotion.discount_type === 'PERCENTAGE') {
      currentPrice = originalPrice * (1 - discountValue / 100);
    } else if (p.promotion.discount_type === 'FIXED') {
      currentPrice = Math.max(0, originalPrice - discountValue);
    }
  }

  const totalStock = stores.reduce((sum, s) => sum + s.quantity_stock, 0);

  return {
    ...baseProduct,
    id: String(p.id ?? p._id ?? ''),
    name: p.name ?? 'Sản phẩm',
    description: p.description ?? '',
    price: currentPrice, // ✅ giá sau giảm
    originalPrice: currentPrice < originalPrice ? originalPrice : undefined, // hiển thị nếu có giảm
    discount: currentPrice < originalPrice ? (originalPrice - currentPrice) / originalPrice : undefined,
    stock: totalStock,
    stores,
    promotion: p.promotion,
    isFlashSale: Boolean(p.promotion),
    flashSalePrice: currentPrice < originalPrice ? currentPrice : undefined,
    flashSaleEndTime: p.promotion?.end_date ? new Date(p.promotion.end_date) : undefined,
  };
};

// Hàm ánh xạ (mapping) sản phẩm từ API raw data sang kiểu Product frontend
// Lưu ý: Trường 'stock' sẽ được set tạm bằng 0 và được cập nhật sau từ Inventory API trong getProducts
const mapProduct = (p: any): Product => {
  const images: string[] = Array.isArray(p.images)
    ? p.images
        .sort((a: any, b: any) => (a?.priority || 0) - (b?.priority || 0))
        .map((img: any) => (img?.image_data ? `data:image/jpeg;base64,${img.image_data}` : ''))
        .filter(Boolean)
    : [];

  const originalPrice = Number(p.price ?? 0);
  let currentPrice = originalPrice;
  let discount: number | undefined = undefined;
  if (p.promotion && p.promotion.discount_type && p.promotion.discount_value) {
    const discountValue = Number(p.promotion.discount_value);
    if (p.promotion.discount_type === 'PERCENTAGE') {
      currentPrice = originalPrice * (1 - discountValue / 100);
    } else if (p.promotion.discount_type === 'FIXED') {
      currentPrice = Math.max(0, originalPrice - discountValue);
    }
    if (currentPrice < originalPrice) {
      discount = (originalPrice - currentPrice) / originalPrice;
    }
  }
  return {
    id: String(p.id ?? p._id ?? ''),
    name: p.name ?? 'Sản phẩm',
    description: p.description ?? '',
    price: currentPrice,
    originalPrice: currentPrice < originalPrice ? originalPrice : undefined,
    discount,
    images,
    category: p.category ?? '',
    rating: Number(p.rating ?? 5),
    reviewCount: Number(p.reviewCount ?? 0),
    // Tạm thời đặt stock là 0, sẽ được cập nhật sau từ Inventory API
    stock: Number(p.quantity_stock ?? p.quantity ?? 0), 
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
};


// --- API INVENTORY MỚI THÊM VÀO ---
interface InventoryItem {
    product_id: string; // Tên trường có thể khác (ví dụ: productId) - Giả định là product_id
    quantity: number;   // Tên trường có thể khác (ví dụ: stock) - Giả định là quantity
}

// Hàm lấy danh sách tồn kho
const getInventoryList = async (): Promise<InventoryItem[]> => {
    try {
        // Sử dụng endpoint /inventory/list từ log NestJS
        const response = await api.get('/inventory/list'); 
        // Giả định API Inventory trả về mảng hoặc đối tượng có trường items/data
        const rawData = response.data;
        const inventoryArray = Array.isArray(rawData) 
            ? rawData 
            : Array.isArray(rawData?.items) ? rawData.items 
            : Array.isArray(rawData?.data) ? rawData.data
            : [];
            
        return inventoryArray.map((item: any) => ({
            product_id: String(item.product_id ?? item.productId ?? ''), // Ánh xạ ID sản phẩm
            quantity: Number(item.quantity_stock ?? item.quantity ?? item.stock ?? 0),        // Ánh xạ số lượng tồn
        }));
    } catch (error) {
        console.error('Failed to fetch inventory list:', error);
        // Trả về mảng rỗng nếu thất bại để tránh lỗi dừng chương trình
        return []; 
    }
};
// -----------------------------------
export const productApi = {
  // Lấy danh sách sản phẩm và tích hợp số lượng tồn kho
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    minPrice?: number; // ĐÃ THÊM THAM SỐ
    maxPrice?: number;
  }): Promise<{ products: Product[]; total: number; page: number; limit: number }> => {
    
    // ... (Giữ nguyên phần chuẩn bị params)
    const axiosParams: Record<string, any> = {};
    if (params?.page) axiosParams.page = params.page;
    if (params?.limit) axiosParams.size = params.limit;
    let url = '/products/listproduct-by-inventory'; // Endpoint mặc định
      if (params?.category) {
          // Nếu có category, gọi endpoint category dynamic route
          url = `/products/listproduct-by-category/${params.category}`; // VÍ DỤ: /products/listproduct-by-category/bat dia 
      }
    if (params?.search) {
      axiosParams.search = params.search;
      axiosParams.key = params.search; 
    }
    if (params?.sortBy) axiosParams.sortBy = params.sortBy;
    if (params?.sortOrder) axiosParams.sortOrder = params.sortOrder;
    if (params?.minPrice) axiosParams.min_price = params.minPrice; 
    if (params?.maxPrice) axiosParams.max_price = params.maxPrice; 
    try {
      // 1. Gọi API lấy danh sách sản phẩm
      const productsPromise = api.get(url, { params: axiosParams });
      
      // 2. Gọi API lấy danh sách tồn kho (Có thể gọi đồng thời)
      const inventoryPromise = getInventoryList(); 

      const [productResponse, inventoryList] = await Promise.all([productsPromise, inventoryPromise]);

      const raw = productResponse.data;
      const productArray = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.products)
          ? raw.products
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.items)
              ? raw.items
              : Array.isArray(raw?.rows)
                ? raw.rows
                : [];
      
      // Ánh xạ sản phẩm ban đầu
      const products: Product[] = productArray.map(mapProduct);

      // Chuyển danh sách tồn kho thành Map để tra cứu nhanh
      const inventoryMap = inventoryList.reduce((map, item) => {
        map.set(item.product_id, item.quantity);
        return map;
      }, new Map<string, number>());
      
      // 3. Cập nhật số lượng tồn kho (stock) cho từng sản phẩm
      const finalProducts: Product[] = products.map(product => {
        // Lấy số lượng từ Map, nếu không tìm thấy thì đặt là 0
        const stock = inventoryMap.get(product.id) ?? 0;
        return {
          ...product,
          stock: stock,
        };
      });

      return {
        products: finalProducts,
        total: Number(raw?.total ?? raw?.count ?? finalProducts.length),
        page: Number(raw?.page ?? 1),
        limit: Number(raw?.limit ?? raw?.size ?? params?.limit ?? finalProducts.length),
      };
    } catch (error) {
      console.error('Failed to fetch products or inventory:', error);
      throw new Error('Failed to fetch products');
    }
  },

  // Lấy chi tiết sản phẩm (Cần thêm logic lấy tồn kho nếu muốn chính xác)
  getProductById: async (id: string): Promise<ProductDetail> => { // Thay đổi kiểu trả về thành ProductDetail
        try {
            // Endpoint giả định: /products/productdetail/:id
            const response = await api.get(`/products/productdetail-by-inventory/${id}`);
            
            // Sử dụng hàm ánh xạ chi tiết mới (mapProductDetail)
            const productDetail = mapProductDetail(response.data); 
            
            // Loại bỏ getInventoryList không cần thiết
            
            return productDetail;
        } catch (error) {
            console.error(`Failed to fetch product with id ${id}:`, error);
            throw new Error('Failed to fetch product');
        }
    },

  // ... (Giữ nguyên các hàm khác)
   getCategories: async (): Promise<ProductCategory[]> => {
        try {
            const response = await api.get('/categories/listcategory');
            const rawData = response.data;
            
            // Xử lý dữ liệu trả về: Backend có thể trả về một mảng trực tiếp, 
            // hoặc mảng nằm trong trường 'data', 'items', 'categories',...
            const categoriesArray = Array.isArray(rawData) 
                ? rawData 
                : Array.isArray(rawData?.data) ? rawData.data
                : Array.isArray(rawData?.items) ? rawData.items
                : Array.isArray(rawData?.categories) ? rawData.categories
                : [];

            return categoriesArray.map((c: any) => ({
                id: String(c.id ?? c._id ?? ''),
                name: c.name ?? 'Danh mục không tên',
                slug: c.slug ?? c.name, // Giả sử slug là tên (hoặc trường slug nếu có)
            }));
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            // Trả về mảng rỗng để tránh lỗi nếu API thất bại
            return []; 
        }
    },


  getFeaturedProducts: async (limit: number = 8): Promise<Product[]> => {
    const { products } = await productApi.getProducts({ page: 1, limit });
    return products;
  },

  getLatestProducts: async (limit: number = 8): Promise<Product[]> => {
    const { products } = await productApi.getProducts({ page: 1, limit, sortBy: 'createdAt', sortOrder: 'desc' });
    return products;
  },

  searchProducts: async (query: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  }): Promise<Product[]> => {
    const axiosParams: Record<string, any> = { q: query };
    if (filters?.category) axiosParams.category = filters.category;
    if (filters?.minPrice) axiosParams.minPrice = filters.minPrice;
    if (filters?.maxPrice) axiosParams.maxPrice = filters.maxPrice;
    if (filters?.rating) axiosParams.rating = filters.rating;

    try {
      const response = await api.get('/products/search', {
        params: axiosParams,
      });
      let products: Product[] = Array.isArray(response.data) ? response.data.map(mapProduct) : [];
      
      // Tích hợp tồn kho cho kết quả tìm kiếm
      const inventoryList = await getInventoryList();
      const inventoryMap = inventoryList.reduce((map, item) => {
          map.set(item.product_id, item.quantity);
          return map;
      }, new Map<string, number>());
      
      products = products.map(product => ({
          ...product,
          stock: inventoryMap.get(product.id) ?? 0,
      }));

      return products;
    } catch (error) {
      console.error('Failed to search products:', error);
      throw new Error('Failed to search products');
    }
  }
};