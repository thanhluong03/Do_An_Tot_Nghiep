import React from 'react';
import { Inventory, SelectOption } from "@/api/services/inventoryService";

interface InventoryTableProps {
    inventories: Inventory[];
    products: SelectOption[];
    stores: SelectOption[];
    getDisplayName: (list: SelectOption[], id: number | string | undefined) => string;
    handleEdit: (item: Inventory) => void;
    handleDelete: (id: number) => Promise<void>;
    totalItems: number;
}

const formatDateTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

const InventoryTable: React.FC<InventoryTableProps> = ({
    inventories,
    products,
    stores,
    getDisplayName,
    handleEdit,
    handleDelete,
    totalItems,
}) => {
    return (
        <>
            {inventories.length === 0 && totalItems > 0 && (
                <div className="text-center py-4 text-gray-500">
                    Không tìm thấy tồn kho cho trang này.
                </div>
            )}
            {inventories.length === 0 && totalItems === 0 && (
                <div className="text-center py-4 text-gray-500">
                    Không có dữ liệu tồn kho nào được tìm thấy.
                </div>
            )}

            {inventories.length > 0 && (
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full border-collapse bg-white table-fixed">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                                <th className="px-4 py-3 text-left w-1/12">ID</th>
                                <th className="px-4 py-3 text-left w-2/12">Sản phẩm</th>
                                <th className="px-4 py-3 text-left w-2/12">Cửa hàng</th>
                                <th className="px-4 py-3 text-center w-1/12">Tồn kho</th>
                                <th className="px-4 py-3 text-center w-1/12">Đã bán</th>
                                <th className="px-4 py-3 text-left w-2/12">Ngày tạo</th>
                                <th className="px-4 py-3 text-left w-2/12">Cập nhật</th>
                                <th className="px-4 py-3 text-center w-2/12">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventories.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t hover:bg-gray-50 text-sm text-gray-600"
                                >
                                    <td className="px-4 py-3 font-medium truncate">{item.id}</td>
                                    <td
                                        className="px-4 py-3 truncate"
                                        title={getDisplayName(products, item.product_id)}
                                    >
                                        {getDisplayName(products, item.product_id)}
                                    </td>
                                    <td
                                        className="px-4 py-3 truncate"
                                        title={getDisplayName(stores, item.store_id)}
                                    >
                                        {getDisplayName(stores, item.store_id)}
                                    </td>
                                    <td className="px-4 py-3 text-center">{item.quantity_stock}</td>
                                    <td className="px-4 py-3 text-center">{item.quantity_sold}</td>
                                    <td className="px-4 py-3">{formatDateTime(item.created_at)}</td>
                                    <td className="px-4 py-3">{formatDateTime(item.updated_at)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-yellow-600 hover:text-yellow-800 font-medium mr-3"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

export default InventoryTable;
