"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    updateImportRequest,
    getImportRequestDetail,
    ImportRequest,
    ImportRequestDetail,
    CreateImportRequestDto
} from "@/api/services/importRequestService";
import { getProductDetail } from "@/api/services/productApi";
import { Product } from "@/api/services/inventoryService";
import { getProductImageUrl } from "@/api/services/inventoryService";
import toast from "react-hot-toast";

// 🌟 INTERFACE MỚI: Thêm thông tin Product vào Detail
interface AugmentedImportRequestDetail extends ImportRequestDetail {
    product_image_url?: string;
    variant_name?: string;
    product_data?: Product; // Lưu trữ data product để tiện tham chiếu
    stock_quantity?: number; // THÊM: Lưu trữ số lượng tồn kho của biến thể/sản phẩm
}

export default function ModalEditImportRequest({
    open,
    onClose,
    request,
    mode = "edit"
}: {
    open: boolean;
    onClose: () => void;
    request: ImportRequest | null;
    mode?: "view" | "edit";
}) {
    const [note, setNote] = useState("");
    const [details, setDetails] = useState<AugmentedImportRequestDetail[]>([]);
    const [loading, setLoading] = useState(false);

    // 🌟 LOAD DETAIL VÀ AUGMENT DATA
    const loadDetails = useCallback(async () => {
        if (!request) return;
        setLoading(true);

        try {
            const rawDetails = await getImportRequestDetail(request.id);

            const augmentedDetails: AugmentedImportRequestDetail[] = await Promise.all(
                rawDetails.map(async (d) => {
                    let productData: Product | undefined;
                    let imageUrl = "/no-image.jpg";
                    let variantName = "Không phân loại";
                    let stockQuantity = 0;

                    try {
                        productData = await getProductDetail(d.product_id);

                        if (productData) {
                            console.log("Product data loaded:", productData);
                            imageUrl = getProductImageUrl(productData);
                            stockQuantity = productData.total_quantity_divided || 0;

                            // Lấy tên biến thể và tồn kho chi tiết nếu có
                            if (d.classification_attribute_relationship_id) {
                                // Đảm bảo relationships tồn tại và là mảng
                                const relationships = productData.relationships;
                                if (Array.isArray(relationships)) {
                                    const rel = relationships.find(
                                        r => r.id === d.classification_attribute_relationship_id
                                    );

                                    if (rel) {
                                        // Tinh gọn logic lấy tên biến thể
                                        const attr1 = rel.attribute1_name ? rel.attribute1_name.trim() : "";
                                        const attr2 = rel.attribute2_name ? rel.attribute2_name.trim() : "";

                                        if (attr1 && attr2) {
                                            variantName = `${attr1} | ${attr2}`;
                                        } else if (attr1) {
                                            variantName = attr1; // Chỉ có 1 thuộc tính
                                        } else {
                                            variantName = "Không phân loại (Thiếu tên thuộc tính)";
                                        }

                                        stockQuantity = rel.quantity || 0; // Lấy tồn kho chi tiết
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error(`Lỗi load product ID ${d.product_id}`, e);
                    }

                    return {
                        ...d,
                        product_name: productData?.name || d.product_name || `Sản phẩm ID: ${d.product_id}`,
                        product_image_url: imageUrl,
                        variant_name: variantName,
                        product_data: productData,
                        stock_quantity: stockQuantity
                    };
                })
            );

            setDetails(augmentedDetails);
        } catch (e) {
            console.error(e);
            toast.error("Không tải được chi tiết yêu cầu");
        }

        setLoading(false);
    }, [request]);

    useEffect(() => {
        if (!request || !open) return;
        setNote(request.note || "");
        loadDetails();
    }, [request, open, loadDetails]);

    const handleQuantityChange = (detailId: number | undefined, quantity: number) => {
        if (!detailId) return;
        setDetails(prev =>
            prev.map(d => d.id === detailId ? { ...d, requested_quantity: Math.max(quantity, 0) } : d)
        );
    };

    const handleSave = async () => {
        if (!request) return;

        const validDetails = details.filter(d => d.requested_quantity > 0);
        if (validDetails.length === 0) {
            return toast.error("Yêu cầu cần có ít nhất một sản phẩm với số lượng > 0");
        }

        // 🌟 VALIDATE SỐ LƯỢNG KHÔNG VƯỢT QUÁ TỒN KHO TỔNG
        for (const detail of validDetails) {
            if (detail.requested_quantity > (detail.stock_quantity ?? 0)) {
                const productName = detail.product_data?.name || detail.product_name;
                const variantDisplay = detail.variant_name && detail.variant_name !== "Không phân loại" ? ` (${detail.variant_name})` : '';
                const stock = (detail.stock_quantity ?? 0).toLocaleString("vi-VN");

                return toast.error(`Số lượng yêu cầu cho sản phẩm "${productName}${variantDisplay}" (${detail.requested_quantity}) không được lớn hơn tồn kho (${stock}).`);
            }
        }


        const payload: Partial<CreateImportRequestDto> = {
            note,
            importRequestDetails: validDetails.map(d => ({
                product_id: d.product_id,
                classification_attribute_relationship_id: d.classification_attribute_relationship_id,
                requested_quantity: d.requested_quantity
            }))
        };

        try {
            await updateImportRequest(request.id, payload);
            toast.success("Cập nhật thành công!");
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Cập nhật thất bại!");
        }
    };

    if (!open || !request) return null;

    const isEditable = request.import_request_status === "PENDING" && mode === "edit";
    const statusText = isEditable ? "Đang chờ" : "Đã chấp nhận/Hoàn tất";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-xl animate-fadeIn">
                <h2 className="text-xl font-bold mb-2">
                    {mode === "view" ? "Chi tiết" : "Chỉnh sửa"} yêu cầu #{request.id}
                </h2>
                <p className={`text-sm mb-4 font-medium ${isEditable ? 'text-orange-500' : 'text-green-600'}`}>
                    Trạng thái: {statusText}
                </p>

                {/* NOTE */}
                <label className="block text-gray-700 font-semibold mb-2">Ghi chú</label>
                <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={!isEditable}
                />

                {/* DETAILS */}
                <div className="border border-gray-200 rounded-lg p-3 max-h-80 overflow-y-auto bg-gray-50">
                    <label className="block text-gray-700 font-semibold mb-2">Chi tiết sản phẩm</label>

                    {/* Header cố định cho danh sách chi tiết */}
                    <div className="sticky top-0 z-10 bg-gray-100 p-2 rounded-t-lg flex items-center justify-between text-xs font-bold text-gray-700 border-b border-gray-200 mb-2">
                        <span className="w-1/2">Sản phẩm / Phân loại</span>
                        <span className="w-1/4 text-center">Tồn kho</span>
                        <span className="w-1/4 text-right pr-2">SL Yêu cầu</span>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-500 py-4">Đang tải...</p>
                    ) : details.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Không có chi tiết sản phẩm</p>
                    ) : (
                        details.map(d => (
                            <div
                                key={d.id || `${d.product_id}-${d.classification_attribute_relationship_id}`}
                                className="border-b border-gray-200 py-2 flex items-center gap-3 last:border-b-0 bg-white p-2 rounded-lg mb-2 shadow-sm"
                            >
                                <img
                                    src={d.product_image_url || "/no-image.jpg"}
                                    alt={d.product_name}
                                    className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                                />
                                <div className="flex-grow min-w-0 w-1/2">
                                    <span className="font-medium truncate block text-sm">
                                        {d.product_data?.name || d.product_name}
                                    </span>

                                    {d.variant_name && d.variant_name !== "Không phân loại" && (
                                        <span className="text-xs text-gray-500 block truncate italic">
                                            ({d.variant_name})
                                        </span>
                                    )}
                                </div>

                                {/* TỒN KHO */}
                                <div className="w-1/4 text-center flex-shrink-0">
                                    <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${(d.stock_quantity ?? 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {(d.stock_quantity ?? 0).toLocaleString("vi-VN")}
                                    </span>
                                </div>

                                {/* SỐ LƯỢNG YÊU CẦU */}
                                <div className="w-1/4 flex-shrink-0 text-right">
                                    <input 
                                        type="number"
                                        min={0}
                                        value={d.requested_quantity}
                                        onChange={e => handleQuantityChange(d.id, Number(e.target.value))}
                                        className="border border-gray-300 rounded-lg px-2 py-1 w-20 text-right text-sm focus:ring-blue-500 focus:border-blue-500"
                                        disabled={!isEditable}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 mt-6">
                    <button className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition" onClick={onClose}>
                        {mode === "view" ? "Đóng" : "Hủy"}
                    </button>
                    {isEditable && (
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                            onClick={handleSave}
                            disabled={!isEditable}
                        >
                            Lưu
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}