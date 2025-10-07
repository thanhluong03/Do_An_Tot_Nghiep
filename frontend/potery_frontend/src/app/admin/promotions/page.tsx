"use client";
import React, { useEffect, useState } from "react";
import {
    getPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    Promotion,
    DiscountType,
} from "@/api/services/promotionService"; // Đảm bảo đường dẫn đúng

const initialFormState: Promotion = {
    name: "",
    description: "",
    discount_type: DiscountType.FIXED_AMOUNT, // Mặc định là FIXED_AMOUNT
    discount_value: 0, 
    start_date: "", 
    end_date: "", 
    is_active: true,
};
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

export default function PromotionPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [form, setForm] = useState<Promotion>(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const data = await getPromotions(); 
            setPromotions(data);
        } catch (error) {
            console.error("Lỗi tải Promotion:", error);
        }
    };


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;

        const processedValue = (name === 'discount_value')
            ? Number(value)
            : value;

        setForm({
            ...form,
            [name]: type === "checkbox" ? target.checked : processedValue,
        });
        setErrors({ ...errors, [name]: "" });
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.name?.trim()) newErrors.name = "Tên Khuyến mãi không được bỏ trống";
        if (form.discount_value === undefined || form.discount_value <= 0)
            newErrors.discount_value = "Giá trị giảm phải lớn hơn 0";
        if (!form.start_date) newErrors.start_date = "Thời gian bắt đầu không được bỏ trống";
        if (!form.end_date) newErrors.end_date = "Thời gian kết thúc không được bỏ trống";
        if (!form.discount_type) newErrors.discount_type = "Loại giảm giá không được bỏ trống";
        
        if (form.discount_type === DiscountType.PERCENTAGE && form.discount_value && (form.discount_value > 100 || form.discount_value < 1)) {
            newErrors.discount_value = "Phần trăm giảm phải từ 1 đến 100";
        }
        return newErrors;
    };

    const handleSubmit = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (editingId) {
                const { id, ...updateDto } = form;
                await updatePromotion(editingId, updateDto);
                alert(`Cập nhật Promotion ID ${editingId} thành công!`);
                setEditingId(null);
            } else {
                await addPromotion(form as Promotion);
                alert("Thêm Promotion mới thành công!");
            }

            setForm(initialFormState);
            setErrors({});
            await fetchPromotions(); 
        } catch (error: any) {
            const errorMsg = error.message || "Có lỗi xảy ra khi thực hiện thao tác!";
            console.error("Lỗi CRUD:", error);
            alert(errorMsg);
        }
    };

    const handleEdit = (item: Promotion) => {
        setForm({
            ...item,
            start_date: toDatetimeLocal(item.start_date),
            end_date: toDatetimeLocal(item.end_date),
        });
        setEditingId(item.id || null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(initialFormState);
        setErrors({});
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Bạn có chắc muốn xoá Promotion ID ${id}?`)) return;
        try {
            await deletePromotion(id);
            alert(`Xoá Promotion ID ${id} thành công!`);
            await fetchPromotions();
        } catch (error) {
            console.error("Lỗi xoá:", error);
            alert("Có lỗi xảy ra khi xoá Promotion.");
        }
    };
    const totalPages = Math.ceil(promotions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentItems = promotions.slice(startIndex, startIndex + pageSize);
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Chương trình Khuyến mãi
                </h2>
                <div
                    className={`border p-6 rounded-lg mb-8 ${
                        editingId ? "border-yellow-400" : "border-blue-400"
                    }`}
                >
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                        {editingId
                            ? `Sửa Promotion ID: ${editingId}`
                            : "Thêm Promotion mới"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        
                        {/* CỘT 1 (Tên, Mô tả) */}
                        <div className="md:col-span-1 space-y-4">
                            
                            {/* Tên Promotion */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên Khuyến mãi
                                </label>
                                <input
                                    name="name"
                                    value={form.name || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Ví dụ: Giảm giá mùa hè"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description || ""}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Mô tả chi tiết về chương trình"
                                />
                            </div>
                        </div>

                        {/* CỘT 2 (Loại giảm, Giá trị giảm) */}
                        <div className="md:col-span-1 space-y-4">
                            
                            {/* Loại giảm giá */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại giảm giá
                                </label>
                                <select
                                    title="Chọn loại giảm giá"
                                    name="discount_type"
                                    value={form.discount_type || DiscountType.FIXED_AMOUNT}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    required
                                >
                                    <option value={DiscountType.FIXED_AMOUNT}>Số tiền cố định (FIXED_AMOUNT)</option>
                                    <option value={DiscountType.PERCENTAGE}>Phần trăm (PERCENTAGE)</option>
                                </select>
                                {errors.discount_type && (
                                    <p className="text-red-500 text-xs mt-1">{errors.discount_type}</p>
                                )}
                            </div>

                            {/* Giá trị giảm */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá trị giảm {form.discount_type === DiscountType.PERCENTAGE ? "(%)" : "(VNĐ)"}
                                </label>
                                <input
                                    title="Nhập giá trị giảm"
                                    name="discount_value"
                                    type="number"
                                    value={form.discount_value || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    required
                                />
                                {errors.discount_value && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.discount_value}
                                    </p>
                                )}
                            </div>
                            
                            {/* Kích hoạt */}
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="is_active_checkbox"
                                    name="is_active"
                                    checked={form.is_active || false}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="is_active_checkbox" className="text-sm font-medium text-gray-700">
                                    Kích hoạt
                                </label>
                            </div>
                        </div>

                        {/* CỘT 3 (Ngày BĐ, Ngày KT) */}
                        <div className="md:col-span-1 space-y-4">
                            
                             {/* Ngày bắt đầu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày và Giờ bắt đầu
                                </label>
                                <input
                                    title="Chọn ngày và giờ bắt đầu"
                                    name="start_date"
                                    type="datetime-local"
                                    value={form.start_date || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    required 
                                />
                                {errors.start_date && (
                                    <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
                                )}
                            </div>
                            
                            {/* Ngày kết thúc */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày và Giờ kết thúc
                                </label>
                                <input
                                    title="Chọn ngày và giờ kết thúc"
                                    name="end_date"
                                    type="datetime-local"
                                    value={form.end_date || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    required 
                                />
                                {errors.end_date && (
                                    <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        {editingId && (
                            <button
                                onClick={handleCancelEdit}
                                className="px-5 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold"
                            >
                                Hủy Sửa
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            className={`px-5 py-2 rounded-lg font-semibold shadow-md transition ${
                                editingId
                                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                        >
                            {editingId ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </div>

                {/* Bảng liệt kê */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Tên/Mô tả</th>
                                <th className="px-4 py-3 text-left">Giá trị giảm</th>
                                <th className="px-4 py-3 text-left">Thời gian</th>
                                <th className="px-4 py-3 text-left">Trạng thái</th>
                                <th className="px-4 py-3 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((promo, idx) => (
                                <tr
                                    key={promo.id}
                                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
                                >
                                    <td className="px-4 py-3">{promo.id}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <p className="font-semibold text-gray-800">{promo.name}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{promo.description || '(Không mô tả)'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold">
                                        {promo.discount_type === DiscountType.PERCENTAGE
                                            ? `${promo.discount_value}%`
                                            : `${promo.discount_value?.toLocaleString()} VNĐ`
                                        }
                                        <p className="text-xs font-normal text-gray-500">({promo.discount_type})</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        <p>BĐ: {new Date(promo.start_date || '').toLocaleString()}</p>
                                        <p>KT: {new Date(promo.end_date || '').toLocaleString()}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        {promo.is_active ? (
                                            <span className="text-green-600 font-semibold">Đang hoạt động</span>
                                        ) : (
                                            <span className="text-gray-500">Ngừng</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(promo)}
                                            className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-white font-medium text-sm"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => promo.id && handleDelete(promo.id)}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white font-medium text-sm"
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {promotions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-gray-500">
                                        Không có chương trình khuyến mãi nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">
                        Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, promotions.length)} trên {promotions.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1 font-medium text-gray-700">
                            Trang {currentPage}/{totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}