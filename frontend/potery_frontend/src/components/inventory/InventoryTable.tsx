// src/components/inventory/InventoryTable.tsx

import React from 'react';
import { Inventory, SelectOption } from "@/api/services/inventoryService"; // Import Types

interface InventoryTableProps {
    inventories: Inventory[];
    products: SelectOption[];
    stores: SelectOption[];
    getDisplayName: (list: SelectOption[], id: number | undefined) => string;
    handleEdit: (item: Inventory) => void;
    handleDelete: (id: number) => Promise<void>;
    totalItems: number;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
    inventories,
    products,
    stores,
    getDisplayName,
    handleEdit,
    handleDelete,
    totalItems
}) => {
    // Tìm item đang được chỉnh sửa (nếu có)
    const editingId = React.useMemo(() => {
        const editingItem = inventories.find(item => {
            // Logic này cần được truyền từ page.tsx, hoặc page.tsx truyền trực tiếp editingId
            // Giả định page.tsx chỉ truyền vào các hàm/data cần thiết. Ở đây ta cần item.id
            // Nếu bạn muốn highlight, bạn cần truyền editingId từ page.tsx vào.
            return false; // Thay thế bằng logic highlight nếu cần
        });
        return null;
    }, [inventories]);

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Sản phẩm</th>
                            <th className="px-4 py-3 text-left">Cửa hàng</th>
                            <th className="px-4 py-3 text-left">Tồn kho</th>
                            <th className="px-4 py-3 text-left">Đã bán</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventories.map((item, index) => (
                            <tr
                                key={item.id}
                                className={`
                                    ${item.id === editingId ? 'bg-yellow-50 border-2 border-yellow-400' : (index % 2 === 0 ? "bg-gray-50" : "bg-white")}
                                    hover:bg-blue-50 transition
                                `}
                            >
                                <td className="px-4 py-3">{item.id}</td>
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    {getDisplayName(products, item.product_id)}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    {getDisplayName(stores, item.store_id)}
                                </td>
                                <td className="px-4 py-3">{item.quantity_stock}</td>
                                <td className="px-4 py-3">{item.quantity_sold}</td>
                                <td className="px-4 py-3 flex gap-2 justify-center">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-medium shadow"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow"
                                    >
                                        Xoá
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {inventories.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-500">
                                    Không có dữ liệu tồn kho. Vui lòng thêm mới.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-gray-600">
                Tổng cộng {totalItems} mục (Hiển thị {inventories.length} mục).
            </div>
        </>
    );
};

export default InventoryTable;