"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
    listDropdownSuppliers,
    createImportProduct,
    SelectOption,
    CreateImportProductDto,
    listImportProducts,
    ImportProduct,
    deleteImportProduct,
    listProducts,
    getProductImageUrl, 
    // 💡 Import ListImportProductDto
    ListImportProductDto,
    Product,
} from "@/api/services/importProductsService";

import ImportProductForm from "@/components/adminImportProduct/ImportProductForm";
import ImportProductTable from "@/components/adminImportProduct/ImportProductTable";
// 💡 Import thêm icon History/RotateCw
import { PlusCircle, RotateCw } from 'lucide-react'; 
import ProductListTable from "@/components/adminImportProduct/ProductTable";



export interface SelectedProductItem {
    checked: boolean;
    quantity: string; // Giữ là string để dễ dàng xử lý input
    price: string;
}

export type ProductSelectionState = Record<string, SelectedProductItem>;

export default function ImportProductPage() {
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<SelectOption[]>([]);

    const [importProducts, setImportProducts] = useState<ImportProduct[]>([]);
    
    // 💡 STATE PHÂN TRANG MỚI
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10); // Kích thước trang cố định là 10
    const [totalItems, setTotalItems] = useState(0); 
    
    // Form state
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");
    const [selectedProducts, setSelectedProducts] = useState<ProductSelectionState>({});
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // 💡 STATE MỚI: Kiểm soát việc hiển thị bảng lịch sử nhập kho
    const [showTable, setShowTable] = useState(false); 
    
    const [editingItem, setEditingItem] = useState<ImportProduct | null>(null);
    
    const fetchAllProducts = async () => {
        try {
            const res = await listProducts({ page: 1, size: 1000 }); 
            setAllProducts(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Không thể tải danh sách chi tiết sản phẩm!");
            setAllProducts([]);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [supplierRes] = await Promise.all([
                listDropdownSuppliers(),
            ]);
            setSuppliers(Array.isArray(supplierRes) ? supplierRes : []);
        } catch (err) {
            toast.error("Không thể tải danh sách nhà cung cấp!");
        }
    };
    
    // 💡 CẬP NHẬT HÀM FETCH VỚI PHÂN TRANG
    const fetchImportProducts = async (page: number, size: number) => {
        setLoading(true);
        try {
            const dto: ListImportProductDto = { page, size };
            const res = await listImportProducts(dto); 
            setImportProducts(Array.isArray(res.data) ? res.data : []);
            setTotalItems(res.total); 
            setCurrentPage(res.page); // Cập nhật lại trang hiện tại (phòng trường hợp API trả về trang khác)
        } catch {
            toast.error("Không thể tải danh sách phiếu nhập!");
            setImportProducts([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };
    
    // 💡 HANDLE PAGE CHANGE
    const handlePageChange = (page: number) => {
        if (page < 1 || page > Math.ceil(totalItems / pageSize)) return;
        setCurrentPage(page);
    };

    useEffect(() => {
        fetchDropdownData();
        fetchAllProducts(); 
    }, []);
    
    // 💡 EFFECT MỚI: Gọi API khi currentPage hoặc pageSize thay đổi
    useEffect(() => {
        if (showTable) { // Chỉ tải khi bảng hiển thị
            fetchImportProducts(currentPage, pageSize);
        }
    }, [currentPage, pageSize, showTable]); 
    // ----------------------------------------------------
    // LOGIC LỌC SẢN PHẨM THEO NHÀ CUNG CẤP (Giữ nguyên)
    // ----------------------------------------------------
    useEffect(() => {
        const supplierId = selectedSupplier;
        
        // 1. Nếu đã chọn NCC
        if (supplierId) {
            const productsOfSelectedSupplier = allProducts.filter(p => 
                String(p.supplier_id) === String(supplierId)
            );
            
            const newFilteredOptions: SelectOption[] = productsOfSelectedSupplier.map(p => ({
                id: String(p.id), 
                name: p.name,
            }));
            
            // Chỉ set state nếu danh sách có thay đổi
            if (JSON.stringify(newFilteredOptions) !== JSON.stringify(filteredProducts)) {
                   setFilteredProducts(newFilteredOptions);
            }

            // 3. Reset các mục đã chọn nếu chúng không còn thuộc NCC này nữa
            const productIdsOfSupplier = newFilteredOptions.map(p => p.id);
            setSelectedProducts(prev => {
                const newSelection: ProductSelectionState = {};
                let changed = false;
                
                Object.keys(prev).forEach(productId => {
                    if (productIdsOfSupplier.includes(productId)) {
                        newSelection[productId] = prev[productId];
                    } else {
                        if (prev[productId] && prev[productId].checked) { 
                            changed = true;
                        }
                        // Vẫn giữ entry nhưng đảm bảo nó không được checked
                        newSelection[productId] = { checked: false, quantity: "", price: "" };
                    }
                });
                
                if (changed || Object.keys(newSelection).length !== Object.keys(prev).length) {
                    return newSelection;
                }
                return prev;
            });
            
        } else {
            // 2. Nếu chưa chọn NCC
            if (filteredProducts.length > 0) {
                setFilteredProducts([]);
            }
            
            // Reset tất cả checked items khi NCC bị bỏ chọn
            setSelectedProducts(prev => {
                 const isAnyChecked = Object.values(prev).some(val => val.checked);
                 
                 if (!isAnyChecked) return prev; 

                 const newSelection = Object.fromEntries(
                     Object.keys(prev).map(id => [id, { checked: false, quantity: "", price: "" }])
                 ) as ProductSelectionState;
                 
                 return newSelection;
            });
        }
    }, [selectedSupplier, allProducts, filteredProducts]); 
    // ----------------------------------------------------


    // --- FORM HANDLERS (Giữ nguyên) ---
    const handleCheckboxChange = (productId: string) => {
        setSelectedProducts((prev) => {
            const currentItem = prev[productId] || { checked: false, quantity: "", price: "" };
            
            return {
                ...prev,
                [productId]: {
                    ...currentItem,
                    checked: !currentItem.checked, 
                },
            };
        });
    };

    const handleInputChange = (
        productId: string,
        field: "quantity" | "price",
        value: string
    ) => {
        const cleanedValue = value.replace(/[^0-9]/g, ''); 

        setSelectedProducts((prev) => {
            const currentItem = prev[productId] || { checked: false, quantity: "", price: "" };

            return {
                ...prev,
                [productId]: {
                    ...currentItem,
                    [field]: cleanedValue,
                },
            };
        });
    };

    const resetForm = useCallback(() => {
        setSelectedSupplier("");
        setFilteredProducts([]); 
        setSelectedProducts(
            Object.fromEntries(
                allProducts.map((p: any) => [
                    p.id,
                    { checked: false, quantity: "", price: "" },
                ])
            )
        );
        setEditingItem(null);
    }, [allProducts]);


    const handleSubmit = async () => {
        if (!selectedSupplier) {
            toast.error("Vui lòng chọn nhà cung cấp!");
            return;
        }

        const selectedItems = Object.entries(selectedProducts)
            .filter(([_, val]) => val.checked)
            .map(([id, val]) => ({
                product_id: Number(id),
                import_quantity: Number(val.quantity) || 0,
                import_price: Number(val.price) || 0,
            }))
            .filter((item) => item.import_quantity > 0);

        if (selectedItems.length === 0) {
            toast.error("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ!");
            return;
        }

        const payload: CreateImportProductDto = {
            supplier_id: Number(selectedSupplier),
            items: selectedItems,
        };

        try {
            await createImportProduct(payload);
            toast.success(`Tạo phiếu nhập kho với ${selectedItems.length} sản phẩm thành công!`);
            resetForm();
            await fetchAllProducts(); 
            setCurrentPage(1); 
            // Không cần gọi fetchImportProducts ở đây vì useEffect sẽ gọi khi currentPage thay đổi
            setIsAdding(false);
            
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi lưu!";
            toast.error(msg);
        }
    };
    

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa phiếu nhập kho ID #${id}?`)) {
            return;
        }

        try {
            await deleteImportProduct(id);
            toast.success(`Xóa phiếu nhập kho ID #${id} thành công!`);
            // 💡 Sau khi xóa, load lại trang hiện tại (hoặc trang 1 nếu trang hiện tại bị rỗng)
            fetchImportProducts(currentPage, pageSize); 
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi xóa!";
            toast.error(msg);
        }
    };
    
    // Hàm hỗ trợ tìm tên SP/NCC cho Table (Giữ nguyên)
    const getProductName = (id: number | string | undefined): string => {
        if (!id) return "N/A";
        const found = allProducts.find(p => String(p.id) === String(id));
        return found?.name || `ID: ${id}`;
    };
    
    const getSupplierName = (id: number | string | undefined): string => {
        if (!id) return "N/A";
        const found = suppliers.find(s => String(s.id) === String(id));
        return found?.name || `ID: ${id}`;
    };
    
    // ĐỊNH NGHĨA HÀM LẤY ẢNH VÀ SỬ DỤNG getProductImageUrl TỪ SERVICE (Giữ nguyên)
    const getProductImage = useCallback((id: number | string | undefined): string | undefined => {
        if (!id) return undefined;
        // Tìm toàn bộ thông tin sản phẩm từ allProducts
        const found = allProducts.find(p => String(p.id) === String(id));
        
        if (found) {
            // Sử dụng hàm chuẩn hóa từ service để lấy URL ảnh
            return getProductImageUrl(found);
        }
        
        return undefined;
    }, [allProducts]); // useCallback để tránh re-render không cần thiết

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <Toaster position="top-center" />
            
            <div className="w-full mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                
                {/* 💡 HEADER MỚI: Giống như "Quản lý kho hàng" */}
                <div className="flex justify-between items-center mb-6  border-gray-200 pb-3">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Quản lý nhập kho sản phẩm
                    </h1>
                    <button
                        onClick={() => {
                            if (isAdding) resetForm();
                            setIsAdding(prev => !prev);
                            // 💡 Nếu đang tạo phiếu mới, ẩn bảng lịch sử đi
                            if (!isAdding) setShowTable(false); 
                        }}
                        // 💡 Đổi màu sắc và text để giống với ảnh
                        className={`px-4 py-2 rounded-lg font-semibold shadow-md transition text-white flex items-center ${isAdding ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        <PlusCircle size={20} className="mr-2" />
                        {isAdding ? "Hủy Thêm mới" : "Thêm nhập kho"}
                    </button>
                </div>
                {/* ---------------------------------------------------- */}

                {isAdding && (
                    <div className="mb-8 p-6 border border-green-200 rounded-xl bg-green-50/50">
                        <ImportProductForm
                            suppliers={suppliers}
                            products={filteredProducts} 
                            selectedSupplier={selectedSupplier}
                            selectedProducts={selectedProducts}
                            setSelectedSupplier={setSelectedSupplier}
                            handleCheckboxChange={handleCheckboxChange}
                            handleInputChange={handleInputChange}
                            handleSubmit={handleSubmit}
                            getProductImage={getProductImage} 
                        />
                    </div>
                )}
                
                <div className="mt-6">
                    {/* 💡 KHU VỰC TIÊU ĐỀ BẢNG VÀ NÚT TOGGLE */}
                    <div className="flex justify-end items-center mb-4">
                        
                        <button 
                            onClick={() => {
                                setShowTable(prev => !prev);
                                // 💡 Khi mở bảng, nếu chưa có data thì tải lại (đã được xử lý bởi useEffect)
                                if (!showTable) {
                                    setCurrentPage(1); // Luôn bắt đầu ở trang 1 khi mở
                                }
                            }}
                            className="text-orange-600 hover:text-orange-700 p-2 transition duration-150"
                            title={showTable ? "Ẩn danh sách" : "Hiển thị danh sách"}
                        >
                            {/* 💡 Icon Đồng hồ quay ngược/Refresh */}
                            <RotateCw size={24} className={showTable ? "animate-spin-slow" : ""} />
                        </button>
                    </div>
                    {/* ------------------------------------------- */}

                    {/* 💡 CHỈ HIỂN THỊ BẢNG KHI showTable là true */}
                    {showTable && (
                        loading && importProducts.length === 0 ? ( // Hiển thị loading chỉ khi chưa có dữ liệu nào
                            <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                        ) : (
                            <ImportProductTable
                                importProducts={importProducts}
                                getProductName={getProductName}
                                getSupplierName={getSupplierName}
                                getProductImage={getProductImage}
                                handleDelete={handleDelete}
                                // 💡 TRUYỀN PROPS PHÂN TRANG
                                currentPage={currentPage}
                                pageSize={pageSize}
                                totalItems={totalItems}
                                onPageChange={handlePageChange}
                            />
                        )
                    )}
                    
                </div>
                    <div className="mt-10">
                        <h2 className="text-xl text-center mb-4 font-bold text-orange-700">
                            Danh sách sản phẩm tồn trong kho nhập
                        </h2>
                    <ProductListTable
                        products={allProducts}
                        loading={loading}
                        getSupplierName={getSupplierName}
                        getProductImage={getProductImage}
                    />
                    </div>
            </div>
        </div>
    );
}