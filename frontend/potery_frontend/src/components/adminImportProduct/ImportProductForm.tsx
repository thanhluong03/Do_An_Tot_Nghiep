// src/components/adminImportProduct/ImportProductForm.tsx (PHIÊN BẢN ĐÃ THÊM ẢNH SẢN PHẨM VÀO CHI TIẾT NHẬP LIỆU)
import React, { useMemo } from 'react';
import { SelectOption, ProductClassification } from "@/api/services/importProductsService";
import { ProductSelectionState } from "@/app/admin/importproduct/page";
import { Tag, Box, DollarSign, Package, ShoppingBag } from 'lucide-react';

interface ImportProductFormProps {
    suppliers: SelectOption[];
    products: SelectOption[];
    selectedSupplier: string;
    getProductImage: (id: number | string | undefined) => string | undefined;
    selectedProducts: ProductSelectionState;
    setSelectedSupplier: React.Dispatch<React.SetStateAction<string>>;
    handleCheckboxChange: (productId: string) => void;
    handleInputChange: (productId: string, field: "quantity" | "price", value: string) => void;
    handleSubmit: () => Promise<void>;
    // New props for classifications
    selectedProductClassifications: Record<string, ProductClassification[]>;
    classificationSelections: Record<string, Record<number, { checked: boolean; quantity: string; price: string }>>;
    handleClassificationCheckboxChange: (productId: string, classificationId: number) => void;
    handleClassificationInputChange: (productId: string, classificationId: number, field: "quantity" | "price", value: string) => void;
}

const ImportProductForm: React.FC<ImportProductFormProps> = ({
    suppliers,
    products,
    selectedSupplier,
    selectedProducts,
    getProductImage,
    setSelectedSupplier,
    handleCheckboxChange,
    handleInputChange,
    handleSubmit,
    selectedProductClassifications,
    classificationSelections,
    handleClassificationCheckboxChange,
    handleClassificationInputChange,
}) => {

    // Utils: Định dạng số tiền, getNumericValue (Giữ nguyên)
    const formatNumber = (num: string | number | undefined): string => {
        if (num === undefined || num === null || num === "") return '';
        const cleanValue = String(num).replace(/[^0-9]/g, '');
        const parsedValue = Number(cleanValue);
        return isNaN(parsedValue) ? '' : parsedValue.toLocaleString('vi-VN');
    };

    const getNumericValue = (formattedValue: string | undefined): string => {
        if (!formattedValue) return "";
        return String(formattedValue).replace(/\./g, '');
    };

    const selectedCount = products.filter((p) => selectedProducts[p.id]?.checked).length;

    const isFormValid = useMemo(() => {
        if (!selectedSupplier || selectedCount === 0) return false;

        // Check each selected product
        const selectedProductIds = products.filter((p) => selectedProducts[p.id]?.checked);

        return selectedProductIds.every((p) => {
            const productId = String(p.id);
            const classifications = selectedProductClassifications[productId] || [];
            const hasClassifications = classifications.length > 0;

            if (hasClassifications) {
                // Product has classifications - check if at least one classification is properly filled
                const productClassificationSelections = classificationSelections[productId] || {};
                const validClassifications = Object.entries(productClassificationSelections)
                    .filter(([_, classData]) => classData.checked)
                    .every(([_, classData]) => {
                        const quantity = Number(getNumericValue(classData.quantity));
                        const price = Number(getNumericValue(classData.price));
                        return quantity > 0 && price > 0;
                    });

                // At least one classification must be selected and valid
                const hasSelectedClassifications = Object.values(productClassificationSelections)
                    .some(classData => classData.checked);

                return hasSelectedClassifications && validClassifications;
            } else {
                // Product has no classifications - check direct product data
                const quantity = Number(getNumericValue(selectedProducts[p.id]?.quantity));
                const price = Number(getNumericValue(selectedProducts[p.id]?.price));
                return quantity > 0 && price > 0;
            }
        });
    }, [selectedSupplier, selectedProducts, products, selectedCount, selectedProductClassifications, classificationSelections]);


    const MAX_HEIGHT_SCROLL_AREA = 'max-h-[36rem]';

    return (
        <div className="p-8 mb-8 rounded-2xl bg-white border border-gray-100 shadow-2xl transition-all duration-300">

            <h3 className="text-2xl font-extrabold mb-6 text-gray-800 border-b-4 border-orange-500/50 pb-3 flex items-center gap-3">
                <Package size={24} className="text-orange-600" /> TẠO PHIẾU NHẬP KHO
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-6">

                {/* -------------------- CỘT TRÁI (7/12) -------------------- */}
                <div className="lg:col-span-7 space-y-4">

                    {/* 1. PHẦN CHỌN NHÀ CUNG CẤP (Giữ nguyên) */}
                    <div className="p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-inner">
                        <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Tag size={18} className="text-orange-500" /> NHÀ CUNG CẤP <span className="text-red-500 font-extrabold">*</span>
                        </label>
                        <select
                            title='s'
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-xl shadow-md py-3 px-4 bg-white text-gray-800 font-medium 
                                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-lg appearance-none cursor-pointer"
                        >
                            <option value="" disabled={!!selectedSupplier}>-- Chọn Nhà cung cấp --</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id} className='text-gray-900'>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        {!selectedSupplier && <p className="mt-2 text-sm text-red-500 font-medium">Vui lòng chọn Nhà cung cấp.</p>}
                    </div>

                    {/* 2. CHI TIẾT NHẬP LIỆU (ĐÃ THÊM ẢNH) */}
                    <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-lg">
                        <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
                            <ShoppingBag size={20} className='text-blue-500' /> CHI TIẾT NHẬP LIỆU
                            <span className={`text-md font-extrabold ${selectedCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                ({selectedCount} đã chọn)
                            </span>
                        </h4>

                        <div className={`space-y-4 p-1 ${MAX_HEIGHT_SCROLL_AREA} overflow-y-auto`}>
                            {selectedCount === 0 ? (
                                <p className="text-gray-500 text-center py-10 text-base font-light border border-dashed border-gray-300 rounded-lg">
                                    Vui lòng chọn sản phẩm ở cột bên phải.
                                </p>
                            ) : (
                                products
                                    .filter((p) => selectedProducts[p.id]?.checked)
                                    .map((p) => {
                                        const productId = String(p.id);
                                        const classifications = selectedProductClassifications[productId] || [];
                                        const hasClassifications = classifications.length > 0;

                                        return (
                                            <div key={p.id} className="bg-blue-50/50 p-4 rounded-lg border border-blue-200 shadow-sm">
                                                {/* HEADER: Ảnh và tên sản phẩm */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 bg-white">
                                                        <img
                                                            src={getProductImage(p.id) || "/images/default-product.png"}
                                                            alt={p.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.onerror = null;
                                                                e.currentTarget.src = "/images/default-product.png";
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-gray-800 font-semibold text-sm">{p.name}</h5>
                                                        <p className="text-xs text-gray-500">
                                                            {hasClassifications ? `${classifications.length} phân loại` : 'Không có phân loại'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* CONTENT: Classifications hoặc thông tin sản phẩm thường */}
                                                {hasClassifications ? (
                                                    <div className="space-y-2">
                                                        {classifications.map((classification) => {
                                                            const classSelection = classificationSelections[productId]?.[classification.id] || { checked: false, quantity: "", price: "" };
                                                            return (
                                                                <div key={classification.id} className="bg-white p-3 rounded border border-gray-200">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={classSelection.checked}
                                                                            onChange={() => handleClassificationCheckboxChange(productId, classification.id)}
                                                                            className="text-blue-600"
                                                                        />
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            {classification.name}
                                                                        </span>
                                                                    </div>

                                                                    {classSelection.checked && (
                                                                        <div className="grid grid-cols-2 gap-2 ml-6">
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 mb-1 flex items-center gap-1 font-medium">
                                                                                    <Box size={12} className="text-gray-400" /> SL <span className="text-red-500">*</span>
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    inputMode='numeric'
                                                                                    placeholder="0"
                                                                                    value={formatNumber(classSelection.quantity)}
                                                                                    onChange={(e) => handleClassificationInputChange(productId, classification.id, "quantity", e.target.value)}
                                                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 text-right font-mono"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 mb-1 flex items-center gap-1 font-medium">
                                                                                    <DollarSign size={12} className="text-gray-400" /> GIÁ <span className="text-red-500">*</span>
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    inputMode='numeric'
                                                                                    placeholder="0"
                                                                                    value={formatNumber(classSelection.price)}
                                                                                    onChange={(e) => handleClassificationInputChange(productId, classification.id, "price", e.target.value)}
                                                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 text-right font-mono"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                                        <p className="text-sm text-yellow-700 mb-2">
                                                            ⚠️ Sản phẩm này không có phân loại. Nhập trực tiếp:
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs text-gray-500 mb-1 flex items-center gap-1 font-medium">
                                                                    <Box size={12} className="text-gray-400" /> SL <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    inputMode='numeric'
                                                                    placeholder="0"
                                                                    value={formatNumber(selectedProducts[p.id]?.quantity)}
                                                                    onChange={(e) => handleInputChange(String(p.id), "quantity", e.target.value)}
                                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 text-right font-mono"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500 mb-1 flex items-center gap-1 font-medium">
                                                                    <DollarSign size={12} className="text-gray-400" /> GIÁ <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    inputMode='numeric'
                                                                    placeholder="0"
                                                                    value={formatNumber(selectedProducts[p.id]?.price)}
                                                                    onChange={(e) => handleInputChange(String(p.id), "price", e.target.value)}
                                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 text-right font-mono"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </div>

                {/* -------------------- CỘT PHẢI (5/12) (Giữ nguyên) -------------------- */}
                <div className="lg:col-span-5">

                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
                        Chọn Sản phẩm
                        <span className="text-sm font-semibold text-gray-500">({products.length} loại)</span>
                    </h4>

                    <div className={`${MAX_HEIGHT_SCROLL_AREA} overflow-y-auto border border-gray-300 rounded-xl p-3 bg-white shadow-lg space-y-2`}>
                        {/* ... (Nội dung chọn sản phẩm giữ nguyên) ... */}
                        {!selectedSupplier ? (
                            <p className="text-center text-gray-500 py-10 font-light">Chọn NCC để tải danh sách.</p>
                        ) : (
                            products.length === 0 ? (
                                <p className="text-center text-gray-500 py-10 font-light">NCC này không có sản phẩm.</p>
                            ) : (
                                products.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => handleCheckboxChange(p.id)}
                                        className={`
                                            flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer border
                                            ${selectedProducts[p.id]?.checked
                                                ? 'bg-orange-50 border-orange-400 shadow-md transform scale-[1.01]'
                                                : 'border-gray-100 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 bg-white shadow-sm">
                                                <img
                                                    src={getProductImage(p.id) || "/images/default-product.png"}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = "/images/default-product.png";
                                                    }}
                                                />
                                            </div>
                                            <span className={`text-sm font-medium truncate ${selectedProducts[p.id]?.checked ? 'text-orange-800 font-bold' : 'text-gray-700'}`}>
                                                {p.name}
                                            </span>
                                        </div>

                                        <input
                                            title='check'
                                            type="checkbox"
                                            checked={selectedProducts[p.id]?.checked || false}
                                            onChange={(e) => e.stopPropagation()}
                                            className="w-4 h-4 text-orange-600 accent-orange-600 bg-gray-100 border-gray-300 rounded-full focus:ring-orange-500 flex-shrink-0 ml-3 cursor-pointer"
                                        />
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </div>


            {/* --- FOOTER & BUTTON (Giữ nguyên) --- */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-10 py-3 rounded-xl shadow-xl transition 
                                disabled:bg-orange-300 disabled:shadow-none disabled:cursor-not-allowed text-lg tracking-wider transform hover:scale-[1.02]"
                >
                    XÁC NHẬN NHẬP KHO ({selectedCount})
                </button>
            </div>
        </div>
    );
};

export default ImportProductForm;