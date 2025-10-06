// src/app/admin/products/ProductsTable.tsx

import { Product } from "@/api/services/productApi";

interface ProductsTableProps {
    products: Product[];
    getSupplierName: (id: number) => string;
    getCategoryName: (product: Product) => string;
    openEditModal: (product: Product) => void;
    handleDelete: (id: number) => void;
    startIndex: number; // Chỉ số bắt đầu để hiển thị ID (số thứ tự)
}

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
                            const mainImage = p.main_image || p.images?.[0]?.url || "https://via.placeholder.com/100";
                            const serialNumber = startIndex + index + 1; // Tính số thứ tự

                            return (
                                <tr key={p.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="p-3 border-b text-gray-800">{serialNumber}</td>
                                    <td className="p-3 border-b">
                                        <img src={mainImage} alt={p.name} className="w-14 h-14 object-cover rounded border" />
                                    </td>
                                    <td className="p-3 border-b text-gray-800 font-medium">{p.name}</td>
                                    <td className="p-3 border-b text-gray-700">{p.price.toLocaleString()} ₫</td>
                    
                                    <td className="p-3 border-b text-gray-600">{getSupplierName(p.supplier_id)}</td>
                                    <td className="p-3 border-b text-gray-600">
                                        {getCategoryName(p)}
                                    </td>
                                    <td className="p-3 border-b text-center space-x-2">
                                        <button onClick={() => openEditModal(p)} className="px-3 py-1 text-sm bg-yellow-400 text-black rounded hover:bg-yellow-500">Sửa</button>
                                        <button onClick={() => handleDelete(p.id!)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Xoá</button>
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