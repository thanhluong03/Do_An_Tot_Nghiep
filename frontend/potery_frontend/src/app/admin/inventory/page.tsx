"use client";
import React, { useEffect, useState } from "react";
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
} from "@/api/services/inventoryService"; // Giả định đường dẫn này là đúng

// --- TYPE DEFINITIONS ---
interface InventoryFormState {
    product_id: string | string[] | undefined; 
    store_id: string | string[] | undefined;
    quantity_stock: number;
    quantity_sold: number;
}

// -----------------------------------------------------
// Component CheckboxList (FIXED)
// -----------------------------------------------------
interface CheckboxListProps {
    name: "product_id" | "store_id";
    label: string;
    options: SelectOption[];
    selectedValues: string | string[] | undefined;
    onChange: (name: "product_id" | "store_id", value: string | string[] | undefined) => void; 
    error: string | undefined;
}

const CheckboxList: React.FC<CheckboxListProps> = ({ name, label, options, selectedValues, onChange, error }) => {
    
    // Ensure selected IDs are properly handled
    const selectedIds: string[] = React.useMemo(() => {
        if (Array.isArray(selectedValues)) {
            return selectedValues.filter(val => val !== 'all');
        }
        if (typeof selectedValues === 'string' && selectedValues !== 'all') {
            return [selectedValues];
        }
        return [];
    }, [selectedValues]);
    
    const isAllSelected = selectedValues === 'all';

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        
        let newValue: string | string[] | undefined;

        if (value === 'all') {
            newValue = checked ? 'all' : undefined;
        } else {
            let newSelectedIds = [...selectedIds];

            if (checked) {
                if (!newSelectedIds.includes(value)) {
                    newSelectedIds.push(value);
                }
            } else {
                newSelectedIds = newSelectedIds.filter(id => id !== value);
            }
            
            newValue = newSelectedIds.length > 0 ? newSelectedIds : undefined;
        }

        onChange(name, newValue);
    };

    return (
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className={`p-2 border rounded-lg bg-white overflow-y-auto ${error ? 'border-red-500' : 'border-gray-300'}`} style={{ maxHeight: '180px' }}>
                
                {/* Select All Option */}
                <div className="flex items-center mb-1 pb-1 border-b border-dashed">
                    <input
                        type="checkbox"
                        
                        id={`${name}-all`}
                        name={name}
                        value="all"
                        checked={isAllSelected}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`${name}-all`} className="ml-2 text-sm font-bold text-blue-600 cursor-pointer">
                        --- TẤT CẢ {name === 'product_id' ? 'SẢN PHẨM' : 'CỬA HÀNG'} ---
                    </label>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                    {options.map((opt) => (
                        <div key={opt.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`${name}-${opt.id}`}
                                name={name}
                                value={String(opt.id)}
                                disabled={isAllSelected} 
                                checked={isAllSelected || selectedIds.includes(String(opt.id))}
                                
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-200"
                            />
                            <label htmlFor={`${name}-${opt.id}`} className={`ml-2 text-sm text-gray-700 ${isAllSelected ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}>
                                {opt.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

// -----------------------------------------------------
// InventoryPage Component (Chỉnh sửa fetch data)
// -----------------------------------------------------
export default function InventoryPage() {
    const [inventories, setInventories] = useState<Inventory[]>([]); 
    const [products, setProducts] = useState<SelectOption[]>([]); 
    const [stores, setStores] = useState<SelectOption[]>([]); 
    
    const [form, setForm] = useState<InventoryFormState>({
        product_id: undefined,
        store_id: undefined,
        quantity_stock: 0,
        quantity_sold: 0, 
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchData();
        fetchDropdownData(); 
    }, []); 

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
            // FIX: Gửi tham số limit lớn để lấy toàn bộ danh sách tồn kho
            const res = await listInventories({ limit: 1000 }); 
            setInventories(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error("Lỗi tải tồn kho:", error);
            setInventories([]);
        }
    };

    // -----------------------------------------------------
    // Handlers 
    // -----------------------------------------------------
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Ensure we always have a valid number, never null/undefined/NaN
        let numericValue = 0;
        if (value !== "" && value !== null && value !== undefined) {
            const parsed = Number(value);
            numericValue = isNaN(parsed) ? 0 : parsed;
        }
        setForm(prev => ({ ...prev, [name]: numericValue }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };
    
    // Fixed handler for checkbox list
    const handleValueChange = (name: "product_id" | "store_id", value: string | string[] | undefined) => {
        setForm(prev => ({ 
            ...prev, 
            [name]: value 
        }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // -----------------------------------------------------
    // Validation and Submit 
    // -----------------------------------------------------

    const checkForDuplicate = (productId: number, storeId: number): boolean => {
        if (!Array.isArray(inventories)) return false;
        
        return inventories.some(
            item => Number(item.product_id) === productId && Number(item.store_id) === storeId
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
                // Get complete ID lists
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
                            quantity_sold: 0,
                        } as CreateInventoryDto); 
                    }
                    if (hasDuplicate) break;
                }
                
                if (hasDuplicate) return;
                
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
            setEditingId(null);
            setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 });
            setErrors({});
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
    
    // Helper function (FIXED)
    const getDisplayName = (list: SelectOption[], id: number | undefined): string => {
        if (id === undefined || id === null) return ""; 

        const found = list.find(item => Number(item.id) === Number(id));
        return found?.name || `ID: ${id}`;
    };

    // -----------------------------------------------------
    // Render UI
    // -----------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Tồn kho
                </h2>

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
                                <input type="text" value={getDisplayName(products, Number(form.product_id))} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
                            </div>
                        )}
                        {/* Store (Edit mode - Readonly) */}
                        {editingId !== null && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                                <input type="text" value={getDisplayName(stores, Number(form.store_id))} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"/>
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
                                onChange={handleNumberChange}
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
                                    onChange={handleNumberChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                {errors.quantity_sold && <p className="text-red-500 text-xs mt-1">{errors.quantity_sold}</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        {editingId !== null && (
                             <button
                                 onClick={() => {
                                     setEditingId(null);
                                     setForm({ product_id: undefined, store_id: undefined, quantity_stock: 0, quantity_sold: 0 });
                                     setErrors({});
                                 }}
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

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Sản phẩm</th>
                                <th className="px-4 py-3 text-left">Cửa hàng</th>
                                <th className="px-4 py-3 text-left">Tồn kho</th>
                                <th className="px-4 py-3 text-left">Đã bán</th>
                                <th className="px-4 py-3 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventories.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={`
                                        ${item.id === editingId ? 'bg-yellow-50 border-2 border-yellow-400' : (index % 2 === 0 ? "bg-gray-50" : "bg-white")} 
                                        hover:bg-blue-50 transition
                                    `}
                                >
                                    <td className="px-4 py-3">{item.id}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {getDisplayName(products, item.product_id)}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {getDisplayName(stores, item.store_id)}
                                    </td>
                                    <td className="px-4 py-3">{item.quantity_stock}</td>
                                    <td className="px-4 py-3">{item.quantity_sold}</td>
                                    <td className="px-4 py-3 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-medium shadow"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow"
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            
                            {inventories.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-gray-500">
                                        Không có dữ liệu tồn kho. Vui lòng thêm mới.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    Tổng cộng {inventories.length} mục.
                </div>
            </div>
        </div>
    );
}