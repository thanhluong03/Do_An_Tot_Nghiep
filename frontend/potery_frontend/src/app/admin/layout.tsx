// src/app/admin/layout.tsx

import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSlidebar';
// ⚠️ QUAN TRỌNG: Đã thêm AdminFooter
import { AdminFooter } from '@/components/layout/AdminFooter'; 
import React from 'react';


// Giả định thư mục components của bạn được ánh xạ bằng alias @/components

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Sử dụng 'min-h-screen' trên cả main container và flex-col để Footer luôn ở dưới
    <div className="flex min-h-screen bg-gray-100"> 
      
      {/* 1. Sidebar Component */}
      <AdminSidebar />
      
      {/* 2. Main Content Area */}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        
        {/* Header Component */}
        <AdminHeader />
        
        {/* Nội dung Trang: Dùng flex-1 để nội dung chiếm hết không gian còn lại */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children} 
        </main>
        
        {/* 3. Footer Component: Đặt bên ngoài <main> nhưng bên trong flex-col */}
        <AdminFooter />
        
      </div>
    </div>
  );
}