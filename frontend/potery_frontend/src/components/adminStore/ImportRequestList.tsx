"use client";

import React, { useEffect, useState } from "react";
import {
  listImportRequestsByStore,
  deleteImportRequest,
  ImportRequest
} from "@/api/services/importRequestService";
import toast from "react-hot-toast";
import { Eye, Pencil, Trash2 } from "lucide-react";

export default function ImportRequestList({ storeId }: { storeId: number }) {
  const [requests, setRequests] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await listImportRequestsByStore(storeId);
      setRequests(data);
    } catch (err) {
      toast.error("Không tải được danh sách yêu cầu");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa yêu cầu này?")) return;

    try {
      await deleteImportRequest(id);
      toast.success("Đã xóa!");
      loadData();
    } catch (err) {
      toast.error("Xóa thất bại!");
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    onClick={() => console.log("Xem chi tiết", req.id)}
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                    onClick={() => console.log("Sửa", req.id)}
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    onClick={() => handleDelete(req.id)}
                  >
                    <Trash2 size={15} />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
