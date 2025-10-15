// src/components/inventory/InventoryForm.tsx (MÀU CHỦ ĐẠO LÀ MÀU CAM)

import React, { useMemo } from 'react';
import { SelectOption, Product } from "@/api/services/inventoryService";
import { InventoryFormState, FormName } from "@/app/admin/inventory/page";
import CheckboxList from "./Checkboxlist"; 
import { Package, Store, Box, MinusCircle, CheckCircle, XCircle, Zap } from 'lucide-react';
import { getCategories, Category } from "@/api/services/categoryService";


interface InventoryFormProps {
    form: InventoryFormState;
    editingId: number | null;
    errors: { [key: string]: string };
    products: SelectOption[];
    stores: SelectOption[];
    allProducts: Product[]; 
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
    allProducts,
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
            const cleanValue = value.replace(/[^0-9]/g, ''); 
            const parsed = Number(cleanValue);
            numericValue = isNaN(parsed) ? 0 : parsed;
        }
        handleNumberChange(name as FormName, numericValue);
    };

    const productDisplayName = useMemo(() => {
        const id = typeof form.product_id === 'string' ? form.product_id : undefined;
        return editingId && id ? getDisplayName(products, id) : '';
    }, [form.product_id, products, getDisplayName, editingId]);

    const storeDisplayName = useMemo(() => {
        const id = typeof form.store_id === 'string' ? form.store_id : undefined;
        return editingId && id ? getDisplayName(stores, id) : '';
    }, [form.store_id, stores, getDisplayName, editingId]);

    const editingProduct = useMemo(() => {
        const id = typeof form.product_id === 'string' ? Number(form.product_id) : null;
        return allProducts.find(p => p.id === id);
    }, [form.product_id, allProducts]);
    const [categories, setCategories] = React.useState<Category[]>([]);

    React.useEffect(() => {
    const fetchCategories = async () => {
        try {
        const data = await getCategories();
        setCategories(data);
        } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        }
    };
    fetchCategories();
    }, []);

    // Đổi màu sắc: Primary (Thêm mới) là Orange, Accent (Sửa) là Red-Orange/Red
    const PRIMARY_COLOR_CLASS = 'orange'; // Dùng orange-600
    const ACCENT_COLOR_CLASS = 'red'; // Dùng red-600

    const colorClass = editingId ? ACCENT_COLOR_CLASS : PRIMARY_COLOR_CLASS;
    
    // Class CSS cho container dựa trên chế độ
    const modeClass = editingId 
        ? 'border-red-200 shadow-2xl transition duration-500 hover:shadow-red-500/20' // Màu đỏ cam cho Sửa
        : 'border-orange-200 shadow-2xl transition duration-500 hover:shadow-orange-500/20'; // Màu cam cho Thêm mới

    // Class CSS cho tiêu đề và các thành phần nhấn
    const accentColor = editingId ? 'text-red-700' : 'text-orange-700';

    // Class CSS cho nút chính
    const btnPrimaryClass = editingId 
        ? "bg-red-600 hover:bg-red-700" 
        : "bg-orange-600 hover:bg-orange-700";
    
    // Class CSS cho Icon
    const iconColor = editingId ? 'text-red-500' : 'text-orange-500';

    return (
        <div className={`p-10 rounded-2xl bg-white border ${modeClass}`}>
            
            <h3 className={`text-3xl font-extrabold mb-8 flex items-center gap-4 ${accentColor} border-b-4 border-gray-100 pb-4`}>
                <Zap size={30} className={iconColor}/> 
                {editingId ? `SỬA TỒN KHO ID: ${editingId}` : "QUẢN LÝ TỒN KHO LINH HOẠT"}
            </h3>

            {/* Điều chỉnh Grid chính */}
            <div className={`grid gap-8 ${editingId === null ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}> 

                {/* --- KHỐI THÊM MỚI (Card Sản phẩm & Cửa hàng) --- */}
                {editingId === null ? (
                    <>
                        {/* 1. Card Chọn Sản phẩm (Cột 1) */}
                        <div className='col-span-1 p-0 border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden'>
                            <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                                <Package size={18} className="text-orange-500"/>
                                1. CHỌN SẢN PHẨM
                            </h4>
                            <div className="p-4">
                                {/* Component CheckboxList (Được bọc trong Card) */}
                                <CheckboxList
                                    name="product_id"
                                    label="Sản phẩm"
                                    options={products}
                                    selectedValues={form.product_id}
                                    onChange={handleValueChange}
                                    error={errors.product_id}
                                    allProducts={allProducts}
                                    categories={categories} 
                                    
                                />
                            </div>
                        </div>

                        {/* 2. Card Chọn Cửa hàng (Cột 2) */}
                        <div className='col-span-1 p-0 border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden'>
                            <h4 className="flex items-center gap-2 p-4 bg-gray-50 text-base font-bold text-gray-700 border-b border-gray-200">
                                <Store size={18} className="text-orange-500"/>
                                2. CHỌN CỬA HÀNG
                            </h4>
                            <div className="p-4">
                                {/* Component CheckboxList (Được bọc trong Card) */}
                                <CheckboxList
                                    name="store_id"
                                    label="Cửa hàng"
                                    options={stores}
                                    selectedValues={form.store_id}
                                    onChange={handleValueChange}
                                    error={errors.store_id}
                                    allProducts={[]} 
                                    
                                />
                            </div>
                        </div>
                        
                        {/* 3. SL Tồn kho (Cột 1, Hàng 2) */}
                        <div className="col-span-1 pt-4"> 
                            <label className="block text-sm font-extrabold text-gray-800 mb-2 flex items-center gap-2">
                                <Box size={18} className="text-orange-500"/> SỐ LƯỢNG TỒN KHO *
                            </label>
                            <input
                                type="number"
                                name="quantity_stock"
                                placeholder="Nhập Số lượng Tồn kho"
                                value={typeof form.quantity_stock === 'number' ? form.quantity_stock : ''}
                                onChange={onNumberInputChange}
                                className={`w-full border ${errors.quantity_stock ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-orange-500 outline-none transition duration-150 shadow-sm`}
                            />
                            {errors.quantity_stock && <p className="text-red-500 text-xs mt-1 font-medium">{errors.quantity_stock}</p>}
                        </div>
                        
                        {/* 4. Vị trí trống (Cột 2, Hàng 2) */}
                        <div className="col-span-1 pt-4">
                            {/* Giữ trống cho cân đối. */}
                        </div>
                    </>
                ) : (
                    // --- KHỐI SỬA (3 cột) ---
                    <>
                        {/* 1. Sản phẩm (Readonly) */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-md flex flex-col justify-center">
                            <label className="text-xs uppercase font-bold text-gray-500 mb-2 flex items-center gap-2">
                                <Package size={14} className="text-gray-400"/> Sản phẩm
                            </label>
                            <div className="flex items-center gap-4">
                                {editingProduct?.image_url && (
                                    <img 
                                        src={editingProduct.image_url} 
                                        alt={productDisplayName} 
                                        className="w-10 h-10 object-cover rounded-lg shadow-inner border border-gray-300"
                                    />
                                )}
                                <span title={productDisplayName} className="font-extrabold text-lg text-gray-900 truncate">
                                    {productDisplayName}
                                </span>
                            </div>
                        </div>
                        
                        {/* 2. Cửa hàng (Readonly) */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-md flex flex-col justify-center">
                            <label className="text-xs uppercase font-bold text-gray-500 mb-2 flex items-center gap-2">
                                <Store size={14} className="text-gray-400"/> Cửa hàng
                            </label>
                            <p title={storeDisplayName} className="font-extrabold text-lg text-gray-900 truncate pt-2">
                                {storeDisplayName}
                            </p>
                        </div>
                        
                        {/* 3. SL Tồn kho */}
                        <div> 
                            <label className="block text-sm font-extrabold text-gray-800 mb-2 flex items-center gap-2">
                                <Box size={18} className="text-red-500"/> SL TỒN KHO *
                            </label>
                            <input
                                type="number"
                                name="quantity_stock"
                                placeholder="Nhập Số lượng Tồn kho"
                                value={typeof form.quantity_stock === 'number' ? form.quantity_stock : ''}
                                onChange={onNumberInputChange}
                                className={`w-full border ${errors.quantity_stock ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-red-500 outline-none transition duration-150 shadow-sm`}
                            />
                            {errors.quantity_stock && <p className="text-red-500 text-xs mt-1 font-medium">{errors.quantity_stock}</p>}
                        </div>

                        {/* 4. SL Đã bán */}
                        <div className="col-span-1">
                            <label className="block text-sm font-extrabold text-gray-800 mb-2 flex items-center gap-2">
                                <MinusCircle size={18} className="text-red-500"/> SL ĐÃ BÁN *
                            </label>
                            <input
                                type="number"
                                name="quantity_sold"
                                placeholder="Nhập Số lượng Đã bán"
                                value={typeof form.quantity_sold === 'number' ? form.quantity_sold : ''}
                                onChange={onNumberInputChange}
                                className={`w-full border ${errors.quantity_sold ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-red-500 outline-none transition duration-150 shadow-sm`}
                            />
                            {errors.quantity_sold && <p className="text-red-500 text-xs mt-1 font-medium">{errors.quantity_sold}</p>}
                        </div>
                    </>
                )}
            </div>

            {/* --- Button controls --- */}
            <div className="flex justify-end gap-3 pt-8 border-t mt-8 border-gray-100">
                
                <button
                    onClick={handleCancelEdit}
                    className="px-8 py-3 rounded-xl font-bold shadow-lg transition duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-2 transform hover:scale-[1.02]"
                >
                     {editingId ? "HỦY BỎ" : "ĐÓNG FORM"} 
                </button>
                
                <button
                    onClick={handleSubmit}
                    className={`px-8 py-3 rounded-xl font-extrabold shadow-xl transition duration-200 text-white flex items-center gap-2 transform hover:scale-[1.02] ${btnPrimaryClass}`}
                >
                    
                    {editingId ? "CẬP NHẬT TỒN KHO" : "THÊM MỚI TỒN KHO"}
                </button>
            </div>
        </div>
    );
};

export default InventoryForm;