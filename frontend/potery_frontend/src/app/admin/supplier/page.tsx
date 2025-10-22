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
import { Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const initialFormState: Supplier = {
  name: "",
  address: "",
  phone: "",
  email: "",
};

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<Supplier>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);

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
      } else {
        await addSupplier(form);
        toast.success("Thêm nhà cung cấp thành công!");
      }
      setShowModal(false);
      setEditingId(null);
      setForm(initialFormState);
      fetchSuppliers();
    } catch {
      toast.error("Đã xảy ra lỗi khi lưu nhà cung cấp!");
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setForm(supplier);
    setEditingId(supplier.id || null);
    setErrors({});
    setShowModal(true);
  };

 const handleDelete = (id: number) => {
    setItemToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };
  
  // [THÊM MỚI] Hàm thực hiện API xóa
  const performDelete = async () => {
    if (!itemToDeleteId) return;

    try {
      await deleteSupplier(itemToDeleteId);
      toast.success("Đã xoá nhà cung cấp!");
      fetchSuppliers();
    } catch {
      toast.error("Không thể xoá nhà cung cấp!");
    } finally {
      // Đóng dialog và reset state
      setIsDeleteDialogOpen(false);
      setItemToDeleteId(null);
    }
  };
  
  // [THÊM MỚI] Hàm hủy xóa
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setItemToDeleteId(null);
  };
  // Pagination
  const totalPages = Math.ceil(suppliers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentSuppliers = suppliers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gray-100 p-1 relative">
      <Toaster position="top-center" />
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            Quản lý Nhà cung cấp
          </h2>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingId(null);
              setForm(initialFormState);
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium shadow hover:bg-orange-600"
          >
            + Thêm Nhà cung cấp
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
                      title="sua"
                      onClick={() => handleEdit(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition duration-150 shadow-sm"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      title="xoa"
                      onClick={() => handleDelete(s.id!)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition duration-150 shadow-sm"
                    >
                      <Trash2 size={15} />
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

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/40 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 text-center">
              {editingId ? "Sửa Nhà cung cấp" : "Thêm Nhà cung cấp"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                    value={(form as any)[field]}
                    onChange={handleChange}
                    placeholder={`Nhập ${{ name: "tên", address: "địa chỉ", phone: "số điện thoại", email: "email" }[field]
                      }`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors[field] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(initialFormState);
                  setEditingId(null);
                  setErrors({});
                }}
                className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${editingId
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
              >
                {editingId ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
        
      )}
      {isDeleteDialogOpen && (
        <ConfirmDialog
          title="Xác nhận Xoá Nhà cung cấp"
          message={`Bạn có chắc muốn xoá nhà cung cấp ID: ${itemToDeleteId}? Hành động này không thể hoàn tác.`}
          confirmText="Xác nhận Xoá"
          cancelText="Hủy bỏ"
          onConfirm={performDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
