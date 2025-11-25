// src/app/adminstore/layout.tsx
'use client'; // 👈 BẮT BUỘC phải có để sử dụng usePathname
import { AdminStoreFooter } from '@/components/layout/AdminStoreFooter';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminPermissionSync } from '@/hooks/useAdminPermissionSync';
import toast, { Toaster } from 'react-hot-toast';
import AdminStoreHeader from '@/components/layout/AdminStoreHeader';
import AdminStoreSidebar from '@/components/layout/AdminStoreSidebar';

export default function AdminStoreLayout({ children }: { children: React.ReactNode }) {
  useAdminPermissionSync();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  // Chuyển path sang permission dạng 'adminstore/dashboard', 'adminstore/orders', ...
  const permissionPath = pathname.replace(/^\//, '');
  const [hasAccess, setHasAccess] = React.useState<boolean>(true);
  const [checked, setChecked] = React.useState<boolean>(false);

  const getFirstAvailablePage = (permissions: string[]) => {
    return permissions.includes('adminstore/dashboard')
      ? '/adminstore/dashboard'
      : `/${permissions[0]}`;
  };

  React.useEffect(() => {
    if (!isLoginPage) {
      const roleId = localStorage.getItem('adminRoleId');
      const permissions = JSON.parse(localStorage.getItem(`adminPermissions_${roleId}`) || '[]');
      const access = permissions.includes(permissionPath);
      if (!access && permissions.length > 0) {
        const firstAvailablePage = getFirstAvailablePage(permissions);
        router.replace(firstAvailablePage);
        setHasAccess(false);
      } else if (permissions.length === 0) {
        localStorage.clear();
        router.replace('/admin/login');
        setHasAccess(false);
      } else {
        setHasAccess(true);
      }
      setChecked(true);
    } else {
      setChecked(true);
    }
  }, [isLoginPage, permissionPath, pathname, router]);

  React.useEffect(() => {
  }, [isLoginPage, hasAccess]);

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
    <>
      <Toaster position="top-right" />
      {isLoginPage ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen bg-gray-100">
          <AdminStoreSidebar />
          <div className="flex flex-col flex-1 overflow-y-auto">
            <AdminStoreHeader />
            {/* Nội dung chính */}
            <main className="flex-1 sm:p-2 md:p-4">
              {children}
            </main>
            <AdminStoreFooter />
          </div>
        </div>
      )}
    </>
  );
}