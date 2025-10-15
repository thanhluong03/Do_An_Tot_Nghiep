// src/components/adminImportProduct/ImportProductForm.tsx
import React from 'react';
import { SelectOption } from "@/api/services/importProductsService"; 
import { ProductSelectionState } from "@/app/admin/importproduct/page";
import { Tag, Box, DollarSign, ListChecks } from 'lucide-react';

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
}) => {
    
    // 💡 Utils: Định dạng số tiền
    const formatNumber = (num: string | number | undefined): string => {
        if (num === undefined || num === null || num === "") return '';
        const numberValue = Number(num);
        const cleanValue = String(num).replace(/[^0-9]/g, ''); 
        const parsedValue = Number(cleanValue);

        return isNaN(parsedValue) ? '' : parsedValue.toLocaleString('vi-VN');
    };
    
    const selectedCount = products.filter((p) => selectedProducts[p.id]?.checked).length;
    
    return (
        <div className="p-6 mb-8 rounded-xl bg-white border border-green-300 shadow-lg transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 text-green-600 border-b pb-2 flex items-center gap-2">
                <ListChecks size={20} /> Tạo Phiếu Nhập kho Mới
            </h3>

            {/* --- PHẦN CHỌN NHÀ CUNG CẤP (Giữ nguyên) --- */}
            <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Tag size={16} className="text-green-500"/> Nhà Cung cấp <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                    <option value="">-- Chọn Nhà cung cấp --</option>
                    {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
                {!selectedSupplier && <p className="mt-1 text-xs text-red-500">Vui lòng chọn Nhà cung cấp.</p>}
            </div>

            {/* --- PHẦN CHỌN SẢN PHẨM (DANH SÁCH DỌC CÓ ẢNH) --- */}
            <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3">
                    Chọn sản phẩm nhập kho: <span className="text-sm font-normal text-green-600">({products.length} loại từ NCC)</span>
                </h4>
                
                <div className="max-h-60 overflow-y-auto border border-gray-200 p-2 rounded-lg bg-white shadow-inner custom-scrollbar space-y-1">
                    
                    {!selectedSupplier ? (
                        <p className="text-center text-gray-500 py-3">
                            Vui lòng chọn Nhà cung cấp để xem danh sách sản phẩm.
                        </p>
                    ) : (
                        products.length === 0 ? (
                            <p className="text-center text-gray-500 py-3">
                                Nhà cung cấp này hiện không có sản phẩm nào để nhập.
                            </p>
                        ) : (
                            products.map((p) => (
                                <div 
                                    key={p.id}
                                    onClick={() => handleCheckboxChange(p.id)} 
                                    className={`
                                        flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer border-2
                                        ${selectedProducts[p.id]?.checked 
                                            ? 'bg-green-100 border-green-500 shadow-sm' 
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        
                                        {/* Khối Ảnh */}
                                        <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-300 bg-white">
                                            <img 
                                                src={getProductImage(p.id) || "/images/default-product.png"} 
                                                alt={p.name} 
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "/images/default-product.png";
                                                }}
                                            />
                                        </div>
                                        
                                        <span className={`text-sm font-medium truncate ${selectedProducts[p.id]?.checked ? 'text-green-800 font-semibold' : 'text-gray-700'}`}>
                                            {p.name}
                                        </span>
                                    </div>
                                    
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts[p.id]?.checked || false}
                                        onChange={(e) => e.stopPropagation()} 
                                        className="w-4 h-4 text-green-600 accent-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 flex-shrink-0 ml-3"
                                    />
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>

            <div className="mb-6">
                <h4 className="text-md font-bold text-gray-700 mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
                    Chi tiết Nhập liệu 
                    <span className="text-sm font-extrabold text-blue-600">({selectedCount} sản phẩm đã chọn)</span>
                </h4>
                
                <div className="max-h-60 overflow-y-auto space-y-3 p-2 custom-scrollbar">
                    {selectedCount === 0 ? (
                        <p className="text-gray-500 text-center py-4 text-sm">Vui lòng chọn sản phẩm ở trên để nhập số lượng và giá.</p>
                    ) : (
                        products 
                            .filter((p) => selectedProducts[p.id]?.checked)
                            .map((p) => (
                                <div
                                    key={p.id}
                                    className="flex flex-col sm:flex-row items-center gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-200 shadow-sm"
                                >
                                    {/* Tên sản phẩm chiếm 2/5 */}
                                    <span className="w-full sm:w-2/5 text-gray-800 font-medium truncate">
                                        {p.name}
                                    </span>
                                    
                                    {/* Số lượng */}
                                    <div className="w-full sm:w-1/4">
                                        <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <Box size={12}/> SL nhập
                                        </label>
                                        <input
                                            type="text"
                                            inputMode='numeric'
                                            placeholder="0"
                                            value={formatNumber(selectedProducts[p.id]?.quantity)}
                                            onChange={(e) => handleInputChange(p.id, "quantity", e.target.value)}
                                            className="w-full border rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 text-right"
                                        />
                                        {Number(selectedProducts[p.id]?.quantity) <= 0 && selectedProducts[p.id]?.checked && <p className="mt-1 text-xs text-red-500">SL {'>'} 0</p>}
                                    </div>
                                    
                                    {/* Giá nhập */}
                                    <div className="w-full sm:w-1/3">
                                        <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <DollarSign size={12}/> Giá nhập (VNĐ)
                                        </label>
                                        <input
                                            type="text"
                                            inputMode='numeric'
                                            placeholder="0"
                                            value={formatNumber(selectedProducts[p.id]?.price)}
                                            onChange={(e) => handleInputChange(p.id, "price", e.target.value)}
                                            className="w-full border rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 text-right"
                                        />
                                        {Number(selectedProducts[p.id]?.price) <= 0 && selectedProducts[p.id]?.checked && <p className="mt-1 text-xs text-red-500">Giá {'>'} 0</p>}
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!selectedSupplier || selectedCount === 0 || 
                             products.filter((p) => selectedProducts[p.id]?.checked)
                                .some((p) => Number(selectedProducts[p.id]?.quantity) <= 0 || !selectedProducts[p.id]?.price || Number(selectedProducts[p.id]?.price) <= 0)} 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    💾 Lưu Phiếu Nhập ({selectedCount})
                </button>
            </div>
        </div>
    );
};

export default ImportProductForm;