import { Product } from "@/api/services/productApi";
import { ChevronDown, Eye, Pencil, Trash2 } from "lucide-react";
import React from "react";
import { useState } from "react";

interface ProductsTableProps {
    products: Product[];
    getSupplierName: (product: Product) => string;
    getCategoryName: (product: Product) => string;
    openEditModal: (product: Product) => void;
    handleDelete: (id: number) => void;
    startIndex: number;
}

// Hàm chuyển Buffer → Base64
const bufferToBase64 = (buffer: { data: number[] }): string | null => {
    try {
        const binary = new Uint8Array(buffer.data).reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
        );
        return `data:image/png;base64,${btoa(binary)}`;
    } catch (error) {
        console.error("Error converting buffer:", error);
        return null;
    }
};

// Badge trạng thái
const getStatusBadge = (quantity: number | undefined | null) => {
    const qty = quantity ?? 0;

    if (qty === 0)
        return (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Hết hàng
            </span>
        );
    if (qty < 10)
        return (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Ít hàng
            </span>
        );
    return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Còn hàng
        </span>
    );
};

export default function ProductsTable({
    products,
    getSupplierName,
    getCategoryName,
    openEditModal,
    handleDelete,
    startIndex,
}: ProductsTableProps) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
            <table className="min-w-full text-sm text-gray-800">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs uppercase tracking-wider">
                        <th className="p-4 text-left font-semibold">STT</th>
                        <th className="p-4 text-left font-semibold">Ảnh</th>
                        <th className="p-4 text-left font-semibold">Tên sản phẩm</th>
                        <th className="p-4 text-left font-semibold">Số lượng</th>
                        <th className="p-4 text-left font-semibold">Trạng thái</th>
                        <th className="p-4 text-left font-semibold">Danh mục</th>
                        <th className="p-4 text-left font-semibold">Nhà cung cấp</th>
                        <th className="p-4 text-left font-semibold">Thời gian tạo</th>
                        <th className="p-4 text-center font-semibold">Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td
                                colSpan={9}
                                className="text-center p-10 text-gray-500 italic bg-gray-50"
                            >
                                Không có sản phẩm nào
                            </td>
                        </tr>
                    ) : (
                        products.map((p, index) => {
                            const serialNumber = startIndex + index + 1;
                            let mainImage: string | null = null;
                            const firstImage = p.images?.[0];

                            if (p.main_image && typeof p.main_image === "string") {
                                mainImage = p.main_image;
                            } else if (firstImage?.url && typeof firstImage.url === "string") {
                                mainImage = firstImage.url;
                            } else if (firstImage?.image_data) {
                                const imageData = firstImage.image_data;
                                if (
                                    typeof imageData === "object" &&
                                    imageData !== null &&
                                    "data" in imageData &&
                                    Array.isArray(imageData.data)
                                ) {
                                    mainImage = bufferToBase64(imageData as { data: number[] });
                                } else if (typeof imageData === "string") {
                                    mainImage = `data:image/png;base64,${imageData}`;
                                }
                            }

                            if (!mainImage) {
                                mainImage =
                                    "https://placehold.co/100x100/9ca3af/ffffff?text=No+Image";
                            }

                            return (
                                <React.Fragment key={p.id ?? index}>
                                    <tr
                                        key={p.id}
                                        className="hover:bg-gray-50 transition-all duration-150 border-b border-gray-100"
                                    >
                                        <td className="p-4 text-gray-700">{serialNumber}</td>
                                        <td className="p-4">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                <img
                                                    src={mainImage}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            "https://placehold.co/100x100/9ca3af/ffffff?text=Error";
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 max-w-[300px] break-words" title={p.name}>{p.name}</td>
                                        <td className="p-4 text-gray-700">
                                            {p.quantity ?? "N/A"}
                                        </td>
                                        <td className="p-4 text-left">{getStatusBadge(p.quantity)}</td>
                                        <td className="p-4 text-gray-600">{getCategoryName(p)}</td>
                                        <td className="p-4 text-gray-600">{getSupplierName(p)}</td>
                                        <td className="p-4 text-gray-600">
                                            {p.created_at
                                                ? new Date(p.created_at).toLocaleDateString("vi-VN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })
                                                : "N/A"}
                                        </td>
                                        <td className="p-4 text-center space-x-2">
                                            <button
                                                title="Chi tiết"
                                                onClick={() =>
                                                    setExpandedRow(expandedRow === p.id ? null : (p.id ?? null))
                                                }
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                                            >
                                                <ChevronDown size={10} />
                                                {expandedRow === p.id ? "Ẩn" : <Eye size={14} />}
                                            </button>

                                            <button
                                                title="Sửa"
                                                onClick={() => openEditModal(p)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                                            >
                                                <Pencil size={10} />
                                            </button>
                                            <button
                                                title="Xóa"
                                                onClick={() => handleDelete(p.id!)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Dòng mở rộng chi tiết */}
                                    {expandedRow === p.id && (
                                        <tr className="bg-white border-t border-gray-200">
                                            <td colSpan={9} className="p-6">
                                                {p.classifications && p.classifications.length > 0 ? (
                                                    <div className="flex flex-col gap-2 border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm">
                                                        <h4 className="font-semibold text-lg text-gray-800 text-center border-gray-200 pb-2">
                                                            Phân loại & Giá bán
                                                        </h4>

                                                        {/* Chia bố cục thành 2 phần: trái/phải */}
                                                        <div className="flex flex-col md:flex-row justify-center gap-6">

                                                            {/* 🔹 Cột trái: Danh sách phân loại */}
                                                            <div className="flex-1 max-w-[500px] bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                                                <h5 className="font-semibold text-gray-700 mb-3 text-base text-center">
                                                                    Phân loại sản phẩm
                                                                </h5>
                                                                <div className="flex flex-col gap-3">
                                                                    {p.classifications.map((c, ci) => (
                                                                        <div
                                                                            key={ci}
                                                                            className="border border-gray-100 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
                                                                        >
                                                                            <p className="font-medium text-gray-700 mb-2">{c.name}</p>
                                                                            <div className="flex flex-wrap gap-2 justify-center">
                                                                                {c.attributes.map((a, ai) => (
                                                                                    <span
                                                                                        key={ai}
                                                                                        className="px-3 py-1 text-sm rounded-lg bg-orange-50 border border-orange-200 text-orange-700 font-medium"
                                                                                    >
                                                                                        {a.name}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* 🔹 Cột phải: Bảng giá & số lượng */}
                                                            {p.relationships && p.relationships.length > 0 && (
                                                                <div className="flex-1 max-w-[600px] bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                                                    <h5 className="text-base font-semibold text-gray-700 mb-3 text-center">
                                                                        Chi tiết giá & số lượng
                                                                    </h5>
                                                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                                                        <table className="w-full text-sm text-gray-700">
                                                                            <thead className="bg-orange-100 text-gray-800 font-semibold uppercase text-xs">
                                                                                <tr>
                                                                                    <th className="px-4 py-2 border border-gray-200 text-left">Phân loại 1</th>
                                                                                    <th className="px-4 py-2 border border-gray-200 text-left">Phân loại 2</th>
                                                                                    <th className="px-4 py-2 border border-gray-200 text-right">Giá (₫)</th>
                                                                                    <th className="px-4 py-2 border border-gray-200 text-right">Số lượng</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {p.relationships.map((rel, ri) => {
                                                                                    const attr1 =
                                                                                        p.classifications?.[0]?.attributes.find(
                                                                                            (a) => a.id === rel.product_attribute_id_1
                                                                                        )?.name ?? "-";
                                                                                    const attr2 =
                                                                                        p.classifications?.[1]?.attributes.find(
                                                                                            (a) => a.id === rel.product_attribute_id_2
                                                                                        )?.name ?? "-";
                                                                                    const price = Number(rel.price || 0).toLocaleString("vi-VN");
                                                                                    const qty = rel.quantity ?? 0;
                                                                                    return (
                                                                                        <tr key={ri} className="hover:bg-orange-50 transition">
                                                                                            <td className="border border-gray-200 px-4 py-2">{attr1}</td>
                                                                                            <td className="border border-gray-200 px-4 py-2">{attr2}</td>
                                                                                            <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-800">
                                                                                                {price}
                                                                                            </td>
                                                                                            <td className="border border-gray-200 px-4 py-2 text-right text-gray-800">
                                                                                                {qty}
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                })}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic text-center">
                                                        Không có phân loại cho sản phẩm này
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    )}


                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
