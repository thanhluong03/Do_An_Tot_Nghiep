// src/app/PromotionPage.tsx
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
// Import CheckboxList và SelectOption
import CheckboxList from "@/components/adminPromotion/CheckboxList"; 
import { SelectOption } from "@/api/services/promotionService"; 

// Import các modules khác
// Đã sửa đường dẫn theo cấu trúc project giả định
import PromotionForm, { initialFormState } from "@/components/adminPromotion/PromotionForm"; 
import {
    getPromotions, addPromotion, updatePromotion, deletePromotion,
    getAllProductsWithPromotions, setProductPromotionAssignments, 
    Promotion, DiscountType, ProductPromotionAssignment, 
} from "@/api/services/promotionService"; 

// Helper function để chuyển đổi ISO Date sang datetime-local format
const toDatetimeLocal = (isoDateString?: Date | string) => {
    if (!isoDateString) return "";
    const date = typeof isoDateString === 'string' ? new Date(isoDateString) : isoDateString;
    if (isNaN(date.getTime())) return "";
    const datePart = date.toISOString().split("T")[0];
    const timePart = date.toISOString().slice(11, 16); 
    return `${datePart}T${timePart}`;
};


// ================== Main Component ==================

export default function PromotionPage() {
    // State mới để kiểm soát việc hiển thị form
    const [isFormVisible, setIsFormVisible] = useState(false); 

    // State cho CRUD Promotion
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [form, setForm] = useState<Promotion>(initialFormState);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    
    // State cho Gán Khuyến mãi Sản phẩm
    const [productAssignments, setProductAssignments] = useState<ProductPromotionAssignment[]>([]);
    const [isSavingAssignments, setIsSavingAssignments] = useState(false);
    
    // ID Khuyến mãi đang được chọn để gán/hủy gán (-1: HỦY GÁN, null: CHƯA CHỌN)
    const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(null); 
    
    // State lưu trữ giá trị của CheckboxList ('all', string[], hoặc undefined)
    const [productCheckboxValue, setProductCheckboxValue] = useState<string | string[] | undefined>(undefined);


    // ================== Data Fetching Logic ==================

    const fetchPromotions = useCallback(async () => { 
        try {
            const data = await getPromotions(); 
            setPromotions(data);
        } catch (error) {
            console.error("Lỗi tải Promotion:", error);
        }
    }, []);
    
    const fetchProductsAndAssignments = useCallback(async () => {
        try {
            const data = await getAllProductsWithPromotions();
            setProductAssignments(data);
        } catch (error) {
            console.error("Lỗi tải danh sách Sản phẩm và gán:", error);
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
        fetchProductsAndAssignments(); 
    }, [fetchPromotions, fetchProductsAndAssignments]);

    // ================== CÁC HÀM XỬ LÝ CHO ASSIGNMENT ==================

    // 🟢 Chuyển đổi ProductAssignments sang format SelectOption
    const productOptions: SelectOption[] = useMemo(() => {
        return productAssignments.map(a => ({
            id: a.productId,
            name: a.product?.name || `ID: ${a.productId} (Chưa có tên)`,
            imageUrl: a.product?.imageUrl, 
        }));
    }, [productAssignments]);

    // 🟢 Hàm xử lý thay đổi của CheckboxList
    const handleProductCheckboxChange = useCallback((
        _name: "product_id" | "supplier_id" | "store_id", 
        value: string | string[] | undefined
    ) => {
        setProductCheckboxValue(value); 
    }, []);
    
    // 🟢 Lấy danh sách Product IDs cần thao tác từ state của CheckboxList
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
             alert("Vui lòng chọn ít nhất một Sản phẩm để thao tác.");
             return;
        }
        if (selectedPromotionId === null) {
             alert("Vui lòng chọn một Khuyến mãi để áp dụng, hoặc chọn 'HỦY GÁN'.");
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
            alert(`Cập nhật gán khuyến mãi cho ${payloadToSend.length} sản phẩm thành công!`);
            
            setProductCheckboxValue(undefined); 
            setSelectedPromotionId(null);
            await fetchProductsAndAssignments(); 
        } catch (error) {
            console.error("Lỗi khi lưu gán khuyến mãi:", error);
            alert("Lưu gán khuyến mãi thất bại. Vui lòng kiểm tra console.");
        } finally {
            setIsSavingAssignments(false);
        }
    };
    
    // ================== CRUD Logic ==================

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
                alert(`Cập nhật Promotion ID ${editingId} thành công!`);
                setEditingId(null);
            } else {
                await addPromotion(form as Promotion);
                alert("Thêm Promotion mới thành công!");
            }

            // Đóng form sau khi thành công
            setForm(initialFormState);
            setErrors({});
            setIsFormVisible(false); // 👈 Đóng form
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
        setIsFormVisible(true); // 👈 Mở form khi bấm Sửa
    };

    // 🚨 Đã cập nhật logic của handleCancelEdit để reset state và đóng form.
    const handleCancelEdit = () => {
        setEditingId(null);
        setForm(initialFormState);
        setErrors({});
        setIsFormVisible(false); // 👈 Đóng form khi bấm Hủy Sửa hoặc nút Đóng
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Bạn có chắc muốn xoá Promotion ID ${id}?`)) return;
        try {
            await deletePromotion(id);
            alert(`Xoá Promotion ID ${id} thành công!`);
            await fetchPromotions();
            await fetchProductsAndAssignments(); 
        } catch (error) {
            console.error("Lỗi xoá:", error);
            alert("Có lỗi xảy ra khi xoá Promotion.");
        }
    };
    
    // ================== Render Helpers ==================
    
    const totalPages = Math.ceil(promotions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentItems = promotions.slice(startIndex, startIndex + pageSize);
    const activePromotions = promotions.filter(p => p.is_active && p.id);


    return (
        <div className="min-h-screen bg-gray-50 p-4"> {/* Nền nhẹ hơn */}
            <div className="w-full mx-auto bg-white rounded-xl shadow-2xl p-8"> {/* Shadow lớn hơn, bo góc đẹp hơn */}
                
                {/* 1. TIÊU ĐỀ & NÚT THÊM MỚI */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-800">
                        Quản lý Chương trình Khuyến mãi
                    </h2>
                    <button
                        onClick={() => {
                            // Logic mở form Thêm mới: Đóng nếu đang mở, reset form, sau đó mở form
                            if (isFormVisible) handleCancelEdit(); // Đóng form nếu đang mở
                            setEditingId(null);
                            setForm(initialFormState);
                            setIsFormVisible(true); // Mở form
                        }}
                        className="px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg transition transform hover:scale-105" // Nút hiện đại, bo tròn
                    >
                        + Thêm Promotion mới
                    </button>
                </div>

                
                {/* 1. KHU VỰC FORM CRUD PROMOTION - Chỉ hiển thị khi isFormVisible = true */}
                {isFormVisible && (
                    <>  
                    <div className="relative border border-gray-200 p-6 rounded-xl shadow-md bg-white mb-8"> {/* Bọc form trong 1 container */}
                        {/* NÚT ĐÓNG FORM */}
                        <button
                            onClick={handleCancelEdit} // Dùng hàm Hủy/Đóng
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-light transition"
                            title="Đóng Form"
                        >
                            &times; 
                        </button>
                        
                        {/* Tiêu đề form */}
                        <h3 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
                            {editingId ? `Chỉnh Sửa Khuyến mãi ID: ${editingId}` : "Thêm Khuyến mãi Mới"}
                        </h3>

                        <PromotionForm 
                            form={form} errors={errors} editingId={editingId}
                            handleChange={handleChange} 
                            handleSubmit={handleSubmit} 
                            handleCancelEdit={handleCancelEdit} // Giờ dùng để đóng form/hủy sửa
                        />
                    </div>
                    <hr className="my-8 border-gray-200" />
                    </>
                )}
                
                  {/* 4. BẢNG LIỆT KÊ PROMOTION (CRUD VIEW - ĐÃ CẢI TIẾN CSS) */}
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center mt-10">
                    Danh sách Khuyến mãi (CRUD View)
                </h2>
                
                <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100"> {/* Bọc bảng trong container có shadow và bo góc */}
                    <table className="w-full border-collapse bg-white"><thead>
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
                                        onClick={() => handleEdit(promo)} 
                                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white font-medium text-sm transition shadow-md"
                                    >Sửa</button>
                                    <button 
                                        onClick={() => promo.id && handleDelete(promo.id)} 
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium text-sm transition shadow-md"
                                    >Xoá</button>
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

                {/* 2. KHU VỰC GÁN KHUYẾN MÃI CHO SẢN PHẨM (DÙNG CheckboxList) */}
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center mt-10">
                    Gán Khuyến mãi hàng loạt cho Sản phẩm
                </h2>
                
                <div className="border border-indigo-200 bg-indigo-50 p-6 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* CỘT 1: CHỌN KHUYẾN MÃI & NÚT LƯU */}
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-semibold mb-4 text-indigo-700">
                            Bước 1: Chọn Khuyến mãi
                        </h3>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Áp dụng Khuyến mãi</label>
                        <select 
                            title="selectedPromotionId"
                            value={selectedPromotionId === null ? "" : selectedPromotionId}
                            onChange={(e) => 
                                setSelectedPromotionId(e.target.value ? Number(e.target.value) : null)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">--- Chọn Khuyến mãi để áp dụng ---</option>
                            <option value={-1} className="bg-red-50 text-red-600 font-semibold">--- HỦY GÁN KHUYẾN MÃI (SET NULL) ---</option>
                            {activePromotions.map(promo => (
                                <option 
                                    key={promo.id} 
                                    value={promo.id}
                                >
                                    {promo.name} ({promo.discount_value} {promo.discount_type === DiscountType.PERCENTAGE ? '%' : ' VNĐ'})
                                </option>
                            ))}
                        </select>
                        
                        <div className="mt-8 pt-4 border-t border-indigo-200">
                            <p className="text-sm text-gray-600">
                                Đã chọn: <span className="font-bold text-indigo-600">{selectedProductIds.length}</span> sản phẩm.
                            </p>
                            <button
                                onClick={handleSaveAssignments}
                                disabled={isSavingAssignments || selectedPromotionId === null || selectedProductIds.length === 0}
                                className={`w-full mt-3 px-6 py-2 rounded-lg font-semibold shadow-md transition transform hover:scale-[1.02] ${
                                    (isSavingAssignments || selectedPromotionId === null || selectedProductIds.length === 0)
                                    ? "bg-indigo-300 text-gray-600 cursor-not-allowed shadow-none hover:scale-100" 
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                }`}
                            >
                                {isSavingAssignments ? "Đang Lưu..." : "Lưu Gán Khuyến mãi"}
                            </button>
                        </div>
                    </div>
                    
                    {/* CỘT 2 & 3: CHỌN SẢN PHẨM (Dùng CheckboxList) */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">
                            Bước 2: Chọn Sản phẩm để GÁN/HỦY GÁN
                        </h3>
                        <CheckboxList
                            name="product_id" 
                            label={`Danh sách Sản phẩm (${productAssignments.length})`}
                            options={productOptions}
                            selectedValues={productCheckboxValue}
                            onChange={handleProductCheckboxChange}
                            error={productAssignments.length === 0 ? "⚠️ Không có sản phẩm nào được tải." : undefined}
                        />
                       <p className="text-xs text-gray-500 mt-2 italic">
                            Chọn **"--- TẤT CẢ SẢN PHẨM ---"** để thao tác với toàn bộ danh sách sản phẩm.
                        </p>
                    </div>
                </div>

                <hr className="my-10 border-gray-200" />
                
                {/* 3. BẢNG LIỆT KÊ TÌNH TRẠNG GÁN HIỆN TẠI (ĐÃ CẢI TIẾN CSS) */}
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center mt-10">
                    Tình trạng Gán Khuyến mãi của Sản phẩm
                </h2>
                <div className="overflow-x-auto max-h-[400px] border border-gray-100 rounded-lg shadow-inner"> {/* Thêm shadow-inner để trông cao cấp hơn */}
                    {/* 👇 ĐÃ SỬA: Đưa <thead> lên cùng dòng với <table> */}
                    <table className="w-full border-collapse bg-white modern-table"><thead> 
                        <tr className="bg-gray-50 text-gray-600 text-sm font-medium uppercase sticky top-0 z-10 border-b border-gray-200"> {/* Header nhẹ nhàng hơn */}
                            <th className="px-5 py-3 text-left w-[120px]">ID Sản phẩm</th> {/* Tăng padding */}
                            <th className="px-5 py-3 text-left">Tên Sản phẩm</th>
                            <th className="px-5 py-3 text-left w-1/3">Khuyến mãi hiện tại</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productAssignments.map((assignment, idx) => (
                            <tr key={assignment.productId} className={`border-b border-gray-100 transition hover:bg-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}> {/* Hover tinh tế, border mỏng */}
                                <td className="px-5 py-3 text-sm font-mono text-gray-600">{assignment.productId}</td>
                                <td className="px-5 py-3 font-semibold text-gray-800">
                                    {assignment.product?.name || `Product ID ${assignment.productId} (Không tên)`} 
                                </td>
                                <td className="px-5 py-3 text-sm">
                                    {assignment.promotionId
                                        ? <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                                            {promotions.find(p => p.id === assignment.promotionId)?.name || `ID: ${assignment.promotionId}`}
                                          </span>
                                        : <span className="text-gray-500 italic text-xs">Chưa áp dụng</span>
                                    }
                                </td>
                            </tr>
                        ))}
                        {productAssignments.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-4 text-red-500 font-medium">
                                    ⚠️ Không có sản phẩm nào được tải.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    </table> {/* Thẻ </table> đóng lại */}
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