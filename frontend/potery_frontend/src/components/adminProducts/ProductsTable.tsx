import { Product } from "@/api/services/productApi";
import { Pencil, Trash2 } from "lucide-react";

interface ProductsTableProps {
    products: Product[];
    getSupplierName: (product: Product) => string;
    getCategoryName: (product: Product) => string;
    openEditModal: (product: Product) => void;
    handleDelete: (id: number) => void;
    startIndex: number;
}

// Hàm chuyển Buffer → Base64 (Giữ nguyên)
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

// Hàm mới: Xác định trạng thái và màu sắc
const getStatusBadge = (quantity: number | undefined | null) => {
    const qty = quantity ?? 0;
    
    if (qty === 0) {
        return (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Hết hàng
            </span>
        );
    } else if (qty < 10) {
        return (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Ít hàng
            </span>
        );
    } else {
        return (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Còn hàng
            </span>
        );
    }
};


export default function ProductsTable({
    products,
    getSupplierName,
    getCategoryName,
    openEditModal,
    handleDelete,
    startIndex,
}: ProductsTableProps) {
    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
            <table className="min-w-full text-sm text-gray-800">
                <thead><tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs uppercase tracking-wider">
                        <th className="p-4 text-left font-semibold">STT</th>
                        <th className="p-4 text-left font-semibold">Ảnh</th>
                        <th className="p-4 text-left font-semibold">Tên sản phẩm</th>
                        <th className="p-4 text-left font-semibold">Giá</th>
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
                                colSpan={8}
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

                            if (!mainImage || typeof mainImage !== "string") {
                                mainImage =
                                    "https://placehold.co/100x100/9ca3af/ffffff?text=No+Image";
                            }
                            // ... (End Logic xử lý ảnh)

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
                                        {p.price.toLocaleString("vi-VN")} ₫
                                    </td>
                                    <td className="p-4 text-gray-700">
                                        {p.quantity ?? 'N/A'}
                                    </td>
                                    <td className="p-4 text-left">
                                        {getStatusBadge(p.quantity)}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {getCategoryName(p)}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {getSupplierName(p)}
                                    </td>
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
                                            title="edt"
                                            onClick={() => openEditModal(p)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                                        >
                                            <Pencil size={14} />
                                            
                                        </button>
                                        <button
                                            title="del"
                                            onClick={() => handleDelete(p.id!)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                        >
                                            <Trash2 size={14} />
                                            
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}