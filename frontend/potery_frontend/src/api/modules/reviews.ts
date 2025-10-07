import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

export interface ReviewItem {
  id: string;
  product_id: string | number;
  customer_id?: string | number;
  rating: number;
  comment?: string;
  created_at?: string | Date;
}

const mapReview = (r: any): ReviewItem => ({
  id: String(r.id ?? r._id ?? ''),
  product_id: r.product_id,
  customer_id: r.customer_id,
  rating: Number(r.rating ?? 5),
  comment: r.comment ?? r.content ?? '',
  created_at: r.created_at ?? r.createdAt ?? new Date(),
});

export const reviewsApi = {
  async list(productId: string | number): Promise<ReviewItem[]> {
    const res = await api.get('/reviews/listreview', { params: { product_id: productId } });
    const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return data.map(mapReview);
  },
  async create(payload: { product_id: string | number; customer_id?: string | number; rating: number; comment?: string; }) {
    const res = await api.post('/reviews/createreview', payload);
    return res.data;
  },
};


