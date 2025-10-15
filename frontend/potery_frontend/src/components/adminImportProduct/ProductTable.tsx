// src/components/adminImportProduct/ProductTable.tsx
import React from 'react';
import { Image as ImageIcon, Tag, Hash, Box } from 'lucide-react';

export interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    total_quantity_divided: number;
    supplier_id: number | string;
    category_id?: number;
    images?: { url?: string; image_data?: string | { data: number[] } }[];
    main_image?: string | { data: number[] };
}

interface ProductListTableProps {
    products: Product[];
    loading: boolean;
    getSupplierName: (id: number | string | undefined) => string;
    getProductImage: (id: number | string | undefined) => string | undefined;
}

const formatCurrency = (num: number | undefined | null): string => {
    const numberValue = Number(num);
    if (isNaN(numberValue) || num === undefined || num === null) return '0';
    return numberValue.toLocaleString('vi-VN');
};

const formatCurrencyWithUnit = (num: number | undefined | null): string => {
    return formatCurrency(num) + ' VNĐ';
};

const ProductListTable: React.FC<ProductListTableProps> = ({
    products,
    loading,
    getSupplierName,
    getProductImage,
}) => {
    return (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white border-b-2 border-gray-200">
                    <tr>
                        <th className="px-3 py-2 text-center text-xs font-extrabold text-gray-700 uppercase tracking-wider w-16">ID</th>
                        <th className="px-3 py-2 text-center text-xs font-extrabold text-gray-700 uppercase tracking-wider w-16">Ảnh</th>
                        <th className="px-3 py-2 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider w-1/4">TÊN SẢN PHẨM</th>
                        <th className="px-3 py-2 text-center text-xs font-extrabold text-gray-700 uppercase tracking-wider w-24">GIÁ BÁN</th>
                        <th className="px-3 py-2 text-center text-xs font-extrabold text-gray-700 uppercase tracking-wider w-24">SL TỒN KHO NHẬP</th>
                        <th className="px-3 py-2 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider w-1/6">NHÀ CUNG CẤP</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                                Đang tải danh sách sản phẩm...
                            </td>
                        </tr>
                    ) : products.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                                Không có sản phẩm nào trong kho.
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => {
                            const imageUrl = getProductImage(product.id);

                            return (
                                <tr key={product.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-600">
                                        {product.id}
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                        <div className="flex justify-center items-center">
                                            <div className="w-8 h-8 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                {imageUrl && imageUrl !== "/no-image.jpg" ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt="Product"
                                                        className="object-cover w-full h-full"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <ImageIcon size={14} /> 
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-left text-sm text-gray-700 font-medium">
                                        <div className="text-gray-800 truncate">{product.name}</div>
                                    </td>
                                    <td className="px-3 py-2 text-center text-sm font-medium text-gray-700">
                                        {formatCurrencyWithUnit(product.price)}
                                    </td>
                                    <td className="px-3 py-2 text-center text-sm font-bold text-orange-700">
                                        <Box size={14} className='inline text-orange-500 mr-1' />
                                        {formatCurrency(product.total_quantity_divided)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                        <Tag size={14} className='inline text-blue-500 mr-1' />
                                        <span className='font-medium'>{getSupplierName(product.supplier_id)}</span>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductListTable;