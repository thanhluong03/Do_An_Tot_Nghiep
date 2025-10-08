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


// Cấu hình phân trang
const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); 
    const [loading, setLoading] = useState(true);

    // STATE LỌC VÀ TÌM KIẾM
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0); 
    const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0); 
    const [searchQuery, setSearchQuery] = useState<string>("");

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
            console.log("Suppliers loaded:", data); 
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

    // LOGIC LỌC SẢN PHẨM (KẾT HỢP 3 ĐIỀU KIỆN)
    const filteredProducts = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase().trim();

        return products.filter(p => {
            // Lọc 1: Theo Danh mục (Sử dụng category_id)
            const categoryMatch = 
                selectedCategoryId === 0 || 
                (p.category_id === selectedCategoryId) ||
                (p.category?.id === selectedCategoryId); // Trường hợp category_id bị null nhưng category object có id
            
            // Lọc 2: Theo Nhà cung cấp
            const supplierMatch = 
                selectedSupplierId === 0 || p.supplier_id === selectedSupplierId;

            // Lọc 3: Theo Tên/Mô tả (Tìm kiếm)
            const searchMatch = 
                !lowerCaseQuery ||
                p.name.toLowerCase().includes(lowerCaseQuery) ||
                (p.description && p.description.toLowerCase().includes(lowerCaseQuery));
            
            return categoryMatch && supplierMatch && searchMatch;
        });
    }, [products, selectedCategoryId, selectedSupplierId, searchQuery]); 
    
    // Đặt lại trang về 1 mỗi khi Filter/Search thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategoryId, selectedSupplierId, searchQuery]);


    // LOGIC PHÂN TRANG: SỬ DỤNG filteredProducts
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    // Xử lý thay đổi filter danh mục
    const handleCategoryFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategoryId(parseInt(event.target.value, 10));
    };

    // Xử lý thay đổi filter nhà cung cấp
    const handleSupplierFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSupplierId(parseInt(event.target.value, 10));
    };

    // Xử lý thay đổi ô tìm kiếm
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
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
            supplier_id: suppliers[0]?.id || 0, // Đặt default là supplier đầu tiên
            category_id: categories[0]?.id || 0, // Đặt default là category đầu tiên
            
        } as Product);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            ...product,
            // Đảm bảo lấy category_id từ trường category_id hoặc category.id
            category_id: product.category_id || product.category?.id || 0 
        } as Product);
        setIsModalOpen(true);
    };

    const handleSave = async (form: FormData) => {
        try {
            if (editingProduct) {
                const updated = await updateProduct(editingProduct.id!, form);
                // Cần fetch lại hoặc cập nhật chính xác (làm đơn giản là fetch lại)
                await fetchProducts();
            } else {
                await addProduct(form);
                await fetchProducts(); 
                // Sau khi thêm mới, chuyển đến trang cuối
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
                await fetchProducts(); // Tải lại toàn bộ để cập nhật danh sách
            } catch (error) {
                console.error("Lỗi khi xoá sản phẩm:", error);
            }
        }
    };

    const getSupplierName = (id: number) => {
        return suppliers.find((s) => s.id === id)?.name || "N/A";
        
    };

    // HÀM SỬA LỖI: Luôn trả về string và xử lý cả hai trường category
    const getCategoryName = (product: Product): string => {
        // 1. Ưu tiên lấy từ đối tượng category nếu có
        if (product.category && product.category.name) {
            return product.category.name;
        }
        
        // 2. Nếu không có đối tượng category, tìm trong danh sách categories đã tải
        const categoryId = product.category_id;
        if (!categoryId) return "Chưa phân loại";

        return categories.find((c) => c.id === categoryId)?.name || "Đang tải...";
    };


    return (
        <div className="p-6 flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-full">
                <div className="flex justify-center items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                </div>
                
                {/* KHUNG LỌC VÀ TÌM KIẾM */}
                <div className="mb-6 space-y-4">
                    
                    {/* HÀNG 1: TÌM KIẾM VÀ THÊM MỚI */}
                    <div className="flex justify-between items-center">
                        {/* Ô TÌM KIẾM */}
                        <div className="relative w-1/3 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên sản phẩm/mô tả..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <button
                            onClick={openAddModal}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition duration-150"
                        >
                            + Thêm sản phẩm
                        </button>
                    </div>

                    {/* HÀNG 2: LỌC DROP-DOWN */}
                    <div className="flex items-center space-x-6">
                        
                        {/* LỌC THEO DANH MỤC */}
                        <div className="flex items-center space-x-2">
                            <label htmlFor="category-filter" className="text-gray-700 font-medium text-sm">
                                Lọc theo Danh mục:
                            </label>
                            <select
                                id="category-filter"
                                value={selectedCategoryId}
                                onChange={handleCategoryFilterChange}
                                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value={0}>Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* LỌC THEO NHÀ CUNG CẤP (Cửa hàng) */}
                        <div className="flex items-center space-x-2">
                            <label htmlFor="supplier-filter" className="text-gray-700 font-medium text-sm">
                                Lọc theo NCC:
                            </label>
                            <select
                                id="supplier-filter"
                                value={selectedSupplierId}
                                onChange={handleSupplierFilterChange}
                                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value={0}>Tất cả NCC</option>
                                {suppliers.map((sup) => (
                                    <option key={sup.id} value={sup.id}>
                                        {sup.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
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
                            {(selectedCategoryId !== 0 || selectedSupplierId !== 0 || searchQuery) && (
                                <p className="mt-1 text-xs italic">
                                    {selectedCategoryId !== 0 && ` | Lọc Danh mục: ${categories.find(c => c.id === selectedCategoryId)?.name}`}
                                    {selectedSupplierId !== 0 && ` | Lọc Cửa hàng: ${suppliers.find(s => s.id === selectedSupplierId)?.name}`}
                                    {searchQuery && ` | Tìm kiếm: "${searchQuery}"`}
                                </p>
                            )}
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