// src/app/admin/products/ProductsPage.tsx

"use client";
import { useEffect, useState, useMemo } from "react";
import { 
    getProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    Product,
    ProductImage
} from "@/api/services/productApi";

import { getSuppliers, Supplier } from "@/api/services/supplierService";
import { getCategories, Category } from "@/api/services/categoryService"; 
import ProductFormModal from "@/components/adminProducts/ProductFormModal";
import ProductsTable from "@/components/adminProducts/ProductsTable";



// Hàm tiện ích để tạo DTO chỉ với các trường cần gửi
const createProductPayload = (data: Product) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, category, ...payload } = data;
    return payload;
};

// Cấu hình phân trang
const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); 
    const [loading, setLoading] = useState(true);

    // State phân trang: Bắt đầu từ trang 1
    const [currentPage, setCurrentPage] = useState(1);

    // State cho form modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Product>({
        name: "",
        price: 0,
        description: "",
        main_image: "",
        supplier_id: 0,
        category_id: 0,
        images: [] as ProductImage[]
    } as Product);

    // Load data
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
            setCurrentPage(1); // Reset về trang 1 khi dữ liệu mới được tải
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

    // LOGIC PHÂN TRANG
    // Tổng số trang
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    
    // Sản phẩm cho trang hiện tại
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [products, currentPage]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Xử lý Modal và CRUD
    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            description: "",
            price: 0,
            main_image: "",
            images: [],
            supplier_id: 0,
            category_id: 0,
        } as Product);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            ...product,
            category_id: product.category_id || product.category?.id || 0 
        } as Product);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || formData.price <= 0 || formData.supplier_id === 0 || !formData.category_id) {
            alert("Vui lòng nhập đầy đủ Tên, Giá, Nhà cung cấp và Danh mục.");
            return;
        }
        
        const payload = createProductPayload(formData);

        try {
            if (editingProduct) {
                const updated = await updateProduct(editingProduct.id!, payload as any); 
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
                // Điều chỉnh lại trang nếu trang hiện tại bị trống
                if (paginatedProducts.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (error) {
                console.error("Lỗi khi xoá sản phẩm:", error);
            }
        }
    };

    const getSupplierName = (id: number) => {
        return suppliers.find((s) => s.id === id)?.name || "N/A";
    };

    const getCategoryName = (product: Product) => {
        if (product.category && product.category.name) {
            return product.category.name;
        }
        const categoryId = product.category_id;
        if (!categoryId) return "Chưa phân loại";
        return categories.find((c) => c.id === categoryId)?.name || "Đang tải...";
    };


    return (
        <div className="p-6 flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-full">
                <div className="flex justify-center items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
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
                    <>
                   
                        <ProductsTable
                            products={paginatedProducts}
                            getSupplierName={getSupplierName}
                            getCategoryName={getCategoryName}
                            openEditModal={openEditModal}
                            handleDelete={handleDelete}
                     
                            startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
                        />

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-6">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                
                                {/* Tạo các nút số trang */}
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                        <div className="mt-4 text-center text-sm text-gray-600">
                            Hiển thị {paginatedProducts.length} trên tổng số {products.length} sản phẩm (Trang {currentPage} / {totalPages})
                        </div>
                    </>
                )}
            </div>

            <ProductFormModal
                isModalOpen={isModalOpen}
                editingProduct={editingProduct}
                formData={formData}
                setFormData={setFormData}
                handleSave={handleSave}
                setIsModalOpen={setIsModalOpen}
                suppliers={suppliers}
                categories={categories}
            />
        </div>
    );
}