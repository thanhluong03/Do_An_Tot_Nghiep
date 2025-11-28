"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    getStores,
    addStore,
    updateStore,
    deleteStore,
    Store,
} from "@/api/services/storeService";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, Trash2 } from 'lucide-react';
import StoreForm from "@/components/adminStore/StoreForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function StorePage() {
    const defaultForm: Store = {
        store_name: "",
        address: "",
        phone: "",
    };
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState<number | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [form, setForm] = useState<Store>(defaultForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [showForm, setShowForm] = useState(false);


    const formatDateTime = (isoString?: string) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const resetFormState = useCallback(() => {
        setForm(defaultForm);
        setEditingId(null);
        setErrors({});
        setShowForm(false);
    }, []);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const data = await getStores();
            setStores(data);
            setCurrentPage(1);
        } catch {
            toast.error("Không thể tải danh sách cửa hàng!");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.store_name.trim()) newErrors.store_name = "Tên cửa hàng không được bỏ trống";
        if (!form.address.trim()) newErrors.address = "Địa chỉ không được bỏ trống";
        if (!form.phone.trim()) newErrors.phone = "Số điện thoại không được bỏ trống";
        else if (!/^\d{9,11}$/.test(form.phone.trim())) newErrors.phone = "Số điện thoại không hợp lệ (9-11 chữ số)";
        return newErrors;
    };

    const handleSubmit = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Vui lòng kiểm tra lại thông tin!");
            return;
        }

        try {
            if (editingId) {
                await updateStore(editingId, form);
                toast.success("Cập nhật cửa hàng thành công!");
            } else {
                await addStore(form);
                toast.success("Thêm cửa hàng thành công!");
            }
            resetFormState();
            fetchStores();
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra trong quá trình lưu!");
        }
    };

    const handleEdit = (store: Store) => {
        setForm(store);
        setEditingId(store.id || null);
        setErrors({});
        setShowForm(true);
        toast("Chỉnh sửa cửa hàng đang được bật", { icon: "✏️" });
    };

    const handleDelete = async (id: number) => {
        setItemToDeleteId(id);
        setIsDeleteDialogOpen(true)
    };
    const performDelete = async () => {
        if (!itemToDeleteId) return;

        try {
            await deleteStore(itemToDeleteId);
            toast.success("Xoá cửa hàng thành công!");
            
            // Nếu đang chỉnh sửa item vừa xóa, thì reset form
            if (editingId === itemToDeleteId) {
                resetFormState();
            }
            
            fetchStores();
        } catch {
            toast.error("Không thể xoá cửa hàng!");
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDeleteId(null);
        }
    };
    
    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setItemToDeleteId(null);
    };
    const handleCancelEdit = () => {
        resetFormState();
    }
    
    // Pagination logic
    const totalPages = Math.ceil(stores.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentStores = stores.slice(startIndex, startIndex + pageSize);

    return (
        <div className="min-h-screen bg-gray-100 p-2">
            <Toaster position="top-right" />
            <div className="w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-3xl font-extrabold text-[#B95D26] mb-10 text-center">
                    Quản lý Cửa hàng
                </h2>

                {/* Component Form */}
                <StoreForm
                    form={form}
                    errors={errors}
                    editingId={editingId}
                    showForm={showForm}
                    onToggleForm={() => setShowForm(p => !p)}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancelEdit={handleCancelEdit}
                />

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-xl shadow-lg text-sm text-gray-800">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase text-xs font-bold border-b border-gray-200">
                                <th className="px-5 py-3 text-center w-[60px] rounded-tl-xl">STT</th>
                                <th className="px-5 py-3 text-left min-w-[150px]">Tên cửa hàng</th>
                                <th className="px-5 py-3 text-left min-w-[200px]">Địa chỉ</th>
                                <th className="px-5 py-3 text-center w-[120px]">Điện thoại</th>
                                <th className="px-5 py-3 text-center w-[150px]">Ngày tạo</th>
                                <th className="px-5 py-3 text-center w-[150px]">Ngày cập nhật</th>
                                <th className="px-5 py-3 text-center w-[200px] rounded-tr-xl">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentStores.map((store, index) => (
                                <tr
                                    key={store.id}
                                    className={`border-b border-gray-100 last:border-b-0 ${
                                        editingId === store.id ? "bg-yellow-50/50" : "hover:bg-blue-50/30"
                                    } transition-colors duration-150`}
                                >
                                    <td className="px-5 py-3 text-sm text-gray-600 text-center">{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td className="px-5 py-3 font-semibold text-gray-700 break-words" title={store.store_name}>{store.store_name}</td>
                                    <td className="px-5 py-3 text-gray-700 text-sm break-words" title={store.address}>{store.address}</td>
                                    <td className="px-5 py-3 text-center text-sm text-gray-700">{store.phone}</td>

                                    <td className="px-5 py-3 text-center text-sm text-gray-700">
                                        {formatDateTime(store.created_at)}
                                    </td>
                                    <td className="px-5 py-3 text-center text-sm text-gray-700">
                                        {formatDateTime(store.updated_at)}
                                    </td>
                                    
                                    <td className="px-5 py-3 text-center space-x-2">
                                        <button
                                            title='Sửa'
                                            onClick={() => handleEdit(store)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition duration-150 shadow-sm"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            title='Xoá'
                                            onClick={() => store.id && handleDelete(store.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-150 shadow-sm"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {stores.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500 italic bg-gray-50 rounded-b-xl">
                                        Không có cửa hàng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                        Hiển thị {startIndex + 1} -{" "}
                        {Math.min(startIndex + pageSize, stores.length)} trên{" "}
                        <span className="font-bold">{stores.length}</span> cửa hàng
                    </p>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1.5 font-bold text-blue-600 text-sm">
                            {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1.5 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
            {isDeleteDialogOpen && itemToDeleteId !== null && (
                <ConfirmDialog
                    title="Xác nhận Xóa Cửa hàng"
                    message={`Bạn có chắc muốn xóa cửa hàng ID: ${itemToDeleteId}? Hành động này không thể hoàn tác.`}
                    confirmText="Xác nhận Xoá"
                    cancelText="Hủy"
                    onConfirm={performDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
}