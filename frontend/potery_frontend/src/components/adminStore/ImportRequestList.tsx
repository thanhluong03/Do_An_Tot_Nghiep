"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    listImportRequestsByStore,
    deleteImportRequest,
    ImportRequest
} from "@/api/services/importRequestService";
import toast from "react-hot-toast";
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"; 
import ModalEditImportRequest from "@/components/adminStore/ModalEditImportRequest";
// 👇 IMPORT COMPONENT CONFIRM DIALOG
import ConfirmDialog from "@/components/common/ConfirmDialog"; 


export default function ImportRequestList({ storeId }: { storeId: number }) {
    // Logic cũ
    const [requests, setRequests] = useState<ImportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [allRequests, setAllRequests] = useState<ImportRequest[]>([]); 
    
    // Logic phân trang 
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); 
    
    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ImportRequest | null>(null);
    
    // THÊM STATE ĐỂ QUẢN LÝ CHẾ ĐỘ CỦA MODAL
    const [modalMode, setModalMode] = useState<"view" | "edit">("edit");
    
    // 👇 STATES MỚI CHO CONFIRM DIALOG
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<{ id: number, status: string } | null>(null);


    const openView = (req: ImportRequest) => {
        setSelectedRequest(req);
        setModalMode("view"); 
        setEditModalOpen(true);
    };

    const openEdit = (req: ImportRequest) => {
        // Chỉ cho phép sửa khi trạng thái là PENDING hoặc DRAFT
        if (req.import_request_status !== 'PENDING' && req.import_request_status !== 'DRAFT') {
            return toast.error("Chỉ có thể sửa yêu cầu ở trạng thái PENDING hoặc DRAFT.");
        }
        setSelectedRequest(req);
        setModalMode("edit"); 
        setEditModalOpen(true);
    };


    const loadData = async () => {
        setLoading(true);
        try {
            // Vẫn dùng logic cũ: gọi API để lấy TOÀN BỘ dữ liệu
            const data = await listImportRequestsByStore(storeId);
            setAllRequests(data); 
            // Sau khi tải lại data mới, reset về trang 1
            setCurrentPage(1); 
            
        } catch (err) {
            toast.error("Không tải được danh sách yêu cầu");
        }
        setLoading(false);
    };

    // 👇 HÀM XÁC NHẬN XÓA (mở dialog)
    const handleConfirmDelete = (id: number, status: string) => {
        // Chỉ cho phép xóa khi trạng thái là PENDING hoặc DRAFT
        if (status !== 'PENDING' && status !== 'DRAFT') {
            return toast.error("Chỉ có thể xóa yêu cầu ở trạng thái PENDING hoặc DRAFT.");
        }
        
        setRequestToDelete({ id, status });
        setIsConfirmOpen(true);
        loadData();
    };

    // 👇 HÀM THỰC THI XÓA (gọi khi bấm Đồng ý trong dialog)
    const executeDelete = async () => {
        if (!requestToDelete) return;

        setIsConfirmOpen(false); // Đóng dialog

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
    
    // LOGIC PHÂN TRANG (Client-side Pagination)
    
    const currentRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allRequests.slice(startIndex, endIndex);
    }, [allRequests, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(allRequests.length / itemsPerPage);
    }, [allRequests.length, itemsPerPage]);
    
    useEffect(() => {
        setRequests(currentRequests);
    }, [currentRequests]);
    
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    useEffect(() => {
        if (storeId) loadData();
    }, [storeId]);


    if (loading) return <p className="mt-6 text-gray-500 text-center">Đang tải danh sách...</p>;

    return (
        <div className="mt-10">

            <div className="text-xl font-bold mb-3 text-gray-800">
                Danh sách yêu cầu nhập hàng
            </div>

            <div className="overflow-x-auto rounded-xl shadow-lg mt-4 border border-gray-100">
                <table className="min-w-full border-collapse bg-white table-fixed">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 text-[10px] uppercase tracking-wider font-bold border-b border-gray-200">
                            <th className="px-4 py-3 text-left w-[60px] rounded-tl-xl">ID</th>
                            <th className="px-4 py-3 text-left w-[160px]">Ngày tạo</th>
                            <th className="px-4 py-3 text-left">Ghi chú</th>
                            <th className="px-4 py-3 text-center w-[120px]">Trạng thái</th>
                            <th className="px-4 py-3 text-center w-[200px] rounded-tr-xl">Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-5 text-gray-500">
                                    Không có yêu cầu nhập hàng nào.
                                </td>
                            </tr>
                        )}

                        {requests.map((req) => (
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

                                <td className="px-4 py-3 text-center font-bold text-blue-600 uppercase text-xs">
                                    {req.import_request_status}
                                </td>

                                <td className="px-4 py-3 text-center space-x-1">

                                    <button
                                        title="Xem chi tiết"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                        onClick={() => openView(req)} 
                                    >
                                        <Eye size={15} />
                                    </button>

                                    {/* Cho phép sửa/xóa nếu trạng thái là PENDING hoặc DRAFT */}
                                    {(req.import_request_status === 'PENDING' || req.import_request_status === 'DRAFT') && (
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
                                                onClick={() => handleConfirmDelete(req.id, req.import_request_status)} // Dùng hàm mới
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
                {allRequests.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                        <p className="text-sm text-gray-600">
                            Hiển thị {((currentPage - 1) * itemsPerPage) + 1} -{" "}
                            {Math.min(currentPage * itemsPerPage, allRequests.length)} trên {allRequests.length} yêu cầu
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

                            {/* Hiển thị số trang */}
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

                {/* 👇 TÍCH HỢP CONFIRM DIALOG */}
                {isConfirmOpen && (
                    <ConfirmDialog
                        title="Xác nhận Xóa Yêu cầu"
                        message={`Bạn có chắc chắn muốn xóa yêu cầu nhập hàng ID ${requestToDelete?.id} này không? Hành động này không thể hoàn tác.`}
                        onConfirm={executeDelete}
                        onCancel={() => {
                            setIsConfirmOpen(false);
                            setRequestToDelete(null); // Đảm bảo reset state
                        }}
                        
                        confirmText="Xác nhận Xóa"
                    />
                )}
                {/* 👆 KẾT THÚC CONFIRM DIALOG */}

            </div>
        </div>
    );
}