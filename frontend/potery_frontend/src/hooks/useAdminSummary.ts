// // src/hooks/useAdminSummary.ts
// import { useState, useEffect } from 'react';
// // import axios from 'axios'; // Dùng Axios nếu bạn fetch API thật

// // Định nghĩa kiểu dữ liệu cho tất cả các số lượng động
// export interface AdminSummary {
//     productsCount: number;      // Product Management
//     inventoryLow: number;       // Inventory (sản phẩm tồn kho thấp)
//     storesCount: number;        // Stores
//     suppliersCount: number;     // Suppliers
//     newOrders: number;          // Orders (Đơn hàng chờ xử lý)
//     categoriesCount: number;    // Categories
//     unpublishedNews: number;    // News/Blog (bài viết nháp)
//     pendingReviews: number;     // Reviews (đánh giá chờ duyệt)
//     activePromotions: number;   // Promotions/Vouchers
//     activeFlashSales: number;   // Flash Sales
// }

// const initialSummary: AdminSummary = {
//     productsCount: 0,
//     inventoryLow: 0,
//     storesCount: 0,
//     suppliersCount: 0,
//     newOrders: 0,
//     categoriesCount: 0,
//     unpublishedNews: 0,
//     pendingReviews: 0,
//     activePromotions: 0,
//     activeFlashSales: 0,
// };

// // GIẢ LẬP hàm Fetch API (Thay thế bằng axios.get('/admin/summary') thật)
// const fetchSummaryData = async (): Promise<AdminSummary> => {
//     return new Promise(resolve => 
//         setTimeout(() => {
//             resolve({
//                 productsCount: 543, 
//                 inventoryLow: Math.floor(Math.random() * 5) + 1,    // 1-5 sản phẩm tồn kho thấp
//                 storesCount: 3, 
//                 suppliersCount: 15,
//                 newOrders: Math.floor(Math.random() * 20) + 1,      // 1-20 đơn hàng mới
//                 categoriesCount: 8,
//                 unpublishedNews: Math.floor(Math.random() * 5),     // 0-4 bài nháp
//                 pendingReviews: Math.floor(Math.random() * 10) + 1, // 1-10 đánh giá chờ duyệt
//                 activePromotions: Math.floor(Math.random() * 3) + 1, // 1-3 chương trình khuyến mãi đang chạy
//                 activeFlashSales: Math.floor(Math.random() * 2),     // 0-1 flash sale đang chạy
//             });
//         }, 800) 
//     );
// };


// export const useAdminSummary = () => {
//     const [summary, setSummary] = useState<AdminSummary>(initialSummary);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         const loadData = async () => {
//             setIsLoading(true);
//             const data = await fetchSummaryData();
//             setSummary(data);
//             setIsLoading(false);
//         };
        
//         loadData();

//         const interval = setInterval(loadData, 60000); 

//         return () => clearInterval(interval);
//     }, []);

//     return { summary, isLoading };
// };