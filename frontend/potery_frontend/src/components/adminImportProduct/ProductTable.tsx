// src/components/adminImportProduct/ProductTable.tsx
import React, { useState } from 'react';
import { Image as ImageIcon, Tag, Box } from 'lucide-react';
import Image from 'next/image';

// ... (Product interface, ProductListTableProps, formatCurrency functions giữ nguyên) ...

export interface Product {
    id: number;
    relationships?: Array<{
        id: number;
        product_attribute_id_1: number;
        product_attribute_id_2: number;
        price: number;
        quantity: number;
        attribute1_name?: string;
        attribute2_name?: string;
    }>;
    name: string;
    price: number; // GIÁ CỦA SẢN PHẨM CHÍNH
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
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const handleToggleExpand = (productId: number) => {
        setExpandedRows(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    return (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white border-b-2 border-gray-200">
                    <tr>
                        <th className="px-1 py-2 text-center text-xs font-extrabold text-gray-700 uppercase tracking-wider w-2">STT</th>
                        <th className="px-1 py-2 text-xs font-extrabold text-gray-700 uppercase tracking-wider w-10">Ảnh</th>
                        <th className="px-1 py-2 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider w-1/4">TÊN SẢN PHẨM</th>
                        
                        {/* 1. BỎ COMMENT VÀ CHỈNH LẠI CỘT GIÁ BÁN */}
                        <th className="px-3 py-2 text-center text-xs font-extrabold text-gray-700 uppercase tracking-wider w-24">GIÁ BÁN</th>
                        
                        <th className="px-3 py-2 text-center text-xs font-extrabold text-gray-700 uppercase tracking-wider w-24">SL TỒN KHO NHẬP</th>
                        <th className="px-3 py-2 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider w-1/6">NHÀ CUNG CẤP</th>
                        <th className="px-2 py-2 text-center text-xs font-extrabold text-gray-700 uppercase tracking-wider w-8">CHI TIẾT</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            {/* Tổng cộng 7 cột (khi bỏ comment Giá Bán) */}
                            <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                                Đang tải danh sách sản phẩm...
                            </td>
                        </tr>
                    ) : (
                        // 1. Lọc danh sách sản phẩm: chỉ giữ lại sản phẩm có tổng số lượng > 0
                        products.filter(product => (product.total_quantity_divided || 0) > 0).length === 0 ? (
                            // 2. Hiển thị thông báo nếu không có sản phẩm nào sau khi lọc
                            <tr>
                                {/* Tổng cộng 7 cột (khi bỏ comment Giá Bán) */}
                                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                                    Không có sản phẩm nào đang có tồn kho.
                                </td>
                            </tr>
                        ) : (
                            // 3. Render danh sách sản phẩm đã được lọc
                            products
                                .filter(product => (product.total_quantity_divided || 0) > 0)
                                .map((product, index) => {
                                    const imageUrl = getProductImage(product.id);
                                    const isExpanded = expandedRows.includes(product.id);
                                    
                                    // Kiểm tra xem sản phẩm có combo hay không
                                    const hasRelationships = product.relationships && product.relationships.length > 0;
                                    
                                    return (
                                        <React.Fragment key={product.id}>
                                            <tr className="hover:bg-gray-50 transition duration-150">
                                                <td className="px-1 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-600">
                                                    {index + 1}
                                                </td>
                                                <td className="px-1 py-2 text-sm">
                                                    <div className="flex justify-center items-center">
                                                        <div className="w-10 h-10 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                            {imageUrl && imageUrl !== "/no-image.jpg" ? (
                                                                <Image
                                                                    src={imageUrl}
                                                                    alt="Product"
                                                                    width={40} // Tăng kích thước ảnh
                                                                    height={40} // Tăng kích thước ảnh
                                                                    className="object-cover w-full h-full"
                                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <ImageIcon size={18} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-1 py-2 text-left text-sm text-gray-700 font-medium break-words">
                                                    <div className="text-gray-800" title={product.name}>{product.name}</div>
                                                </td>
                                                
                                                {/* 2. HIỂN THỊ GIÁ BÁN SẢN PHẨM CHÍNH NẾU KHÔNG CÓ COMBO,
                                                   HOẶC ĐỂ TRỐNG NẾU CÓ COMBO (vì combo có giá riêng) */}
                                                <td className="px-3 py-2 text-center text-sm font-medium">
                                                    {hasRelationships ? (
                                                        <span className="text-gray-400 italic text-[11px]">Xem chi tiết phân loại</span>
                                                    ) : (
                                                        <span className="font-semibold text-green-700">
                                                            {formatCurrencyWithUnit(product.price)}
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                <td className="px-3 py-2 text-center text-sm font-bold text-orange-700">
                                                    <Box size={14} className='inline text-orange-500 mr-1' />
                                                    {formatCurrency(product.total_quantity_divided)}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                                    <Tag size={14} className='inline text-blue-500 mr-1' />
                                                    <span className='font-medium'>{getSupplierName(product.supplier_id)}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    {hasRelationships && (
                                                        <button
                                                            onClick={() => handleToggleExpand(product.id)}
                                                            className="text-gray-500 hover:text-orange-600 focus:outline-none"
                                                            title={isExpanded ? 'Ẩn combo' : 'Xem combo'}
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d={isExpanded ? "M6 14L10 10L14 14" : "M6 10L10 14L14 10"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && hasRelationships && (
                                                <tr className="bg-orange-50">
                                                    {/* 3. SỬA LẠI colSpan = 7 (vì đã thêm cột Giá Bán) */}
                                                    <td colSpan={7} className="px-3 py-2">
                                                        <div className="font-semibold text-orange-700 mb-1 text-xs" style={{ marginLeft: '150px' }}>Combo phân loại của sản phẩm</div>
                                                        <div className="grid grid-cols-1 gap-2" style={{ marginLeft: '150px' }}>
                                                            {product.relationships!.map((combo) => { // Dùng "!" vì đã kiểm tra hasRelationships
                                                                return (
                                                                    <div
                                                                        key={combo.id}
                                                                        className="border border-gray-200 rounded-lg bg-white shadow-sm p-3 mb-2"
                                                                    >
                                                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                                                            <div className="mb-0 md:mb-0">
                                                                                <div className="text-[9px] text-gray-500">ID: {combo.id}</div>
                                                                                <div className="mt-0 font-medium text-gray-800 text-[11px]">{combo.attribute1_name}{combo.attribute2_name ? ` - ${combo.attribute2_name}` : ''}</div>
                                                                            </div>

                                                                            <div className="flex-1 md:flex-none md:mx-2 flex justify-center items-center">
                                                                                <div className="text-center">
                                                                                    <div className="text-[9px] text-gray-500">Số lượng</div>
                                                                                    <div className="text-blue-600 font-bold text-[13px]">{formatCurrency(combo.quantity)}</div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="md:flex-none text-right">
                                                                                <div className="text-[9px] text-gray-500">Giá</div>
                                                                                <div className="text-green-700 font-bold text-[13px]">{formatCurrencyWithUnit(combo.price)}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductListTable;