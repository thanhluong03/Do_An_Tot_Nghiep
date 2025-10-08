// src/app/admin/inventory/page.tsx
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    listInventories,
    createInventory,
    updateInventory,
    deleteInventory,
    listDropdownProducts,
    listDropdownStores,
    Inventory,
    CreateInventoryDto,
    UpdateInventoryDto,
    SelectOption,
} from "@/api/services/inventoryService";

import InventoryForm from "@/components/inventory/InventoryForm";
import InventoryTable from "@/components/inventory/InventoryTable";
import Pagination from "@/components/inventory/Pagination"; 

export interface InventoryFormState {
    product_id: string | string[] | undefined;
    store_id: string | string[] | undefined;
    quantity_stock: number;
    quantity_sold: number;
}
export type FormName = "product_id" | "store_id" | "quantity_stock" | "quantity_sold";
export default function InventoryPage() {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [products, setProducts] = useState<SelectOption[]>([]);
    const [stores, setStores] = useState<SelectOption[]>([]);
    const [totalItems, setTotalItems] = useState(0); 
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false); 

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedStoreId, setSelectedStoreId] = useState<number>(0); 

    const [form, setForm] = useState<InventoryFormState>({
        product_id: undefined,
        store_id: undefined,
        quantity_stock: 0,
        quantity_sold: 0,
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

    useEffect(() => {
        fetchDropdownData();
    }, []); 

    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize]); 

    const fetchDropdownData = async () => {
        try {
            const [productRes, storeRes] = await Promise.all([
                listDropdownProducts(),
                listDropdownStores(),
            ]);
            setProducts(Array.isArray(productRes) ? productRes : []);
            setStores(Array.isArray(storeRes) ? storeRes : []);
        } catch (error) {
            console.error("Lỗi tải dropdown data:", error);
            setProducts([]);
            setStores([]);
        }
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true); 
            
            const res = await listInventories({
                page: currentPage,
                size: pageSize,
                key: searchQuery, 
                store_id: selectedStoreId === 0 ? undefined : selectedStoreId, 
            });

            const inventoryList = res.data || [];
            setInventories(Array.isArray(inventoryList) ? inventoryList : []);
            setTotalItems(res.total || inventoryList.length); 
            setCurrentPage(res.page || currentPage);
            setPageSize(res.size || pageSize);

        } catch (error) {
            console.error("Lỗi tải tồn kho:", error);
            setInventories([]);
            setTotalItems(0);
        } finally {
            setLoading(false); 
        }
    }, [currentPage, pageSize, searchQuery, selectedStoreId]); 
    
    
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchData();
        }
    }, [selectedStoreId, searchQuery]);


    const handleNumberChange = (name: FormName, value: number) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleValueChange = (name: "product_id" | "store_id", value: string | string[] | undefined) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };
    
    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 });
        setErrors({});
    }

    const handleEdit = (item: Inventory) => {
        setEditingId(item.id);
        setForm({
            product_id: String(item.product_id), 
            store_id: String(item.store_id),
            quantity_stock: item.quantity_stock || 0,
            quantity_sold: item.quantity_sold || 0,
        });
        setErrors({});
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xoá tồn kho ID ${id} không?`)) return;
        try {
            await deleteInventory(id);
            alert(`Xoá tồn kho ID ${id} thành công.`);
            fetchData();
        } catch (error) {
            console.error("Lỗi xoá tồn kho:", error);
            alert("Lỗi xảy ra khi xoá tồn kho.");
        }
    };

    const validate = (isCreating: boolean) => {
        const newErrors: { [key: string]: string } = {};

        if (isCreating) {
            if (!form.product_id) { 
                newErrors.product_id = "Vui lòng chọn ít nhất 1 Sản phẩm hoặc Tất cả.";
            }
            if (!form.store_id) { 
                newErrors.store_id = "Vui lòng chọn ít nhất 1 Cửa hàng hoặc Tất cả.";
            }
        }

        if (form.quantity_stock < 0) {
            newErrors.quantity_stock = "SL Tồn kho phải là số không âm.";
        }

        if (editingId !== null && form.quantity_sold < 0) {
            newErrors.quantity_sold = "SL Đã bán phải là số không âm.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        const isCreating = editingId === null;
        if (!validate(isCreating)) return;

        try {
            if (isCreating) {
                
                const createDto: CreateInventoryDto = {
                    product_id: form.product_id || 'all', 
                    store_id: form.store_id || 'all',
                    quantity_stock: form.quantity_stock,
                };
                
                await createInventory(createDto as CreateInventoryDto);

                alert(`Yêu cầu tạo tồn kho đã được gửi. Backend sẽ xử lý tạo các cặp sản phẩm/cửa hàng!`);

            } else {
                const updateDto: UpdateInventoryDto = {
                    quantity_stock: form.quantity_stock,
                    quantity_sold: form.quantity_sold,
                };

                await updateInventory(editingId!, updateDto);
                alert(`Cập nhật tồn kho ID ${editingId} thành công!`);
            }

            handleCancelEdit();
            fetchData();
        } catch (error: unknown) {
            console.error("Lỗi API:", error);
            let message = "Lỗi không xác định";
            if (error instanceof Error) {
                message = error.message;
            }
            alert("Lỗi xảy ra khi xử lý: " + message);
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
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleStoreFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStoreId(Number(e.target.value));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Tồn kho
                </h2>

                {/* KHU VỰC THÊM / SỬA FORM */}
                <InventoryForm
                    form={form}
                    editingId={editingId}
                    errors={errors}
                    products={products}
                    stores={stores}
                    getDisplayName={getDisplayName}
                    handleValueChange={handleValueChange}
                    handleNumberChange={handleNumberChange}
                    handleSubmit={handleSubmit}
                    handleCancelEdit={handleCancelEdit}
                />

                {/* KHU VỰC LỌC VÀ TÌM KIẾM */}
                <div className="flex flex-wrap justify-between items-center mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 w-full">Bộ lọc và Tìm kiếm</h3>

                    {/* Lọc theo Cửa hàng */}
                    <div className="w-full md:w-1/3 min-w-[200px] mb-3 md:mb-0">
                        <label htmlFor="store-filter" className="block text-sm font-medium text-gray-700">
                            Lọc theo Cửa hàng:
                        </label>
                        <select
                            id="store-filter"
                            value={selectedStoreId}
                            onChange={handleStoreFilterChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none"
                        >
                            <option value={0}>-- Tất cả Cửa hàng --</option>
                            {stores.map(store => (
                                <option key={store.id} value={store.id}>{store.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ô Tìm kiếm */}
                    <div className="w-full md:w-1/3 min-w-[200px] mb-3 md:mb-0">
                        <label htmlFor="search-query" className="block text-sm font-medium text-gray-700">
                            Tìm kiếm (Tên SP/Cửa hàng):
                        </label>
                        <input
                            type="text"
                            id="search-query"
                            placeholder="Nhập tên SP hoặc Cửa hàng..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="w-full md:w-1/4 min-w-[200px] text-sm text-gray-600">
                        <p>Tổng số mục: <span className="font-bold">{totalItems}</span></p>
                        <p>Đang hiển thị: <span className="font-bold">{inventories.length}</span></p>
                    </div>
                </div>

                {/* KHU VỰC BẢNG DỮ LIỆU */}
                {loading ? (
                    <div className="text-center py-10 text-lg text-gray-500">
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <InventoryTable
                        inventories={inventories} 
                        products={products}
                        stores={stores}
                        getDisplayName={getDisplayName}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        totalItems={totalItems} 
                    />
                )}

                {/* KHU VỰC PHÂN TRANG */}
                <Pagination
                    totalItems={totalItems} 
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    );
}