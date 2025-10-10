// src/components/adminImportProduct/ImportProductTable.tsx (Đã tối ưu hóa khoảng cách CSS)

import React from 'react';
// Import Product và getProductImageUrl
import { ImportProduct, SelectOption, getProductImageUrl, Product } from "@/api/services/importProductsService";

interface ImportProductTableProps {
    importProducts: ImportProduct[];
    products: SelectOption[];
    suppliers: SelectOption[];
    getDisplayName: (list: SelectOption[], id: number | string | string[] | undefined) => string;
    handleEdit: (item: ImportProduct) => void;
    handleDelete: (id: number) => Promise<void>;
    totalItems: number;
    allProducts: Product[]; // Danh sách Product đầy đủ
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

// HÀM TRỢ GIÚP: Tìm URL ảnh bằng cách sử dụng logic chuẩn (getProductImageUrl)
const findAndGetProductImageUrl = (allProducts: Product[], productId: number): string => {
    // 1. Tìm sản phẩm đầy đủ dựa trên ID
    const product = allProducts.find(p => p.id === productId);

    if (product) {
        // 2. Sử dụng hàm chuẩn hóa từ service để lấy URL ảnh (hỗ trợ Base64/Buffer)
        return getProductImageUrl(product); 
    }
    
    // 3. Nếu không tìm thấy sản phẩm
    return "/no-image.jpg"; 
};


const ImportProductTable: React.FC<ImportProductTableProps> = ({
    importProducts,
    products,
    suppliers,
    getDisplayName,
    handleEdit,
    handleDelete,
    totalItems,
    allProducts, 
}) => {
    return (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse bg-white rounded-lg shadow-sm text-sm text-gray-800">
      <thead>
        <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
          <th className="px-3 py-2 text-left w-[60px]">ID</th>
          <th className="px-3 py-2 text-center w-[70px]">Ảnh</th>
          <th className="px-3 py-2 text-left min-w-[150px]">Sản phẩm</th>
          <th className="px-3 py-2 text-left min-w-[150px]">Nhà cung cấp</th>
          <th className="px-3 py-2 text-right w-[100px]">SL Nhập</th>
          <th className="px-3 py-2 text-center w-[140px]">Ngày tạo</th>
          <th className="px-3 py-2 text-center w-[140px]">Ngày cập nhật</th>
          <th className="px-3 py-2 text-center w-[140px]">Thao tác</th>
        </tr>
      </thead>

      <tbody>
        {importProducts.length > 0 ? (
          importProducts.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-3 py-2 font-medium text-gray-700 text-center">{item.id}</td>

              <td className="px-3 py-2 text-center">
                <img
                  src={findAndGetProductImageUrl(allProducts, item.product_id)}
                  alt={getDisplayName(products, item.product_id)}
                  className="w-10 h-10 object-cover rounded-md border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/no-image.jpg";
                  }}
                />
              </td>

              <td
                className="px-3 py-2 truncate"
                title={getDisplayName(products, item.product_id)}
              >
                {getDisplayName(products, item.product_id)}
              </td>

              <td
                className="px-3 py-2 truncate"
                title={getDisplayName(suppliers, item.supplier_id)}
              >
                {getDisplayName(suppliers, item.supplier_id)}
              </td>

              <td className="px-3 py-2 text-right font-semibold text-green-600">
                {item.import_quantity.toLocaleString()}
              </td>

              <td className="px-3 py-2 text-center text-gray-700">
                {formatDateTime(item.created_at)}
              </td>

              <td className="px-3 py-2 text-center text-gray-700">
                {formatDateTime(item.updated_at)}
              </td>

              <td className="px-3 py-2 text-center space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md transition"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} className="text-center py-8 text-gray-500 italic">
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