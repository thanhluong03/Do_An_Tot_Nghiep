// src/app/admin/products/ProductsPage.tsx

"use client";
import { useEffect, useState } from "react";
import { 
    getProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    Product 
} from "@/api/services/productApi";

// Imports cho Suppliers và Categories
import { getSuppliers, Supplier } from "@/api/services/supplierService";
import { getCategories, Category } from "@/api/services/categoryService"; 


// Hàm tiện ích để tạo DTO chỉ với các trường cần gửi
const createProductPayload = (data: Product) => {
    const { id, created_at, updated_at, category, ...payload } = data;
    return payload;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); 
    const [loading, setLoading] = useState(true);

    // State cho form modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Product>({
        name: "",
        price: 0,
        description: "",
        main_image: "",
        supplier_id: 0,
        category_id: 0, // Dùng ID trong form
        images: []
    } as Product);

    // Load products + dropdown data
    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
        fetchCategories(); 
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Lỗi khi load sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("Lỗi khi load nhà cung cấp:", error);
        }
    };
    
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Lỗi khi load danh mục:", error);
        }
    };

    // Xử lý mở modal thêm mới
    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            description: "",
            price: 0,
            main_image: "",
            images: [],
            supplier_id: 0,
            category_id: 0, // Reset về 0
        } as Product);
        setIsModalOpen(true);
    };

    // Xử lý mở modal chỉnh sửa
    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            ...product,
            // Lấy ID từ category_id hoặc từ object category lồng nhau
            category_id: product.category_id || product.category?.id || 0 
        } as Product);
        setIsModalOpen(true);
    };

    // Lưu (thêm/sửa)
    const handleSave = async () => {
        // Kiểm tra validation (Không kiểm tra quantity)
        if (!formData.name || formData.price <= 0 || formData.supplier_id === 0 || !formData.category_id) {
            alert("Vui lòng nhập đầy đủ Tên, Giá, Nhà cung cấp và Danh mục.");
            return;
        }
        
        // Tạo payload sạch để gửi lên API
        const payload = createProductPayload(formData);

        try {
            if (editingProduct) {
                const updated = await updateProduct(editingProduct.id!, payload as any);
                // Merge dữ liệu cũ (để giữ quantity) với dữ liệu mới cập nhật
                setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
            } else {
                const added = await addProduct(payload as any);
                setProducts((prev) => [...prev, added]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
            alert("❌ Lưu sản phẩm thất bại!");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) {
            try {
                await deleteProduct(id);
                setProducts(products.filter((p) => p.id !== id));
            } catch (error) {
                console.error("Lỗi khi xoá sản phẩm:", error);
            }
        }
    };

    const getSupplierName = (id: number) => {
        return suppliers.find((s) => s.id === id)?.name || "-";
    };

    // HÀM MỚI: Tra cứu tên Danh mục từ category_id hoặc category object
    const getCategoryName = (product: Product) => {
        // Ưu tiên dùng tên category lồng nhau nếu có
        if (product.category && product.category.name) {
            return product.category.name;
        }
        
        const categoryId = product.category_id;
        if (!categoryId) return "Chưa phân loại";
        
        // Tra cứu trong state categories đã load
        return categories.find((c) => c.id === categoryId)?.name || "Đang tải...";
    };


    return (
        <div className="p-6 flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-full">
                {/* Header */}
                <div className="flex justify-center items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Quản lý sản phẩm
                    </h1>
                </div>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        + Thêm sản phẩm
                    </button>
                </div>

                {loading ? (
                    <p>Đang tải sản phẩm...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="p-3 text-left font-semibold border-b">ID</th>
                                    <th className="p-3 text-left font-semibold border-b">Ảnh</th>
                                    <th className="p-3 text-left font-semibold border-b">Tên</th>
                                    <th className="p-3 text-left font-semibold border-b">Giá</th>
                                    <th className="p-3 text-left font-semibold border-b">Số lượng</th>
                                    <th className="p-3 text-left font-semibold border-b">Nhà cung cấp</th>
                                    <th className="p-3 text-left font-semibold border-b">Danh mục</th> {/* Cột Danh mục */}
                                    <th className="p-3 text-center font-semibold border-b">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center p-6 text-gray-500 italic bg-gray-50">
                                            Không có sản phẩm nào
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((p, index) => {
                                        const mainImage = p.main_image || p.images?.[0]?.url || "https://via.placeholder.com/100";

                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50 transition duration-150">
                                                <td className="p-3 border-b text-gray-800">{index + 1}</td>
                                                <td className="p-3 border-b">
                                                    <img src={mainImage} alt={p.name} className="w-14 h-14 object-cover rounded border" />
                                                </td>
                                                <td className="p-3 border-b text-gray-800 font-medium">{p.name}</td>
                                                <td className="p-3 border-b text-gray-700">{p.price.toLocaleString()} ₫</td>
                                                <td className="p-3 border-b text-gray-700 font-bold">{p.quantity ?? 0}</td>
                                                <td className="p-3 border-b text-gray-600">{getSupplierName(p.supplier_id)}</td>
                                                
                                                {/* HIỂN THỊ TÊN DANH MỤC DÙNG HÀM TRA CỨU */}
                                                <td className="p-3 border-b text-gray-600">
                                                    {getCategoryName(p)}
                                                </td>

                                                <td className="p-3 border-b text-center space-x-2">
                                                    <button onClick={() => openEditModal(p)} className="px-3 py-1 text-sm bg-yellow-400 text-black rounded hover:bg-yellow-500">Sửa</button>
                                                    <button onClick={() => handleDelete(p.id!)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Xoá</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
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
                            
                            {/* KHÔNG CÓ INPUT SỐ LƯỢNG */}

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
                                    // Gửi category_id lên backend
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
            )}
        </div>
    );
}