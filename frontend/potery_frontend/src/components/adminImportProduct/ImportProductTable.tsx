// src/components/adminImportProduct/ImportProductTable.tsx
import React from 'react';
import { ImportProduct, ImportProductItemDto } from '@/api/services/importProductsService';
import { Trash2, Tag, Calendar, Image as ImageIcon } from 'lucide-react';

interface ImportProductTableProps {
    importProducts: ImportProduct[];
    getProductName: (id: number | string | undefined) => string;
    getSupplierName: (id: number | string | undefined) => string;
    getProductImage: (id: number | string | undefined) => string | undefined;
    handleEdit: (item: ImportProduct) => void;
    handleDelete: (id: number) => Promise<void>;
}

const formatCurrency = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(Number(num))) return '0';
    return Number(num).toLocaleString('vi-VN');
};
const formatCurrencyWithUnit = (num: number | undefined | null): string => {
    return formatCurrency(num) + ' VNĐ';
};
const formatDate = (dateString: string): string => {
    // Cập nhật: Thêm hiển thị giờ và phút
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Sử dụng định dạng 24 giờ
    });
}


const ImportProductTable: React.FC<ImportProductTableProps> = ({
    importProducts,
    getProductName,
    getSupplierName,
    getProductImage,
    handleEdit,
    handleDelete,
}) => {
    
    return (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white border-b-2 border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Ảnh</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">SẢN PHẨM</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">SL NHẬP</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">GIÁ NHẬP</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">NHÀ CUNG CẤP</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">NGÀY TẠO</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">TỔNG TIỀN</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {importProducts.map((item) => {
                        
                        
                        const finalItemsList: ImportProductItemDto[] = (item.items && item.items.length > 0)
                            ? item.items
                            : (item.product_id 
                                ? [{ 
                                    product_id: item.product_id, 
                                    import_quantity: item.import_quantity || 0, 
                                    import_price: Number(item.import_price) || 0
                                }] 
                                : []
                            );
                        
                        const totalQuantity = finalItemsList.reduce((sum, subItem) => sum + (subItem.import_quantity || 0), 0);
                        const totalAmount = finalItemsList.reduce(
                            (sum, subItem) => sum + (subItem.import_quantity || 0) * (subItem.import_price || 0),
                            0
                        );
                        
                        
                        const isLegacySingleItem = finalItemsList.length === 1 && item.product_id;
                        const singleItemData = isLegacySingleItem ? finalItemsList[0] : null;

                        
                        const firstProductId = finalItemsList.length > 0 ? finalItemsList[0].product_id : undefined;
                        const imageUrl = getProductImage(firstProductId);

                        return (
                            <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                                
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <span className='text-gray-500'>#</span>{item.id}
                                </td>

                                
                                <td className="px-4 py-3 text-center text-sm">
                                    <div className="w-10 h-10 mx-auto relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                        {imageUrl && imageUrl !== "/no-image.jpg" ? (
                                            <img 
                                                src={imageUrl} 
                                                alt="Product" 
                                                className="object-cover w-full h-full" 
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                
                                
                                <td className="px-4 py-3 text-left text-sm text-gray-700 font-medium">
                                    {isLegacySingleItem && item.product_name && singleItemData ? (
                                        <div className="text-gray-800 truncate">{item.product_name}</div>
                                    ) : (
                                        <div className="text-gray-800 font-semibold">
                                            {finalItemsList.length} loại sản phẩm
                                            <span className="ml-2 text-xs text-gray-500 italic"> (Phiếu nhập tổng)</span>
                                        </div>
                                    )}
                                </td>

                                
                                <td className="px-4 py-3 text-center text-sm font-bold text-blue-700">
                                    {formatCurrency(totalQuantity)}
                                </td>
                                
                                
                                <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                                    {isLegacySingleItem && singleItemData
                                        ? formatCurrencyWithUnit(singleItemData.import_price)
                                        : <span className="text-xs text-gray-500 italic">Giá đa dạng</span>
                                    }
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    <Tag size={14} className='inline text-orange-500 mr-1'/> <span className='font-medium'>{getSupplierName(item.supplier_id)}</span>
                                </td>
                                
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    <Calendar size={14} className='inline text-blue-500 mr-1'/>
                                    {formatDate(item.created_at)}
                                </td>
                                
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-green-700">
                                    {formatCurrencyWithUnit(totalAmount)}
                                </td>
                                
                                
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                    
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded-full transition duration-150 bg-red-50 hover:bg-red-100"
                                        title="Xóa phiếu nhập"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ImportProductTable;