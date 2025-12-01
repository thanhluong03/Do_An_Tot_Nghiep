// src/app/PromotionForm.tsx
import React from "react";
import { Promotion, DiscountType } from "@/api/services/promotionService";

// Helper function để chuyển đổi ISO Date sang datetime-local format
const toDatetimeLocal = (isoDateString?: Date | string) => {
    if (!isoDateString) return "";

    const date = typeof isoDateString === 'string' 
        ? new Date(isoDateString) 
        : isoDateString;

    if (isNaN(date.getTime())) return "";

    const datePart = date.toISOString().split("T")[0];
    const timePart = date.toISOString().slice(11, 16); 
    
    return `${datePart}T${timePart}`;
};

export const initialFormState: Promotion = {
    name: "",
    description: "",
    discount_type: DiscountType.FIXED_AMOUNT, 
    discount_value: 0, 
    // Thiết lập ngày giờ mặc định cho tiện lợi
    start_date: toDatetimeLocal(new Date()),
    end_date: toDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), 
    is_active: true,
};

interface PromotionFormProps {
    form: Promotion;
    errors: { [key: string]: string };
    editingId: number | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSubmit: () => void;
    handleCancelEdit: () => void;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
    form, errors, editingId, handleChange, handleSubmit, handleCancelEdit,
}) => {
    return (
        <div className={`border p-6 rounded-lg mb-8 ${editingId ? "border-yellow-400" : "border-blue-400"}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                
                {/* CỘT 1 (Tên, Mô tả) */}
                <div className="md:col-span-1 space-y-4">
                    {/* Tên Promotion */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Khuyến mãi</label>
                        <input name="name" value={form.name || ""} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ví dụ: Giảm giá mùa hè" required />
                        {errors.name && (<p className="text-red-500 text-xs mt-1">{errors.name}</p>)}
                    </div>
                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea name="description" value={form.description || ""} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Mô tả chi tiết về chương trình"/>
                    </div>
                </div>

                {/* CỘT 2 (Loại giảm, Giá trị giảm) */}
                <div className="md:col-span-1 space-y-4">
                    {/* Loại giảm giá */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
                        <select title="Chọn loại giảm giá" name="discount_type" value={form.discount_type || DiscountType.FIXED_AMOUNT} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                            <option value={DiscountType.FIXED_AMOUNT}>Số tiền cố định (FIXED_AMOUNT)</option>
                            <option value={DiscountType.PERCENTAGE}>Phần trăm (PERCENTAGE)</option>
                        </select>
                        {errors.discount_type && (<p className="text-red-500 text-xs mt-1">{errors.discount_type}</p>)}
                    </div>

                    {/* Giá trị giảm */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm {form.discount_type === DiscountType.PERCENTAGE ? "(%)" : "(VNĐ)"}</label>
                        <input title="Nhập giá trị giảm" name="discount_value" type="number" value={form.discount_value || ""} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                        {errors.discount_value && (<p className="text-red-500 text-xs mt-1">{errors.discount_value}</p>)}
                    </div>
                    
                    {/* Kích hoạt */}
                    <div className="flex items-center gap-2 pt-6">
                        <input type="checkbox" id="is_active_checkbox" name="is_active" checked={form.is_active || false} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                        <label htmlFor="is_active_checkbox" className="text-sm font-medium text-gray-700">Kích hoạt</label>
                    </div>
                </div>

                {/* CỘT 3 (Ngày BĐ, Ngày KT) */}
                <div className="md:col-span-1 space-y-4">
                        {/* Ngày bắt đầu */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày và Giờ bắt đầu</label>
                        <input title="Chọn ngày và giờ bắt đầu" name="start_date" type="datetime-local" value={form.start_date || ""} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                        {errors.start_date && (<p className="text-red-500 text-xs mt-1">{errors.start_date}</p>)}
                    </div>
                    
                    {/* Ngày kết thúc */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày và Giờ kết thúc</label>
                        <input title="Chọn ngày và giờ kết thúc" name="end_date" type="datetime-local" value={form.end_date || ""} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                        {errors.end_date && (<p className="text-red-500 text-xs mt-1">{errors.end_date}</p>)}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                {editingId && (
                    <button onClick={handleCancelEdit} className="px-5 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold">Hủy Sửa</button>
                )}
                <button onClick={handleSubmit} className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${
                    editingId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}>
                    {editingId ? "Cập nhật" : "Thêm mới"}
                </button>
            </div>
        </div>
    );
};

export default PromotionForm;