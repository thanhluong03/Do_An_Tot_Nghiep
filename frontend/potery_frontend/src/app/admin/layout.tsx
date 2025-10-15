// src/app/admin/layout.tsx

'use client'; // 👈 BẮT BUỘC phải có để sử dụng usePathname

import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSlidebar';
import { AdminFooter } from '@/components/layout/AdminFooter';
import React from 'react';
import { usePathname } from 'next/navigation'; // 👈 Import hook

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 1. KIỂM TRA ROUTE: Xác định xem người dùng có đang ở trang login hay không
  // Dựa trên cấu trúc folder: /admin/login/page.tsx
  const isLoginPage = pathname === '/admin/login'; 
  
  // Bạn có thể thêm các route khác nếu cần ẩn (ví dụ: '/admin/403')

  return (
    // Nếu là trang login, layout sẽ không áp dụng flex và sidebar
    isLoginPage ? (
        // Chỉ render nội dung (trang login)
        <>{children}</> 
    ) : (
        // Nếu KHÔNG phải trang login, áp dụng layout admin thông thường
        <div className="flex min-h-screen bg-gray-100">
            
            {/* 2. SIDEBAR - CHỈ HIỂN THỊ KHI KHÔNG PHẢI TRANG LOGIN */}
            <AdminSidebar />

            {/* Content wrapper */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                <AdminHeader />

                {/* Nội dung chính */}
                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    {children}
                </main>

                <AdminFooter />
            </div>
        </div>
    )
  );
}