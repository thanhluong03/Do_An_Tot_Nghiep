// src/components/inventory/InventoryForm.tsx

import React, { useMemo } from 'react';

import { SelectOption } from "@/api/services/inventoryService";
import { InventoryFormState, FormName } from "@/app/admin/inventory/page";
import CheckboxList from './Checkboxlist';

interface InventoryFormProps {
    form: InventoryFormState;
    editingId: number | null;
    errors: { [key: string]: string };
    products: SelectOption[];
    stores: SelectOption[];
    getDisplayName: (list: SelectOption[], id: number | undefined) => string;
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
    
    // Tách logic xử lý sự kiện change cho input số để giữ UI sạch hơn
    const onNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let numericValue = 0;
        if (value !== "" && value !== null && value !== undefined) {
            const parsed = Number(value);
            numericValue = isNaN(parsed) ? 0 : parsed;
        }
        handleNumberChange(name as FormName, numericValue);
    };

    // FIX LỖI: Kiểm tra an toàn trước khi gọi Number()
    const productDisplayName = useMemo(() => {
        const id = form.product_id;
        // Kiểm tra an toàn trước khi ép sang number
        return getDisplayName(products, id ? Number(id) : undefined);
    }, [form.product_id, products, getDisplayName]);

    const storeDisplayName = useMemo(() => {
        const id = form.store_id;
        // Kiểm tra an toàn trước khi ép sang number
        return getDisplayName(stores, id ? Number(id) : undefined);
    }, [form.store_id, stores, getDisplayName]);


    return (
        <div className={`border p-6 rounded-lg mb-8 ${editingId ? 'inventory-edit-mode' : 'inventory-create-mode'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${editingId ? 'inventory-edit-title' : 'inventory-create-title'}`}>
                {editingId ? `Sửa Tồn kho ID: ${editingId}` : "Thêm Tồn kho Linh hoạt (Tạo Hàng Loạt)"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                {/* Product ID (Create mode only) */}
                {editingId === null && (
                    <CheckboxList
                        name="product_id"
                        label="Sản phẩm (Chọn 1, nhiều hoặc Tất cả)"
                        options={products}
                        selectedValues={form.product_id}
                        onChange={handleValueChange}
                        error={errors.product_id}
                    />
                )}

                {/* Store ID (Create mode only) */}
                {editingId === null && (
                    <CheckboxList
                        name="store_id"
                        label="Cửa hàng (Chọn 1, nhiều hoặc Tất cả)"
                        options={stores}
                        selectedValues={form.store_id}
                        onChange={handleValueChange}
                        error={errors.store_id}
                    />
                )}

                {/* Product (Edit mode - Readonly) */}
                {editingId !== null && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
                        {/* Dùng giá trị đã được kiểm tra an toàn */}
                        <input title={productDisplayName} type="text" value={productDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
                    </div>
                )}
                {/* Store (Edit mode - Readonly) */}
                {editingId !== null && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                        {/* Dùng giá trị đã được kiểm tra an toàn */}
                        <input title={storeDisplayName} type="text" value={storeDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
                    </div>
                )}

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

            <div className="flex justify-end gap-3">
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