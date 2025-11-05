// src/components/adminImportProduct/ImportProductTable.tsx
import React, { useState } from 'react';
import { ImportProduct, ImportProductDetail } from '@/api/services/importProductsService';
import { Trash2, Tag, Calendar, Image as ImageIcon, ChevronLeft, ChevronRight, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface ImportProductTableProps {
    importProducts: ImportProduct[];
    getProductName: (id: number | string | undefined) => string;
    getSupplierName: (id: number | string | undefined) => string;
    getProductImage: (id: number | string | undefined) => string | undefined;
    handleDelete: (id: number) => Promise<void>;
    // --- PROPS PHÂN TRANG MỚI ---
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    // ----------------------------
}

const formatCurrency = (num: number | undefined | null): string => {
    const numberValue = Number(num);
    if (isNaN(numberValue) || num === undefined || num === null) return '0';
    return numberValue.toLocaleString('vi-VN');
};

const formatCurrencyWithUnit = (num: number | undefined | null): string => {
    return formatCurrency(num) + ' VNĐ';
};
const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    } catch {
        return 'Invalid Date';
    }
}


const ImportProductTable: React.FC<ImportProductTableProps> = ({
    importProducts,
    getProductName,
    getSupplierName,
    getProductImage,
    handleDelete,
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
}) => {

    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRowExpansion = (itemId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedRows(newExpanded);
    };

    const calculateTotals = (details: ImportProductDetail[] = []) => {
        return details.reduce(
            (acc, detail) => ({
                totalQuantity: acc.totalQuantity + (detail.import_quantity || 0),
                totalAmount: acc.totalAmount + ((detail.import_quantity || 0) * (detail.import_price || 0))
            }),
            { totalQuantity: 0, totalAmount: 0 }
        );
    };

    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };
    // ------------------------------------

    return (
        <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-center">
                <h2 className="text-2xl font-extrabold text-[#B95D26] tracking-wide">
                    Lịch sử nhập kho sản phẩm({totalItems})
                </h2>

            </div>

            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white border-b-2 border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">STT</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Ảnh</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">SẢN PHẨM</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">TỔNG SL</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">NHÀ CUNG CẤP</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/6">NGÀY TẠO</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">TỔNG TIỀN</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">CHI TIẾT</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">XÓA</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {importProducts.map((item, index) => {
                            const productId = item.product_id;
                            const { totalQuantity, totalAmount } = calculateTotals(item.details);
                            const imageUrl = getProductImage(productId);
                            const productName = getProductName(productId);
                            const stt = startIndex + index;
                            const isExpanded = expandedRows.has(item.id);
                            const hasDetails = item.details && item.details.length > 0;

                            return (
                                <React.Fragment key={item.id}>
                                    {/* Main Row */}
                                    <tr className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-600">
                                            {stt}
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
                                        <td className="px-4 py-3 text-left text-sm text-gray-700 font-medium truncate max-w-[300px]">
                                            <div className="text-gray-800 break-words line-clamp-2">{productName}</div>
                                            {hasDetails && (
                                                <div className="text-xs text-gray-500">
                                                    {item.details?.length || 0} phân loại
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-bold text-blue-700">
                                            {formatCurrency(totalQuantity)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                            <Tag size={14} className='inline text-orange-500 mr-1' />
                                            <span className='font-medium'>{getSupplierName(item.supplier_id)}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            <Calendar size={14} className='inline text-blue-500 mr-1' />
                                            {formatDate(item.created_at)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-green-700">
                                            {formatCurrencyWithUnit(totalAmount)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                            {hasDetails ? (
                                                <button
                                                    onClick={() => toggleRowExpansion(item.id)}
                                                    className="text-blue-500 hover:text-blue-700 p-2 rounded-full transition duration-150 bg-blue-50 hover:bg-blue-100"
                                                    title={isExpanded ? "Thu gọn chi tiết" : "Xem chi tiết"}
                                                >
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Không có</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full transition duration-150 bg-red-50 hover:bg-red-100"
                                                title="Xóa phiếu nhập"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Detail Rows */}
                                    {isExpanded && hasDetails && (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-0 bg-gray-50">
                                                <div className="py-4">
                                                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                        <Eye size={14} className="text-blue-500" />
                                                        Chi tiết phân loại nhập hàng
                                                    </h5>
                                                    <div className="grid gap-3">
                                                        {item.details?.map((detail, detailIndex) => {
                                                            // Tạo combo phân loại từ classification_name hoặc attribute names
                                                            const getClassificationDisplay = () => {
                                                                if (detail.attribute1_name && detail.attribute2_name) {
                                                                    return `${detail.attribute1_name} - ${detail.attribute2_name}`;
                                                                }
                                                                if (detail.classification_name) {
                                                                    return detail.classification_name;
                                                                }
                                                                return `Phân loại ${detailIndex + 1}`;
                                                            };

                                                            return (
                                                                <div key={detail.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                                                        <div className="md:col-span-2">
                                                                            <div className="text-xs text-gray-500">
                                                                                ID: {detail.classification_attribute_relationship_id}
                                                                            </div>
                                                                            <div className="text-sm font-medium text-gray-800">
                                                                                {getClassificationDisplay()}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <div className="text-xs text-gray-500">Số lượng nhập</div>
                                                                            <div className="text-sm font-semibold text-blue-700">
                                                                                {formatCurrency(detail.import_quantity)}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <div className="text-xs text-gray-500">Giá nhập</div>
                                                                            <div className="text-sm font-semibold text-green-700">
                                                                                {formatCurrencyWithUnit(detail.import_price)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                                                                        <span className="text-sm font-bold text-purple-700">
                                                                            Thành tiền: {formatCurrencyWithUnit(detail.import_quantity * detail.import_price)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        {importProducts.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                                    Không có dữ liệu nhập kho nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* PHẦN PHÂN TRANG (Giữ nguyên) */}
                {totalPages > 1 && (
                    <div className="p-4 flex flex-col sm:flex-row items-center justify-between bg-gray-50">
                        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                            Hiển thị từ <span className="font-semibold">{startIndex}</span> đến <span className="font-semibold">{endIndex}</span> trong tổng số <span className="font-semibold">{totalItems}</span> mục
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                title='a'
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-full transition duration-150 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex space-x-1">
                                {getPageNumbers().map(page => (
                                    <button
                                        key={page}
                                        onClick={() => onPageChange(page)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition duration-150 ${page === currentPage
                                            ? 'bg-orange-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                title='Next Page'
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-full transition duration-150 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
                {/* ------------------------------------ */}
            </div>
        </div>
    );
};

export default ImportProductTable;

