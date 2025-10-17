import axios, { AxiosResponse } from "axios";

const API_URL = "http://localhost:3000/news";

export interface News {
    id: number;
    title: string;
    content: string;
    published_at?: string;
    is_published?: boolean;
    user_id?: number;
    created_at?: string;
    updated_at?: string;
    image_data?: string;
}

export interface CreateNewsDto {
    title: string;
    content?: string;
    user_id?: number;
    is_published?: boolean;
    image_data?: File | null; 
}

export interface UpdateNewsDto {
    title?: string;
    content?: string;
    user_id?: number;
    is_published?: boolean;
    image_data?: File | null;
}

export interface ListNewsDto {
    key?: string;
    sort?: 'newest' | 'oldest'; 
}

const createFormData = (data: CreateNewsDto | UpdateNewsDto): FormData => {
    const formData = new FormData();
    
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.user_id !== undefined) formData.append('user_id', String(data.user_id));
    
    if (data.is_published !== undefined) formData.append('is_published', String(!!data.is_published));
    
    if (data.image_data instanceof File) {
        formData.append('image_data', data.image_data); 
    } 
    
    return formData;
};

export const getNews = async (dto?: ListNewsDto): Promise<{ news: News[], total: number }> => {
    try {
        const params: ListNewsDto = {
            key: dto?.key,
            sort: dto?.sort
        };
        
        const res: AxiosResponse<News[]> = await axios.get(`${API_URL}/listnews`, { params });
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.news || [];
        
        return { news: items, total: items.length }; 
    } catch (error) {
        console.error("Lỗi tải Tin tức:", error);
        return { news: [], total: 0 }; 
    }
};

export const addNews = async (data: CreateNewsDto): Promise<News[]> => {
    const formData = createFormData(data);

    const res: AxiosResponse<News[]> = await axios.post(`${API_URL}/createnews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return Array.isArray(res.data) ? res.data : [];
};

export const updateNews = async (id: number, data: UpdateNewsDto): Promise<News> => {
    const formData = createFormData(data); 
    
    const res: AxiosResponse<News[]> = await axios.put(`${API_URL}/updatenews/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    
    return Array.isArray(res.data) ? res.data[0] : res.data;
};

export const deleteNews = async (id: number): Promise<{ message: string }> => {
    const res: AxiosResponse<{ message: string }[]> = await axios.delete(`${API_URL}/deletenews/${id}`);
    return res.data[0];
};