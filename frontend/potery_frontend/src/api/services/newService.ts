// src/api/services/newsService.ts
// *Yêu cầu: Đã cài đặt Axios. Giả định BASE_URL = http://localhost:3000*

import axios, { AxiosResponse } from "axios";

const API_URL = "http://localhost:3000/news"; // Controller path là '/news'

// --- INTERFACES (Dựa trên ICreateNews, IUpdateNews, IListNews) ---

export interface News {
    id: number;
    title: string;
    content: string;
    published_at: string; // NestJS trả về Date, Front-end thường nhận string
    is_published: boolean;
    user_id: number;
    // Thêm các trường metadata khác nếu cần (created_at, updated_at)
}

export interface CreateNewsDto {
    title: string;
    content: string;
    published_at?: Date;
    is_published?: boolean;
    user_id?: number;
}

export interface UpdateNewsDto {
    title?: string;
    content?: string;
    published_at?: Date;
    is_published?: boolean;
    user_id?: number;
}

export interface ListNewsDto {
    page?: number;
    size?: number;
    key?: string;
}

// Định dạng Response từ NestJS (Giả định NewsController trả về NewsResponseDto[])
export interface NewsResponse {
    // Dữ liệu bạn quan tâm (cần kiểm tra chính xác cấu trúc trả về từ NewsController)
    // Dựa trên controller, data sẽ là mảng NewsResponseDto.
    // Tạm thời đặt là News[]
    data: News[];
    message?: string;
    // ... Thêm trường total nếu API có hỗ trợ phân trang chi tiết
}

// --- API CALLS (Gọi API Thật) ---

/**
 * @description Gọi GET /news/listnews
 * @param dto {ListNewsDto}
 */
export const getNews = async (dto?: ListNewsDto): Promise<{ news: News[], total: number }> => {
    try {
        // Backend API là /listnews
        const res: AxiosResponse<NewsResponse> = await axios.get(`${API_URL}/listnews`, { params: dto });

        // Dựa trên controller, nó trả về array of NewsResponseDto.
        // TẠM THỜI GIẢ ĐỊNH res.data là { data: News[] } HOẶC chỉ là News[]
        const newsData = res.data.data || res.data;
        
        // **LƯU Ý QUAN TRỌNG:** Vì API của bạn chưa trả về `total` count, 
        // chúng ta sẽ giả lập `total` bằng độ dài của mảng, nhưng điều này chỉ đúng khi không có phân trang.
        // Bạn nên sửa lại NewsController để trả về totalCount (tương tự như gợi ý OrderPage).
        const items = Array.isArray(newsData) ? newsData : [];
        const total = items.length; // GIẢ LẬP: Nếu không có phân trang thật, total = items.length
        
        return { news: items, total }; 
    } catch (error) {
        console.error("Lỗi tải Tin tức:", error);
        return { news: [], total: 0 }; // Trả về mảng rỗng nếu lỗi
    }
};

/**
 * @description Gọi POST /news/createnews (nhận array)
 */
export const addNews = async (news: CreateNewsDto | CreateNewsDto[]): Promise<News[]> => {
    const dataToSend = Array.isArray(news) ? news : [news];
    // Backend API là /createnews và nhận một array
    const res: AxiosResponse<NewsResponse> = await axios.post(`${API_URL}/createnews`, dataToSend);
    
    // Controller trả về array of NewsResponseDto. Lấy data.
    return res.data.data || res.data;
};

/**
 * @description Gọi PUT /news/updatenews/:id
 */
export const updateNews = async (id: number, news: UpdateNewsDto): Promise<News> => {
    // Backend API là /updatenews/:id
    const res: AxiosResponse<NewsResponse> = await axios.put(`${API_URL}/updatenews/${id}`, news);
    
    // Controller trả về array [NewsResponseDto], chúng ta lấy item đầu tiên
    const updatedData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
    return updatedData;
};

/**
 * @description Gọi DELETE /news/deletenews/:id (softDelete)
 */
export const deleteNews = async (id: number): Promise<{ message: string }> => {
    // Backend API là /deletenews/:id
    const res: AxiosResponse<{ message: string }[]> = await axios.delete(`${API_URL}/deletenews/${id}`);
    
    // Controller trả về array [{ message: string }], lấy item đầu tiên
    return res.data[0];
};