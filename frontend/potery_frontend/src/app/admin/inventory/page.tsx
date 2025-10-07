
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

    const [form, setForm] = useState<InventoryFormState>({
        product_id: undefined,
        store_id: undefined,
        quantity_stock: 0,
        quantity_sold: 0,
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Hàm dùng chung để lấy tên hiển thị
    const getDisplayName = useCallback((list: SelectOption[], id: number | undefined): string => {
        if (id === undefined || id === null || isNaN(id)) return ""; // Xử lý giá trị an toàn
        const found = list.find(item => Number(item.id) === Number(id));
        return found?.name || `ID: ${id}`;
    }, []);

    // Load Data
    useEffect(() => {
        fetchData();
        fetchDropdownData();
    }, [currentPage, pageSize, getDisplayName]);

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

    const fetchData = async () => {
        try {
            const res = await listInventories({
                page: currentPage,
                size: pageSize
            });

            const inventoryList = res.data || res.items || [];
            setInventories(Array.isArray(inventoryList) ? inventoryList : []);
            setTotalItems(res.total || inventoryList.length);
            setCurrentPage(res.page || currentPage);
            setPageSize(res.size || pageSize);

        } catch (error) {
            console.error("Lỗi tải tồn kho:", error);
            setInventories([]);
            setTotalItems(0);
        }
    };

    // Handler cho input số (quantity_stock, quantity_sold)
    const handleNumberChange = (name: FormName, value: number) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // Handler cho CheckboxList (product_id, store_id)
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


    const checkForDuplicate = (productId: number, storeId: number): boolean => {
        if (!Array.isArray(inventories)) return false;
        return inventories.some(
            item =>
                (item.id !== editingId) &&
                (Number(item.product_id) === productId) &&
                (Number(item.store_id) === storeId)
        );
    };

    const validate = (isCreating: boolean) => {
        const newErrors: { [key: string]: string } = {};

        if (isCreating) {
            if (form.product_id === undefined) {
                newErrors.product_id = "Vui lòng chọn ít nhất 1 Sản phẩm.";
            }
            if (form.store_id === undefined) {
                newErrors.store_id = "Vui lòng chọn ít nhất 1 Cửa hàng.";
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
                const productIds: number[] = form.product_id === 'all'
                    ? products.map(p => Number(p.id))
                    : (Array.isArray(form.product_id)
                        ? form.product_id.map(id => Number(id))
                        : [Number(form.product_id!)]);

                const storeIds: number[] = form.store_id === 'all'
                    ? stores.map(s => Number(s.id))
                    : (Array.isArray(form.store_id)
                        ? form.store_id.map(id => Number(id))
                        : [Number(form.store_id!)]);

                const createDtos: CreateInventoryDto[] = [];
                let hasDuplicate = false;

                for (const pId of productIds) {
                    for (const sId of storeIds) {
                        if (checkForDuplicate(pId, sId)) {
                            alert(`Lỗi: Tồn kho cho Sản phẩm: ${getDisplayName(products, pId)} và Cửa hàng: ${getDisplayName(stores, sId)} đã tồn tại!`);
                            hasDuplicate = true;
                            break;
                        }

                        createDtos.push({
                            product_id: pId,
                            store_id: sId,
                            quantity_stock: form.quantity_stock,
                        });
                    }
                    if (hasDuplicate) return;
                }

                if (createDtos.length > 0) {
                    for (const dto of createDtos) {
                        await createInventory(dto);
                    }
                    alert(`Thêm mới thành công ${createDtos.length} mục tồn kho!`);
                } else {
                    alert("Không có mục tồn kho nào được tạo.");
                }

            } else {
                // UPDATE
                const updateDto: UpdateInventoryDto = {
                    quantity_stock: form.quantity_stock,
                    quantity_sold: form.quantity_sold,
                };

                await updateInventory(editingId!, updateDto);
                alert(`Cập nhật tồn kho ID ${editingId} thành công!`);
            }

            // Reset form
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
            setCurrentPage(page);
            handleCancelEdit();
        }, []);

   
        const handlePageSizeChange = useCallback((size: number) => {
            setPageSize(size);
            setCurrentPage(1); 
    
            handleCancelEdit();
        }, []);
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Tồn kho
                </h2>

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

                <InventoryTable
                    inventories={inventories}
                    products={products}
                    stores={stores}
                    getDisplayName={getDisplayName}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    totalItems={totalItems}
                />
                 <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
            </div>
        </div>
    );
}