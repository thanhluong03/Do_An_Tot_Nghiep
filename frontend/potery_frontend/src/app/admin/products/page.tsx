// // src/pages/ProductManagementPage.tsx
// 'use client';
// import React, { useState, useEffect } from 'react';
// // src/types/product.ts

// export interface IProductImage {
//   id: number;
//   url: string;
// }

// export interface IProduct {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   quantity: number;
//   supplier_id: number;
//   images: IProductImage[];
//   // Thêm trường để dễ hiển thị
//   category: string; 
// }

// // --- DỮ LIỆU GIẢ (FAKE DATA) VỀ GỐM SỨ ---
// const FAKE_PRODUCTS: IProduct[] = [
//   {
//     id: 101,
//     name: "Bình gốm hoa văn cổ",
//     description: "Bình gốm thủ công, hoa văn vẽ tay tinh xảo, thích hợp trưng bày phòng khách.",
//     price: 850000,
//     quantity: 15,
//     supplier_id: 1,
//     images: [{ id: 1, url: "https://example.com/gom_co.jpg" }],
//     category: "Gốm trang trí"
//   },
//   {
//     id: 102,
//     name: "Bộ ấm trà tử sa Bát Tràng",
//     description: "Chất liệu đất tử sa cao cấp, giữ nhiệt tốt, màu sắc tự nhiên.",
//     price: 420000,
//     quantity: 50,
//     supplier_id: 2,
//     images: [{ id: 2, url: "https://example.com/am_tra.jpg" }],
//     category: "Đồ dùng nhà bếp"
//   },
//   {
//     id: 103,
//     name: "Chậu cây men xanh ngọc",
//     description: "Chậu gốm men xanh ngọc, dùng để trồng các loại cây cảnh nhỏ.",
//     price: 95000,
//     quantity: 120,
//     supplier_id: 1,
//     images: [{ id: 3, url: "https://example.com/chau_cay.jpg" }],
//     category: "Gốm sân vườn"
//   },
// ];
// // ----------------------------------------

// const ProductManagementPage: React.FC = () => {
//   const [products, setProducts] = useState<IProduct[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Giả lập hàm gọi API để tải dữ liệu
//   useEffect(() => {
//     // Giả lập độ trễ mạng
//     setTimeout(() => {
//       setProducts(FAKE_PRODUCTS);
//       setLoading(false);
//     }, 500);
//   }, []);

//   const handleDelete = (id: number) => {
//     if (window.confirm(`Xác nhận xóa sản phẩm ID: ${id}?`)) {
//       setProducts(prev => prev.filter(p => p.id !== id));
//       alert(`Đã xóa sản phẩm ${id} thành công! (Dữ liệu giả)`);
//     }
//   };

//   const handleEdit = (product: IProduct) => {
//     // Mở modal/form chỉnh sửa và điền dữ liệu của 'product'
//     console.log("Mở form chỉnh sửa cho:", product.name);
//   };

//   if (loading) {
//     return <div className="p-8 text-center">Đang tải dữ liệu sản phẩm gốm sứ...</div>;
//   }

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">🏺 Quản lý Sản phẩm Gốm Sứ</h1>
//         <button 
//           onClick={() => console.log("Mở form Thêm mới")}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
//         >
//           + Thêm Sản phẩm Mới
//         </button>
//       </div>

//       <div className="bg-white shadow-lg rounded-xl overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Sản phẩm</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SL Tồn</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà Cung cấp</th>
//               <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hình ảnh</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {products.map((p) => (
//               <tr key={p.id}>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{p.id}</td>
//                 <td className="px-6 py-4 text-sm text-gray-900 font-medium max-w-xs truncate">{p.name}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{p.price.toLocaleString()} VNĐ</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.quantity}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.supplier_id}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-center">
//                   <span className="text-indigo-600 hover:underline cursor-pointer">
//                     {p.images.length} ảnh
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                   <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:text-indigo-900 mr-3">Sửa</button>
//                   <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">Xóa</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
      
//       {/* TODO: Thêm form Thêm/Sửa sản phẩm (ProductFormModal) tại đây */}
//     </div>
//   );
// };

// export default ProductManagementPage;
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface IProductImage {
  id: number;
  url: string;
}

interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  supplier_id: number;
  images: IProductImage[];
  main_image?: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/products/listproduct")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API:", err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Danh sách sản phẩm</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              background: "#fafafa",
            }}
          >
            {/* Ảnh chính (nếu có) */}
            {p.main_image ? (
              <img
                src={p.main_image}
                alt={p.name}
                style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "5px" }}
              />
            ) : p.images.length > 0 ? (
              <img
                src={p.images[0].url}
                alt={p.name}
                style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "5px" }}
              />
            ) : (
              <div style={{ height: "200px", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Không có ảnh
              </div>
            )}

            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p>
              <b>Giá:</b> {Number(p.price).toLocaleString()} VND
            </p>
            <p>
              <b>Số lượng:</b> {p.quantity}
            </p>
            <p>
              <b>Nhà cung cấp ID:</b> {p.supplier_id}
            </p>

            {/* Hiển thị gallery ảnh */}
            {p.images.length > 1 && (
              <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                {p.images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.url}
                    alt="Ảnh phụ"
                    style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
