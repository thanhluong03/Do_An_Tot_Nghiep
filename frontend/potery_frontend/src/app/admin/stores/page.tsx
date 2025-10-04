"use client";
import React, { useEffect, useState } from "react";
import {
  getStores,
  addStore,
  updateStore,
  deleteStore,
  Store,
} from "@/api/services/storeService";


export default function StorePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [form, setForm] = useState<Store>({
    store_name: "",
    address: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const data = await getStores();
    setStores(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.store_name.trim()) newErrors.store_name = "Tên cửa hàng không được bỏ trống";
    if (!form.address.trim()) newErrors.address = "Địa chỉ không được bỏ trống";
    if (!form.phone.trim()) newErrors.phone = "Số điện thoại không được bỏ trống";
    else if (!/^\d+$/.test(form.phone)) newErrors.phone = "Số điện thoại chỉ được chứa số";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingId) {
        await updateStore(editingId, form);
        setEditingId(null);
      } else {
        await addStore(form);
      }
      setForm({ store_name: "", address: "", phone: "" });
      fetchStores();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleEdit = (store: Store) => {
    setForm(store);
    setEditingId(store.id || null);
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc muốn xoá cửa hàng này?")) {
      await deleteStore(id);
      fetchStores();
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(stores.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentStores = stores.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gray-100 p-1">
      <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Quản lý cửa hàng
        </h2>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
            <input
              name="store_name"
              placeholder="Nhập tên cửa hàng"
              value={form.store_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.store_name && <p className="text-red-500 text-xs mt-1">{errors.store_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input
              name="address"
              placeholder="Nhập địa chỉ"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
            <input
              name="phone"
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${
              editingId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {editingId ? "Cập nhật" : "Thêm"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Tên cửa hàng</th>
                <th className="px-4 py-3 text-left">Địa chỉ</th>
                <th className="px-4 py-3 text-left">Điện thoại</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
                <th className="px-4 py-3 text-left">Ngày cập nhật</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentStores.map((store, idx) => (
                <tr
                  key={store.id}
                  className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-3">{store.id}</td>
                  <td className="px-4 py-3">{store.store_name}</td>
                  <td className="px-4 py-3">{store.address}</td>
                  <td className="px-4 py-3">{store.phone}</td>
                  <td className="px-4 py-3">{store.created_at?.split("T")[0]}</td>
                  <td className="px-4 py-3">{store.updated_at?.split("T")[0]}</td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(store)}
                      className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-medium shadow"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => store.id && handleDelete(store.id)}
                      className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Không có cửa hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, stores.length)} trên {stores.length} cửa hàng
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
