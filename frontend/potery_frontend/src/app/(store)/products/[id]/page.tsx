import React from 'react';
import { productApi } from '../../../../api/modules/products';
import { formatPrice } from '../../../../utils/format';
import { BaseLayout } from '../../../../layouts';
import { ReviewsClient } from '../[id]/reviews-client';
import { AddToCartClient } from '../[id]/add-to-cart-client';
import { StoreSelectorClient } from './StoreSelectorClient';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ProductDetailPage(props: PageProps) {
  const resolvedParams = 'then' in props.params ? await props.params : props.params;
  const { id } = resolvedParams;

  let product: Awaited<ReturnType<typeof productApi.getProductById>> | null = null;
  try {
    product = await productApi.getProductById(id);
  } catch (e) {
    product = null;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h1>
          <p className="text-gray-600">Vui lòng kiểm tra lại hoặc quay lại trang sản phẩm.</p>
        </div>
      </div>
    );
  }
  const defaultStore = product.stores.find(s => s.quantity_stock > 0);
    const hasStores = product.stores && product.stores.length > 0;
    const isAvailable = product.stock > 0 && !!defaultStore; // Tồn kho tổng > 0 và có cửa hàng phân phối
  return (
    <BaseLayout>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-gray-700">Trang chủ</a>
        <span className="mx-2">/</span>
        <a href="/products" className="hover:text-gray-700">Sản phẩm</a>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-white rounded-2xl shadow overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[0] || '/placeholder-product.jpg'} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(0, 8).map((img, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={idx} src={img} alt={`${product.name}-${idx}`} className="w-full h-20 object-cover rounded-lg border hover:opacity-90 cursor-pointer" />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 text-xs rounded-full bg-[#F5F1EB] text-[#65604E]">{product.category || 'Gốm sứ'}</span>
                            
                            {/* CẬP NHẬT: Dùng defaultStore để xác định trạng thái tồn kho */}
                            {isAvailable ? ( 
                                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">Còn hàng</span>
                            ) : (
                                <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">Hết hàng</span>
                            )}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2C2A24]">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={i < Math.floor(product.rating) ? '/images/star-filled.png' : '/images/star-empty.png'} alt="star" className="w-4 h-4" />
                ))}
              </div>
              <span>{product.rating.toFixed(1)} ({product.reviewCount})</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white shadow space-y-5">
            <div className="flex items-baseline gap-3">
                {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                    </span>
                )}
                <span className={`text-3xl font-bold ${product.originalPrice ? 'text-red-600' : 'text-[#2C2A24]'}`}>
                    {formatPrice(product.price)}
                </span>
                {product.isFlashSale && (
                    <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        🔥 SALE
                    </span>
                )}
            </div>
            <p className="mt-4 text-gray-700 leading-relaxed">{product.description || 'Sản phẩm gốm sứ chất lượng, chế tác thủ công tinh xảo.'}</p>
            {hasStores && (
                  <StoreSelectorClient 
                        stores={product.stores} 
                        initialStoreId={defaultStore?.store_id}
                        onStoreSelect={(storeId) => console.log(`[ProductDetail] Store ID: ${storeId}`)} 
                            />
            )}
            {!hasStores && (
                <p className="text-red-500 text-sm">DEBUG: Sản phẩm này chưa được phân phối đến cửa hàng hoặc dữ liệu cửa hàng bị lỗi.</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              {/* AddToCartClient cần được cập nhật để nhận storeId từ StoreSelectorClient */}
              <AddToCartClient 
            product={product} 
            disabled={!isAvailable} // Chỉ disabled khi hết hàng
               />
              <a href="/products" className="px-6 py-3 border-2 border-[#65604E] text-[#65604E] rounded-lg hover:bg-[#F5F1EB] text-center">Quay lại</a>
            </div>
          </div>

           {/* Supplier/Store Info (Chỉ hiển thị thông tin chung, phần chi tiết đã chuyển lên StoreSelector) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            {product.supplier?.name && <div><span className="text-gray-500">Nhà cung cấp: </span>{product.supplier.name}</div>}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewsClient productId={id} productRating={product.rating} productReviewCount={product.reviewCount} />
    </div>
    </BaseLayout>
  );
}


