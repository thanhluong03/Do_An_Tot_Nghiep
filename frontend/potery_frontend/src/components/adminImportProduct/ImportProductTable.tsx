// src/components/adminImportProduct/ImportProductTable.tsx (Đã tối ưu hóa CSS lần 2)

import React from 'react';
import { ImportProduct, SelectOption, getProductImageUrl, Product } from "@/api/services/importProductsService";
import { Pencil, Trash2 } from 'lucide-react';

interface ImportProductTableProps {
  importProducts: ImportProduct[];
  products: SelectOption[];
  suppliers: SelectOption[];
  getDisplayName: (list: SelectOption[], id: number | string | string[] | undefined) => string;
  handleEdit: (item: ImportProduct) => void;
  handleDelete: (id: number) => Promise<void>;
  totalItems: number;
  allProducts: Product[];
}

// Hàm format ngày kiểu Việt Nam (Giữ nguyên)
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

// HÀM TRỢ GIÚP: Tìm URL ảnh bằng cách sử dụng logic chuẩn (Giữ nguyên)
const findAndGetProductImageUrl = (allProducts: Product[], productId: number): string => {
  const product = allProducts.find(p => p.id === productId);
  if (product) {
    return getProductImageUrl(product);
  }
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
      <table className="w-full border-collapse bg-white rounded-xl shadow-lg text-sm text-gray-800">
        <thead><tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase text-xs font-bold border-b border-gray-200">
          <th className="px-5 py-3 text-center w-[60px] rounded-tl-xl">ID</th>
          <th className="px-5 py-3 text-center w-[100px]">Ảnh</th>
          <th className="px-5 py-3 text-left min-w-[200px]">Sản phẩm</th>
          <th className="px-5 py-3 text-left min-w-[150px]">Nhà cung cấp</th>
          <th className="px-5 py-3 text-right w-[120px]">SL Nhập</th>
          <th className="px-5 py-3 text-center w-[140px]">Ngày tạo</th>
          <th className="px-5 py-3 text-center w-[140px]">Ngày cập nhật</th>
          <th className="px-5 py-3 text-center w-[140px] rounded-tr-xl">Thao tác</th>
        </tr>
        </thead>

        <tbody>
          {importProducts.length > 0 ? (
            importProducts.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-gray-600 text-center">{item.id}</td>

                <td className="px-5 py-3 text-center">
                  <img
                    src={findAndGetProductImageUrl(allProducts, item.product_id)}
                    alt={getDisplayName(products, item.product_id)}
                    className="w-14 h-14 object-cover rounded-md border-2 border-gray-200 shadow-sm mx-auto"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/no-image.jpg";
                    }}
                  />
                </td>

                <td
                  className="px-5 py-3 font-semibold text-gray-800 truncate"
                  title={getDisplayName(products, item.product_id)}
                >
                  {getDisplayName(products, item.product_id)}
                </td>

                <td
                  className="px-5 py-3 text-gray-600 truncate"
                  title={getDisplayName(suppliers, item.supplier_id)}
                >
                  {getDisplayName(suppliers, item.supplier_id)}
                </td>

                <td className="px-5 py-3 text-right font-bold text-lg text-indigo-600">
                  {item.import_quantity.toLocaleString()}
                </td>

                <td className="px-5 py-3 text-center text-xs text-gray-500">
                  {formatDateTime(item.created_at)}
                </td>

                <td className="px-5 py-3 text-center text-xs text-gray-500">
                  {formatDateTime(item.updated_at)}
                </td>

                <td className="px-5 py-3 text-center space-x-2">
                  <button
                    title='Sửa'
                    onClick={() => handleEdit(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition duration-150 shadow-sm"
                  >
                    <Pencil size={15} />

                  </button>
                  <button
                    title='Xoá'
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition duration-150 shadow-sm"
                  >
                    <Trash2 size={15} />

                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-12 text-gray-500 italic bg-gray-50 rounded-b-xl">
                Không có dữ liệu nhập kho nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="text-sm text-gray-600 mt-4 px-2 py-1">
        Tổng cộng: <span className="font-bold text-gray-800">{totalItems}</span> mục.
      </div>
    </div>
  );
};

export default ImportProductTable;