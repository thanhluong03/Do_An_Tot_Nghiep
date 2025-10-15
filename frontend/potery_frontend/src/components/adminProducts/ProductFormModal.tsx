import React, { useState } from "react";
import { Product } from "@/api/services/productApi";
import { Supplier } from "@/api/services/supplierService";
import { Category } from "@/api/services/categoryService";

interface ProductFormModalProps {
  isModalOpen: boolean;
  editingProduct: Product | null;
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  handleSave: (formData: FormData) => Promise<void>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
  suppliers: Supplier[];
}

export default function ProductFormModal({
  isModalOpen,
  editingProduct,
  formData,
  setFormData,
  handleSave,
  setIsModalOpen,
  categories,
  suppliers,
}: ProductFormModalProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  React.useEffect(() => {
    if (isModalOpen) {
      setFiles([]);
      setPreviewImages([]);
    }
  }, [isModalOpen, editingProduct]);

  if (!isModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles);
    setPreviewImages(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const onSave = async () => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("price", formData.price.toString());
    form.append("description", formData.description || "");
    form.append("category_id", (formData.category_id || 0).toString());
    form.append("supplier_id", (formData.supplier_id || 0).toString());

    files.forEach((file) => form.append("images", file));
    await handleSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={() => setIsModalOpen(false)}
      />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-[fadeIn_0.2s_ease-in-out]">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center justify-between">
          {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Nhập tên sản phẩm..."
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Nhập giá sản phẩm..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              placeholder="Nhập mô tả sản phẩm..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <select
              title="danh mục"
              value={formData.category_id ?? 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category_id: Number(e.target.value),
                })
              }
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            >
              <option value={0}>-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nhà cung cấp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhà cung cấp
            </label>
            <select
              title="ncc"
              value={formData.supplier_id ?? 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  supplier_id: Number(e.target.value),
                })
              }
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            >
              <option value={0}>-- Chọn nhà cung cấp --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

      
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh sản phẩm
            </label>
            <input
              title="file"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
              file:rounded-lg file:border-0 file:text-sm file:font-medium 
              file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {previewImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {previewImages.map((src, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 shadow-sm"
                >
                  <img
                    src={src}
                    alt="preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
