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

    const calculateTotals = (item: ImportProduct) => {
        if (item.products && item.products.length > 0) {
            return item.products.reduce(
                (acc, product) => {
                    if (product.classifications && product.classifications.length > 0) {
                        // Sản phẩm có phân loại
                        const productTotals = product.classifications.reduce(
                            (productAcc, classification) => ({
                                totalQuantity: productAcc.totalQuantity + (classification.import_quantity || 0),
                                totalAmount: productAcc.totalAmount + ((classification.import_quantity || 0) * (classification.import_price || 0))
                            }),
                            { totalQuantity: 0, totalAmount: 0 }
                        );
                        return {
                            totalQuantity: acc.totalQuantity + productTotals.totalQuantity,
                            totalAmount: acc.totalAmount + productTotals.totalAmount
                        };
                    } else {
                        // Sản phẩm không có phân loại
                        return {
                            totalQuantity: acc.totalQuantity + (product.import_quantity || 0),
                            totalAmount: acc.totalAmount + ((product.import_quantity || 0) * (product.import_price || 0))
                        };
                    }
                },
                { totalQuantity: 0, totalAmount: 0 }
            );
        }
        return { totalQuantity: 0, totalAmount: 0 };
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
                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider w-16">STT</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-wider w-32">Người nhập</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider w-1/6">Số lượng nhập</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-wider w-20">Nhà cung cấp</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold tracking-wider w-1/6">Ngày tạo</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider w-24">Tổng tiền</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold tracking-wider w-20">Chi tiết</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider w-16">Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {importProducts.map((item, index) => {
                            const { totalQuantity, totalAmount } = calculateTotals(item);
                            const stt = startIndex + index;
                            const isExpanded = expandedRows.has(item.id);
                            const hasProducts = item.products && item.products.length > 0;

                            return (
                                <React.Fragment key={item.id}>
                                    {/* Main Row */}
                                    <tr className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-600">
                                            {stt}
                                        </td>
                                        <td className="px-4 py-3 text-left text-sm text-gray-700 font-medium max-w-[120px]">
                                            <div className="text-gray-800 break-words truncate" title={item.user_name || 'N/A'}>{item.user_name || 'N/A'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-bold text-blue-700">
                                            {formatCurrency(totalQuantity)}
                                            {hasProducts && (
                                                <div className="text-xs text-gray-500">
                                                    {item.products?.length || 0} sản phẩm
                                                </div>
                                            )}
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
                                            <button
                                                onClick={() => toggleRowExpansion(item.id)}
                                                className="text-blue-500 hover:text-blue-700 p-2 rounded-full transition duration-150 bg-blue-50 hover:bg-blue-100"
                                                title={isExpanded ? "Thu gọn chi tiết" : "Xem chi tiết"}
                                            >
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
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
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-0 bg-gray-50">
                                                <div className="py-4">
                                                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                        <Eye size={14} className="text-blue-500" />
                                                        Chi tiết nhập hàng
                                                    </h5>
                                                    <div className="grid gap-3">
                                                        {item.products?.map((product) => (
                                                            <div key={product.product_id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                                                <div className="text-[15px] text-gray-800 mb-3">
                                                                    Sản phẩm: {product.product_name}
                                                                </div>
                                                                {product.classifications && product.classifications.length > 0 ? (
                                                                    // Sản phẩm có phân loại
                                                                    <div className="grid gap-2">
                                                                        {/* Header cho sản phẩm có phân loại */}
                                                                        <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                                                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                                                <div className="text-center">
                                                                                    <div className="text-xs font-semibold text-blue-600">STT</div>
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-xs font-semibold text-blue-600">Phân loại</div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="text-xs font-semibold text-blue-600">Số lượng</div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="text-xs font-semibold text-blue-600">Giá nhập</div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="text-xs font-semibold text-blue-600">Thành tiền</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* Dữ liệu từng phân loại */}
                                                                        {product.classifications.map((classification, index) => (
                                                                            <div key={classification.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                                                    <div className="text-center">
                                                                                        <div className="text-sm font-semibold text-gray-700">
                                                                                            {index + 1}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-sm font-medium text-gray-800">
                                                                                            {classification.classification_name}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-center">
                                                                                        <div className="text-sm font-semibold text-blue-700">
                                                                                            {formatCurrency(classification.import_quantity)}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-center">
                                                                                        <div className="text-sm font-semibold text-green-700">
                                                                                            {formatCurrencyWithUnit(classification.import_price)}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-center">
                                                                                        <div className="text-sm font-bold text-purple-700">
                                                                                            {formatCurrencyWithUnit(classification.import_quantity * classification.import_price)}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    // Sản phẩm không có phân loại
                                                                    <div className="grid gap-2">
                                                                        {/* Header cho sản phẩm không có phân loại */}
                                                                        <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                                                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                                                <div className="text-center">
                                                                                    <div className="text-xs font-semibold text-blue-600">STT</div>
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-xs font-semibold text-blue-600">Phân loại</div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="text-xs font-semibold text-blue-600">Số lượng</div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="text-xs font-semibold text-blue-600">Giá nhập</div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="text-xs font-semibold text-blue-600">Thành tiền</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {/* Dữ liệu sản phẩm không có phân loại */}
                                                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                                                                <div className="text-center">
                                                                                    <div className="text-sm font-semibold text-gray-700">
                                                                                        1
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-sm font-medium text-gray-800">
                                                                                        Không có phân loại
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="text-sm font-semibold text-blue-700">
                                                                                        {formatCurrency(product.import_quantity)}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="text-sm font-semibold text-green-700">
                                                                                        {formatCurrencyWithUnit(product.import_price)}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <div className="text-sm font-bold text-purple-700">
                                                                                        {formatCurrencyWithUnit((product.import_quantity || 0) * (product.import_price || 0))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
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
                            Hiển thị từ <span className="font-semibold">{startIndex}</span> đến <span className="font-semibold">{endIndex}</span> / tổng số <span className="font-semibold">{totalItems}</span> mục
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

