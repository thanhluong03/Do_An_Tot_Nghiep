// src/app/admin/importproduct/page.tsx

"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
    listImportProducts,
    createImportProduct,
    updateImportProduct,
    deleteImportProduct,
    listDropdownProducts,
    listDropdownSuppliers,
    listProducts,
    ImportProduct,
    CreateImportProductDto,
    UpdateImportProductDto,
    SelectOption,
    Product,
} from "@/api/services/importProductsService";

import ImportProductForm from "@/components/adminImportProduct/ImportProductForm";
import ImportProductTable from "@/components/adminImportProduct/ImportProductTable";
import ProductTable from "@/components/adminImportProduct/ProductTable";
import Pagination from "@/components/inventory/Pagination";

export interface ImportProductFormState {
    product_id: string | string[] | undefined;
    supplier_id: string | string[] | undefined;
    import_quantity: number;
}

export type FormName = "product_id" | "supplier_id" | "import_quantity";

export default function ImportProductPage() {
    const [importProducts, setImportProducts] = useState<ImportProduct[]>([]);
    const [products, setProducts] = useState<SelectOption[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const [form, setForm] = useState<ImportProductFormState>({
        product_id: undefined,
        supplier_id: undefined,
        import_quantity: 0,
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    const [isAdding, setIsAdding] = useState(false); 

    const getDisplayName = useCallback((list: SelectOption[], id: number | string | string[] | undefined): string => {
        if (id === undefined || id === null) return "";
        
        if (id === 'all') return "Tất cả"; 

        if (Array.isArray(id)) {
             if (id.length === 0) return "";
             const names = id.slice(0, 3).map(idStr => {
                 const numericId = Number(idStr);
                 const found = list.find((item) => Number(item.id) === numericId);
                 return found?.name || `ID: ${idStr}`;
             }).join(', ');
             return id.length > 3 ? `${names}, ... (${id.length} mục)` : names;
        }

        const idValue = Number(id);
        if (isNaN(idValue)) return "";
        
        const found = list.find((item) => Number(item.id) === idValue);
        return found?.name || `ID: ${id}`;
    }, []);

    useEffect(() => {
        fetchData();
        fetchDropdownData();
        fetchAllProducts();
    }, [currentPage, pageSize]);

    const getSupplierName = useCallback(
        (supplierId: number): string => {
            return getDisplayName(suppliers, supplierId);
        },
        [suppliers, getDisplayName]
    );

    const getCategoryName = useCallback((product: Product): string => {
        return `Category ID: ${product.category_id || "N/A"}`;
    }, []);

    const fetchAllProducts = async () => {
        try {
            const res = await listProducts({ page: 1, size: 1000 });
            setAllProducts(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Không thể tải danh sách sản phẩm!");
            setAllProducts([]);
        }
    };

    const fetchDropdownData = async () => {
        try {
            // listDropdownProducts đã được cập nhật để trả về SelectOption có imageUrl
            const [productRes, supplierRes] = await Promise.all([listDropdownProducts(), listDropdownSuppliers()]);
            setProducts(Array.isArray(productRes) ? productRes : []);
            setSuppliers(Array.isArray(supplierRes) ? supplierRes : []);
        } catch {
            toast.error("Không thể tải danh sách nhà cung cấp!");
            setProducts([]);
            setSuppliers([]);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await listImportProducts({
                page: currentPage,
                size: pageSize,
            });

            const list = res.data || [];
            setImportProducts(Array.isArray(list) ? list : []);
            setTotalItems(res.total || list.length);
            setCurrentPage(res.page || currentPage);
            setPageSize(res.size || pageSize);
        } catch {
            toast.error("Không thể tải danh sách nhập kho!");
            setImportProducts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    const filteredImportProducts = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const supplierId = selectedSupplierId;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return importProducts.filter((item) => {
            const supplierMatch = supplierId === 0 || Number(item.supplier_id) === supplierId;

            const productName = getDisplayName(products, item.product_id).toLowerCase();
            const supplierName = getDisplayName(suppliers, item.supplier_id).toLowerCase();
            const searchMatch = !query || productName.includes(query) || supplierName.includes(query);

            const createdDate = new Date(item.created_at || item.updated_at || Date.now());
            const dateMatch =
                (!start || createdDate >= start) && (!end || createdDate <= new Date(end.getTime() + 86400000));

            return supplierMatch && searchMatch && dateMatch;
        });
    }, [importProducts, selectedSupplierId, searchQuery, products, suppliers, getDisplayName, startDate, endDate]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSupplierId, searchQuery, startDate, endDate]);

    const handleNumberChange = (name: FormName, value: number) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleValueChange = (name: "product_id" | "supplier_id", value: string | string[] | undefined) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };
    
    const toggleAddMode = () => {
        if (editingId !== null) {
            handleCancelEdit();
        }
        if (!isAdding) {
             setForm({ product_id: undefined, supplier_id: undefined, import_quantity: 0 });
             setErrors({});
        }
        setIsAdding(prev => !prev);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ product_id: undefined, supplier_id: undefined, import_quantity: 0 });
        setErrors({});
        setIsAdding(false); 
    };

    const handleEdit = (item: ImportProduct) => {
        setIsAdding(false); 
        setEditingId(item.id);
        setForm({
            product_id: String(item.product_id), 
            supplier_id: String(item.supplier_id),
            import_quantity: item.import_quantity || 0,
        });
        setErrors({});
    };

    const handleDelete = async (id: number) => {
        toast(
            (t) => (
                <div className="text-sm">
                    <p>Bạn có chắc chắn muốn xóa phiếu nhập kho ID {id}?</p>
                    <div className="mt-2 flex justify-center gap-3">
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                await deleteImportProduct(id);
                                toast.success("Xóa phiếu nhập kho thành công!");
                                fetchData();
                                fetchAllProducts();
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded-md"
                        >
                            Xóa
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1 bg-gray-300 rounded-md"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            ),
            { duration: 6000 }
        );
    };

    const validate = (isCreating: boolean) => {
        const newErrors: { [key: string]: string } = {};
        if (isCreating) {
            if (form.product_id === undefined || form.product_id === null || 
                (Array.isArray(form.product_id) && form.product_id.length === 0)) {
                newErrors.product_id = "Vui lòng chọn ít nhất 1 Sản phẩm (hoặc Tất cả).";
            }
            if (form.supplier_id === undefined || form.supplier_id === null || 
                (Array.isArray(form.supplier_id) && form.supplier_id.length === 0)) {
                newErrors.supplier_id = "Vui lòng chọn ít nhất 1 Nhà cung cấp (hoặc Tất cả).";
            }
        }
        if (form.import_quantity <= 0) {
            newErrors.import_quantity = "SL Nhập kho phải > 0.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        const isCreating = editingId === null;
        if (!validate(isCreating)) return;
        try {
            if (isCreating) {
                const createDto: CreateImportProductDto = {
                    product_id: form.product_id, 
                    supplier_id: form.supplier_id, 
                    import_quantity: form.import_quantity,
                };
                await createImportProduct(createDto);
                toast.success("Thêm phiếu nhập kho thành công!");
            } else {
                const updateDto: UpdateImportProductDto = { import_quantity: form.import_quantity };
                await updateImportProduct(editingId!, updateDto);
                toast.success(`Cập nhật phiếu nhập kho ID ${editingId} thành công!`);
            }
            handleCancelEdit(); 
            fetchData();
            fetchAllProducts(); 
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "Lỗi không xác định";
            toast.error("Lỗi xảy ra khi xử lý: " + message);
        }
    };

    const handlePageChange = useCallback((page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
            handleCancelEdit();
        }
    }, [currentPage]);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(1);
        handleCancelEdit();
    }, []);

    const paginatedImportProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredImportProducts.slice(startIndex, startIndex + pageSize);
    }, [filteredImportProducts, currentPage, pageSize]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSupplierFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSupplierId(Number(e.target.value));
    };

    const openEditProductModal = (product: Product) => {
        toast(`Mở modal sửa Sản phẩm ID: ${product.id}`);
    };

    const handleDeleteProduct = (id: number) => {
        toast.error(`Xóa sản phẩm ID: ${id} chưa được hỗ trợ`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Nhập kho (Import Product)
                </h2>

                <div className="mb-6 flex justify-end">
                    {editingId === null && (
                        <button
                            onClick={toggleAddMode}
                            className={`px-5 py-2 rounded-lg font-semibold shadow-md transition text-white ${
                                isAdding ? 'bg-red-500 hover:bg-red-600' : 'bg-[#F54900] hover:bg-orange-600'
                            }`}
                        >
                            {isAdding ? "Hủy Thêm mới" : "Thêm Phiếu Nhập kho"}
                        </button>
                    )}
                </div>

                {(isAdding || editingId !== null) && (
                    <ImportProductForm
                        form={form}
                        editingId={editingId}
                        errors={errors}
                        products={products}
                        suppliers={suppliers}
                        allProducts={allProducts} 
                        getDisplayName={getDisplayName as any} 
                        handleValueChange={handleValueChange}
                        handleNumberChange={handleNumberChange}
                        handleSubmit={handleSubmit}
                        handleCancelEdit={handleCancelEdit}
                        isAdding={isAdding} 
                    />
                )}

                <div className="flex flex-wrap justify-between items-end mb-6 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 w-full flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        Bộ lọc & Tìm kiếm (Phiếu nhập)
                    </h3>

                    <div className="w-full md:w-1/4 mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nhà cung cấp
                        </label>
                        <select
                        title="Lọc theo nhà cung cấp"
                            value={selectedSupplierId}
                            onChange={handleSupplierFilterChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                        >
                            <option value={0}>-- Tất cả --</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-1/3 flex gap-3 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Từ ngày
                            </label>
                            <input
                                title="Lọc theo ngày"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Đến ngày
                            </label>
                            <input
                                title="Lọc theo ngày"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 absolute left-3 top-3.5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Nhập tên SP hoặc Nhà CC..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-800 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>


                <h3 className="text-xl font-semibold text-gray-700 mb-4">Danh sách Phiếu nhập kho</h3>
                {loading ? (
                    <div className="text-center py-10 text-lg text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <ImportProductTable
                        importProducts={paginatedImportProducts}
                        products={products}
                        suppliers={suppliers}
                        getDisplayName={getDisplayName as any}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        totalItems={filteredImportProducts.length}
                        allProducts={allProducts} 
                    />
                )}

                <Pagination
                    totalItems={filteredImportProducts.length}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />

                <hr className="my-8 border-gray-300" />

                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Tồn kho Sản phẩm Tổng</h2>

                {loading ? (
                    <div className="text-center py-10 text-lg text-gray-500">
                        <p>Đang tải danh sách sản phẩm...</p>
                    </div>
                ) : (
                    <ProductTable
                        products={allProducts}
                        getSupplierName={getSupplierName}
                        getCategoryName={getCategoryName}
                        openEditModal={openEditProductModal}
                        handleDelete={handleDeleteProduct}
                        startIndex={0}
                    />
                )}
            </div>
            <Toaster position="top-center" />
        </div>
    );
}