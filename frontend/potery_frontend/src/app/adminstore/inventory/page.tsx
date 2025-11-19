"use client";

import React, { useEffect, useState, useCallback } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import toast, { Toaster } from "react-hot-toast";

import {
    listInventories,
    deleteInventory,
    listDropdownProducts,
    listDropdownStores,
    listAllProducts,
    Inventory,
    SelectOption,
    Product,
} from "@/api/services/inventoryService";

import InventoryTable from "@/components/adminStore/InventoryTable";
import Pagination from "@/components/inventory/Pagination";
import { getStoreById } from "@/api/services/storeService";
import { getUserDetail } from "@/api/services/userService";

export default function InventoryPage() {
    const [storeId, setStoreId] = useState<number | null>(null);
    const [storeName, setStoreName] = useState("...");
    const [isLoadingStore, setIsLoadingStore] = useState(true);

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
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    useEffect(() => {
        const initStore = async () => {
            try {
                const adminId = Number(localStorage.getItem("adminID"));
                if (!adminId) throw new Error("Không tìm thấy adminID trong localStorage");

                const user = await getUserDetail(adminId);
                const currentStoreId = user.store_id ?? 2;

                if (!user.store_id) {
                    toast.error("User không có store — dùng mặc định ID = 2");
                }

                setStoreId(currentStoreId);

                try {
                    const store = await getStoreById(currentStoreId);
                    setStoreName(store.store_name);
                } catch {
                    setStoreName(`Cửa hàng ID ${currentStoreId} (Không tải được tên)`);
                }
            } catch (err: any) {
                toast.error(err.message || "Lỗi khi lấy thông tin cửa hàng");
            } finally {
                setIsLoadingStore(false);
            }
        };

        initStore();
    }, []);
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [productRes, storeRes, allProductRes] = await Promise.all([
                    listDropdownProducts(),
                    listDropdownStores(),
                    listAllProducts(),
                ]);

                setProducts(productRes ?? []);
                setStores(storeRes ?? []);
                setAllProducts(allProductRes ?? []);
            } catch {
                toast.error("Lỗi khi tải dropdown dữ liệu");
            }
        };

        fetchDropdownData();
    }, []);

    const getDisplayName = useCallback(
        (list: SelectOption[], id: number | string | undefined): string => {
            if (!id) return "";
            if (id === "all") return "Tất cả";
            const found = list.find((item) => Number(item.id) === Number(id));
            return found?.name || "";
        },
        []
    );

    const fetchData = useCallback(async () => {
        if (!storeId) return;

        try {
            setLoading(true);

            const res = await listInventories({
                page: currentPage,
                size: pageSize,
                key: searchQuery || undefined,
                store_id: storeId,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });

            setInventories(res.data ?? []);
            setTotalItems(res.total ?? 0);
        } catch {
            toast.error("Không thể tải danh sách tồn kho.");
            setInventories([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, fromDate, toDate, storeId]);

    // Load lần đầu khi có storeId
    useEffect(() => {
        if (storeId) fetchData();
    }, [fetchData, storeId]);

    // Reset về trang 1 khi filter
    useEffect(() => {
        setCurrentPage(1);
        fetchData();
    }, [searchQuery, fromDate, toDate]);

    const handleDelete = (id: number) => {
        setItemToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const performDelete = async () => {
        if (!itemToDeleteId) return;

        try {
            await deleteInventory(itemToDeleteId);
            toast.success(`Đã xoá tồn kho ID ${itemToDeleteId}`);
            fetchData();
        } catch {
            toast.error("Không thể xoá tồn kho!");
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDeleteId(null);
        }
    };

    return (
        <div className="min-h-screen">
            <Toaster position="top-center" />

            <div className="w-full mx-auto bg-white/90 rounded-2xl shadow-xl p-8 border border-gray-200">
                <h2 className="text-3xl font-extrabold text-center text-[#B95D26] mb-8">
                    Tồn kho cửa hàng: {isLoadingStore ? "..." : `${storeName}`}
                </h2>

                {/* --- BỘ LỌC --- */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
                            <input
                                type="text"
                                value={searchQuery}
                                placeholder="Nhập từ khóa..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Từ ngày</label>
                            <input
                                title="dateStart"
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Đến ngày</label>
                            <input
                                title="dateEnd"
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                {/* --- TABLE --- */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Đang tải...</div>
                ) : (
                    <InventoryTable
                        inventories={inventories}
                        products={products}
                        stores={stores}
                        allProducts={allProducts}
                        getDisplayName={getDisplayName}
                        handleDelete={handleDelete}
                        totalItems={totalItems}
                    />
                )}

                {/* --- PAGINATION --- */}
                <Pagination
                    totalItems={totalItems}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={(p) => setCurrentPage(p)}
                    onPageSizeChange={(s) => {
                        setPageSize(s);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {isDeleteDialogOpen && (
                <ConfirmDialog
                    message={`Bạn có chắc muốn xóa tồn kho ID: ${itemToDeleteId}?`}
                    onConfirm={performDelete}
                    onCancel={() => setIsDeleteDialogOpen(false)}
                    title="Xác nhận Xóa"
                    confirmText="Xóa"
                    cancelText="Hủy"
                />
            )}
        </div>
    );
}
