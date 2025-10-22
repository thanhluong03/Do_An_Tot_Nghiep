import React, { useState } from "react";
import { Product } from "@/api/services/productApi";
import { Supplier } from "@/api/services/supplierService";
import { Category } from "@/api/services/categoryService";
import { X, Upload } from "lucide-react";

// Định nghĩa interface cho lỗi validation (được truyền từ ProductsPage)
export interface ProductFormErrors {
  name?: string;
  price?: string;
  description?: string;
  main_image?: string;
  category_id?: string;
  supplier_id?: string;
}

// Định nghĩa các trường có thể có lỗi (để type-safe indexing)
type ValidatableFields = keyof ProductFormErrors;

interface ProductFormModalProps {
  isModalOpen: boolean;
  editingProduct: Product | null;
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  handleSave: (formData: FormData) => Promise<void>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
  suppliers: Supplier[];
  validationErrors: ProductFormErrors;
  setValidationErrors: React.Dispatch<React.SetStateAction<ProductFormErrors>>;
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
  validationErrors,
  setValidationErrors,
}: ProductFormModalProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleRemoveImage = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviewImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  React.useEffect(() => {
    if (isModalOpen) {
      setFiles([]);
      setPreviewImages([]);
    }
  }, [isModalOpen, editingProduct]);

  if (!isModalOpen) return null;

  // Hàm xử lý thay đổi input và xóa lỗi tương ứng
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: ValidatableFields
  ) => {
    let value: string | number = e.target.value;

    if (field === 'price' || field === 'category_id' || field === 'supplier_id') {
      value = Number(value);
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles);
    setPreviewImages(newFiles.map((f) => URL.createObjectURL(f)));

    // Xóa lỗi ảnh nếu người dùng chọn file
    if(validationErrors.main_image) {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.main_image;
            return newErrors;
        });
    }
  };

  const onSave = async () => {
    const errors: ProductFormErrors = {};
    if (!editingProduct && files.length === 0) {
        errors.main_image = "Vui lòng chọn ít nhất một ảnh cho sản phẩm.";
    }

    if (Object.keys(errors).length > 0) {
        setValidationErrors(prev => ({ ...prev, ...errors }));
        return;
    }

    const form = new FormData();
    form.append("name", formData.name);
    form.append("price", formData.price.toString());
    form.append("description", formData.description || "");
    form.append("category_id", (formData.category_id || 0).toString());
    form.append("supplier_id", (formData.supplier_id || 0).toString());
    files.forEach((file) => form.append("images", file));
    await handleSave(form);
  };

  const getInputClassName = (field: ValidatableFields): string => {
    const baseClass = "w-full border rounded-xl px-5 py-3.5 text-lg focus:ring-2 focus:outline-none transition";
    const errorClass = "border-red-500 focus:ring-red-500";
    const normalClass = "border-gray-300 focus:ring-orange-500";
    return `${baseClass} ${validationErrors[field] ? errorClass : normalClass}`;
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
              onChange={(e) => handleChange(e, 'name')}
              className={getInputClassName('name')}
              placeholder="Nhập tên sản phẩm..."
            />
            {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Giá */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange(e, 'price')}
              className={getInputClassName('price')}
              placeholder="Nhập giá..."
            />
            {validationErrors.price && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
            )}
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Danh mục
            </label>
            <select
              value={formData.category_id ?? 0}
              onChange={(e) => handleChange(e, 'category_id')}
              className={getInputClassName('category_id')}
            >
              <option value={0}>-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {validationErrors.category_id && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.category_id}</p>
            )}
          </div>

          {/* Nhà cung cấp */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Nhà cung cấp
            </label>
            <select
              value={formData.supplier_id ?? 0}
              onChange={(e) => handleChange(e, 'supplier_id')}
              className={getInputClassName('supplier_id')}
            >
              <option value={0}>-- Chọn nhà cung cấp --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {validationErrors.supplier_id && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.supplier_id}</p>
            )}
          </div>

          {/* Mô tả */}
          <div className="col-span-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange(e, 'description')}
              rows={5}
              className={getInputClassName('description')}
              placeholder="Nhập mô tả sản phẩm..."
            />
            {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* Upload hình ảnh */}
          <div className="col-span-2">
            <label className="block text-base font-semibold text-gray-800 mb-3">
              Ảnh sản phẩm
            </label>
            <label 
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer hover:bg-orange-50 transition ${
                    validationErrors.main_image ? 'border-red-500' : 'border-orange-300'
                }`}
            >
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
            {validationErrors.main_image && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.main_image}</p>
            )}
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
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-white/80 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-500 hover:text-white transition-opacity opacity-80 group-hover:opacity-100"
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
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