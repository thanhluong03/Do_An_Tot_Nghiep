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
    getProductSellingPrice,
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
    selling_price?: string;
}

export type ProductSelectionState = Record<string, SelectedProductItem>;

export default function ImportProductPage() {
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
    // DỮ LIỆU SẢN PHẨM: TÁCH BIỆT MỤC ĐÍCH
    const [allProductsForForm, setAllProductsForForm] = useState<Product[]>([]); // Toàn bộ sản phẩm (cho việc lọc/chọn trong Form)
    // Toàn bộ sản phẩm tồn kho (không phân trang từ API)
    const [allProductsInTable, setAllProductsInTable] = useState<Product[]>([]);
    // Sản phẩm của trang hiện tại (phân trang local)
    const [productsInTable, setProductsInTable] = useState<Product[]>([]);

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
    const [classificationSelections, setClassificationSelections] = useState<Record<string, Record<number, { checked: boolean; quantity: string; price: string; selling_price?: string; new_selling_price?: string }>>>({});
    const [sellingPrices, setSellingPrices] = useState<Record<string, string>>({});  // Giá bán hiện tại
    const [newSellingPrices, setNewSellingPrices] = useState<Record<string, string>>({});  // Giá bán mới user nhập

    const [loadingImportHistory, setLoadingImportHistory] = useState(false);
    const [loadingProductList, setLoadingProductList] = useState(false);

    const [showTable, setShowTable] = useState(false);

    const [editingItem, setEditingItem] = useState<ImportProduct | null>(null);

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

    // Fetch all products for table (no pagination from API)
    const fetchProductsForTable = async () => {
        setLoadingProductList(true);
        try {
            const res = await listProducts({ page: 1, size: 1000 });
            // Lọc bỏ sản phẩm có số lượng tồn kho = 0 và sắp xếp theo cập nhật mới nhất lên đầu
            const allProducts = Array.isArray(res.data)
                ? res.data
                    .filter(p => Number(p.quantity) > 0)
                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                : [];
            setAllProductsInTable(allProducts);
            setProductListTotalItems(allProducts.length);
            setProductListCurrentPage(1);
        } catch {
            toast.error("Không thể tải danh sách sản phẩm tồn kho!");
            setAllProductsInTable([]);
            setProductListTotalItems(0);
        } finally {
            setLoadingProductList(false);
        }
    };

    const handleImportPageChange = (page: number) => {
        if (page < 1 || page > Math.ceil(importTotalItems / importPageSize)) return;
        setImportPage(page);
    };

    const handleProductListPageChange = (page: number) => {
        const totalPages = Math.max(1, Math.ceil(productListTotalItems / productListSize));
        if (page < 1 || page > totalPages) return;
        setProductListCurrentPage(page);
    };

    // EFFECT: Tải dữ liệu ban đầu
    useEffect(() => {
        fetchDropdownData();
        fetchAllProductsForForm(); // Tải toàn bộ sản phẩm cho Form
    }, []);

    // Fetch all products once
    useEffect(() => {
        fetchProductsForTable();
    }, []);

    // Slice products for current page
    useEffect(() => {
        const startIdx = (productListCurrentPage - 1) * productListSize;
        const endIdx = startIdx + productListSize;
        setProductsInTable(allProductsInTable.slice(startIdx, endIdx));
    }, [allProductsInTable, productListCurrentPage, productListSize]);

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


    const handleCheckboxChange = async (productId: string) => {
        setSelectedProducts((prev) => {
            const currentItem = prev[productId] || { checked: false, quantity: "", price: "", selling_price: "" };

            const newChecked = !currentItem.checked;

            // If checking the product, fetch selling price
            if (newChecked) {
                fetchSellingPrice(productId);
            }

            return {
                ...prev,
                [productId]: {
                    ...currentItem,
                    checked: newChecked,
                },
            };
        });
    };

    const fetchSellingPrice = async (productId: string) => {
        try {
            const result = await getProductSellingPrice(Number(productId));
            if (result.success) {
                // Parse để lấy số nguyên từ giá dạng "25000.00"
                const price = Math.floor(Number(result.selling_price));
                setSellingPrices(prev => ({
                    ...prev,
                    [productId]: price.toString(),
                }));
            }
        } catch (error) {
            console.error("Error fetching selling price:", error);
        }
    };

    const handleInputChange = (
        productId: string,
        field: "quantity" | "price" | "selling_price",
        value: string
    ) => {
        const cleanedValue = value.replace(/[^0-9]/g, '');

        if (field === "selling_price") {
            setNewSellingPrices(prev => ({
                ...prev,
                [productId]: cleanedValue,
            }));
        } else {
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
        }
    };

    // Classification handlers
    const handleClassificationCheckboxChange = async (productId: string, classificationId: number) => {
        setClassificationSelections(prev => {
            const newChecked = !prev[productId]?.[classificationId]?.checked;

            // If checking the classification, fetch selling price
            if (newChecked) {
                fetchClassificationSellingPrice(productId, classificationId);
            }

            return {
                ...prev,
                [productId]: {
                    ...prev[productId],
                    [classificationId]: {
                        ...prev[productId]?.[classificationId],
                        checked: newChecked
                    }
                }
            };
        });
    };

    const fetchClassificationSellingPrice = async (productId: string, classificationId: number) => {
        try {
            const result = await getProductSellingPrice(Number(productId), classificationId);
            if (result.success) {
                // Parse để lấy số nguyên từ giá dạng "25000.00"
                const price = Math.floor(Number(result.selling_price));
                setClassificationSelections(prev => ({
                    ...prev,
                    [productId]: {
                        ...prev[productId],
                        [classificationId]: {
                            ...prev[productId]?.[classificationId],
                            selling_price: price.toString(),
                        }
                    }
                }));
            }
        } catch (error) {
            console.error("Error fetching classification selling price:", error);
        }
    };

    const handleClassificationInputChange = (
        productId: string,
        classificationId: number,
        field: "quantity" | "price" | "selling_price" | "new_selling_price",
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
        setSellingPrices({});
        setNewSellingPrices({});
        setEditingItem(null);
    }, [allProductsForForm]);
    const handleSubmit = async () => {
        if (!selectedSupplier) {
            toast.error("Vui lòng chọn nhà cung cấp!");
            return;
        }

        const details: any[] = [];
        const selectedProductsData = allProductsForForm.filter(p => selectedProducts[String(p.id)]?.checked);

        for (const product of selectedProductsData) {
            const productId = String(product.id);
            const productData = selectedProducts[productId];

            const productClassifications = selectedProductClassifications[productId] || [];
            const productClassificationSelections = classificationSelections[productId] || {};

            if (productClassifications.length > 0) {
                // Sản phẩm có phân loại
                const selectedClassifications = Object.entries(productClassificationSelections)
                    .filter(([_, classData]) => classData.checked && Number(classData.quantity) > 0)
                    .map(([classificationId, classData]) => {
                        const new_selling_price = Number(classData.new_selling_price || 0);
                        const import_price = Number(classData.price);
                        const currentSellingPrice = Math.floor(Number(classData.selling_price || 0));

                        // Validation 1: nếu có nhập giá bán mới, phải >= giá nhập
                        if (new_selling_price > 0 && new_selling_price < import_price) {
                            toast.error(`Giá bán mới (${new_selling_price.toLocaleString()}) phải lớn hơn hoặc bằng giá nhập (${import_price.toLocaleString()}) cho sản phẩm ${product.name}`);
                            throw new Error("Invalid selling price");
                        }

                        // Validation 2: nếu giá nhập > giá bán hiện tại, bắt buộc phải nhập giá bán mới
                        if (import_price > currentSellingPrice && new_selling_price === 0) {
                            toast.error(`Giá nhập (${import_price.toLocaleString()}) cao hơn giá bán hiện tại (${currentSellingPrice.toLocaleString()}). Vui lòng nhập giá bán mới cho sản phẩm ${product.name}`);
                            throw new Error("New selling price required");
                        }

                        return {
                            product_id: Number(productId),
                            classification_attribute_relationship_id: Number(classificationId),
                            import_quantity: Number(classData.quantity),
                            import_price: import_price,
                            selling_price: new_selling_price > 0 ? new_selling_price : undefined,
                        };
                    });

                details.push(...selectedClassifications);
            } else {
                // Sản phẩm không có phân loại
                const quantity = Number(productData.quantity);
                const price = Number(productData.price);
                const newSellingPrice = Number(newSellingPrices[productId] || 0);
                const currentSellingPrice = Math.floor(Number(sellingPrices[productId] || 0));

                // Validation 1: nếu có nhập giá bán mới, phải >= giá nhập
                if (newSellingPrice > 0 && newSellingPrice < price) {
                    toast.error(`Giá bán mới (${newSellingPrice.toLocaleString()}) phải lớn hơn hoặc bằng giá nhập (${price.toLocaleString()}) cho sản phẩm ${product.name}`);
                    return;
                }

                // Validation 2: nếu giá nhập > giá bán hiện tại, bắt buộc phải nhập giá bán mới
                if (price > currentSellingPrice && newSellingPrice === 0) {
                    toast.error(`Giá nhập (${price.toLocaleString()}) cao hơn giá bán hiện tại (${currentSellingPrice.toLocaleString()}). Vui lòng nhập giá bán mới cho sản phẩm ${product.name}`);
                    return;
                }

                if (quantity > 0 && price > 0) {
                    details.push({
                        product_id: Number(productId),
                        import_quantity: quantity,
                        import_price: price,
                        selling_price: newSellingPrice > 0 ? newSellingPrice : undefined,
                        // Không có classification_attribute_relationship_id
                    });
                }
            }
        }

        if (details.length === 0) {
            toast.error("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ!");
            return;
        }

        try {
            // Gửi một request duy nhất với tất cả details
            const importData: CreateImportProductDto = {
                user_id: 1, // TODO: Lấy từ auth context
                supplier_id: Number(selectedSupplier),
                details: details
            };

            await createImportProduct(importData);

            toast.success(
                `Tạo phiếu nhập kho thành công! ${details.length} chi tiết sản phẩm`
            );
            resetForm();

            // Cập nhật lại dữ liệu
            await fetchProductsForTable();
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
            await fetchProductsForTable();
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

            <div className="w-full mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-1">

                <div className="flex justify-between items-center m-6  border-gray-200 pb-3">
                    <h1 className="text-3xl font-bold text-[#B95D26]">
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
                            sellingPrices={sellingPrices}
                            newSellingPrices={newSellingPrices}
                        />
                    </div>
                )}

                <div className="mt-6">
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
                                <div className="flex mr-3 items-center">
                                    <span className="font-semibold ">
                                        {showTable ? "Ẩn lịch sử nhập kho" : "Xem lịch sử nhập kho"}
                                    </span>

                                    <RotateCw size={25} className={showTable ? "animate-spin-slow ml-2" : "ml-2"} />
                                </div>
                            </button>
                        </div>
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