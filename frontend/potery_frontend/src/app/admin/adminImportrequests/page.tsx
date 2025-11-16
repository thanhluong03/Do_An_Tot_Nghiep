"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    ImportRequest,
    ImportRequestDetail,
    listImportRequests,
    getImportRequestDetail,
    acceptImportRequest,
    deleteImportRequest,
} from "@/api/services/importRequestService";
import {
    Check,
    Trash2,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    AlertTriangle, // Đảm bảo đã import icon này nếu dùng trong ConfirmDialog.tsx
} from "lucide-react";
import toast from "react-hot-toast";

// Import component ConfirmDialog và ImportRequestDetailModal
import ImportRequestDetailModal from "@/components/adminRequestImport/ImportRequestDetailModal";
import ConfirmDialog from "@/components/common/ConfirmDialog"; // Giả định path là "@/components/common/ConfirmDialog"
import { getProducts, Product } from "@/api/services/productApi";

const ITEMS_PER_PAGE = 10;

type Status = "ALL" | "PENDING" | "ACCEPTED" | string;

// Helper để định dạng màu cho trạng thái (giữ nguyên)
const getStatusClasses = (status: ImportRequest['import_request_status']) => {
    switch (status) {
        case "PENDING":
            return "bg-yellow-100 text-yellow-800";
        case "ACCEPTED":
            return "bg-green-100 text-green-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

// Lấy tên tiếng Việt cho trạng thái (giữ nguyên)
const getVietnameseStatusName = (status: Status) => {
    switch (status) {
        case "ALL":
            return "Tất cả";
        case "PENDING":
            return "Đang chờ";
        case "ACCEPTED":
            return "Đã duyệt";
        default:
            return status;
    }
};

// ⭐ KHAI BÁO TYPE CHO MODAL XÁC NHẬN
type ConfirmationAction = "APPROVE" | "DELETE";

export default function ImportRequestListAdmin() {
    const [activeStatus, setActiveStatus] = useState<Status>("ALL");
    const [filterDate, setFilterDate] = useState<string>("");

    const [requests, setRequests] = useState<ImportRequest[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ImportRequest | null>(null);
    const [selectedDetails, setSelectedDetails] = useState<ImportRequestDetail[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // ⭐ STATE MỚI CHO CONFIRM DIALOG
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        requestId: number | null;
        action: ConfirmationAction | null;
        title: string;
        message: string;
    }>({
        isOpen: false,
        requestId: null,
        action: null,
        title: "",
        message: "",
    });

    const statusTabs: Status[] = ["ALL", "PENDING", "ACCEPTED"];

    const fetchAllProducts = useCallback(async () => {
        try {
            const productsData = await getProducts();
            setProducts(productsData);
        } catch (error) {
            console.error("Lỗi tải danh sách sản phẩm:", error);
        }
    }, []);

    const fetchRequests = useCallback(async (currentPage: number) => {
        setIsLoading(true);
        try {
            const { data, total } = await listImportRequests(currentPage, ITEMS_PER_PAGE);
            setRequests(data);
            setTotal(total);
        } catch (error) {
            console.error("Lỗi tải yêu cầu nhập hàng:", error);
            toast.error("Không tải được danh sách yêu cầu nhập hàng.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests(page);
        fetchAllProducts();
    }, [page, fetchRequests, fetchAllProducts]);

    const handleStatusChange = (status: Status) => {
        setActiveStatus(status);
        setPage(1);
    };

    const handleClearAllFilters = () => {
        setActiveStatus("ALL");
        setFilterDate("");
        setPage(1);
    };

    const handleViewDetails = async (request: ImportRequest) => {
        setSelectedRequest(request);
        setSelectedDetails([]);
        setIsModalOpen(true);
        setIsLoadingDetails(true);

        try {
            const details = await getImportRequestDetail(request.id);
            setSelectedDetails(details);
        } catch (error) {
            console.error("Lỗi tải chi tiết yêu cầu:", error);
            toast.error("Không tải được chi tiết yêu cầu.");
            setSelectedDetails([]);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // ⭐ CẬP NHẬT: Mở Confirm Dialog cho hành động Duyệt
    const handleApprove = (requestId: number) => {
        setConfirmation({
            isOpen: true,
            requestId,
            action: "APPROVE",
            title: "Xác nhận Duyệt Yêu cầu",
            message: `Bạn có chắc chắn muốn **CHẤP NHẬN** yêu cầu ID ${requestId} này? Hành động này sẽ trừ tồn kho toàn bộ số lượng đã yêu cầu trong kho tổng.`,
        });
    };

    // ⭐ CẬP NHẬT: Mở Confirm Dialog cho hành động Xóa
    const handleDelete = (requestId: number) => {
        setConfirmation({
            isOpen: true,
            requestId,
            action: "DELETE",
            title: "Xác nhận Hủy/Xóa Yêu cầu",
            message: `Bạn có chắc chắn muốn **XÓA (HỦY)** yêu cầu ID ${requestId} này? Hành động này không thể hoàn tác.`,
        });
    };

    // ⭐ HÀM MỚI: Xử lý logic sau khi xác nhận từ ConfirmDialog
    const handleConfirmAction = async () => {
        if (!confirmation.requestId || !confirmation.action) return;

        const requestId = confirmation.requestId;
        const action = confirmation.action;

        // Đóng dialog ngay lập tức
        setConfirmation({ ...confirmation, isOpen: false });

        if (action === "APPROVE") {
            const toastLoading = toast.loading(`Đang xử lý duyệt yêu cầu ${requestId} và cập nhật tồn kho...`);

            try {
                const details = await getImportRequestDetail(requestId);

                if (details.length === 0) {
                    throw new Error("Không tìm thấy chi tiết yêu cầu.");
                }

                const acceptDetailsPayload = details.map(detail => {
                    if (!detail.id) {
                        throw new Error(`Chi tiết yêu cầu (detail) thiếu ID.`);
                    }
                    return {
                        detail_id: detail.id,
                        product_id: detail.product_id,
                        classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                        accept_quantity: detail.requested_quantity, // Chấp nhận toàn bộ
                    };
                });

                await acceptImportRequest(requestId, acceptDetailsPayload);

                toast.success(`Chấp nhận và cập nhật tồn kho cho yêu cầu ID ${requestId} thành công!`, { id: toastLoading });
                fetchRequests(page);
            } catch (error: any) {
                console.error("Lỗi chấp nhận yêu cầu:", error);
                toast.error(`Lỗi khi chấp nhận yêu cầu: ${error.message || 'Lỗi không xác định'}`, { id: toastLoading });
            }
        } else if (action === "DELETE") {
            const toastLoading = toast.loading(`Đang xóa yêu cầu ID ${requestId}...`);

            try {
                await deleteImportRequest(requestId);

                toast.success(`Yêu cầu ID ${requestId} đã được xóa (hủy) thành công!`, { id: toastLoading });
                fetchRequests(page);
            } catch (error: any) {
                console.error("Lỗi xóa yêu cầu:", error);
                toast.error(`Lỗi khi xóa yêu cầu: ${error.response?.data?.message || error.message || 'Lỗi không xác định'}`, { id: toastLoading });
            }
        }
    };

    const handleApproveFromModal = async (acceptedItems: { detail_id: number; accept_quantity: number }[]) => {
        if (!selectedRequest) return;

        const requestId = selectedRequest.id;

        const toastLoading = toast.loading("Đang duyệt yêu cầu...");

        try {
            const payload = selectedDetails.map(detail => {
                const userInput = acceptedItems.find(x => x.detail_id === detail.id);

                return {
                    detail_id: detail.id!,
                    product_id: detail.product_id,
                    classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
                    accept_quantity: userInput?.accept_quantity ?? detail.requested_quantity
                };
            });

            await acceptImportRequest(requestId, payload);

            toast.success("Duyệt yêu cầu thành công!", { id: toastLoading });

            setIsModalOpen(false);
            fetchRequests(page);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Lỗi duyệt yêu cầu", { id: toastLoading });
        }
    };

    // Hàm hủy bỏ xác nhận (Đóng modal xác nhận)
    const handleCancelConfirmation = () => {
        setConfirmation({
            isOpen: false,
            requestId: null,
            action: null,
            title: "",
            message: "",
        });
    };

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const filteredRequests = requests.filter((req) => {
        if (activeStatus !== "ALL" && req.import_request_status !== activeStatus) {
            return false;
        }

        if (filterDate) {
            const reqDate = new Date(req.created_at).toISOString().split("T")[0];
            if (reqDate !== filterDate) return false;
        }

        return true;
    });

    if (isLoading) return <p className="text-center p-6">Đang tải dữ liệu...</p>;

    return (
        <div className="p-6 max-w-7xl bg-white rounded-xl shadow-lg mx-auto mt-4">
            <h1 className="text-2xl font-bold mb-7 text-gray-800 text-center pb-3">
                Danh sách yêu cầu nhập hàng từ kho tổng
            </h1>

            {/* 👇 PHẦN LỌC: TAB TRẠNG THÁI & NGÀY (Giữ nguyên) */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4  rounded-xl">
                    <div className="flex items-center space-x-3 w-full sm:w-auto overflow-x-auto">
                        <Filter size={18} className="text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 flex-shrink-0 whitespace-nowrap">Trạng thái:</span>
                        <div className="flex space-x-2 p-1 bg-white rounded-lg shadow-inner">
                            {statusTabs.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-md whitespace-nowrap transition duration-200 ${
                                        activeStatus === status
                                            ? "bg-orange-600 text-white shadow-md"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {getVietnameseStatusName(status)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-wrap gap-y-2 sm:flex-nowrap">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Ngày tạo:</label>
                            <input
                                title="date"
                                type="date"
                                value={filterDate}
                                onChange={(e) => {
                                    setFilterDate(e.target.value);
                                    setPage(1);
                                }}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-orange-500 focus:border-orange-500 w-[120px]"
                            />
                        </div>

                        {(filterDate || activeStatus !== "ALL") && (
                            <button
                                onClick={handleClearAllFilters}
                                className="p-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-1 ml-2 flex-shrink-0"
                                title="Xóa bộ lọc"
                            >
                                <X size={15} />
                                <span className="hidden sm:inline">Xóa lọc</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* 👆 KẾT THÚC PHẦN LỌC */}

            {filteredRequests.length === 0 ? (
                <p className="text-center text-gray-500 p-10">
                    {activeStatus === "ALL" && !filterDate
                        ? "Không có yêu cầu nhập hàng nào trong hệ thống."
                        : `Không tìm thấy yêu cầu nào phù hợp với bộ lọc hiện tại.`
                    }
                </p>
            ) : (
                <div className="overflow-x-auto rounded-xl shadow-md">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-xl w-[60px]">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Cửa hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Ngày tạo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-xl w-[220px]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[150px] truncate">
                                        {request.store_name || (request.store ? request.store.store_name : `ID: ${request.store_id}`)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(request.import_request_status)}`}>
                                            {getVietnameseStatusName(request.import_request_status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(request.created_at).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {request.note || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex justify-center space-x-2">
                                            {/* Nút Chi tiết */}
                                            <button
                                                onClick={() => handleViewDetails(request)}
                                                className="text-orange-600 hover:text-indigo-900 font-medium text-sm px-2 py-1 border border-orange-200 rounded-lg transition duration-150"
                                            >
                                                Xem chi tiết
                                            </button>

                                            {request.import_request_status === "PENDING" && (
                                                <>
                                                    {/* CẬP NHẬT: Thay window.confirm bằng handleApprove */}
                                                    <button
                                                        title="Duyệt nhanh"
                                                        onClick={() => handleApprove(request.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-200 text-green-800 rounded-lg hover:bg-green-300 transition"
                                                    >
                                                        Duyệt
                                                        <Check size={14} />
                                                    </button>

                                                    {/* CẬP NHẬT: Thay window.confirm bằng handleDelete */}
                                                    <button
                                                        title="Xóa/Hủy yêu cầu"
                                                        onClick={() => handleDelete(request.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                            {(request.import_request_status === "ACCEPTED" && (
                                                <span className="text-gray-400 italic text-sm py-2">Đã xử lý</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls (Giữ nguyên) */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-600">
                        Hiển thị {((page - 1) * ITEMS_PER_PAGE) + 1} -{" "}
                        {Math.min(page * ITEMS_PER_PAGE, total)} trên {total} yêu cầu (Đã lọc)
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
                            title="Trang trước"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setPage(index + 1)}
                                className={`px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium transition ${
                                    page === index + 1
                                        ? "bg-orange-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
                            title="Trang sau"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Chi tiết (Giữ nguyên) */}
            {isModalOpen && selectedRequest && (
                <ImportRequestDetailModal
                    allProducts={products}
                    request={selectedRequest}
                    details={selectedDetails}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedDetails([]);
                    }}
                    isLoadingDetails={isLoadingDetails}
                    onApprove={handleApproveFromModal}
                />
            )}

            {/* ⭐ CONFIRM DIALOG MỚI */}
            {confirmation.isOpen && (
                <ConfirmDialog
                    title={confirmation.title}
                    message={confirmation.message}
                    confirmText={confirmation.action === "APPROVE" ? "Duyệt ngay" : "Xóa"}
                    cancelText="Hủy bỏ"
                    onConfirm={handleConfirmAction}
                    onCancel={handleCancelConfirmation}
                />
            )}
        </div>
    );
}