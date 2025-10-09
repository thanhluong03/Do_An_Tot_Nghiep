"use client";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "@/api/services/categoryService";

const initialFormState: Category = {
  name: "",
  description: "",
};

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Category>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      toast.error("Không thể tải danh sách danh mục!");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Tên danh mục không được bỏ trống";
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
        const { id, created_at, updated_at, ...updateDto } = form;
        await updateCategory(editingId, updateDto);
        setEditingId(null);
        toast.success(`Cập nhật danh mục ID ${editingId} thành công!`);
      } else {
        await addCategory(form);
        toast.success("Thêm danh mục mới thành công!");
      }

      setForm(initialFormState);
      setErrors({});
      fetchCategories();
    } catch (error) {
      console.error("Lỗi CRUD:", error);
      toast.error("Có lỗi xảy ra khi lưu danh mục!");
    }
  };

  const handleEdit = (category: Category) => {
    setForm({ ...category });
    setEditingId(category.id || null);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialFormState);
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      toast.success(`Xoá danh mục ID ${id} thành công!`);
      fetchCategories();
    } catch (error) {
      console.error("Lỗi xoá:", error);
      toast.error("Có lỗi xảy ra khi xoá danh mục!");
    }
  };

  const totalPages = Math.ceil(categories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentCategories = categories.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gray-100 p-4 relative">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Quản lý Danh mục Sản phẩm
        </h2>

        {/* Form Thêm/Sửa */}
        <div
          className={`border p-6 rounded-lg mb-8 ${
            editingId ? "border-yellow-400" : "border-blue-400"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            {editingId
              ? `Sửa Danh mục ID: ${editingId}`
              : "Thêm Danh mục mới"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên danh mục
              </label>
              <input
                name="name"
                placeholder="Nhập tên danh mục"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                placeholder="Nhập mô tả (Không bắt buộc)"
                value={form.description || ""}
                onChange={handleChange}
                rows={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="px-5 py-2 rounded-lg font-semibold shadow-md transition bg-gray-400 hover:bg-gray-500 text-white"
              >
                Hủy Sửa
              </button>
            )}
            <button
              onClick={handleSubmit}
              className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${
                editingId
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {editingId ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>

        {/* Bảng liệt kê */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Tên danh mục</th>
                <th className="px-4 py-3 text-left">Mô tả</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
                <th className="px-4 py-3 text-left">Ngày cập nhật</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((cat, idx) => (
                <tr
                  key={cat.id}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-3">{cat.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cat.description || "N/A"}
                  </td>
                  <td className="px-4 py-3">{cat.created_at?.split("T")[0]}</td>
                  <td className="px-4 py-3">{cat.updated_at?.split("T")[0]}</td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-medium shadow"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(cat.id!)} // ✅ Mở modal xác nhận xoá
                      className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không có danh mục nào
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
            {Math.min(startIndex + pageSize, categories.length)} trên{" "}
            {categories.length} danh mục
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
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal xác nhận xoá */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <p className="text-gray-800 mb-5 text-center">
              Bạn có chắc muốn xoá danh mục ID {confirmDeleteId} không?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  await handleDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
