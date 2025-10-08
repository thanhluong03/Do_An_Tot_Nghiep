// src/components/inventory/InventoryTable.tsx

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

const InventoryTable: React.FC<InventoryTableProps> = ({
    inventories,
    products,
    stores,
    getDisplayName,
    handleEdit,
    handleDelete,
    totalItems
}) => {
    
    return (
        <>
            {inventories.length === 0 && totalItems > 0 && (
                <div className="text-center py-4 text-gray-500">Không tìm thấy tồn kho cho trang này.</div>
            )}
            {inventories.length === 0 && totalItems === 0 && (
                <div className="text-center py-4 text-gray-500">Không có dữ liệu tồn kho nào được tìm thấy.</div>
            )}
            
            {inventories.length > 0 && (
                <div className="overflow-x-auto rounded-lg shadow-md">
                    {/* SỬA LỖI: Thêm class 'table-fixed' để đảm bảo các cột có độ rộng cố định */}
                    <table className="min-w-full border-collapse bg-white table-fixed">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                                {/* Thiết lập chiều rộng cố định cho từng cột */}
                                <th className="px-4 py-3 text-left w-1/12">ID</th>
                                <th className="px-4 py-3 text-left w-3/12">Sản phẩm</th>
                                <th className="px-4 py-3 text-left w-3/12">Cửa hàng</th>
                                <th className="px-4 py-3 text-left w-1/12">Tồn kho</th>
                                <th className="px-4 py-3 text-left w-1/12">Đã bán</th>
                                <th className="px-4 py-3 text-center w-3/12">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventories.map((item) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50 text-sm text-gray-600">
                                    <td className="px-4 py-3 font-medium truncate w-1/12">{item.id}</td>
                                    <td className="px-4 py-3 truncate w-3/12" title={getDisplayName(products, item.product_id)}>
                                        {getDisplayName(products, item.product_id)}
                                    </td>
                                    <td className="px-4 py-3 truncate w-3/12" title={getDisplayName(stores, item.store_id)}>
                                        {getDisplayName(stores, item.store_id)}
                                    </td>
                                    <td className="px-4 py-3 w-1/12">{item.quantity_stock}</td>
                                    <td className="px-4 py-3 w-1/12">{item.quantity_sold}</td>
                                    <td className="px-4 py-3 text-center w-3/12">
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