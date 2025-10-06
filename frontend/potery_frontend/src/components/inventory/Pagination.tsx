// src/components/common/Pagination.tsx (hoặc src/components/inventory/Pagination.tsx)

import React from 'react';

interface PaginationProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
}) => {
    // Tính toán tổng số trang
    const totalPages = Math.ceil(totalItems / pageSize);

    // Tạo mảng các số trang cần hiển thị (ví dụ: tối đa 5 trang)
    const getPageNumbers = () => {
        const pages: number[] = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        // Điều chỉnh để luôn có 5 nút nếu có đủ trang
        if (totalPages > 5) {
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
            }
            endPage = Math.min(totalPages, startPage + 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    // Các tùy chọn kích thước trang
    const sizeOptions = [10, 25, 50, 100];

    // Xử lý khi chọn kích thước trang
    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        onPageSizeChange(newSize);
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-wrap justify-between items-center mt-4">
            {/* Hiển thị số lượng mục */}
            <div className="text-sm text-gray-600">
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} mục trên tổng số {totalItems}.
            </div>

            {/* Điều khiển phân trang */}
            <div className="flex items-center space-x-2">
                {/* Chọn Page Size */}
                <select
                    value={pageSize}
                    onChange={handleSizeChange}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-blue-500 outline-none"
                    aria-label="Items per page"
                >
                    {sizeOptions.map(size => (
                        <option key={size} value={size}>
                            {size} / trang
                        </option>
                    ))}
                </select>

                {/* Nút Previous */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300"
                >
                    &laquo; Trước
                </button>

                {/* Các nút trang */}
                {pageNumbers.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                            page === currentPage
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Nút Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300"
                >
                    Sau &raquo;
                </button>
            </div>
        </div>
    );
};

export default Pagination;