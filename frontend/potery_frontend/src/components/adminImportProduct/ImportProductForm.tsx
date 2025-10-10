// src/components/adminImportProduct/ImportProductForm.tsx

import React, { useMemo } from 'react';

import { SelectOption } from "@/api/services/importProductsService";
import { ImportProductFormState, FormName } from "@/app/admin/importproduct/page"; 
import CheckboxList from "./Checkboxlist"; 


interface ImportProductFormProps {
    form: ImportProductFormState;
    editingId: number | null;
    errors: { [key: string]: string };
    products: SelectOption[];
    suppliers: SelectOption[]; 
    allProducts: any[]; 
    getDisplayName: (list: SelectOption[], id: number | string | string[] | undefined) => string; 
    handleValueChange: (name: "product_id" | "supplier_id", value: string | string[] | undefined) => void; 
    handleNumberChange: (name: FormName, value: number) => void;
    handleSubmit: () => Promise<void>;
    handleCancelEdit: () => void;
    isAdding: boolean; 
}

// HÀM TRỢ GIÚP: Tìm URL ảnh (cần khớp với logic listDropdownProducts)
const getProductImageUrl = (products: any[], productId: number | string | string[] | undefined): string => {
    let id: number | null = null;
    if (typeof productId === 'number') id = productId;
    else if (typeof productId === 'string' && productId !== 'all') id = Number(productId);
    else if (Array.isArray(productId) && productId.length > 0) id = Number(productId[0]);

    if (!id || isNaN(id)) return "/no-image.jpg";
    
    const product = products.find(p => p.id === id);

    if (product && product.images && product.images.length > 0) {
        return product.images[0]?.url || ""; 
    }
    if (product && typeof product.main_image === 'string' && product.main_image.length > 0) {
        return product.main_image; 
    }
    return "/no-image.jpg"; 
};


const ImportProductForm: React.FC<ImportProductFormProps> = ({ 
    form,
    editingId,
    errors,
    products,
    suppliers, 
    allProducts, 
    getDisplayName,
    handleValueChange,
    handleNumberChange,
    handleSubmit,
    handleCancelEdit,
    isAdding 
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
        return getDisplayName(products, form.product_id);
    }, [form.product_id, products, getDisplayName]);

    const supplierDisplayName = useMemo(() => { 
        return getDisplayName(suppliers, form.supplier_id); 
    }, [form.supplier_id, suppliers, getDisplayName]); 
    
    const currentProductImageUrl = useMemo(() => {
        return getProductImageUrl(allProducts, form.product_id);
    }, [allProducts, form.product_id]);


    const title = editingId 
        ? `Sửa Phiếu Nhập kho ID: ${editingId}` 
        : "Thêm Phiếu Nhập kho (Tạo Hàng Loạt)";
    
    const borderColor = editingId ? 'border-yellow-400' : 'border-blue-400';
    const titleColor = editingId ? 'text-yellow-700' : 'text-blue-700';


    return (
        <div className={`border p-6 rounded-lg mb-8 ${borderColor}`}>
            <h3 className={`text-xl font-semibold mb-4 ${titleColor}`}>
                {title}
            </h3>

            <div className={`grid gap-4 mb-6 ${editingId === null ? 'md:grid-cols-4' : 'md:grid-cols-4'}`}>

                {/* Product ID (Create/Edit Switch) */}
                {editingId === null ? (
                    // --- CREATE MODE: Use CheckboxList (chiếm 2 cột) ---
                    <CheckboxList
                        name="product_id"
                        label="Sản phẩm (Chọn 1, nhiều hoặc Tất cả)"
                        options={products}
                        selectedValues={form.product_id}
                        onChange={handleValueChange}
                        error={errors.product_id}
                    />
                ) : (
                    // --- EDIT MODE: Use read-only info and image (chiếm 2 cột) ---
                    <div className="md:col-span-2 flex items-start gap-4 p-2 border rounded-lg bg-gray-50"> 
                        <div className="flex-shrink-0">
                            {/* <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh</label>
                            {/* <img 
                                src={currentProductImageUrl} 
                                alt="Product Image"
                                className="w-16 h-16 object-cover rounded shadow"
                                onError={(e) => { 
                                    e.currentTarget.onerror = null; 
                                    e.currentTarget.src = "/no-image.jpg"; 
                                }}
                            /> */} 
                        </div>
                        <div className="flex-grow">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm (Đã chọn)</label>
                             <input title={productDisplayName} type="text" value={productDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
                             <input type="hidden" name="product_id" value={String(form.product_id)} />
                        </div>
                    </div>
                )}

                {/* Supplier ID (Create/Edit Switch) */}
                {editingId === null ? (
                    // --- CREATE MODE: Use CheckboxList (chiếm 2 cột) ---
                    <CheckboxList
                        name="supplier_id" 
                        label="Nhà cung cấp (Chọn 1, nhiều hoặc Tất cả)" 
                        options={suppliers} 
                        selectedValues={form.supplier_id} 
                        onChange={handleValueChange}
                        error={errors.supplier_id} 
                    />
                ) : (
                    // --- EDIT MODE: Use read-only input (chỉ chiếm 1 cột) ---
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp (Đã chọn)</label> 
                        <input title={supplierDisplayName} type="text" value={supplierDisplayName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/> 
                        <input type="hidden" name="supplier_id" value={String(form.supplier_id)} />
                    </div>
                )}


                {/* Import quantity (Stock quantity) */}
                <div className={`
                    ${editingId === null ? 'md:col-start-1 md:col-span-2' : 'md:col-start-4 md:col-span-1'} 
                    ${editingId === null ? 'sm:col-span-2' : 'sm:col-span-1'}
                `}>
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
                {(editingId !== null || isAdding) && (
                       <button
                           onClick={handleCancelEdit}
                           className="px-5 py-2 rounded-lg font-semibold shadow-md transition bg-gray-400 hover:bg-gray-500 text-white"
                       >
                           Hủy
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