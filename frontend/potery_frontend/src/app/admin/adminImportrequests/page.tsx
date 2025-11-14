// src/components/admin/ImportRequestListAdmin.tsx

"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ImportRequest,
  listImportRequests,
  getImportRequestDetail, 
  acceptImportRequest,
} from "@/api/services/importRequestService"; 

import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

// Helper để định dạng màu cho trạng thái (chỉ còn PENDING và ACCEPTED)
const getStatusClasses = (status: ImportRequest['import_request_status']) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "ACCEPTED":
      return "bg-green-100 text-green-800";
    // REJECTED đã được loại bỏ theo yêu cầu, các trạng thái khác sẽ dùng default
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ImportRequestListAdmin() {
  const [requests, setRequests] = useState<ImportRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm tải dữ liệu yêu cầu
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
  }, [page, fetchRequests]);

  // Xử lý CHẤP NHẬN yêu cầu bằng API trừ tồn kho (/acceptimportrequest/:id)
  const handleApprove = async (requestId: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn CHẤP NHẬN yêu cầu ID ${requestId} này? Hành động này sẽ trừ tồn kho toàn bộ số lượng đã yêu cầu trong kho tổng.`)) {
      return;
    }

    const toastLoading = toast.loading(`Đang xử lý yêu cầu ${requestId} và cập nhật tồn kho...`);

    try {
      // 1. Fetch details: Lấy chi tiết yêu cầu
      const details = await getImportRequestDetail(requestId);

      if (details.length === 0) {
          throw new Error("Không tìm thấy chi tiết yêu cầu.");
      }

      // 2. Construct Payload: Xây dựng payload, giả định chấp nhận toàn bộ
      const acceptDetailsPayload = details.map(detail => {
        if (!detail.id) {
          throw new Error(`Chi tiết yêu cầu (detail) thiếu ID.`);
        }
        return {
          detail_id: detail.id, 
          product_id: detail.product_id,
          classification_attribute_relationship_id: detail.classification_attribute_relationship_id,
          accept_quantity: detail.requested_quantity, // Chấp nhận toàn bộ số lượng yêu cầu
        };
      });

      // 3. Call Correct API: Gọi API chuyên biệt để trừ tồn kho và set trạng thái thành ACCEPTED
      await acceptImportRequest(requestId, acceptDetailsPayload); 
      
      toast.success(`Chấp nhận và cập nhật tồn kho cho yêu cầu ID ${requestId} thành công!`, { id: toastLoading });
      fetchRequests(page);
    } catch (error: any) {
      console.error("Lỗi chấp nhận yêu cầu:", error);
      toast.error(`Lỗi khi chấp nhận yêu cầu: ${error.message || 'Lỗi không xác định'}`, { id: toastLoading });
    }
  };
  
  // ❌ Đã xóa: Xử lý TỪ CHỐI yêu cầu (handleReject)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (isLoading) return <p className="text-center p-6">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 max-w-7xl bg-white rounded-xl shadow-md mx-auto mt-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
        Danh sách Yêu cầu Nhập hàng (Admin Tổng)
      </h1>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500 p-10">Không có yêu cầu nhập hàng nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cửa hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.store_name || `ID: ${request.store_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(request.import_request_status)}`}>
                      {request.import_request_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {request.note || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    {request.import_request_status === "PENDING" ? (
                      <div className="flex justify-center">
                        <button
                          // Chỉ còn nút Duyệt
                          onClick={() => handleApprove(request.id)} 
                          className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-4 py-2"
                        >
                          Duyệt
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            &larr; Trang trước
          </button>
          <span className="text-sm text-gray-700">
            Trang {page} / {totalPages} (Tổng: {total})
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Trang sau &rarr;
          </button>
        </div>
      )}
    </div>
  );
}