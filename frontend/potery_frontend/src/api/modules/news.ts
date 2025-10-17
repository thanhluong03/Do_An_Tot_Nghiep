import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  published_at: string | number | Date;
  image?: string;
  is_published?: number | boolean;
  user?: { id: string; name: string; logo?: string };
}

const mapNews = (n: any): NewsItem => {
  const imageFromDb = n?.image_data ? `data:image/jpeg;base64,${n.image_data}` : undefined;
  return {
    id: String(n?.id ?? n?._id ?? ''),
    title: n?.title ?? n?.name ?? '',
    content: n?.content ?? n?.description ?? '',
    image: imageFromDb || n?.image || '/pott.jpg',
    published_at: n?.published_at ?? n?.created_at ?? n?.createdAt ?? new Date(),
    is_published: typeof n?.is_published === 'boolean' ? n.is_published : Number(n?.is_published ?? 1) === 1,
    user: n?.user ? { id: String(n.user.id ?? ''), name: n.user.name ?? 'Tác giả' } : undefined,
  };
};

export const newsApi = {
  async list(page = 1, limit = 6): Promise<{ items: NewsItem[]; total: number }> {
    const res = await api.get(`/news/listnews?page=${page}&limit=${limit}`);
    const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
    const total = res.data?.total ?? data.length;
    return { items: data.map(mapNews), total };
  },
  async detail(id: string): Promise<NewsItem> {
    const res = await api.get(`/news/newsdetail/${id}`);
    const payload = Array.isArray(res.data) ? res.data[0] : res.data;
    return mapNews(payload || {});
  },
};
