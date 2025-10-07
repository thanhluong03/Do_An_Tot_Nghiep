import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  published_at: string | number | Date;
  is_published?: number | boolean;
  user?: { id: string; name: string; logo?: string };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const mapNews = (n: any): NewsItem => ({
  id: String(n.id ?? n._id ?? ''),
  title: n.title ?? n.name ?? '',
  content: n.content ?? n.description ?? '',
  published_at: n.published_at ?? n.createdAt ?? new Date(),
  is_published: n.is_published ?? 1,
  user: n.user ? { id: String(n.user.id ?? ''), name: n.user.name ?? 'Tác giả', logo: n.user.logo } : undefined,
  createdAt: n.createdAt ?? new Date(),
  updatedAt: n.updatedAt ?? new Date(),
});

export const newsApi = {
  async list(): Promise<NewsItem[]> {
    const res = await api.get('/news/listnews');
    const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return data.map(mapNews);
  },
  async detail(id: string): Promise<NewsItem> {
    const res = await api.get(`/news/newsdetail/${id}`);
    return mapNews(res.data);
  },
};


