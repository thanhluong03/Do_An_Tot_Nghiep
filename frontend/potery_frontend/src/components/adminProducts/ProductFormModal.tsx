// src/app/admin/products/ProductFormModal.tsx

import React from 'react';
import { Product } from "@/api/services/productApi";
import { Supplier } from "@/api/services/supplierService";
import { Category } from "@/api/services/categoryService"; 

interface ProductFormModalProps {
    isModalOpen: boolean;
    editingProduct: Product | null;
    formData: Product;
    setFormData: React.Dispatch<React.SetStateAction<Product>>;
    handleSave: () => Promise<void>;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    suppliers: Supplier[];
    categories: Category[];
}

export default function ProductFormModal({
    isModalOpen,
    editingProduct,
    formData,
    setFormData,
    handleSave,
    setIsModalOpen,
    suppliers,
    categories,
}: ProductFormModalProps) {
    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setIsModalOpen(false)} />

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-10 overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-semibold mb-4">{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

                <div className="space-y-3">
                    {/* Tên sản phẩm */}
                    <label className="block text-sm">Tên sản phẩm</label>
                    <input title="Tên sản phẩm" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded p-2" />

                    {/* Giá */}
                    <label className="block text-sm">Giá</label>
                    <input title="Giá sản phẩm" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full border rounded p-2" />
                    
                    {/* Mô tả */}
                    <label className="block text-sm">Mô tả</label>
                    <textarea title="Mô tả sản phẩm" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded p-2" />

                    {/* Ảnh chính (URL) */}
                    <label className="block text-sm">Ảnh chính (URL)</label>
                    <input title="Ảnh chính sản phẩm" type="text" value={formData.main_image ?? ""} onChange={(e) => setFormData({ ...formData, main_image: e.target.value })} className="w-full border rounded p-2" />

                    {/* Nhà cung cấp */}
                    <label className="block text-sm">Nhà cung cấp</label>
                    <select 
                        title="Nhà cung cấp" 
                        value={formData.supplier_id ?? 0} 
                        onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) })} 
                        className="w-full border rounded p-2"
                    >
                        <option value={0}>-- Chọn nhà cung cấp --</option>
                        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    {/* Danh mục: SỬ DỤNG category_id */}
                    <label className="block text-sm">Danh mục</label>
                    <select 
                        title="Danh mục sản phẩm" 
                        value={formData.category_id ?? 0} 
                        onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })} 
                        className="w-full border rounded p-2"
                    >
                        <option value={0}>-- Chọn danh mục --</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="flex justify-end gap-3 mt-5">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Lưu</button>
                </div>
            </div>
        </div>
    );
}