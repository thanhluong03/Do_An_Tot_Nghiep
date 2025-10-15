import React, { useState } from 'react';
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
    // suppliers: Supplier[]; // Không cần thiết cho form này
    categories: Category[];
    suppliers: Supplier[]; // Thêm mảng suppliers
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

    // Cần reset state khi mở modal, đặc biệt là khi chuyển từ Edit sang Add
    React.useEffect(() => {
        if (isModalOpen) {
            // Nếu là edit, hiển thị ảnh cũ (nếu có) và không có file mới
            if (editingProduct) {
                // Chúng ta giả định backend trả về URL hoặc chúng ta đã có cơ chế xử lý ở đây
                // Tạm thời, ta chỉ hiển thị ảnh mới được chọn
                setPreviewImages([]);
            } else {
                setPreviewImages([]);
            }
            setFiles([]);
        }
    }, [isModalOpen, editingProduct]);

    if (!isModalOpen) return null;

    // Khi chọn ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        setFiles(newFiles);

        // Hiện preview
        const previews = newFiles.map((f) => URL.createObjectURL(f));
        setPreviewImages(previews);
    };

    const onSave = async () => {
        const form = new FormData();
        form.append("name", formData.name);
        form.append("price", formData.price.toString());
        form.append("description", formData.description || "");
        form.append("category_id", (formData.category_id || 0).toString());
        form.append("supplier_id", (formData.supplier_id || 0).toString());

        // CHÚ Ý: Không thêm trường 'quantity' vào FormData

        files.forEach((file) => {
            form.append("images", file);
        });

        await handleSave(form);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setIsModalOpen(false)} />

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-10 overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-semibold mb-4">{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

                <div className="space-y-3">
                    {/* Tên sản phẩm */}
                    <label className="block text-sm">Tên sản phẩm</label>
                    <input title='Tên sản phẩm' type="text" value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded p-2" />

                    {/* Giá */}
                    <label className="block text-sm">Giá</label>
                    <input title='Giá sản phẩm' type="number" value={formData.price} 
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full border rounded p-2" />

                    {/* Mô tả */}
                    <label className="block text-sm">Mô tả</label>
                    <textarea title='Mô tả sản phẩm' value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border rounded p-2" />
                    
                    {/* Danh mục */}
                    <label className="block text-sm">Danh mục</label>
                    <select 
                        title='Danh mục' 
                        value={formData.category_id ?? 0} 
                        onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })} 
                        className="w-full border rounded p-2">
                        <option value={0}>-- Chọn danh mục --</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {/* Nhà cung cấp */}
                    <label className="block text-sm">Nhà cung cấp</label>
                    <select
                        title='Nhà cung cấp'
                        value={formData.supplier_id ?? 0}
                        onChange={(e) => setFormData({ ...formData, supplier_id: Number(e.target.value) })}
                        className="w-full border rounded p-2"
                    >
                        <option value={0}>-- Chọn nhà cung cấp --</option>
                        {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    {/* Upload ảnh */}
                    <label className="block text-sm">Ảnh sản phẩm</label>
                    <input title='Ảnh sản phẩm' type="file" multiple accept="image/*" onChange={handleFileChange} />

                    {/* Preview ảnh */}
                    {previewImages.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                            {previewImages.map((src, i) => (
                                <img key={i} src={src} alt="preview" className="w-20 h-20 object-cover rounded border" />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-5">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
                    <button onClick={onSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Lưu</button>
                </div>
            </div>
        </div>
    );
}