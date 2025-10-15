import React from 'react';
import { productApi } from '../../../../api/modules/products';
import { BaseLayout } from '../../../../layouts';
import { ProductDetailClient } from '../[id]/ProductDetailClient';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ProductDetailPage(props: PageProps) {
  const resolvedParams = 'then' in props.params ? await props.params : props.params;
  const { id } = resolvedParams;

  const product = await productApi.getProductById(id).catch(() => null);

  if (!product) {
    return (
      <BaseLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h1>
          <p className="text-gray-600">Vui lòng kiểm tra lại hoặc quay lại trang sản phẩm.</p>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <ProductDetailClient product={product} />
    </BaseLayout>
  );
}
