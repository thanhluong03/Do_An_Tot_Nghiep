// src/components/common/CheckboxList.tsx (Đã thêm hiển thị ảnh)

import React from "react";
// Import Product và getProductImageUrl
import { SelectOption, Product, getProductImageUrl } from "@/api/services/inventoryService"; 

interface CheckboxListProps {
    name: "product_id" | "store_id";
    label: string;
    options: SelectOption[];
    selectedValues: string | string[] | undefined;
    onChange: (name: "product_id" | "store_id", value: string | string[] | undefined) => void;
    error: string | undefined;
    // THÊM: Danh sách Product đầy đủ cho việc hiển thị ảnh
    allProducts: Product[]; 
}

// HÀM TRỢ GIÚP: Tìm URL ảnh
const findProductImage = (id: number, allProducts: Product[]): string => {
    if (id === null || id === undefined) return "/no-image.jpg";
    const product = allProducts.find(p => p.id === id);
    if (product) {
        // Sử dụng hàm chuẩn getProductImageUrl từ service
        return getProductImageUrl(product);
    }
    return "/no-image.jpg";
}


const CheckboxList: React.FC<CheckboxListProps> = ({ name, label, options, selectedValues, onChange, error, allProducts }) => {
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
                        --- TẤT CẢ {name === 'product_id' ? 'SẢN PHẨM' : 'CỬA HÀNG'} ---
                    </label>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-2 mt-1"> {/* Đổi thành col-span-1 để dễ hiển thị ảnh/tên */}
                    {options.map((opt) => (
                        <div key={opt.id} className="flex items-center">
                            {/* HIỂN THỊ ẢNH CHO SẢN PHẨM */}
                            {name === 'product_id' && (
                                <img
                                    src={findProductImage(opt.id, allProducts)}
                                    alt={opt.name}
                                    className="w-6 h-6 object-cover rounded mr-2"
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/no-image.jpg"; }}
                                />
                            )}
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