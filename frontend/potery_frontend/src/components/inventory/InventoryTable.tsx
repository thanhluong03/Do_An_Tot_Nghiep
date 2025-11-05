import React from 'react';
import Image from "next/image"; 
import { Inventory, SelectOption, Product, getProductImageUrl } from "@/api/services/inventoryService";
import { Pencil, Trash2 } from 'lucide-react';

interface InventoryTableProps {
    inventories: Inventory[];
    products: SelectOption[];
    stores: SelectOption[];
    getDisplayName: (list: SelectOption[], id: number | string | undefined) => string;
    handleEdit: (item: Inventory) => void;
    handleDelete: (id: number) => Promise<void>;
    totalItems: number;
    allProducts: Product[]; 
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

const getInventoryProductImageUrl = (productId: number, allProducts: Product[]): string => {
    const product = allProducts.find(p => p.id === productId);
    
    if (product) {
        return getProductImageUrl(product); 
    }
    return "/no-image.jpg"; 
};


const InventoryTable: React.FC<InventoryTableProps> = ({
    inventories,
    products,
    stores,
    getDisplayName,
    handleEdit,
    handleDelete,
    totalItems,
    allProducts, 
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
                <div className="overflow-x-auto rounded-xl shadow-lg mt-6 border border-gray-100"> 
                    <table className="min-w-full border-collapse bg-white table-fixed">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-[10px] uppercase tracking-wider font-bold border-b border-gray-200">
                                <th className="px-4 py-3 text-left w-[50px] rounded-tl-xl">STT</th>
                                <th className="px-2 py-3 text-center w-[60px]">Ảnh</th> 
                                <th className="px-4 py-3 text-left w-[200px]">Sản phẩm</th> 
                                <th className="px-4 py-3 text-left w-[180px]">Cửa hàng</th> 
                                <th className="px-4 py-3 text-center w-[90px]">Trong kho cửa hàng</th>
                                <th className="px-4 py-3 text-center w-[90px]">Đã bán</th>
                                <th className="px-4 py-3 text-left w-[150px]">Ngày tạo</th>
                                <th className="px-4 py-3 text-left w-[150px]">Cập nhật</th>
                                <th className="px-4 py-3 text-center w-[120px] rounded-tr-xl">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventories.map((item, index) => ( 
                                <tr
                                    key={item.id}
                                    className="border-t border-gray-100 hover:bg-blue-50/70 text-sm text-gray-700 transition duration-150"
                                >
                                    <td className="px-4 py-3 font-semibold text-gray-800 truncate">
                                        {index + 1}
                                    </td>
                                    
                                    <td className="px-2 py-2 text-center">
                                        <div className="flex justify-center">
                                            <Image
                                                src={getInventoryProductImageUrl(item.product_id, allProducts) || "/no-image.jpg"}
                                                alt={getDisplayName(products, item.product_id) || "Product Image"}
                                                width={36}
                                                height={36} 
                                                className="object-cover rounded-md shadow-sm"
                                                onError={(e) => {
                                                    const target = e.currentTarget as HTMLImageElement;
                                                    target.src = "/no-image.jpg";
                                                }}
                                            />
                                        </div>
                                    </td>
                                    
                                    <td
                                        className="px-4 py-3 truncate text-sm max-w-[400px]"
                                        title={getDisplayName(products, item.product_id)}
                                    >
                                        {getDisplayName(products, item.product_id)}
                                    </td>
                                    <td
                                        className="px-4 py-3 truncate text-sm"
                                        title={getDisplayName(stores, item.store_id)}
                                    >
                                        {getDisplayName(stores, item.store_id)}
                                    </td>
                                    
                                    <td className="px-4 py-3 text-center text-base font-extrabold text-teal-600">
                                        {(item.quantity_stock ?? 0).toLocaleString()} 
                                    </td>
                                    <td className="px-4 py-3 text-center text-base font-extrabold text-red-500">
                                        {(item.quantity_sold ?? 0).toLocaleString()}
                                    </td>
                                    
                                    <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(item.created_at)}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(item.updated_at)}</td>
                                    
                                    <td className="px-4 py-3 text-center space-x-1">
                                        <button
                                            title='edit'
                                            onClick={() => handleEdit(item)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            title='trash'
                                            onClick={() => handleDelete(item.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                        >
                                            <Trash2 size={15} />
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