"use client";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  Supplier,
} from "@/api/services/supplierService";

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<Supplier>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); // số dòng / trang

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      toast.error("Không thể tải danh sách nhà cung cấp");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Tên không được bỏ trống";
    if (!form.address.trim()) newErrors.address = "Địa chỉ không được bỏ trống";
    if (!form.phone.trim()) newErrors.phone = "Số điện thoại không được bỏ trống";
    else if (!/^\d+$/.test(form.phone)) newErrors.phone = "Số điện thoại chỉ được chứa số";
    if (!form.email.trim()) newErrors.email = "Email không được bỏ trống";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email không hợp lệ";
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
        await updateSupplier(editingId, form);
        toast.success("Cập nhật nhà cung cấp thành công!");
        setEditingId(null);
      } else {
        await addSupplier(form);
        toast.success("Thêm nhà cung cấp thành công!");
      }
      setForm({ name: "", address: "", phone: "", email: "" });
      fetchSuppliers();
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi lưu nhà cung cấp!");
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setForm(supplier);
    setEditingId(supplier.id || null);
    setErrors({});
    toast("Đang chỉnh sửa thông tin nhà cung cấp...");
  };

  const handleDelete = async (id: number) => {
    toast(
      (t) => (
        <div>
          <p>Bạn có chắc muốn xoá nhà cung cấp này?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteSupplier(id);
                  toast.success("Đã xoá nhà cung cấp!");
                  fetchSuppliers();
                } catch {
                  toast.error("Không thể xoá nhà cung cấp!");
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
      ),
      { duration: 2000 }
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(suppliers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentSuppliers = suppliers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gray-100 p-1">
      <Toaster position="top-center" containerStyle={{
    top: '50%',
    transform: 'translateY(-50%)',
  }} reverseOrder={false} />

      <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Quản lý Nhà cung cấp
        </h2>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {["name", "address", "phone", "email"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {{
                  name: "Tên",
                  address: "Địa chỉ",
                  phone: "Điện thoại",
                  email: "Email",
                }[field]}
              </label>
              <input
                name={field}
                placeholder={`Nhập ${
                  { name: "tên", address: "địa chỉ", phone: "số điện thoại", email: "email" }[field]
                }`}
                value={(form as any)[field]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
            </div>
          ))}
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${
              editingId
                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
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
                <th className="px-4 py-3 text-left">Tên</th>
                <th className="px-4 py-3 text-left">Địa chỉ</th>
                <th className="px-4 py-3 text-left">Điện thoại</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentSuppliers.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.address}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-medium shadow"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(s.id!)}
                      className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không có nhà cung cấp nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Hiển thị {startIndex + 1} -{" "}
            {Math.min(startIndex + pageSize, suppliers.length)} trên {suppliers.length} nhà cung cấp
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
