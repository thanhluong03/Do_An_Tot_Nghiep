import axios from "axios";

// Đổi URL nếu server của bạn chạy ở port khác
const API_URL = "http://localhost:3000/flashsales";

// ================== Interfaces ==================
export interface FlashSale {
    id?: number;
    name?: string;
    // start_time/end_time ở đây là 2 vai trò khác nhau:
    // 1. Dùng cho input form (datetime-local string) trong Frontend.
    // 2. Dùng để gửi GIỜ (HH:MM:SS) lên Backend DTO.
    start_time?: string; 
    end_time?: string;
    is_active?: boolean;
    // effective_period_begins/ends là các trường ISO Date string/Date object mà Backend lưu/trả về
    effective_period_begins?: string;
    effective_period_ends?: string;
    flash_sale_price?: number;
    quantity?: number;
    created_at?: string;
    updated_at?: string;
}

// ================== API CALLS ==================

/**
 * Hàm hỗ trợ tách chuỗi datetime-local thành Ngày (Date Object) và Giờ (HH:MM:SS String)
 * @param datetimeLocalString Chuỗi từ input HTML (YYYY-MM-DDTHH:MM)
 * @returns { dateObject: Date, timeString: string }
 */
const parseDatetimeLocal = (datetimeLocalString?: string) => {
    let dateObject: Date | undefined = undefined;
    let timeString: string | undefined = undefined;

    if (datetimeLocalString) {
        // new Date() xử lý chuỗi YYYY-MM-DDTHH:MM như local time
        const date = new Date(datetimeLocalString);
        
        if (!isNaN(date.getTime())) {
            // 1. Date Object cho effective_period_begins/ends (Backend sẽ lưu thành ISO string)
            dateObject = date;

            // 2. Chuỗi Giờ (HH:MM) + thêm :00 cho start_time/end_time
            const timePart = datetimeLocalString.split('T')[1];
            if (timePart) {
                // Backend DTO yêu cầu HH:MM:SS
                timeString = `${timePart}:00`; 
            }
        }
    }

    return { dateObject, timeString };
};


// 🟢 Lấy danh sách flash sale
export const getFlashSales = async (): Promise<FlashSale[]> => {
    try {
        const res = await axios.get(`${API_URL}/listflashsales`);
        const data = res.data.data || res.data.flashSales || res.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Lỗi khi tải danh sách Flash Sale:", error);
        return [];
    }
};

// 🟢 Thêm flash sale mới (Đã sửa lỗi đồng bộ DTO: Tách Ngày và Giờ)
export const addFlashSale = async (flashSale: FlashSale): Promise<FlashSale> => {
    try {
        // Tách Ngày và Giờ cho Thời gian Bắt đầu
        const { 
            dateObject: effectiveBegins, 
            timeString: startTimePart 
        } = parseDatetimeLocal(flashSale.start_time);

        // Tách Ngày và Giờ cho Thời gian Kết thúc
        const { 
            dateObject: effectiveEnds, 
            timeString: endTimePart 
        } = parseDatetimeLocal(flashSale.end_time);

        if (!effectiveBegins || !effectiveEnds || !startTimePart || !endTimePart) {
            throw new Error("Dữ liệu Ngày/Giờ không hợp lệ. Vui lòng kiểm tra lại định dạng.");
        }

        // Chuẩn hóa Payload gửi đi (Gửi 4 trường)
        const payload = [
            {
                name: flashSale.name,
                flash_sale_price: Number(flashSale.flash_sale_price),
                quantity: Number(flashSale.quantity),
                is_active: flashSale.is_active ?? true,
                
                // Gửi Giờ (HH:MM:SS) cho start_time/end_time
                start_time: startTimePart, 
                end_time: endTimePart,     
                
                // Gửi Date object (thành ISO String) cho effective_period_begins/ends
                effective_period_begins: effectiveBegins,
                effective_period_ends: effectiveEnds,
            },
        ];

        const res = await axios.post(`${API_URL}/createflashsale`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        const createdSale = res.data[0]?.flashSale || res.data[0] || res.data;
        
        if (createdSale && createdSale.id) {
            return createdSale;
        }
        
        throw new Error("Tạo Flash Sale thành công nhưng không nhận được ID từ server.");

    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Lỗi Backend (Response Data):", error.response.data);
            throw new Error(`Thao tác thất bại: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
};

// 🟢 Cập nhật (Đã sửa lỗi đồng bộ DTO: Tách Ngày và Giờ)
export const updateFlashSale = async (
    id: number,
    flashSale: Partial<FlashSale>
): Promise<FlashSale> => {
    const updatePayload: any = { ...flashSale };

    // Xử lý Ngày Giờ Bắt đầu
    if (flashSale.start_time) {
        const { dateObject, timeString } = parseDatetimeLocal(flashSale.start_time);
        updatePayload.start_time = timeString;
        updatePayload.effective_period_begins = dateObject;
    } else {
        delete updatePayload.start_time;
    }

    // Xử lý Ngày Giờ Kết thúc
    if (flashSale.end_time) {
        const { dateObject, timeString } = parseDatetimeLocal(flashSale.end_time);
        updatePayload.end_time = timeString;
        updatePayload.effective_period_ends = dateObject;
    } else {
        delete updatePayload.end_time;
    }

    const res = await axios.put(`${API_URL}/updateflashsale/${id}`, updatePayload, {
        headers: { "Content-Type": "application/json" },
    });
    
    return res.data[0]?.flashSale || res.data;
};

// 🟢 Xóa
export const deleteFlashSale = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/deleteflashsale/${id}`);
};