import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface ReviewItem {
  id?: string;
  product_id?: string | number;
  product_name?: string;
  customer_id?: string | number;
  customer_name?: string;
  orderitem_id?: string | number;
  rating: number;
  comment?: string;
  created_at?: string | Date;
  images?: string[];
}


const mapReview = (r: any): ReviewItem => ({
  id: String(r.id ?? r._id ?? ''),
  product_id: r.product_id ?? r.productId,
  customer_id: r.customer_id ?? r.customerId,
  rating: Number(r.rating ?? 5),
  comment: r.comment ?? '',
  created_at: r.created_at ?? r.createdAt ?? new Date(),
  images: r.images ?? [],
});

export const reviewsApi = {
  // ✅ Lấy danh sách review theo product_id
  async list(productId: string | number): Promise<ReviewItem[]> {
    const res = await api.get(`/reviews/by-product/${productId}`);

    const rawData = Array.isArray(res.data) ? res.data : res.data?.reviews || [];

    // Dạng dữ liệu có thể là: [{ customer, product, review: [...] }]
    const flatReviews: ReviewItem[] = [];

    rawData.forEach((entry: any) => {
      const customerName = entry.customer?.name || 'Khách hàng';
      const productName = entry.product?.name || '';

      // entry.review có thể là mảng hoặc object
      if (Array.isArray(entry.review)) {
        entry.review.forEach((reviewObj: any) => {
          // Tạo orderitem_id từ entry hoặc reviewObj
          const orderItemId = reviewObj.orderitem_id ||
            entry.order_items_id ||
            entry.orderitem_id ||
            `${entry.order_id}_${entry.product?.id || reviewObj.product_id}_0`;

          flatReviews.push({
            id: String(reviewObj.id),
            product_id: entry.product?.id ?? productId,
            customer_id: entry.customer?.id ?? null,
            customer_name: customerName,
            product_name: productName,
            orderitem_id: orderItemId,
            rating: Number(reviewObj.rating ?? 5),
            comment: reviewObj.comment ?? '',
            created_at: reviewObj.created_at ?? new Date(),
          });
        });
      } else if (entry.review && typeof entry.review === 'object') {
        // Tạo orderitem_id từ entry hoặc review
        const orderItemId = entry.review.orderitem_id ||
          entry.order_items_id ||
          entry.orderitem_id ||
          `${entry.order_id}_${entry.product?.id || productId}_0`;

        flatReviews.push({
          id: String(entry.review.id),
          product_id: entry.product?.id ?? productId,
          customer_id: entry.customer?.id ?? null,
          customer_name: customerName,
          product_name: productName,
          orderitem_id: orderItemId,
          rating: Number(entry.review.rating ?? 5),
          comment: entry.review.comment ?? '',
          created_at: entry.review.created_at ?? new Date(),
        });
      }
    });

    return flatReviews;
  },
  listByProduct: async (productId: string | number) => {
    const res = await axios.get(`http://localhost:3000/reviews/by-product/${productId}`);
    return res.data;
  },

  // ✅ Gửi review mới — backend yêu cầu mảng CreateReviewDto[]
  async create(payload: any) {
    let res;
    if (payload instanceof FormData) {
      res = await axios.post(`${API_BASE_URL}/reviews/createreview`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      const body = Array.isArray(payload) ? payload : [payload];
      res = await api.post('/reviews/createreview', body);
    }
    // Chuẩn hóa phản hồi
    const raw = res?.data;
    const dataArray = Array.isArray(raw)
      ? raw
      : raw
        ? [raw]
        : [];

    if (dataArray.length === 0 || !dataArray[0] || !dataArray[0]?.id) {
      console.warn('⚠️ API không trả về dữ liệu hợp lệ, tạo review giả định cục bộ.');
      return {
        id: String(Date.now()),
        product_id: payload[0]?.orderitem_id,
        customer_id: payload[0]?.customer_id,
        rating: payload[0]?.rating,
        comment: payload[0]?.comment,
        created_at: new Date().toISOString(),
        images: [],
      };
    }


    const first = mapReview(dataArray[0]);
    console.log('✅ Review đã chuẩn hóa:', first);
    return first;
  },
};
