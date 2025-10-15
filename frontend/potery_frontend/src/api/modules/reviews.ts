import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface ReviewItem {
  id?: string;
  product_id?: string | number;
  customer_id?: string | number;
  rating: number;
  comment?: string;
  created_at?: string | Date;
}

const mapReview = (r: any): ReviewItem => ({
  id: String(r.id ?? r._id ?? ''),
  product_id: r.product_id ?? r.productId,
  customer_id: r.customer_id ?? r.customerId,
  rating: Number(r.rating ?? 5),
  comment: r.comment ?? '',
  created_at: r.created_at ?? r.createdAt ?? new Date(),
});

export const reviewsApi = {
  // ✅ Lấy danh sách review theo product_id
  async list(productId: string | number): Promise<ReviewItem[]> {
    const res = await api.get(`/reviews/by-product/${productId}`);
    console.log('📥 ListReview API trả về:', res.data);

    const data = Array.isArray(res.data) ? res.data : res.data?.reviews || [];
    return data.map(mapReview);
  },

  // ✅ Gửi review mới — backend yêu cầu mảng CreateReviewDto[]
  async create(payloads: Array<{
    orderitem_id: number;
    customer_id: number;
    rating: number;
    comment?: string;
  }>) {
    const body = Array.isArray(payloads) ? payloads : [payloads];
    console.log('📦 Gửi review tới API (body):', body);

    const res = await api.post('/reviews/createreview', body);
    console.log('✅ API trả về raw:', res.data);

    // Chuẩn hóa phản hồi
    const raw = res?.data;
    const dataArray = Array.isArray(raw)
      ? raw
      : raw
      ? [raw]
      : [];

    if (dataArray.length === 0 || !dataArray[0]?.id) {
      console.error('❌ API trả về null hoặc không hợp lệ:', raw);
      throw new Error('Không nhận được phản hồi hợp lệ từ API');
    }

    const first = mapReview(dataArray[0]);
    console.log('✅ Review đã chuẩn hóa:', first);
    return first;
  },
};
