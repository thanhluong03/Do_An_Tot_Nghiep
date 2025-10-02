
import React from 'react';
import AdminSidebar from '../components/layout/AdminSlidebar';
import AdminHeader from '../components/layout/AdminHeader';

// Giả định thư mục components của bạn được ánh xạ bằng alias @/components

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // LƯU Ý QUAN TRỌNG: Đây là nơi bạn thường thêm logic KIỂM TRA QUYỀN TRUY CẬP (Authentication/Authorization) 
  // Ví dụ: Kiểm tra xem người dùng có phải là Admin hay không. 
  // Nếu không, chuyển hướng (redirect) họ đến trang đăng nhập.
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* 1. Sidebar Component: Thanh điều hướng cố định bên trái */}
      {/* Chúng ta sử dụng 'h-screen' và 'sticky top-0' trong chính Sidebar để cố định nó */}
      <AdminSidebar />
      
      {/* 2. Main Content Area: Vùng hiển thị nội dung chính và Header */}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        
        {/* Header Component: Thanh điều hướng trên cùng */}
        <AdminHeader />
        
        {/* Nội dung chính của trang (Dashboard, Product, v.v.) */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children} 
        </main>
        
        {/* Có thể thêm Footer Admin tại đây nếu cần */}
      </div>
    </div>
  );
}