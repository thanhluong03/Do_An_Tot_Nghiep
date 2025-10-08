// src/components/common/Checkboxlist.tsx

import React from "react";
// Import SelectOption từ Import Product Service để dùng chung
import { SelectOption } from "@/api/services/importProductsService"; 

interface CheckboxListProps {
    // Thay đổi type name để chấp nhận cả 'product_id' và 'supplier_id'
    name: "product_id" | "supplier_id" | "store_id"; 
    label: string;
    options: SelectOption[];
    selectedValues: string | string[] | undefined;
    // Cập nhật kiểu trả về cho onChange để bao gồm tất cả các name có thể
    onChange: (name: "product_id" | "supplier_id" | "store_id", value: string | string[] | undefined) => void;
    error: string | undefined;
}

const CheckboxList: React.FC<CheckboxListProps> = ({ name, label, options, selectedValues, onChange, error }) => {
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
            // Khi chọn/bỏ chọn "Tất cả"
            newValue = checked ? 'all' : undefined;
        } else {
            // Xử lý khi chọn/bỏ chọn từng mục
            let newSelectedIds = [...selectedIds];

            if (checked) {
                if (!newSelectedIds.includes(value)) {
                    newSelectedIds.push(value);
                }
            } else {
                newSelectedIds = newSelectedIds.filter(id => id !== value);
            }

            // Gán lại là array hoặc undefined
            newValue = newSelectedIds.length > 0 ? newSelectedIds : undefined;
        }

        onChange(name, newValue);
    };
    
    // Tự động xác định tên hiển thị cho tùy chọn "TẤT CẢ"
    const allLabel = name === 'product_id' 
        ? 'SẢN PHẨM' 
        : (name === 'supplier_id' ? 'NHÀ CUNG CẤP' : 'CỬA HÀNG');

    return (
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="p-2 border rounded-lg bg-white overflow-y-auto" style={{ maxHeight: '180px' }}>
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
                        --- TẤT CẢ {allLabel} ---
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

export default CheckboxList;