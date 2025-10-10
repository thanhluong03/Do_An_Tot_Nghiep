// src/components/inventory/InventoryForm.tsx (Đã cập nhật hiển thị nút Hủy/Đóng trong mọi chế độ)

import React, { useMemo } from 'react';
import { SelectOption, Product } from "@/api/services/inventoryService"; // Import Product
import { InventoryFormState, FormName } from "@/app/admin/inventory/page";
// Đổi đường dẫn import CheckboxList cho đúng
// Giả định đường dẫn relative đúng là "./CheckboxList"
import CheckboxList from "./Checkboxlist"; 

interface InventoryFormProps {
    form: InventoryFormState;
    editingId: number | null;
    errors: { [key: string]: string };
    products: SelectOption[];
    stores: SelectOption[];
    allProducts: Product[]; // THÊM: Danh sách Product đầy đủ
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
    allProducts, // Sử dụng allProducts
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
        // Chỉ lấy tên nếu là chế độ Sửa (editingId !== null)
        if (editingId !== null && typeof id === 'string') {
            return getDisplayName(products, id); 
        }
        return '';
    }, [form.product_id, products, getDisplayName, editingId]);

    const storeDisplayName = useMemo(() => {
        const id = form.store_id;
        // Chỉ lấy tên nếu là chế độ Sửa (editingId !== null)
        if (editingId !== null && typeof id === 'string') {
             return getDisplayName(stores, id);
        }
        return '';
    }, [form.store_id, stores, getDisplayName, editingId]);


    return (
        <div className={`border p-6 rounded-lg mb-8 ${editingId ? 'border-yellow-300 bg-yellow-50' : 'border-blue-300 bg-blue-50'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${editingId ? 'text-yellow-700' : 'text-blue-700'}`}>
                {editingId ? `Sửa Tồn kho ID: ${editingId}` : "Thêm Tồn kho Linh hoạt (Tạo Hàng Loạt)"}
            </h3>

            {/* Sử dụng grid-cols-2 cơ bản */}
            <div className={`grid gap-4 mb-6 ${editingId === null ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}> 

                {/* Hiển thị Checkbox List chỉ trong chế độ THÊM MỚI */}
                {editingId === null ? (
                    <>
                        <CheckboxList
                            name="product_id"
                            label="Sản phẩm (Chọn 1, nhiều hoặc Tất cả)"
                            options={products}
                            selectedValues={form.product_id}
                            onChange={handleValueChange}
                            error={errors.product_id}
                            allProducts={allProducts} // TRUYỀN VÀO CHO CHẾ ĐỘ THÊM
                        />

                        <CheckboxList
                            name="store_id"
                            label="Cửa hàng (Chọn 1, nhiều hoặc Tất cả)"
                            options={stores}
                            selectedValues={form.store_id}
                            onChange={handleValueChange}
                            error={errors.store_id}
                            allProducts={allProducts} // Không cần ảnh cho cửa hàng, nhưng vẫn truyền props
                        />
                    </>
                ) : (
                    // Hiển thị thông tin Readonly trong chế độ SỬA
                    <>
                        {/* Product (Edit mode - Readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
                            <input title={productDisplayName} type="text" value={productDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
                        </div>
                        
                        {/* Store (Edit mode - Readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                            <input title={storeDisplayName} type="text" value={storeDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
                        </div>
                    </>
                )}

                {/* Quantity Stock (Hiển thị ở cả 2 mode) */}
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

                {/* Sold quantity (Chỉ hiển thị trong chế độ SỬA) */}
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

            {/* Button controls */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                {/* CẬP NHẬT: Luôn hiển thị nút HỦY/ĐÓNG */}
                <button
                    onClick={handleCancelEdit}
                    className="px-5 py-2 rounded-lg font-semibold shadow-md transition bg-gray-400 hover:bg-gray-500 text-white"
                >
                    {editingId ? "Hủy Sửa" : "Đóng Form"} 
                </button>
                
                {/* Nút chính Thêm mới / Cập nhật */}
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