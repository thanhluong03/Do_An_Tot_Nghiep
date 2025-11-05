"use client";
import React, { useState, useEffect } from "react";
import { Category, addCategory, updateCategory } from "@/api/services/categoryService";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  editingCategory?: Category | null;
  onSuccess: () => void;
}

const initialForm: Category = {
  name: "",
  description: "",
};

export default function CategoryModal({ open, onClose, editingCategory, onSuccess }: Props) {
  const [form, setForm] = useState<Category>(initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

 useEffect(() => {
  if (editingCategory) setForm(editingCategory);
  else setForm(initialForm);
}, [editingCategory, open]);


  if (!open) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Tên danh mục không được bỏ trống";
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingCategory?.id) {
        const { id, created_at, updated_at, ...updateDto } = form;
        await updateCategory(editingCategory.id, updateDto);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await addCategory(form);
        setForm(initialForm); 
        toast.success("Thêm danh mục mới thành công!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Lưu danh mục thất bại!");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-150 p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
          {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nhập tên danh mục"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Nhập mô tả (Không bắt buộc)"
            rows={6}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded text-white font-semibold ${
              editingCategory ? "bg-yellow-500 hover:bg-yellow-600" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {editingCategory ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}
