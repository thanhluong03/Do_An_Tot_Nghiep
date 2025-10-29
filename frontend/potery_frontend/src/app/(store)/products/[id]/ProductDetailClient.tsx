'use client';
import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../../../utils/format';
import { AddToCartClient } from '../[id]/add-to-cart-client';
import { productApi } from '../../../../api/modules/products'; // Import productApi
// import { StoreSelectorClient } from './StoreSelectorClient'; // Đã thay thế bằng UI radio
import { ReviewsClient } from '../[id]/reviews-client';
import { conversationApi } from '@/api/modules/conversation';
import { VoucherModal, ChatModal, ScrollToTopButton } from '@/components/feature';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'; // Import Link từ 'next/link'
import { 
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Archive 
} from 'lucide-react'; // 👈 THÊM 1: Thêm các icon cam kết

export function ProductDetailClient({ product }: { product: any }) {
  const defaultStore = product.stores.find((s: any) => s.quantity_stock > 0);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(defaultStore?.store_id || null);
  const [mainImage, setMainImage] = useState(product.images?.[0] || '/placeholder-product.jpg');

  const [quantity, setQuantity] = useState<number>(1);
  
  const [selectedSize, setSelectedSize] = useState('Nhỏ (11 cm)');
  const [selectedColor, setSelectedColor] = useState('Hồng');

  const handleStoreChange = (storeId: number) => setSelectedStoreId(storeId);
  const hasStores = product.stores && product.stores.length > 0;
  const isAvailable = product.stock > 0 && !!defaultStore;
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const ACCENT_COLOR = '#A67C52';
  const DARK_TEXT = 'text-gray-900';

  useEffect(() => {
    (async () => {
      try {
        const { products } = await productApi.getProducts({ limit: 5 });
        const filteredProducts = products
          .filter((p: any) => String(p.id) !== String(product.id))
          .slice(0, 4);
        setRelatedProducts(filteredProducts);
      } catch (err) {
        console.error('Không thể tải sản phẩm gợi ý:', err);
      }
    })();
  }, [product.id]);

  // Dữ liệu giả cho variants
  const sizes = ['Nhỏ (11 cm)', 'Vừa (13 cm)', 'Lớn (15 cm)'];
  const colors = ['Hồng', 'Đỏ', 'Xanh'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* --- Gallery --- */}
        <div className="flex flex-col items-center">
          <div className="aspect-square bg-white rounded-2xl shadow overflow-hidden w-full">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((img: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                    mainImage === img
                      ? 'border-[#D4A017] scale-105 shadow-md'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name}-${idx}`}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Info --- */}
        <div className="space-y-6">
          {/* Breadcrumbs, Tên, Rating */}
          <div>
            <div className="text-sm text-gray-500 mb-1">{product.category || 'Chén, bát'}</div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2C2A24]">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium text-gray-800">{product.rating.toFixed(1)}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={i < Math.floor(product.rating) ? '/star.png' : '/star-empti.png'}
                    alt="star"
                    className="w-4 h-4"
                  />
                ))}
              </div>
              <span className="border-l pl-3">Đã bán {product.soldCount || 25}</span>
            </div>
          </div>

          {/* --- Box chứa Price, Variants, Store, Quantity, Buttons --- */}
          <div className="p-5 rounded-2xl bg-white shadow space-y-5">
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-bold ${product.originalPrice ? 'text-red-600' : 'text-[#2C2A24]'}`}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  - {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>
            
            {/* Kích thước */}
            <div className="space-y-2">
              <span className="font-medium text-gray-800">Kích thước:</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Màu sắc */}
            <div className="space-y-2">
              <span className="font-medium text-gray-800">Màu sắc:</span>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn cửa hàng */}
            {hasStores && (
              <div className="space-y-3">
                <label className="font-medium text-gray-800">Chọn cửa hàng còn hàng:</label>
                {product.stores.map((store: any) => (
                  <div
                    key={store.store_id}
                    onClick={() => handleStoreChange(store.store_id)}
                    className={`border p-3 rounded-lg cursor-pointer transition-all ${
                      selectedStoreId === store.store_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="store"
                        value={store.store_id}
                        checked={selectedStoreId === store.store_id}
                        onChange={() => handleStoreChange(store.store_id)}
                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">{store.store_name}</div>
                        <div className="text-sm text-gray-600">{store.address}</div>
                        <div className="text-sm text-green-600">{store.quantity_stock} sản phẩm có sẵn</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Số lượng */}
            <div className="flex items-center gap-4 mt-4">
              <span className="font-medium text-[#2C2A24]">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-14 text-center border-x outline-none"
                  min={1}
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Nút Mua Ngay và Giỏ hàng */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 min-h-[60px] sm:items-start">
              {/* Bạn cần style lại nút bên trong AddToCartClient để nó có màu nâu (#8B5E3C) */}
              <div className="w-full sm:flex-grow">
                <AddToCartClient
                  product={product}
                  storeId={selectedStoreId ?? undefined}
                  quantity={quantity}
                  disabled={!isAvailable}
                />
              </div>

              <button
                className="w-full sm:w-auto flex-none px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center justify-center"
                onClick={() => alert('Đã thêm vào giỏ hàng (logic demo)')}
                title="Thêm vào giỏ hàng"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* 👇 SỬA 2: Di chuyển "4 Ô CAM KẾT" vào đây 
            Và thay đổi style để khớp với ảnh
          */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Item 1 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2 mr-3">
                <Truck className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Miễn phí vận chuyển</div>
                <div className="text-xs text-gray-600">Đơn hàng từ 400K</div>
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2 mr-3">
                <ShieldCheck className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Cam kết chất lượng</div>
                <div className="text-xs text-gray-600">Sản phẩm đạt chuẩn</div>
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2 mr-3">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Đổi trả 7 ngày</div>
                <div className="text-xs text-gray-600">Chưa hài lòng</div>
              </div>
            </div>
            {/* Item 4 */}
            <div className="flex items-center p-2">
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2 mr-3">
                <Archive className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Kiểm tra nhận hàng</div>
                <div className="text-xs text-gray-600">Nhận trước trả sau</div>
              </div>
            </div>
          </div>
          
        </div> {/* <-- Kết thúc của <div className="space-y-6"> */}
      </div> {/* <-- Kết thúc của <div className="grid grid-cols-1 lg:grid-cols-2"> */}

      {/* Các phần MÔ TẢ, ĐÁNH GIÁ, SẢN PHẨM LIÊN QUAN
        giờ sẽ nằm bên dưới 2 cột chính 
      */}

      {/* === MÔ TẢ SẢN PHẨM === */}
      <div className="bg-white rounded-2xl shadow p-6 md:p-8 my-10">
        <h2 className="text-2xl font-semibold text-[#2C2A24] mb-4">
          Mô tả sản phẩm
        </h2>
        <div
          className="prose prose-sm sm:prose-base max-w-none text-gray-700 space-y-3"
        >
          {product.description ? (
            <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
          ) : (
            <p>Sản phẩm này hiện chưa có mô tả.</p>
          )}
        </div>
      </div>

      {/* === PHẦN ĐÁNH GIÁ === */}
      <ReviewsClient
        productId={product.id}
        productRating={product.rating}
        productReviewCount={product.reviewCount}
      />

      {/* === Popup Layer (Giữ nguyên) === */}
      {isAuthenticated && user?.id && (
        <>
           {/* (Code Modal và Nút bấm giữ nguyên) ... */}
           {isVoucherModalOpen && (
             <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black bg-opacity-30">
               <VoucherModal
                 customerId={user.id}
                 isOpen={isVoucherModalOpen}
                 onClose={() => setIsVoucherModalOpen(false)}
               />
             </div>
           )}
 
           {isChatOpen && (
             <ChatModal
               isOpen={isChatOpen}
               onClose={() => setIsChatOpen(false)}
               userId={Number(user.id)}
               storeId={0}
               conversationId={conversationId}
             />
           )}
 
           <div className="fixed top-1/2 right-6 -translate-y-1/2 flex flex-col items-end gap-4 z-[100]">
             <button
               onClick={() => setIsVoucherModalOpen(true)}
               className="bg-yellow-400 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform animate-bounce"
               title="Nhận Voucher Giảm Giá!"
             >
               🎁
             </button>
 
             <button
               onClick={async () => {
                 if (!isAuthenticated || !user?.id) return;
                 try {
                   console.log('%c💬 Tạo conversation...', 'color:deepskyblue');
                   const created = await conversationApi.createConversation({
                     sender_id: Number(user.id),
                     sender_type: 'USER',
                     content: 'Xin chào, tôi muốn hỏi về sản phẩm!',
                     user_id: Number(user.id),
                     store_id: 1,
                   });
                   const conv = created?.conversation || created?.data || created;
                   console.log('%c✅ Conversation created:', 'color:limegreen', conv);
                   setConversationId(conv?.id || null);
                   setIsChatOpen(true);
                 } catch (err) {
                   console.error('❌ Lỗi tạo conversation:', err);
                 }
               }}
               className="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
               title="Chat với Admin"
             >
               💬
             </button>
           </div>
        </>
      )}

      {/* Khối Sản phẩm liên quan (Giữ nguyên) */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto mt-20 px-4 md:px-6 lg:px-8 bg-white rounded-2xl shadow-2xl shadow-gray-300/50 p-6 md:p-10">
          
          <h2 className={`text-2xl font-serif font-light mb-10 ${DARK_TEXT}`}>
            Sản phẩm liên quan
            <p className={`mt-3 text-sm text-gray-600`}>
              Khám phá thêm những sản phẩm gốm khác
            </p>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <RelatedProductCard key={p.id} p={p} ACCENT_COLOR={ACCENT_COLOR} DARK_TEXT={DARK_TEXT} />
            ))}
          </div>
        </div>
      )}
      <ScrollToTopButton />
    </div>
  );
}

// Component Card sản phẩm liên quan (Giữ nguyên)
function RelatedProductCard({ p, ACCENT_COLOR, DARK_TEXT }: { p: any, ACCENT_COLOR: string, DARK_TEXT: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-lg shadow-gray-100/50 hover:shadow-xl transition duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${p.id}`} className="cursor-pointer">
        <img
          src={p.images?.[0] || '/pott.jpg'}
          alt={p.name}
          className="w-full h-48 object-cover rounded-lg mb-3 hover:opacity-90 transition-opacity"
        />
      </Link>
      <div className="mt-3 text-center">
        <Link
          href={`/products/${p.id}`}
          className={`font-medium ${DARK_TEXT} line-clamp-1 transition cursor-pointer`}
          style={{ color: isHovered ? ACCENT_COLOR : undefined }}
        >
          {p.name}
        </Link>
        <p
          className="font-bold text-lg mt-1 mb-3"
          style={{ color: ACCENT_COLOR }}
        >
          {formatPrice(p.price)}
        </p>
        <button
          className="w-full border text-sm font-medium py-2 rounded-lg transition"
          style={{
            borderColor: ACCENT_COLOR,
            color: isHovered ? '#FFFFFF' : ACCENT_COLOR,
            backgroundColor: isHovered ? ACCENT_COLOR : 'transparent',
          }}
          onClick={() => {
            alert(`Thêm sản phẩm ${p.name} vào giỏ hàng.`);
          }}
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}