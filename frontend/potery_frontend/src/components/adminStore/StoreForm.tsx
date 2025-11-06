// src/components/StoreForm.tsx
import React from 'react';
import { Store } from "@/api/services/storeService";
import { X, Save, Plus } from "lucide-react";

interface StoreFormProps {
    form: Store;
    errors: { [key: string]: string };
    editingId: number | null;
    showForm: boolean;
    onToggleForm: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onCancelEdit: () => void;
}

const StoreForm: React.FC<StoreFormProps> = ({
    form,
    errors,
    editingId,
    showForm,
    onToggleForm,
    onChange,
    onSubmit,
    onCancelEdit,
}) => {
    // Nếu form đang đóng và không phải chế độ chỉnh sửa, hiển thị nút "Thêm mới"
    if (!showForm && !editingId) {
        return (
            <div className="flex justify-end mb-6">
                <button
                    onClick={onToggleForm}
                    className="px-5 py-2 rounded-lg font-semibold shadow-md transition bg-[#F54900] hover:bg-orange-600 text-white flex items-center gap-2"
                >
                    <Plus size={18} /> Thêm cửa hàng mới
                </button>
            </div>
        );
    }
    
    // Nếu form đang mở hoặc đang ở chế độ chỉnh sửa, hiển thị form
    return (
        <div className="border border-gray-200 p-6 mb-8 rounded-xl shadow-inner bg-white/70">
            <h3 className="text-xl font-bold text-gray-700 mb-4">
                {editingId ? `Chỉnh sửa: ${form.store_name}` : "Thêm cửa hàng mới"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {/* Tên cửa hàng */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
                    <input
                        name="store_name"
                        placeholder="Nhập tên cửa hàng"
                        value={form.store_name}
                        onChange={onChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                    {errors.store_name && <p className="text-red-500 text-xs mt-1">{errors.store_name}</p>}
                </div>

                {/* Địa chỉ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                        name="address"
                        placeholder="Nhập địa chỉ"
                        value={form.address}
                        onChange={onChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* Điện thoại */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                    <input
                        name="phone"
                        placeholder="Nhập số điện thoại"
                        value={form.phone}
                        onChange={onChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                {(showForm && !editingId) && ( // Chỉ hiển thị nút hủy khi đang thêm mới (không phải chỉnh sửa)
                    <button
                        onClick={onCancelEdit}
                        className="px-5 py-2 rounded-lg font-semibold transition bg-gray-300 hover:bg-gray-400 text-gray-800 flex items-center gap-1"
                    >
                        <X size={18} /> Hủy
                    </button>
                )}
                
                <button
                    onClick={onSubmit}
                    className={`px-5 py-2 rounded-lg font-semibold shadow-md transition flex items-center gap-1 ${
                        editingId
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                >
                    <Save size={18} /> {editingId ? "Cập nhật" : "Thêm"}
                </button>
            </div>
        </div>
    );
};

export default StoreForm;