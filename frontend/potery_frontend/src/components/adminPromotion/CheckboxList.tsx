// src/components/common/CheckboxList.tsx
import React from "react";
import { SelectOption } from "@/api/services/promotionService";

interface CheckboxListProps {
    name: "product_id" | "supplier_id" | "store_id";
    label: string;
    options: SelectOption[];
    selectedValues: string | string[] | undefined | null;
    onChange: (
        name: "product_id" | "supplier_id" | "store_id",
        value: string | string[] | undefined
    ) => void;
    error: string | undefined;
}

const CheckboxList: React.FC<CheckboxListProps> = ({
    name,
    label,
    options,
    selectedValues,
    onChange,
    error,
}) => {
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredOptions = React.useMemo(() => {
        if (!searchTerm.trim()) return options;
        const lower = searchTerm.toLowerCase();
        return options.filter(
            (opt) =>
                opt.name.toLowerCase().includes(lower) ||
                String(opt.id).includes(lower)
        );
    }, [options, searchTerm]);

    const selectedIds: string[] = React.useMemo(() => {
        if (!selectedValues) return [];
        if (Array.isArray(selectedValues)) {
            return selectedValues.filter((val) => val !== "all");
        }
        if (typeof selectedValues === "string" && selectedValues !== "all") {
            return [selectedValues];
        }
        return [];
    }, [selectedValues]);

    const isAllSelected = selectedValues === "all";

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        let newValue: string | string[] | undefined;

        if (value === "all") {
            newValue = checked ? "all" : undefined;
        } else {
            let newSelectedIds = [...selectedIds];
            if (checked) {
                if (!newSelectedIds.includes(value)) newSelectedIds.push(value);
            } else {
                newSelectedIds = newSelectedIds.filter((id) => id !== value);
            }
            newValue = newSelectedIds.length > 0 ? newSelectedIds : undefined;
        }
        onChange(name, newValue);
    };

    const allLabel =
        name === "product_id"
            ? "SẢN PHẨM"
            : name === "supplier_id"
            ? "NHÀ CUNG CẤP"
            : "CỬA HÀNG";

    return (
        <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
                {label}
            </label>

            {/* 🔍 Thanh tìm kiếm sản phẩm */}
            {name === "product_id" && (
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm theo tên hoặc ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-orange-300 rounded-full px-4 py-2 text-sm shadow-sm focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 transition-all"
                    />
                </div>
            )}

            <div
    className="p-3 border border-orange-200 rounded-xl bg-gradient-to-br from-white via-orange-50 to-white overflow-y-auto shadow-inner relative"
    style={{ maxHeight: "600px" }}
>
    {/* --- TẤT CẢ (CỐ ĐỊNH Ở ĐẦU) --- */}
    <div
        className="flex items-center mb-2 pb-2 border-b border-dashed border-orange-200 bg-white sticky top-0 z-10 shadow-sm"
    >
        <input
            type="checkbox"
            id={`${name}-all`}
            name={name}
            value="all"
            checked={isAllSelected}
            onChange={handleCheckboxChange}
            className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
        />
        <label
            htmlFor={`${name}-all`}
            className="ml-3 text-base font-bold text-orange-600 cursor-pointer select-none"
        >
            --- Tất cả {allLabel} ---
        </label>
    </div>

    {/* Danh sách checkbox */}
    <div className="grid grid-cols-1 gap-2 mt-1">
        {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
                <div
                    key={opt.id}
                    className={`flex items-center p-3 rounded-lg transition-colors duration-150 ${
                        isAllSelected
                            ? "bg-gray-100 text-gray-400"
                            : selectedIds.includes(String(opt.id))
                            ? "bg-orange-50 border border-orange-300"
                            : "hover:bg-orange-50"
                    }`}
                >
                    <input
                        type="checkbox"
                        id={`${name}-${opt.id}`}
                        name={name}
                        value={String(opt.id)}
                        disabled={isAllSelected}
                        checked={
                            isAllSelected ||
                            selectedIds.includes(String(opt.id))
                        }
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 flex-shrink-0 cursor-pointer"
                    />

                    {name === "product_id" && opt.imageUrl && (
                        <img
                            src={opt.imageUrl}
                            alt={opt.name}
                            className="w-12 h-12 object-cover rounded-md ml-3 shadow-sm flex-shrink-0"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/no-image.jpg";
                            }}
                        />
                    )}

                    <label
                        htmlFor={`${name}-${opt.id}`}
                        className={`ml-3 text-base truncate flex-grow ${
                            isAllSelected
                                ? "cursor-not-allowed text-gray-500"
                                : "cursor-pointer text-gray-800"
                        }`}
                        title={opt.name}
                    >
                        {opt.name}
                    </label>
                </div>
            ))
        ) : (
            <p className="text-center text-sm text-gray-500 py-3 italic">
                {searchTerm
                    ? "Không tìm thấy sản phẩm phù hợp."
                    : "Không có dữ liệu để hiển thị."}
            </p>
        )}
    </div>
</div>


            {error && (
                <p className="text-red-500 text-xs mt-2 italic">{error}</p>
            )}
        </div>
    );
};

export default CheckboxList;
