// src/api/services/promotionService.ts
import axios from "axios";

// Giả định API_URL
const API_URL = "http://localhost:3000/promotions"; 
const API_URL_PRODUCTS = "http://localhost:3000/products"; 

// ================== Interfaces ==================
export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export interface Product { 
    id: number; 
    name: string; 
    // Thêm các trường cần thiết để khớp với giao diện Product trong thực tế
    price?: number; 
    quantity?: number;
    images?: { 
        id?: number;
        url?: string; 
        image_data?: string | { data: number[] };
        is_main_image?: boolean;
        priority?: number;
    }[]; 
    main_image?: string | { data: number[] };
    imageUrl?: string; // Để tương thích với SelectOption
    categoryId?: number;
}

export interface Promotion { 
    id?: number; 
    name?: string; 
    description?: string; 
    discount_type?: DiscountType; 
    discount_value?: number; 
    start_date?: string; 
    end_date?: string; 
    is_active?: boolean;
}

export interface ProductPromotionAssignment {
    productId: number;
    promotionId: number | null; 
    product?: Product; // QUAN TRỌNG: Thông tin chi tiết sản phẩm
}

// Interface này được dùng cho CheckboxList
export interface SelectOption {
    id: number | string; 
    name: string;
    imageUrl?: string; 
    categoryId?: number | null; 

}


const toIsoDate = (datetimeLocalString?: string) => {
    if (!datetimeLocalString) return undefined;
    // Chuyển đổi sang format mà NestJS/Backend mong muốn
    return datetimeLocalString.replace('T', ' ') + ':00'; 
};


// --- HÀM TRỢ GIÚP CHUYỂN BUFFER -> BASE64 ---
const bufferToBase64 = (buffer: { data: number[] }): string | null => {
    try {
        const binary = new Uint8Array(buffer.data).reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
        );
        return `data:image/png;base64,${btoa(binary)}`;
    } catch {
        return null;
    }
};

// --- HÀM TRỢ GIÚP LẤY URL ẢNH CHUẨN HÓA ---
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

// ================== API Calls ==================

export const getPromotions = async (params: Record<string, unknown> = {}): Promise<Promotion[]> => { 
    try {
        const res = await axios.get(`${API_URL}/listpromotion`, { params });
        return res.data;
    } catch (error) {
        console.error("Lỗi khi tải danh sách Promotion:", error);
        return [];
    }
};

export const addPromotion = async (promotion: Promotion): Promise<Promotion> => { 
    const payload = [{
        ...promotion,
        start_date: toIsoDate(promotion.start_date),
        end_date: toIsoDate(promotion.end_date),
    }];
    const res = await axios.post(`${API_URL}/createpromotion`, payload);
    return res.data[0].promotion;
};

export const updatePromotion = async (id: number, promotion: Partial<Promotion>): Promise<Promotion> => { 
    const res = await axios.put(`${API_URL}/updatepromotion/${id}`, {
        ...promotion,
        start_date: toIsoDate(promotion.start_date),
        end_date: toIsoDate(promotion.end_date),
    });
    return res.data[0].promotion;
};

export const deletePromotion = async (id: number): Promise<void> => { 
    await axios.delete(`${API_URL}/deletepromotion/${id}`);
};

export const listProducts = async (dto: { page: number, size: number }): Promise<{ data: Product[]; total: number; page: number; size: number }> => {
    try {
        const res = await axios.get(`${API_URL_PRODUCTS}/listproduct`, { params: dto });
        if (res.data.data && Array.isArray(res.data.data)) {
            return res.data;
        }
        const list: Product[] = res.data || [];
        return { data: list, total: list.length, page: 1, size: 1000 };
    } catch (error) {
        console.error("Lỗi tải danh sách Products:", error);
        return { data: [], total: 0, page: 1, size: 1000 };
    }
};

export const listDropdownProducts = async (): Promise<SelectOption[]> => {
    const res = await listProducts({ page: 1, size: 1000 });
    const products: Product[] = Array.isArray(res.data) ? res.data : (res.data as { data: Product[] })?.data || []; 
    
    return Array.isArray(products) 
        ? products.map(p => ({ 
              id: p.id as number, 
              name: p.name,
              imageUrl: getProductImageUrl(p) ,
              categoryId: p.categoryId || null,
          })) 
        : [];
};

// LẤY DANH SÁCH SẢN PHẨM & KHUYẾN MÃI ĐANG ÁP DỤNG (ĐÃ CẬP NHẬT LOGIC)
// Mục tiêu: Luôn trả về TẤT CẢ SẢN PHẨM, kèm theo promotionId (nếu có) và ảnh chính
export const getAllProductsWithPromotions = async (): Promise<ProductPromotionAssignment[]> => {
    try {
        // 1. Lấy danh sách TẤT CẢ sản phẩm cơ bản (để đảm bảo list không trống)
        const productOptions: SelectOption[] = await listDropdownProducts(); 

        // 2. Lấy danh sách gán khuyến mãi hiện tại với ảnh từ API backend
        let assignmentMap = new Map<number, number | null>();
        const productImagesMap = new Map<number, { url?: string; image_data?: string; is_main_image?: boolean }[]>();
        
        try {
            const res = await axios.get(`${API_URL}/listproductpromotions`);
            // API này trả về mảng các đối tượng ProductPromotionAssignment với ảnh đầy đủ
            interface BackendAssignment {
                productId: number;
                promotionId: number | null;
                product?: {
                    id: number;
                    name: string;
                    images?: { url?: string; image_data?: string; is_main_image?: boolean }[];
                };
            }
            
            const currentAssignments: BackendAssignment[] = Array.isArray(res.data) 
                ? res.data 
                : (res.data.data || []); 
            
            assignmentMap = new Map(currentAssignments.map(a => [a.productId, a.promotionId]));
            
            // Lưu thông tin ảnh từ backend
            currentAssignments.forEach(a => {
                if (a.product && a.product.images && Array.isArray(a.product.images)) {
                    productImagesMap.set(a.productId, a.product.images);
                }
            });
        } catch (assignmentError) {
            console.warn("Không thể tải danh sách gán khuyến mãi hiện tại từ /listproductpromotions. Coi như tất cả là NULL.", assignmentError);
            // Tiếp tục với Map trống/null nếu API gán bị lỗi
        }

        // 3. Map list sản phẩm đầy đủ sang format ProductPromotionAssignment, áp dụng promotionId và images từ Map
        return productOptions.map(opt => {
            const images = productImagesMap.get(opt.id as number) || [];
            
            return {
                productId: opt.id as number,
                promotionId: assignmentMap.get(opt.id as number) || null, // Lấy ID khuyến mãi hoặc null
                product: { 
                    id: opt.id as number, 
                    name: opt.name, 
                    imageUrl: opt.imageUrl, // Giữ imageUrl từ dropdown
                    images: images, // Thêm mảng images từ backend
                    categoryId: opt.categoryId || null,
                } as Product, 
            };
        });
        
    } catch (error: unknown) {
        console.error("Lỗi nghiêm trọng khi tải danh sách Sản phẩm và gán:", error);
        return []; // Trả về mảng rỗng nếu có lỗi tổng thể
    }
};


// Gán/Hủy gán Khuyến mãi cho Sản phẩm
export const setProductPromotionAssignments = async (
    assignments: { productId: number, promotionId: number | null }[]
): Promise<{ message: string }> => {
    try {
        const payload = { assignments }; 
        const res = await axios.post(`${API_URL}/setproductpromotion`, payload, {
            headers: { "Content-Type": "application/json" },
        });
        return res.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Lỗi Backend (Response Data):", error.response.data);
            throw new Error(`Thao tác gán thất bại: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
};