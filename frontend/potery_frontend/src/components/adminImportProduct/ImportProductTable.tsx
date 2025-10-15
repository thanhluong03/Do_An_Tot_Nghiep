// src/components/adminImportProduct/ImportProductTable.tsx
import React, { useState } from 'react';
import { ImportProduct, ImportProductItemDto } from '@/api/services/importProductsService';
import { Edit, Trash2, Tag, Calendar, Eye, ChevronUp, Image as ImageIcon } from 'lucide-react';

interface ImportProductTableProps {
    importProducts: ImportProduct[];
    getProductName: (id: number | string | undefined) => string;
    getSupplierName: (id: number | string | undefined) => string;
    getProductImage: (id: number | string | undefined) => string | undefined;
    handleEdit: (item: ImportProduct) => void;
    handleDelete: (id: number) => Promise<void>;
}

// Utils: Định dạng số tiền (Giữ nguyên)
const formatCurrency = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(Number(num))) return '0';
    return Number(num).toLocaleString('vi-VN');
};
const formatCurrencyWithUnit = (num: number | undefined | null): string => {
    return formatCurrency(num) + ' VNĐ';
};
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
}


const ImportProductTable: React.FC<ImportProductTableProps> = ({
    importProducts,
    getProductName,
    getSupplierName,
    getProductImage,
    handleEdit,
    handleDelete,
}) => {
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const toggleDetails = (importId: number) => {
        setExpandedRow(prev => (prev === importId ? null : importId));
    };

    return (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-orange-50/70">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-16">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-16">Ảnh</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/4">Sản phẩm & SL</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">Nhà Cung cấp</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-20">Giá nhập</th> 
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">Ngày tạo</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-24">Tổng tiền</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-20">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {importProducts.map((item) => {
                        const isExpanded = expandedRow === item.id;
                        
                        // Logic xử lý dữ liệu để tương thích cả 2 dạng (cũ và mới)
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
                        
                        // 💡 Xác định đây có phải là phiếu nhập Single-item theo dạng cũ không
                        const isLegacySingleItem = finalItemsList.length === 1 && item.product_id;
                        const singleItemData = isLegacySingleItem ? finalItemsList[0] : null;

                        // Lấy product_id của sản phẩm đầu tiên/duy nhất để lấy ảnh
                        const firstProductId = finalItemsList.length > 0 ? finalItemsList[0].product_id : undefined;
                        const imageUrl = getProductImage(firstProductId);


                        return (
                            <React.Fragment key={item.id}>
                                {/* Hàng Chính */}
                                <tr className={`hover:bg-gray-50 transition ${isExpanded ? 'bg-blue-50/70 border-b-2 border-blue-200' : ''}`}>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{item.id}
                                    </td>

                                    {/* 🚀 THAY ĐỔI: CỘT ẢNH ĐƯỢC ĐẶT SAU ID */}
                                    <td className="px-4 py-4 text-center text-sm">
                                        <div className="w-10 h-10 mx-auto relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border">
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
                                    
                                    {/* Cột Sản phẩm & SL (Giữ nguyên logic Single/Multi-item) */}
                                    <td className="px-4 py-4 text-left text-sm text-gray-700">
                                        {isLegacySingleItem && item.product_name && singleItemData ? (
                                            <>
                                                <div className="font-semibold text-gray-800 truncate">{item.product_name}</div>
                                                <div className="text-xs text-blue-600">SL: {formatCurrency(singleItemData.import_quantity)}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="font-bold text-blue-600">{formatCurrency(totalQuantity)} SP</div>
                                                <div className="text-xs text-gray-500">({finalItemsList.length} loại)</div>
                                            </>
                                        )}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <Tag size={14} className='inline text-orange-500 mr-1'/> {getSupplierName(item.supplier_id)}
                                    </td>
                                    
                                    {/* Cột Giá nhập (Giữ nguyên logic Single/Multi-item) */}
                                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">
                                        {isLegacySingleItem && singleItemData
                                            ? formatCurrencyWithUnit(singleItemData.import_price)
                                            : <span className="text-xs text-gray-400">Xem chi tiết</span>
                                        }
                                    </td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <Calendar size={14} className='inline text-blue-500 mr-1'/>
                                        {formatDate(item.created_at)}
                                    </td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-green-600">
                                        {formatCurrencyWithUnit(totalAmount)}
                                    </td>
                                    
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium flex items-center justify-center space-x-2">
                                        {/* Nút Xem Chi Tiết */}
                                        <button
                                            onClick={() => toggleDetails(item.id)}
                                            className="text-gray-500 hover:text-blue-600 p-1 rounded-full transition"
                                            title="Xem Chi tiết"
                                        >
                                            {isExpanded ? <ChevronUp size={18} /> : <Eye size={18} />}
                                        </button>
                                        
                                        {/* Nút Sửa
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className={`text-blue-600 hover:text-blue-800 p-1 rounded-full transition ${finalItemsList.length > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={finalItemsList.length > 1 ? "Không thể sửa phiếu nhập nhiều sản phẩm" : "Sửa"}
                                            disabled={finalItemsList.length > 1}
                                        >
                                            <Edit size={18} />
                                        </button> */}
                                        
                                        {/* Nút Xóa */}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full transition"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                                
                                {/* Hàng Chi Tiết (Mở rộng) */}
                                {isExpanded && (
                                    <tr className="bg-blue-50">
                                        {/* colSpan vẫn là 8, nhưng cần đảm bảo nội dung chi tiết vẫn nằm đúng vị trí */}
                                        <td colSpan={8} className="p-4"> 
                                            <h4 className='text-sm font-bold text-blue-700 mb-2 border-b border-blue-200 pb-1'>
                                                Chi tiết các sản phẩm đã nhập trong phiếu #{item.id}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {finalItemsList.map((subItem, index) => {
                                                    const subItemImageUrl = getProductImage(subItem.product_id);
                                                    const subTotal = (subItem.import_quantity || 0) * (subItem.import_price || 0);

                                                    return (
                                                        <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                                            <div className="w-10 h-10 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border">
                                                                {subItemImageUrl ? (
                                                                    <img src={subItemImageUrl} alt="Product" className="object-cover w-full h-full" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-[10px]">NO IMG</div>
                                                                )}
                                                            </div>
                                                            <div className='flex-1 text-sm'>
                                                                <p className="font-semibold text-gray-800 truncate">{getProductName(subItem.product_id)}</p>
                                                                <p className="text-xs text-gray-600">SL: <span className='font-medium'>{formatCurrency(subItem.import_quantity)}</span></p>
                                                                <p className="text-xs text-gray-600">Giá nhập: <span className='font-medium'>{formatCurrencyWithUnit(subItem.import_price)}</span></p>
                                                                <p className="text-xs font-bold text-orange-600 mt-1">Thành tiền: {formatCurrencyWithUnit(subTotal)}</p>
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
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ImportProductTable;