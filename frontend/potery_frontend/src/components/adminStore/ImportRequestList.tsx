"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    listImportRequestsByStore,
    deleteImportRequest,
    ImportRequest
} from "@/api/services/importRequestService";
import toast from "react-hot-toast";
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"; 
import ModalEditImportRequest from "@/components/adminStore/ModalEditImportRequest";
import ConfirmDialog from "@/components/common/ConfirmDialog"; 

// Định nghĩa các trạng thái
type Status = "ALL" | "PENDING" | "ACCEPTED" | string; // Thêm 'ALL' cho tab Tất cả

interface StatusInfo {
    name: string;
    className: string;
}

const getVietnameseStatusInfo = (status: string): StatusInfo => {
    switch (status) {
        case "PENDING":
            return { 
                name: "Đang Chờ Xử Lý", 
                className: "text-yellow-600 font-bold"
            };
        case "ACCEPTED":
            return { 
                name: "Đã Chấp Nhận", 
                className: "text-green-600 font-bold"
            };
        case "COMPLETED": // Ví dụ thêm trạng thái
            return {
                name: "Đã Hoàn Thành",
                className: "text-blue-600 font-bold"
            };
        case "CANCELLED": // Ví dụ thêm trạng thái
            return {
                name: "Đã Hủy",
                className: "text-red-600 font-bold"
            };
        default:
            return { 
                name: status, 
                className: "text-gray-700 font-medium" 
            };
    }
};

// Định nghĩa kiểu dữ liệu cho FilteredRequests
interface FilteredRequests {
    allRequests: ImportRequest[];
    filteredCount: number;
}

export default function ImportRequestList({ storeId }: { storeId: number }) {
    const [allRequests, setAllRequests] = useState<ImportRequest[]>([]); 
    const [loading, setLoading] = useState(true);
    
    // Logic phân trang 
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); 
    
    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ImportRequest | null>(null);
    const [modalMode, setModalMode] = useState<"view" | "edit">("edit");
    
    // States cho Confirm Dialog
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<{ id: number, status: string } | null>(null);

    // 👇 STATES MỚI CHO LỌC VÀ TAB
    const [activeStatusTab, setActiveStatusTab] = useState<Status>("ALL");
    const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
    const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

    const statusTabs: Status[] = ["ALL", "PENDING", "ACCEPTED"];
    
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listImportRequestsByStore(storeId);
            setAllRequests(data); 
            setCurrentPage(1); 
        } catch (err) {
            toast.error("Không tải được danh sách yêu cầu");
        }
        setLoading(false);
    }, [storeId]);
    
    useEffect(() => {
        if (storeId) loadData();
    }, [storeId, loadData]); // Thêm loadData vào dependency array

    // 👇 LOGIC LỌC VÀ PHÂN TRANG
    const { currentRequests, totalPages, filteredCount } = useMemo(() => {
        // 1. Lọc theo trạng thái
        let filteredByStatus = allRequests;
        if (activeStatusTab !== "ALL") {
            filteredByStatus = allRequests.filter(req => req.import_request_status === activeStatusTab);
        }

        // 2. Lọc theo thời gian
        let finalFiltered = filteredByStatus;
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate).getTime() : 0;
            // Thêm 1 ngày vào endDate để bao gồm cả ngày đó
            const end = endDate ? new Date(endDate).getTime() + 86400000 : Infinity; 
            
            finalFiltered = filteredByStatus.filter(req => {
                const reqDate = new Date(req.created_at).getTime();
                return reqDate >= start && reqDate < end;
            });
        }

        const filteredCount = finalFiltered.length;
        const totalPages = Math.ceil(filteredCount / itemsPerPage);
        
        // 3. Phân trang
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentRequests = finalFiltered.slice(startIndex, endIndex);

        return { currentRequests, totalPages, filteredCount };
    }, [allRequests, activeStatusTab, startDate, endDate, currentPage, itemsPerPage]);

    // Đảm bảo currentPage không vượt quá totalPages khi lọc
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage === 0 && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);
    
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Hàm reset lọc
    const handleClearFilters = () => {
        setActiveStatusTab("ALL");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1); // Quay về trang 1 sau khi reset
    };

    // Hàm xóa (giữ nguyên logic cũ)
    const handleConfirmDelete = (id: number, status: string) => {
        if (status !== 'PENDING') { // Bỏ 'DRAFT' nếu không có trong API status
            return toast.error("Chỉ có thể xóa yêu cầu ở trạng thái Đang Chờ Xử Lý.");
        }
        
        setRequestToDelete({ id, status });
        setIsConfirmOpen(true);
    };

    const executeDelete = async () => {
        if (!requestToDelete) return;
        setIsConfirmOpen(false); 

        try {
            await deleteImportRequest(requestToDelete.id);
            toast.success("Đã xóa!");
            loadData(); 
        } catch (err) {
            toast.error("Xóa thất bại!");
        } finally {
            setRequestToDelete(null);
        }
    };
    // Hết logic xóa

    const openView = (req: ImportRequest) => {
        setSelectedRequest(req);
        setModalMode("view"); 
        setEditModalOpen(true);
    };

    const openEdit = (req: ImportRequest) => {
        if (req.import_request_status !== 'PENDING') {
            return toast.error("Chỉ có thể sửa yêu cầu ở trạng thái Đang Chờ Xử Lý.");
        }
        setSelectedRequest(req);
        setModalMode("edit"); 
        setEditModalOpen(true);
    };


    if (loading) return <p className="mt-6 text-gray-500 text-center">Đang tải danh sách...</p>;

    return (
        <div className="mt-10">
            <div className="text-xl font-bold mb-5 text-gray-800 pb-3">
                Danh sách yêu cầu nhập hàng
            </div>
            
            {/* 👇 THANH LỌC: DATE FILTER VÀ STATUS TABS */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                {/* STATUS TABS */}
                <div className="flex space-x-2 p-1  rounded-xl shadow-inner w-full sm:w-auto overflow-x-auto">
                    {statusTabs.map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setActiveStatusTab(status);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition duration-200 ${
                                activeStatusTab === status
                                    ? "bg-orange-600 text-white shadow-md"
                                    : "text-gray-700 hover:bg-white"
                            }`}
                        >
                            {status === "ALL" ? "Tất cả" : getVietnameseStatusInfo(status).name}
                        </button>
                    ))}
                </div>
                {/* LỌC THEO THỜI GIAN */}
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <Filter size={20} className="text-gray-500 hidden sm:block" />
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Từ ngày:</label>
                        <input
                            
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-orange-500 focus:border-orange-500 w-[120px]"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Đến ngày:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-orange-500 focus:border-orange-500 w-[120px]"
                        />
                    </div>
                    {(startDate || endDate || activeStatusTab !== "ALL") && (
                        <button 
                            onClick={handleClearFilters}
                            className="p-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-1 ml-2"
                            title="Xóa bộ lọc"
                        >
                            <X size={15} />
                            <span className="hidden sm:inline">Xóa lọc</span>
                        </button>
                    )}
                </div>

                
            </div>
            {/* 👆 KẾT THÚC THANH LỌC */}

            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
                <table className="min-w-full border-collapse bg-white table-fixed">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-[10px] uppercase tracking-wider font-bold border-b border-gray-200">
                            <th className="px-4 py-3 text-left w-[60px] rounded-tl-xl">ID</th>
                            <th className="px-4 py-3 text-left w-[160px]">Ngày tạo</th>
                            <th className="px-4 py-3 text-left">Ghi chú</th>
                            <th className="px-4 py-3 text-center w-[200px]">Trạng thái</th>
                            <th className="px-4 py-3 text-center w-[200px] rounded-tr-xl">Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentRequests.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-5 text-gray-500">
                                    {filteredCount === 0 ? "Không tìm thấy yêu cầu nào." : "Không có yêu cầu nhập hàng nào."}
                                </td>
                            </tr>
                        )}

                        {currentRequests.map((req) => (
                            <tr
                                key={req.id}
                                className="border-t border-gray-100 hover:bg-blue-50/70 text-sm text-gray-700 transition duration-150"
                            >
                                <td className="px-4 py-3 font-semibold text-gray-800">
                                    {req.id}
                                </td>

                                <td className="px-4 py-3 text-xs text-gray-600">
                                    {new Date(req.created_at).toLocaleString("vi-VN")}
                                </td>

                                <td className="px-4 py-3 text-sm break-words max-w-[350px]">
                                    {req.note || "(không)"}
                                </td>

                                <td className={`px-4 py-3 text-center font-bold uppercase text-xs ${getVietnameseStatusInfo(req.import_request_status).className}`}>
                                    {getVietnameseStatusInfo(req.import_request_status).name}
                                </td>

                                <td className="px-4 py-3 text-center space-x-1">

                                    <button
                                        title="Xem chi tiết"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                        onClick={() => openView(req)} 
                                    >
                                        <Eye size={15} />
                                    </button>

                                    {/* Cho phép sửa/xóa nếu trạng thái là PENDING */}
                                    {(req.import_request_status === 'PENDING') && (
                                        <>
                                            <button
                                                title="Sửa"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                                                onClick={() => openEdit(req)} 
                                            >
                                                <Pencil size={15} />
                                            </button>

                                            <button
                                                title="Xóa"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                onClick={() => handleConfirmDelete(req.id, req.import_request_status)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* PHẦN PHÂN TRANG */}
                {filteredCount > itemsPerPage && (
                    <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                        <p className="text-sm text-gray-600">
                            Hiển thị {((currentPage - 1) * itemsPerPage) + 1} -{" "}
                            {Math.min(currentPage * itemsPerPage, filteredCount)} trên {filteredCount} yêu cầu
                            {filteredCount !== allRequests.length && (
                                <span className="ml-1 text-gray-500 italic"> (trong tổng số {allRequests.length})</span>
                            )}
                        </p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
                                title="Trang trước"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium transition ${
                                        currentPage === index + 1
                                            ? "bg-orange-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
                                title="Trang sau"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
                {/* KẾT THÚC PHẦN PHÂN TRANG */}


                <ModalEditImportRequest
                    open={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        loadData();
                    }}
                    request={selectedRequest}
                    mode={modalMode} 
                />

                {isConfirmOpen && (
                    <ConfirmDialog
                        title="Xác nhận Xóa Yêu cầu"
                        message={`Bạn có chắc chắn muốn xóa yêu cầu nhập hàng ID ${requestToDelete?.id} này không? Hành động này không thể hoàn tác.`}
                        onConfirm={executeDelete}
                        onCancel={() => {
                            setIsConfirmOpen(false);
                            setRequestToDelete(null); 
                        }}
                        confirmText="Xác nhận Xóa"
                    />
                )}
            </div>
        </div>
    );
}