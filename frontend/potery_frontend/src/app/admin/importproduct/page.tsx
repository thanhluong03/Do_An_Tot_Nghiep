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
} from "@/api/services/importProductsService";

import ImportProductForm from "@/components/adminImportProduct/ImportProductForm";
import ImportProductTable from "@/components/adminImportProduct/ImportProductTable";
interface Product { 
    id: string | number;
    name: string;
    supplier_id: string | number;
    // Thêm các trường cần thiết cho hàm getProductImageUrl
    images?: { url?: string; image_data?: string | { data: number[] } }[];
    main_image?: string | { data: number[] };
}

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
    
    // Form state
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");
    const [selectedProducts, setSelectedProducts] = useState<ProductSelectionState>({});
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    
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
    
    const fetchImportProducts = async () => {
        setLoading(true);
        try {
            const res = await listImportProducts({ page: 1, size: 100 }); 
            setImportProducts(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Không thể tải danh sách phiếu nhập!");
            setImportProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdownData();
        fetchImportProducts();
        fetchAllProducts(); // 💡 Tải toàn bộ sản phẩm
    }, []);

    // ----------------------------------------------------
    // 💡 LOGIC LỌC SẢN PHẨM THEO NHÀ CUNG CẤP (QUAN TRỌNG)
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
                // Không cần thêm imageUrl ở đây, vì ImportProductForm sẽ tự tìm
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


    // --- FORM HANDLERS ---
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
            fetchImportProducts(); 
            setIsAdding(false);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi lưu!";
            toast.error(msg);
        }
    };
    
    // --- TABLE HANDLERS (Giữ nguyên) ---

    const handleEdit = (item: ImportProduct) => {
        if (item.items && item.items.length > 1) {
            toast.error("Không thể sửa phiếu nhập nhiều sản phẩm!");
            return;
        }
        toast("Tính năng sửa đang được phát triển...", { icon: '🛠️' });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa phiếu nhập kho ID #${id}?`)) {
            return;
        }

        try {
            await deleteImportProduct(id);
            toast.success(`Xóa phiếu nhập kho ID #${id} thành công!`);
            fetchImportProducts();
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
    
    // 🚀 ĐỊNH NGHĨA HÀM LẤY ẢNH VÀ SỬ DỤNG getProductImageUrl TỪ SERVICE
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
            <Toaster position="top-right" />
            
            <div className="w-full mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                <h1 className="text-3xl font-extrabold text-orange-600 mb-6 border-b-2 border-orange-200 pb-3 text-center">
                    Quản lý Phiếu Nhập kho
                </h1>

                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => {
                            if (isAdding) resetForm();
                            setIsAdding(prev => !prev);
                        }}
                        className={`px-5 py-2 rounded-lg font-semibold shadow-md transition text-white ${isAdding ? 'bg-red-500 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        {isAdding ? "Hủy Thêm mới" : "+ Tạo Phiếu Nhập mới"}
                    </button>
                </div>

                {isAdding && (
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
                )}
                
                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">
                        Lịch sử nhập kho của các sản phẩm({importProducts.length})
                    </h2>
                    
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                    ) : (
                        <ImportProductTable
                            importProducts={importProducts}
                            getProductName={getProductName}
                            getSupplierName={getSupplierName}
                            getProductImage={getProductImage}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}