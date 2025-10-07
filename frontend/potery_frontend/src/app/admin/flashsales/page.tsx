"use client";
import React, { useEffect, useState } from "react";
import {
    getFlashSales,
    addFlashSale,
    updateFlashSale,
    deleteFlashSale,
    FlashSale,
} from "@/api/services/flashsaleService"; 

const initialFormState: FlashSale = {
    name: "",
    flash_sale_price: 0,
    quantity: 0,
    start_time: "", 
    end_time: "", 
    is_active: false,
};

const toDatetimeLocal = (dateIsoString?: string, timeHmsString?: string) => {
    if (!dateIsoString) return "";
    const datePart = dateIsoString.split("T")[0]; 
    
    let timePart: string;
    if (timeHmsString && timeHmsString.length >= 5) {
        timePart = timeHmsString.substring(0, 5); 
    } else {
        const isoTimePart = dateIsoString.split("T")[1];
        timePart = isoTimePart ? isoTimePart.substring(0, 5) : "00:00";
    }

    const datetimeLocalString = `${datePart}T${timePart}`;
    return datetimeLocalString;
};

export default function FlashSalePage() {
    const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
    const [form, setForm] = useState<FlashSale>(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);

    useEffect(() => {
        fetchFlashSales();
    }, []);

    const fetchFlashSales = async () => {
        try {
            const data = await getFlashSales(); 
            setFlashSales(data);
        } catch (error) {
            console.error("Lỗi tải Flash Sale:", error);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const processedValue = (name === 'flash_sale_price' || name === 'quantity')
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
        if (!form.name?.trim()) newErrors.name = "Tên Flash Sale không được bỏ trống";
        if (!form.flash_sale_price || form.flash_sale_price <= 0)
            newErrors.flash_sale_price = "Giá phải lớn hơn 0";
        if (form.quantity === undefined || form.quantity <= 0) 
            newErrors.quantity = "Số lượng phải lớn hơn 0";
        if (!form.start_time) newErrors.start_time = "Thời gian bắt đầu không được bỏ trống";
        if (!form.end_time) newErrors.end_time = "Thời gian kết thúc không được bỏ trống";
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
                await updateFlashSale(editingId, updateDto);
                alert(`Cập nhật Flash Sale ID ${editingId} thành công!`);
                setEditingId(null);
            } else {
                await addFlashSale(form as FlashSale);
                alert("Thêm Flash Sale mới thành công!");
            }

            setForm(initialFormState);
            setErrors({});
            await fetchFlashSales(); 
        } catch (error: unknown) {
            const errorMsg =
                typeof error === "object" && error !== null && "message" in error
                    ? (error as { message?: string }).message || "Có lỗi xảy ra khi thực hiện thao tác!"
                    : "Có lỗi xảy ra khi thực hiện thao tác!";
            console.error("Lỗi CRUD:", error);
            alert(errorMsg);
        }
    };

    const handleEdit = (item: FlashSale) => {
        setForm({
            ...item,
            // Sử dụng toDatetimeLocal để chuyển đổi 4 trường thành 2 trường datetime-local
            start_time: toDatetimeLocal(item.effective_period_begins, item.start_time),
            end_time: toDatetimeLocal(item.effective_period_ends, item.end_time),
        });
        setEditingId(item.id || null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(initialFormState);
        setErrors({});
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Bạn có chắc muốn xoá Flash Sale ID ${id}?`)) return;
        try {
            await deleteFlashSale(id);
            alert(`Xoá Flash Sale ID ${id} thành công!`);
            await fetchFlashSales();
        } catch (error) {
            console.error("Lỗi xoá:", error);
            alert("Có lỗi xảy ra khi xoá Flash Sale.");
        }
    };

    const totalPages = Math.ceil(flashSales.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentItems = flashSales.slice(startIndex, startIndex + pageSize);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                    Quản lý Flash Sale
                </h2>
            
                <div
                    className={`border p-6 rounded-lg mb-8 ${
                        editingId ? "border-yellow-400" : "border-blue-400"
                    }`}
                >
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                        {editingId
                            ? `Sửa Flash Sale ID: ${editingId}`
                            : "Thêm Flash Sale mới"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên Flash Sale
                                </label>
                                <input
                                    name="name"
                                    value={form.name || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Nhập tên Flash Sale"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá Flash Sale
                                </label>
                                <input
                                    title="Giá Flash Sale phải lớn hơn 0"
                                    name="flash_sale_price"
                                    type="number"
                                    value={form.flash_sale_price || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    required
                                />
                                {errors.flash_sale_price && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.flash_sale_price}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày và Giờ bắt đầu
                                </label>
                                <input
                                    title="Thời gian bắt đầu phải trước thời gian kết thúc"
                                    name="start_time"
                                    type="datetime-local"
                                    value={form.start_time || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    required 
                                />
                                {errors.start_time && (
                                    <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-1 space-y-4">
                            <div> 
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số lượng
                                </label>
                                <input
                                    title="
                                    Số lượng sản phẩm trong Flash Sale phải lớn hơn 0"
                                    name="quantity"
                                    type="number"
                                    value={form.quantity || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    required 
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày và Giờ kết thúc
                                </label>
                                <input 
                                    title="Thời gian kết thúc phải sau thời gian bắt đầu"
                                    name="end_time"
                                    type="datetime-local"
                                    value={form.end_time || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    required 
                                />
                                {errors.end_time && (
                                    <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>
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
                                <th className="px-4 py-3 text-left">Tên</th>
                                <th className="px-4 py-3 text-left">Giá</th>
                                <th className="px-4 py-3 text-left">Số lượng</th>
                                <th className="px-4 py-3 text-left">Trạng thái</th>
                                <th className="px-4 py-3 text-left">Thời gian BĐ/KT</th>
                                <th className="px-4 py-3 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((fs, idx) => (
                                <tr
                                    key={fs.id}
                                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
                                >
                                    <td className="px-4 py-3">{fs.id}</td>
                                    <td className="px-4 py-3">{fs.name}</td>
                                    <td className="px-4 py-3">{fs.flash_sale_price?.toLocaleString()} ₫</td>
                                    <td className="px-4 py-3">{fs.quantity}</td>
                                    <td className="px-4 py-3">
                                        {fs.is_active ? (
                                            <span className="text-green-600 font-semibold">Đang chạy</span>
                                        ) : (
                                            <span className="text-gray-500">Ngừng</span>
                                        )}
                                    </td>
                                    {/* HIỂN THỊ 4 TRƯỜNG */}
                                    <td className="px-4 py-3 text-sm">
                                        <p className="font-semibold text-gray-700">Bắt đầu:</p>
                                        <p className="text-xs text-gray-600">
                                            Ngày (eff): {fs.effective_period_begins?.split("T")[0]}
                                        </p>
                                        <p className="text-xs text-gray-600 mb-2">
                                            Giờ (time): {fs.start_time?.substring(0, 5) || fs.effective_period_begins?.split("T")[1]?.substring(0, 5) || 'N/A'}
                                        </p>
                                        <p className="font-semibold text-gray-700">Kết thúc:</p>
                                        <p className="text-xs text-gray-600">
                                            Ngày (eff): {fs.effective_period_ends?.split("T")[0]}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Giờ (time): {fs.end_time?.substring(0, 5) || fs.effective_period_ends?.split("T")[1]?.substring(0, 5) || 'N/A'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(fs)}
                                            className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-white font-medium"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => fs.id && handleDelete(fs.id)}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white font-medium"
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {flashSales.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-gray-500">
                                        Không có Flash Sale nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">
                        Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, flashSales.length)} trên {flashSales.length}
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