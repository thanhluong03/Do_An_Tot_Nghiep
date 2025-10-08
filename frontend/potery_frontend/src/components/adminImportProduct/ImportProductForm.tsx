// src/components/adminImportProduct/ImportProductForm.tsx

import React, { useMemo } from 'react';

import { SelectOption } from "@/api/services/importProductsService";
import { ImportProductFormState, FormName } from "@/app/admin/importproduct/page"; 
import CheckboxList from '../inventory/Checkboxlist'; // Đã thay đổi path CheckboxList nếu cần thiết

interface ImportProductFormProps {
    form: ImportProductFormState;
    editingId: number | null;
    errors: { [key: string]: string };
    products: SelectOption[];
    suppliers: SelectOption[]; 
    getDisplayName: (list: SelectOption[], id: number | undefined) => string;
    handleValueChange: (name: "product_id" | "supplier_id", value: string | string[] | undefined) => void; 
    handleNumberChange: (name: FormName, value: number) => void;
    handleSubmit: () => Promise<void>;
    handleCancelEdit: () => void;
}

const ImportProductForm: React.FC<ImportProductFormProps> = ({ 
    form,
    editingId,
    errors,
    products,
    suppliers, 
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
        return getDisplayName(products, id ? Number(id) : undefined);
    }, [form.product_id, products, getDisplayName]);

    const supplierDisplayName = useMemo(() => { 
        const id = form.supplier_id; 
        return getDisplayName(suppliers, id ? Number(id) : undefined); 
    }, [form.supplier_id, suppliers, getDisplayName]); 


    return (
        <div className={`border p-6 rounded-lg mb-8 ${editingId ? 'border-yellow-400' : 'border-blue-400'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${editingId ? 'text-yellow-700' : 'text-blue-700'}`}>
                {editingId ? `Sửa Phiếu Nhập kho ID: ${editingId}` : "Thêm Phiếu Nhập kho (Tạo Hàng Loạt)"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                {/* Product ID (Create mode only) */}
                {editingId === null ? (
                    <CheckboxList
                        name="product_id"
                        label="Sản phẩm (Chọn 1, nhiều hoặc Tất cả)"
                        options={products}
                        selectedValues={form.product_id}
                        onChange={handleValueChange as any}
                        error={errors.product_id}
                    />
                ) : (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm (Đã chọn)</label>
                        <input title={productDisplayName} type="text" value={productDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
                    </div>
                )}

                {/* Supplier ID (Create mode only) */}
                {editingId === null ? (
                    <CheckboxList
                        name="supplier_id" 
                        label="Nhà cung cấp (Chọn 1, nhiều hoặc Tất cả)" 
                        options={suppliers} 
                        selectedValues={form.supplier_id} 
                        onChange={handleValueChange as any}
                        error={errors.supplier_id} 
                    />
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp (Đã chọn)</label> 
                        <input title={supplierDisplayName} type="text" value={supplierDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/> 
                    </div>
                )}


                {/* Import quantity (Stock quantity) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SL Nhập kho</label> 
                    <input
                        type="number"
                        name="import_quantity" 
                        placeholder="Nhập SL"
                        min="1"
                        value={typeof form.import_quantity === 'number' ? form.import_quantity : 0} 
                        onChange={onNumberInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.import_quantity && <p className="text-red-500 text-xs mt-1">{errors.import_quantity}</p>} 
                </div>

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

export default ImportProductForm;