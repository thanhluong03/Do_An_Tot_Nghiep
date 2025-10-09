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

// Hàm ánh xạ (mapping) sản phẩm từ API raw data sang kiểu Product frontend
// Lưu ý: Trường 'stock' sẽ được set tạm bằng 0 và được cập nhật sau từ Inventory API trong getProducts
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
    if (params?.category) axiosParams.category = params.category;
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
      const productsPromise = api.get('/products/listproduct', { params: axiosParams });
      
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
  getProductById: async (id: string): Promise<Product> => {
    try {
        const response = await api.get(`/products/productdetail/${id}`);
        let product = mapProduct(response.data);
        const inventoryList = await getInventoryList(); 
            const inventoryItem = inventoryList.find(item => item.product_id === id);
            product.stock = inventoryItem ? inventoryItem.quantity : 0;

        // Lấy tồn kho cho 1 sản phẩm cụ thể (Giả định có API /inventory/product/:id hoặc cần lọc từ list)
        // Nếu có API lấy tồn kho theo ID sản phẩm, ta sẽ dùng:
        /*
        const inventoryResponse = await api.get(`/inventory/product/${id}`);
        product.stock = Number(inventoryResponse.data?.quantity ?? 0);
        */
        
        // Hiện tại, ta sẽ bỏ qua bước này để giữ đơn giản, chỉ lấy thông tin có sẵn từ product API
        // Nếu API productdetail đã trả về trường quantity/stock, thì ta sẽ sửa mapProduct để dùng nó.
        
        // Nếu API Inventory có endpoint chi tiết:
        // const inventoryResponse = await api.get(`/inventory/detail/${id}`);
        // product.stock = Number(inventoryResponse.data?.quantity ?? 0);

        return product;
    } catch (error) {
      console.error(`Failed to fetch product with id ${id}:`, error);
      throw new Error('Failed to fetch product');
    }
  },

  // ... (Giữ nguyên các hàm khác)
  getCategories: async (): Promise<ProductCategory[]> => {
    return [];
  },

  // getFlashSaleProducts: async (): Promise<FlashSale[]> => {
  //       try {
  //           const response = await api.get('/flashsales/listflashsales');
  //           const data = response.data;
            
  //           const inventoryList = await getInventoryList();
  //           const inventoryMap = inventoryList.reduce((map, item) => {
  //               map.set(item.product_id, item.quantity);
  //               return map;
  //           }, new Map<string, number>());

  //           return (Array.isArray(data) ? data : []).map((fs: any): FlashSale => ({
  //               id: String(fs.id ?? fs._id ?? ''),
  //               title: fs.title ?? fs.name ?? 'Flash Sale',
  //               description: fs.description ?? '',
  //               startTime: fs.start_time ? new Date(fs.start_time) : new Date(),
  //               endTime: fs.end_time ? new Date(fs.end_time) : new Date(),
  //               isActive: Boolean(fs.is_active ?? true),
  //               products: Array.isArray(fs.products) 
  //                   ? fs.products.map((p: any) => {
  //                       // Ánh xạ sản phẩm và CẬP NHẬT STOCK ở đây
  //                       const product = mapProduct(p);
  //                       const stock = inventoryMap.get(product.id) ?? 0;
  //                       return { ...product, stock };
  //                   }) 
  //                   : [],
  //           }));
  //       } catch (error) {
  //           console.error('Failed to fetch flash sale products:', error);
  //           throw new Error('Failed to fetch flash sale products');
  //       }
  // },

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