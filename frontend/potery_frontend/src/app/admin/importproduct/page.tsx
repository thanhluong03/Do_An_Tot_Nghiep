"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";
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
    ListImportProductDto,
    Product,
    getProductClassifications,
    ProductClassification,
} from "@/api/services/importProductsService";

import ImportProductForm from "@/components/adminImportProduct/ImportProductForm";
import ImportProductTable from "@/components/adminImportProduct/ImportProductTable";
import { PlusCircle, RotateCw } from 'lucide-react';
import ProductListTable from "@/components/adminImportProduct/ProductTable";
import PaginationControls from "@/components/common/PaginationControls";


export interface SelectedProductItem {
    checked: boolean;
    quantity: string;
    price: string;
}

export type ProductSelectionState = Record<string, SelectedProductItem>;

export default function ImportProductPage() {
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
    // DỮ LIỆU SẢN PHẨM: TÁCH BIỆT MỤC ĐÍCH
    const [allProductsForForm, setAllProductsForForm] = useState<Product[]>([]); // Toàn bộ sản phẩm (cho việc lọc/chọn trong Form)
    const [productsInTable, setProductsInTable] = useState<Product[]>([]);       // Sản phẩm của trang hiện tại (cho bảng tồn kho)

    const [filteredProducts, setFilteredProducts] = useState<SelectOption[]>([]);

    const [importProducts, setImportProducts] = useState<ImportProduct[]>([]);

    // PHÂN TRANG LỊCH SỬ NHẬP KHO
    const [importPage, setImportPage] = useState(1);
    const [importPageSize] = useState(10);
    const [importTotalItems, setImportTotalItems] = useState(0);

    // PHÂN TRANG BẢNG TỒN KHO
    const [productListCurrentPage, setProductListCurrentPage] = useState(1);
    const [productListSize] = useState(10);
    const [productListTotalItems, setProductListTotalItems] = useState(0);

    const [selectedSupplier, setSelectedSupplier] = useState<string>("");
    const [selectedProducts, setSelectedProducts] = useState<ProductSelectionState>({});
    const [isAdding, setIsAdding] = useState(false);

    // NEW: State for classifications
    const [selectedProductClassifications, setSelectedProductClassifications] = useState<Record<string, ProductClassification[]>>({});
    const [classificationSelections, setClassificationSelections] = useState<Record<string, Record<number, { checked: boolean; quantity: string; price: string }>>>({});

    const [loadingImportHistory, setLoadingImportHistory] = useState(false);
    const [loadingProductList, setLoadingProductList] = useState(false);

    const [showTable, setShowTable] = useState(false);

    const [editingItem, setEditingItem] = useState<ImportProduct | null>(null);

    const fetchProductsForTable = async (page: number, size: number) => {
        setLoadingProductList(true);
        try {
            const res = await listProducts({ page, size });
            setProductsInTable(Array.isArray(res.data) ? res.data : []);
            setProductListTotalItems(res.total);
            setProductListCurrentPage(res.page);
        } catch {
            toast.error("Không thể tải danh sách sản phẩm tồn kho!");
            setProductsInTable([]);
            setProductListTotalItems(0);
        } finally {
            setLoadingProductList(false);
        }
    };

    // 2. Tải toàn bộ sản phẩm (hoặc một lượng lớn) để LỌC (Dùng cho ImportProductForm)
    const fetchAllProductsForForm = async () => {
        try {
            // Giả định API cho phép size lớn (ví dụ 1000) hoặc có API riêng cho dropdown/autocomplete
            const res = await listProducts({ page: 1, size: 1000 });
            setAllProductsForForm(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error("Không thể tải danh sách sản phẩm đầy đủ để tạo phiếu!");
            setAllProductsForForm([]);
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

    const fetchImportProducts = async (page: number, size: number) => {
        setLoadingImportHistory(true);
        try {
            const dto: ListImportProductDto = { page, size };
            const res = await listImportProducts(dto);
            setImportProducts(Array.isArray(res.data) ? res.data : []);
            setImportTotalItems(res.total);
            setImportPage(res.page);
        } catch {
            toast.error("Không thể tải danh sách phiếu nhập!");
            setImportProducts([]);
            setImportTotalItems(0);
        } finally {
            setLoadingImportHistory(false);
        }
    };

    const handleImportPageChange = (page: number) => {
        if (page < 1 || page > Math.ceil(importTotalItems / importPageSize)) return;
        setImportPage(page);
    };

    const handleProductListPageChange = (page: number) => {
        if (page < 1 || page > Math.ceil(productListTotalItems / productListSize)) return;
        setProductListCurrentPage(page);
    };

    // EFFECT: Tải dữ liệu ban đầu
    useEffect(() => {
        fetchDropdownData();
        fetchAllProductsForForm(); // Tải toàn bộ sản phẩm cho Form
    }, []);

    // EFFECT: Tải sản phẩm cho BẢNG TỒN KHO khi chuyển trang
    useEffect(() => {
        fetchProductsForTable(productListCurrentPage, productListSize);
    }, [productListCurrentPage, productListSize]);

    // EFFECT: Tải lịch sử nhập kho
    useEffect(() => {
        if (showTable) {
            fetchImportProducts(importPage, importPageSize);
        }
    }, [importPage, importPageSize, showTable]);

    // LOGIC LỌC SẢN PHẨM THEO NHÀ CUNG CẤP (Dùng allProductsForForm)
    useEffect(() => {
        const supplierId = selectedSupplier;

        if (supplierId) {
            const productsOfSelectedSupplier = allProductsForForm.filter(p =>
                String(p.supplier_id) === String(supplierId)
            );

            const newFilteredOptions: SelectOption[] = productsOfSelectedSupplier.map(p => ({
                id: String(p.id),
                name: p.name,
            }));

            if (JSON.stringify(newFilteredOptions) !== JSON.stringify(filteredProducts)) {
                setFilteredProducts(newFilteredOptions);
            }

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
                        newSelection[productId] = { checked: false, quantity: "", price: "" };
                    }
                });

                if (changed || Object.keys(newSelection).length !== Object.keys(prev).length) {
                    return newSelection;
                }
                return prev;
            });

        } else {
            if (filteredProducts.length > 0) {
                setFilteredProducts([]);
            }

            setSelectedProducts(prev => {
                const isAnyChecked = Object.values(prev).some(val => val.checked);

                if (!isAnyChecked) return prev;

                const newSelection = Object.fromEntries(
                    Object.keys(prev).map(id => [id, { checked: false, quantity: "", price: "" }])
                ) as ProductSelectionState;

                return newSelection;
            });
        }
    }, [selectedSupplier, allProductsForForm, filteredProducts]);

    // Load classifications for selected products
    useEffect(() => {
        const loadClassificationsForSelectedProducts = async () => {
            const checkedProductIds = Object.keys(selectedProducts).filter(
                productId => selectedProducts[productId]?.checked
            );

            for (const productId of checkedProductIds) {
                if (!selectedProductClassifications[productId]) {
                    try {
                        const classifications = await getProductClassifications(Number(productId));
                        setSelectedProductClassifications(prev => ({
                            ...prev,
                            [productId]: classifications
                        }));

                        // Initialize classification selections
                        const initialSelections: Record<number, { checked: boolean; quantity: string; price: string }> = {};
                        classifications.forEach(c => {
                            initialSelections[c.id] = { checked: false, quantity: "", price: "" };
                        });
                        setClassificationSelections(prev => ({
                            ...prev,
                            [productId]: initialSelections
                        }));
                    } catch (error) {
                        console.error('Error loading classifications for product', productId, error);
                    }
                }
            }
        };

        loadClassificationsForSelectedProducts();
    }, [selectedProducts, selectedProductClassifications]);


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

    // Classification handlers
    const handleClassificationCheckboxChange = (productId: string, classificationId: number) => {
        setClassificationSelections(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [classificationId]: {
                    ...prev[productId]?.[classificationId],
                    checked: !prev[productId]?.[classificationId]?.checked
                }
            }
        }));
    };

    const handleClassificationInputChange = (
        productId: string,
        classificationId: number,
        field: "quantity" | "price",
        value: string
    ) => {
        const cleanedValue = value.replace(/[^0-9]/g, '');
        setClassificationSelections(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [classificationId]: {
                    ...prev[productId]?.[classificationId],
                    [field]: cleanedValue
                }
            }
        }));
    };

    const resetForm = useCallback(() => {
        setSelectedSupplier("");
        setFilteredProducts([]);
        setSelectedProducts(
            Object.fromEntries(
                allProductsForForm.map((p: Product) => [
                    p.id,
                    { checked: false, quantity: "", price: "" },
                ])
            )
        );
        setSelectedProductClassifications({});
        setClassificationSelections({});
        setEditingItem(null);
    }, [allProductsForForm]);


    const handleSubmit = async () => {
        if (!selectedSupplier) {
            toast.error("Vui lòng chọn nhà cung cấp!");
            return;
        }

        // Collect all classification selections from all selected products
        const allClassificationData: Array<{
            product_id: number;
            supplier_id: number;
            classifications: Array<{
                classification_attribute_relationship_id: number;
                import_quantity: number;
                import_price: number;
            }>;
        }> = [];

        Object.entries(selectedProducts).forEach(([productId, productData]) => {
            if (productData.checked) {
                const productClassifications = selectedProductClassifications[productId] || [];
                const productClassificationSelections = classificationSelections[productId] || {};

                if (productClassifications.length > 0) {
                    // Product has classifications
                    const selectedClassifications = Object.entries(productClassificationSelections)
                        .filter(([_, classData]) => classData.checked && Number(classData.quantity) > 0)
                        .map(([classificationId, classData]) => ({
                            classification_attribute_relationship_id: Number(classificationId),
                            import_quantity: Number(classData.quantity),
                            import_price: Number(classData.price)
                        }));

                    if (selectedClassifications.length > 0) {
                        allClassificationData.push({
                            product_id: Number(productId),
                            supplier_id: Number(selectedSupplier),
                            classifications: selectedClassifications
                        });
                    }
                } else {
                    // Product has no classifications, use old logic
                    if (Number(productData.quantity) > 0) {
                        allClassificationData.push({
                            product_id: Number(productId),
                            supplier_id: Number(selectedSupplier),
                            classifications: [] // Empty classifications for products without variants
                        });
                    }
                }
            }
        });

        if (allClassificationData.length === 0) {
            toast.error("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ!");
            return;
        }

        try {
            // Create import for each product
            for (const productImportData of allClassificationData) {
                await createImportProduct(productImportData);
            }

            const totalProducts = allClassificationData.length;
            const totalClassifications = allClassificationData.reduce(
                (sum, item) => sum + item.classifications.length, 0
            );

            toast.success(
                `Tạo phiếu nhập kho thành công! ${totalProducts} sản phẩm, ${totalClassifications} phân loại`
            );
            resetForm();

            // Cập nhật lại tồn kho của trang hiện tại
            await fetchProductsForTable(productListCurrentPage, productListSize);
            // Cập nhật lại list sản phẩm đầy đủ cho form (để số lượng mới)
            await fetchAllProductsForForm();

            if (showTable) {
                setImportPage(1);
            }

            setIsAdding(false);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi lưu!";
            toast.error(msg);
        }
    };


    const handleDelete = async (id: number) => {
        setItemToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };
    const performDelete = async () => {
        if (itemToDeleteId === null) return;

        const id = itemToDeleteId;
        setIsDeleteDialogOpen(false);
        setItemToDeleteId(null);

        try {
            await deleteImportProduct(id);
            toast.success(`Xóa phiếu nhập kho ID #${id} thành công!`);
            await fetchProductsForTable(productListCurrentPage, productListSize);
            await fetchAllProductsForForm();

            fetchImportProducts(importPage, importPageSize);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Lỗi khi xóa!";
            toast.error(msg);
        }
    };
    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setItemToDeleteId(null);
    };
    const getProductName = (id: number | string | undefined): string => {
        if (!id) return "N/A";
        const found = allProductsForForm.find(p => String(p.id) === String(id));
        return found?.name || `ID: ${id}`;
    };

    const getSupplierName = (id: number | string | undefined): string => {
        if (!id) return "N/A";
        const found = suppliers.find(s => String(s.id) === String(id));
        return found?.name || `ID: ${id}`;
    };

    const getProductImage = useCallback((id: number | string | undefined): string | undefined => {
        if (!id) return undefined;
        // Tìm trong list đầy đủ cho form
        const found = allProductsForForm.find(p => String(p.id) === String(id));

        if (found) {
            return getProductImageUrl(found);
        }

        return undefined;
    }, [allProductsForForm]);

    return (
        <div className="min-h-screen">
            <Toaster position="top-center" />

            <div className="w-full mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-8">

                <div className="flex justify-between items-center mb-6  border-gray-200 pb-3">
                    <h1 className="text-2xl font-bold text-[#B95D26]">
                        Quản lý nhập kho sản phẩm
                    </h1>
                    <button
                        onClick={() => {
                            if (isAdding) resetForm();
                            setIsAdding(prev => !prev);
                            if (!isAdding) setShowTable(false);
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold shadow-md transition text-white flex items-center ${isAdding ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        <PlusCircle size={20} className="mr-2" />
                        {isAdding ? "Hủy Thêm mới" : "Thêm nhập kho"}
                    </button>
                </div>

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
                            selectedProductClassifications={selectedProductClassifications}
                            classificationSelections={classificationSelections}
                            handleClassificationCheckboxChange={handleClassificationCheckboxChange}
                            handleClassificationInputChange={handleClassificationInputChange}
                        />
                    </div>
                )}

                <div className="mt-6">
                    <div className="flex justify-end items-center mb-4">

                        <button
                            onClick={() => {
                                setShowTable(prev => !prev);
                                if (!showTable) {
                                    setImportPage(1);
                                }
                            }}
                            className="text-orange-600 hover:text-orange-700 p-2 transition duration-150"
                            title={showTable ? "Ẩn danh sách" : "Hiển thị danh sách"}
                        >
                            <div className="flex">
                                <span className="font-semibold mr-2 ">Xem lịch sử nhập</span>

                                <RotateCw size={30} className={showTable ? "animate-spin-slow" : ""} />
                            </div>
                        </button>
                    </div>

                    {showTable && (
                        loadingImportHistory && importProducts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                        ) : (
                            <ImportProductTable
                                importProducts={importProducts}
                                getProductName={getProductName}
                                getSupplierName={getSupplierName}
                                getProductImage={getProductImage}
                                handleDelete={handleDelete}
                                currentPage={importPage}
                                pageSize={importPageSize}
                                totalItems={importTotalItems}
                                onPageChange={handleImportPageChange}
                            />
                        )
                    )}

                </div>
                <div className="mt-10">
                    <h1 className="text-2xl text-center mb-4 font-bold text-[#B95D26]">
                        Danh sách sản phẩm tồn trong kho nhập
                    </h1>
                    <ProductListTable
                        products={productsInTable}
                        loading={loadingProductList}
                        getSupplierName={getSupplierName}
                        getProductImage={getProductImage}
                    />
                    <PaginationControls
                        currentPage={productListCurrentPage}
                        pageSize={productListSize}
                        totalItems={productListTotalItems}
                        onPageChange={handleProductListPageChange}
                    />
                </div>
            </div>
            {isDeleteDialogOpen && itemToDeleteId !== null && (
                <ConfirmDialog
                    title="Xác nhận Xóa Phiếu Nhập"
                    message={`Bạn có chắc chắn muốn xóa phiếu nhập kho ID #${itemToDeleteId} không? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa ngay"
                    cancelText="Giữ lại"
                    onConfirm={performDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
}