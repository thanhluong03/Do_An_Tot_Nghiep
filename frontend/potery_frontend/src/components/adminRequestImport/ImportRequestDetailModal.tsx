// src/components/admin/ImportRequestDetailModal.tsx

import React from 'react';
import { ImportRequest, ImportRequestDetail, ClassificationAttributeRelationship } from "@/api/services/importRequestService"; 
import { X } from 'lucide-react';

interface ImportRequestDetailModalProps {
    request: ImportRequest;
    details: ImportRequestDetail[];
    onClose: () => void;
    isLoadingDetails: boolean;
}

const ImportRequestDetailModal: React.FC<ImportRequestDetailModalProps> = ({ 
    request, 
    details, 
    onClose,
    isLoadingDetails,
}) => {
    
    // Helper để định dạng màu cho trạng thái (Giữ nguyên)
    const getStatusClasses = (status: ImportRequest['import_request_status']) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-50 text-yellow-700 border border-yellow-200"; // Hiện đại hơn: dùng bg-50 và border nhẹ
            case "ACCEPTED":
                return "bg-green-50 text-green-700 border border-green-200";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    };

    // Helper để định dạng tiền tệ (Không dùng ở đây nhưng giữ lại)
    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
    };
    
    // Helper: Lấy tên phân loại (Giữ nguyên logic)
    const getClassificationName = (relationship: ClassificationAttributeRelationship | null | undefined): string => {
        if (!relationship) return "Sản phẩm không thuộc tính";

        const attr1Name = relationship.attribute1?.name;
        const attr2Name = relationship.attribute2?.name;
        
        if (attr1Name && attr2Name) {
            return `${attr1Name} / ${attr2Name}`;
        }
        if (attr1Name) {
            return attr1Name;
        }

        return "Không xác định";
    };

    // Lấy tên cửa hàng
    const storeName = request.store_name || (request.store ? request.store.store_name : `ID: ${request.store_id}`);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex justify-center items-center p-4 sm:p-8">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
                
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        Chi tiết Yêu cầu Nhập hàng <span className='font-mono text-blue-600'>#{request.id}</span>
                    </h2>
                    <button
                        title='Đóng' 
                        onClick={onClose} 
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Thông tin chung */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-200">
                    <div className='col-span-1'>
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Cửa hàng</p>
                        <p className="text-lg font-bold text-gray-900">{storeName}</p>
                    </div>
                    <div className='col-span-1'>
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Trạng thái</p>
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full ${getStatusClasses(request.import_request_status)}`}>
                            {request.import_request_status}
                        </span>
                    </div>
                    <div className='col-span-1'>
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Ngày yêu cầu</p>
                        <p className="text-lg text-gray-900">{new Date(request.created_at).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <div className="col-span-1 md:col-span-3">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Ghi chú</p>
                        <p className="text-base text-gray-600 italic border-l-4 border-gray-200 pl-3 py-1 bg-gray-50 rounded-r-md">
                            {request.note || "Không có ghi chú"}
                        </p>
                    </div>
                </div>

                {/* Danh sách Sản phẩm */}
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-5 text-gray-800 border-b border-gray-200 pb-2">Sản phẩm yêu cầu</h3>
                    {isLoadingDetails ? (
                        <p className="text-center text-gray-500 py-10">Đang tải chi tiết sản phẩm...</p>
                    ) : details.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">Không tìm thấy sản phẩm nào trong yêu cầu.</p>
                    ) : (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Phân loại</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Yêu cầu (SL)</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Đã duyệt (SL)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {details.map((detail, index) => (
                                        <tr key={detail.id || index} className="hover:bg-blue-50/50 transition duration-150">
                                            {/* Tên sản phẩm */}
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-sm">
                                                {detail.product?.name || detail.product_name || <span className='text-gray-400'>ID: {detail.product_id}</span>}
                                            </td>
                                            {/* Phân loại (Attribute) */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span className='px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium'>
                                                    {getClassificationName(detail.classificationAttributeRelationship)}
                                                </span>
                                            </td>
                                            {/* Requested Quantity */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-blue-700">
                                                {detail.requested_quantity}
                                            </td>
                                            {/* Accepted Quantity */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-green-700">
                                                {(detail as any).accept_quantity !== null && (detail as any).accept_quantity !== undefined 
                                                    ? (detail as any).accept_quantity 
                                                    : (request.import_request_status === 'ACCEPTED' ? detail.requested_quantity : 0)
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-100 flex justify-end rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                        Đóng chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportRequestDetailModal;