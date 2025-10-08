// src/app/admin/importproduct/page.tsx

"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    listImportProducts,
    createImportProduct,
    updateImportProduct,
    deleteImportProduct,
    listDropdownProducts,
    listDropdownSuppliers, 
    listProducts, // IMPORT HÀM MỚI
    ImportProduct,
    CreateImportProductDto,
    UpdateImportProductDto,
    SelectOption,
    Product // IMPORT INTERFACE MỚI
} from "@/api/services/importProductsService"; 

import ImportProductForm from "@/components/adminImportProduct/ImportProductForm"; 
import ImportProductTable from "@/components/adminImportProduct/ImportProductTable"; 
import ProductTable from "@/components/adminImportProduct/ProductTable"; // IMPORT BẢNG SẢN PHẨM
import Pagination from "@/components/inventory/Pagination"; 

export interface ImportProductFormState {
    product_id: string | string[] | undefined;
    supplier_id: string | string[] | undefined; 
    import_quantity: number; 
}

export type FormName = "product_id" | "supplier_id" | "import_quantity"; 

export default function ImportProductPage() { 
    const [importProducts, setImportProducts] = useState<ImportProduct[]>([]); 
    const [products, setProducts] = useState<SelectOption[]>([]); // Dropdown Products
    const [allProducts, setAllProducts] = useState<Product[]>([]); // SẢN PHẨM ĐẦY ĐỦ (DÙNG CHO BẢNG)
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]); 
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false); 

    // STATE LỌC VÀ TÌM KIẾM
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0); 

    const [form, setForm] = useState<ImportProductFormState>({ 
        product_id: undefined,
        supplier_id: undefined, 
        import_quantity: 0, 
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Hàm dùng chung để lấy tên hiển thị
    const getDisplayName = useCallback((list: SelectOption[], id: number | string | undefined): string => {
        if (id === undefined || id === null) return "";
        const numericId = Number(id);
        if (isNaN(numericId)) return "";
        const found = list.find(item => Number(item.id) === numericId);
        return found?.name || `ID: ${id}`;
    }, []);

    // Load Data
    useEffect(() => {
        fetchData();
        fetchDropdownData();
        fetchAllProducts(); // GỌI HÀM MỚI
    }, [currentPage, pageSize]);
    
    // Hàm để lấy tên Nhà cung cấp (dùng cho ProductTable)
    const getSupplierName = useCallback((supplierId: number): string => {
        return getDisplayName(suppliers, supplierId);
    }, [suppliers, getDisplayName]);

    // Hàm để lấy tên Danh mục (dùng cho ProductTable)
    const getCategoryName = useCallback((product: Product): string => {
        // Giả định bạn có list categories hoặc logic lấy tên category
        // Hiện tại không có list categories, ta trả về placeholder
        return `Category ID: ${product.category_id || 'N/A'}`;
    }, []);

    // HÀM TẢI SẢN PHẨM ĐẦY ĐỦ (DÙNG CHO BẢNG CUỐI)
    const fetchAllProducts = async () => {
        try {
            // Tải 1000 sản phẩm (giả định) để hiển thị tồn kho tổng
            const res = await listProducts({ page: 1, size: 1000 }); 
            setAllProducts(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi tải toàn bộ sản phẩm:", error);
            setAllProducts([]);
        }
    };


    const fetchDropdownData = async () => {
        try {
            const [productRes, supplierRes] = await Promise.all([ 
                listDropdownProducts(),
                listDropdownSuppliers(), 
            ]);
            setProducts(Array.isArray(productRes) ? productRes : []);
            setSuppliers(Array.isArray(supplierRes) ? supplierRes : []); 
        } catch (error) {
            console.error("Lỗi tải dropdown data:", error);
            setProducts([]);
            setSuppliers([]);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true); 
            const res = await listImportProducts({ 
                page: currentPage,
                size: pageSize
            });

            const list = res.data || [];
            setImportProducts(Array.isArray(list) ? list : []); 
            setTotalItems(res.total || list.length);
            setCurrentPage(res.page || currentPage);
            setPageSize(res.size || pageSize);

        } catch (error) {
            console.error("Lỗi tải nhập kho:", error); 
            setImportProducts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
            // Sau khi tải ImportProducts, TẢI LẠI SẢN PHẨM để đảm bảo tồn kho mới nhất
            fetchAllProducts(); 
        }
    };
    
    // LOGIC LỌC VÀ TÌM KIẾM (Client-side)
    const filteredImportProducts = useMemo(() => { 
        const query = searchQuery.toLowerCase().trim();
        const supplierId = selectedSupplierId; 

        return importProducts.filter(item => { 
            // Lọc theo Nhà cung cấp
            const supplierMatch = supplierId === 0 || Number(item.supplier_id) === supplierId; 

            // Tìm kiếm theo Tên Sản phẩm HOẶC Tên Nhà cung cấp
            const productName = getDisplayName(products, item.product_id).toLowerCase();
            const supplierName = getDisplayName(suppliers, item.supplier_id).toLowerCase(); 
            
            const searchMatch = !query || productName.includes(query) || supplierName.includes(query);

            return supplierMatch && searchMatch;
        });
    }, [importProducts, selectedSupplierId, searchQuery, products, suppliers, getDisplayName]); 
    
    // Đặt lại trang 1 khi filter hoặc search thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSupplierId, searchQuery]);


    // Handler cho input số (import_quantity)
    const handleNumberChange = (name: FormName, value: number) => { 
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // Handler cho CheckboxList (product_id, supplier_id)
    const handleValueChange = (name: "product_id" | "supplier_id", value: string | string[] | undefined) => { 
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };
    
    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ product_id: undefined, supplier_id: undefined, import_quantity: 0 }); 
        setErrors({});
    }

    const handleEdit = (item: ImportProduct) => { 
        setEditingId(item.id);
        setForm({
            product_id: String(item.product_id),
            supplier_id: String(item.supplier_id), 
            import_quantity: item.import_quantity || 0, 
        });
        setErrors({});
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xoá phiếu nhập kho ID ${id} không?`)) return; 
        try {
            await deleteImportProduct(id); 
            alert(`Xoá phiếu nhập kho ID ${id} thành công.`); 
            fetchData();
            fetchAllProducts(); // CẬP NHẬT TỒN KHO SAU KHI XOÁ
        } catch (error) {
            console.error("Lỗi xoá phiếu nhập kho:", error); 
            alert("Lỗi xảy ra khi xoá phiếu nhập kho.");
        }
    };


    const checkForDuplicate = (productId: number, supplierId: number): boolean => { 
        if (!Array.isArray(importProducts)) return false; 
        // Check trùng trong danh sách nhập kho
        return importProducts.some( 
            item =>
                (item.id !== editingId) &&
                (Number(item.product_id) === productId) &&
                (Number(item.supplier_id) === supplierId) 
        );
    };

    const validate = (isCreating: boolean) => {
        const newErrors: { [key: string]: string } = {};

        if (isCreating) {
            if (form.product_id === undefined || (Array.isArray(form.product_id) && form.product_id.length === 0)) {
                newErrors.product_id = "Vui lòng chọn ít nhất 1 Sản phẩm.";
            }
            if (form.supplier_id === undefined || (Array.isArray(form.supplier_id) && form.supplier_id.length === 0)) { 
                newErrors.supplier_id = "Vui lòng chọn ít nhất 1 Nhà cung cấp."; 
            }
        }

        if (form.import_quantity <= 0) { 
            newErrors.import_quantity = "SL Nhập kho phải là số lớn hơn 0."; 
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        const isCreating = editingId === null;
        if (!validate(isCreating)) return;

        try {
            if (isCreating) {
                const productIds: string[] = form.product_id === 'all'
                    ? products.map(p => String(p.id)) // Lấy tất cả ID nếu chọn 'all'
                    : (Array.isArray(form.product_id)
                        ? form.product_id
                        : [form.product_id!]);

                const supplierIds: string[] = form.supplier_id === 'all' 
                    ? suppliers.map(s => String(s.id)) // Lấy tất cả ID nếu chọn 'all'
                    : (Array.isArray(form.supplier_id) 
                        ? form.supplier_id 
                        : [form.supplier_id!]); 

                // Check trùng lặp chỉ khi chọn 1 sản phẩm và 1 nhà cung cấp
                if (productIds.length === 1 && supplierIds.length === 1) {
                    if (checkForDuplicate(Number(productIds[0]), Number(supplierIds[0]))) {
                         alert(`Lỗi: Phiếu nhập kho cho Sản phẩm: ${getDisplayName(products, productIds[0])} và Nhà cung cấp: ${getDisplayName(suppliers, supplierIds[0])} đã tồn tại!`);
                         return;
                    }
                }

                const createDto: CreateImportProductDto = { 
                    product_id: form.product_id, // Gửi nguyên array/string/all cho backend xử lý
                    supplier_id: form.supplier_id, 
                    import_quantity: form.import_quantity, 
                };

                await createImportProduct(createDto); 
                alert(`Thêm mới phiếu nhập kho thành công!`); 
                

            } else {
                // UPDATE
                const updateDto: UpdateImportProductDto = { 
                    import_quantity: form.import_quantity, 
                };

                await updateImportProduct(editingId!, updateDto); 
                alert(`Cập nhật phiếu nhập kho ID ${editingId} thành công!`); 
            }

            // Reset form
            handleCancelEdit();
            fetchData();
            fetchAllProducts(); // CẬP NHẬT TỒN KHO SAU KHI THÊM/SỬA
        } catch (error: any) {
            console.error("Lỗi API:", error);
            let message = error.response?.data?.message || error.message || "Lỗi không xác định";
            alert("Lỗi xảy ra khi xử lý: " + message);
        }
    };
    
    // Xử lý thay đổi trang
    const handlePageChange = useCallback((page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
            handleCancelEdit();
        }
    }, [currentPage]); 

    // Xử lý thay đổi kích thước trang
    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(1);
        handleCancelEdit();
    }, []);
    
    // Phân trang danh sách đã lọc (Client-side pagination)
    const paginatedImportProducts = useMemo(() => { 
        const startIndex = (currentPage - 1) * pageSize;
        return filteredImportProducts.slice(startIndex, startIndex + pageSize); 
    }, [filteredImportProducts, currentPage, pageSize]); 


    // Handlers cho Filter và Search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSupplierFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => { 
        setSelectedSupplierId(Number(e.target.value)); 
    };
    
    // Handler mở modal sửa sản phẩm (Dùng cho ProductTable)
    const openEditProductModal = (product: Product) => {
        // Log hoặc gọi hàm mở modal sửa Product thực tế
        console.log("Open Edit Product Modal for:", product.id);
        alert(`Mở modal sửa Sản phẩm ID: ${product.id}`);
    };
    
    // Handler xoá sản phẩm (Dùng cho ProductTable)
    const handleDeleteProduct = (id: number) => {
        // Log hoặc gọi hàm xoá Product thực tế
        console.log("Delete Product:", id);
        alert(`Thực hiện xoá Sản phẩm ID: ${id}`);
    };
    

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Nhập kho (Import Product)
                </h2>

                {/* KHU VỰC THÊM / SỬA FORM */}
                <ImportProductForm 
                    form={form as any}
                    editingId={editingId}
                    errors={errors}
                    products={products}
                    suppliers={suppliers} 
                    getDisplayName={getDisplayName as any}
                    handleValueChange={handleValueChange as any}
                    handleNumberChange={handleNumberChange as any}
                    handleSubmit={handleSubmit}
                    handleCancelEdit={handleCancelEdit}
                />

                {/* KHU VỰC LỌC VÀ TÌM KIẾM MỚI */}
                <div className="flex flex-wrap justify-between items-center mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 w-full">Bộ lọc và Tìm kiếm (Phiếu nhập)</h3>

                    {/* Lọc theo Nhà cung cấp */}
                    <div className="w-full md:w-1/3 min-w-[200px] mb-3 md:mb-0">
                        <label htmlFor="supplier-filter" className="block text-sm font-medium text-gray-700">
                            Lọc theo Nhà cung cấp:
                        </label>
                        <select
                            id="supplier-filter"
                            value={selectedSupplierId} 
                            onChange={handleSupplierFilterChange} 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none"
                        >
                            <option value={0}>-- Tất cả Nhà cung cấp --</option>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ô Tìm kiếm */}
                    <div className="w-full md:w-1/3 min-w-[200px] mb-3 md:mb-0">
                        <label htmlFor="search-query" className="block text-sm font-medium text-gray-700">
                            Tìm kiếm (Tên SP/Nhà CC):
                        </label>
                        <input
                            type="text"
                            id="search-query"
                            placeholder="Nhập tên SP hoặc Nhà CC..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="w-full md:w-1/4 min-w-[200px] text-sm text-gray-600">
                        <p>Tổng số phiếu: <span className="font-bold">{filteredImportProducts.length}</span></p>
                        <p>Đang hiển thị: <span className="font-bold">{paginatedImportProducts.length}</span></p>
                    </div>
                </div>

                {/* KHU VỰC BẢNG PHIẾU NHẬP */}
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Danh sách Phiếu nhập kho</h3>
                {loading ? (
                    <div className="text-center py-10 text-lg text-gray-500">
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <ImportProductTable 
                        importProducts={paginatedImportProducts} 
                        products={products}
                        suppliers={suppliers} 
                        getDisplayName={getDisplayName as any}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        totalItems={filteredImportProducts.length}
                    />
                )}

                {/* KHU VỰC PHÂN TRANG */}
                <Pagination
                    totalItems={filteredImportProducts.length} 
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
                
                {/* --- DÒNG PHÂN CÁCH VÀ KHU VỰC BẢNG SẢN PHẨM --- */}
                <hr className="my-8 border-gray-300" />
                
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Tồn kho Sản phẩm Tổng
                </h2>
                
                {/* BẢNG SẢN PHẨM VỚI TỒN KHO ĐƯỢC CẬP NHẬT */}
                {loading ? (
                     <div className="text-center py-10 text-lg text-gray-500">
                        <p>Đang tải danh sách sản phẩm...</p>
                     </div>
                ) : (
                    <ProductTable 
                        products={allProducts} // Sử dụng danh sách Sản phẩm đầy đủ
                        getSupplierName={getSupplierName}
                        getCategoryName={getCategoryName}
                        openEditModal={openEditProductModal} // Giả định handler
                        handleDelete={handleDeleteProduct} // Giả định handler
                        startIndex={0} // Hiển thị từ đầu
                    />
                )}
                
            </div>
        </div>
    );
}