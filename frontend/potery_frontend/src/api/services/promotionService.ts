// api/services/promotionService.ts
import axios from "axios";

// Đảm bảo API_URL này khớp với địa chỉ Backend của bạn (NestJS)
const API_URL = "http://localhost:3000/promotions"; 

// ================== Interfaces ==================
export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export interface Promotion {
    id?: number;
    name?: string;
    description?: string;
    discount_type?: DiscountType;
    discount_value?: number;
    // Sử dụng string cho input type="datetime-local"
    start_date?: string; 
    end_date?: string; 
    is_active?: boolean;
}

export interface PromotionListParams {
    page?: number;
    size?: number;
    key?: string;
}

/**
 * Hàm hỗ trợ chuyển đổi chuỗi datetime-local sang Date object (ISO format) cho Backend
 * Backend NestJS cần nhận giá trị Date object để validation @IsDate hoạt động.
 */
const toIsoDate = (datetimeLocalString?: string) => {
    if (!datetimeLocalString) return undefined;
    // Tạo Date Object từ chuỗi YYYY-MM-DDTHH:MM. 
    // Khi gửi qua JSON, nó sẽ tự động chuyển thành chuỗi ISO Date format.
    return new Date(datetimeLocalString);
};


// 🟢 1. Lấy danh sách promotion (GET: /promotions/listpromotion)
export const getPromotions = async (params: PromotionListParams = {}): Promise<Promotion[]> => {
    try {
        const res = await axios.get(`${API_URL}/listpromotion`, { params });
        // Backend trả về mảng các Promotion DTO
        const data = res.data || []; 
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Lỗi khi tải danh sách Promotion:", error);
        return [];
    }
};

// 🟢 2. Thêm promotion mới (POST: /promotions/createpromotion)
export const addPromotion = async (promotion: Promotion): Promise<Promotion> => {
    try {
        if (!promotion.start_date || !promotion.end_date) {
             throw new Error("Ngày/Giờ bắt đầu và kết thúc là bắt buộc.");
        }
        
        // Backend NestJS nhận MẢNG các DTO để hỗ trợ tạo nhiều bản ghi cùng lúc
        const payload = [
            {
                name: promotion.name,
                description: promotion.description,
                discount_type: promotion.discount_type,
                discount_value: Number(promotion.discount_value),
                is_active: promotion.is_active ?? true,
                // Chuyển string datetime-local sang Date object
                start_date: toIsoDate(promotion.start_date),
                end_date: toIsoDate(promotion.end_date),
            },
        ];

        const res = await axios.post(`${API_URL}/createpromotion`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        // Backend trả về mảng chứa kết quả, lấy phần tử đầu tiên
        const createdPromotion = res.data[0]?.promotion || res.data[0];
        
        if (createdPromotion && createdPromotion.id) {
            return createdPromotion;
        }
        
        throw new Error("Tạo Promotion thành công nhưng không nhận được dữ liệu phản hồi từ server.");

    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Lỗi Backend (Response Data):", error.response.data);
            throw new Error(`Thao tác thất bại: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
};

// 🟢 3. Cập nhật (PUT: /promotions/updatepromotion/:id)
export const updatePromotion = async (
    id: number,
    promotion: Partial<Promotion>
): Promise<Promotion> => {
    const updatePayload: any = { ...promotion };

    // Chuyển đổi các trường Date/Number nếu chúng tồn tại trong payload
    if (updatePayload.start_date) {
        updatePayload.start_date = toIsoDate(updatePayload.start_date);
    }
    if (updatePayload.end_date) {
        updatePayload.end_date = toIsoDate(updatePayload.end_date);
    }
    if (updatePayload.discount_value !== undefined) {
        updatePayload.discount_value = Number(updatePayload.discount_value);
    }
    
    // Xóa id trước khi gửi
    delete updatePayload.id;
    
    const res = await axios.put(`${API_URL}/updatepromotion/${id}`, updatePayload, {
        headers: { "Content-Type": "application/json" },
    });
    
    // Backend trả về mảng 1 phần tử
    return res.data[0]?.promotion || res.data[0];
};

// 🟢 4. Xóa (DELETE: /promotions/deletepromotion/:id)
export const deletePromotion = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/deletepromotion/${id}`);
};