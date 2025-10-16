// src/app/admin/layout.tsx

'use client'; // 👈 BẮT BUỘC phải có để sử dụng usePathname

import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSlidebar';
import { AdminFooter } from '@/components/layout/AdminFooter';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  // Chuyển path sang permission dạng 'admin/products', 'admin/dashboard', ...
  const permissionPath = pathname.replace(/^\/(admin\/)/, 'admin/');
  // Biến cờ toàn cục để kiểm soát toast chỉ hiển thị 1 lần duy nhất
  const previousValidPathRef = React.useRef<string>('/admin/dashboard');
  const [hasAccess, setHasAccess] = React.useState<boolean>(true);
  const [checked, setChecked] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!isLoginPage) {
      const permissions = JSON.parse(localStorage.getItem('adminPermissions') || '[]');
      const access = permissions.includes(permissionPath);
      if (!access) {
        setHasAccess(false);
        setChecked(true);
        setTimeout(() => {
          router.replace(previousValidPathRef.current);
        }, 1500);
      } else {
        previousValidPathRef.current = pathname;
        setHasAccess(true);
        setChecked(true);
      }
    } else {
      setChecked(true);
    }
  }, [isLoginPage, permissionPath, pathname, router]);

  if (!checked) return null;
  if (!isLoginPage && !hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này!</p>
          <p className="text-sm text-gray-500">Đang chuyển về trang trước đó...</p>
        </div>
      </div>
    );
  }

  return (
    isLoginPage ? (
      <>{children}</>
    ) : (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
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