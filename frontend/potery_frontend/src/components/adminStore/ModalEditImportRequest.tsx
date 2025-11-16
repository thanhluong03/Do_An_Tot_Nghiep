"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { X, Save, Eye, Edit } from "lucide-react";
import {
  ImportRequest,
  updateImportRequest,
  getImportRequestDetail,
  // ImportRequestDetail, // Không cần thiết
  CreateImportRequestDto,
} from "@/api/services/importRequestService";
import { getProductImageUrl, ProductRelationship } from "@/api/services/inventoryService";
import { getProducts } from "@/api/services/productApi"; // Giả sử đã có

// Thêm vào trước export default function ModalEditImportRequest

interface StatusInfo {
  name: string;
  className: string;
}

const getVietnameseStatusInfo = (status: string): StatusInfo => {
  switch (status) {
    case "PENDING":
      return {
        name: "Đang Chờ Xử Lý",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300"
      };
    case "ACCEPTED":
      return {
        name: "Đã Chấp Nhận",
        className: "bg-blue-100 text-blue-800 border-blue-300"
      };
    default:
      return {
        name: status,
        className: "bg-gray-200 text-gray-700"
      };
  }
};
interface ClassificationAttributeRelationship {
  id: number;
  attribute1_name: string; // Tên thuộc tính 1
  attribute2_name?: string; // Tên thuộc tính 2
  quantity: number; // Tồn kho hiện tại của biến thể
  price: string;
}

interface Product {
  id: number;
  name: string;
  total_quantity_divided: number;
  price: string;
  relationships?: ClassificationAttributeRelationship[];
  // Cần có trường image để getProductImageUrl hoạt động
  image?: { url: string; }; 
}

// --- PROPS CỦA MODAL ---

interface ModalProps {
  open: boolean;
  onClose: () => void;
  request: ImportRequest | null;
  mode: "view" | "edit";
}
interface SelectedProductDetail {
  id?: number; // ID của ImportRequestDetail (để update)
  product_id: number;
  classification_attribute_relationship_id?: number | null;
  requested_quantity: number;
  // Thêm các trường hiển thị để dễ dùng
  productName: string;
  variantName: string;
  currentStock: number;
  price: string;
}

// --- COMPONENT MODAL ---

export default function ModalEditImportRequest({
  open,
  onClose,
  request,
  mode: initialMode,
}: ModalProps) {
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState(request?.note || "");
  const [details, setDetails] = useState<SelectedProductDetail[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  // Cập nhật mode khi prop initialMode thay đổi (từ list)
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Load chi tiết yêu cầu và danh sách sản phẩm
  const loadRequestData = useCallback(async () => {
    if (!request || !open) {
      setLocalLoading(false);
      return;
    }

    setIsLoading(true);
    setLocalLoading(true);

    try {
      // 1. Lấy danh sách sản phẩm (để có thông tin tồn kho, tên, biến thể)
      // Cần cast Product[] sang any[] hoặc chỉnh lại kiểu trả về của getProducts nếu cần.
      const productsRes: Product[] = await getProducts();
      setAllProducts(productsRes);

      // 2. Lấy chi tiết yêu cầu nhập hàng
      const detailsRes = await getImportRequestDetail(request.id);

      // 3. Chuẩn hóa dữ liệu chi tiết
      const initialDetails: SelectedProductDetail[] = detailsRes.map((d) => {
        const product = productsRes.find((p) => p.id === d.product_id);
        if (!product) {
          // Xử lý trường hợp sản phẩm không tồn tại (nên hiển thị lỗi hoặc bỏ qua)
          return {
            id: d.id,
            product_id: d.product_id,
            requested_quantity: d.requested_quantity,
            productName: `Product ID: ${d.product_id} (Not found)`,
            variantName: "N/A",
            currentStock: 0,
            price: "0",
          } as SelectedProductDetail;
        }

        let variantName = "Không phân loại";
        let currentStock = product.total_quantity_divided || 0;
        let price = product.price;

        if (d.classification_attribute_relationship_id) {
          const rel = product.relationships?.find(
            (r) => r.id === d.classification_attribute_relationship_id
          );
          if (rel) {
            currentStock = rel.quantity || 0;
            price = rel.price;
            const attr1 = rel.attribute1_name ? rel.attribute1_name.trim() : "";
            const attr2 = rel.attribute2_name ? rel.attribute2_name.trim() : "";
            if (attr1 && attr2) variantName = `${attr1} | ${attr2}`;
            else if (attr1) variantName = attr1;
          }
        }

        return {
          id: d.id,
          product_id: d.product_id,
          classification_attribute_relationship_id: d.classification_attribute_relationship_id,
          requested_quantity: d.requested_quantity,
          productName: product.name,
          variantName,
          currentStock,
          price,
        };
      });

      setDetails(initialDetails);
      setNote(request.note || "");
    } catch (error) {
      console.error("Lỗi khi tải chi tiết yêu cầu:", error);
      toast.error("Không tải được chi tiết yêu cầu.");
    } finally {
      setIsLoading(false);
      setLocalLoading(false);
    }
  }, [request, open]);

  useEffect(() => {
    loadRequestData();
  }, [loadRequestData]);

  // Handle thay đổi số lượng
  const handleQuantityChange = (
    detailId: number | undefined,
    productId: number,
    classificationId: number | null | undefined,
    quantity: number
  ) => {
    setDetails((prev) =>
      prev.map((d) =>
        d.product_id === productId &&
          d.classification_attribute_relationship_id === classificationId
          ? { ...d, requested_quantity: Math.max(quantity, 0) }
          : d
      )
    );
  };

  // Handle submit cập nhật
  const handleUpdate = async () => {
    if (!request) return;

    const validDetails = details.filter((d) => d.requested_quantity > 0);

    if (validDetails.length === 0) {
      return toast.error("Phải có ít nhất một sản phẩm với số lượng lớn hơn 0.");
    }

    // Kiểm tra số lượng có vượt quá tồn kho hiện tại (giống logic Create)
    for (const selection of validDetails) {
      const product = allProducts.find((p) => p.id === selection.product_id);
      if (!product) continue; // Bỏ qua nếu không tìm thấy SP

      // Kiểm tra tồn kho
      if (selection.requested_quantity > selection.currentStock) {
        const displayVariant = selection.variantName !== "Không phân loại" ? ` (${selection.variantName})` : '';
        return toast.error(
          `SL yêu cầu cho "${product.name}${displayVariant}" (${selection.requested_quantity}) không được lớn hơn tồn kho hiện tại (${selection.currentStock.toLocaleString("vi-VN")}).`
        );
      }
    }

    const payload: Partial<CreateImportRequestDto> = {
      note,
      importRequestDetails: validDetails.map((d) => ({
        product_id: d.product_id,
        classification_attribute_relationship_id: d.classification_attribute_relationship_id || undefined,
        requested_quantity: d.requested_quantity,
      })),
    };

    setIsLoading(true);
    try {
      await updateImportRequest(request.id, payload);
      toast.success("Cập nhật yêu cầu thành công!");
      onClose(); // Đóng và reload data list
    } catch (err) {
      toast.error("Lỗi khi cập nhật yêu cầu.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---

  if (!open || !request) return null;

  const isPending = request.import_request_status === "PENDING";
  const isViewMode = mode === "view";
  const canEdit = isPending && mode === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity" // Nền tối hơn, mềm hơn
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-fit max-h-[90vh] overflow-y-auto transform transition-all" // Shadow 2xl, rounded-xl
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100"> {/* p-6, border-b nhẹ hơn */}
          <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3"> {/* font-extrabold, gap-3 */}
            {isViewMode ? <Eye size={24} className="text-blue-600"/> : <Edit size={24} className="text-yellow-600"/>}
            {isViewMode ? "Chi Tiết Yêu Cầu" : "Sửa Yêu Cầu Nhập"} #{request.id}
          </h3>
          <button
            title="load"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition p-1 rounded-full hover:bg-gray-100"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {localLoading ? (
            <p className="text-center py-10 text-gray-500 font-medium">Đang tải chi tiết...</p>
          ) : (
            <>
              {/* Thông tin chung */}
              <div className="mb-8 pb-4"> {/* mb-8 */}
                <p className="text-xl font-bold text-blue-700 mb-2">
                  Chi nhánh: {request.store?.store_name || "N/A"}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-3"> {/* gap-3 */}
                  Trạng thái:{" "}
                  {(() => {
                    const statusInfo = getVietnameseStatusInfo(request.import_request_status);
                    return (
                      <span
                        className={`font-semibold px-3 py-1 rounded-full text-xs transition ${statusInfo.className}`}
                      >
                        {statusInfo.name}
                      </span>
                    );
                  })()}
                </p>
                <div className="mt-5"> {/* mt-5 */}
                  <label className="font-bold text-gray-700 block mb-2">Ghi chú (Nội bộ)</label>
                  {isViewMode || !canEdit ? (
                    <p className="p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg whitespace-pre-wrap min-h-[100px] shadow-inner text-sm">
                      {note || "(Không có ghi chú)"}
                    </p>
                  ) : (
                    <textarea
                      title="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-blue-500 focus:border-blue-500 transition shadow-sm outline-none"
                      rows={4}
                      disabled={!canEdit}
                    />
                  )}
                </div>
              </div>

              {/* Chi tiết Sản phẩm */}
              <h4 className="text-xl font-bold mb-5 text-gray-800 border-l-4 border-orange-500 pl-3">Danh Sách Sản Phẩm Yêu Cầu ({details.length})</h4>
              <div className="space-y-4 max-h-full overflow-y-auto pr-2"> {/* max-h nhỏ hơn */}
                {details.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 border rounded-lg bg-white shadow-sm">
                    Yêu cầu này không có sản phẩm nào.
                  </p>
                ) : (
                  details.map((d) => {
                    // 1. TÌM SẢN PHẨM GỐC VÀ LẤY URL ẢNH
                    // Sử dụng find để lấy đối tượng Product đầy đủ
                    const product = allProducts.find((p) => p.id === d.product_id);
                    // Sử dụng getProductImageUrl (giả định là hàm import từ inventoryService)
                    // Cần cast product sang 'any' nếu Product interface trong file này không đầy đủ các trường mà getProductImageUrl yêu cầu (như `image`)
                    const imageUrl = product ? getProductImageUrl(product as any) : "/placeholder-image.jpg";

                    return (
                      <div
                        key={`${d.product_id}-${d.classification_attribute_relationship_id || "none"}`}
                        className="p-5 border border-gray-200 rounded-xl bg-white shadow-md hover:shadow-lg transition duration-300 flex justify-between items-start gap-4" // Đã thay đổi: items-start, thêm gap-4
                      >
                        {/* 🎯 ẢNH SẢN PHẨM */}
                        <img
                          src={imageUrl}
                          alt={d.productName}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-100 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).onerror = null;
                            (e.target as HTMLImageElement).src = "/placeholder-image.jpg"; // Fallback nếu ảnh lỗi
                          }}
                        />

                        {/* Product Info (flex-1 để chiếm không gian còn lại) */}
                        <div className="flex-1 min-w-0 pr-6"> {/* pr-6 */}
                          <p className="font-extrabold text-lg text-gray-900 truncate mb-1" title={d.productName}>
                            {d.productName}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium text-gray-500">Phân loại:</span> <span className="text-gray-800 italic">{d.variantName}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Tồn kho hiện tại:{" "}
                            <span className="text-red-600 font-extrabold text-sm">{d.currentStock.toLocaleString("vi-VN")}</span>
                          </p>
                        </div>

                        {/* Quantity Input */}
                        <div className="w-32 text-right flex-shrink-0">
                          <label className="text-xs text-gray-500 block mb-1 font-medium">SL Yêu cầu</label>
                          {isViewMode || !canEdit ? (
                            <span className="text-xl font-extrabold text-orange-600">
                              {d.requested_quantity.toLocaleString("vi-VN")}
                            </span>
                          ) : (
                            <input
                              title="requested quantity"
                              type="number"
                              min={0}
                              value={d.requested_quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  d.id,
                                  d.product_id,
                                  d.classification_attribute_relationship_id,
                                  Number(e.target.value)
                                )
                              }
                              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-right font-bold text-lg focus:ring-orange-500 focus:border-orange-500 transition shadow-inner" // Input đẹp hơn
                              disabled={!canEdit || isLoading}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-gray-100 flex justify-end gap-4 shadow-top"> {/* Footer cố định, bóng đổ */}
          {!isViewMode && isPending && (
            <button
              onClick={handleUpdate}
              disabled={isLoading || !canEdit || details.filter(d => d.requested_quantity > 0).length === 0}
              className="px-8 py-3 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition flex items-center gap-2 font-bold disabled:bg-gray-400 disabled:shadow-none" // Nút chính nổi bật
            >
              <Save size={18} />
              {isLoading ? "Đang Lưu..." : "Lưu Thay Đổi"}
            </button>
          )}

          {isViewMode && isPending && (
            <button
              onClick={() => setMode("edit")}
              className="px-8 py-3 bg-yellow-600 text-white rounded-xl shadow-lg shadow-yellow-200 hover:bg-yellow-700 transition flex items-center gap-2 font-bold" // Nút phụ nổi bật
            >
              <Edit size={18} />
              Chuyển sang Sửa
            </button>
          )}

          <button
            onClick={onClose}
            className={`px-8 py-3 rounded-xl transition font-bold shadow-md hover:shadow-lg ${isViewMode ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-red-500 text-white hover:bg-red-600"}`} // Nút đóng tinh tế
            disabled={isLoading}
          >
            {isViewMode ? "Đóng" : "Hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}