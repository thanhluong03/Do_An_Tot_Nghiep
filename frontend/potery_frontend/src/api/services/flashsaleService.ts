import axios from "axios";

const API_URL = "http://localhost:3000/flashsales";
export interface FlashSale {
    id?: number;
    name?: string;
    start_time?: string; 
    end_time?: string;
    is_active?: boolean;
    effective_period_begins?: string;
    effective_period_ends?: string;
    flash_sale_price?: number;
    quantity?: number;
}

export interface FlashSaleListParams {
    page?: number;
    size?: number;
    key?: string;
}

const parseDatetimeLocal = (datetimeLocalString?: string) => {
    let dateObject: Date | undefined = undefined;
    let timeString: string | undefined = undefined;

    if (datetimeLocalString) {
        const date = new Date(datetimeLocalString);
        
        if (!isNaN(date.getTime())) {
            // Lấy ngày (chuỗi ISO)
            const datePart = date.toISOString().split('T')[0];
            // Lấy giờ (chuỗi HH:MM từ input, thêm :00 giây)
            const timePart = datetimeLocalString.split('T')[1];
            
            if (datePart) {
                // Tạo Date object chỉ chứa ngày
                dateObject = new Date(datePart);
            }

            if (timePart) {
                // Định dạng giờ thành HH:MM:SS
                timeString = `${timePart}:00`; 
            }
        }
    }
    return { dateObject, timeString: timeString || "" };
};


export const getFlashSales = async (params: FlashSaleListParams = {}): Promise<FlashSale[]> => {
    try {
        
        const res = await axios.get(`${API_URL}/listflashsales`, { params });
        const data = res.data.data || res.data.flashSales || res.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Lỗi khi tải danh sách Flash Sale:", error);
        return [];
    }
};

export const addFlashSale = async (flashSale: FlashSale): Promise<FlashSale> => {
    try {
        const { dateObject: effectiveBegins, timeString: startTimePart } = parseDatetimeLocal(flashSale.start_time);
        const { dateObject: effectiveEnds, timeString: endTimePart } = parseDatetimeLocal(flashSale.end_time);

        if (!effectiveBegins || !effectiveEnds || !startTimePart || !endTimePart) {
            throw new Error("Dữ liệu Ngày/Giờ không hợp lệ. Vui lòng kiểm tra lại định dạng.");
        }


        const payload = [
            {
                name: flashSale.name,
                flash_sale_price: Number(flashSale.flash_sale_price),
                quantity: Number(flashSale.quantity), // ✅ Đã bao gồm quantity
                is_active: flashSale.is_active ?? true,
                
                start_time: startTimePart, 
                end_time: endTimePart,    
                
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
export const updateFlashSale = async (
    id: number,
    flashSale: Partial<FlashSale>
): Promise<FlashSale> => {
    const updatePayload: any = { ...flashSale };

    // Đảm bảo quantity được gửi đi dưới dạng number nếu có
    if (updatePayload.quantity !== undefined) {
        updatePayload.quantity = Number(updatePayload.quantity);
    }
    
    // Xử lý Ngày Giờ Bắt đầu
    if (flashSale.start_time) {
        const { dateObject, timeString } = parseDatetimeLocal(flashSale.start_time);
        if (dateObject && timeString) {
            updatePayload.start_time = timeString;
            updatePayload.effective_period_begins = dateObject;
        }
    } else {
        delete updatePayload.start_time; 
        delete updatePayload.effective_period_begins; 
    }

    // Xử lý Ngày Giờ Kết thúc
    if (flashSale.end_time) {
        const { dateObject, timeString } = parseDatetimeLocal(flashSale.end_time);
        if (dateObject && timeString) {
            updatePayload.end_time = timeString;
            updatePayload.effective_period_ends = dateObject;
        }
    } else {
        delete updatePayload.end_time;
        delete updatePayload.effective_period_ends;
    }

    delete updatePayload.id;
    
    const res = await axios.put(`${API_URL}/updateflashsale/${id}`, updatePayload, {
        headers: { "Content-Type": "application/json" },
    });
    
    return res.data?.flashSale || res.data;
};

export const deleteFlashSale = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/deleteflashsale/${id}`);
};