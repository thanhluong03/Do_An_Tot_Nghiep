// src/components/common/CheckboxList.tsx
import React from "react";
import { SelectOption, Product, getProductImageUrl } from "@/api/services/inventoryService";

interface CheckboxListProps {
    name: "product_id" | "store_id";
    label: string;
    options: SelectOption[];
    selectedValues: string | string[] | undefined;
    onChange: (name: "product_id" | "store_id", value: string | string[] | undefined) => void;
    error: string | undefined;
    allProducts: Product[];
}

const findProduct = (id: number, allProducts: Product[]): Product | undefined =>
    allProducts.find((p) => p.id === id);

const findProductImage = (id: number, allProducts: Product[]): string => {
    const product = findProduct(id, allProducts);
    return product ? getProductImageUrl(product) : "/no-image.jpg";
};

const CheckboxList: React.FC<CheckboxListProps> = ({
    name,
    label,
    options,
    selectedValues,
    onChange,
    error,
    allProducts,
}) => {
    const selectedIds: string[] = React.useMemo(() => {
        if (Array.isArray(selectedValues)) return selectedValues.filter((val) => val !== "all");
        if (typeof selectedValues === "string" && selectedValues !== "all") return [selectedValues];
        return [];
    }, [selectedValues]);

    const isAllSelected = selectedValues === "all";
    const isProductList = name === "product_id";

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        let newValue: string | string[] | undefined;

        if (value === "all") {
            newValue = checked ? "all" : undefined;
        } else {
            let newSelectedIds = [...selectedIds];
            if (checked && !newSelectedIds.includes(value)) newSelectedIds.push(value);
            if (!checked) newSelectedIds = newSelectedIds.filter((id) => id !== value);
            newValue = newSelectedIds.length > 0 ? newSelectedIds : undefined;
        }

        onChange(name, newValue);
    };

    return (
        <div className="md:col-span-2">
            <label className="block text-base font-semibold text-gray-800 mb-3">
                {label}
            </label>

            <div
                className="p-0 border rounded-2xl bg-white shadow-inner overflow-y-auto transition-all duration-300 hover:shadow-lg hover:border-orange-300"
                style={{ maxHeight: "600px" }}
            >
                {/* --- Header cố định --- */}
                <div className="sticky top-0 z-10 bg-orange-100/90 backdrop-blur-sm border-b border-orange-200 px-4 py-3 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wide">
                        {isProductList ? "Danh sách sản phẩm" : "Danh sách cửa hàng"}
                    </h4>

                    {/* Chỉ hiển thị cột “SL trong Kho Tổng” khi là sản phẩm */}
                    {isProductList && (
                        <span className="text-xs font-semibold text-orange-700">
                            SL trong Kho Tổng
                        </span>
                    )}
                </div>

                {/* --- Select All Option --- */}
                <div className="flex items-center mb-3 pb-2 border-b border-dashed border-gray-200 px-4 pt-3">
                    <input
                        type="checkbox"
                        id={`${name}-all`}
                        name={name}
                        value="all"
                        checked={isAllSelected}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer transform scale-110"
                    />
                    <label
                        htmlFor={`${name}-all`}
                        className="ml-3 text-base font-bold text-orange-600 cursor-pointer select-none"
                    >
                        --- TẤT CẢ {isProductList ? "SẢN PHẨM" : "CỬA HÀNG"} ---
                    </label>
                </div>

                {/* --- Options List --- */}
                <div className="grid grid-cols-1 gap-3 px-4 pb-4">
                    {options.map((opt) => {
                        const product = isProductList ? findProduct(opt.id, allProducts) : null;
                        const total_quantity_divided = product ? product.total_quantity_divided : null;

                        return (
                            <div
                                key={opt.id}
                                className="flex items-center justify-between bg-gray-50/60 hover:bg-orange-50 transition-all duration-200 p-3 rounded-xl border border-transparent hover:border-orange-200"
                            >
                                {/* Bên trái: ảnh + tên + checkbox */}
                                <div className="flex items-center flex-1 min-w-0">
                                    {isProductList && (
                                        <img
                                            src={findProductImage(opt.id, allProducts)}
                                            alt={opt.name}
                                            className="w-10 h-10 object-cover rounded-full border border-gray-200 shadow-sm mr-3"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = "/no-image.jpg";
                                            }}
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
                                        className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer transform scale-110"
                                    />

                                    <label
                                        htmlFor={`${name}-${opt.id}`}
                                        className={`ml-3 text-base font-medium truncate ${
                                            isAllSelected
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 cursor-pointer hover:text-orange-700"
                                        }`}
                                        title={opt.name}
                                    >
                                        {opt.name}
                                    </label>
                                </div>

                                {/* Chỉ hiện số lượng nếu là sản phẩm */}
                                {isProductList && total_quantity_divided !== null && (
                                    <span
                                        className={`ml-4 px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${
                                            total_quantity_divided > 0
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-gray-100 text-gray-500"
                                        }`}
                                        title={`Tồn kho tổng: ${total_quantity_divided}`}
                                    >
                                        {total_quantity_divided.toLocaleString("vi-VN")}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {error && (
                <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
            )}
        </div>
    );
};

export default CheckboxList;
