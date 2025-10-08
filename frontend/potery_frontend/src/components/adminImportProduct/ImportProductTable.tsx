// src/components/import_product/ImportProductTable.tsx

import React from 'react';
import { ImportProduct, SelectOption } from "@/api/services/importProductsService"; // Thay đổi Import Type

interface ImportProductTableProps {
    importProducts: ImportProduct[]; // Thay đổi prop name
    products: SelectOption[];
    suppliers: SelectOption[]; // Thay đổi prop name
    getDisplayName: (list: SelectOption[], id: number | undefined) => string;
    handleEdit: (item: ImportProduct) => void;
    handleDelete: (id: number) => Promise<void>;
    totalItems: number;
}

const ImportProductTable: React.FC<ImportProductTableProps> = ({ // Thay đổi component name
    importProducts, // Thay đổi
    products,
    suppliers, // Thay đổi
    getDisplayName,
    handleEdit,
    handleDelete,
    totalItems,
    
}) => {
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                    <thead><tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Sản phẩm</th>
                            <th className="px-4 py-3 text-left">Nhà cung cấp</th> {/* Thay đổi */}
                            <th className="px-4 py-3 text-right">SL Nhập kho</th> {/* Thay đổi */}
                            <th className="px-4 py-3 text-left">Ngày tạo</th>
                            <th className="px-4 py-3 text-left">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {importProducts.length > 0 ? (
                            importProducts.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 text-sm text-gray-800">
                                    <td className="px-4 py-3 font-medium">{item.id}</td>
                                    <td className="px-4 py-3 max-w-[200px] truncate" title={getDisplayName(products, item.product_id)}>
                                        {getDisplayName(products, item.product_id)}
                                    </td>
                                    <td className="px-4 py-3 max-w-[200px] truncate" title={getDisplayName(suppliers, item.supplier_id)}> {/* Thay đổi */}
                                        {getDisplayName(suppliers, item.supplier_id)} {/* Thay đổi */}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600">
                                        {item.import_quantity.toLocaleString()} {/* Thay đổi */}
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-yellow-600 hover:text-yellow-800 font-semibold transition"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-800 font-semibold transition ml-2"
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                    Không có dữ liệu nhập kho nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="text-sm text-gray-600 mt-4">
                Tổng cộng: <span className="font-bold">{totalItems}</span> mục.
            </div>
        </>
    );
};

export default ImportProductTable;