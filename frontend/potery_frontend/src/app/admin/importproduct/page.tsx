"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    listImportProducts,
    createImportProduct,
    updateImportProduct,
    deleteImportProduct,
    listDropdownProducts,
    listDropdownSuppliers, // Thay đổi
    ImportProduct,
    CreateImportProductDto,
    UpdateImportProductDto,
    SelectOption,
} from "@/api/services/importProductsService"; // Thay đổi

import ImportProductForm from "@/components/adminImportProduct/ImportProductForm"; // Thay đổi
import ImportProductTable from "@/components/adminImportProduct/ImportProductTable"; // Thay đổi
import Pagination from "@/components/inventory/Pagination"; // Giả định Pagination ở common

export interface ImportProductFormState {
    product_id: string | string[] | undefined;
    supplier_id: string | string[] | undefined; // Thay đổi
    import_quantity: number; // Thay đổi
}

export type FormName = "product_id" | "supplier_id" | "import_quantity"; // Thay đổi
export default function ImportProductPage() { // Thay đổi
    const [importProducts, setImportProducts] = useState<ImportProduct[]>([]); // Thay đổi
    const [products, setProducts] = useState<SelectOption[]>([]);
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]); // Thay đổi
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false); 

    // STATE LỌC VÀ TÌM KIẾM
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0); // Thay đổi

    const [form, setForm] = useState<ImportProductFormState>({ // Thay đổi
        product_id: undefined,
        supplier_id: undefined, // Thay đổi
        import_quantity: 0, // Thay đổi
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
    }, [currentPage, pageSize]);

    const fetchDropdownData = async () => {
        try {
            const [productRes, supplierRes] = await Promise.all([ // Thay đổi
                listDropdownProducts(),
                listDropdownSuppliers(), // Thay đổi
            ]);
            setProducts(Array.isArray(productRes) ? productRes : []);
            setSuppliers(Array.isArray(supplierRes) ? supplierRes : []); // Thay đổi
        } catch (error) {
            console.error("Lỗi tải dropdown data:", error);
            setProducts([]);
            setSuppliers([]);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true); 
            const res = await listImportProducts({ // Thay đổi
                page: currentPage,
                size: pageSize
            });

            const list = res.data || [];
            setImportProducts(Array.isArray(list) ? list : []); // Thay đổi
            setTotalItems(res.total || list.length);
            setCurrentPage(res.page || currentPage);
            setPageSize(res.size || pageSize);

        } catch (error) {
            console.error("Lỗi tải nhập kho:", error); // Thay đổi
            setImportProducts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };
    
    // LOGIC LỌC VÀ TÌM KIẾM (Client-side)
    const filteredImportProducts = useMemo(() => { // Thay đổi
        const query = searchQuery.toLowerCase().trim();
        const supplierId = selectedSupplierId; // Thay đổi

        return importProducts.filter(item => { // Thay đổi
            // Lọc theo Nhà cung cấp
            const supplierMatch = supplierId === 0 || Number(item.supplier_id) === supplierId; // Thay đổi

            // Tìm kiếm theo Tên Sản phẩm HOẶC Tên Nhà cung cấp
            const productName = getDisplayName(products, item.product_id).toLowerCase();
            const supplierName = getDisplayName(suppliers, item.supplier_id).toLowerCase(); // Thay đổi
            
            const searchMatch = !query || productName.includes(query) || supplierName.includes(query);

            return supplierMatch && searchMatch;
        });
    }, [importProducts, selectedSupplierId, searchQuery, products, suppliers, getDisplayName]); // Thay đổi dependencies
    
    // Đặt lại trang 1 khi filter hoặc search thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSupplierId, searchQuery]);


    // Handler cho input số (import_quantity)
    const handleNumberChange = (name: FormName, value: number) => { // Thay đổi FormName
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // Handler cho CheckboxList (product_id, supplier_id)
    const handleValueChange = (name: "product_id" | "supplier_id", value: string | string[] | undefined) => { // Thay đổi
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };
    
    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ product_id: undefined, supplier_id: undefined, import_quantity: 0 }); // Thay đổi
        setErrors({});
    }

    const handleEdit = (item: ImportProduct) => { // Thay đổi
        setEditingId(item.id);
        setForm({
            product_id: String(item.product_id),
            supplier_id: String(item.supplier_id), // Thay đổi
            import_quantity: item.import_quantity || 0, // Thay đổi
        });
        setErrors({});
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xoá phiếu nhập kho ID ${id} không?`)) return; // Thay đổi
        try {
            await deleteImportProduct(id); // Thay đổi
            alert(`Xoá phiếu nhập kho ID ${id} thành công.`); // Thay đổi
            fetchData();
        } catch (error) {
            console.error("Lỗi xoá phiếu nhập kho:", error); // Thay đổi
            alert("Lỗi xảy ra khi xoá phiếu nhập kho.");
        }
    };


    const checkForDuplicate = (productId: number, supplierId: number): boolean => { // Thay đổi
        if (!Array.isArray(importProducts)) return false; // Thay đổi
        // Check trùng trong danh sách nhập kho
        return importProducts.some( // Thay đổi
            item =>
                (item.id !== editingId) &&
                (Number(item.product_id) === productId) &&
                (Number(item.supplier_id) === supplierId) // Thay đổi
        );
    };

    const validate = (isCreating: boolean) => {
        const newErrors: { [key: string]: string } = {};

        if (isCreating) {
            if (form.product_id === undefined) {
                newErrors.product_id = "Vui lòng chọn ít nhất 1 Sản phẩm.";
            }
            if (form.supplier_id === undefined) { // Thay đổi
                newErrors.supplier_id = "Vui lòng chọn ít nhất 1 Nhà cung cấp."; // Thay đổi
            }
        }

        if (form.import_quantity <= 0) { // Thay đổi: Nhập kho phải > 0
            newErrors.import_quantity = "SL Nhập kho phải là số lớn hơn 0."; // Thay đổi
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
                    ? ['all']
                    : (Array.isArray(form.product_id)
                        ? form.product_id
                        : [form.product_id!]);

                const supplierIds: string[] = form.supplier_id === 'all' // Thay đổi
                    ? ['all']
                    : (Array.isArray(form.supplier_id) // Thay đổi
                        ? form.supplier_id // Thay đổi
                        : [form.supplier_id!]); // Thay đổi

                // Lưu ý: Dù backend chấp nhận tạo hàng loạt, frontend vẫn nên cảnh báo trùng lặp trước khi gửi
                // Nếu 'all' được chọn, ta bỏ qua check trùng lặp client-side vì sẽ là quá nhiều
                if (productIds.length === 1 && supplierIds.length === 1 && productIds[0] !== 'all' && supplierIds[0] !== 'all') {
                    if (checkForDuplicate(Number(productIds[0]), Number(supplierIds[0]))) {
                         alert(`Lỗi: Phiếu nhập kho cho Sản phẩm: ${getDisplayName(products, productIds[0])} và Nhà cung cấp: ${getDisplayName(suppliers, supplierIds[0])} đã tồn tại!`);
                         return;
                    }
                }

                const createDto: CreateImportProductDto = { // Thay đổi
                    product_id: form.product_id, // Gửi nguyên array/string/all cho backend xử lý
                    supplier_id: form.supplier_id, // Thay đổi
                    import_quantity: form.import_quantity, // Thay đổi
                };

                await createImportProduct(createDto); // Thay đổi
                alert(`Thêm mới phiếu nhập kho thành công!`); // Thay đổi
                

            } else {
                // UPDATE
                const updateDto: UpdateImportProductDto = { // Thay đổi
                    import_quantity: form.import_quantity, // Thay đổi
                };

                await updateImportProduct(editingId!, updateDto); // Thay đổi
                alert(`Cập nhật phiếu nhập kho ID ${editingId} thành công!`); // Thay đổi
            }

            // Reset form
            handleCancelEdit();
            fetchData();
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
    const paginatedImportProducts = useMemo(() => { // Thay đổi
        const startIndex = (currentPage - 1) * pageSize;
        return filteredImportProducts.slice(startIndex, startIndex + pageSize); // Thay đổi
    }, [filteredImportProducts, currentPage, pageSize]); // Thay đổi dependencies


    // Handlers cho Filter và Search
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSupplierFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => { // Thay đổi
        setSelectedSupplierId(Number(e.target.value)); // Thay đổi
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Nhập kho (Import Product)
                </h2>

                {/* KHU VỰC THÊM / SỬA FORM */}
                <ImportProductForm // Thay đổi component
                    form={form as any}
                    editingId={editingId}
                    errors={errors}
                    products={products}
                    suppliers={suppliers} // Thay đổi
                    getDisplayName={getDisplayName}
                    handleValueChange={handleValueChange as any}
                    handleNumberChange={handleNumberChange as any}
                    handleSubmit={handleSubmit}
                    handleCancelEdit={handleCancelEdit}
                />

                {/* KHU VỰC LỌC VÀ TÌM KIẾM MỚI */}
                <div className="flex flex-wrap justify-between items-center mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 w-full">Bộ lọc và Tìm kiếm</h3>

                    {/* Lọc theo Nhà cung cấp */}
                    <div className="w-full md:w-1/3 min-w-[200px] mb-3 md:mb-0">
                        <label htmlFor="supplier-filter" className="block text-sm font-medium text-gray-700">
                            Lọc theo Nhà cung cấp:
                        </label>
                        <select
                            id="supplier-filter"
                            value={selectedSupplierId} // Thay đổi
                            onChange={handleSupplierFilterChange} // Thay đổi
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
                        <p>Tổng số mục: <span className="font-bold">{filteredImportProducts.length}</span></p>
                        <p>Đang hiển thị: <span className="font-bold">{paginatedImportProducts.length}</span></p>
                    </div>
                </div>

                {/* KHU VỰC BẢNG DỮ LIỆU */}
                {loading ? (
                    <div className="text-center py-10 text-lg text-gray-500">
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <ImportProductTable // Thay đổi component
                        importProducts={paginatedImportProducts} // Thay đổi prop
                        products={products}
                        suppliers={suppliers} // Thay đổi prop
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
            </div>
        </div>
    );
}