"use client";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getCustomers, deleteCustomer, Customer } from "@/api/services/customerService";
import { Trash2 } from "lucide-react";

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      toast.error("Không thể tải danh sách khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    toast((t) => (
      <div>
        <p>Bạn có chắc muốn xoá khách hàng này?</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteCustomer(id);
                toast.success("Đã xoá khách hàng!");
                fetchCustomers();
              } catch {
                toast.error("Không thể xoá khách hàng!");
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Xoá
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
          >
            Huỷ
          </button>
        </div>
      </div>
    ));
  };

  const totalPages = Math.ceil(customers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentCustomers = customers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gray-100 p-2 relative">
      <Toaster position="top-center" />
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between text-center items-center mb-6">
          <h2 className="text-2xl text-center font-bold text-[#B95D26]">Quản lý Khách hàng</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Ảnh</th>
                <th className="px-4 py-3 text-left">Tên đăng nhập</th>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Điện thoại</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    Không có khách hàng nào
                  </td>
                </tr>
              ) : (
                currentCustomers.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}
                  >
                    <td className="px-4 py-3">{c.id}</td>
                    <td className="px-4 py-3">
                      {c.avatar_image ? (
                        <img
                          src={`data:image/jpeg;base64,${c.avatar_image}`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                          ?
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{c.username}</td>
                    <td className="px-4 py-3">{c.full_name || "-"}</td>
                    <td className="px-4 py-3">{c.email || "-"}</td>
                    <td className="px-4 py-3">{c.phone_number || "-"}</td>
                    <td className="px-4 py-3">
                      {c.is_active ? (
                        <span className="text-green-600 font-semibold">Hoạt động</span>
                      ) : (
                        <span className="text-red-500 font-semibold">Khóa</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        title="Xóa"
                        onClick={() => handleDelete(c.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition duration-150 shadow-sm"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Hiển thị {startIndex + 1} -{" "}
            {Math.min(startIndex + pageSize, customers.length)} trên {customers.length} khách hàng
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-3 py-1 font-medium text-gray-700">
              Trang {currentPage}/{totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
