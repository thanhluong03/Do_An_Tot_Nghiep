// src/components/common/PaginationControls.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
}) => {
    // Math.ceil(5 / 10) = 1 (1 trang); Math.ceil(11 / 10) = 2 (2 trang)
    const totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | '...')[] = [];
        const maxPagesToShow = 5; 

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            if (start > 2) pages.push('...');
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (end < totalPages - 1) pages.push('...');
            
            pages.push(totalPages);
        }
        
        const uniquePages: (number | '...')[] = [];
        pages.forEach(p => {
            if (p !== '...' || uniquePages[uniquePages.length - 1] !== '...') {
                uniquePages.push(p);
            }
        });

        return uniquePages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center space-x-2 p-4 bg-white border-t border-gray-100 mt-4 rounded-b-xl">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
            >
                <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((page, index) => (
                <React.Fragment key={index}>
                    {page === '...' ? (
                        <span className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page as number)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                page === currentPage
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {page}
                        </button>
                    )}
                </React.Fragment>
            ))}

            <button
                
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default PaginationControls;