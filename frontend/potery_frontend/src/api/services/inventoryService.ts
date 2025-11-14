// Lấy danh sách sản phẩm tồn kho của một cửa hàng
export const getStoreInventories = async (storeId: number): Promise<Inventory[]> => {
    const res = await axios.get(`${API_URL_INVENTORY}/list`, {
        params: { store_id: storeId }
    });
    return res.data?.data || [];
};

// Lấy chi tiết tồn kho (combo) của một sản phẩm tại một cửa hàng
export const getStoreProductInventoryDetails = async (storeId: number, productId: number): Promise<InventoryDetailsResponse | null> => {
    try {
        // Tìm inventory của sản phẩm tại cửa hàng
        const inventories = await getStoreInventories(storeId);
        const inventory = inventories.find(inv => inv.product_id === productId);
        if (!inventory) return null;
        // Lấy chi tiết combo
        const details = await getInventoryDetails(inventory.id);
        return details;
    } catch (error) {
        console.error('Error fetching store product inventory details:', error);
        return null;
    }
};
import axios from "axios";
// GIẢ ĐỊNH: Product và getProductImageUrl được import từ file productApi
// Bạn cần đảm bảo file productApi.ts (hoặc file chứa Product) tồn tại
import { Store } from "./storeService";

const API_URL_INVENTORY = "http://localhost:3000/inventory";
const API_URL_PRODUCTS = "http://localhost:3000/products";
const API_URL_STORES = "http://localhost:3000/stores";

// --- Interfaces (Tương thích với DTOs) ---

export interface ListInventoryDto {
    page?: number;
    size?: number;
    key?: string; // Sử dụng cho tìm kiếm chung
    product_id?: number;
    store_id?: number;
    // Bổ sung cho page.tsx
    fromDate?: string;
    toDate?: string;
}

export interface CreateInventoryDto {
    product_id: number | string | number[] | string[];
    store_id: number | string | number[] | string[];
    inventory_details?: InventoryDetailItemDto[];// Bắt buộc phải có
    quantity_stock?: number; 
    
}

export interface InventoryDetailItemDto {
    classification_attribute_relationship_id: number;
    quantity_stock: number;
    quantity_sold?: number;
}

export interface EnhancedInventoryFormData {
    product_id: number | string | number[] | string[];
    store_id: number | string | number[] | string[];
    inventory_details: InventoryDetailItemDto[]; // Bắt buộc phải có
}
// ... (Các interfaces khác giữ nguyên)

export interface UpdateInventoryDto {
    inventory_details?: InventoryDetailItemDto[];
    quantity_stock?: number;
    quantity_sold?: number;
}

export interface Inventory {
    
    id: number;
    product_id: number;
    store_id: number;
    quantity_stock: number;
    quantity_sold: number;
    created_at: string;
    updated_at: string;
    product_name?: string;
    store_name?: string;
    inventory_details?: InventoryDetailItemDto[];
}
export interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    category_id?: number;
    total_quantity_divided: number;
    // Chấp nhận cả url (string) hoặc image_data (Buffer/string Base64)
    images?: { url?: string; image_data?: string | { data: number[] } }[];
    main_image?: string | { data: number[] };
    relationships?: ProductRelationship[]; // Mảng các combo phân loại
    
    // (Optional) Nếu bạn dùng classifications trong code, cần update
    classifications?: any[]; // Hoặc định nghĩa type chi tiết hơn nếu cần
}
export interface ProductRelationship {
    id: number; // classification_attribute_relationship_id
    product_attribute_id_1: number;
    product_attribute_id_2: number;
    price: string | number; // Dùng string hoặc number tùy vào dữ liệu
    quantity: number;
    attribute1_name: string;
    attribute2_name: string;
}
export interface SelectOption {
    id: number;
    name: string;
}

export interface ProductClassification {
    id: number;
    name: string;
    price: number;
    quantity: number;
    product_attribute_id_1: number;
    product_attribute_id_2: number;
    attribute1_name: string;
    attribute2_name: string;
}
const bufferToBase64 = (buffer: { data: number[] }): string | null => {
    try {
        const binary = new Uint8Array(buffer.data).reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
        );
        return `data:image/png;base64,${btoa(binary)}`;
    } catch (error) {
        console.error("Error converting buffer to base64:", error);
        return null;
    }
};

// --- HÀM TRỢ GIÚP LẤY URL ẢNH CHUẨN HÓA (Được Export để dùng chung) ---
export const getProductImageUrl = (product: Product): string => {
    const firstImage = product.images?.[0];

    // 1. Kiểm tra URL trong trường images
    if (firstImage?.url && typeof firstImage.url === "string" && firstImage.url !== "") {
        return firstImage.url;
    }

    // 2. Kiểm tra URL/Buffer trong trường main_image
    if (product.main_image) {
        if (typeof product.main_image === "string" && product.main_image !== "") {
            return product.main_image;
        }
        if (typeof product.main_image === "object" && product.main_image !== null && "data" in product.main_image && Array.isArray(product.main_image.data)) {
            const base64Url = bufferToBase64(product.main_image as { data: number[] });
            if (base64Url) return base64Url;
        }
    }

    // 3. Kiểm tra dữ liệu Buffer/Base64 trong trường images
    if (firstImage?.image_data) {
        const imageData = firstImage.image_data;

        // Xử lý dữ liệu Buffer { data: number[] }
        if (typeof imageData === "object" && imageData !== null && "data" in imageData && Array.isArray(imageData.data)) {
            const base64Url = bufferToBase64(imageData as { data: number[] });
            if (base64Url) return base64Url;
        }

        // Xử lý chuỗi Base64
        else if (typeof imageData === "string" && imageData !== "") {
            return `data:image/png;base64,${imageData}`;
        }
    }

    // 4. Mặc định
    return "/no-image.jpg";
};


export const listInventories = async (
    dto: ListInventoryDto
): Promise<{ data: Inventory[]; total: number; page: number; size: number }> => {
    // Truyền các tham số lọc/phân trang/tìm kiếm lên backend
    const res = await axios.get(`${API_URL_INVENTORY}/list`, {
        params: dto
    });

    const responseData = res.data;
    if (responseData && (Array.isArray(responseData.data) || Array.isArray(responseData.items))) {
        return responseData;
    }
    if (Array.isArray(responseData)) {
        return { data: responseData, total: responseData.length, page: dto.page || 1, size: dto.size || 10 };
    }
    return { data: [], total: 0, page: 1, size: 10 };
};

export const createInventory = async (data: CreateInventoryDto) => {
  const payload = {
    ...data,
  };

  // ✅ Nếu sản phẩm không có phân loại, backend chỉ cần quantity_stock
  if (!payload.inventory_details || payload.inventory_details.length === 0) {
    delete payload.inventory_details;
  }

  const res = await axios.post(`${API_URL_INVENTORY}/createinventory`, payload);
  return res.data;
};


export const updateInventory = async (id: number, data: UpdateInventoryDto): Promise<Inventory> => {
    const res = await axios.put(`${API_URL_INVENTORY}/updateinventory/${id}`, data);
    return res.data;
};

export const deleteInventory = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL_INVENTORY}/deleteinventory/${id}`);
};

export interface InventoryDetailsResponse {
    inventory: Inventory;
    inventory_details: {
        id: number;
        classification_attribute_relationship_id: number;
        quantity_stock: number;
        quantity_sold: number;
        classification_attribute_relationship: object;
    }[];
    quantity_stock : number;
    quantity_sold : number;
}

export const getInventoryDetails = async (id: number): Promise<InventoryDetailsResponse> => {
    const res = await axios.get(`${API_URL_INVENTORY}/details/${id}`);
    return res.data;
};

export const listDropdownProducts = async (): Promise<SelectOption[]> => {
    const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`);
    const products: Product[] = res.data;
    return Array.isArray(products)
        ? products.map(p => ({ id: p.id as number, name: p.name }))
        : [];
};

// BỔ SUNG: Hàm lấy TẤT CẢ Product để hiển thị ảnh
export const listAllProducts = async (): Promise<Product[]> => {
    try {
        const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`);
        return res.data || [];
    } catch (error) {
        console.error("Lỗi khi tải tất cả sản phẩm:", error);
        return [];
    }
};

export const listDropdownStores = async (): Promise<SelectOption[]> => {
    const res = await axios.get(`${API_URL_STORES}/liststore`);
    const storesData = res.data.stores || res.data;
    const stores: Store[] = Array.isArray(storesData) ? storesData : [];
    return stores.map(s => ({ id: s.id as number, name: s.store_name }));
};

// Lấy danh sách sản phẩm có trong cửa hàng (có tồn kho)
export const listStoreProducts = async (storeId: number): Promise<SelectOption[]> => {
    try {
        const inventories = await getStoreInventories(storeId);
        const uniqueProducts = new Map<number, string>();

        // Lấy danh sách tất cả sản phẩm để lấy tên
        const allProducts = await listAllProducts();
        const productMap = new Map(allProducts.map(p => [p.id as number, p.name]));

        // Chỉ lấy sản phẩm có tồn kho
        inventories.forEach(inv => {
            if (inv.product_id && !uniqueProducts.has(inv.product_id)) {
                const productName = productMap.get(inv.product_id);
                if (productName) {
                    uniqueProducts.set(inv.product_id, productName);
                }
            }
        });

        return Array.from(uniqueProducts.entries()).map(([id, name]) => ({ id, name }));
    } catch (error) {
        console.error("Error fetching store products:", error);
        return [];
    }
};

// Get product classifications for a specific product
export const getProductClassifications = async (productId: number): Promise<ProductClassification[]> => {
    try {
        const res = await axios.get(`${API_URL_PRODUCTS}/classifications/${productId}`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error("Error fetching product classifications:", error);
        return [];
    }
};

// Transfer inventory interfaces and functions
export interface TransferInventoryDetailDto {
    classification_attribute_relationship_id: number;
    quantity: number;
}

export interface TransferInventoryDto {
    product_id: number;
    from_store_ids: number[] | 'all';
    to_store_ids: number[] | 'all';
    details?: TransferInventoryDetailDto[];
    quantity?: number;
}


// Chuyển combo phân loại giữa các cửa hàng
export const transferInventory = async (data: TransferInventoryDto): Promise<{ success: boolean; message: string }> => {
  // backend endpoint: POST /inventory/transfer
  const res = await axios.post(`${API_URL_INVENTORY}/transfer`, data);
  return res.data;
};