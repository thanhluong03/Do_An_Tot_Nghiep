// src/app/PromotionPage.tsx
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import CheckboxList from "@/components/adminPromotion/CheckboxList";
import { SelectOption } from "@/api/services/promotionService";
import PromotionForm, { initialFormState } from "@/components/adminPromotion/PromotionForm";
import {
    getPromotions, addPromotion, updatePromotion, deletePromotion,
    getAllProductsWithPromotions, setProductPromotionAssignments,
    Promotion, DiscountType, ProductPromotionAssignment,
} from "@/api/services/promotionService";
import { Pencil, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog"; // IMPORT MỚI

const toDatetimeLocal = (isoDateString?: Date | string) => {
    if (!isoDateString) return "";
    const date = typeof isoDateString === 'string' ? new Date(isoDateString) : isoDateString;
    if (isNaN(date.getTime())) return "";
    const datePart = date.toISOString().split("T")[0];
    const timePart = date.toISOString().slice(11, 16);
    return `${datePart}T${timePart}`;
};

export default function PromotionPage() {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isAssignVisible, setIsAssignVisible] = useState(false);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [form, setForm] = useState<Promotion>(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [productAssignments, setProductAssignments] = useState<ProductPromotionAssignment[]>([]);
    const [isSavingAssignments, setIsSavingAssignments] = useState(false);
    const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null);
    const [productCheckboxValue, setProductCheckboxValue] = useState<string | string[] | undefined>(undefined);

    // STATES MỚI CHO CONFIRM DIALOG
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const fetchPromotions = useCallback(async () => {
        try {
            const data = await getPromotions();
            setPromotions(data);
        } catch (error) {
            console.error("Lỗi tải Promotion:", error);
            toast.error("Không thể tải danh sách Khuyến mãi!");
        }
    }, []);

    const fetchProductsAndAssignments = useCallback(async () => {
        try {
            const data = await getAllProductsWithPromotions();
            setProductAssignments(data);
        } catch (error) {
            console.error("Lỗi tải danh sách Sản phẩm và gán:", error);
            toast.error("Không thể tải danh sách Sản phẩm gán!");
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
        fetchProductsAndAssignments();
    }, [fetchPromotions, fetchProductsAndAssignments]);

    const productOptions: SelectOption[] = useMemo(() => {
        return productAssignments.map(a => ({
            id: a.productId,
            name: a.product?.name || `ID: ${a.productId} (Chưa có tên)`,
            imageUrl: a.product?.imageUrl,
            categoryId: (a.product as any)?.category_id || a.product?.categoryId || null,
        }));
    }, [productAssignments]);

    const handleProductCheckboxChange = useCallback((
        _name: "product_id" | "supplier_id" | "store_id",
        value: string | string[] | undefined
    ) => {
        setProductCheckboxValue(value);
    }, []);

    const selectedProductIds = useMemo(() => {
        if (productCheckboxValue === 'all') {
            return productAssignments.map(a => a.productId);
        }
        if (Array.isArray(productCheckboxValue)) {
            return productCheckboxValue.map(id => Number(id));
        }
        if (typeof productCheckboxValue === 'string') {
            return [Number(productCheckboxValue)];
        }
        return [];
    }, [productCheckboxValue, productAssignments]);

    const handleSaveAssignments = async () => {
        if (selectedProductIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một Sản phẩm để thao tác.");
            return;
        }
        if (selectedPromotionId === null) {
            toast.error("Vui lòng chọn một Khuyến mãi để áp dụng, hoặc chọn 'HỦY GÁN'.");
            return;
        }

        setIsSavingAssignments(true);
        try {
            const promoIdToSet = selectedPromotionId === -1 ? null : selectedPromotionId;

            const payloadToSend = selectedProductIds.map(productId => ({
                productId: productId,
                promotionId: promoIdToSet,
            }));

            await setProductPromotionAssignments(payloadToSend as { productId: number, promotionId: number | null }[]);
            toast.success(`Cập nhật gán khuyến mãi cho ${payloadToSend.length} sản phẩm thành công!`);

            setProductCheckboxValue(undefined);
            setSelectedPromotionId(null);
            await fetchProductsAndAssignments();
        } catch (error) {
            console.error("Lỗi khi lưu gán khuyến mãi:", error);
            toast.error("Lưu gán khuyến mãi thất bại. Vui lòng kiểm tra console.");
        } finally {
            setIsSavingAssignments(false);
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
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = (): { [key: string]: string } => {
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
                toast.success(`Cập nhật Promotion ID ${editingId} thành công!`);
                setEditingId(null);
            } else {
                await addPromotion(form as Promotion);
                toast.success("Thêm Promotion mới thành công!");
            }

            setForm(initialFormState);
            setErrors({});
            setIsFormVisible(false);
            await fetchPromotions();
        } catch (error: any) {
            const errorMsg = error.message || "Có lỗi xảy ra khi thực hiện thao tác!";
            console.error("Lỗi CRUD:", error);
            toast.error(errorMsg);
        }
    };

    const handleEdit = (item: Promotion) => {
        setForm({
            ...item,
            start_date: toDatetimeLocal(item.start_date),
            end_date: toDatetimeLocal(item.end_date),
        });
        setEditingId(item.id || null);
        setIsFormVisible(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(initialFormState);
        setErrors({});
        setIsFormVisible(false);
    };

    // HÀM GỌI XÁC NHẬN
    const handleDelete = (id: number) => {
        setIdToDelete(id);
        setIsConfirmOpen(true); // Mở Modal xác nhận
    };

    // HÀM THỰC HIỆN XÓA SAU KHI XÁC NHẬN
    const executeDelete = async () => {
        if (!idToDelete) return;

        setIsConfirmOpen(false); // Đóng Modal
        const id = idToDelete;

        // Thêm toast loading
        const loadingToastId = toast.loading(`Đang thực hiện xoá Promotion ID ${id}...`);

        try {
            await deletePromotion(id);

            // Thay thế loading bằng thông báo thành công
            toast.success(`Xoá Promotion ID ${id} thành công!`, { id: loadingToastId });

            await fetchPromotions();
            await fetchProductsAndAssignments();
        } catch (error) {
            console.error("Lỗi xoá:", error);

            // Thay thế loading bằng thông báo lỗi
            toast.error("Có lỗi xảy ra khi xoá Promotion. Vui lòng kiểm tra sản phẩm có đang sử dụng khuyến mãi này không.", { id: loadingToastId, duration: 6000 });
        } finally {
            setIdToDelete(null); // Xóa ID đã chọn
        }
    };
    const handleUnassignSingleProduct = async (productId: number) => {
        const product = productAssignments.find(a => a.productId === productId);
        if (!product) return;

        // Bổ sung Confirm Dialog nếu cần, nhưng tạm thời dùng toast loading
        const loadingToastId = toast.loading(`Đang hủy gán khuyến mãi cho Sản phẩm ID ${productId}...`);

        try {
            await setProductPromotionAssignments([
                { productId: productId, promotionId: null },
            ]);

            toast.success(`Hủy gán khuyến mãi cho Sản phẩm ID ${productId} thành công!`, { id: loadingToastId });
            await fetchProductsAndAssignments(); // Tải lại danh sách sau khi hủy gán

            // Xóa sản phẩm khỏi lựa chọn hàng loạt nếu nó đang được chọn
            setProductCheckboxValue(prev => {
                if (!Array.isArray(prev)) return undefined;
                return prev.filter(id => Number(id) !== productId);
            });

        } catch (error) {
            console.error("Lỗi hủy gán:", error);
            toast.error("Hủy gán khuyến mãi thất bại.", { id: loadingToastId });
        }
    };
    
    const totalPages = Math.ceil(promotions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentItems = promotions.slice(startIndex, startIndex + pageSize);
    const activePromotions = promotions.filter(p => p.is_active && p.id);
    const assignedProductAssignments = useMemo(() => {
        return productAssignments.filter(a => a.promotionId !== null);
    }, [productAssignments]);

    return (
        <div className="min-h-screen bg-white rounded-xl shadow-2xl  p-4">
            <Toaster position="top-right" />

            {/* RENDER CONFIRM DIALOG */}
            {isConfirmOpen && idToDelete !== null && (
                <ConfirmDialog
                    title="XÁC NHẬN XOÁ KHUYẾN MÃI"
                    message={`Bạn có chắc chắn muốn xoá vĩnh viễn Promotion ID ${idToDelete}? Hành động này không thể hoàn tác.`}
                    confirmText="Xác nhận XÓA"
                    cancelText="Hủy bỏ"
                    onConfirm={executeDelete} // Gọi hàm xóa thực sự
                    onCancel={() => {
                        setIsConfirmOpen(false);
                        setIdToDelete(null);
                    }}
                />
            )}

            <div className="w-full mx-auto bg-white p-8">

                <div className="flex justify-around items-center mb-8">
                    <h2 className="text-3xl font-extrabold text-[#B95D26] flex-1 pr-12">
                        Quản lý chương trình Khuyến mãi
                    </h2>
                    <button
                        onClick={() => {
                            if (isFormVisible) handleCancelEdit();
                            setEditingId(null);
                            setForm(initialFormState);
                            setIsFormVisible(true);
                        }}
                        className="px-6 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg transition transform hover:scale-105"
                    >
                        + Thêm khuyến mãi mới
                    </button>
                </div>


                {/* 1. KHU VỰC FORM CRUD PROMOTION */}
                {isFormVisible && (
                    <>
                        <div className="relative border border-gray-200 p-6 rounded-xl shadow-md bg-white mb-8">
                            <button
                                onClick={handleCancelEdit}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-light transition"
                                title="Đóng Form"
                            >
                                &times;
                            </button>

                            <h3 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
                                {editingId ? `Chỉnh Sửa Khuyến mãi ID: ${editingId}` : "Thêm Khuyến mãi Mới"}
                            </h3>

                            <PromotionForm
                                form={form} errors={errors} editingId={editingId}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                handleCancelEdit={handleCancelEdit}
                            />
                        </div>
                        <hr className="my-8 border-gray-200" />
                    </>
                )}

                {/* 4. BẢNG LIỆT KÊ PROMOTION */}
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center mt-10">
                    Danh sách Khuyến mãi
                </h2>

                <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
                    <table className="w-full border-collapse bg-white">
                        <thead>
                            <tr className="bg-gray-200 text-black text-sm font-semibold uppercase tracking-wider">
                                <th className="px-5 py-3 text-left rounded-tl-xl">ID</th>
                                <th className="px-5 py-3 text-left">Tên/Mô tả</th>
                                <th className="px-5 py-3 text-left">Giá trị giảm</th>
                                <th className="px-5 py-3 text-left">Thời gian</th>
                                <th className="px-5 py-3 text-left">Trạng thái</th>
                                <th className="px-5 py-3 text-center rounded-tr-xl">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((promo, idx) => (
                                <tr
                                    key={promo.id}
                                    className={`border-b border-gray-100 transition hover:bg-gray-50 ${editingId === promo.id ? 'bg-yellow-50' : ''}`}
                                >
                                    <td className="px-5 py-3 text-sm font-mono text-gray-600">{promo.id}</td>
                                    <td className="px-5 py-3 text-sm">
                                        <p className="font-semibold text-gray-800">{promo.name}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{promo.description || '(Không mô tả)'}</p>
                                    </td>
                                    <td className="px-5 py-3 text-sm font-bold text-indigo-600">
                                        {promo.discount_type === DiscountType.PERCENTAGE
                                            ? `${promo.discount_value}%`
                                            : `${promo.discount_value?.toLocaleString()} VNĐ`
                                        }
                                        <p className="text-xs font-normal text-gray-500">({promo.discount_type})</p>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-600">
                                        <p>BĐ: {new Date(promo.start_date || '').toLocaleString()}</p>
                                        <p>KT: {new Date(promo.end_date || '').toLocaleString()}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        {promo.is_active ? (
                                            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Hoạt động</span>
                                        ) : (
                                            <span className="inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">Ngừng</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 flex gap-2 justify-center">
                                        <button
                                            title="sua"
                                            onClick={() => handleEdit(promo)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                                        >
                                            <Pencil size={14} />

                                        </button>
                                        <button
                                            title="xoa"
                                            onClick={() => promo.id && handleDelete(promo.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {promotions.length === 0 && (
                                <tr className="last:border-b-0">
                                    <td colSpan={6} className="text-center py-4 text-gray-500 italic">
                                        Không có chương trình khuyến mãi nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 5. KHU VỰC GÁN KHUYẾN MÃI HÀNG LOẠT */}
                <div className="mt-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-700">
                            Gán Khuyến mãi hàng loạt cho Sản phẩm
                        </h2>
                        <button
                            onClick={() => setIsAssignVisible(!isAssignVisible)}
                            className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md transition"
                        >
                            {isAssignVisible ? "Thu gọn" : "+ Gán Khuyến mãi hàng loạt"}
                        </button>
                    </div>

                    {/* Vùng ẩn/hiện */}
                    {isAssignVisible && (
                        <div className="border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-100 p-8 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
                            {/* CỘT 1: CHỌN KHUYẾN MÃI & NÚT LƯU */}
                            <div className="md:col-span-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-4 text-[#B95D26] flex items-center gap-2">
                                        Bước 1: Chọn Khuyến mãi
                                    </h3>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Áp dụng Khuyến mãi
                                    </label>

                                    <select
                                        title="selectedPromotionId"
                                        value={selectedPromotionId === null ? "" : selectedPromotionId}
                                        onChange={(e) =>
                                            setSelectedPromotionId(e.target.value ? Number(e.target.value) : null)
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    >
                                        <option value="">--- Chọn Khuyến mãi để áp dụng ---</option>
                                        <option
                                            value={-1}
                                            className="bg-red-50 text-red-600 font-semibold"
                                        >
                                            --- HỦY GÁN KHUYẾN MÃI ---
                                        </option>
                                        {activePromotions.map((promo) => (
                                            <option key={promo.id} value={promo.id}>
                                                {promo.name} ({promo.discount_value}{" "}
                                                {promo.discount_type === DiscountType.PERCENTAGE ? "%" : "VNĐ"})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-10 border-t border-orange-200 pt-4">
                                    <p className="text-sm text-gray-600 mb-3">
                                        Đã chọn:{" "}
                                        <span className="font-bold text-orange-600">
                                            {selectedProductIds.length}
                                        </span>{" "}
                                        sản phẩm.
                                    </p>
                                    <button
                                        onClick={handleSaveAssignments}
                                        disabled={
                                            isSavingAssignments ||
                                            selectedPromotionId === null ||
                                            selectedProductIds.length === 0
                                        }
                                        className={`w-full px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all duration-150 transform active:scale-95 ${isSavingAssignments ||
                                                selectedPromotionId === null ||
                                                selectedProductIds.length === 0
                                                ? "bg-orange-300 text-gray-100 cursor-not-allowed shadow-none"
                                                : "bg-orange-600 hover:bg-orange-700 text-white hover:shadow-lg"
                                            }`}
                                    >
                                        {isSavingAssignments ? "Đang Lưu..." : "Lưu Gán Khuyến mãi"}
                                    </button>
                                </div>
                            </div>

                            {/* CỘT 2 & 3: CHỌN SẢN PHẨM */}
                            <div className="md:col-span-2">
                                <h3 className="text-2xl font-bold mb-4 text-[#B95D26] flex items-center gap-2">
                                    Bước 2: Chọn Sản phẩm để GÁN / HỦY GÁN
                                </h3>

                                <div className="bg-white border border-gray-200 rounded-xl shadow-inner p-4">
                                    <CheckboxList
                                        name="product_id"
                                        label={`Danh sách Sản phẩm (${productAssignments.length})`}
                                        options={productOptions}
                                        selectedValues={productCheckboxValue}
                                        onChange={handleProductCheckboxChange}
                                        error={
                                            productAssignments.length === 0
                                                ? " Không có sản phẩm nào được tải."
                                                : undefined
                                        }
                                    />
                                </div>

                                <p className="text-xs text-gray-500 mt-3 italic">
                                    Chọn <span className="font-semibold text-orange-600">TẤT CẢ SẢN PHẨM</span>{" "}
                                    để thao tác với toàn bộ danh sách sản phẩm.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <hr className="my-10 border-gray-200" />

                {/* 3. BẢNG LIỆT KÊ TÌNH TRẠNG GÁN HIỆN TẠI */}
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center mt-10">
                    Tình trạng Gán Khuyến mãi của Sản phẩm
                </h2>
                <p className="text-sm text-gray-500 text-center mb-4 italic">
                    (Chỉ hiển thị các sản phẩm đang có Khuyến mãi được gán)
                </p>
                <div className="overflow-x-auto max-h-[400px] border border-gray-100 rounded-lg shadow-inner">
                    <table className="w-full border-collapse bg-white modern-table">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm font-medium uppercase sticky top-0 z-10 border-b border-gray-200">
                                <th className="px-5 py-3 text-left w-[120px]">ID Sản phẩm</th>
                                <th className="px-5 py-3 text-left">Tên Sản phẩm</th>
                                <th className="px-5 py-3 text-left w-1/3">Khuyến mãi hiện tại</th>
                                <th className="px-5 py-3 text-center w-[300px]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedProductAssignments.map((assignment, idx) => (
                                <tr key={assignment.productId} className={`border-b border-gray-100 transition hover:bg-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                    <td className="px-5 py-3 text-sm font-mono text-gray-600">{assignment.productId}</td>
                                    <td className="px-5 py-3 font-semibold text-gray-800">
                                        {assignment.product?.name || `Product ID ${assignment.productId} (Không tên)`}
                                    </td>
                                    <td className="px-5 py-3 text-sm">
                                        {assignment.promotionId
                                            ? <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                                                {promotions.find(p => p.id === assignment.promotionId)?.name || `ID: ${assignment.promotionId}`}
                                            </span>
                                            : null
                                        }
                                    </td>
                                    {/* 👇 THÊM CỘT HÀNH ĐỘNG VỚI NÚT */}
                                    <td className="px-5 py-3 text-center">
                                        <div className="flex gap-2 justify-center">
                                            {/* Nút HỦY GÁN (Unassign) */}
                                            <button
                                                title="Hủy Gán Khuyến Mãi"
                                                onClick={() => handleUnassignSingleProduct(assignment.productId)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                                            >
                                                <Trash2 size={14} /> Hủy Gán
                                            </button>

                                            {/* Nút SỬA GÁN (Tùy chọn: Mở khu vực gán hàng loạt với sản phẩm này) */}
                                            <button
                                                title="Sửa Gán (Mở lại khu vực gán)"
                                                onClick={() => {
                                                    setProductCheckboxValue(String(assignment.productId)); // Chọn duy nhất sản phẩm này
                                                    setSelectedPromotionId(assignment.promotionId); // Giữ lại khuyến mãi cũ
                                                    setIsAssignVisible(true); // Mở khu vực gán
                                                    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
                                                }}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                                            >
                                                <Pencil size={14} /> Sửa
                                            </button>
                                        </div>
                                    </td>
                                    {/* 👆 KẾT THÚC THÊM CỘT HÀNH ĐỘNG VỚI NÚT */}
                                </tr>
                            ))}
                            {assignedProductAssignments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500 italic">
                                        Không có sản phẩm nào đang được gán khuyến mãi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <hr className="my-10 border-gray-200" />

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6 p-4">
                    <p className="text-sm text-gray-600">
                        Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, promotions.length)} trên {promotions.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
                        >
                            &larr; Trước
                        </button>
                        <span className="px-4 py-2 font-semibold text-indigo-600 bg-indigo-50 rounded-lg">
                            {currentPage}/{totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
                        >
                            Sau &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}