// src/pages/InventoryPage.tsx

"use client";
import React, { useEffect, useState, useCallback } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import toast, { Toaster } from "react-hot-toast";
import {
    listInventories,
    createInventory,
    updateInventory,
    deleteInventory,
    getInventoryDetails,
    listDropdownProducts,
    listDropdownStores,
    listAllProducts,
    Inventory,
    CreateInventoryDto,
    UpdateInventoryDto,
    SelectOption,
    Product,
} from "@/api/services/inventoryService";

import InventoryForm from "@/components/inventory/InventoryForm";
import InventoryTable from "@/components/inventory/InventoryTable";
import TransferInventoryForm from "@/components/inventory/TransferInventoryForm";
import { getCategories } from "@/api/services/categoryService";

import Pagination from "@/components/inventory/Pagination";
import { ArrowLeftRight, Circle } from "lucide-react";

// Interface cho state của form
export interface InventoryFormState {
    product_id: string | string[] | undefined;
    store_id: string | string[] | undefined;
    quantity_stock: number;
    quantity_sold: number;
}
export type FormName = "product_id" | "store_id" | "quantity_stock" | "quantity_sold";

export default function InventoryPage() {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);

    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [products, setProducts] = useState<SelectOption[]>([]);
    const [stores, setStores] = useState<SelectOption[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedStoreId, setSelectedStoreId] = useState<number>(0);

    const [isAdding, setIsAdding] = useState(false);
    const [showTransferForm, setShowTransferForm] = useState(false);

    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    const [form, setForm] = useState<InventoryFormState>({
        product_id: undefined,
        store_id: undefined,
        quantity_stock: 0,
        quantity_sold: 0,

    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editClassificationData, setEditClassificationData] = useState<{ [classificationId: number]: number }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const getDisplayName = useCallback(
        (list: SelectOption[], id: number | string | undefined): string => {
            if (id === undefined || id === null) return "";
            if (typeof id === 'string' && id === 'all') return "TẤT CẢ";
            const numericId = Number(id);
            if (isNaN(numericId)) return "";
            const found = list.find((item) => Number(item.id) === numericId);
            return found?.name || `ID: ${id}`;
        },
        []
    );

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [productRes, storeRes, allProductRes] = await Promise.all([
                listDropdownProducts(),
                listDropdownStores(),
                listAllProducts(),
                getCategories()
            ]);

            setProducts(Array.isArray(productRes) ? productRes : []);
            setStores(Array.isArray(storeRes) ? storeRes : []);
            setAllProducts(Array.isArray(allProductRes) ? allProductRes : []);

        } catch {
            toast.error("Lỗi khi tải danh sách sản phẩm/cửa hàng.");
            setProducts([]);
            setStores([]);
            setAllProducts([]);
        }
    };

    // Hàm tải dữ liệu tồn kho chính
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await listInventories({
                page: currentPage,
                size: pageSize,
                key: searchQuery || undefined,
                store_id: selectedStoreId === 0 ? undefined : selectedStoreId,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });

            const inventoryList = res.data || [];
            setInventories(Array.isArray(inventoryList) ? inventoryList : []);
            setTotalItems(res.total || inventoryList.length);
            setCurrentPage(res.page || currentPage);
            setPageSize(res.size || pageSize);
        } catch {
            toast.error("Không thể tải danh sách tồn kho.");
            setInventories([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, selectedStoreId, fromDate, toDate]);

    // useEffect 2: Gọi fetchData khi page hoặc pageSize thay đổi
    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize, fetchData]);

    // useEffect 3: Reset trang về 1 khi bộ lọc thay đổi, sau đó gọi fetchData
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStoreId, searchQuery, fromDate, toDate]);

    // Xử lý thay đổi input số
    const handleNumberChange = (name: FormName, value: number) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Xử lý thay đổi CheckboxList/Select
    const handleValueChange = (name: "product_id" | "store_id", value: string | string[] | undefined) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Reset form và trạng thái
    const handleCancelEdit = () => {
        setEditingId(null);
        setIsAdding(false);
        setShowTransferForm(false);
        setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 });
        setEditClassificationData({});
        setErrors({});
    };

    // Mở form chỉnh sửa
    const handleEdit = async (item: Inventory) => {
        try {
            setEditingId(item.id);
            setIsAdding(false);

            // Load inventory details to get classification data
            const inventoryDetails = await getInventoryDetails(item.id);

            // Extract classification quantities from inventory details
            const classificationData: { [classificationId: number]: number } = {};
            if (inventoryDetails.inventory_details && inventoryDetails.inventory_details.length > 0) {
                inventoryDetails.inventory_details.forEach(detail => {
                    classificationData[detail.classification_attribute_relationship_id] = detail.quantity_stock;
                });
            }

            setEditClassificationData(classificationData);

            setForm({
                product_id: String(item.product_id),
                store_id: String(item.store_id),
                quantity_stock: item.quantity_stock || 0,
                quantity_sold: item.quantity_sold || 0,
            });

            setErrors({}); // Xóa lỗi cũ
        } catch (error) {
            console.error("Error loading inventory details:", error);
            toast.error("Không thể tải chi tiết tồn kho");
        }
    };

    const handleDelete = async (id: number) => {
        setItemToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    // Thực hiện xoá (chỉ gọi khi xác nhận) <--- THÊM HÀM NÀY
    const performDelete = async () => {
        if (itemToDeleteId === null) return;

        const id = itemToDeleteId;
        setIsDeleteDialogOpen(false);
        setItemToDeleteId(null);

        try {
            await deleteInventory(id);
            toast.success(`Đã xoá tồn kho ID ${id}!`);
            fetchData();
        } catch {
            const msg = "Không thể xoá tồn kho!";
            toast.error(msg);
        }
    };

    // Huỷ xoá <--- THÊM HÀM NÀY
    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setItemToDeleteId(null);
    };

    // Validate form
    const validate = (isCreating: boolean) => {
        const newErrors: { [key: string]: string } = {};

        if (isCreating) {
            if (!form.product_id || (Array.isArray(form.product_id) && form.product_id.length === 0)) {
                newErrors.product_id = "Vui lòng chọn sản phẩm.";
            }
            if (!form.store_id || (Array.isArray(form.store_id) && form.store_id.length === 0)) {
                newErrors.store_id = "Vui lòng chọn cửa hàng.";
            }
        }

        if (form.quantity_stock < 0) {
            newErrors.quantity_stock = "SL Tồn kho phải ≥ 0.";
        } else if (isCreating && form.product_id && !Array.isArray(form.product_id) && form.product_id !== 'all') {
            const product = allProducts.find(p => p.id === Number(form.product_id));
            if (product && form.quantity_stock > (product.total_quantity_divided || 0)) {
                newErrors.quantity_stock = `Số lượng nhập (${form.quantity_stock}) vượt quá số lượng còn trong kho (${product.total_quantity_divided || 0}).`;
            }
        }

        if (!isCreating && form.quantity_sold < 0) {
            newErrors.quantity_sold = "SL Đã bán phải ≥ 0.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    // Submit form (SP KHÔNG CÓ PHÂN LOẠI)
    const handleSubmit = async () => {
        const isCreating = editingId === null;
        if (!validate(isCreating)) return;

        try {
            if (isCreating) {
                const productId = form.product_id;
                const storeId = form.store_id;

                const createDto: CreateInventoryDto = {
                    product_id: productId as string | string[],
                    store_id: storeId as string | string[],
                    quantity_stock: form.quantity_stock,
                };

                await createInventory(createDto);
                toast.success("Tạo tồn kho thành công!");
                await fetchDropdownData();
            } else {
                const updateDto: UpdateInventoryDto = {
                    quantity_stock: form.quantity_stock,
                    quantity_sold: form.quantity_sold,
                };

                await updateInventory(editingId!, updateDto);
                toast.success(`Cập nhật tồn kho ID ${editingId} thành công!`);
                await fetchDropdownData();
            }

            handleCancelEdit();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Số lượng trong kho không đủ hoặc có lỗi khi cập nhật!");
        }
    };


    // Hàm submit với dữ liệu phân loại
    const handleSubmitWithClassifications = async (classificationQuantities: { [classificationId: number]: number }) => {
        const isCreating = editingId === null;
        if (!validate(isCreating)) return;

        try {
            if (isCreating) {
                const productId = form.product_id;
                const storeId = form.store_id;

                // Tạo inventory_details từ classification data
                const inventoryDetails = Object.entries(classificationQuantities)
                    .filter(([, quantity]) => quantity > 0)
                    .map(([classificationId, quantity]) => ({
                        classification_attribute_relationship_id: parseInt(classificationId),
                        quantity_stock: quantity,
                        quantity_sold: 0
                    }));

                const createDto: CreateInventoryDto = {
                    product_id: productId as string | string[],
                    store_id: storeId as string | string[],
                    inventory_details: inventoryDetails
                };

                await createInventory(createDto);
                toast.success("Chia hàng theo phân loại thành công!");
                await fetchDropdownData();
            } else {
                // Logic cho CẬP NHẬT với phân loại

                // Tạo inventory_details từ classification data
                const inventoryDetails = Object.entries(classificationQuantities)
                    .filter(([, quantity]) => quantity > 0)
                    .map(([classificationId, quantity]) => ({
                        classification_attribute_relationship_id: parseInt(classificationId),
                        quantity_stock: quantity,
                        quantity_sold: 0
                    }));

                const updateDto: UpdateInventoryDto = {
                    inventory_details: inventoryDetails
                };

                await updateInventory(editingId!, updateDto);
                toast.success(`Cập nhật tồn kho ID ${editingId} thành công!`);
                await fetchDropdownData();
            }

            handleCancelEdit();
            fetchData();
        } catch {
            toast.error("Lỗi khi chia hàng theo phân loại!");
        }
    };

    // Hàm mở form thêm mới
    const handleOpenAddForm = () => {
        setIsAdding(true);
        setEditingId(null);
        setShowTransferForm(false); // Đảm bảo đóng form chuyển hàng
        setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 }); // Reset form
        setErrors({}); // Xóa lỗi cũ
    }

    // Hàm mở form chuyển hàng
    const handleOpenTransferForm = () => {
        setShowTransferForm(true);
        setIsAdding(false); // Đảm bảo đóng form thêm mới
        setEditingId(null); // Đảm bảo đóng form chỉnh sửa
        setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 }); // Reset form
        setErrors({}); // Xóa lỗi cũ
    }


    return (
        <div className="min-h-screen">
            <Toaster position="top-center" />
            <div className="w-full mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 border border-gray-200">
                <h2 className="text-3xl font-extrabold text-[#B95D26] mb-8 tracking-wide">
                    Quản lý tồn kho trong cửa hàng
                </h2>

                {/* --- QUẢN LÝ TỒN KHO THÔNG THƯỜNG --- */}
                <>
                    {/* --- NÚT THÊM MỚI VÀ CHUYỂN HÀNG --- */}
                    <div className="flex justify-end gap-4 mb-6">
                        {editingId === null && !isAdding && !showTransferForm && (
                            <>
                                <button
                                    onClick={handleOpenAddForm}
                                    className="px-6 py-2 rounded-lg font-semibold shadow-md transition bg-[#F54900] hover:bg-orange-600 text-white flex items-center gap-2"
                                >
                                    + Thêm Tồn Kho Mới
                                </button>
                                <button
                                    onClick={handleOpenTransferForm}
                                    className="px-6 py-2 rounded-lg font-semibold shadow-md bg-blue-500 hover:bg-blue-700 text-white flex items-center gap-2"
                                >
                                    <ArrowLeftRight className="w-4 h-4 text-white" />
                                    Chuyển Hàng Giữa Cửa Hàng
                                </button>
                            </>
                        )}
                    </div>

                    {showTransferForm && (
                        <div className="mb-6" key="transfer-inventory-form">
                            <TransferInventoryForm
                                key="transfer-form-unique"
                                onSuccess={() => {
                                    fetchData();
                                    setShowTransferForm(false);
                                }}
                                onCancel={() => setShowTransferForm(false)}
                            />
                        </div>
                    )}

                    {(editingId !== null || isAdding) && (
                        <InventoryForm
                            form={form}
                            editingId={editingId}
                            errors={errors}
                            products={products}
                            stores={stores}
                            allProducts={allProducts}
                            getDisplayName={getDisplayName}
                            handleValueChange={handleValueChange}
                            handleNumberChange={handleNumberChange}
                            handleSubmit={handleSubmit}
                            handleSubmitWithClassifications={handleSubmitWithClassifications}
                            handleCancelEdit={handleCancelEdit}
                            editClassificationData={editClassificationData}
                        />
                    )}
                    <h1 className="text-2xl text-center font-bold text-[#B95D26]">
                        Danh sách sản phẩm tồn trong cửa hàng
                    </h1>
                    {/* --- BỘ LỌC & TÌM KIẾM --- */}
                    <div className="mt-10 bg-white p-6 rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cửa hàng
                                </label>
                                <select
                                    title="store-filter"
                                    value={selectedStoreId}
                                    onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={0}>-- Tất cả --</option>
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tìm kiếm (SP / Cửa hàng)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập từ khoá..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Từ ngày
                                </label>
                                <input
                                    title="date-from"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Đến ngày
                                </label>
                                <input
                                    title="date-to"
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- BẢNG DỮ LIỆU --- */}
                    {loading ? (
                        <div className="text-center py-10 text-lg text-gray-500">
                            Đang tải dữ liệu...
                        </div>
                    ) : (
                        <InventoryTable
                            inventories={inventories}
                            products={products}
                            stores={stores}
                            allProducts={allProducts}
                            getDisplayName={getDisplayName}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                            totalItems={totalItems}
                        />
                    )}

                    {/* --- PHÂN TRANG --- */}
                    <Pagination
                        totalItems={totalItems}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={(page) => setCurrentPage(page)}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                    />
                </>
            </div>

            {isDeleteDialogOpen && (
                <ConfirmDialog
                    message={`Bạn có chắc chắn muốn xóa Tồn kho ID: ${itemToDeleteId} này không? Hành động này không thể hoàn tác.`}
                    onConfirm={performDelete}
                    onCancel={handleCancelDelete}
                    title="Xác nhận Xóa Tồn kho"
                    confirmText="Xóa"
                    cancelText="Hủy"
                />
            )}
        </div>
    );
}