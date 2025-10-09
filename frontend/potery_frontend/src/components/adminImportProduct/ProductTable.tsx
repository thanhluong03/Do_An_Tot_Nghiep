// src/components/adminImportProduct/ProductTable.tsx
import React from "react";
import { Product } from "@/api/services/importProductsService";

interface ProductsTableProps {
    products: Product[];
    getCategoryName: (product: Product) => string;
    startIndex: number;
}

// Convert Buffer → Base64
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

export default function ProductsTable({
    products,
    getCategoryName,
    startIndex,
}: ProductsTableProps) {
    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
            <table className="min-w-full text-sm text-gray-800">
                {/* --- HEADER --- */}
                <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs uppercase tracking-wider">
                        <th className="p-4 text-left font-semibold w-[60px]">#</th>
                        <th className="p-4 text-left font-semibold w-[100px]">Ảnh</th>
                        <th className="p-4 text-left font-semibold min-w-[200px]">Tên sản phẩm</th>
                        <th className="p-4 text-left font-semibold min-w-[100px]">Giá</th>
                        <th className="p-4 text-right font-semibold min-w-[120px] text-green-700">Tồn kho</th>
                        <th className="p-4 text-left font-semibold min-w-[160px]">Danh mục</th>
                    </tr>
                </thead>

                {/* --- BODY --- */}
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className="text-center py-10 text-gray-500 italic bg-gray-50"
                            >
                                Không có sản phẩm nào
                            </td>
                        </tr>
                    ) : (
                        products.map((p, index) => {
                            const serialNumber = startIndex + index + 1;

                            // Lấy ảnh
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
                                    <td className="p-4 font-medium text-gray-900">{p.name}</td>
                                    <td className="p-4 text-gray-700">
                                        {p.price?.toLocaleString("vi-VN") ?? 0} ₫
                                    </td>

                                    {/* --- CỘT TỒN KHO --- */}
                                    <td className="p-4 text-right">
                                        <span
                                            className={`inline-block px-3 py-1 text-sm font-semibold rounded-full 
                                            ${
                                                p.quantity > 50
                                                    ? "bg-green-100 text-green-700"
                                                    : p.quantity > 10
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {p.quantity?.toLocaleString("vi-VN") ?? 0}
                                        </span>
                                    </td>

                                    <td className="p-4 text-gray-600">{getCategoryName(p)}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
