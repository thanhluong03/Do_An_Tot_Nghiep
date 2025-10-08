// src/components/adminImportProduct/ProductTable.tsx

import React from 'react';
import { Product } from "@/api/services/importProductsService"; // Thay đổi import source

interface ProductsTableProps {
    products: Product[];
    getCategoryName: (product: Product) => string;
    startIndex: number; // Chỉ số bắt đầu để hiển thị ID (số thứ tự)
}

// Hàm convert Buffer → Base64
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
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-gray-100 text-gray-700">
                        <th className="p-3 text-left font-semibold border-b">STT</th>
                        <th className="p-3 text-left font-semibold border-b">Ảnh</th>
                        <th className="p-3 text-left font-semibold border-b">Tên</th>
                        <th className="p-3 text-left font-semibold border-b">Giá</th>
                        {/* CỘT SỐ LƯỢNG TỒN KHO */}
                        <th className="p-3 text-right font-semibold border-b text-green-700">Tồn kho</th>
                        {/* KẾT THÚC CỘT SỐ LƯỢNG */}
                        <th className="p-3 text-left font-semibold border-b">Danh mục</th>
                 
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center p-6 text-gray-500 italic bg-gray-50">
                                Không có sản phẩm nào
                            </td>
                        </tr>
                    ) : (
                        products.map((p, index) => {

                            const serialNumber = startIndex + index + 1;

                            let mainImage: string | null = null;
                            const firstImage = p.images?.[0];

                            // Logic tải ảnh (giữ nguyên)
                            if (p.main_image && typeof p.main_image === 'string') {
                                mainImage = p.main_image;
                            }
                            else if (firstImage?.url && typeof firstImage.url === 'string') {
                                mainImage = firstImage.url;
                            }
                            else if (firstImage?.image_data) {
                                const imageData = firstImage.image_data;
                                
                                if (typeof imageData === 'object' && imageData !== null && 
                                    'data' in imageData && Array.isArray(imageData.data)) {
                                    
                                    mainImage = bufferToBase64(imageData as { data: number[] });
                                } 
                                else if (typeof imageData === 'string') {
                                    mainImage = `data:image/png;base64,${imageData}`;
                                }
                                if (!mainImage) {
                                     console.error("Invalid image data format for product ID:", p.id, imageData);
                                }
                            }

                            if (!mainImage || typeof mainImage !== 'string') {
                                mainImage = "https://placehold.co/100x100/9ca3af/ffffff?text=No+Image"; 
                            }


                            return (
                                <tr key={p.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="p-3 border-b text-gray-800">{serialNumber}</td>
                                    <td className="p-3 border-b">
                                        <img
                                            src={mainImage}
                                            alt={p.name}
                                            className="w-14 h-14 object-cover rounded border"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).onerror = null; 
                                                (e.target as HTMLImageElement).src = "https://placehold.co/100x100/9ca3af/ffffff?text=Error";
                                            }}
                                        />
                                    </td>
                                    <td className="p-3 border-b text-gray-800 font-medium">{p.name}</td>
                                    <td className="p-3 border-b text-gray-700">{p.price.toLocaleString()} ₫</td>
                                    
                                    {/* HIỂN THỊ SỐ LƯỢNG TỒN KHO */}
                                    <td className="p-3 border-b text-right font-bold text-lg text-green-700">
                                        {Number(p.quantity).toLocaleString() || 0}
                                    </td>
                                    {/* KẾT THÚC HIỂN THỊ SỐ LƯỢNG */}

                                    <td className="p-3 border-b text-gray-600">{getCategoryName(p)}</td>
                                    
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}