// src/app/admin/layout.tsx
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSlidebar';
import { AdminFooter } from '@/components/layout/AdminFooter';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Content wrapper - THAY ĐỔI Ở ĐÂY */}
      <div className="flex flex-col flex-1 **overflow-y-auto**"> {/* Thay vì overflow-hidden, dùng overflow-y-auto */}
        {/* Header (Phải có sticky top-0 trong component, VÀ KHÔNG CUỘN) */}
        <AdminHeader />

        {/* Nội dung chính (CUỘN CÙNG VỚI HEADER VÀ FOOTER) */}
        <main className="flex-1 p-4 sm:p-6 md:p-8"> {/* Xóa overflow-y-auto ở đây */}
          {children}
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}