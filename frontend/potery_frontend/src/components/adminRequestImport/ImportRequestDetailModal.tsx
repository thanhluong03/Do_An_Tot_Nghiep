// src/components/admin/ImportRequestDetailModal.tsx

import React from 'react';
import { ImportRequest, ImportRequestDetail, ClassificationAttributeRelationship } from "@/api/services/importRequestService";
import { X } from 'lucide-react';
import { getProductImageUrl, ProductRelationship } from "@/api/services/inventoryService";
import { Product } from '@/api/services/importRequestService';
interface ImportRequestDetailModalProps {
    request: ImportRequest;
    details: ImportRequestDetail[];
    onClose: () => void;
    isLoadingDetails: boolean;
    onApprove: (items: { detail_id: number; accept_quantity: number }[]) => void;
    allProducts: Product[];
}
// Giữ nguyên interface Product (cần đảm bảo nó khớp với Product trong ModalEditImportRequest)


const ImportRequestDetailModal: React.FC<ImportRequestDetailModalProps> = ({

    request,
    details,
    onClose,
    isLoadingDetails,
    onApprove,
    allProducts,
}) => {
    
    const [acceptDetails, setAcceptDetails] = React.useState<
        { detail_id: number; accept_quantity: number }[]
    >([]);
    React.useEffect(() => {
        if (details.length > 0) {
            setAcceptDetails(
                details.map(d => ({
                    detail_id: d.id!,
                    accept_quantity: d.accept_quantity ?? d.requested_quantity,
                }))
            );
        }
    }, [details]);

    const updateAcceptQuantity = (detailId: number, quantity: number) => {
        setAcceptDetails(prev => {
            const parsedQuantity = Math.max(0, Number(quantity)); // Đảm bảo không âm
            const exists = prev.find(d => d.detail_id === detailId);
            if (exists) {
                return prev.map(d =>
                    d.detail_id === detailId ? { ...d, accept_quantity: parsedQuantity } : d
                );
            }
            return [...prev, { detail_id: detailId, accept_quantity: parsedQuantity }];
        });
    };


    // Helper để định dạng màu cho trạng thái (Giữ nguyên)
    const getStatusClasses = (status: ImportRequest['import_request_status']) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-50 text-yellow-700 border border-yellow-200";
            case "ACCEPTED":
                return "bg-green-50 text-green-700 border border-green-200";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    };

    // Helper: Lấy tên phân loại (Giữ nguyên logic)
    const getClassificationName = (relationship: ImportRequestDetail['classificationAttributeRelationship']): string => {
        if (!relationship) return "Sản phẩm không thuộc tính";

        // Giả định ImportRequestDetail['classificationAttributeRelationship'] có chứa `attribute1` và `attribute2`
        const attr1Name = relationship.attribute1?.name;
        const attr2Name = relationship.attribute2?.name;

        if (attr1Name && attr2Name) {
            return `${attr1Name} / ${attr2Name}`;
        }
        if (attr1Name) {
            return attr1Name;
        }

        return "Không phân loại"; // Đổi từ "Không xác định" sang "Không phân loại"
    };

    // Lấy tên cửa hàng
    const storeName = request.store?.store_name || `ID: ${request.store_id}`;

    // Lấy số lượng đã duyệt của một chi tiết
    const getAcceptQuantity = (detailId: number | undefined, requestedQuantity: number): number => {
        if (detailId === undefined) return requestedQuantity;
        const accepted = acceptDetails.find(d => d.detail_id === detailId);
        return accepted ? accepted.accept_quantity : requestedQuantity;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex justify-center items-center p-4 sm:p-8">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto transform transition-all">

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
                        <p className="text-base text-gray-600 italic border-l-4 border-gray-200 pl-3 py-1 bg-gray-50 rounded-r-md whitespace-pre-wrap">
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
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ảnh</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Phân loại</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Số lượng cửa hàng yêu cầu</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Số lượng trong kho tổng</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Số lượng duyệt</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {details.map((detail, index) => {
                                        // 1. LẤY SỐ LƯỢNG DUYỆT HIỆN TẠI (state local)
                                        const currentAcceptQuantity = getAcceptQuantity(detail.id, detail.requested_quantity);
                                        // 2. LẤY URL ẢNH
                                        const product = allProducts.find((p) => p.id === detail.product_id);
                                        const imageUrl = detail.product ? getProductImageUrl(product as any) : "/placeholder-image.jpg";
                                        // 3. XÁC ĐỊNH TRẠNG THÁI CHỈNH SỬA
                                        const isEditable = request.import_request_status === "PENDING";

                                        return (
                                            <tr key={detail.id || index} className="hover:bg-blue-50/50 transition duration-150">
                                                {/* Ảnh sản phẩm - Sửa đổi để dùng logic trong ModalEditImportRequest */}
                                               <td className="px-6 py-4 whitespace-nowrap">
                                                    <img 
                                                         src={imageUrl} 
                                                         alt={detail.product?.name || 'Sản phẩm'} 
                                                         className="h-10 w-10 object-cover rounded-md border border-gray-200 shadow-sm"
                                                         onError={(e) => {
                                                             (e.target as HTMLImageElement).onerror = null;
                                                             (e.target as HTMLImageElement).src = "/placeholder-image.jpg"; 
                                                         }}
                                                     />
                                                </td>
                                                {/* Tên sản phẩm */}
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-sm">
                                                    {detail.product?.name || <span className='text-gray-400'>ID: {detail.product_id}</span>}
                                                </td>
                                                {/* Phân loại (Attribute) */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <span className='px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium'>
                                                        {getClassificationName(detail.classificationAttributeRelationship)}
                                                    </span>
                                                </td>
                                                {/* Requested Quantity */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-700">
                                                    {detail.requested_quantity.toLocaleString("vi-VN")}
                                                </td>
                                                {/* Stock Quantity (Tồn kho tổng) */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">
                                                    {detail.product?.total_quantity_divided?.toLocaleString("vi-VN") ?? 0}
                                                </td>
                                                {/* Số lượng duyệt */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                    {isEditable ? (
                                                        <input
                                                             title='Số lượng duyệt'
                                                             type="number"
                                                             min={0}
                                                             value={currentAcceptQuantity}
                                                             onChange={(e) => updateAcceptQuantity(detail.id!, Number(e.target.value))}
                                                             className="w-24 px-2 py-1 border border-gray-300 rounded-md text-right 
                                                               focus:ring-2 focus:ring-blue-400 focus:border-blue-500 font-bold"
                                                         />
                                                    ) : (
                                                        <span className='text-green-700 font-extrabold text-lg'>
                                                            {detail.accept_quantity?.toLocaleString("vi-VN") ?? detail.requested_quantity.toLocaleString("vi-VN")}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">

                    {/* Chỉ hiện nút duyệt khi trạng thái là PENDING */}
                    {request.import_request_status === "PENDING" && (
                        <button
                            onClick={() => onApprove(acceptDetails)}
                            className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
                        >
                            Duyệt yêu cầu
                        </button>
                    )}
                    
                    {/* Nút đóng luôn luôn hiển thị */}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition shadow-md"
                    >
                        Đóng
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ImportRequestDetailModal;