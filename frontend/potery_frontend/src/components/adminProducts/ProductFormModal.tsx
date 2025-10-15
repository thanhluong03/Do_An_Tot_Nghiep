import React, { useState } from "react";
import { Product } from "@/api/services/productApi";
import { Supplier } from "@/api/services/supplierService";
import { Category } from "@/api/services/categoryService";
import { X, Upload } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div
        className="absolute inset-0"
        onClick={() => setIsModalOpen(false)}
      />

      {/* --- MAIN MODAL --- */}
      <div
        className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-200 
        p-10 animate-[fadeIn_0.2s_ease-in-out] overflow-y-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-10 pb-5">
          <h2 className="text-3xl font-extrabold text-orange-600 tracking-tight">
            {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={30} />
          </button>
        </div>

        {/* Form nội dung */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {/* Tên sản phẩm */}
          <div className="col-span-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Tên sản phẩm
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
              placeholder="Nhập tên sản phẩm..."
            />
          </div>

          {/* Giá */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
              placeholder="Nhập giá..."
            />
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Danh mục
            </label>
            <select
              value={formData.category_id ?? 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category_id: Number(e.target.value),
                })
              }
              className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
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
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Nhà cung cấp
            </label>
            <select
              value={formData.supplier_id ?? 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  supplier_id: Number(e.target.value),
                })
              }
              className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
            >
              <option value={0}>-- Chọn nhà cung cấp --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mô tả */}
          <div className="col-span-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={5}
              className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
              placeholder="Nhập mô tả sản phẩm..."
            />
          </div>

          {/* Upload hình ảnh */}
          <div className="col-span-2">
            <label className="block text-base font-semibold text-gray-800 mb-3">
              Ảnh sản phẩm
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-orange-300 rounded-2xl p-8 cursor-pointer hover:bg-orange-50 transition">
              <Upload className="text-orange-500 mb-3" size={36} />
              <span className="text-base text-gray-600 font-medium">
                Chọn hoặc kéo ảnh vào đây
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Preview ảnh */}
          {previewImages.length > 0 && (
            <div className="col-span-2 flex flex-wrap gap-5 mt-2">
              {previewImages.map((src, i) => (
                <div
                  key={i}
                  className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition"
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

        {/* Nút hành động */}
        <div className="flex justify-end gap-4 mt-10 border-t pt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition shadow-sm"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg transition"
          >
            {editingProduct ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
}
