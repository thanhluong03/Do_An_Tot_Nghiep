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
    inventory_details: InventoryDetailItemDto[]; // Bắt buộc phải có
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

export const createInventory = async (data: CreateInventoryDto): Promise<Inventory> => {
    const res = await axios.post(`${API_URL_INVENTORY}/createinventory`, data);
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