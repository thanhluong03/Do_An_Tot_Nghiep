// src/pages/InventoryPage.tsx

"use client";
import React, { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
    listInventories,
    createInventory,
    updateInventory,
    deleteInventory,
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
import { getCategories, Category } from "@/api/services/categoryService";

import Pagination from "@/components/inventory/Pagination";

// Interface cho state của form
export interface InventoryFormState {
    product_id: string | string[] | undefined;
    store_id: string | string[] | undefined;
    quantity_stock: number;
    quantity_sold: number;
}
export type FormName = "product_id" | "store_id" | "quantity_stock" | "quantity_sold";

export default function InventoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);

    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [products, setProducts] = useState<SelectOption[]>([]);
    const [stores, setStores] = useState<SelectOption[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]); // Danh sách Product đầy đủ
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedStoreId, setSelectedStoreId] = useState<number>(0);

    // State kiểm soát hiển thị form Thêm mới (khi editingId === null)
    const [isAdding, setIsAdding] = useState(false);

    // --- Bộ lọc theo thời gian ---
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    const [form, setForm] = useState<InventoryFormState>({
        product_id: undefined,
        store_id: undefined,
        quantity_stock: 0,
        quantity_sold: 0,
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Hàm lấy tên hiển thị
    const getDisplayName = useCallback(
        (list: SelectOption[], id: number | string | undefined): string => {
            if (id === undefined || id === null) return "";
            // Xử lý giá trị 'all' nếu có
            if (typeof id === 'string' && id === 'all') return "TẤT CẢ";
            const numericId = Number(id);
            if (isNaN(numericId)) return "";
            const found = list.find((item) => Number(item.id) === numericId);
            return found?.name || `ID: ${id}`;
        },
        []
    );

    // useEffect 1: Tải dữ liệu dropdown khi component mount
    useEffect(() => {
        fetchDropdownData();
    }, []);

    // useEffect 2: Tải dữ liệu tồn kho khi phân trang thay đổi
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]); // Thêm fetchData vào dependency array

    // Hàm tải dữ liệu dropdown (SP/Cửa hàng) và danh sách Product đầy đủ
    const fetchDropdownData = async () => {
        try {
            // Lấy cả 3 loại dữ liệu song song
            const [productRes, storeRes, allProductRes] = await Promise.all([
                listDropdownProducts(),
                listDropdownStores(),
                listAllProducts(),
                 getCategories()
            ]);

            setProducts(Array.isArray(productRes) ? productRes : []);
            setStores(Array.isArray(storeRes) ? storeRes : []);
            setAllProducts(Array.isArray(allProductRes) ? allProductRes : []); // Lưu Product đầy đủ
        } catch (error) {
            toast.error("Lỗi khi tải danh sách sản phẩm/cửa hàng.");
            setProducts([]);
            setStores([]);
            setAllProducts([]);
            setCategories([]);
        }
    };

    // Hàm tải dữ liệu tồn kho chính
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await listInventories({
                page: currentPage,
                size: pageSize,
                key: searchQuery || undefined, // Đảm bảo truyền undefined nếu rỗng
                store_id: selectedStoreId === 0 ? undefined : selectedStoreId,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });

            const inventoryList = res.data || [];
            setInventories(Array.isArray(inventoryList) ? inventoryList : []);
            setTotalItems(res.total || inventoryList.length);
            setCurrentPage(res.page || currentPage);
            setPageSize(res.size || pageSize);
        } catch (error) {
            toast.error("Không thể tải danh sách tồn kho.");
            setInventories([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, selectedStoreId, fromDate, toDate]);

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
        setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 });
        setErrors({});
    };

    // Mở form chỉnh sửa
    const handleEdit = (item: Inventory) => {
        setEditingId(item.id);
        setIsAdding(false); // Đảm bảo isAdding = false khi chỉnh sửa
        setForm({
            product_id: String(item.product_id), // Chắc chắn là string cho select
            store_id: String(item.store_id), // Chắc chắn là string cho select
            quantity_stock: item.quantity_stock || 0,
            quantity_sold: item.quantity_sold || 0,
        });
        setErrors({}); // Xóa lỗi cũ
    };

    // Xử lý xoá
    const handleDelete = async (id: number) => {
        toast(
            (t) => (
                <div className="text-center justify-center">
                    <p className="font-medium mb-2">Bạn có chắc muốn xoá tồn kho ID <b>{id}</b>?</p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    await deleteInventory(id);
                                    toast.success(`Đã xoá tồn kho ID ${id}!`);
                                    fetchData();
                                } catch {
                                    toast.error("Không thể xoá tồn kho!");
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md"
                        >
                            Xoá
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-1 rounded-md"
                        >
                            Huỷ
                        </button>
                    </div>
                </div>
            ),
            { duration: 5000, position: "top-center" }
        );
    };

    // Validate form
    const validate = (isCreating: boolean) => {
        const newErrors: { [key: string]: string } = {};

        // Chỉ kiểm tra product_id và store_id khi TẠO MỚI
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
} else if (isCreating && form.product_id && !Array.isArray(form.product_id)) {
    // Kiểm tra nếu chọn 1 sản phẩm cụ thể (tránh lỗi khi chọn nhiều)
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
    const handleSubmit = async () => {
        const isCreating = editingId === null; // Xác định đang là tạo mới hay cập nhật
        if (!validate(isCreating)) return;

        try {
            if (isCreating) {
                // Logic cho TẠO MỚI
                // Ép kiểu về string hoặc string[] cho API
                const productId = form.product_id;
                const storeId = form.store_id;

                const createDto: CreateInventoryDto = {
                    product_id: productId as string | string[], // API call sẽ xử lý string[] nếu người dùng chọn nhiều
                    store_id: storeId as string | string[], // API call sẽ xử lý string[]
                    quantity_stock: form.quantity_stock,
                };
                await createInventory(createDto);
                toast.success("Tạo tồn kho thành công!");
                await fetchDropdownData(); 
            } else {
                // Logic cho CẬP NHẬT
                const updateDto: UpdateInventoryDto = {
                    quantity_stock: form.quantity_stock,
                    quantity_sold: form.quantity_sold,
                };
                await updateInventory(editingId!, updateDto);
                toast.success(`Cập nhật tồn kho ID ${editingId} thành công!`);
                await fetchDropdownData(); // Thêm dòng này
            }

            handleCancelEdit();
            fetchData();
        } catch (error) {
            toast.error("Số lượng trong kho không đủ!");
        }
    };

    // Hàm mở form thêm mới
    const handleOpenAddForm = () => {
        setIsAdding(true);
        setEditingId(null);
        setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 }); // Reset form
        setErrors({}); // Xóa lỗi cũ
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-2">
            <Toaster position="top-center" />
            <div className="w-full mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-200">
                <h2 className="text-3xl font-extrabold text-center text-[#B95D26] mb-8 tracking-wide">
                    Quản lý Tồn kho trong cửa hàng
                </h2>

                {/* --- NÚT THÊM MỚI --- */}
                <div className="flex justify-end mb-6">
                    {editingId === null && !isAdding && (
                        <button
                            onClick={handleOpenAddForm}
                            className="px-6 py-2 rounded-lg font-semibold shadow-md transition bg-[#F54900] hover:bg-orange-600 text-white flex items-center gap-2"
                        >

                            + Thêm Tồn Kho Mới
                        </button>
                    )}
                </div>

                {/* --- FORM THÊM/SỬA (CHỈ HIỂN THỊ KHI editingId HOẶC isAdding TRUE) --- */}
                {(editingId !== null || isAdding) && (
                    <InventoryForm
                        form={form}
                        editingId={editingId}
                        isAdding={isAdding} // Truyền trạng thái thêm mới
                        errors={errors}
                         categories={categories}
                        products={products}
                        stores={stores}
                        allProducts={allProducts} // TRUYỀN DANH SÁCH PRODUCT ĐẦY ĐỦ
                        getDisplayName={getDisplayName}
                        handleValueChange={handleValueChange}
                        handleNumberChange={handleNumberChange}
                        handleSubmit={handleSubmit}
                        handleCancelEdit={handleCancelEdit}
                    />
                )}

                {/* --- BỘ LỌC & TÌM KIẾM --- */}
                <div className="mt-10 bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Bộ lọc danh sách tồn kho
                    </h3>

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
            </div>
        </div>
    );
}