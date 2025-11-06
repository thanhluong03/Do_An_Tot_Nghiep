"use client";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  getCategories,
  deleteCategory,
  Category,
} from "@/api/services/categoryService";
import CategoryModal from "@/components/adminCategory/CategoryModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục!");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

   const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      toast.success(`Xoá danh mục ID ${id} thành công!`);
      fetchCategories();
    } catch {
      toast.error("Lỗi khi xoá danh mục!");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-2 relative">
      <Toaster position="top-right" />

      <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#B95D26]">
            Quản lý Danh mục Sản phẩm
          </h2>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition"
          >
            <Plus size={18} /> Thêm danh mục
          </button>
        </div>

        {/* Bảng danh mục */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
                <th className="px-4 py-3 text-left">STT</th>
                <th className="px-4 py-3 text-left">Tên danh mục</th>
                <th className="px-4 py-3 text-left">Mô tả</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr
                  key={cat.id}
                  className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
                >
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.description || "N/A"}</td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <button
                      title="Sửa"
                      onClick={() => {
                        setEditingCategory(cat);
                        setShowModal(true);
                      }}
                      className="p-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      title="Xoá"
                      onClick={() => setConfirmDeleteId(cat.id!)}
                      className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      <CategoryModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editingCategory={editingCategory}
        onSuccess={fetchCategories}
      />

      {confirmDeleteId && (
        <ConfirmDialog
          title="Xác nhận xoá danh mục"
          message={`Bạn có chắc muốn xoá danh mục ID ${confirmDeleteId} không?`}
          confirmText="Xoá"
          cancelText="Huỷ"
          onConfirm={async () => {
            await handleDelete(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
