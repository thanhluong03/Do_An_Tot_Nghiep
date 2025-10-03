import React from "react";
import Image from "next/image";

const ProductTable = ({ products }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Quản lý Sản phẩm</h2>

      <table className="w-full border-collapse rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Ảnh</th>
            <th className="border px-4 py-2">Tên</th>
            <th className="border px-4 py-2">Mô tả</th>
            <th className="border px-4 py-2">Giá</th>
            <th className="border px-4 py-2">Số lượng</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border px-4 py-2">{p.id}</td>
              <td className="border px-4 py-2">
                  <Image
                    src={`data:image/jpeg;base64,${p.main_image.image_data}`}
                    alt="product"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                  />
                ) : (
                  <span className="text-gray-400">No image</span>
                )}
              </td>
              <td className="border px-4 py-2">{p.name}</td>
              <td className="border px-4 py-2">{p.description}</td>
              <td className="border px-4 py-2 text-right">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(p.price)}
              </td>
              <td className="border px-4 py-2">{p.quantity}</td>
              <td className="border px-4 py-2 flex gap-2">
                <button className="bg-yellow-400 px-3 py-1 rounded-md text-white">
                  Sửa
                </button>
                <button className="bg-red-500 px-3 py-1 rounded-md text-white">
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
