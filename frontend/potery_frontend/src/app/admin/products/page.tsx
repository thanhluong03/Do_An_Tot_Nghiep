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

    // 1. THÊM STATE ĐỂ LỌC DANH MỤC
    // categoryId = 0 (hoặc null) có nghĩa là hiển thị TẤT CẢ
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0); 

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
            // Giữ nguyên logic reset về trang 1 khi tải lại toàn bộ
            // Lưu ý: Nếu muốn giữ trang hiện tại sau khi chỉnh sửa, có thể bỏ dòng này
            // setCurrentPage(1); 
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

    // 2. LOGIC LỌC SẢN PHẨM
    const filteredProducts = useMemo(() => {
        if (selectedCategoryId === 0) {
            return products; // Hiển thị tất cả
        }
        return products.filter(p => p.category_id === selectedCategoryId);
    }, [products, selectedCategoryId]);
    
    // Đặt lại trang về 1 mỗi khi Category Filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategoryId]);


    // LOGIC PHÂN TRANG: SỬ DỤNG filteredProducts thay vì products
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    
    // Sản phẩm cho trang hiện tại
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        // SỬ DỤNG filteredProducts
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    // Xử lý thay đổi filter danh mục
    const handleCategoryFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryId = parseInt(event.target.value, 10);
        setSelectedCategoryId(newCategoryId);
    };

    // Xử lý Modal và CRUD (Giữ nguyên handleSave đã sửa)
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

    const handleSave = async (form: FormData) => {
        try {
            if (editingProduct) {
                const updated = await updateProduct(editingProduct.id!, form);
                setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            } else {
                await addProduct(form);
                await fetchProducts(); 
                // Tính lại trang cuối cùng DỰA TRÊN TỔNG SẢN PHẨM MỚI
                const newTotalPages = Math.ceil((products.length + 1) / ITEMS_PER_PAGE); 
                setCurrentPage(newTotalPages);
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
                // Dùng fetchProducts để đảm bảo dữ liệu mới nhất
                await fetchProducts();

                // Tính toán lại trang hiện tại sau khi xoá để tránh trang rỗng
                const newTotalProducts = products.length - 1;
                const newTotalPages = Math.ceil(newTotalProducts / ITEMS_PER_PAGE);
                
                if (currentPage > newTotalPages && currentPage > 1) {
                    setCurrentPage(newTotalPages);
                }
                
                // Cần thêm: Đảm bảo lọc vẫn hoạt động đúng sau khi fetchProducts
                // (Việc này đã được handle bởi useEffect([selectedCategoryId]) và useMemo([products, selectedCategoryId]))

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
                
                {/* THÊM KHUNG LỌC VÀ THÊM MỚI */}
                <div className="flex justify-between items-center mb-6">
                    {/* DROP-DOWN LỌC THEO DANH MỤC */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="category-filter" className="text-gray-700 font-medium">
                            Lọc theo Danh mục:
                        </label>
                        <select
                            id="category-filter"
                            value={selectedCategoryId}
                            onChange={handleCategoryFilterChange}
                            className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value={0}>Tất cả sản phẩm</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition duration-150"
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
                            Hiển thị {paginatedProducts.length} trên tổng số {filteredProducts.length} sản phẩm (Trang {currentPage} / {totalPages})
                            {selectedCategoryId !== 0 && ` (Đã lọc theo Danh mục: ${categories.find(c => c.id === selectedCategoryId)?.name})`}
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