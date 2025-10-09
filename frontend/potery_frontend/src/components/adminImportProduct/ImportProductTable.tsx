import React from 'react';
import { ImportProduct, SelectOption } from "@/api/services/importProductsService";

interface ImportProductTableProps {
    importProducts: ImportProduct[];
    products: SelectOption[];
    suppliers: SelectOption[];
    getDisplayName: (list: SelectOption[], id: number | undefined) => string;
    handleEdit: (item: ImportProduct) => void;
    handleDelete: (id: number) => Promise<void>;
    totalItems: number;
}

// Hàm format ngày kiểu Việt Nam
const formatDateTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
};

const ImportProductTable: React.FC<ImportProductTableProps> = ({
    importProducts,
    products,
    suppliers,
    getDisplayName,
    handleEdit,
    handleDelete,
    totalItems,
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-sm text-sm text-gray-800">
                <thead>
                    <tr className="bg-gray-200 text-gray-700 uppercase text-xs font-semibold">
                        <th className="px-4 py-3 text-left w-[60px]">ID</th>
                        <th className="px-4 py-3 text-left min-w-[180px]">Sản phẩm</th>
                        <th className="px-4 py-3 text-left min-w-[180px]">Nhà cung cấp</th>
                        <th className="px-4 py-3 text-right w-[120px]">SL Nhập kho</th>
                        <th className="px-4 py-3 text-center w-[180px]">Ngày tạo</th>
                        <th className="px-4 py-3 text-center w-[180px]">Ngày cập nhật</th>
                        <th className="px-4 py-3 text-center w-[120px]">Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    {importProducts.length > 0 ? (
                        importProducts.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3 font-medium text-gray-700">{item.id}</td>

                                <td
                                    className="px-4 py-3 truncate"
                                    title={getDisplayName(products, item.product_id)}
                                >
                                    {getDisplayName(products, item.product_id)}
                                </td>

                                <td
                                    className="px-4 py-3 truncate"
                                    title={getDisplayName(suppliers, item.supplier_id)}
                                >
                                    {getDisplayName(suppliers, item.supplier_id)}
                                </td>

                                <td className="px-4 py-3 text-right font-semibold text-green-600">
                                    {item.import_quantity.toLocaleString()}
                                </td>

                                <td className="px-4 py-3 text-center text-gray-700">
                                    {formatDateTime(item.created_at)}
                                </td>

                                <td className="px-4 py-3 text-center text-gray-700">
                                    {formatDateTime(item.updated_at)}
                                </td>

                                <td className="px-4 py-3 text-center space-x-3">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="text-yellow-600 hover:text-yellow-800 font-medium"
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
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center py-8 text-gray-500 italic">
                                Không có dữ liệu nhập kho nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="text-sm text-gray-600 mt-4">
                Tổng cộng: <span className="font-bold">{totalItems}</span> mục.
            </div>
        </div>
    );
};

export default ImportProductTable;
