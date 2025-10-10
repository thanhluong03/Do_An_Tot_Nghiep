import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface ReviewItem {
  id: string;
  product_id: string | number;
  customer_id?: string | number;
  rating: number; // ✅ luôn number
  comment?: string;
  created_at?: string | Date;
}

// ✅ Ép rating thành number khi map dữ liệu từ API
const mapReview = (r: any): ReviewItem => ({
  id: String(r.id ?? r._id ?? ''),
  product_id: r.product_id,
  customer_id: r.customer_id,
  rating: Number(r.rating ?? 5), // ✅ ép sang number
  comment: r.comment ?? r.content ?? '',
  created_at: r.created_at ?? r.createdAt ?? new Date(),
});

export const reviewsApi = {
  async list(productId: string | number): Promise<ReviewItem[]> {
    const res = await api.get('/reviews/listreview', { params: { product_id: productId } });
    console.log('📥 ListReview API trả về:', res.data);
    const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
    return data.map(mapReview);
  },

  async create(payload: {
    product_id: string;
    customer_id?: string;
    rating: number; // ✅ nhận number từ frontend
    comment?: string;
  }) {
    const body = {
      product_id: String(payload.product_id),
      customer_id: String(payload.customer_id),
      rating: String(payload.rating), // ✅ chỉ ép sang string khi gửi
      comment: String(payload.comment ?? ''),
    };

    console.log('📦 Gửi review tới API:', body);

    const res = await api.post('/reviews/createreview', body);

    const data = Array.isArray(res.data) ? res.data[0] : res.data;
    console.log('✅ API trả về:', data);

    return mapReview(data);
  },
};
