import { Product } from "@/api/services/productApi";

interface ProductsTableProps {
    products: Product[];
    getSupplierName: (id: number) => string;
    getCategoryName: (product: Product) => string;
    openEditModal: (product: Product) => void;
    handleDelete: (id: number) => void;
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
    getSupplierName,
    getCategoryName,
    openEditModal,
    handleDelete,
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
                        <th className="p-3 text-left font-semibold border-b">Nhà cung cấp</th>
                        <th className="p-3 text-left font-semibold border-b">Danh mục</th>
                        <th className="p-3 text-center font-semibold border-b">Hành động</th>
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

                            // 1. Ưu tiên: main_image (nếu là URL)
                            if (p.main_image && typeof p.main_image === 'string') {
                                mainImage = p.main_image;
                            }
                            // 2. Tiếp theo: url trong mảng images
                            else if (firstImage?.url && typeof firstImage.url === 'string') {
                                mainImage = firstImage.url;
                            }
                            // 3. Cuối cùng: image_data (Buffer hoặc Base64 String)
                            else if (firstImage?.image_data) {
                                const imageData = firstImage.image_data;
                                
                                // Cập nhật logic kiểm tra: Đảm bảo nó là Buffer-like object HỢP LỆ
                                if (typeof imageData === 'object' && imageData !== null && 
                                    'data' in imageData && Array.isArray(imageData.data)) {
                                    
                                    // SỬ DỤNG HÀM bufferToBase64 ĐÃ ĐỊNH NGHĨA để chuyển đổi Buffer
                                    // Ép kiểu an toàn hơn nếu TypeScript cho phép
                                    mainImage = bufferToBase64(imageData as { data: number[] });
                                } 
                                // Nếu nó đã là một chuỗi Base64 thuần, thì chỉ cần gắn prefix
                                else if (typeof imageData === 'string') {
                                    // Giả định là Base64 string và thêm prefix
                                    mainImage = `data:image/png;base64,${imageData}`;
                                }
                                // Thêm console.error nếu image_data tồn tại nhưng không đúng định dạng
                                if (!mainImage) {
                                       console.error("Invalid image data format for product ID:", p.id, imageData);
                                }
                            }

                            // Thêm placeholder dự phòng an toàn
                            if (!mainImage || typeof mainImage !== 'string') {
                                mainImage = "https://placehold.co/100x100/9ca3af/ffffff?text=No+Image"; 
                            }


                            return (
                                <tr key={p.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="p-3 border-b text-gray-800">{serialNumber}</td>
                                    <td className="p-3 border-b">
                                        <img
                                            // Đảm bảo src luôn là một chuỗi hợp lệ
                                            src={mainImage}
                                            alt={p.name}
                                            className="w-14 h-14 object-cover rounded border"
                                            // Thêm onerror để đảm bảo placeholder nếu link/base64 bị lỗi
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).onerror = null; 
                                                // Thay thế bằng placeholder an toàn nếu ảnh không load được
                                                (e.target as HTMLImageElement).src = "https://placehold.co/100x100/9ca3af/ffffff?text=Error";
                                            }}
                                        />
                                    </td>
                                    <td className="p-3 border-b text-gray-800 font-medium">{p.name}</td>
                                    <td className="p-3 border-b text-gray-700">{p.price.toLocaleString()} ₫</td>
                                    <td className="p-3 border-b text-gray-600">{p.supplier_id ? getSupplierName(p.supplier_id) : 'N/A'}</td>
                                    <td className="p-3 border-b text-gray-600">{getCategoryName(p)}</td>
                                    <td className="p-3 border-b text-center space-x-2">
                                        <button
                                            onClick={() => openEditModal(p)}
                                            className="px-3 py-1 text-sm bg-yellow-400 text-black rounded hover:bg-yellow-500 transition duration-150 shadow-sm"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id!)}
                                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition duration-150 shadow-sm"
                                        >
                                            Xoá
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