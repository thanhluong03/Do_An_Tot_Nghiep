// src/components/common/Checkboxlist.tsx

import React from "react";
// Import SelectOption từ file service để đảm bảo đồng bộ
import { SelectOption } from "@/api/services/promotionService"; 

interface CheckboxListProps {
    name: "product_id" | "supplier_id" | "store_id"; 
    label: string;
    options: SelectOption[];
    selectedValues: string | string[] | undefined | null;
    onChange: (name: "product_id" | "supplier_id" | "store_id", value: string | string[] | undefined) => void;
    error: string | undefined;
}

const CheckboxList: React.FC<CheckboxListProps> = ({ name, label, options, selectedValues, onChange, error }) => {
    
    // Lấy ra mảng ID đã chọn (bỏ qua 'all')
    const selectedIds: string[] = React.useMemo(() => {
        if (!selectedValues) return [];
        
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

            // Nếu không chọn gì, trả về undefined
            newValue = newSelectedIds.length > 0 ? newSelectedIds : undefined;
        }

        onChange(name, newValue);
    };
    
    // Label cho tùy chọn "Chọn Tất Cả"
    const allLabel = name === 'product_id' 
        ? 'SẢN PHẨM' 
        : (name === 'supplier_id' ? 'NHÀ CUNG CẤP' : 'CỬA HÀNG');

    return (
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="p-2 border rounded-lg bg-white overflow-y-auto shadow-inner" style={{ maxHeight: '180px' }}>
                
                {/* Select All Option */}
                <div className="flex items-center mb-1 pb-1 border-b border-dashed">
                    <input
                        type="checkbox"
                        id={`${name}-all`}
                        name={name}
                        value="all"
                        checked={isAllSelected}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                    />
                    <label htmlFor={`${name}-all`} className="ml-2 text-sm font-bold text-blue-600 cursor-pointer">
                        --- TẤT CẢ {allLabel} ---
                    </label>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-1 mt-1"> 
                    {options.map((opt) => (
                        <div 
                            key={opt.id} 
                            className={`flex items-center p-1.5 rounded-md transition-colors ${
                                isAllSelected ? 'bg-gray-100' : (selectedIds.includes(String(opt.id)) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50')
                            }`}
                        >
                            <input
                                type="checkbox"
                                id={`${name}-${opt.id}`}
                                name={name}
                                value={String(opt.id)}
                                disabled={isAllSelected} 
                                checked={isAllSelected || selectedIds.includes(String(opt.id))}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-200 flex-shrink-0"
                            />
                            
                            {/* HIỂN THỊ ẢNH (Chỉ cho Sản phẩm) */}
                            {name === 'product_id' && opt.imageUrl && (
                                <img
                                    src={opt.imageUrl}
                                    alt={opt.name}
                                    className="w-7 h-7 object-cover rounded ml-2 flex-shrink-0"
                                    onError={(e) => { 
                                        e.currentTarget.onerror = null; 
                                        e.currentTarget.src = "/no-image.jpg"; 
                                    }}
                                />
                            )}

                            <label 
                                htmlFor={`${name}-${opt.id}`} 
                                className={`ml-2 text-sm text-gray-700 truncate flex-grow ${
                                    isAllSelected ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                title={opt.name}
                            >
                                {opt.name}
                            </label>
                        </div>
                    ))}
                    {options.length === 0 && (
                         <p className="text-center text-sm text-gray-500 py-2">Không có dữ liệu để hiển thị.</p>
                    )}
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default CheckboxList;