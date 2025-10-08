// src/components/inventory/InventoryForm.tsx

import React, { useMemo } from 'react';
// ... (imports remain the same)
import { SelectOption } from "@/api/services/inventoryService";
import { InventoryFormState, FormName } from "@/app/admin/inventory/page";
import CheckboxList from './Checkboxlist';

interface InventoryFormProps {
    form: InventoryFormState;
    editingId: number | null;
    errors: { [key: string]: string };
    products: SelectOption[];
    stores: SelectOption[];
    getDisplayName: (list: SelectOption[], id: number | string | undefined) => string; 
    handleValueChange: (name: "product_id" | "store_id", value: string | string[] | undefined) => void;
    handleNumberChange: (name: FormName, value: number) => void;
    handleSubmit: () => Promise<void>;
    handleCancelEdit: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
    form,
    editingId,
    errors,
    products,
    stores,
    getDisplayName,
    handleValueChange,
    handleNumberChange,
    handleSubmit,
    handleCancelEdit
}) => {
    
    const onNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let numericValue = 0;
        if (value !== "" && value !== null && value !== undefined) {
            const parsed = Number(value);
            numericValue = isNaN(parsed) ? 0 : parsed;
        }
        handleNumberChange(name as FormName, numericValue);
    };

    const productDisplayName = useMemo(() => {
        const id = form.product_id;
        return getDisplayName(products, id); 
    }, [form.product_id, products, getDisplayName]);

    const storeDisplayName = useMemo(() => {
        const id = form.store_id;
        return getDisplayName(stores, id);
    }, [form.store_id, stores, getDisplayName]);


    return (
        <div className={`border p-6 rounded-lg mb-8 ${editingId ? 'inventory-edit-mode' : 'inventory-create-mode'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${editingId ? 'inventory-edit-title' : 'inventory-create-title'}`}>
                {editingId ? `Sửa Tồn kho ID: ${editingId}` : "Thêm Tồn kho Linh hoạt (Tạo Hàng Loạt)"}
            </h3>

            {/* 🔥 FIX HERE: Use a two-column responsive grid and ensure items span correctly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"> 

                {/* ROW 1: Product & Store (Create Mode) */}
                {editingId === null && (
                    <>
                        {/* Product ID (Takes up one column) */}
                        <CheckboxList
                            name="product_id"
                            label="Sản phẩm (Chọn 1, nhiều hoặc Tất cả)"
                            options={products}
                            selectedValues={form.product_id}
                            onChange={handleValueChange}
                            error={errors.product_id}
                        />

                        {/* Store ID (Takes up the second column) */}
                        <CheckboxList
                            name="store_id"
                            label="Cửa hàng (Chọn 1, nhiều hoặc Tất cả)"
                            options={stores}
                            selectedValues={form.store_id}
                            onChange={handleValueChange}
                            error={errors.store_id}
                        />
                    </>
                )}

                {/* ROW 1: Product & Store (Edit Mode - Readonly) */}
                {editingId !== null && (
                    <>
                        {/* Product (Edit mode - Readonly, takes 1/2 row) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
                            <input title={productDisplayName} type="text" value={productDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
                        </div>
                        
                        {/* Store (Edit mode - Readonly, takes 1/2 row) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                            <input title={storeDisplayName} type="text" value={storeDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
                        </div>
                    </>
                )}

                {/* ROW 2: Stock & Sold Quantity (Use a nested grid for better control or just stack them) */}
                {/* Wrap the quantity fields in a single container spanning the first column (col-span-1) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {/* Stock quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SL Tồn kho</label>
                        <input
                            type="number"
                            name="quantity_stock"
                            placeholder="Nhập SL Tồn"
                            value={typeof form.quantity_stock === 'number' ? form.quantity_stock : 0}
                            onChange={onNumberInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.quantity_stock && <p className="text-red-500 text-xs mt-1">{errors.quantity_stock}</p>}
                    </div>

                    {/* Sold quantity (Edit mode only) */}
                    {editingId !== null && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SL Đã bán</label>
                            <input
                                type="number"
                                name="quantity_sold"
                                placeholder="Nhập SL Bán"
                                value={typeof form.quantity_sold === 'number' ? form.quantity_sold : 0}
                                onChange={onNumberInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.quantity_sold && <p className="text-red-500 text-xs mt-1">{errors.quantity_sold}</p>}
                        </div>
                    )}
                </div>
                
                {/* Add a placeholder or an empty div if needed to control alignment, 
                    but the button is moved outside the grid to the footer for better alignment control. */}
            </div>

            {/* Button controls are now moved outside the main form grid for a cleaner footer look */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                {editingId !== null && (
                     <button
                        onClick={handleCancelEdit}
                        className="px-5 py-2 rounded-lg font-semibold shadow-md transition bg-gray-400 hover:bg-gray-500 text-white"
                     >
                        Hủy Sửa
                     </button>
                )}
                <button
                    onClick={handleSubmit}
                    className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${
                        editingId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                >
                    {editingId ? "Cập nhật" : "Thêm mới"}
                </button>
            </div>
        </div>
    );
};

export default InventoryForm;